(function() {

  class Record {
    constructor(res) {
      this.res = res;
      this.data = this.res.data;
    }
  }


  function createRecord(rec, scope) {
    return new Proxy(rec, {
      set(target, propKey, value, receiver) {
        if (scope) {
          scope.$setDirty(propKey);
          scope.dataSource._pendingChanges = true;
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

})();