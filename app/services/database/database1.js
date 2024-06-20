/* eslint-disable no-trailing-spaces */
/* eslint-disable prettier/prettier */
import SQLite from 'react-native-sqlite-storage';

const databaseConfig = {
  name: 'fdisq.db',
  version: '1.0',
  displayName: 'Fdis Quality',
  size: 200000,
};

let database;

const openDatabase = async () => {
  if (database) {
    return database;
  }

  database = await SQLite.openDatabase(
    databaseConfig.name,
    databaseConfig.version,
    databaseConfig.displayName,
    databaseConfig.size,
    () => console.log('Database OPEN'),
    err => console.log('SQL Error: ', err),
  );

  return database;
};

const S4 = () => {
  return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
};

const guid = () => {
  return (
    S4() +
    S4() +
    '-' +
    S4() +
    '-' +
    S4() +
    '-' +
    S4() +
    '-' +
    S4() +
    S4() +
    S4()
  );
};

async function executeTransaction(action) {
  const database = await openDatabase();
  return new Promise((resolve, reject) => {
    database.transaction(
      async tx => {
        try {
          console.log('Transaction started');
          await action(tx);
          console.log('Transaction actions executed successfully');
        } catch (error) {
          console.error('Error during transaction action:', error);
          reject(error);
        }
      },
      error => {
        console.error('Transaction error:', error);
        reject(error);
      },
      () => {
        console.log('Transaction completed successfully');
        resolve();
      },
    );
  });
}

async function executeSql(sql, params = []) {
  const database = await openDatabase();
  // Ensure params is always treated as an array:
  const paramList = Array.isArray(params) ? params : [params];
  console.log(`Executing SQL: ${sql} with parameters: ${paramList.join(', ')}`);
  return new Promise((resolve, reject) => {
    database.executeSql(
      sql,
      paramList,
      (transaction, resultSet) => {
        console.log('SQL execution success');
        resolve(resultSet.rows.raw()); // Assuming rows.raw() converts rows to an array
      },
      (transaction, error) => {
        console.error('SQL execution error:', error);
        reject(error);
      },
    );
  });
}

async function executeSelect(query, params = []) {
  // console.log(
  //   `Executing SELECT query: ${query} with params: ${params.join(', ')}`,
  // );
  try {
    const database = await openDatabase();
    return new Promise((resolve, reject) => {
      database.transaction(tx => {
        tx.executeSql(
          query,
          params,
          (tx, results) => {
            resolve(results.rows.raw()); // Convert rows to array and resolve the promise
          },
          (tx, error) => {
            console.error('Error during SELECT query:', error);
            reject(error);
          },
        );
      });
    });
  } catch (error) {
    console.error('Error during SELECT execution:', error);
    throw error;
  }
}

const executeInsertQuery = async (query, success) => {
  try {
    const database = await openDatabase(); // Attempt to open the database
    database.transaction(
      tx => {
        tx.executeSql(query);
      },
      error => {
        console.error('Transaction error:', error);
      },
      () => {
        console.log('Item inserted');
        success(); // Call success callback when the transaction is successful
      },
    );
  } catch (error) {
    console.error('Database open error:', error);
  }
};

const executeDeleteQuery = async (query, successCallback) => {
  try {
    const database = await openDatabase(); // Attempt to open the database
    database.transaction(
      tx => {
        tx.executeSql(
          query,
          [],
          () => {
            console.log('Delete query executed successfully.');
            if (successCallback) successCallback();
          },
          error => {
            console.error('Transaction error:', error);
          },
        );
      },
      error => {
        console.error('Transaction error:', error);
      },
    );
  } catch (error) {
    console.error('Database open error:', error);
  }
};

const InitializeDatabase = async () => {
  const database = await openDatabase();
  const statements = [
    `CREATE TABLE IF NOT EXISTS tb_client_category (
          Id INTEGER PRIMARY KEY AUTOINCREMENT,
          NameClient VARCHAR(20),
          Category_Id VARCHAR(20),
          Min1 VARCHAR(20),
          Min2 VARCHAR(20),
          Min3 VARCHAR(20)
      );`,
    `CREATE TABLE IF NOT EXISTS tb_category (
          Id VARCHAR(20) PRIMARY KEY NOT NULL,
          CategoryValue VARCHAR(20),
          Min1 VARCHAR(20),
          Min2 VARCHAR(20),
          Min3 VARCHAR(20)
      );`,
    `CREATE TABLE IF NOT EXISTS tb_user (
          Username VARCHAR(20) PRIMARY KEY NOT NULL,
          Password VARCHAR(20),
          Domain VARCHAR(20)
      );`,
    `CREATE TABLE IF NOT EXISTS tb_audits (
          Id VARCHAR(20) PRIMARY KEY NOT NULL,
          AuditCode VARCHAR(20),
          Type VARCHAR(20),
          DateTime DATETIME,
          NameClient VARCHAR(20),
          LocationClient VARCHAR(20),
          isUnSaved VARCHAR(4),
          LocationSize VARCHAR(20)
      );`,
    `CREATE TABLE IF NOT EXISTS tb_elements_audit (
          elements_auditId INTEGER PRIMARY KEY AUTOINCREMENT,
          Id VARCHAR,
          ElementLabel VARCHAR,
          ElementValue VARCHAR,
          AuditId VARCHAR,
          ElementComment TEXT
      );`,
    `CREATE TABLE IF NOT EXISTS tb_audit_signature (
          Id INTEGER PRIMARY KEY AUTOINCREMENT,
          AuditCode VARCHAR,
          Signature VARCHAR
      );`,
    `CREATE TABLE IF NOT EXISTS tb_form (
          FormId VARCHAR PRIMARY KEY NOT NULL,
          FloorId VARCHAR,
          CategoryId VARCHAR,
          Date DATETIME,
          AreaCode VARCHAR,
          CounterElements VARCHAR,
          AuditId VARCHAR,
          AreaNumber VARCHAR,
          Remarks VARCHAR,
          Completed INTEGER
      );`,
    `CREATE TABLE IF NOT EXISTS settings_data (
          Id INTEGER PRIMARY KEY AUTOINCREMENT,
          auditExecuted VARCHAR(20),
          lastClient VARCHAR(20),
          lastLocationVisited VARCHAR(20),
          picture VARCHAR
      );`,
    // Adding more tables from the original batch of SQL statements
    `CREATE TABLE IF NOT EXISTS tb_floor (
          Id VARCHAR PRIMARY KEY NOT NULL,
          FloorValue VARCHAR NOT NULL DEFAULT 'bgg'
      );`,
    `CREATE TABLE IF NOT EXISTS tb_area_element (
          Id INTEGER PRIMARY KEY AUTOINCREMENT,
          AreaId VARCHAR,
          element_Id VARCHAR
      );`,
    `CREATE TABLE IF NOT EXISTS tb_area (
          Id VARCHAR PRIMARY KEY NOT NULL,
          Category_Id VARCHAR,
          AreaValue VARCHAR
      );`,
    `CREATE TABLE IF NOT EXISTS tb_area_category (
          Id INTEGER PRIMARY KEY AUTOINCREMENT,
          AreaId VARCHAR,
          Category_Id VARCHAR
      );`,
    `CREATE TABLE IF NOT EXISTS tb_element (
          Id VARCHAR PRIMARY KEY NOT NULL,
          ElementTypeValue VARCHAR
      );`,
    `CREATE TABLE IF NOT EXISTS tb_errors_pending (
          Id INTEGER PRIMARY KEY AUTOINCREMENT,
          ErrorId INTEGER,
          AuditId VARCHAR,
          field TEXT,
          image VARCHAR,
          ImgType INTEGER
      );`,
    `CREATE TABLE IF NOT EXISTS tb_remarks (
          id VARCHAR PRIMARY KEY,
          remarkText TEXT,
          remarkImg TEXT,
          auditId INTEGER
      );`,
    `CREATE TABLE IF NOT EXISTS tb_presentclients (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name VARCHAR,
        AuditId VARCHAR
    );`,
    `CREATE TABLE IF NOT EXISTS tb_error (
        ErrorId INTEGER PRIMARY KEY AUTOINCREMENT,
        ElementTypeId VARCHAR,
        ErrorTypeId VARCHAR,
        LogBook TEXT,
        LogBookImg TEXT,
        TechnicalAspects TEXT,
        TechnicalAspectsImg TEXT,
        FormId VARCHAR,
        ElementTypeText VARCHAR,
        ErrorTypeText VARCHAR,
        CountError VARCHAR,
        LogBookSent INTEGER,
        TechnicalAspectsSent INTEGER,
        Remarks TEXT,
        RemarksImg TEXT,
        RemarksSent INTEGER
    );`,
    `CREATE TABLE IF NOT EXISTS tb_errortype (
        Id VARCHAR PRIMARY KEY NOT NULL,
        ErrorTypeValue VARCHAR
    );`,
    `CREATE TABLE IF NOT EXISTS tb_elements_status (
        Id VARCHAR PRIMARY KEY NOT NULL,
        ElementStatusValueCode VARCHAR,
        SortOrder INTEGER
    );`,
    `CREATE TABLE IF NOT EXISTS tb_form_last (
        FormId VARCHAR PRIMARY KEY NOT NULL,
        Client VARCHAR,
        AuditId VARCHAR,
        Category VARCHAR,
        Floor VARCHAR,
        AreaCode VARCHAR,
        AreaNumber VARCHAR,
        CounterElements VARCHAR
    );`
  ];


  for (const sql of statements) {
    await new Promise((resolve, reject) => {
      database.transaction(tx => {
        tx.executeSql(
          sql,
          [],
          (_, result) => {
            console.log(`Table created or already exists. SQL: ${sql}`);
            resolve(result);
          },
          (tx, error) => {
            console.error(`Error creating table. SQL: ${sql}`, error);
            reject(error);
          },
        );
      });
    });
  }
};

// --------- Exists --------- // 
const existUnSaveData = async () => {
  const queries = [
    'SELECT * FROM tb_presentclients LIMIT 1',
    'SELECT * FROM tb_form LIMIT 1',
  ];

  try {
    const results = await Promise.all(queries.map(executeSelect));
    console.log('Check unsaved data : ' + JSON.stringify(results, null, 2));
    // return (
    //   results.length === 1 && results[0].length > 0 && results[1].length > 0
    // );
    return results.some(result => result.length > 0);
    // return results.every(result => result.length > 0);

  } catch (error) {
    console.error('Error checking unsaved data:', error);
    return false;
  }
}

const existFormWith = async (
  CategoryId,
  FloorId,
  AuditId,
  AreaCode,
  AreaNumber,
) => {
  try {
    const query = 'SELECT * FROM tb_form'; // Adjust the query to be specific if possible
    const results = await executeSelect(query);
    const filteredResults = results.filter(
      result =>
        result.CategoryId === CategoryId &&
        result.FloorId === FloorId &&
        result.AuditId === AuditId &&
        result.AreaCode === AreaCode &&
        result.AreaNumber === AreaNumber,
    );
    return filteredResults[0]; // Return the first match, or undefined if no matches found
  } catch (error) {
    console.error('Error fetching form data:', error);
    throw error; // Optional: re-throw to handle the error externally
  }
};

// --------- Setters --------- // 
const setAuditUnsaved = async (auditId, unsaved) => {
  const isUnSaved = unsaved ? '*' : '';
  try {
    await executeTransaction(tx => {
      tx.executeSql(`UPDATE tb_audits SET isUnSaved = ? WHERE Id = ?`, [
        isUnSaved,
        auditId,
      ]);
    });
    console.log(`Audit ${auditId} update with unsaved status: ${isUnSaved}`);
  } catch (error) {
    console.error('Error updating audit unsaved status:', error);
    throw error;
  }
};

const setKpiElementValue = (auditElementId, value) => {
  return executeTransaction(tx => {
    tx.executeSql(
      "UPDATE tb_elements_audit SET ElementValue=?, ElementComment='' WHERE elements_auditId=?",
      [value, auditElementId],
    );
  });
};

const setKpiElementComment = (idElement, comment) => {
  return executeTransaction(tx => {
    tx.executeSql(
      'UPDATE tb_elements_audit SET ElementComment=? WHERE elements_auditId=?',
      [comment, idElement],
    );
  });
};

// --------- Getters --------- // 

//Clients
const getClients = () => {
  return executeSelect('SELECT * FROM tb_audits GROUP BY NameClient');
};

//Audits
const getAuditById = async AuditId => {
  const sqlQuery = `SELECT * FROM tb_audits WHERE Id = ?`;
  try {
    // Execute the query with parameterized input
    const results = await executeSelect(sqlQuery, [AuditId]);

    // Log the audit retrieval attempt
    console.log(`Executing SQL query to retrieve audit with ID: ${AuditId}`);

    const audit = results[0];
    if (audit) {
      console.log('Found Audit:', audit); // Log the found audit
    } else {
      console.log('No Audit found with ID:', AuditId); // Log if no results were found
    }
    return audit;
  } catch (error) {
    console.error('Error executing SQL query:', error); // Log any errors
    throw error; // Rethrow error after logging
  }
};

const getAuditsOfClient = async NameClient => {
  const sqlQuery = `SELECT * FROM tb_audits WHERE NameClient = ?`;
  try {
    // Execute the query with NameClient as a parameter to ensure safe query execution
    const results = await executeSelect(sqlQuery, [NameClient]);
    console.log(`Audits retrieved for client ${NameClient}:`, results); // Optional: Log the results for debugging
    return results;
  } catch (error) {
    console.error('Error fetching audits for client:', NameClient, error);
    throw error; // Rethrow to allow for calling code to handle the error
  }
};

const getAuditDate = async AuditId => {
  const query = 'SELECT * FROM tb_audits WHERE Id = ?';
  const params = [AuditId];
  try {
    const result = await executeSelect(query, params);
    console.log('Retrieved audit date successfully:', result);
    return result.length > 0 ? result[0].DateTime : null;
  } catch (error) {
    console.error('Failed to retrieve audit date:', error);
    throw error; // Rethrow to ensure that calling code can handle the failure
  }
};

//Categories
const getCategoryById = async (categoryId) => {
  try {
    const categories = await executeSelect(
      `SELECT * FROM tb_category WHERE id = ?`,
      [categoryId],
    );
    return categories[0]; // Assuming the query returns at least one result, or undefined if none
  } catch (error) {
    console.error('Error fetching category by ID:', error);
    return null; // Return null or handle the error as appropriate
  }
};


const getCategoriesByClient = async clientName => {
  const clientQuery = `SELECT Category_Id FROM tb_client_category WHERE NameClient = ?`;
  try {
    // Fetch category IDs for the given client name
    const results = await executeSelect(clientQuery, [clientName]);
    if (results.length === 0) {
      return []; // No categories found, return empty array
    }

    // Extract category IDs and prepare for SQL IN clause
    const categoryIds = results.map(result => result.Category_Id);
    const categoriesQuery = `SELECT * FROM tb_category WHERE Id IN (${categoryIds
      .map(() => '?')
      .join(',')}) ORDER BY CategoryValue`;

    // Fetch category details by category IDs
    return executeSelect(categoriesQuery, categoryIds);
  } catch (error) {
    console.error('Failed to fetch categories:', error);
    throw error; // Rethrow or handle as needed
  }
};

const getCategoriesByClientSorted = clientName => {
  return getCategoriesByClient(clientName);
};

//Floors
const getFloorById = async (floorId) => {
  try {
    const query = 'SELECT * FROM tb_floor WHERE id = ?';
    const params = [floorId];
    const floors = await executeSelect(query, params);
    return floors[0]; // Assuming the query returns at least one result, or undefined if none
  } catch (error) {
    console.error('Error fetching floor by ID:', error);
    return null; // Return null or handle the error as appropriate
  }
};

const getAllFloorsSorted = async () => {
  // Custom comparison function to handle numeric, "Bg", and negative floors correctly
  const compareFloors = (a, b) => {
    const floorA = a.FloorValue.toLowerCase();
    const floorB = b.FloorValue.toLowerCase();

    // Parse the numbers, assuming 'Bg' as 0 for comparison purposes
    const numA = floorA === "bg" ? 0 : parseInt(floorA.replace("e", ""), 10);
    const numB = floorB === "bg" ? 0 : parseInt(floorB.replace("e", ""), 10);

    // Sort negatives below positives and "Bg"
    if (numA < 0 && numB >= 0) return -1; // All negatives go below positives and "Bg"
    if (numB < 0 && numA >= 0) return 1; // All positives and "Bg" stay above negatives

    // Keep "Bg" between negatives and positives
    if (floorA === "bg" && numB !== 0) return numB > 0 ? -1 : 1;
    if (floorB === "bg" && numA !== 0) return numA > 0 ? 1 : -1;

    // Standard numeric comparison for non-negatives and non-"Bg" values
    return numA - numB; // Standard ascending order
  };

  try {
    const floors = await executeSelect(
      'SELECT * FROM tb_floor ORDER BY Id desc',
    );

    // Ensure floors is an array and sort it
    const sortedFloors = Array.isArray(floors)
      ? floors.sort(compareFloors)
      : [];
    console.log('Sorted floors:', sortedFloors);
    return sortedFloors; // Return the sorted array or an empty array if floors is not an array
  } catch (error) {
    console.error('Error fetching floors:', error);
    return []; // Return an empty array in case of an error
  }
};

//Areas
const getAreaCategoryByCode = async (areaValue) => {
  try {
    const query = 'SELECT * FROM tb_area WHERE Id = ?';
    const params = [areaValue];
    const areas = await executeSelect(query, params);
    return areas[0]; // Returns the first area found, or undefined if no areas are found
  } catch (error) {
    console.error('Error fetching area by code:', error);
    return null; // Return null or handle the error as appropriate
  }
};

const getAreasbyCategories2 = async CategoryId => {
  const query = `SELECT tb_area.Id, tb_area.AreaValue FROM tb_area 
                 INNER JOIN tb_area_category ON (tb_area.Id = tb_area_category.AreaId) 
                 WHERE tb_area_category.Category_Id = '${CategoryId}'
                 ORDER BY tb_area.AreaValue`;

  try {
    const areas = await executeSelect(query);
    console.log('Areas:', areas);
    return areas;
  } catch (error) {
    console.error('Error fetching areas:', error);
    throw error; // Rethrowing error if you need to handle it further up the chain
  }
};

// Elements
const getAllElements = async auditId => {
  const sqlQuery = `SELECT * FROM tb_elements_audit WHERE AuditId = ?`;
  try {
    // Execute the query using parameterized input
    const results = await executeSelect(sqlQuery, [auditId]);
    console.log(`Elements retrieved for Audit ID ${auditId}:`, results);
    return results;
  } catch (error) {
    console.error(`Error fetching elements for Audit ID ${auditId}:`, error);
    throw error; // Rethrow error after logging for external handling
  }
};

const getElementbyArea = async areaId => {
  try {
    // Fetch area elements based on areaId
    const areaElements = await executeSelect(
      `SELECT * FROM tb_area_element WHERE AreaId = "${areaId}"`,
    );

    // Construct the WHERE clause based on fetched area elements
    if (areaElements.length === 0) {
      console.log('No area elements found for AreaId:', areaId);
      return [];
    }

    const whereClause = areaElements
      .map(ae => `'${ae.element_Id}'`)
      .join(' OR Id = ');
    const elementQuery = `SELECT * FROM tb_element WHERE Id = ${whereClause}`;

    // Fetch elements based on constructed WHERE clause
    const elements = await executeSelect(elementQuery);

    // Sort elements by ElementTypeValue
    elements.sort((a, b) => {
      let x = a.ElementTypeValue.toLowerCase();
      let y = b.ElementTypeValue.toLowerCase();
      return x < y ? -1 : x > y ? 1 : 0;
    });

    return elements; // Return the sorted elements
  } catch (error) {
    console.error('Failed to fetch elements by area:', error);
    throw error; // Re-throw the error for further handling if needed
  }
};

const getTotalCounterElementByCategory = async (NameClient, LocationSize) => {
  // Determine the minimum number based on location size
  const minNumber = LocationSize > 499 ? 3 : LocationSize > 249 ? 2 : 1;
  const columnAlias = `Min${minNumber}`;

  // Build a parameterized SQL query
  const query = `
        SELECT 
            tb_category.CategoryValue, 
            tb_category.Id, 
            tb_category.${columnAlias} AS Min 
        FROM tb_category 
        INNER JOIN tb_client_category 
            ON (tb_category.Id = tb_client_category.Category_Id) 
        WHERE tb_client_category.NameClient = ?
    `;

  try {
    // Execute the query with safe parameter insertion
    return await executeSelect(query, [NameClient]);
  } catch (error) {
    console.error('Error fetching total counter elements by category:', error);
    throw error; // Rethrow to allow handling by the caller
  }
};

const getAuditCounterElements = async AuditId => {
  const sqlQuery = `
        SELECT AuditId, CategoryId, SUM(CounterElements) AS CounterElements 
        FROM tb_form 
        WHERE AuditId = ? 
        GROUP BY CategoryId
    `;
  try {
    // Execute the query using parameterized input
    const results = await executeSelect(sqlQuery, [AuditId]);
    console.log(`Counter elements retrieved for Audit ID ${AuditId}:`, results);
    return results;
  } catch (error) {
    console.error(
      `Error fetching counter elements for Audit ID ${AuditId}:`,
      error,
    );
    throw error; // Rethrow error after logging for external handling
  }
};

// Form
const getFormById = async formId => {
  const query = 'SELECT * FROM tb_form WHERE FormId = ?';
  try {
    const results = await executeSelect(query, [formId]);
    return results[0]; // Assuming executeSelect properly formats and returns an array of results
  } catch (error) {
    console.error('Failed to retrieve form by ID:', error);
    throw error;
  }
};

const getFormsByAuditId = async (auditId) => {
  const query = `SELECT * FROM tb_form WHERE AuditId=?`;
  return executeSelect(query, [auditId]);
};

const getCompletedForms = async (auditId) => {
  const forms = await getFormsByAuditId(auditId);
  return forms.filter(form => form.Completed === 1);
};

const getUncompletedForms = async (auditId) => {
  const forms = await getFormsByAuditId(auditId);
  return forms.filter(form => form.Completed === 0);
};

const getLastUncompletedForm = async (auditId) => {
  const forms = await getUncompletedForms(auditId);
  return forms[forms.length - 1]; // Returns the last item or undefined if no forms
};

const getLastCompletedForm = async (auditId) => {
  const forms = await getCompletedForms(auditId);
  return forms[forms.length - 1]; // Returns the last item or undefined if no forms
};

// getAllForms 
const formForServer = form => {
  let AreaNumber = '';

  if (form.AreaNumber != null && form.AreaNumber != 0) {
    AreaNumber = '.' + form.AreaNumber;
  }

  return {
    Id: form.FormId,
    FloorId: form.FloorId,
    CategoryId: form.CategoryId,
    Date: new Date(form.Date),
    AreaCode: form.AreaCode + AreaNumber,
    CounterElements: form.CounterElements,
    Remarks: form.Remarks,
  };
};

const getAllForms = async AuditId => {
  try {
    const results = await executeSelect(
      `SELECT * FROM tb_form WHERE AuditId = "${AuditId}"`,
    );
    const forms = results.map(formForServer);

    const formsWithErrors = await Promise.all(
      forms.map(async form => {
        const errors = await executeSelect(
          `SELECT * FROM tb_error WHERE FormId = "${form.Id}"`,
        );
        form.Errors = errors.map(error => ({
          ElementTypeId: error.ElementTypeId,
          ErrorTypeId: error.ErrorTypeId,
          LogBook: error.LogBook === 'undefined' ? '' : error.LogBook,
          TechnicalAspects:
            error.TechnicalAspects === 'undefined'
              ? ''
              : error.TechnicalAspects,
          Remark: error.Remarks === 'undefined' ? '' : error.Remarks,
          Count: error.CountError,
        }));
        return form;
      }),
    );

    return formsWithErrors;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
 
// Errors
async function getAllErrorByFormId(FormId) {
  const query = 'SELECT * FROM tb_error WHERE FormId = ?';
  const params = [FormId]; // Parameters to safely pass to the query, preventing SQL injection

  try {
    const errors = await executeSelect(query, params);
    console.log('Errors for FormId', FormId, ':', errors);
    return errors; // Returns the list of errors associated with the FormId
  } catch (error) {
    console.error('Error fetching errors for FormId:', FormId, error);
    throw error;
  }
}

const getErrorsImages = async(auditId) =>  {
  const formQuery = 'SELECT * FROM tb_form WHERE AuditId = ?';
  const errorQuery = 'SELECT * FROM tb_error WHERE FormId = ?';
  const params = [auditId];

  try {
    const forms = await executeSelect(formQuery, params);
    const images = [];

    for (const form of forms) {
      const errors = await executeSelect(errorQuery, [form.FormId]);

      for (const error of errors) {
        if (error.LogBookImg && error.LogBookImg !== 'undefined') {
          images.push({
            imageError: {
              MimeType: 'image/png',
              Image: error.LogBookImg
            },
            traceImageData: {
              AuditId: auditId,
              ElementTypeId: error.ElementTypeId,
              ErrorTypeId: error.ErrorTypeId,
              FormId: form.FormId,
              Field: 'logbook'
            }
          });
        }
        if (error.TechnicalAspectsImg && error.TechnicalAspectsImg !== 'undefined') {
          images.push({
            imageError: {
              MimeType: 'image/png',
              Image: error.TechnicalAspectsImg
            },
            traceImageData: {
              AuditId: auditId,
              ElementTypeId: error.ElementTypeId,
              ErrorTypeId: error.ErrorTypeId,
              FormId: form.FormId,
              Field: 'technicalaspects'
            }
          });
        }
      }
    }
    
    console.log('Retrieved error images successfully:', images);
    return images;
  } catch (error) {
    console.error('Failed to retrieve error images:', error);
    throw error; // Rethrow to ensure that calling code can handle the failure
  }
}

// ErrorTypes
const getAllErrorType = async () => {
  const query = 'SELECT * FROM tb_errortype ORDER BY ErrorTypeValue';
  try {
    const errorTypes = await executeSelect(query);
    console.log('Fetched error types:', errorTypes);
    return errorTypes;
  } catch (error) {
    console.error('Failed to fetch error types:', error);
    throw error; // Rethrow the error for further handling if needed
  }
};

// Settings
const getSettings = async () => {
  const settings = await executeSelect('SELECT * FROM settings_data');
  return settings.length > 0 ? settings[0] : null;
};

// PresentClients
async function getAllPresentClient(AuditId) {
  const query = 'SELECT * FROM tb_presentclients WHERE AuditId = ?';
  const params = [AuditId];
  try {
    const result = await executeSelect(query, params);
    console.log('Retrieved clients successfully:', result);
    return result; // This might return an array of clients
  } catch (error) {
    console.error('Failed to retrieve clients:', error);
    throw error; // Rethrow to ensure that calling code can handle the failure
  }
}

// Remarks
const getRemarks = async auditId => {
  const query = 'SELECT * FROM tb_remarks WHERE auditId = ?';
  const params = [auditId];

  try {
    const remarks = await executeSelect(query, params);

    return remarks.map(remark => ({
      remarkAndImage: {
        RemarkId: remark.id,
        AuditId: remark.auditId,
        RemarkText: remark.remarkText,
        RemarkImage: {
          MimeType: 'image/png',
          Image: remark.remarkImg,
        },
      },
    }));
  } catch (error) {
    console.error('Failed to retrieve remarks:', error);
    throw error; // Rethrow to ensure that calling code can handle the failure
  }
};

// Inserts

function generateUniqueId() {
  // return Date.now().toString(36) + Math.random().toString(36).substring(2);
  return guid();
}

const insertSettings = async (
  auditExecuted,
  lastClient,
  lastLocationVisited,
) => {
  const settings = await getSettings();
  return await executeTransaction(tx => {
    if (settings === null) {
      const query = `
          INSERT INTO settings_data (auditExecuted, lastClient, lastLocationVisited) 
          VALUES ("${auditExecuted}", "${lastClient}", "${lastLocationVisited}")`;
      tx.executeSql(query);
    } else {
      const query_1 = `
          UPDATE settings_data SET
            auditExecuted = "${auditExecuted}",
            lastClient = "${lastClient}",
            lastLocationVisited = "${lastLocationVisited}",
            picture = "${settings.picture}"
          WHERE Id = "${settings.Id}"`;
      tx.executeSql(query_1);
    }
  });
};

const insertPicture = async image => {
  try {
    const settings = await getSettings(); // Fetch settings first
    await executeTransaction(tx => {
      const query = `UPDATE settings_data SET auditExecuted = ?, lastClient = ?, lastLocationVisited = ?, picture = ? WHERE Id = ?`;
      const params = [
        settings.auditExecuted,
        settings.lastClient,
        settings.lastLocationVisited,
        image,
        settings.Id,
      ];
      tx.executeSql(query, params); // Execute the query with parameters to prevent SQL injection
      console.log('Image updated in settings:', image);
    });
  } catch (error) {
    console.error('Error inserting picture:', error);
    throw error;
  }
};

const clearSettings = () => {
  return executeTransaction(tx => {
    tx.executeSql('DELETE FROM settings_data');
  });
};

const saveAllData = async response => {
  try {
    await executeTransaction(tx => {
      executeSql('DELETE FROM tb_error');
      executeSql('DELETE FROM tb_form');
      executeSql('DELETE FROM tb_remarks');

      // Assuming `response` is the object resolved by fetchAudits
      // and the actual audits data is wrapped inside the `data` property.
      const auditsData = response.audits; // Access the audits array
      const floorData = response.floors;
      const areaData = response.areas;
      const categoriesData = response.categories;
      const elementsData = response.elementTypes;
      const elementsStatusData = response.elementStatuses;
      const clientsData = response.clients;
      const errorsData = response.errorTypes;
      // console.log('auditsData : ' + JSON.stringify(auditsData, null, 2));
      // console.log('floorData : ' + JSON.stringify(floorData, null, 2));
      // console.log('areaData : ' + JSON.stringify(areaData, null, 2));
      console.log('categoriesData : ' + JSON.stringify(categoriesData, null, 2));
      // console.log('elementsData : ' + JSON.stringify(elementsData, null, 2));
      // console.log('elementsStatusData : ' +JSON.stringify(elementsStatusData, null, 2));
      // console.log('clientsData : '  + JSON.stringify(clientsData, null, 2));
      // console.log('errorsData : ' + JSON.stringify(errorsData, null, 2));

      // Check if to save data are arrays before proceeding
      if (Array.isArray(floorData)) {
        saveFloors(tx, floorData);
      } else {
        console.error('floorData is not an array:', floorData);
      }

      if (Array.isArray(areaData)) {
        saveAreas(tx, areaData);
      } else {
        console.error('areas data is not an array:', areaData);
      }

      if (Array.isArray(categoriesData)) {
        saveCategories(tx, categoriesData);
      } else {
        console.error('categories data is not an array:', categoriesData);
      }

      if (Array.isArray(elementsData)) {
        saveElements(tx, elementsData);
      } else {
        console.error('elementsData is not an array:', elementsData);
      }

      if (Array.isArray(auditsData)) {
        saveAudits(tx, auditsData);
      } else {
        console.error('Audits data is not an array:', auditsData);
      }

      if (Array.isArray(elementsStatusData)) {
        saveElementsStatus(tx, elementsStatusData);
      } else {
        console.error(
          'elementsStatusData is not an array:',
          elementsStatusData,
        );
      }

      if (Array.isArray(clientsData)) {
        saveClientsCategories(tx, clientsData);
      } else {
        console.error('clientsData is not an array:', clientsData);
      }

      if (Array.isArray(errorsData)) {
        saveErrors(tx, errorsData);
      } else {
        console.error('errorsData is not an array:', errorsData);
      }

      // You can add other operations here if necessary
    });
  } catch (error) {
    console.error('Error saving data:', error);
  }
};

const saveFloors = (tx, floors) => {
  // Check if floors is null or has no entries
  if (!floors || floors.length === 0) {
    console.error('No floors provided to save');
    return; 
  }

  // Delete all existing entries in the tb_floor table first
  tx.executeSql(
    'DELETE FROM tb_floor',
    [],
    () => {
      // Callback function to execute after successfully deleting existing records
      floors.forEach(floor => {
        tx.executeSql(
          'INSERT INTO tb_floor (Id, FloorValue) VALUES (?, ?)',
          [floor.id, floor.value],
          () => {
            console.log('Insert successful for floor ID:', floor.id);
          },
          txError => {
            console.error(
              'Failed to insert floor ID:',
              floor.id,
              'Error:',
              txError,
            );
          },
        );
      });
    },
    error => {
      console.error('Failed to delete floors:', error);
    },
  );
}

const saveAreas = (tx, areas) => {
  if (!areas || areas.length === 0) {
    console.error('No areas provided to save');
    return; 
  }

  // Clear existing area data
  tx.executeSql('DELETE FROM tb_area');
  tx.executeSql('DELETE FROM tb_area_element');

  // Insert new area data
  areas.forEach(area => {
    tx.executeSql(
      'INSERT INTO tb_area (Id, AreaValue) VALUES (?, ?)',
      [area.abbreviation, area.name],
      () => {
        console.log('Insert successful for Area ID:', area.abbreviation);
      },
    );

    // Insert associated elements for each area
    if (area.elements && area.elements.length > 0) {
      area.elements.forEach(elementId => {
        tx.executeSql(
          'INSERT INTO tb_area_element (AreaId, element_Id) VALUES (?, ?)',
          [area.abbreviation, elementId],
          // () => {
          //   console.log('Insert successful for element_Id:', elementId);
          // }
          // ,
        );
      });
    }
  });
}

const saveCategories = (tx, categories) => {
  if (!categories || categories.length === 0) {
    console.error('No categories provided to save');
    return; 
  }  
  // Clear existing category data
  tx.executeSql('DELETE FROM tb_category');
  tx.executeSql('DELETE FROM tb_area_category');

  // Insert new category data
  categories.forEach(category => {
    const [min1, min2, min3] = category.minimalElements.map(min => String(min));  // Explicitly cast to integers

    tx.executeSql(
      'INSERT INTO tb_category (Id, CategoryValue, Min1, Min2, Min3) VALUES (?, ?, ?, ?, ?)',
      [category.id, category.value, min1, min2, min3],  // Use the casted integers
      () => {
        console.log('Insert successful for category value:', category.value);
      },
    );

    // Insert associations between categories and areas
    if (category.areas) {
      category.areas.forEach(area => {
        tx.executeSql(
          'INSERT INTO tb_area_category (AreaId, Category_Id) VALUES (?, ?)',
          [area, category.id],
          () => {
            console.log('Insert successful for area category value:', area);
          },
        );
      });
    }
  });
}

const saveElements = (tx, elements) => {
  if (!elements || elements.length === 0) {
    console.error('No elements provided to save');
    return; 
  }    
  // Clear existing element data
  tx.executeSql('DELETE FROM tb_element');

  // Insert new element data
  elements.forEach(element => {
    tx.executeSql(
      'INSERT INTO tb_element (Id, ElementTypeValue) VALUES (?, ?)',
      [element.id, element.value],
      () => {
        console.log('Insert successful for tb_element:', element.value);
      },
    );
  });
}

const saveAudits = (tx, audits) => {
  if (!audits || audits.length === 0) {
    console.error('No audits to save');
    return;
  }

  tx.executeSql('DELETE FROM tb_audits');
  tx.executeSql('DELETE FROM tb_elements_audit');

  audits.forEach(audit => {
    if (!audit.id) {
      console.error('Audit ID is missing');
      return;
    }

    const auditInsertQuery = `INSERT INTO tb_audits (
      Id, AuditCode, Type, DateTime, NameClient, LocationClient, isUnSaved, LocationSize
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;

    tx.executeSql(
      auditInsertQuery,
      [
        audit.id,
        String(audit.code),
        audit.type,
        audit.dateTime,
        audit.clientName,
        audit.clientLocation,
        audit.isUnSaved,
        audit.clientLocationSize,
      ],
      (tx, results) => {
        console.log('Audit inserted successfully');
      },
      (tx, error) => {
        console.error('Error inserting audit:', error.message);
      },
    );
    if (audit.elements && audit.elements.length > 0) {
      audit.elements.forEach(kpiElement => {
        if (!kpiElement.id) {
          console.error('Element ID is missing');
          return;
        }

        const elementInsertQuery = `INSERT INTO tb_elements_audit (
          Id, ElementLabel, ElementValue, AuditId, ElementComment
        ) VALUES (?, ?, ?, ?, ?)`;

        tx.executeSql(
          elementInsertQuery,
          [
            kpiElement.id,
            kpiElement.elementLabel,
            kpiElement.elementValue,
            audit.id,
            kpiElement.elementComment ? kpiElement.elementComment : '',
          ],
          (tx, results) => {
            console.log('Element inserted successfully');
          },
          (tx, error) => {
            console.error('Error inserting element:', error.message);
          },
        );
      });
    }
  });
};

const saveElementsStatus= (tx, elementsStatus) => {
  if (!elementsStatus || elementsStatus.length === 0) {
    console.error('No elementsStatus to save');
    return;
  }  
  // Clear existing elements status data
  tx.executeSql('DELETE FROM tb_elements_status');

  // Insert new elements status data
  elementsStatus.forEach(elementStatus => {
    tx.executeSql(
      'INSERT INTO tb_elements_status (Id, ElementStatusValueCode, SortOrder) VALUES (?, ?, ?)',
      [elementStatus.id, elementStatus.value, elementStatus.order],
      () => {
        console.log(
          'Insert successful for elementsStatus:',
          elementStatus.value,
        );
      },
    );
  });
}

const saveClientsCategories = (tx, clients) => {
  if (!clients || clients.length === 0) {
    console.error('No clients to save');
    return;
  }    
  // Clear existing client categories data
  tx.executeSql('DELETE FROM tb_client_category');

  // Insert new client categories data
  clients.forEach(client => {
    client.categories.forEach(clientCategory => {
      tx.executeSql(
        'INSERT INTO tb_client_category (NameClient, Category_Id) VALUES (?, ?)',
        [client.name, clientCategory],
        () => {
          console.log('Insert successful for tb_client_category:', client.name);
        },
      );
    });
  });
}

const saveErrors = (tx, errors) => {
  if (!errors || errors.length === 0) {
    console.error('No errors to save');
    return;
  }    
  // Clear existing error types data
  tx.executeSql('DELETE FROM tb_errortype');

  // Insert new error types data
  errors.forEach(error => {
    tx.executeSql(
      'INSERT INTO tb_errortype (Id, ErrorTypeValue) VALUES (?, ?)',
      [error.id, error.value],
      () => {
        console.log('Insert successful for tb_errortype:', error.value);
      },
    );
  });
}

//Forms
const insertFormData = async formData => {
  const query = `INSERT INTO tb_form (FloorId, CategoryId, Date, AreaCode, CounterElements, AuditId, AreaNumber, Remarks, FormId, Completed) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
  const params = [
    formData.FloorId,
    formData.CategoryId,
    formData.Date,
    formData.AreaCode,
    formData.CounterElements,
    formData.AuditId,
    formData.AreaNumber,
    formData.Remarks,
    formData.FormId,
    formData.Completed,
  ];

  try {
    await executeTransaction(async tx => {
      console.log('Executing SQL:', query, params);
      // await tx.executeSql('DELETE FROM tb_form');

      await tx.executeSql(query, params);
    });
    console.log('Form data inserted successfully');
  } catch (error) {
    console.error('Failed to insert form data:', error);
    throw error;
  }
};

const updateFormData = async formData => {
  const query = `
    UPDATE tb_form 
    SET 
      FloorId = ?,
      CategoryId = ?,
      Date = ?,
      AreaCode = ?,
      CounterElements = ?,
      AuditId = ?,
      AreaNumber = ?,
      Remarks = ?,
      Completed = ?
    WHERE FormId = ?
  `;
  const params = [
    formData.FloorId,
    formData.CategoryId,
    formData.Date,
    formData.AreaCode,
    formData.CounterElements,
    formData.AuditId,
    formData.AreaNumber,
    formData.Remarks,
    formData.Completed,
    formData.FormId,
  ];

  try {
    await executeTransaction(async tx => {
      console.log('Executing SQL:', query, params);
      await tx.executeSql(query, params);
      // await tx.executeSql('DELETE FROM tb_form');
      
    });
    console.log('Form data updated successfully for FormId:', formData.FormId);
  } catch (error) {
    console.error('Failed to update form data:', error);
    throw error;
  }
};

const upsertFormData = async formData => {
  let isNewForm = false; // Flag to check if it's a new form

  // Check if formData contains a FormId
  if (!formData.FormId) {
    // Generate a unique FormId if not provided
    formData.FormId = generateUniqueId();
    console.log('Generated new FormId:', formData.FormId);
    isNewForm = true; // It's a new form
  }

  try {
    if (isNewForm) {
      // Call insertFormData to add a new form
      await insertFormData(formData);
      console.log('New form data inserted successfully with generated FormId.');
    } else {
      // FormId exists, so update the existing form
      await updateFormData(formData);
      console.log(
        'Form data updated successfully for existing FormId:',
        formData.FormId,
      );
    }
    // Return the FormId after insert/update operation
    return formData.FormId;
  } catch (error) {
    console.error('Failed to upsert form data:', error);
    throw error;
  }
};

async function getFirstRowFromTbForm() {
  const query = 'SELECT * FROM tb_form ORDER BY FormId ASC'; // Adjust order and limiting as needed

  try {
    const result = await executeSelect(query, []);
    if (result.length > 0) {
      // Log each row in the result
      result.forEach(row => {
        console.log('tb_form table data:', JSON.stringify(row, null, 2));
      });
      console.log('First row from tb_form:', result[0]); // Log the first row
      return result[0]; // Return the first row
    } else {
      console.log('No rows found in tb_form.');
      return null; // Return null if no rows found
    }
  } catch (error) {
    console.error('Failed to fetch the first row from tb_form:', error);
    throw error; // Re-throw to handle upstream
  }
}

const saveForm = async (form, errors = []) => {
  console.log('Incoming to upsert formData :' + JSON.stringify(form, null, 2));    

  // Initialize default values if null
  form = {
    AreaNumber: form.AreaNumber || 0,
    Completed: form.Completed || 0,
    Remarks: form.Remarks || '',
    ...form,
  };
  console.log('Default values set to upsert formData :' + JSON.stringify(form, null, 2));    

  try {
    const formId = await upsertFormData(form);
    // getFirstRowFromTbForm();
    console.log('form_id => ' + formId);

    // Fetch and update audit data
    const results = await executeSelect(
      `SELECT * FROM tb_audits WHERE Id = ?`,
      [form.AuditId],
    );
    const result = results[0];

    await executeTransaction(async tx => {
      await tx.executeSql(`UPDATE tb_audits SET DateTime = ? WHERE Id = ?`, [
        new Date().toISOString(),
        result.Id,
      ]);

      // Handle any errors
      if (errors.length > 0) {
        await tx.executeSql(`DELETE FROM tb_error WHERE FormId = ?`, [formId]);
        errors.forEach(async error => {
          let errorQuery = `INSERT INTO tb_error (ElementTypeId, ErrorTypeId, LogBook, LogBookImg, TechnicalAspects, TechnicalAspectsImg, FormId, ElementTypeText, ErrorTypeText, CountError, LogBookSent, TechnicalAspectsSent) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
          await tx.executeSql(errorQuery, [
            error.ElementTypeId,
            error.ErrorTypeId,
            error.LogBook,
            error.LogBookImg,
            error.TechnicalAspects,
            error.TechnicalAspectsImg,
            formId,
            error.ElementTypeText,
            error.ErrorTypeText,
            error.CountError,
            error.LogBookSent,
            error.TechnicalAspectsSent,
          ]);
        });
      }
    });

      newForm = await getFormById(formId);
      console.log('newForm.CategoryId ' + JSON.stringify(newForm, null, 2));
      // Return the updated form data
      return newForm;
    } catch (error) {
      console.error('Error saving form:', error);
      throw error;
    }
};

async function saveRemark(remarkText, remarkImg, auditId, remarkId = null) {
  // Generate a new ID if none is provided
  if (!remarkId) {
    remarkId = generateUniqueId(); // Ensure this function is implemented to generate unique IDs
    console.log(
      'Inserting new remark:',
      remarkText,
      remarkImg,
      auditId,
      remarkId,
    );

    const insertQuery = `INSERT INTO tb_remarks (id, remarkText, remarkImg, auditId) VALUES (?, ?, ?, ?)`;
    try {
      await executeTransaction(async tx => {
        await tx.executeSql(insertQuery, [
          remarkId,
          remarkText,
          remarkImg,
          auditId,
        ]);
      });
      console.log('New remark inserted successfully');
    } catch (error) {
      console.error('Failed to insert new remark:', error);
      throw error;
    }
  } else {
    // Update existing remark
    console.log(
      'Updating existing remark:',
      remarkText,
      remarkImg,
      auditId,
      remarkId,
    );
    const updateQuery = `UPDATE tb_remarks SET remarkText = ?, remarkImg = ?, auditId = ? WHERE id = ?`;

    try {
      await executeTransaction(async tx => {
        await tx.executeSql(updateQuery, [
          remarkText,
          remarkImg,
          auditId,
          remarkId,
        ]);
      });
      console.log('Remark updated successfully for RemarkId:', remarkId);
    } catch (error) {
      console.error('Failed to update existing remark:', error);
      throw error;
    }
  }

  return remarkId; // Return the remarkId for further use
}

async function insertError(error, FormId) {
  const sentFlags = {
    logBookSent: error.LogBookImg ? 1 : 0,
    technicalAspectsSent: error.TechnicalAspectsImg ? 1 : 0,
    remarksSent: error.RemarksImg ? 1 : 0,
  };

  const query = `INSERT INTO tb_error (ElementTypeId, ErrorTypeId, LogBook, LogBookImg, TechnicalAspects, TechnicalAspectsImg, FormId, ElementTypeText, ErrorTypeText, CountError, LogBookSent, TechnicalAspectsSent, Remarks, RemarksImg, RemarksSent)
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
  const params = [
    error.ElementTypeId,
    error.ErrorTypeId,
    error.LogBook,
    error.LogBookImg,
    error.TechnicalAspects,
    error.TechnicalAspectsImg,
    FormId,
    error.ElementTypeText,
    error.ErrorTypeText,
    String(error.CountError),
    sentFlags.logBookSent,
    sentFlags.technicalAspectsSent,
    error.Remarks,
    error.RemarksImg,
    sentFlags.remarksSent,
  ];

  await executeTransaction(async tx => {
    await tx.executeSql(query, params);
  });
  console.log('New error inserted successfully');
}

async function updateError(error, FormId) {
  const sentFlags = {
    logBookSent: error.LogBookImg ? 1 : 0,
    technicalAspectsSent: error.TechnicalAspectsImg ? 1 : 0,
    remarksSent: error.RemarksImg ? 1 : 0,
  };

  const query = `UPDATE tb_error
                   SET ElementTypeId = ?, ErrorTypeId = ?, LogBook = ?, LogBookImg = ?, TechnicalAspects = ?,
                       TechnicalAspectsImg = ?, FormId = ?, ElementTypeText = ?, ErrorTypeText = ?, CountError = ?,
                       LogBookSent = ?, TechnicalAspectsSent = ?, Remarks = ?, RemarksImg = ?, RemarksSent = ?
                   WHERE ErrorId = ?`;
  const params = [
    error.ElementTypeId,
    error.ErrorTypeId,
    error.LogBook,
    error.LogBookImg,
    error.TechnicalAspects,
    error.TechnicalAspectsImg,
    FormId,
    error.ElementTypeText,
    error.ErrorTypeText,
    error.CountError,
    sentFlags.logBookSent,
    sentFlags.technicalAspectsSent,
    error.Remarks,
    error.RemarksImg,
    sentFlags.remarksSent,
    error.ErrorId,
  ];

  await executeTransaction(async tx => {
    await tx.executeSql(query, params);
  });
  console.log(`Error data updated successfully for ErrorId: ${error.ErrorId}`);
}

async function getFirstRowFromTbError() {
  const query = 'SELECT * FROM tb_error ORDER BY ErrorId ASC'; // Adjust order and limiting as needed

  try {
    const result = await executeSelect(query, []);
    if (result.length > 0) {
      // Log each row in the result
      result.forEach(row => {
        console.log('tb_error table data:', JSON.stringify(row, null, 2));
      });
      console.log('First row from tb_error:', result[0]); // Log the first row
      return result[0]; // Return the first row
    } else {
      console.log('No rows found in tb_error.');
      return null; // Return null if no rows found
    }
  } catch (error) {
    console.error('Failed to fetch the first row from tb_error:', error);
    throw error; // Re-throw to handle upstream
  }
}

async function saveError(error, FormId) {
  if (!error.ErrorId) {
    // No ErrorId means this is a new error
    console.log(
      'No ErrorId provided, insert error ' + JSON.stringify(error, null, 2),
    );
    await insertError(error, FormId);
  } else {
    // ErrorId exists, update the existing record
    console.log(
      'Errorid found, Update error ' + JSON.stringify(error, null, 2),
    );    
    await updateError(error, FormId);
  }
  getFirstRowFromTbError();
  return error.ErrorId;
}

// Signature
const getAuditSignature = async auditCode => {
  const query = 'SELECT Signature FROM tb_audit_signature WHERE AuditCode = ?';
  const params = [auditCode];
  const results = await executeSelect(query, params);
  return results.length > 0 ? results[0].Signature : null;
};

const insertAuditSignature = async (auditCode, signature) => {
  const query =
    'INSERT INTO tb_audit_signature (AuditCode, Signature) VALUES (?, ?)';
  const params = [auditCode, signature];
  await executeTransaction(async tx => {
    await tx.executeSql(query, params);
  });
  console.log('Inserted new audit signature successfully');
};

const updateAuditSignature = async (auditCode, signature) => {
  const query =
    'UPDATE tb_audit_signature SET Signature = ? WHERE AuditCode = ?';
  const params = [signature, auditCode];
  await executeTransaction(async tx => {
    await tx.executeSql(query, params);
  });
  console.log('Updated audit signature successfully');
};

const deleteAuditSignature = async AuditCode => {
  try {
    await executeTransaction(async tx => {
      const query = 'DELETE FROM tb_audit_signature WHERE AuditCode = ?';
      const params = [AuditCode];
      await tx.executeSql(query, params);
      console.log(
        'Audit signature deleted successfully for AuditCode:',
        AuditCode,
      );
    });
  } catch (error) {
    console.error('Error deleting audit signature:', error);
    throw error;
  }
};

const upsertSignature = async (auditCode, signature) => {
  const existingSignature = await getAuditSignature(auditCode);
  if (existingSignature === null) {
    await insertAuditSignature(auditCode, signature);
    console.log('Signature inserted for the first time.');
  } else {
    await updateAuditSignature(auditCode, signature);
    console.log('Existing signature updated.');
  }
};


// PresentClients
async function savePresentClient(clientName, AuditId) {
  const query = 'INSERT INTO tb_presentclients (name, AuditId) VALUES (?, ?)';
  const params = [clientName, AuditId];

  try {
    await executeTransaction(async tx => {
      const result = await tx.executeSql(query, params);
      console.log('Client successfully saved:', result);
      return result; // This might return some info about the operation, such as the ID of the newly created record
    });
  } catch (error) {
    console.error('Failed to save client:', error);
    throw error; // Rethrow to ensure that calling code can handle the failure
  }
}

async function updatePresentClient(clientId, newClientName) {
  const query = 'UPDATE tb_presentclients SET name = ? WHERE id = ?';
  const params = [newClientName, clientId];

  try {
    await executeTransaction(async tx => {
      const result = await tx.executeSql(query, params);
      console.log('Client successfully updated:', result);
      return result; // This might return some info about the operation, like number of rows updated
    });
  } catch (error) {
    console.error('Failed to update client:', error);
    throw error; // Rethrow to ensure that calling code can handle the failure
  }
}

//Deletes
async function deleteError(error) {
  const query = 'DELETE FROM tb_error WHERE ErrorId = ?';
  const params = [error.ErrorId];
  try {
    const result = await executeSql(query, params);
    console.log('Error successfully deleted:', result);
    return result; // It might return some info about the operation, like number of rows deleted
  } catch (error) {
    console.error('Failed to delete error:', error);
    throw error; // Rethrow to ensure that calling code can handle the failure
  }
}

async function deletePresentClient(clientId) {
  const query = 'DELETE FROM tb_presentclients WHERE id = ?';
  const params = [clientId];

  try {
    await executeTransaction(async tx => {
      const result = await tx.executeSql(query, params);
      console.log('Client successfully deleted:', result);
      return result; // It might return some info about the operation, like number of rows deleted
    });
  } catch (error) {
    console.error('Failed to delete client:', error);
    throw error; // Rethrow to ensure that calling code can handle the failure
  }
}

const removeAllFromAudit = async AuditId => {
  try {
    await executeTransaction(tx => {
      tx.executeSql(`DELETE FROM tb_presentclients WHERE AuditId = ?`, [
        AuditId,
      ]);
      tx.executeSql(`DELETE FROM tb_remarks WHERE auditId = ?`, [AuditId]);
    });

    const forms = await executeSelect(
      `SELECT * FROM tb_form WHERE AuditId = ?`,
      [AuditId],
    );

    await executeTransaction(tx => {
      forms.forEach(form => {
        tx.executeSql(`DELETE FROM tb_error WHERE FormId = ?`, [form.FormId]);
      });
    });

    await executeTransaction(tx => {
      tx.executeSql(`DELETE FROM tb_form WHERE AuditId = ?`, [AuditId]);
      tx.executeSql(`DELETE FROM tb_audits WHERE AuditCode = ?`, [AuditId]);
    });

    console.log("All data removed from audit.");
  } catch (error) {
    console.error("Error removing all data from audit:", error);
  }
};

const deleteAudit = async auditId => {
  try {
    await executeTransaction(tx => {
      tx.executeSql("DELETE FROM tb_audits WHERE Id = ?", [auditId]);
    });
  } catch (error) {
    console.error("Error deleting audit:", error);
  }
};

// Export your database functions to use in other files
export {
  openDatabase,
  InitializeDatabase,
  executeTransaction,
  executeSql,
  executeInsertQuery,
  //save all incoming data from endpoint
  saveAllData,
  saveForm,
  saveRemark,
  saveError,
  //exists
  existUnSaveData,
  existFormWith,
  //setters
  setAuditUnsaved,
  setKpiElementValue,
  setKpiElementComment,
  //getters
  getClients,
  getAuditsOfClient,
  getAuditById,
  getCategoryById,
  getCategoriesByClient,
  getCategoriesByClientSorted,
  getFloorById,
  getAllFloorsSorted,
  getAreaCategoryByCode,
  getAreasbyCategories2,
  getAllElements,
  getElementbyArea,
  getTotalCounterElementByCategory,
  getAuditCounterElements,
  getSettings,
  getFormById,
  getFormsByAuditId,
  getAllErrorByFormId,
  getAllErrorType,
  getCompletedForms,
  getUncompletedForms,
  getLastUncompletedForm,
  getLastCompletedForm,
  getAllPresentClient,
  getAllForms,
  getAuditSignature,
  getAuditDate,
  getErrorsImages,
  getRemarks,
  //inserts
  savePresentClient,
  insertSettings,
  insertPicture,
  clearSettings,
  //updates
  updatePresentClient,
  //deletes
  deleteError,
  deletePresentClient,
  deleteAuditSignature,
  removeAllFromAudit,
  deleteAudit,
  // Upserts
  upsertSignature,
};
