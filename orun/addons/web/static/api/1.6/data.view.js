(function () {

  class View {
    constructor(info) {
      this._info = info;
      this.fields = info.fields;
      this.content = info.content;
      this.toolbar = info.toolbar;
    }
  }

  Katrid.Data.View = View;
})();