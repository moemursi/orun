(function () {

  class Alerts {
    static success(msg) {
      return toastr['success'](msg);
    }

    static warn(msg) {
      return toastr['warning'](msg);
    }

    static error(msg) {
      return toastr['error'](msg);
    }
  }

  class WaitDialog {
    static show() {
      $('#loading-msg').show();
    }

    static hide() {
      $('#loading-msg').hide();
    }
  }

  class Dialog extends Katrid.UI.Views.BaseView {
    constructor(scope, options, $compile) {
      super(scope);
      this.$compile = $compile;
      this.templateUrl = 'dialog.base';
      this.scope.isDialog = true;
    }

    render() {
      return $(sprintf(Katrid.$templateCache.get(this.templateUrl), { content: this.content }));
    }

    show() {
      if (!this.el) {
        this.el = $(this.render());
        this.root = this.el.find('.modal-dialog-body');
        this.el.find('form').first().addClass('row');
        this.$compile(this.el)(this.scope);
      }
      this.el.modal('show')
      .on('shown.bs.modal', () => Katrid.uiKatrid.setFocus(this.el.find('.form-field').first()));
      return this.el;
    }
}

  class Window extends Dialog {
    constructor(scope, options, $compile) {
      super(scope.$new(), options, $compile);
      this.templateUrl = 'dialog.window';
      console.log(Katrid.$templateCache.get(this.templateUrl));
      this.scope.parentAction = scope.action;
      console.log(options);
      this.scope.views = { form: options.view };
      this.scope.title = (options && options.title) || Katrid.i18n.gettext('Create: ');
      this.scope.view = options.view;
      this.content = options.view.content;
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
          action_type: "ir.action.window",
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
    Alerts,
    WaitDialog,
    Dialog,
    Window
  };

}).call(this);