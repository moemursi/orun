(function() {

  class Record {
    constructor(res) {
      // this.res = res;
      // this.data = this.res.data;
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


  function createRecord(rec, scope) {
    return new Proxy(rec, {
      set(target, propKey, value, receiver) {
        console.log('proxy set', propKey, value);
        if (!propKey.startsWith('$$')) {
          if (!propKey.startsWith('$') && scope) {
            scope.$setDirty(propKey);
            scope.dataSource._pendingChanges = true;
            if (!rec.$modified) {
              rec.$modifiedData = {};
              rec.$modified = true;
              rec.$old = jQuery.extend({}, rec);
            }
            let fld = scope.dataSource.fieldByName(propKey);
            if (fld instanceof Katrid.Data.Fields.OneToManyField) {
              rec.$modifiedData[propKey] = new SubRecords(value);
              rec.$modifiedData[propKey].$deleted = new SubRecords([]);
              let r = Reflect.set(target, propKey, value, receiver);
              return r;
            }
            else
              rec.$modifiedData[propKey] = fld.toJson(value);
          }
          if (scope.dataSource.$modifiedRecords.indexOf(rec) === -1)
            scope.dataSource.$modifiedRecords.push(rec);
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

  Katrid.Data.Record = Record;
  Katrid.Data.RecordState = RecordState;
  Katrid.Data.createRecord = createRecord;
  Katrid.Data.SubRecords = SubRecords;

})();