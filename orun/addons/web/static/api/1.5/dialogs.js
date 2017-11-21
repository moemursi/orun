(function () {

  class Alerts {
    success(msg) {
      return toastr['success'](msg);
    }

    warn(msg) {
      return toastr['warning'](msg);
    }

    error(msg) {
      return toastr['error'](msg);
    }
  }

  let showWindow = (scope, field, view, $compile, $controller) => {
    const elScope = scope.$new();
    elScope.parentAction = scope.action;
    elScope.views = { form: view };
    elScope.isDialog = true;
    elScope.dialogTitle = Katrid.i18n.gettext('Create: ');
    let el = $(Katrid.UI.Utils.Templates.windowDialog(elScope));
    elScope.root = el.find('.modal-dialog-body');
    $controller('ActionController', {
        $scope: elScope,
        action: {
          model: [null, field.model],
          action_type: "sys.action.window",
          view_mode: 'form',
          view_type: 'form',
          display_name: field.caption
        }
      }
    );

    el = $compile(el)(elScope);
    el.modal('show').on('shown.bs.modal', () => Katrid.uiKatrid.setFocus(el.find('.form-field').first()));

    return el;
  };

  Katrid.Dialogs = {
    Alerts: new Alerts(),
    showWindow: showWindow
  };

}).call(this);