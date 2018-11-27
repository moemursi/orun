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

  class Dialog extends Katrid.ui.Views.BaseView {
    constructor(scope, options, $compile) {
      super(scope);
      this.$compile = $compile;
      this.templateUrl = 'dialog.base';
      this.scope.isDialog = true;
    }

    render() {
      return $(sprintf(Katrid.app.getTemplate(this.templateUrl), { content: this.content }));
    }

    show() {
      if (!this.el) {
        this.el = $(this.render());
        this.root = this.el.find('.modal-dialog-body');
        this.el.find('form').first().addClass('row');
        this.$compile(this.el)(this.scope);
      }
      this.el.modal('show')
      .on('shown.bs.modal', () => Katrid.ui.uiKatrid.setFocus(this.el.find('.form-field').first()));
      return this.el;
    }
}

  class Window extends Dialog {
    constructor(scope, options, $compile) {
      super(scope.$new(), options, $compile);
      this.scope.parentAction = scope.action;
      this.scope.views = {form: options.view};
      this.scope.title = (options && options.title) || Katrid.i18n.gettext('Create: ');
      this.scope.view = options.view;
    }

    show(field, $controller) {
      let view = this.scope.view;
      let elScope = this.scope;
      elScope.views = {form: view};
      elScope.isDialog = true;
      elScope.dialogTitle = _.sprintf(Katrid.i18n.gettext('Create: %(title)s'), { title: field.caption });
      console.log(Katrid.app.$templateCache.get('view.form.dialog.modal').replace(
        '<!-- view content -->',
        '<form-view form-dialog="dialog">' + view.content + '</form-view>',
      ));
      let el = $(Katrid.app.$templateCache.get('view.form.dialog.modal').replace(
        '<!-- view content -->',
        '<form-view form-dialog="dialog">' + view.content + '</form-view>',
      ));
      elScope.root = el.find('form-view');

      el = this.$compile(el)(elScope);
      el.find('form').first().addClass('row');
      el.modal('show').on('shown.bs.modal', () => Katrid.ui.uiKatrid.setFocus(el.find('.form-field').first()));

      return el;
    };
  }

  Katrid.ui.Dialogs = {
    Alerts,
    WaitDialog,
    Dialog,
    Window
  };

})();
