(function () {

  class View {
    constructor(info) {
      console.log(info);
      this._info = info;
      this.fields = {};
      Object.keys(info.fields).map(k => this.fields[k] = Katrid.Data.Fields.Field.fromInfo(info.fields[k]) );
      console.log(this.fields);
      this.content = info.content;
    }
  }

  Katrid.Data.View = View;

})();