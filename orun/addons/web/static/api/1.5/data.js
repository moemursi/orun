(function () {

  function createRecord(rec, scope) {
    return new Proxy(rec, {
      set(target, propKey, value, receiver) {
        scope.$setDirty(propKey);
        scope.dataSource._pendingChanges = true;
        return Reflect.set(target, propKey, value, receiver);
      }
    })
  }

  class RecordState {
    static initClass() {
      this.destroyed = 'destroyed';
      this.created = 'created';
      this.modified = 'modified';
    }
  }
  RecordState.initClass();


  class DataSourceState {
    static initClass() {
      this.inserting = 'inserting';
      this.browsing = 'browsing';
      this.editing = 'editing';
      this.loading = 'loading';
      this.inactive = 'inactive';
    }
  }
  DataSourceState.initClass();


  class DataSource {
    constructor(scope) {
      this.onFieldChange = this.onFieldChange.bind(this);
      this.scope = scope;
      this.recordIndex = 0;
      this.recordCount = null;
      this.loading = false;
      this.loadingRecord = false;
      this.masterSource = null;
      this.pageIndex = 0;
      this.pageLimit = 100;
      this.offset = 0;
      this.offsetLimit = 0;
      this.requestInterval = 300;
      this.pendingRequest = null;
      this.fieldName = null;
      this.children = [];
      this.modifiedData = null;
      this.uploading = 0;
      this.state = null;
      this.fieldChangeWatchers = [];
      this._pendingChanges = false;
    }

    cancelChanges() {
      if ((this.state === DataSourceState.inserting) && Katrid.Settings.UI.goToDefaultViewAfterCancelInsert) {
        this.scope.record = this._new();
        this.scope.action.setViewType('list');
      } else {
        if (this.state === DataSourceState.editing) {
          const r = this.refresh([this.scope.record.id]);
          if (r && $.isFunction(r.promise)) {
            r.done(() => {
              return this.setState(DataSourceState.browsing);
            });
          } else {
            this.setState(DataSourceState.browsing);
          }
        } else {
          this.scope.record = this._new();
          this.setState(DataSourceState.browsing);
        }
      }
    }

    saveAndClose() {
      // Save changes and close dialog
      const r = this.saveChanges(false);
      if (r && $.isFunction(r.promise)) {
        return r.done(res => {
          if (res.ok && res.result) {
            this.scope.result = res.result;
          }
          return $(this.scope.root).closest('.modal').modal('toggle');
        });
      }
    }

    saveChanges(autoRefresh) {
      // Submit fields with dirty state only
      if (autoRefresh == null) { autoRefresh = true; }
      const el = this.scope.formElement;
      if (this.validate()) {
        const data = this.getModifiedData(this.scope.form, el, this.scope.record);
        this.scope.form.data = data;

        let beforeSubmit = el.attr('before-submit');
        if (beforeSubmit) {
          beforeSubmit = this.scope.$eval(beforeSubmit);
        }

        //@scope.form.data = null

        if (data) {
          this.uploading++;
          return this.scope.model.write([data])
          .done(res => {
            if (res.ok) {
              this.scope.form.$setPristine();
              this.scope.form.$setUntouched();
              for (let child of Array.from(this.children)) {
                delete child.modifiedData;
              }
              this.setState(DataSourceState.browsing);
              if (autoRefresh) {
                return this.refresh(res.result);
              }
            } else {
              let s = `<span>${Katrid.i18n.gettext('The following fields are invalid:')}<hr></span>`;
              if (res.message) {
                s = res.message;
              } else if (res.messages) {
                let elfield;
                for (let fld in res.messages) {
                  const msgs = res.messages[fld];
                  const field = this.scope.view.fields[fld];
                  elfield = el.find(`.form-field[name="${field.name}"]`);
                  elfield.addClass('ng-invalid ng-touched');
                  s += `<strong>${field.caption}</strong><ul>`;
                  for (let msg of Array.from(msgs)) {
                    s += `<li>${msg}</li>`;
                  }
                  s += '</ul>';
                }
                if (elfield) {
                  elfield.focus();
                }
              }

              return Katrid.Dialogs.Alerts.error(s);
            }
        }).always(() => {
            return this.scope.$apply(() => {
              return this.uploading--;
            });
          });
        } else {
          Katrid.Dialogs.Alerts.warn(Katrid.i18n.gettext('No pending changes'));
        }
      }
    }

    copy(id) {
      return this.scope.model.copy(id)
      .done(res => {
        this.setState(DataSourceState.inserting);
        this.scope.record = this._new();
        return this.scope.$apply(() => {
          return this.setFields(res.result);
        });
      });
    }

    findById(id) {
      for (let rec of Array.from(this.scope.records)) {
        if (rec.id === id) {
          return rec;
        }
      }
    }

    hasKey(id) {
      return (() => {
        const result = [];
        for (let rec of Array.from(this.scope.records)) {
          if (rec.id === id) {
            result.push(true);
          } else {
            result.push(undefined);
          }
        }
        return result;
      })();
    }

    refresh(data) {
      if (data) {
        // Refresh current record
        return this.scope.action.location.search('id', data[0]);
      } else if (this.scope.record.id) {
        return this.get(this.scope.record.id);
      } else {
        return this.search(this._params, this._page);
      }
    }

    validate() {
      if (this.scope.form.$invalid) {
        let elfield;
        let s = `<span>${Katrid.i18n.gettext('The following fields are invalid:')}</span><hr>`;
        const el = this.scope.formElement;
        for (let errorType in this.scope.form.$error) {
          for (let child of Array.from(this.scope.form.$error[errorType])) {
            elfield = el.find(`.form-field[name="${child.$name}"]`);
            elfield.addClass('ng-touched');
            const field = this.scope.view.fields[child.$name];
            s += `<span>${field.caption}</span><ul><li>${Katrid.i18n.gettext('This field cannot be empty.')}</li></ul>`;
          }
        }
        elfield.focus();
        Katrid.Dialogs.Alerts.error(s);
        return false;
      }
      return true;
    }

    getIndex(obj) {
      const rec = this.findById(obj.id);
      return this.scope.records.indexOf(rec);
    }

    search(params, page, fields) {
      this._params = params;
      this._page = page;
      this._clearTimeout();
      this.pendingRequest = true;
      this.loading = true;
      page = page || 1;
      this.pageIndex = page;
      let { domain } = this.scope.action.info;
      if (domain) {
        domain = JSON.parse(domain);
      }
      params = {
        count: true,
        page,
        params,
        fields,
        domain,
        limit: this.limit
      };

      const def = new $.Deferred();

      this.pendingRequest = setTimeout(() => {
        return this.scope.model.search(params, {count: true})
        .fail(res => {
          return def.reject(res);
      }).done(res => {
          if (this.pageIndex > 1) {
            this.offset = ((this.pageIndex - 1) * this.pageLimit) + 1;
          } else {
            this.offset = 1;
          }
          this.scope.$apply(() => {
            if (res.result.count != null) {
              this.recordCount = res.result.count;
            }
            this.scope.records = res.result.data;
            if (this.pageIndex === 1) {
              return this.offsetLimit = this.scope.records.length;
            } else {
              return this.offsetLimit = (this.offset + this.scope.records.length) - 1;
            }
          });
          return def.resolve(res);
        }).always(() => {
          this.pendingRequest = false;
          return this.scope.$apply(() => {
            return this.loading = false;
          });
        });
      }
      , this.requestInterval);

      return def.promise();
    }

    groupBy(group) {
      if (!group) {
        this.groups = [];
        return;
      }
      this.groups = [group];
      return this.scope.model.groupBy(group.context)
      .then(res => {
        this.scope.records = [];
        const grouping = group.context.grouping[0];
        for (let r of Array.from(res.result)) {
          let s = r[grouping];
          if ($.isArray(s)) {
            r._paramValue = s[0];
            s = s[1];
          } else {
            r._paramValue = s;
          }
          r.__str__ = s;
          r.expanded = false;
          r.collapsed = true;
          r._searchGroup = group;
          r._paramName = grouping;
          const row = {_group: r, _hasGroup: true};
          this.scope.records.push(row);
        }
        return this.scope.$apply();
      });
    }

    goto(index) {
      return this.scope.moveBy(index - this.recordIndex);
    }

    moveBy(index) {
      const newIndex = (this.recordIndex + index) - 1;
      if ((newIndex > -1) && (newIndex < this.scope.records.length)) {
        this.recordIndex = newIndex + 1;
        return this.scope.action.location.search('id', this.scope.records[newIndex].id);
      }
    }

    _clearTimeout() {
      if (this.pendingRequest) {
        this.loading = false;
        this.loadingRecord = false;
        return clearTimeout(this.pendingRequest);
      }
    }

    setMasterSource(master) {
      this.masterSource = master;
      master.children.push(this);
    }

    applyModifiedData(form, element, record) {
      const data = this.getModifiedData(form, element, record);
      const _id = _.hash(record);
      if (data) {
        let ds = this.modifiedData;
        if ((ds == null)) {
          ds = {};
        }
        let obj = ds[_id];
        if (!obj) {
          obj = {};
          ds[_id] = obj;
        }
        for (let attr in data) {
          const v = data[attr];
          obj[attr] = v;
          record[attr] = v;
        }

        this.modifiedData = ds;
        this.masterSource.scope.form.$setDirty();
      }
      return data;
    }

    getModifiedData(form, element, record) {
      if (record.$deleted) {
        if (record.id) {
          return {
            id: record.id,
            $deleted: true
          };
        }
        return;
      }
      if (form.$dirty || this._modifiedFields.length) {
        const data = {};
        for (let el of Array.from($(element).find('.form-field.ng-dirty'))) {
          const nm = el.name;
          if (nm) {
            data[nm] = record[nm];
          }
        }

        for (let child of Array.from(this.children)) {
          const subData = data[child.fieldName] || [];
          for (let attr in child.modifiedData) {
            let obj = child.modifiedData[attr];
            if (obj.$deleted) {
              obj = {
                action: 'DESTROY',
                id: obj.id
              };
            } else if (obj.id) {
              obj = {
                action: 'UPDATE',
                values: obj
              };
            } else {
              obj = {
                action: 'CREATE',
                values: obj
              };
            }
            subData.push(obj);
          }
          if (subData) {
            data[child.fieldName] = subData;
          }
        }

        // Check invisible fields
        for (let f of Array.from(this._modifiedFields)) {
          data[f] = record[f];
        }

        if (data) {
          if (record.id) {
            data.id = record.id;
          }
          return data;
        }
      }

    }

    get(id, timeout) {
      this._clearTimeout();
      this.setState(DataSourceState.loading);
      this.loadingRecord = true;
      const def = new $.Deferred();

      const _get = () => {
        return this.scope.model.getById(id)
        .fail(res => {
          return def.reject(res);
      }).done(res => {
          this.scope.$apply(() => {
            return this._setRecord(res.result.data[0]);
          });
          return def.resolve(res);
        }).always(() => {
          this.setState(DataSourceState.browsing);
          return this.scope.$apply(() => {
            return this.loadingRecord = false;
          });
        });
      };

      if (timeout === 0) {
        return _get();
      }
      if (this.requestInterval || timeout) {
        this.pendingRequest = setTimeout(_get, timeout || this.requestInterval);
      }

      return def.promise();
    }

    newRecord() {
      this.setState(DataSourceState.inserting);
      this.scope.recordId = null;
      this.scope.model.getDefaults(this.scope.getContext())
      .done(res => {
        return this.scope.$apply(() => {
          this.scope.record = this._new();
          this.scope.record.display_name = Katrid.i18n.gettext('(New)');
          if (res.result) {
            return this.setFields(res.result);
          }
        });
      });
    }

    _new() {
      return createRecord({}, this.scope);
    }

    setFields(values) {
      for (let attr in values) {
        let v = values[attr];
        this.scope.record[attr] = v;
        continue;
        const control = this.scope.form[attr];
        if (control) {
          if (v) {
            v = this.toClientValue(attr, v);
          }
          control.$setDirty();
          // Force dirty (bug fix for boolean (false) value
          if (v === false) {
            this.scope.record[attr] = v;
            control.$setDirty();
          }
        } else {
          this._modifiedFields.push(attr);
        }
        this.scope.record[attr] = v;
      }
    }

    editRecord() {
      return this.setState(DataSourceState.editing);
    }

    toClientValue(attr, value) {
      const field = this.scope.view.fields[attr];
      if (field) {
        if (field.type === 'DateTimeField') {
          value = new Date(value);
        }
      }
      return value;
    }

    setState(state) {
      // Clear modified fields information
      this._modifiedFields = [];
      this.state = state;
      return this.changing =  [DataSourceState.editing, DataSourceState.inserting].includes(this.state);
    }

    _setRecord(rec) {
      // Track field changes
      this.scope.record = createRecord(rec, this.scope);
      this.scope.recordId = rec.id;
      this._pendingChanges = false;
      return this.state = DataSourceState.browsing;
    }

    next() {
      return this.moveBy(1);
    }

    prior() {
      return this.moveBy(-1);
    }

    nextPage() {
      let p = this.recordCount / this.pageLimit;
      if (Math.floor(p)) {
        p++;
      }
      if (p > (this.pageIndex + 1)) {
        return this.scope.action.location.search('page', this.pageIndex + 1);
      }
    }

    prevPage() {
      if (this.pageIndex > 1) {
        return this.scope.action.location.search('page', this.pageIndex - 1);
      }
    }

    setRecordIndex(index) {
      return this.recordIndex = index + 1;
    }

    onFieldChange(res) {
      if (res.ok && res.result.fields) {
        return this.scope.$apply(() => {
          return (() => {
            const result = [];
            for (let f in res.result.fields) {
              const v = res.result.fields[f];
              result.push(this.scope.$set(f, v));
            }
            return result;
          })();
        });
      }
    }

    fieldChange(meth, params) {
      return this.scope.model.post(meth, null, { kwargs: params })
      .done(res => {
        return this.scope.$apply(() => {
          if (res.ok) {
            if (res.result.values) {
              return this.setFields(res.result.values);
            }
          }
        });
      });
    }

    expandGroup(index, row) {
      const rg = row._group;
      const params =
        {params: {}};
      params.params[rg._paramName] = rg._paramValue;
      return this.scope.model.search(params)
      .then(res => {
        if (res.ok && res.result.data) {
          return this.scope.$apply(() => {
            rg._children = res.result.data;
            return this.scope.records.splice.apply(this.scope.records, [index + 1, 0].concat(res.result.data));
          });
        }
      });
    }

    collapseGroup(index, row) {
      const group = row._group;
      this.scope.records.splice(index + 1, group._children.length);
      return delete group._children;
    }
  }


  class Record {
    constructor(res) {
      this.res = res;
      this.data = this.res.data;
    }
  }


  Katrid.Data = {
    DataSource,
    Record,
    RecordState,
    DataSourceState,
    createRecord
  };

}).call(this);