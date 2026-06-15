/* eslint-disable quotes */
/* eslint-disable no-trailing-spaces */
/* eslint-disable no-undef */
/* eslint-disable eslint-comments/no-unused-disable */
/* eslint-disable eol-last */
/* eslint-disable prettier/prettier */
import {
  loginAPI,
  tokenAPI,
  getCredentialsAPI,
  getAuditDataAPI,
  getUserActivity,
  postAuditDataAPI,
  postImageAPI,
} from '../api/newEndpoint';


const isLoginValid = async (username, password) => {
  try {
    const response = await fetch(loginAPI, {
      method: 'POST',
      headers: {
        'X-Username': username,
        'X-Password': password,
      },
    });
    console.log(loginAPI);
    const data = await response.json();
    console.log(data);

    // Controleer of de server een geldige respons geeft
    if (!response.ok || !data.result) {
      return { error: 'Invalid server response' };
    }

    // Parse de JSON-string uit `data.result`
    let parsedResult;
    try {
      parsedResult = JSON.parse(data.result);
    } catch (e) {
      return { error: 'Invalid JSON format in server response' };
    }

    // Controleer of de login valid is
    if (parsedResult.status === 'VALID') {
      console.log('Login Valid!');
      return { success: true, accessToken: parsedResult.accessToken };
    } else if (parsedResult.status === 'ERROR') {
      // gebruiker is geldig maar backend kon geen token genereren -> fallback activeren
      console.warn('Backend token generatie mislukt:', parsedResult.message);
      return { success: true, accessToken: null };
    } else {
      console.log('Login Invalid!');
      return { success: false };
    }
  } catch (error) {
    console.error('Error validating login:', error);
    return { error: 'Network error or invalid server response' };
  }
};

// Fallback: als de backend geen token meestuurt, haal client_id + client_secret op
// van de backend en genereer het token zelf via de OAuth client_credentials flow.
const fetchTokenViaOAuth = async (username, password) => {
  try {
    // Stap 1: haal de OAuth credentials op van de backend
    const credResponse = await fetch(getCredentialsAPI, {
      method: 'GET',
      headers: {
        'X-Username': username,
        'X-Password': password,
      },
    });

    if (!credResponse.ok) {
      console.error('Fallback: credentials endpoint gaf HTTP', credResponse.status);
      return { error: 'Fallback: kon geen OAuth credentials ophalen van de backend' };
    }

    const credData = await credResponse.json();

    // credentials zitten genest in het result veld als JSON-string (zelfde patroon als login endpoint)
    let parsedCreds;
    try {
      parsedCreds = JSON.parse(credData.result);
    } catch (e) {
      console.error('Fallback: kon credentials response niet parsen', credData);
      return { error: 'Fallback: kon credentials response niet parsen' };
    }

    if (!parsedCreds.client_id || !parsedCreds.client_secret) {
      console.error('Fallback: backend response bevat geen client_id/client_secret', parsedCreds);
      return { error: 'Fallback: backend gaf geen geldige OAuth credentials terug' };
    }

    // Stap 2: gebruik de credentials om een token op te halen via OAuth
    const encoded = btoa(`${parsedCreds.client_id}:${parsedCreds.client_secret}`);
    const tokenResponse = await fetch(tokenAPI, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${encoded}`,
      },
      body: 'grant_type=client_credentials',
    });

    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok || !tokenData.access_token) {
      console.error('Fallback: OAuth token endpoint mislukt', tokenData);
      return { error: 'Fallback: token ophalen via OAuth mislukt' };
    }

    console.log('Fallback token flow geslaagd');
    return { accessToken: tokenData.access_token };

  } catch (error) {
    console.error('Fallback token fout:', error);
    return { error: 'Fallback: netwerk- of serverfout bij token ophalen' };
  }
};

const fetchToken = async (username, password) => {
  try {
    // Primaire flow: backend stuurt token mee in de login response
    const response = await isLoginValid(username, password);

    if (response.success === false) {
      return { error: 'Authentication failed: Invalid credentials' };
    }

    // Als de JSON van de backend kapot was, probeer alsnog de fallback
    if (response.error === 'Invalid JSON format in server response') {
      console.warn('Login response JSON was ongeldig — fallback OAuth flow wordt geactiveerd');
      return await fetchTokenViaOAuth(username, password);
    }

    if (response.error) {
      return { error: response.error };
    }

    // Controleer of de backend een token heeft meegestuurd (primaire flow v26)
    if (response.accessToken) {
      return { accessToken: response.accessToken };
    }

    // Fallback: login is geldig maar backend stuurde geen token mee
    // Haal client_id + client_secret op en genereer het token zelf
    console.warn('Primaire token ontbreekt in login response — fallback OAuth flow wordt geactiveerd');
    return await fetchTokenViaOAuth(username, password);

  } catch (error) {
    console.error('Error fetching token:', error);
    return { error: 'Network error or invalid server response' };
  }
};

// helper: verwijder ongewenste control characters (0x00 - 0x1F), maar behoud gewone whitespace (optioneel)
const sanitizeJsonString = (s) => {
  if (typeof s !== 'string') return s;
  // verwijder null-bytes en overige onzichtbare control chars
  return s.replace(/[\u0000-\u001F]+/g, '');
};

const tryParsePossiblyBrokenJson = (rawText) => {
  // 1) Probeer direct
  try {
    return { data: JSON.parse(rawText) };
  } catch (e1) {
    console.warn('Direct JSON.parse failed:', e1.message);
  }

  // 2) Probeer te sanitiseren (control characters verwijderen)
  try {
    const cleaned = sanitizeJsonString(rawText);
    return { data: JSON.parse(cleaned) };
  } catch (e2) {
    console.warn('Parse after sanitize failed:', e2.message);
  }

  // 3) Probeer substring tussen eerste { en laatste } (voor het geval er omringende tekens zijn)
  try {
    const firstBrace = rawText.indexOf('{');
    const lastBrace = rawText.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      const maybeJson = rawText.substring(firstBrace, lastBrace + 1);
      return { data: JSON.parse(sanitizeJsonString(maybeJson)) };
    }
  } catch (e3) {
    console.warn('Parse after substring extraction failed:', e3.message);
  }

  // 4) geen parse gelukt
  return { error: 'Unable to parse JSON from server response' };
};

const fetchAuditData = async (username, password) => {
  const { accessToken, error: tokenError } = await fetchToken(username, password);
  console.log('fetchAuditData accessToken', accessToken);
  console.log('fetchAuditData username', username);

  if (tokenError) {
    return { error: tokenError }; // Return early if there was an error fetching the token
  }

  try {
    const response = await fetch(getAuditDataAPI, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'X-Username': username,
        'Content-Type': 'application/json',
      },
    });

    // altijd raw text eerst - dit voorkomt immediate JSON parse exceptions
    const rawText = await response.text();
    console.log('Raw response text (first 1000 chars):', rawText ? rawText.slice(0, 1000) : rawText);

    // parse robust
    const parsed = tryParsePossiblyBrokenJson(rawText);
    if (parsed.error) {
      console.error('Failed to parse response into JSON:', parsed.error);

      // Optioneel: als response.ok === false, propagate error uit server
      if (!response.ok) {
        return { error: parsed.error || 'Failed to fetch data from server' };
      }

      // fallback: return raw text so de caller kan inspecteren
      return { error: 'Invalid JSON response from server', raw: rawText };
    }

    // controleer HTTP status
    if (!response.ok) {
      // server gaf JSON maar met foutmelding
      return { error: parsed.data.error || 'Failed to fetch data' };
    }

    // success
    return { data: parsed.data };
  } catch (error) {
    console.error('Error fetching data:', error);
    return { error: 'Network error or invalid server response' };
  }
};


const uploadAuditData = async (username, password, audit) => {
  const { accessToken, error: tokenError } = await fetchToken(username, password);

  if (tokenError) {
    return { error: tokenError }; // Return early if there was an error fetching the token
  }

  try {
    const headers = {
      Accept: "application/json",
      "Content-Type": "application/json",
      'X-Username': username,
      Authorization: `Bearer ${accessToken}`,
    };

    const response = await fetch(postAuditDataAPI, {
      method: "POST",
      headers: headers,
      body: JSON.stringify(audit),
    });

    const data = await response.json();

    if (!response.ok) {
      // Toon de specifieke error message van de API als beschikbaar
      const errorMessage = data?.error || `Upload failed with status ${response.status}`;
      throw new Error(errorMessage);
    }
    console.log("JSON audit upload response ", data);
    return data;

  } catch (error) {
    console.error("Error uploading audit:", error);
    throw error;
  }
};

const uploadAuditImage = async (username, password, imageUri, imageType) => {
  const { accessToken, error: tokenError } = await fetchToken(username, password);

  if (tokenError) {
    return { error: tokenError }; // Return early if there was an error fetching the token
  }

  try {
    // Extra velden toevoegen
    // formData.append('name', 'image.jpg');
    // formData.append('mime_type', imageType); // bijv. 'image/png'

    const formData = new FormData();
    formData.append('file', {
      uri: imageUri,
      type: imageType, // Change the type as per your file
      name: 'image.jpg', // Change the name as per your file
    });

    const response = await fetch(postImageAPI, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'multipart/form-data',
        'X-Username': username,
      },
      body: formData,
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Failed to upload image');
    }
    return data;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
};

const fetchUserActivity = async (username, password) => {
  const { accessToken, error: tokenError } = await fetchToken(username, password);
  console.log('fetchUserActivity accessToken', accessToken);
  console.log('fetchUserActivity username', username);

  if (tokenError) {
    return { error: tokenError }; // Stop als token ophalen faalt
  }

  try {
    const response = await fetch(getUserActivity, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'X-Username': username,
        'Content-Type': 'application/json',
      },
    });

    const result = await response.json();
    console.log('Formatted JSON Response (UserActivity):', JSON.stringify(result, null, 2));

    if (!response.ok) {
      return { error: result.error || 'Failed to fetch user activity' };
    }

    return { data: result };
  } catch (error) {
    console.error('Error fetching user activity data:', error);
    return { error: 'Network error or invalid server response' };
  }
};


export { isLoginValid, fetchToken, fetchAuditData, fetchUserActivity, uploadAuditData, uploadAuditImage };