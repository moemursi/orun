(function () {

  class Import extends Katrid.UI.Views.View {
    constructor(scope) {
      super(scope);
      this.templateUrl = 'view.import';
    }
  }

  Katrid.Actions.ClientAction.register('import', Import);

}).call(this);
