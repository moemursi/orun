(function () {
  let uiKatrid = Katrid.uiKatrid;

  uiKatrid.directive('inlineForm', $compile => ({
    restrict: 'A',
    scope: {}
  }));

  class Grid {
    constructor($compile) {
      this.restrict = 'E';
      this.replace = true;
      this.scope = {};
      this.$compile = $compile;
    }

    link(scope, element, attrs) {
      let me = this;
      // Load remote field model info

      const field = scope.$parent.view.fields[attrs.name];

      scope.action = scope.$parent.action;
      scope.fieldName = attrs.name;
      scope.field = field;
      scope.records = [];
      scope.recordIndex = -1;
      scope._cachedViews = {};
      scope._ = scope.$parent._;
      scope._changeCount = 0;
      scope.dataSet = [];
      scope.parent = scope.$parent;
      scope.model = new Katrid.Services.Model(field.model);

      if (attrs.inlineEditor === 'tabular')
        scope.inline = 'tabular';
      else if (attrs.hasOwnProperty('inlineEditor'))
        scope.inline = 'inline';

      scope.getContext = function () {
        return {}
      };

      scope.$setDirty = function () {
        return {}
      };

      // Set parent/master data source
      scope.dataSource = new Katrid.Data.DataSource(scope);
      scope.dataSource.readonly = !_.isUndefined(attrs.readonly);
      let p = scope.$parent;
      while (p) {
        if (p.dataSource) {
          scope.dataSource.masterSource = p.dataSource;
          break;
        }
        p = p.$parent;
      }

      scope.dataSource.fieldName = scope.fieldName;
      scope.gridDialog = null;
      let gridEl = null;
      // check if element already has the list view template
      let lst = element.find('list');
      if (lst.length)
        scope.model.getFieldsInfo({view_type: 'list'})
        .done(res => {
          loadViews({
            list: {
              content: lst,
              fields: res.result
            }
          })
        });
      else {
        scope.model.loadViews()
        .done(res => {
            // detects the relational field
            let fld = res.views.list.fields[scope.field.field];
            if (fld)
              fld.visible = false;
            loadViews(res.views);
            scope.$apply();
          }
        )
      }

      let renderDialog = function () {
        let el;
        let html = scope._cachedViews.form.content;

        scope.view = scope._cachedViews.form;
        let fld = scope._cachedViews.form.fields[scope.field.field];
        if (fld)
          fld.visible = false;

        if (attrs.inline) {
          el = me.$compile(html)(scope);
          gridEl.find('.inline-input-dialog').append(el);
        } else {
          html = $(Katrid.$templateCache.get('view.field.OneToManyField.Dialog').replace('<!-- view content -->', html));
          el = me.$compile(html)(scope);
          el.find('form').first().addClass('row');
        }

        // Get the first form controller
        scope.formElement = el.find('form').first();
        scope.form = scope.formElement.controller('form');
        scope.gridDialog = el;

        if (!attrs.inline) {
          el.modal('show');
          el.on('hidden.bs.modal', function () {
            scope.record = null;
            scope.dataSource.state = Katrid.Data.DataSourceState.browsing;
            el.remove();
            scope.gridDialog = null;
            scope.recordIndex = -1;
          });
        }
        const def = new $.Deferred();
        el.on('shown.bs.modal', () => def.resolve());
        return def;
      };

      let loadViews = (obj) => {
        scope._cachedViews = obj;
        scope.view = scope._cachedViews.list;
        let onclick = 'openItem($index)';
        if (scope.inline === 'tabular')
          onclick = '';
        else if (scope.inline === 'inline')
          onclick = 'editItem($event, $index)';
        const html = Katrid.UI.Utils.Templates.renderGrid(scope, $(scope.view.content), attrs, onclick);
        gridEl = this.$compile(html)(scope);
        element.replaceWith(gridEl);
        // if (attrs.inline === 'inline') {
        //   return renderDialog();
        // }
        return gridEl;
      };

      scope.doViewAction = (viewAction, target, confirmation) => scope.action._doViewAction(scope, viewAction, target, confirmation);

      scope._incChanges = function () {
        return scope.parent.record[scope.fieldName] = scope.records;
      };

      scope.addItem = function () {
        scope.dataSource.insert();
        if (attrs.inline)
          scope.records.push(scope.record);
        else
          return scope.showDialog();
      };

      scope.cancelChanges = () => scope.dataSource.setState(Katrid.Data.DataSourceState.browsing);

      scope.openItem = index => {
        scope.showDialog(index);
        if (scope.parent.dataSource.changing && !scope.dataSource.readonly) {
          return scope.dataSource.edit();
        }
      };

      scope.editItem = (evt, index) => {
        if (scope.$parent.dataSource.changing) {
          scope.dataSource.recordIndex = index;
          scope.dataSource.edit();

          // delay focus field
          setTimeout(() => {
            let el = $(evt.target).closest('td').find('input.form-control').focus();
            setTimeout(() => el.select());
          }, 100);

        }
      };

      scope.removeItem = function (idx) {
        const rec = scope.records[idx];
        scope.records.splice(idx, 1);
        scope._incChanges();
        rec.$deleted = true;
        return scope.dataSource.applyModifiedData(null, null, rec);
      };

      scope.$set = (field, value) => {
        const control = scope.form[field];
        control.$setViewValue(value);
        control.$render();
      };

      scope.save = function () {
        // const data = scope.dataSource.applyModifiedData(scope.form, scope.gridDialog, scope.record);
        if (scope.recordIndex > -1) {
          // bug fix proxy object apply changes
          let rec = scope.record;
          scope.record = null;
          scope.records.splice(scope.recordIndex, 1);
          setTimeout(() => {
            scope.records.splice(scope.recordIndex, 0, rec);
            scope.$apply();
          });
        } else if (scope.recordIndex === -1) {
          console.log(scope.record);
          scope.records.push(scope.record);
        }
        if (!scope.inline) {
          scope.gridDialog.modal('toggle');
        }
        scope._incChanges();
      };


      scope.showDialog = function (index) {

        if (index != null) {
          // Show item dialog
          scope.recordIndex = index;

          if (scope.records[index] && !scope.records[index].$modified) {
            scope.dataSource.get(scope.records[index].id, 0, false, index)
              .done(res => {
                scope.records[index] = res;
                scope.dataSource.edit();
              });

          }
          else
            scope.record = scope.records[index];

        } else
          scope.recordIndex = -1;

        let done = () => {

        };

        if (scope._cachedViews.form) {
          renderDialog().done(done);
        } else {
          scope.model.getViewInfo({view_type: 'form'})
          .done(function (res) {
            if (res.result) {
              scope._cachedViews.form = res.result;
              return renderDialog().done(done);
            }
          });
        }

      };

      const masterChanged = scope.masterChanged = (key) => {
        // Ajax load nested data
        scope._changeCount = 0;
        scope.records = [];
        if (key !== null) {
          const data = {};
          data[field.field] = key;
          if (key)
            scope.dataSource.search(data)
            .always(() => scope.dataSource.state = Katrid.Data.DataSourceState.browsing);
        }
      };

      scope.$parent.$watch('recordId', masterChanged);
    }

  }

  uiKatrid.directive('grid', Grid);

})();