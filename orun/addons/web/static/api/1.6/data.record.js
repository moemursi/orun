(function() {

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


              if (!rec.$modifiedData[propKey]) {
                rec.$modifiedData[propKey] = new SubRecords(value);
                rec.$modifiedData[propKey].$deleted = new SubRecords([]);
              } else
                rec.$modifiedData[propKey].recs = value;

              return Reflect.set(target, propKey, value, receiver);
            }
            else if (fld)
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

  Katrid.Data.RecordState = RecordState;
  Katrid.Data.createRecord = createRecord;
  Katrid.Data.SubRecords = SubRecords;

})();