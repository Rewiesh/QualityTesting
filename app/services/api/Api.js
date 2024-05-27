import {
  URLAudits,
  URLActivity,
  UploadForms,
  UploadImageErrorForm,
  UploadRemark,
} from '../api/Endpoints';

const URLAuditsTEST = 'https://backend-quality.iccaadvies.eu/api/quality';
const URLTokenTest = 'https://backend-quality.iccaadvies.eu/api/token';

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
      throw new Error(data.error || 'Failed to fetch token');
    }
    return data.access_token; // Return the token
  } catch (error) {
    console.error('Error fetching token:', error);
    throw error;
  }
};

const fetchData = async (uname, password) => {
  const token = await fetchToken('username', 'password'); 
  try {
    const response = await fetch(URLAuditsTEST, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.error || 'Failed to fetch data');
    }
    return result; // Return the data
  } catch (error) {
    console.error('Error fetching data:', error);
    throw error;
  }
};

class Api {
  static parseWithDate = json => {
    return new Promise((resolve, reject) => {
      const reISO =
        /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*)?)Z$/;
      const reMsAjax = /^\/Date\((d|-|.*)\)[\/|\\]$/;

      try {
        const res = JSON.parse(json, (key, value) => {
          if (typeof value === 'string') {
            const a = reMsAjax.exec(value);
            if (a) {
              return new Date(Number(a[1]));
            }
          }
          return value;
        });
        resolve(res);
      } catch (e) {
        reject(e);
      }
    });
  };

  fetchAudits = (uname, password) => {
    // return true
    // fetch(URLAudits, {
    //   method: 'POST',
    //   headers: {
    //     Accept: 'application/json',
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify({
    //     Username: uname,
    //     Password: password,
    //   }),
    // })
    //   .then(response => response.json())
    //   .then(json => Api.parseWithDate(json))
    //   .then(data => {
    //     return new Promise((resolve, reject) => {
    //       if (data.success == true) {
    //         resolve(data);
    //       } else {
    //         reject(new Error(data.message));
    //       }
    //     });
    //   });
    return Promise.resolve({
      success: true, // Simulate a successful response
      data: [
        {
          Id: '1',
          AuditCode: 'AUDIT_001',
          Type: 'Safety',
          DateTime: '2023-04-05T09:00:00Z',
          NameClient: 'Client A',
          LocationClient: 'Location A',
          isUnSaved: '0',
          LocationSize: '249',
          Elements: [
            {
              Id: 'E1',
              ElementLabel: 'Fire Extinguisher',
              ElementValue: 'V',
              AuditId: '1',
              ElementComment: 'All in good condition',
            },
            {
              Id: 'E2',
              ElementLabel: 'Emergency Exit',
              ElementValue: 'N',
              AuditId: '1',
              ElementComment: 'No obstructions',
            },
          ],
        },
        // Add more dummy audit records as needed
      ],
      floor: [
        // Array containing floor information
        {
          Id: '1',
          FloorValue: 'Ground Floor',
        },
        {
          Id: '2',
          FloorValue: 'First Floor',
        },
        {
          Id: '3',
          FloorValue: 'Second Floor',
        },
        {
          Id: '4',
          FloorValue: 'Third Floor',
        },
      ],
      areas: [
        {
          Abbreviation: 'A1',
          Name: 'Area 1',
          Elements: ['E1', 'E2'],
        },
        {
          Abbreviation: 'A2',
          Name: 'Area 2',
          Elements: ['E1', 'E2'],
        },
        {
          Abbreviation: 'A3',
          Name: 'Area 3',
          Elements: ['E1', 'E2'],
        },
        {
          Abbreviation: 'A4',
          Name: 'Area 4',
          Elements: ['E1', 'E2'],
        },
      ],
      categories: [
        // Array containing category information
        {
          Id: 'C1',
          CategoryValue: 'Safety Equipment',
          MinimalElements: ['10', '20', '30'],
          Areas: ['A1', 'A2'],
        },
        {
          Id: 'C2',
          CategoryValue: 'Operational Checks',
          MinimalElements: ['15', '25', '35'],
          Areas: ['A3', 'A4'],
        },
        {
          Id: 'C3',
          CategoryValue: 'Environmental Standards',
          MinimalElements: ['12', '22', '32'],
          Areas: ['A1', 'A3'],
        },
      ],
      elements: [
        // Array containing elements
        {
          Id: 'E1',
          ElementTypeValue: 'Fire Extinguisher Check',
        },
        {
          Id: 'E2',
          ElementTypeValue: 'Emergency Exit Accessibility',
        },
        {
          Id: 'E3',
          ElementTypeValue: 'First Aid Kit Availability',
        },
        {
          Id: 'E4',
          ElementTypeValue: 'Safety Signage Visibility',
        },
      ],
      elementsStatus: [
        // Array containing elements status
        {
          Id: 'S1',
          ElementStatusValueCode: 'Checked',
          SortOrder: 1,
        },
        {
          Id: 'S2',
          ElementStatusValueCode: 'Unchecked',
          SortOrder: 2,
        },
        {
          Id: 'S3',
          ElementStatusValueCode: 'Pending',
          SortOrder: 3,
        },
        {
          Id: 'S4',
          ElementStatusValueCode: 'Approved',
          SortOrder: 4,
        },
      ],
      clients: [
        // Array containing client and their categories
        {
          Name: 'Client A',
          Categories: ['C1', 'C2'],
        },
      ],
      errors: [
        // Array containing error types
        {
          Id: 'ET1',
          ErrorTypeValue: 'Data Missing',
        },
        {
          Id: 'ET2',
          ErrorTypeValue: 'Data Incorrect',
        },
        {
          Id: 'ET3',
          ErrorTypeValue: 'Data Malformed',
        },
        {
          Id: 'ET4',
          ErrorTypeValue: 'Data Expired',
        },
      ],
    });
  };

  fetchActivity = (uname, password) => {
    // return fetch(URLActivity, {
    //   method: 'POST',
    //   headers: {
    //     Accept: 'application/json',
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify({
    //     Username: uname,
    //     Password: password,
    //   }),
    // })
    //   .then(response => response.json())
    //   .then(json => Api.parseWithDate(json));
    return Promise.resolve({
      success: true, // Simulate a successful response
      data: {
        PerformedAuditsCount: 10,
        LastClientName: 'rew',
        LastLocationName: 'rew',
      },
    });
  };

  stringifyWcf = json => {
    const reISO =
      /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*)?)Z$/;
    try {
      return JSON.stringify(json, (key, value) => {
        if (typeof value == 'string') {
          var a = reISO.exec(value);
          if (a) {
            var val =
              '/Date(' +
              new Date(
                Date.UTC(+a[1], +a[2] - 1, +a[3], +a[4], +a[5], +a[6]),
              ).getTime() +
              ')/';
            this[key] = val;
            console.log(val);
            return val;
          }
        }
        return value;
      });
    } catch (e) {
      console.log(e);
      throw new Error('JSON content could not be parsed');
      return null;
    }
  };

  uploadForms = jsonData => {
    return fetch(UploadForms, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: this.stringifyWcf(jsonData),
    })
      .then(response => response.json())
      .then(response => JSON.parse(response.UploadFormsResult))
      .then(data => {
        return new Promise((resolve, reject) => {
          if (data.success == true) {
            resolve(data);
          } else {
            reject(new Error(data.message));
          }
        });
      });
  };

  uploadImageErrorForm = jsonData => {
    console.log('upload image');
    fetch(UploadImageErrorForm, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: this.stringifyWcf(jsonData),
    })
      .then(response => response.json())
      .then(json => JSON.parse(response.UploadImageErrorFormResult))
      .then(result => {
        return new Promise((resolve, reject) => {
          if (result.success == true) {
            resolve();
          } else {
            reject(new Error(result.message));
          }
        });
      });
  };

  uploadRemark = data => {
    console.log('upload remark');
    fetch(UploadRemark, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: this.stringifyWcf(data),
    }).then(response => response.json());
  };
}


export default fetchData;
