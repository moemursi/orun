(function() {

  class Record {
    constructor(data, dataSource, state) {
      this.raw = data;
      this.data = {};
      this.old = jQuery.extend({}, data);
      this.dataSource = dataSource;
      this.pending = null;
      this.modified = false;
      this.children = [];
      this.state = state;
      this.submitted = false;
      data.$record = this;
    }

    get scope() {
      return this.dataSource.scope;
    }

    get pk() {
      return this.raw.id;
    }

    $delete() {
      this.state = RecordState.destroyed;
      if (this.pk)
        this.setModified();
      else if (this.parent.children.indexOf(this) > -1)
        this.parent.children.splice(this.parent.children.indexOf(this), 1);
    }

    _prepareRecord(rec) {
      let res = {};
      Object.entries(rec).map(obj => {
        if (!obj[0].startsWith('$'))
          res[obj[0]] = obj[1]
      });
      return res;
    }

    setModified(field) {
      if (!this.modified && (this.state !== RecordState.destroyed)) {
        if (this.pk)
          this.state = RecordState.modified;
        else
          this.state = RecordState.created;
      }
      if (field)
        this.dataSource.$setDirty(field);
      this.dataSource._pendingChanges = true;
      this.modified = true;

      if (this.parent && this.scope.fieldName) {
        this.parent.setModified(this.scope.fieldName);
        this.parent.addChild(this);
      }
    }

    get parent() {
      return this.dataSource.parent && this.dataSource.parent.record.$record;
    }

    addChild(child) {
      this.setModified(child.scope.fieldName);
      if (this.children.indexOf(child) === -1) {
        this.children.push(child);
      }
    }

    compare(oldValue, newValue) {
      if (_.isArray(oldValue) && _.isArray(newValue))
        return oldValue.join(',') !== newValue.join(',');
      return oldValue != newValue;
    }

    set(propKey, value) {
      let field = this.dataSource.fieldByName(propKey);
      if (field) {
        let oldValue = this.raw[propKey];
        value = field.toJSON(value);
        console.log('set field value', propKey, oldValue, value);
        // check if field value has been changed
        if (this.compare(oldValue, value)) {
          this.setModified(propKey);
          this.data[propKey] = value;
          this.modified = true;
          // send field change event
          if (field.onChange) {
            let rec = this._prepareRecord(this.raw);
            rec[propKey] = value;
            this.dataSource.dispatchEvent('field_change_event', [propKey, rec]);
          }
        }
      }
      return true;
    }

    $new() {
      return Record(this.raw);
    }

    toObject() {
      let data = jQuery.extend({}, this.data);
      if (this.pk)
        data.id = this.pk;
      for (let child of this.children) {
        if (!(child.scope.fieldName in data))
          data[child.scope.fieldName] = [];
        if (child.state === RecordState.created)
          data[child.scope.fieldName].push({ action: 'CREATE', values: child.toObject() });
        else if (child.state === RecordState.modified)
          data[child.scope.fieldName].push({ action: 'UPDATE', values: child.toObject() });
        else if (child.state === RecordState.destroyed)
          data[child.scope.fieldName].push({ action: 'DESTROY', id: child.pk });
      }
      return data;
    }
  }

  class SubRecords {
    constructor(recs) {
      this.recs = recs;
    }

    append(rec) {
      if (this.recs.indexOf(rec) === -1)
        this.recs.push(rec);
    }
  }


  function createRecord(rec, dataSource) {
    new Record(rec, dataSource);
    return new Proxy(rec, {
      set(target, propKey, value, receiver) {
        let scope = dataSource.scope;
        if (!propKey.startsWith('$$')) {
          if (!propKey.startsWith('$') && scope) {
            rec.$record.set(propKey, value);
            // if (fld instanceof Katrid.Data.Fields.OneToManyField) {
            //   if (!rec.$modifiedData[propKey]) {
            //     rec.$modifiedData[propKey] = new SubRecords(value);
            //     rec.$modifiedData[propKey].$deleted = new SubRecords([]);
            //   } else
            //     rec.$modifiedData[propKey].recs = value;
            //
            //   return Reflect.set(target, propKey, value, receiver);
            // }
          }
        }
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

  Katrid.Data.RecordState = RecordState;
  Katrid.Data.createRecord = createRecord;
  Katrid.Data.SubRecords = SubRecords;

})();