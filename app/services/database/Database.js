import SQLite from 'react-native-sqlite-storage';
import AsyncStorage from '@react-native-async-storage/async-storage';

const database_name = 'fdisq.db';
const database_version = '1.0';
const database_displayname = 'Fdis Quality';
const database_size = 200000;
let db;
let text_selectOption = '-- Selecteer --';

class DataBase {
  constructor() {
    SQLite.enablePromise(false);
    // SQLite.DEBUG(true);
  }

  isOpen = () => db != null;

  open = (successCallback, errorCallback) => {
    db = SQLite.openDatabase(
      database_name,
      database_version,
      database_displayname,
      database_size,
      database => {
        this.executeTransaction(tx => {
          this.populateDB(tx);
        })
          .then(() => {
            return AsyncStorage.getItem('db_version');
          })
          .then(version => {
            console.log(version);
          })
          .catch(error => {
            console.log(error);
          });
      },
      errorCallback,
    );
  };

  close = (successCallback, errorCallback) => {
    db.close(successCallback, errorCallback);
  };

  S4 = () => (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);

  guid = () =>
    this.S4() +
    this.S4() +
    '-' +
    this.S4() +
    '-' +
    this.S4() +
    '-' +
    this.S4() +
    '-' +
    this.S4() +
    this.S4() +
    this.S4();

  getErrorsPending = auditId =>
    this.executeSelect(
      "SELECT * FROM tb_errors_pending WHERE AuditId='" + auditId + "'",
    );

  existUnSaveData = () => {
    const queries = [
      'SELECT * FROM tb_presentclients LIMIT 1',
      'SELECT * FROM tb_form LIMIT 1',
    ];

    return Promise.all(queries.map(this.executeSelect)).then(results => {
      console.log(results);
      return (
        results.length == 2 && results[0].length > 0 && results[1].length > 0
      );
    });
  };

  getAllPresentClient = AuditId =>
    this.executeSelect(
      'SELECT * FROM tb_presentclients WHERE AuditId = "' + AuditId + '"',
    );

  getCategoryById = categoryId =>
    this.executeSelect(
      'SELECT * FROM tb_category WHERE id = "' + categoryId + '"',
    ).then(categories => categories[0]);

  removePendingErrors = (forms, AuditId) => {
    return this.executeTransaction(tx => {
      tx.executeSql(
        'DELETE FROM tb_errors_pending WHERE AuditId = "' + AuditId + '"',
      );
    });
  };

  savePendingErrors = (forms, AuditId) => {
    let countPending = 0;
    return this.executeTransaction(tx => {
      forms.forEach(form => {
        form.Errors.forEach(error => {
          if (error.LogBookSent == 1) {
            countPending++;
            const query =
              'INSERT INTO tb_errors_pending (ErrorId,AuditId,field,ImgType,image) VALUES ( ' +
              error.ErrorId +
              ", '" +
              AuditId +
              "', 'LogBook', '1','" +
              error.LogBookImg +
              "')";
            tx.executeSql(query);
          }

          if (error.TechnicalAspectsSent == 1) {
            countPending++;
            const query =
              'INSERT INTO tb_errors_pending (ErrorId,AuditId,field,ImgType,image) VALUES (' +
              error.ErrorId +
              ", '" +
              AuditId +
              "', 'TechnicalAspects', '2', '" +
              error.TechnicalAspectsImg +
              "')";
            tx.executeSql(query);
          }

          if (error.RemarksSent == 1) {
            countPending++;
            const query =
              'INSERT INTO tb_errors_pending (ErrorId,AuditId,field,ImgType,image) VALUES (' +
              error.ErrorId +
              ", '" +
              AuditId +
              "', 'Remarks', '3', '" +
              error.RemarksImg +
              "')";
            tx.executeSql(query);
          }

          error.LogBookImg = null;
          error.TechnicalAspects = null;
          error.RemarksImg = null;
        });
      });
    }).then(() => countPending);
  };

  getAllForms = AuditId => {
    return this.executeSelect(
      'SELECT * FROM tb_form WHERE AuditId = "' + AuditId + '"',
    )
      .then(results => results.map(this.formForServer))
      .then(forms => {
        return Promise.all(
          forms.map(form => {
            return this.executeSelect(
              'SELECT * FROM tb_error WHERE FormId = "' + form.Id + '"',
            )
              .then(errors =>
                errors.map(error => {
                  return {
                    ElementTypeId: error.ElementTypeId,
                    ErrorTypeId: error.ErrorTypeId,
                    LogBook: error.LogBook == 'undefined' ? '' : error.LogBook,
                    TechnicalAspects:
                      error.TechnicalAspects == 'undefined'
                        ? ''
                        : error.TechnicalAspects,
                    Remark: error.Remarks == 'undefined' ? '' : error.Remarks,
                    Count: error.CountError,
                  };
                }),
              )
              .then(errors => {
                form.Errors = errors;
                return form;
              });
          }),
        );
      });
  };

  getErrorsImages = auditId => {
    return this.executeSelect(
      'SELECT * FROM tb_form WHERE AuditId = "' + auditId + '"',
    )
      .then(forms => {
        return Promise.all(
          forms.map(form => {
            return this.executeSelect(
              'SELECT * FROM tb_error WHERE FormId = "' + form.FormId + '"',
            ).then(errors =>
              errors.map(error => {
                let images = [];
                if (
                  error.LogBookImg != null &&
                  error.LogBookImg != '' &&
                  error.LogBookImg != 'undefined'
                ) {
                  images.push({
                    imageError: {
                      MimeType: 'image/png',
                      Image: error.LogBookImg,
                    },
                    traceImageData: {
                      AuditId: auditId,
                      ElementTypeId: error.ElementTypeId,
                      ErrorTypeId: error.ErrorTypeId,
                      FormId: form.FormId,
                      Field: 'logbook',
                    },
                  });
                }
                if (
                  error.TechnicalAspectsImg != null &&
                  error.TechnicalAspectsImg != '' &&
                  error.TechnicalAspectsImg != 'undefined'
                ) {
                  images.push({
                    imageError: {
                      MimeType: 'image/png',
                      Image: error.TechnicalAspectsImg,
                    },
                    traceImageData: {
                      AuditId: auditId,
                      ElementTypeId: error.ElementTypeId,
                      ErrorTypeId: error.ErrorTypeId,
                      FormId: form.FormId,
                      Field: 'technicalaspects',
                    },
                  });
                }
                return images;
              }),
            );
          }),
        );
      })
      .then(imagesArrays => {
        let a = [];
        imagesArrays.forEach(arrays => {
          arrays.forEach(array => {
            array.forEach(image => {
              a.push(image);
            });
          });
        });
        return a;
      });
  };

  // +'"id" VARCHAR PRIMARY KEY,'
  //         +'"remarkText" TEXT,'
  //         +'"remarkImg" TEXT,'
  //         +'"auditId" INTEGER'

  saveRemark = (remarkText, remarkImg, auditId, remarkId = null) => {
    if (remarkId == null) {
      remarkId = this.guid();
      console.log(remarkText, remarkImg, auditId, remarkId);
      return this.executeTransaction(tx => {
        tx.executeSql(
          'INSERT INTO tb_remarks (id, remarkText, remarkImg, auditId) VALUES ("' +
            remarkId +
            '","' +
            remarkText +
            '","' +
            remarkImg +
            '","' +
            auditId +
            '")',
        );
      });
    } else {
      return this.executeSelect(
        'SELECT * FROM tb_remarks WHERE id = "' + remarkId + '"',
      )
        .then(results => {
          return new Promise((resolve, reject) => {
            if (results.length > 0) {
              resolve(results[0]);
            } else {
              reject();
            }
          });
        })
        .then(remark => {
          return this.executeTransaction(tx => {
            tx.executeSql(
              'UPDATE tb_remarks SET remarkText = "' +
                remarkText +
                '", remarkImg = "' +
                remarkImg +
                '", auditId = "' +
                auditId +
                '" WHERE id = "' +
                remarkId +
                '"',
            );
          });
        });
    }
  };

  getRemarks = auditId =>
    this.executeSelect(
      'SELECT * FROM tb_remarks WHERE auditId = "' + auditId + '"',
    ).then(remarks => {
      return remarks.map(remark => {
        return {
          remarkAndImage: {
            RemarkId: remark.id,
            AuditId: remark.auditId,
            RemarkText: remark.remarkText,
            RemarkImage: {
              MimeType: 'image/png',
              Image: remark.remarkImg,
            },
          },
        };
      });
    });

  addErrorToForm = (forms, form, last, fdisCallBackQuery) => {
    var query = 'SELECT * FROM tb_error WHERE FormId = "' + form.Id + '"';

    form.Errors = [];
    let that = this;

    this.executeSelectQuery(query, results => {
      var len = results.rows.length;

      var error;
      for (var i = 0; i < len; i++) {
        error = results.rows.item(i);
        error = that.errorForServer(error);
        form.Errors.push(error);
      }

      if (last == true) {
        fdisCallBackQuery(forms);
      }
    });
  };

  updatePresentClient = (clientId, newClientName) => {
    return this.executeTransaction(tx => {
      tx.executeSql(
        'UPDATE tb_presentclients SET name="' +
          newClientName +
          '" WHERE id="' +
          clientId +
          '"',
      );
    });
  };

  savePresentClient = (clientName, AuditId) => {
    return this.executeTransaction(tx => {
      tx.executeSql(
        'INSERT INTO tb_presentclients (name, AuditId) VALUES ("' +
          clientName +
          '","' +
          AuditId +
          '")',
      );
    });
  };

  getAreaCategoryByCode = areaValue =>
    this.executeSelect(
      'SELECT * FROM tb_area WHERE Id = "' + areaValue + '"',
    ).then(areas => areas[0]);

  getFloorById = floorId =>
    this.executeSelect(
      'SELECT * FROM tb_floor WHERE id = "' + floorId + '"',
    ).then(floors => floors[0]);

  getElementbyArea = areaId => {
    return this.executeSelect(
      'SELECT * FROM tb_area_element WHERE AreaId = "' + areaId + '"',
    )
      .then(areaElements => {
        let whereclasure = ' WHERE Id = ';
        for (var i = 0; i < areaElements.length; i++) {
          whereclasure += "'" + areaElements[i].element_Id + "'";
          if (i != areaElements.length - 1) {
            whereclasure += ' OR Id = ';
          }
        }
        return this.executeSelect('SELECT * FROM tb_element' + whereclasure);
      })
      .then(elements =>
        elements.sort((a, b) => {
          let x = a.ElementTypeValue.toLowerCase();
          let y = b.ElementTypeValue.toLowerCase();
          return x < y ? -1 : x > y ? 1 : 0;
        }),
      );
  };

  gentAllErrorById = FormId =>
    this.executeSelect(
      'SELECT * FROM tb_error WHERE FormId = "' + FormId + '"',
    );

  deleteError = error => {
    return this.executeTransaction(tx => {
      tx.executeSql(
        'DELETE FROM tb_error WHERE ErrorId = "' + error.ErrorId + '"',
      );
    });
  };

  getErrorById = errorId =>
    this.executeSelect('SELECT * FROM tb_error WHERE ErrorId=' + errorId).then(
      results => results[0],
    );

  deletePresentClient = clientId => {
    return this.executeTransaction(tx => {
      tx.executeSql(
        'DELETE FROM tb_presentclients WHERE id = "' + clientId + '"',
      );
    });
  };

  updateErrorUpdateStatus = (errorId, imgType, value) => {
    var query = '';
    if (imgType == 1)
      query =
        'UPDATE tb_error SET LogBookSent = "' +
        value +
        '"' +
        ' WHERE ErrorId = "' +
        errorId +
        '"';
    else
      query =
        'UPDATE tb_error SET TechnicalAspectsSent = "' +
        value +
        '"' +
        ' WHERE ErrorId = "' +
        errorId +
        '"';

    return this.executeTransaction(tx => {
      tx.executeSql(query);
    });
  };

  updateError = async (error, FormId) => {
    if (error.ErrorId == null) error.ErrorId = -1;
    if (error.LogBookImg == null) error.LogBookImg = '';
    if (error.RemarksImg == null) error.RemarksImg = '';
    if (error.TechnicalAspectsImg == null) error.TechnicalAspectsImg = '';

    const results = await this.executeSelect(
      'SELECT * FROM tb_error WHERE ErrorId=' + error.ErrorId);
    let logbooksent = error.LogBookImg != null && error.LogBookImg.length > 0 ? 1 : 0;
    let techniaclAspectsent = error.TechnicalAspectsImg != null &&
      error.TechnicalAspectsImg.length > 0
      ? 1
      : 0;
    let remarksSent = error.RemarksImg != null && error.RemarksImg.length > 0 ? 1 : 0;
    let query_1 = '';
    if (results.length > 0) {
      query_1 =
        'UPDATE tb_error SET ElementTypeId = "' +
        error.ElementTypeId +
        '"' +
        ', ErrorTypeId = "' +
        error.ErrorTypeId +
        '"' +
        ', LogBook = "' +
        error.LogBook +
        '"' +
        ', LogBookImg = "' +
        error.LogBookImg +
        '"' +
        ', TechnicalAspects = "' +
        error.TechnicalAspects +
        '"' +
        ', TechnicalAspectsImg = "' +
        error.TechnicalAspectsImg +
        '"' +
        ', FormId = "' +
        FormId +
        '"' +
        ', ElementTypeText = "' +
        error.ElementTypeText +
        '"' +
        ', CountError = "' +
        error.CountError +
        '"' +
        ', LogBookSent="' +
        logbooksent +
        '"' +
        ', TechnicalAspectsSent = "' +
        techniaclAspectsent +
        '"' +
        ', Remarks="' +
        error.Remarks +
        '"' +
        ', RemarksImg="' +
        error.RemarksImg +
        '"' +
        ', RemarksSent="' +
        remarksSent +
        '"' +
        ' WHERE  ErrorId = "' +
        error.ErrorId +
        '"';
    } else {
      query_1 =
        'INSERT INTO tb_error (ElementTypeId,ErrorTypeId,LogBook,LogBookImg,TechnicalAspects,TechnicalAspectsImg,FormId, ElementTypeText, ErrorTypeText, CountError,LogBookSent,TechnicalAspectsSent, Remarks, RemarksImg, RemarksSent) VALUES ("' +
        error.ElementTypeId +
        '","' +
        error.ErrorTypeId +
        '","' +
        error.LogBook +
        '","' +
        error.LogBookImg +
        '","' +
        error.TechnicalAspects +
        '","' +
        error.TechnicalAspectsImg +
        '","' +
        FormId +
        '","' +
        error.ElementTypeText +
        '","' +
        error.ErrorTypeText +
        '","' +
        error.CountError +
        '","' +
        logbooksent +
        '","' +
        techniaclAspectsent +
        '","' +
        error.Remarks +
        '","' +
        error.RemarksImg +
        '","' +
        remarksSent +
        '")';
    }
    return await this.executeTransaction(tx => {
      tx.executeSql(query_1);
    });
  };

  getAllErrorType = () =>
    this.executeSelect('SELECT * FROM tb_errortype ORDER BY ErrorTypeValue');

  getUserCredentials(fdisCallBackQuery) {
    this.executeSelectQuery('SELECT * FROM tb_user', results => {
      var len = results.rows.length;
      if (len > 0) {
        fdisCallBackQuery({
          username: results.rows.item(0).Username,
          password: results.rows.item(0).Password,
          domain: results.rows.item(0).Domain,
        });
      } else {
        fdisCallBackQuery(null);
      }
    });
  }

  updateAuditDate = (AuditId, datetime) => {
    this.getAllAny(
      'SELECT * FROM tb_audits WHERE AuditCode = "' + AuditId + '"',
      function (result) {
        if (result.length != 0) {
          var query =
            'UPDATE tb_audits SET DateTime = "' +
            datetime +
            '"' +
            ' WHERE Id = "' +
            result[0].Id +
            '"';
          this.executeDeleteQuery(query, function (results) {});
        }
      },
    );
  };

  removeErrorFromFormId = FormId => {
    var query = 'DELETE FROM tb_error WHERE FormId = "' + FormId + '"';
    this.executeDeleteQuery(query, function (results) {});
  };

  removeAllFromAudit = AuditId => {
    return this.executeTransaction(tx => {
      tx.executeSql(
        'DELETE FROM tb_presentclients WHERE AuditId = "' + AuditId + '"',
      );
      tx.executeSql('DELETE FROM tb_remarks WHERE auditId = "' + AuditId + '"');
    })
      .then(() =>
        this.executeSelect(
          'SELECT * FROM tb_form WHERE AuditId = "' + AuditId + '"',
        ),
      )
      .then(forms => {
        return this.executeTransaction(tx => {
          forms.forEach(form => {
            tx.executeSql(
              'DELETE FROM tb_error WHERE FormId = "' + form.FormId + '"',
            );
          });
        });
      })
      .then(() => {
        return this.executeTransaction(tx => {
          tx.executeSql(
            'DELETE FROM tb_form WHERE AuditId = "' + AuditId + '"',
          );
          tx.executeSql(
            'DELETE FROM tb_audits WHERE AuditCode = "' + AuditId + '"',
          );
        });
      });
  };

  saveForm = (form, errors = []) => {
    let query = '';
    let _guid = form.FormId;

    if (form.AreaNumber == 0 || form.AreaNumber == null) form.AreaNumber = 0;
    if (form.Completed == null) form.Completed = 0;
    if (form.Remarks == null) form.Remarks = '';

    if (_guid == null) {
      _guid = this.guid();
      query =
        'INSERT INTO tb_form (FloorId, CategoryId, Date, AreaCode, CounterElements,AuditId, AreaNumber, Remarks, FormId, Completed) VALUES ("' +
        form.FloorId +
        '","' +
        form.CategoryId +
        '","' +
        form.Date +
        '","' +
        form.AreaCode +
        '","' +
        form.CounterElements +
        '","' +
        form.AuditId +
        '","' +
        form.AreaNumber +
        '","' +
        form.Remarks +
        '","' +
        _guid +
        '","' +
        form.Completed +
        '")';
    } else {
      query =
        'UPDATE tb_form SET FloorId = "' +
        form.FloorId +
        '"' +
        ', CategoryId = "' +
        form.CategoryId +
        '"' +
        ', Date = "' +
        form.Date +
        '"' +
        ', AreaCode = "' +
        form.AreaCode +
        '"' +
        ', CounterElements = "' +
        form.CounterElements +
        '"' +
        ', AuditId = "' +
        form.AuditId +
        '"' +
        ', AreaNumber = "' +
        form.AreaNumber +
        '"' +
        ', Remarks = "' +
        form.Remarks +
        '"' +
        ', Completed = "' +
        form.Completed +
        '" WHERE  FormId = "' +
        _guid +
        '"';
    }

    return this.executeTransaction(tx => {
      tx.executeSql(query);
    })
      .then(() =>
        this.executeSelect(
          'SELECT * FROM tb_audits WHERE Id = "' + form.AuditId + '"',
        ),
      )
      .then(results => results[0])
      .then(result => {
        return this.executeTransaction(tx => {
          tx.executeSql(
            'UPDATE tb_audits SET DateTime = "' +
              new Date() +
              '"' +
              ' WHERE Id = "' +
              result.Id +
              '"',
          );
          if (errors.length > 0) {
            tx.executeSql(
              'DELETE FROM tb_error WHERE FormId = "' + _guid + '"',
            );
            errors.forEach(error => {
              let errorQuery =
                'INSERT INTO tb_error (ElementTypeId,ErrorTypeId,LogBook,LogBookImg,TechnicalAspects,TechnicalAspectsImg,FormId, ElementTypeText, ErrorTypeText, CountError,LogBookSent,TechnicalAspectsSent) VALUES ("' +
                error.ElementTypeId +
                '","' +
                error.ErrorTypeId +
                '","' +
                error.LogBook +
                '","' +
                error.LogBookImg +
                '","' +
                error.TechnicalAspects +
                '","' +
                error.TechnicalAspectsImg +
                '","' +
                _guid +
                '","' +
                error.ElementTypeText +
                '","' +
                error.ErrorTypeText +
                '","' +
                error.CountError +
                '","' +
                logbooksent +
                '","' +
                techniaclAspectsent +
                '")';
              tx.executeSql(errorQuery);
            });
          }
        });
      })
      .then(() => this.getFormById(_guid));
  };

  saveFormsErrors = (form, errors, fdisCallBackQuery) => {
    let that = this;
    var FormId = form.FormId;
    if (FormId == null) {
      that.existFormWith(
        form.CategoryId,
        form.FloorId,
        form.AuditId,
        form.AreaCode,
        form.AreaNumber,
        function (obj) {
          if (obj != false)
            that.saveAllError(obj.FormId, errors, fdisCallBackQuery);
        },
      );
    } else {
      that.saveAllError(FormId, errors, fdisCallBackQuery);
    }
  };

  saveAllError = (FormId, errors, fdisCallBackQuery) => {
    var query = 'DELETE FROM tb_error WHERE FormId = "' + FormId + '"';

    this.executeDeleteQuery(query, function (results) {
      var last = 0;
      for (var i = 0; i < errors.length; i++) {
        var logbooksent =
          errors[i].LogBookImg != null && errors[i].LogBookImg.length > 0
            ? 1
            : 0;
        var techniaclAspectsent =
          errors[i].TechnicalAspectsImg != null &&
          errors[i].TechnicalAspectsImg.length > 0
            ? 1
            : 0;

        var query =
          'INSERT INTO tb_error (ElementTypeId,ErrorTypeId,LogBook,LogBookImg,TechnicalAspects,TechnicalAspectsImg,FormId, ElementTypeText, ErrorTypeText, CountError,LogBookSent,TechnicalAspectsSent) VALUES ("' +
          errors[i].ElementTypeId +
          '","' +
          errors[i].ErrorTypeId +
          '","' +
          errors[i].LogBook +
          '","' +
          errors[i].LogBookImg +
          '","' +
          errors[i].TechnicalAspects +
          '","' +
          errors[i].TechnicalAspectsImg +
          '","' +
          FormId +
          '","' +
          errors[i].ElementTypeText +
          '","' +
          errors[i].ErrorTypeText +
          '","' +
          errors[i].CountError +
          '","' +
          logbooksent +
          '","' +
          techniaclAspectsent +
          '")';

        this.executeDeleteQuery(query, function (results) {
          // alert(FormId);
          last++;
          if (last == errors.length) {
            /* fdisCallBackQuery();*/
          }
        });
      }
      fdisCallBackQuery();
    });
  };

  existFormWith = (CategoryId, FloorId, AuditId, AreaCode, AreaNumber) => {
    return this.executeSelect('SELECT * FROM tb_form')
      .then(results => {
        return results.filter(result => {
          return (
            result.CategoryId == CategoryId &&
            result.FloorId == FloorId &&
            result.AuditId == AuditId &&
            result.AreaCode == AreaCode &&
            result.AreaNumber == AreaNumber
          );
        });
      })
      .then(results => results[0]);
  };

  getFormById = formId => {
    return this.executeSelect(
      'SELECT * FROM tb_form WHERE FormId="' + formId + '"',
    ).then(forms => forms[0]);
  };

  getFormsByAuditId = auditId => {
    return this.executeSelect(
      'SELECT * FROM tb_form WHERE AuditId="' + auditId + '"',
    );
  };

  getCompletedForms = auditId => {
    return this.getFormsByAuditId(auditId).then(forms =>
      forms.filter(form => form.Completed == 1),
    );
  };

  getUncompletedForms = auditId => {
    return this.getFormsByAuditId(auditId).then(forms =>
      forms.filter(form => form.Completed == 0),
    );
  };

  getLastUncompletedForm = auditId => {
    return this.getUncompletedForms(auditId).then(
      forms => forms[forms.length - 1],
    );
  };

  getLastCompletedForm = auditId => {
    return this.getCompletedForms(auditId).then(
      forms => forms[forms.length - 1],
    );
  };

  getAllFloorsSorted = () =>
    this.executeSelect('SELECT * FROM tb_floor').then(floors =>
      this.sortFloor(floors),
    );

  sortFloor = arrayObj => {
    for (let i = 1; i < arrayObj.length - 1; i++) {
      for (let j = i + 1; j < arrayObj.length; j++) {
        if (
          !this.LessThan(
            arrayObj[i].FloorValue.toLowerCase(),
            arrayObj[j].FloorValue.toLowerCase(),
          )
        ) {
          let temp = arrayObj[i];
          arrayObj[i] = arrayObj[j];
          arrayObj[j] = temp;
        }
      }
    }
    return arrayObj;
  };

  getCategoriesByClient = clientName => {
    let query =
      'SELECT * FROM tb_client_category WHERE NameClient = "' +
      clientName +
      '"';
    let whereclasure = ' WHERE Id = ';
    return this.executeSelect(query).then(results => {
      for (let i = 0; i < results.length; i++) {
        whereclasure += "'" + results[i].Category_Id + "'";
        if (i != results.length - 1) whereclasure += ' OR Id = ';
      }
      return this.executeSelect(
        'SELECT * FROM tb_category' + whereclasure + ' ORDER BY CategoryValue',
      );
    });
  };

  getCategoriesByClientSorted = clientName => {
    return this.getCategoriesByClient(clientName);
    // .then(categories => this.sortCategories(categories));
  };

  insertAuditSignature = (auditCode, signature) => {
    return this.executeTransaction(tx => {
      tx.executeSql(
        'INSERT INTO tb_audit_signature (AuditCode,Signature) VALUES ("' +
          auditCode +
          '", "' +
          signature +
          '")',
      );
    });
  };

  saveAuditSignature = (auditCode, signature) => {
    return this.getAuditSignature(auditCode).then(oldSignature =>
      oldSignature == null
        ? this.insertAuditSignature(auditCode, signature)
        : this.updateAuditSignature(auditCode, signature),
    );
  };

  updateAuditSignature = (auditCode, signature) => {
    return this.executeTransaction(tx => {
      tx.executeSql(
        'UPDATE tb_audit_signature SET signature="' +
          signature +
          '"' +
          ' WHERE auditCode="' +
          auditCode +
          '"',
      );
    });
  };

  getAuditSignature = auditCode => {
    return this.executeSelect(
      'SELECT * FROM tb_audit_signature WHERE AuditCode = "' + auditCode + '"',
    ).then(results => (results[0] != null ? results[0].Signature : null));
  };

  getAuditDate = AuditId => {
    return this.executeSelect(
      'SELECT * FROM tb_audits WHERE Id = "' + AuditId + '"',
    ).then(result => result[0].DateTime);
  };

  deleteAuditSignature = AuditCode => {
    return this.executeTransaction(tx => {
      tx.executeSql(
        'DELETE FROM tb_audit_signature WHERE AuditCode = "' + AuditCode + '"',
      );
    });
  };

  setKpiElementValue = (auditElementId, value) => {
    return this.executeTransaction(tx => {
      tx.executeSql(
        'UPDATE tb_elements_audit SET ElementValue="' +
          value +
          '",ElementComment=""' +
          ' WHERE elements_auditId="' +
          auditElementId +
          '"',
      );
    });
  };

  setKpiElementComment = (idElement, comment) => {
    return this.executeTransaction(tx => {
      tx.executeSql(
        'UPDATE tb_elements_audit SET ElementComment="' +
          comment +
          '"' +
          ' WHERE Id="' +
          idElement +
          '"',
      );
    });
  };

  deleteAudit = auditId => {
    return this.executeTransaction(tx => {
      tx.executeSql('DELETE FROM tb_audits WHERE Id="' + auditId + '"');
    });
  };

  getAuditById = AuditId =>
    this.executeSelect(
      'SELECT * FROM tb_audits WHERE Id = "' + AuditId + '"',
    ).then(results => results[0]);

  getTotalCounterElementByCategory = (NameClient, LocationSize) => {
    const minNumber =
      249 < LocationSize && LocationSize <= 499
        ? 2
        : LocationSize > 499
        ? 3
        : 1;
    const query =
      'SELECT tb_category.CategoryValue, tb_category.Id, tb_category.Min' +
      minNumber +
      ' AS Min FROM tb_category INNER JOIN tb_client_category ON(tb_category.Id = tb_client_category.Category_Id) WHERE tb_client_category.NameClient="' +
      NameClient +
      '"';
    return this.executeSelect(query);
  };

  getAuditCounterElements = AuditId =>
    this.executeSelect(
      'SELECT AuditId, CategoryId, SUM(CounterElements)AS CounterElements FROM tb_form WHERE AuditId="' +
        AuditId +
        '" GROUP BY CategoryId',
    );

  getAllElements = auditId =>
    this.executeSelect(
      'SELECT * FROM tb_elements_audit WHERE AuditId = "' + auditId + '"',
    );

  getAuditsOfClient = NameClient =>
    this.executeSelect(
      'SELECT * FROM tb_audits WHERE NameClient = "' + NameClient + '"',
    );

  changeCLientName = (auditId, clientName) => {
    return this.executeTransaction(tx => {
      tx.executeSql(
        'UPDATE tb_audits SET NameClient="' +
          clientName +
          '" WHERE Id="' +
          auditId +
          '"',
      );
    });
  };

  getSettings = () => {
    return this.executeSelect('SELECT * FROM settings_data').then(settings =>
      settings.length > 0 ? settings[0] : null,
    );
  };

  dropAuditsForms = fdisCallBackQuery => {
    this.executeDeleteQuery(
      'DROP TABLE IF EXISTS Version',
      function (results) {},
    );
    this.executeDeleteQuery(
      'DROP TABLE IF EXISTS tb_form',
      function (results) {},
    );
    this.executeDeleteQuery(
      'DROP TABLE IF EXISTS tb_form_last',
      function (results) {},
    );
    this.executeDeleteQuery(
      'DROP TABLE IF EXISTS tb_error',
      function (results) {},
    );
    this.executeDeleteQuery(
      'DROP TABLE IF EXISTS tb_errortype',
      function (results) {},
    );
    this.executeDeleteQuery(
      'DROP TABLE IF EXISTS tb_audits',
      function (results) {},
    );
    this.executeDeleteQuery(
      'DROP TABLE IF EXISTS tb_element',
      function (results) {},
    );
    this.executeDeleteQuery(
      'DROP TABLE IF EXISTS tb_category',
      function (results) {},
    );
    this.executeDeleteQuery(
      'DROP TABLE IF EXISTS tb_area',
      function (results) {},
    );
    this.executeDeleteQuery(
      'DROP TABLE IF EXISTS tb_presentclients',
      function (results) {},
    );
    this.executeDeleteQuery(
      'DROP TABLE IF EXISTS tb_elements_audit',
      function (results) {},
    );
    this.executeDeleteQuery(
      'DROP TABLE IF EXISTS tb_elements_status',
      function (results) {},
    );
    this.executeDeleteQuery(
      'DROP TABLE IF EXISTS tb_audit_category',
      function (results) {},
    );
    this.executeDeleteQuery(
      'DROP TABLE IF EXISTS tb_client_category',
      function (results) {},
    );
    this.executeDeleteQuery(
      'DROP TABLE IF EXISTS tb_area_category',
      function (results) {},
    );
    this.executeDeleteQuery(
      'DROP TABLE IF EXISTS tb_audit_signature',
      function (results) {},
    );
    this.executeDeleteQuery(
      'DROP TABLE IF EXISTS tb_floor',
      function (results) {},
    );
    this.executeDeleteQuery(
      'DROP TABLE IF EXISTS settings_data',
      function (results) {},
    );
    this.executeDeleteQuery(
      'DROP TABLE IF EXISTS tb_errors_pending',
      function (results) {},
    );
    this.executeDeleteQuery(
      'DROP TABLE IF EXISTS tb_area_element',
      function (results) {},
    );
    this.executeDeleteQuery(
      'DROP TABLE IF EXISTS tb_user',
      function (results) {},
    );

    fdisCallBackQuery();
  };

  executeDeleteQuery = (query, fdisCallBackQuery) => {
    if (!db)
      db = SQLite.openDatabase(
        database_name,
        database_version,
        database_displayname,
        database_size,
        this.openCB,
        this.errorCB,
      );
    db.transaction(tx => {
      tx.executeSql(
        query,
        [],
        tx => {
          fdisCallBackQuery();
        },
        this.errorCB,
      );
    }, this.errorCB);
  };

  executeInsertQuery = (query, success) => {
    if (!db)
      db = SQLite.openDatabase(
        database_name,
        database_version,
        database_displayname,
        database_size,
        this.openCB,
        this.errorCB,
      );
    db.transaction(
      tx => {
        tx.executeSql(query);
      },
      this.errorCB,
      () => {
        console.log('Item inserted');
        success();
      },
    );
  };

  executeTransaction = transaction => {
    return new Promise((resolve, reject) => {
      db.transaction(
        transaction,
        error => {
          reject(error);
        },
        () => {
          resolve();
        },
      );
    });
  };

  executeSelect = query => {
    return new Promise((resolve, reject) => {
      db.executeSql(
        query,
        [],
        results => {
          resolve(results.rows.raw());
        },
        error => {
          reject(error);
        },
      );
    });
  };

  saveAllData = response => {
    return this.executeTransaction(tx => {
      tx.executeSql('DELETE FROM tb_error');
      tx.executeSql('DELETE FROM tb_form');
      tx.executeSql('DELETE FROM tb_remarks');
      this.saveFloors(tx, response.floors);
      this.saveAreas(tx, response.areas);
      this.saveCategories(tx, response.categories);
      this.saveElements(tx, response.elements);
      this.saveAudits(tx, response.data);
      this.saveElementsStatus(tx, response.elementsStatus);
      this.saveClientsCategories(tx, response.clients);
      this.saveErrors(tx, response.errors);
    });
  };

  saveFloors = (tx, floors) => {
    tx.executeSql('DELETE FROM tb_floor');
    floors.forEach(floor => {
      tx.executeSql(
        'INSERT INTO tb_floor (Id, FloorValue) VALUES ("' +
          floor.Id +
          '", "' +
          floor.FloorValue +
          '")',
      );
    });
  };

  saveAreas = (tx, areas) => {
    tx.executeSql('DELETE FROM tb_area');
    tx.executeSql('DELETE FROM tb_area_element');
    areas.forEach(area => {
      tx.executeSql(
        'INSERT INTO tb_area (Id, AreaValue) VALUES ("' +
          area.Abbreviation +
          '", "' +
          area.Name +
          '")',
      );
      if (area.Elements) {
        let elementsQuery =
          'INSERT INTO tb_area_element (AreaId, element_Id) SELECT ';
        for (let j = 0; j < area.Elements.length; j++) {
          if (j == 0) {
            elementsQuery +=
              "'" + area.Abbreviation + "', '" + area.Elements[j] + "'";
          } else {
            elementsQuery +=
              " UNION SELECT '" +
              area.Abbreviation +
              "'" +
              ", '" +
              area.Elements[j] +
              "'";
          }
        }
        tx.executeSql(elementsQuery, []);
      }
    });
  };

  saveCategories = (tx, categories) => {
    tx.executeSql('DELETE FROM tb_category');
    tx.executeSql('DELETE FROM tb_area_category');
    categories.forEach(category => {
      tx.executeSql(
        'INSERT INTO tb_category (Id, CategoryValue, Min1, Min2, Min3) VALUES ("' +
          category.Id +
          '", "' +
          category.CategoryValue +
          '", "' +
          category.MinimalElements[0] +
          '", "' +
          category.MinimalElements[1] +
          '", "' +
          category.MinimalElements[2] +
          '")',
      );

      if (category.Areas) {
        category.Areas.forEach(area => {
          const categoryAreaQuery =
            'INSERT INTO tb_area_category (AreaId, Category_Id) VALUES ("' +
            area +
            '", "' +
            category.Id +
            '")';
          tx.executeSql(categoryAreaQuery);
        });
      }
    });
  };

  saveElements = (tx, elements) => {
    tx.executeSql('DELETE FROM tb_element');
    elements.forEach(element => {
      tx.executeSql(
        'INSERT INTO tb_element (Id, ElementTypeValue) VALUES ("' +
          element.Id +
          '", "' +
          element.ElementTypeValue +
          '")',
      );
    });
  };

  saveAudits = (tx, audits) => {
    tx.executeSql('DELETE FROM tb_audits');
    tx.executeSql('DELETE FROM tb_elements_audit');
    audits.forEach(audit => {
      tx.executeSql(
        'INSERT INTO tb_audits (Id,AuditCode,Type,DateTime,NameClient,LocationClient,isUnSaved,LocationSize) VALUES ("' +
          audit.Id +
          '", "' +
          audit.AuditCode +
          '", "' +
          audit.Type +
          '", "' +
          audit.DateTime +
          '", "' +
          audit.NameClient +
          '", "' +
          audit.LocationClient +
          '", "' +
          audit.isUnSaved +
          '", "' +
          audit.LocationSize +
          '" )',
      );
      audit.Elements.forEach(kpiElement => {
        tx.executeSql(
          'INSERT INTO tb_elements_audit (Id, ElementLabel, ElementValue, AuditId, ElementComment) VALUES ("' +
            kpiElement.Id +
            '", "' +
            kpiElement.ElementLabel +
            '", "' +
            kpiElement.ElementValue +
            '", "' +
            audit.Id +
            '", "' +
            (kpiElement.ElementComment != null
              ? kpiElement.ElementComment
              : '') +
            '" )',
        );
      });
    });
  };

  saveElementsAudit = (tx, auditId, elements) => {
    elements.forEach(auditElement => {
      tx.executeSql(
        'INSERT INTO tb_elements_audit (Id, ElementLabel, ElementValue, AuditId, ElementComment) VALUES ("' +
          auditElement.Id +
          '", "' +
          auditElement.ElementLabel +
          '", "' +
          auditElement.ElementValue +
          '", "' +
          auditId +
          '", "' +
          (auditElement.ElementComment != null
            ? auditElement.ElementComment
            : '') +
          '" )',
      );
    });
  };

  saveElementsStatus = (tx, elementsStatus) => {
    tx.executeSql('DELETE FROM tb_elements_status');
    elementsStatus.forEach(elementStatus => {
      tx.executeSql(
        'INSERT INTO tb_elements_status (Id, ElementStatusValueCode, SortOrder) VALUES ("' +
          elementStatus.Id +
          '", "' +
          elementStatus.ElementStatusValueCode +
          '", ' +
          elementStatus.SortOrder +
          ')',
      );
    });
  };

  saveClientsCategories = (tx, clients) => {
    tx.executeSql('DELETE FROM tb_client_category');
    clients.forEach(client => {
      client.Categories.forEach(clientCategory => {
        tx.executeSql(
          'INSERT INTO tb_client_category (NameClient,Category_Id) VALUES ("' +
            client.Name +
            '", "' +
            clientCategory +
            '")',
        );
      });
    });
  };

  saveErrors = (tx, errors) => {
    tx.executeSql('DELETE FROM tb_errortype');
    errors.forEach(error => {
      tx.executeSql(
        'INSERT INTO tb_errortype (Id,ErrorTypeValue) VALUES ("' +
          error.Id +
          '", "' +
          error.ErrorTypeValue +
          '")',
        [],
      );
    });
  };

  getAreasbyCategories = (CategoryId, fdisCallBackQuery) => {
    let that = this;

    var query =
      'SELECT * FROM tb_area_category WHERE Category_Id = "' + CategoryId + '"';
    var end = false;
    var arrayObj = [
      {
        text: text_selectOption,
        value: null,
      },
    ];

    that.executeSelectQuery(query, function (results) {
      var len = results.rows.length;

      for (var i = 0; i < len; i++) {
        var query1 =
          'SELECT * FROM tb_area WHERE Id = "' +
          results.rows.item(i).AreaId +
          '"';
        that.executeSelectQuery(query1, function (results1) {
          var len1 = results1.rows.length;
          for (var j = 0; j < len1; j++) {
            arrayObj.push({
              text: results1.rows.item(j).AreaValue,
              value: results1.rows.item(j).Id,
            });
          }
          //fdisCallBackQuery(arrayObj);
        });
      }
    });

    return arrayObj;
  };

  getAreasbyCategories2 = CategoryId =>
    this.executeSelect(
      'SELECT tb_area.Id, tb_area.AreaValue FROM tb_area INNER JOIN tb_area_category ON (tb_area.Id=tb_area_category.AreaId) WHERE tb_area_category.Category_Id="' +
        CategoryId +
        '" ORDER BY tb_area.AreaValue',
    );

  updateUnSavedAudit = AuditId => {
    return this.executeTransaction(tx => {
      tx.executeSql(
        'UPDATE tb_audits SET isUnSaved = "*" WHERE Id = "' + AuditId + '"',
      );
    });
  };

  setAuditUnsaved = (auditId, unsaved) => {
    const isUnSaved = unsaved ? '*' : '';
    return this.executeTransaction(tx => {
      tx.executeSql(
        'UPDATE tb_audits SET isUnSaved = "' +
          isUnSaved +
          '" WHERE Id = "' +
          auditId +
          '"',
      );
    });
  };

  insertPicture = image => {
    return this.getSettings().then(settings => {
      return this.executeTransaction(tx => {
        let query =
          'UPDATE settings_data SET auditExecuted = "' +
          settings.auditExecuted +
          '"' +
          ',lastClient = "' +
          settings.lastClient +
          '"' +
          ',lastLocationVisited = "' +
          settings.lastLocationVisited +
          '"' +
          ',picture = "' +
          image +
          '"' +
          ' WHERE Id = "' +
          settings.Id +
          '"';
        tx.executeSql(query);
      });
    });
  };

  insertSettings = (auditExecuted, lastClient, lastLocationVisited) => {
    return this.getSettings().then(settings => {
      return this.executeTransaction(tx => {
        if (settings == null) {
          tx.executeSql(
            'INSERT INTO settings_data (auditExecuted, lastClient, lastLocationVisited) VALUES ("' +
              auditExecuted +
              '", "' +
              lastClient +
              '", "' +
              lastLocationVisited +
              '")',
          );
        } else {
          let query =
            'UPDATE settings_data SET auditExecuted = "' +
            auditExecuted +
            '"' +
            ',lastClient = "' +
            lastClient +
            '"' +
            ',lastLocationVisited = "' +
            lastLocationVisited +
            '"' +
            ',picture = "' +
            settings.picture +
            '"' +
            ' WHERE Id = "' +
            settings.Id +
            '"';
          tx.executeSql(query);
        }
      });
    });
  };

  clearSettings = () => {
    return this.executeTransaction(tx => {
      tx.executeSql('DELETE FROM settings_data');
    });
  };

  saveLogedUser = (user, password, fdisCallBackQuery) => {
    const query =
      'INSERT INTO tb_user (Username, Password, Domain) VALUES ("' +
      user +
      '", "' +
      password +
      '","dominiox")';
    this.executeInsertQuery(query, results => {
      fdisCallBackQuery();
    });
  };

  getClients = () =>
    this.executeSelect('SELECT * FROM tb_audits GROUP BY NameClient');

  populateDB = tx => {
    tx.executeSql(
      'CREATE TABLE IF NOT EXISTS tb_client_category (' +
        'Id INTEGER PRIMARY KEY AUTOINCREMENT,' +
        'NameClient VARCHAR(20),' +
        'Category_Id VARCHAR(20),' +
        'Min1 VARCHAR(20),' +
        'Min2 VARCHAR(20),' +
        'Min3 VARCHAR(20)' +
        ');',
    );

    tx.executeSql(
      'CREATE TABLE IF NOT EXISTS tb_category (' +
        'Id VARCHAR(20) PRIMARY KEY NOT NULL ,' +
        'CategoryValue VARCHAR(20),' +
        'Min1 VARCHAR(20),' +
        'Min2 VARCHAR(20), ' +
        'Min3 VARCHAR(20)' +
        ');',
    );

    tx.executeSql(
      'CREATE TABLE IF NOT EXISTS tb_user (' +
        'Username VARCHAR(20) PRIMARY KEY NOT NULL,' +
        'Password VARCHAR(20),' +
        'Domain VARCHAR(20)' +
        ');',
    );

    tx.executeSql(
      'CREATE TABLE IF NOT EXISTS tb_audits( ' +
        'Id VARCHAR(20) PRIMARY KEY NOT NULL, ' +
        'AuditCode VARCHAR(20), ' +
        'Type VARCHAR(20),' +
        'DateTime DATETIME, ' +
        'NameClient VARCHAR(20), ' +
        'LocationClient VARCHAR(20), ' +
        'isUnSaved VARCHAR(4),' +
        'LocationSize VARCHAR(20)' +
        ');',
    );

    tx.executeSql(
      'CREATE TABLE IF NOT EXISTS settings_data (' +
        'Id INTEGER PRIMARY KEY  AUTOINCREMENT, ' +
        'auditExecuted VARCHAR(20), ' +
        'lastClient VARCHAR(20), ' +
        'lastLocationVisited VARCHAR(20),' +
        'picture VARCHAR' +
        ');',
    );

    tx.executeSql(
      'CREATE TABLE IF NOT EXISTS tb_elements_audit (' +
        'elements_auditId INTEGER PRIMARY KEY AUTOINCREMENT,' +
        'Id VARCHAR,' +
        'ElementLabel VARCHAR,' +
        'ElementValue VARCHAR,' +
        'AuditId VARCHAR,' +
        'ElementComment TEXT' +
        ');',
    );

    tx.executeSql(
      'CREATE TABLE IF NOT EXISTS tb_audit_signature (' +
        'Id INTEGER PRIMARY KEY AUTOINCREMENT ,' +
        'AuditCode VARCHAR,' +
        'Signature VARCHAR' +
        ');',
    );

    tx.executeSql(
      'CREATE TABLE IF NOT EXISTS tb_floor (' +
        'Id VARCHAR PRIMARY KEY  NOT NULL , ' +
        'FloorValue VARCHAR NOT NULL DEFAULT "bgg"' +
        ');',
    );

    tx.executeSql(
      'CREATE TABLE IF NOT EXISTS tb_area_element (' +
        'Id INTEGER PRIMARY KEY  AUTOINCREMENT , ' +
        'AreaId VARCHAR,' +
        'element_Id VARCHAR' +
        ');',
    );

    tx.executeSql(
      'CREATE TABLE IF NOT EXISTS tb_area (' +
        '"Id" VARCHAR PRIMARY KEY NOT NULL,' +
        '"Category_Id" VARCHAR ,' +
        '"AreaValue" VARCHAR' +
        ');',
    );

    tx.executeSql(
      'CREATE TABLE IF NOT EXISTS tb_area_category (' +
        '"Id" INTEGER PRIMARY KEY  AUTOINCREMENT ,' +
        '"AreaId" VARCHAR,' +
        '"Category_Id" VARCHAR' +
        ');',
    );

    tx.executeSql(
      'CREATE TABLE IF NOT EXISTS tb_element (' +
        '"Id" VARCHAR PRIMARY KEY NOT NULL ,' +
        '"ElementTypeValue" VARCHAR' +
        ');',
    );

    tx.executeSql(
      'CREATE TABLE IF NOT EXISTS tb_form (' +
        '"FormId" VARCHAR PRIMARY KEY NOT NULL,' +
        '"FloorId" VARCHAR,' +
        '"CategoryId" VARCHAR,' +
        '"Date" DATETIME,' +
        '"AreaCode" VARCHAR,' +
        '"CounterElements" VARCHAR,' +
        '"AuditId" VARCHAR,' +
        '"AreaNumber" VARCHAR,' +
        '"Remarks" VARCHAR,' +
        '"Completed" INTEGER' +
        ');',
    );

    tx.executeSql(
      'CREATE TABLE IF NOT EXISTS tb_form_last (' +
        '"FormId" VARCHAR PRIMARY KEY NOT NULL,' +
        '"Client" VARCHAR,' +
        '"AuditId" VARCHAR,' +
        '"Category" VARCHAR,' +
        '"Floor" VARCHAR,' +
        '"AreaCode" VARCHAR,' +
        '"AreaNumber" VARCHAR,' +
        '"CounterElements" VARCHAR' +
        ');',
    );

    tx.executeSql(
      'CREATE TABLE IF NOT EXISTS tb_elements_status (' +
        '"Id" VARCHAR PRIMARY KEY  NOT NULL ,' +
        '"ElementStatusValueCode" VARCHAR,' +
        '"SortOrder" INTEGER' +
        ');',
    );

    tx.executeSql(
      'CREATE TABLE IF NOT EXISTS tb_errortype (' +
        '"Id" VARCHAR PRIMARY KEY  NOT NULL ,' +
        '"ErrorTypeValue" VARCHAR' +
        ');',
    );

    tx.executeSql(
      'CREATE TABLE IF NOT EXISTS tb_error (' +
        '"ErrorId" INTEGER PRIMARY KEY  AUTOINCREMENT,' +
        '"ElementTypeId" VARCHAR,' +
        '"ErrorTypeId" VARCHAR,' +
        '"LogBook" TEXT,' +
        '"LogBookImg" TEXT,' +
        '"TechnicalAspects" TEXT,' +
        '"TechnicalAspectsImg" TEXT,' +
        '"FormId" VARCHAR,' +
        '"ElementTypeText" VARCHAR,' +
        '"ErrorTypeText" VARCHAR,' +
        '"CountError" VARCHAR,' +
        '"LogBookSent" INTEGER,' +
        '"TechnicalAspectsSent" INTEGER,' +
        '"Remarks" TEXT,' +
        '"RemarksImg" TEXT,' +
        '"RemarksSent" INTEGER' +
        ');',
    );

    tx.executeSql(
      'CREATE TABLE IF NOT EXISTS tb_presentclients (' +
        '"id" INTEGER PRIMARY KEY AUTOINCREMENT,' +
        '"name" VARCHAR,' +
        '"AuditId" VARCHAR' +
        ');',
    );

    tx.executeSql(
      'CREATE TABLE IF NOT EXISTS tb_errors_pending (' +
        '"Id" INTEGER PRIMARY KEY AUTOINCREMENT,' +
        '"ErrorId" INTEGER,' +
        '"AuditId" VARCHAR,' +
        '"field" TEXT,' +
        '"image" VARCHAR,' +
        '"ImgType" INTEGER' +
        ');',
    );

    tx.executeSql(
      'CREATE TABLE IF NOT EXISTS tb_remarks (' +
        '"id" VARCHAR PRIMARY KEY,' +
        '"remarkText" TEXT,' +
        '"remarkImg" TEXT,' +
        '"auditId" INTEGER' +
        ');',
    );
  };

  closeDatabase = () => {
    if (db) {
      console.log('Closing database ...');
      db.close(this.closeCB, this.errorCB);
    } else {
      console.log('Database was not OPENED');
    }
  };

  successCB = () => {
    console.log('SQL executed ...');
  };

  openCB = () => {
    console.log('Database OPEN');
  };

  errorCB = err => {
    console.log('SQL Error: ', err);
  };

  LessThan = (str1, str2) => {
    if (str1 == '-1' || str1 == 'bgg') return true;

    if (str2 != 'bgg' && str2 != '-1') {
      var num1 = str1.substring(0, str1.length - 1) * 1;
      var num2 = str2.substring(0, str2.length - 1) * 1;

      return num1 < num2;
    }

    return false;
  };

  removeImg = error => {
    var newError = {
      ElementTypeId: error.ElementTypeId,
      ErrorTypeId: error.ErrorTypeId,
      LogBook: error.LogBook,
      LogBookImg: null,
      LogBookImgMimeType: 'image/png',
      TechnicalAspects: error.TechnicalAspects,
      TechnicalAspectsImg: null,
      TechnicalAspectsImgMimeType: 'image/png',
      Count: error.Count,
      ErrorId: error.ErrorId,
    };

    return newError;
  };

  formForServer = form => {
    AreaNumber = '';

    if (form.AreaNumber != null && form.AreaNumber != 0)
      AreaNumber = '.' + form.AreaNumber;

    return {
      //problema
      Id: form.FormId,
      FloorId: form.FloorId,
      CategoryId: form.CategoryId,
      Date: new Date(form.Date),
      AreaCode: form.AreaCode + AreaNumber,
      CounterElements: form.CounterElements,
      Remarks: form.Remarks,
    };
  };

  errorForServer = error => {
    return {
      ElementTypeId: error.ElementTypeId,
      ErrorTypeId: error.ErrorTypeId,
      LogBook: error.LogBook,
      LogBookImg: error.LogBookImg == null ? null : error.LogBookImg,
      LogBookImgMimeType: 'image/png',
      TechnicalAspects: error.TechnicalAspects,
      TechnicalAspectsImg:
        error.TechnicalAspectsImg == null ? null : error.TechnicalAspectsImg,
      TechnicalAspectsImgMimeType: 'image/png',
      Count: error.CountError,
      ErrorId: error.ErrorId,
      LogBookSent: error.LogBookSent,
      TechnicalAspectsSent: error.TechnicalAspectsSent,
    };
  };
}

const database = new DataBase();

export default database;
