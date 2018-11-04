(function () {

  class ViewInfo {
    constructor(info) {
      this._info = info;
      this.fields = info.fields;
      this.content = info.content;
      this.toolbar = info.toolbar;
    }
  }

  Katrid.ui.ViewInfo = ViewInfo;
})();
