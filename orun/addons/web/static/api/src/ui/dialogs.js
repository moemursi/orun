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
      return $(Katrid.app.getTemplate(this.templateUrl).replace('<!-- replace-content -->', this.content));
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
    constructor(scope, options, $compile, $controller, model, viewType) {
      super(scope.$new(true), options, $compile);
      this.scope._ = this.scope.$parent._;
      this.scope.parentAction = scope.action;
      this.scope.views = {form: options.view};
      this.scope.dialogTitle = (options && options.title) || Katrid.i18n.gettext('Create: ');
      this.scope.view = options.view;
      this.scope.model = model;
      this.options = options;
    }

    async createNew(config) {
      let field = this.options.field;

      this.scope.$setDirty = (field) => {
        const control = this.scope.form[field];
        if (control) {
          control.$setDirty();
        }
      };

      let view = this.scope.view;
      let elScope = this.scope;
      elScope.views = { form: view };
      elScope.isDialog = true;
      let el = $(Katrid.app.$templateCache.get('view.form.dialog.modal').replace(
        '<!-- view content -->',
        '<form-view form-dialog="dialog">' + view.content + '</form-view>',
      ));
      elScope.root = el.find('form-view');

      el = this.$compile(el)(elScope);
      let form = el.find('form').first().addClass('row');
      el.modal('show').on('shown.bs.modal', () => Katrid.ui.uiKatrid.setFocus(el.find('.form-field').first()))
      .on('hidden.bs.modal', function() {
        $(this).modal('dispose').remove();
      });

      this.scope.form = form.controller('form');
      this.scope.formElement = form;
      if (field) {
        let evt = this.scope.$on('saveAndClose', async (event, targetScope, data) => {
          if (this.scope === targetScope) {
            if (_.isArray(data) && data.length) {
              data = await this.scope.$parent.model.getFieldChoices(field.name, null, {ids: data});
              let vals = {};
              let res = data.items[0];
              vals[field.name] = res;
              this.scope.$parent.dataSource.setValues(vals);
              if (this.options.sel)
                this.options.sel.select2('data', { id: res[0], text: res[1] });
            }
            // unhook event
            evt();
          }
        });
      }
      this.scope.action = {
        $element: el,
      };
      this.scope.dataSource = new Katrid.Data.DataSource(this.scope);

      return new Promise(async (resolve, reject) => {
        setTimeout(async () => {
          // check if there's a creation name
          let kwargs, defaultValues;
          if (config) {
            if (config.creationName)
              kwargs = { creation_name: name };
            if (config.defaultValues)
              defaultValues = config.defaultValues;
          }
          await this.scope.dataSource.insert(true, defaultValues, kwargs);
          this.scope.$apply();
          resolve(el);
        });

      });

    };
  }

  Katrid.ui.Dialogs = {
    Alerts,
    WaitDialog,
    Dialog,
    Window
  };

})();
