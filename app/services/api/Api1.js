/* eslint-disable eslint-comments/no-unused-disable */
/* eslint-disable eol-last */
/* eslint-disable prettier/prettier */
import {
  APIToken,
  APIGetAudits,
  APIAuditsActivity,
  APIUploadImage,
  APIUploadAudit,
} from "../api/Endpoints";

const fetchToken = async (username, password) => {
  try {
    const response = await fetch(APIToken, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `grant_type=password&username=${encodeURIComponent(
        username,
      )}&password=${encodeURIComponent(password)}`,
    });

    const data = await response.json();

    if (!response.ok) {
      const errorMessage =
        data.error === 'invalid_grant'
          ? 'Authentication failed: Invalid credentials'
          : 'Failed to fetch token';

      // Return an error object instead of throwing
      return {error: errorMessage};
    }
    return {accessToken: data.access_token}; // Return the token wrapped in an object
  } catch (error) {
    console.error('Error fetching token:', error);
    return {error: 'Network error or invalid server response'};
  }
};

const fetchData = async (uname, password) => {
  const {accessToken, error: tokenError} = await fetchToken(uname, password);

  if (tokenError) {
    return {error: tokenError}; // Return early if there was an error fetching the token
  }

  try {
    const response = await fetch(APIGetAudits, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const result = await response.json();

    if (!response.ok) {
      return {error: result.error || 'Failed to fetch data'};
    }
    return {data: result}; // Return the data wrapped in an object
  } catch (error) {
    console.error('Error fetching data:', error);
    return {error: 'Network error or invalid server response'};
  }
};

const fetchUserActivity = async (uname, password) => {
  const {accessToken, error: tokenError} = await fetchToken(uname, password);

  if (tokenError) {
    return {error: tokenError}; // Return early if there was an error fetching the token
  }

  try {
    const response = await fetch(APIAuditsActivity, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const result = await response.json();

    if (!response.ok) {
      return {error: result.error || 'Failed to fetch data'};
    }
    return {data: result}; // Return the data wrapped in an object
  } catch (error) {
    console.error('Error fetching data:', error);
    return {error: 'Network error or invalid server response'};
  }
};

const uploadImage = async (uname, password, imageUri, imageType) => {
  const {accessToken, error: tokenError} = await fetchToken(uname, password);

  if (tokenError) {
    return {error: tokenError}; // Return early if there was an error fetching the token
  }

  try {
    const formData = new FormData();
    formData.append('file', {
      uri: imageUri,
      type: imageType, // Change the type as per your file
      name: 'image.jpg', // Change the name as per your file
    });

    const response = await fetch(APIUploadImage, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'multipart/form-data',
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

const uploadAudit = async (uname, password, audit) => {
  const {accessToken, error: tokenError} = await fetchToken(uname, password);

  if (tokenError) {
    return {error: tokenError}; // Return early if there was an error fetching the token
  }

  try {
    const headers = {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    };

    const response = await fetch(APIUploadAudit, {
      method: "POST",
      headers: headers,
      body: JSON.stringify(audit),
    });

    const data = await response.json();
    console.log("JSON audit upload response ", data);
    if (!data.success) {
      throw new Error(data.error || "Failed to upload image");
    }
    return data;
  } catch (error) {
    console.error("Error uploading audit:", error);
    throw error;
  }
};

export {fetchData, fetchUserActivity, uploadImage, uploadAudit};


