(function () {

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

  DEFAULT_REQUEST_INTERVAL = 300;

  class DataSource {
    constructor(scope) {
      this.readonly = false;
      this.$modifiedRecords = [];
      // this.onFieldChange = this.onFieldChange.bind(this);
      this.scope = scope;
      this.action = scope.action;
      this._recordIndex = 0;
      this.recordCount = null;
      this.loading = false;
      this.loadingRecord = false;
      this._masterSource = null;
      this.pageIndex = 0;
      this.pageLimit = 100;
      this.offset = 0;
      this.offsetLimit = 0;
      this.requestInterval = DEFAULT_REQUEST_INTERVAL;
      this.pendingRequest = null;
      this.fieldName = null;
      this.children = [];
      this.modifiedData = null;
      this.uploading = 0;
      this._state = null;
      this.fieldWatchers = [];
      this._pendingChanges = false;
    }

    addFieldWatcher(field) {

    }

    get fields() {
      return this.scope.view.fields;
    }

    get loadingAction() {
      return this._loadingAction;
    }

    set loadingAction(v) {
      if (v) this.requestInterval = 0;
      else this.requestInterval = DEFAULT_REQUEST_INTERVAL;
      this._loadingAction = v;
    }

    async cancel() {
      if (!this.changing)
        return;

      for (let child of this.children)
        child.cancel();

      this._recordIndex = null;
      this._pendingChanges = false;

      if ((this.state === DataSourceState.inserting) && Katrid.settings.ui.goToDefaultViewAfterCancelInsert) {
        this.record = {};
        this.scope.action.viewType = 'list';
      } else {
        if (this.state === DataSourceState.editing) {
          if (this.scope.record) {
            let r = await this.refresh([this.scope.record.id]);
            this.state = DataSourceState.browsing;
            this.recordId = this.record.id;
          }
        } else {
          this.record = {};
          this.state = DataSourceState.browsing;
        }
      }
    }

    async saveAndClose() {
      // Save changes and close dialog
      let r = await this.save(false);
      this.scope.$emit('saveAndClose', this.scope, r);
      return this.scope.action.$element.closest('.modal').modal('hide');
    }


    async copy(id) {
      let res = await this.model.copy(id);
      this.record = {};
      this.state = DataSourceState.inserting;
      this.setValues(res);
      return res;
    }

    findById(id) {
      for (let rec of this.scope.records)
        if (rec.id === id)
          return rec;
      return null;
    }

    hasKey(id) {
      return this.findById(id) !== null;
    }

    refresh(data) {
      let r;
      if (data) {
        // Refresh current record
        r = this.get(data[0]);
      } else if (this.scope.record.id) {
        r = this.get(this.scope.record.id);
      } else {
        r = this.search(this._params, this._page);
      }
      r.then(() => {
        for (let child in this.children)
          if (child.invalidate) {
            child.invalidate(this.recordId);
            child.scope.$apply();
          }
      });
      return r;
    }

    _validateForm(elForm, form, errorMsgs) {
      let elfield;
      for (let errorType in form.$error)
        if (errorType === 'required')
        for (let child of Array.from(form.$error[errorType])) {
          if (child.$name.startsWith('grid-row-form'))
            elfield = this._validateForm(elForm.find('#' + child.$name), child, errorMsgs);
          else {
            elfield = elForm.find(`.form-field[name="${child.$name}"]`);
            elfield.addClass('ng-touched');
            let scope = angular.element(elForm).scope();
            const field = scope.view.fields[child.$name];
            errorMsgs.push(`<span>${field.caption}</span><ul><li>${Katrid.i18n.gettext('This field cannot be empty.')}</li></ul>`);
          }
        }
        else
          console.log(form.$error[errorType]);

      return elfield;
    }

    validate(raiseError=true) {
      if (this.scope.form.$invalid) {
        let elfield;
        let errors = [];
        let s = `<span>${Katrid.i18n.gettext('The following fields are invalid:')}</span><hr>`;
        const el = this.scope.formElement;
        elfield = this._validateForm(el, this.scope.form, errors);
        Katrid.ui.uiKatrid.setFocus(elfield);
        s += errors.join('');
        Katrid.ui.Dialogs.Alerts.error(s);
        if (raiseError)
          throw Error('Error validating form: ' + s);
        return false;
      }
      return true;
    }

    indexOf(obj) {
      return this.scope.records.indexOf(this.findById(obj.id));
    }

    search(params, page, fields, timeout) {
      let master = this.masterSource;
      if (this.groups && !this.groups.length && this.scope.defaultGrouping) {
        let g = {
          context: {
            grouping: [this.scope.defaultGrouping]
          }
        };
        this.groupBy(g);
        return;
      }
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

      return new Promise(
        (resolve, reject) => {

          let req = () => {
            this.model.search(params)
            .catch(res => {
              return reject(res);
            })
            .then(res => {
              if (this.pageIndex > 1) {
                this.offset = ((this.pageIndex - 1) * this.pageLimit) + 1;
              } else {
                this.offset = 1;
              }
              this.scope.$apply(() => {
                if (res.count != null)
                  this.recordCount = res.count;

                let data = res.data;
                if (this.readonly)
                  this.scope.records = data;
                else
                  this.scope.records = data.map((obj) => Katrid.Data.createRecord(obj, this));
                if (this.pageIndex === 1) {
                  return this.offsetLimit = this.scope.records.length;
                } else {
                  return this.offsetLimit = (this.offset + this.scope.records.length) - 1;
                }
              });
              return resolve(res);
            })
            .finally(() => {
              this.pendingRequest = false;
              this.scope.$apply(() => {
                this.loading = false;
              });
            });
          };

          if (((this.requestInterval > 0) || timeout) && (timeout !== false))
            this.pendingRequest = setTimeout(req, this.requestInterval);
          else req();
        }
      );
    }

    groupBy(group) {
      if (!group) {
        this.groups = [];
        return;
      }
      this.scope.groupings = [];
      this.groups = [group];
      return this.model.groupBy(group.context)
      .then(res => {
        this.scope.records = [];
        const groupName = group.context.grouping[0];
        for (let r of Array.from(res)) {
          let s = r[groupName];
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
          r._paramName = groupName;
          r._domain = {};
          r._domain[r._paramName] = r._paramValue;
          const row = {_group: r, _hasGroup: true};

          // load groupings info
          let grouping = r;
          this.scope.groupings.push(grouping);

          // auto load records
          if (this.autoLoadGrouping) {
            ((grouping) => {
              this.model.search({params: r._domain})
              .then(res => {
                if (res.ok) this.scope.$apply(() => {grouping.records = res.result.data});
              })})(grouping);
          }

          this.scope.records.push(row);
        }
        return this.scope.$apply();
      });
    }

    goto(index) {
      return this.recordIndex = index;
    }

    moveBy(index) {
      const newIndex = (this._recordIndex + index);
      if ((newIndex > -1) && (newIndex < this.scope.records.length))
        this.recordIndex = newIndex;
    }

    _clearTimeout() {
      this.loading = false;
      this.loadingRecord = false;
      this._canceled = true;
      clearTimeout(this.pendingRequest);
    }

    set masterSource(master) {
      this._masterSource = master;
      master.children.push(this);
    }

    get masterSource() {
      return this._masterSource;
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
          //record[attr] = v;
        }

        this.modifiedData = ds;
        this.masterSource.scope.form.$setDirty();
      }
      return data;
    }

    getNestedData() {
      let ret = {};
      for (let child of this.children)
        if (child.$modifiedRecords.length) {
          let res = [];
          let deleted = [];
          for (let rec of child.$modifiedRecords) {
            if (rec.$deleted) {
              deleted.push(rec);
              if ((rec.id !== null) && (rec.id !== undefined))
                res.push({id: rec.id, action: 'DESTROY'})
            }
          }

          for (let rec of child.$modifiedRecords) {
            console.log(rec.$modified, rec.$modifiedData);
            if (rec.$modifiedData && !rec.$deleted && rec.$modified && (deleted.indexOf(rec) === -1)) {
              let data = this._getModified(rec.$modifiedData);
              if (rec.id)
                data['id'] = rec.id;
              jQuery.extend(data, child.getNestedData());
              if ((rec.id === null) || (rec.id === undefined))
                res.push({
                  action: 'CREATE',
                  values: data,
                });
              else if ((rec.id !== null) && (rec.id !== undefined))
                res.push({
                  action: 'UPDATE',
                  values: data,
                });
            }
          }
          if (Object.keys(res).length > 0)
            ret[child.fieldName] = res;
        }
      return ret;
    }

    save(autoRefresh=true) {
      // Save pending children
      for (let child of this.children)
        if (child.changing)
          child.scope.save();

      const el = this.scope.formElement;
      if (this.validate()) {
        const data = this.record.$record.toObject();
        // const data = this.getModifiedData(this.scope.form, el, this.scope.record);
        this.scope.form.data = data;

        let beforeSubmit = el.attr('before-submit');
        if (beforeSubmit)
          beforeSubmit = this.scope.$eval(beforeSubmit);

        //@scope.form.data = null

        if (data) {
          this.uploading++;
          return this.model.write([data])
          .then(res => {
            // this._clearCache();
            if (this.scope.action && this.scope.action.location)
              this.scope.action.location.search('id', res[0]);
            this.scope.form.$setPristine();
            this.scope.form.$setUntouched();
            this._pendingChanges = false;
            this.state = DataSourceState.browsing;
            if (autoRefresh)
              return this.refresh(res);
            else
              return res;

          })
          .catch(error => {
            let s = `<span>${Katrid.i18n.gettext('The following fields are invalid:')}<hr></span>`;
            if (error.message)
              s = error.message;
            else if (error.messages) {
              let elfield;
              for (let fld of Object.keys(error.messages)) {
                const msgs = error.messages[fld];
                let field;
                // check qualified field name
                if (fld.indexOf('.') > -1) {
                  fld = fld.split('.');
                  let subField = fld[1];
                  for (let child of this.children)
                    if (child.scope.fieldName === fld[0]) {
                      field = child.scope.view.fields[subField];
                    }
                } else
                  field = this.scope.view.fields[fld];
                console.log('field invalid', field);
                if (!field || !field.name)
                  continue;
                elfield = el.find(`.form-field[name="${field.name}"]`);
                elfield.addClass('ng-invalid ng-touched');
                s += `<strong>${field.caption}</strong><ul>`;
                for (let msg of msgs) {
                  s += `<li>${msg}</li>`;
                }
                s += '</ul>';
              }
              if (elfield)
                elfield.focus();
            }

            return Katrid.ui.Dialogs.Alerts.error(s);

          })
          .finally(() => this.scope.$apply(() => this.uploading-- ) );
        } else
          Katrid.Dialogs.Alerts.warn(Katrid.i18n.gettext('No pending changes'));
      }
    }

    _getNested(recs) {
      let res = [];
      if (recs.$deleted && recs.$deleted.recs.length)
        for (let rec of recs.$deleted.recs)
          res.push({id: rec.id, action: 'DESTROY'});

      let vals;
      if (recs.recs.length)
        for (let rec of recs.recs) if (rec) {
          vals = {};
          if (rec.$created)
            vals = {
              action: 'CREATE',
              values: this._getModified(rec.$modifiedData)
            };
          else if (rec.$modified) {
            vals = {
              action: 'UPDATE',
              values: this._getModified(rec.$modifiedData)
            };
            vals.values.id = rec.id;
          }
          else
            continue;
          res.push(vals);
        }

      return res;
    }


    _getModified(data) {
      let res = {};
      if (data)
        for (let [k, v] of Object.entries(data))
          if (v instanceof Katrid.Data.SubRecords) {
            res[k] = this._getNested(v);
          } else
            res[k] = v;
      return res;
    }

    getModifiedData(form, element, record) {
      let data = {};
      if (record.$modified)
        jQuery.extend(data, this._getModified(record.$modifiedData));

      if (this.record.id)
        data['id'] = record.id;
      return data;
    }

    get(id, timeout, apply=true, index=false) {
      this._clearTimeout();
      this.state = DataSourceState.loading;
      this.loadingRecord = true;
      this._canceled = false;

      return new Promise(
        (resolve, reject) => {
          const _get = () => {
            return this.model.getById(id)
            .catch(res => {
              return reject(res);
            })
            .then(res => {
              if (this._canceled || !res)
                return;
              if (this.state === DataSourceState.loading)
                this.state = DataSourceState.browsing;
              else if (this.state === DataSourceState.inserting)
                return;
              this.record = res.data[0];
              if (index !== false)
                this.scope.records[index] = this.record;
              // if (apply)
              //   this.scope.$apply();
              return resolve(this.record);
            })
            .finally(() => {
                this.loadingRecord = false;
              if (apply)
                return this.scope.$apply();
            });
          };
          if (!timeout && !this.requestInterval)
            return _get();
          else
            this.pendingRequest = setTimeout(_get, timeout || this.requestInterval);

        }
      );
    }

    async insert(loadDefaults=true, defaultValues, kwargs) {
      this._clearTimeout();
      for (let child of this.children)
        child._clearTimeout();
      let rec = {};
      rec.$created = true;
      let oldRecs = this.scope.records;
      this.record = rec;
      this.scope.records = oldRecs;
      let res;
      // check if load defaults is needed
      if (loadDefaults)
        // load default fields values with optional kwargs
        res = await this.model.getDefaults(kwargs);

      for (let child of this.children)
        child.scope.records = [];

      this.state = DataSourceState.inserting;
      this.scope.record.display_name = Katrid.i18n.gettext('(New)');
      if (defaultValues)
        Object.assign(res, defaultValues);
      if (res)
        this.setValues(res);
    }

    _new() {
      return Katrid.Data.createRecord({}, this);
    }

    setValues(values) {
      Object.entries(values).forEach(([k, v]) => {
        let fld = this.scope.view.fields[k];
        if (fld)
          fld.fromJSON(v, this);
        else
          this.scope.record[k] = v
      });
      this.scope.$apply();
    }

    edit() {
      this.state = DataSourceState.editing;
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

    fieldByName(fieldName) {
      return this.scope.view.fields[fieldName];
    }

    set state(state) {
      // Clear modified fields information
      this._modifiedFields = [];
      this._state = state;
      this.inserting = state === DataSourceState.inserting;
      this.editing = state === DataSourceState.editing;
      this.loading = state === DataSourceState.loading;
      this.changing =  [DataSourceState.editing, DataSourceState.inserting].includes(this.state);
      if (this.changing)
        setTimeout(() => {
          if (this.action.$element)
            for (let el of Array.from(this.action.$element.find("input[type!=hidden].form-field:visible"))) {
              el = $(el);
              if (!el.attr('readonly')) {
                $(el).focus();
                return;
              }
            }
        });
    }

    get browsing() {
      return this._state === DataSourceState.browsing;
    }

    childByName(fieldName) {
      for (let child of this.children) {
        if (child.fieldName === fieldName)
          return child;
      }
    }

    get state() {
      return this._state;
    }

    get record() {
      return this.scope.record;
    }

    set recordId(value) {
      // refresh record id
      this.scope.recordId = value;
      // refresh children
      this.scope.$broadcast('masterChanged', this, value);
    }

    get recordId() {
      return this.scope.recordId;
    }

    set record(rec) {
      // Track field changes
      this.scope.record = Katrid.Data.createRecord(rec, this);
      this.recordId = rec.id;
      this._pendingChanges = false;
      if (this.scope.form)
        this.scope.form.$setPristine();
      // this.state = DataSourceState.browsing;
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

    set recordIndex(index) {
      this._recordIndex = index;
      if (!this.masterSource)
        return this.action.location.search('id', this.scope.records[index].id);
      this.scope.record = this.scope.records[index];
      // load record
      this.scope.recordId = null;
      // set new id on browser address
    }

    get recordIndex() {
      return this._recordIndex;
    }

    expandGroup(index, row) {
      const rg = row._group;
      const params =
        {params: {}};
      params.params[rg._paramName] = rg._paramValue;
      return this.model.search(params)
      .then(res => {
        if (res.ok && res.result.data) {
          return this.action.scope.$apply(() => {
            rg._children = res.result.data;
            return this.action.scope.records.splice.apply(this.scope.records, [index + 1, 0].concat(res.result.data));
          });
        }
      });
    }

    collapseGroup(index, row) {
      const group = row._group;
      this.scope.records.splice(index + 1, group._children.length);
      return delete group._children;
    }

    _applyResponse(res) {
      if (res.value)
        this.setValues(res.value);
      this.scope.$apply();
    }

    async dispatchEvent(name, ...args) {
      let res = await this.model.rpc(name, ...args);
      this._applyResponse(res);
    }

    get model() {
      return this.scope.model;
    }

    get parent() {
      return this.masterSource;
    }

    $setDirty(field) {
      this.scope.$setDirty(field);
    }
  }


  Katrid.Data.DataSource = DataSource;
  Katrid.Data.DataSourceState = DataSourceState;

})();
