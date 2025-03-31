/* eslint-disable quotes */
/* eslint-disable no-trailing-spaces */
/* eslint-disable no-undef */
/* eslint-disable eslint-comments/no-unused-disable */
/* eslint-disable eol-last */
/* eslint-disable prettier/prettier */
import {
        loginAPI,
        tokenAPI,
        getAuditDataAPI,
        postAuditDataAPI,
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

            const data = await response.json();

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
                return { success: true };
            } else {
                return { success: false };
            }
        } catch (error) {
            console.error('Error validating login:', error);
            return { error: 'Network error or invalid server response' };
        }
    };

    const fetchToken = async (username, password) => {
        try {
            // voor het generen can een token kijk als de user een valid account heeft.
            const response = await isLoginValid(username, password);

            if (response.success === false) {
                return { error: 'Authentication failed: Invalid credentials' };
            }

            const clientId = 'SwvU18xPsSYZEDPz7J5CBA..'; // Vervang met jouw client_id
            const clientSecret = 'ZKB9pS69jNjnbPv_49zYxA..'; // Vervang met jouw client_secret
            const credentials = btoa(`${clientId}:${clientSecret}`);
            console.log('errsss');
            const responseToken = await fetch(tokenAPI, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Authorization': `Basic ${credentials}`,
                },
                body: 'grant_type=client_credentials',
            });

            const data = await responseToken.json();
            console.log(responseToken);
            console.log(data);

            if (!responseToken.ok) {
            const errorMessage =
                data.error === 'invalid_grant'
                ? 'Authentication failed: Invalid credentials'
                : 'Failed to fetch token';

            // Return an error object instead of throwing
            return {error: errorMessage};
            }
            return {accessToken: data.access_token}; // Return the token wrapped in an object
        }
        catch (error) {
            console.error('Error fetching token:', error);
            return {error: 'Network error or invalid server response'};
        }
    };

    const fetchAuditData = async (username, password) => {
      const {accessToken, error: tokenError} = await fetchToken(username, password);
      console.log('accessToken', accessToken);
      console.log('username', username);

      if (tokenError) {
        return {error: tokenError}; // Return early if there was an error fetching the token
      }

      try {
        const response = await fetch(getAuditDataAPI, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'X-Username': username,
            "Content-Type": "application/json",
          },
        });

        const result = await response.json();
        // console.log('Formatted JSON Response:', JSON.stringify(result, null, 2));

        if (!response.ok) {
          return {error: result.error || 'Failed to fetch data'};
        }
        return {data: result}; // Return the data wrapped in an object
      } catch (error) {
        console.error('Error fetching data:', error);
        return {error: 'Network error or invalid server response'};
      }
    };

    const uploadAuditData = async (username, password, audit) => {
      const {accessToken, error: tokenError} = await fetchToken(username, password);
    
      if (tokenError) {
        return {error: tokenError}; // Return early if there was an error fetching the token
      }
    
      try {
        const headers = {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        };
    
        const response = await fetch(postAuditDataAPI, {
          method: "POST",
          headers: headers,
          body: JSON.stringify(audit),
        });
    
        const data = await response.json();
        console.log("JSON audit upload response ", data);
        if (!data.success) {
          throw new Error(data.error || "Failed to upload audit");
        }
        return data;
      } catch (error) {
        console.error("Error uploading audit:", error);
        throw error;
      }
    };



export {isLoginValid, fetchToken, fetchAuditData, uploadAuditData};