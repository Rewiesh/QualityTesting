import {URLTokenTest, URLAuditsTEST} from '../api/Endpoints';

const fetchToken = async (username, password) => {
  try {
    const response = await fetch(URLTokenTest, {
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
    const response = await fetch(URLAuditsTEST, {
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

export default fetchData;