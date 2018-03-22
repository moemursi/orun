(() => {
  class BaseObject {
    doAction(act) {
    }
  }

  class Widget extends BaseObject {

  }

  class Component extends BaseObject {
    controller($scope) {
      $scope.doAction = this.doAction;
    }
  }

  Katrid.UI.Widgets = {
    Widget,
    Component
  };
})();
