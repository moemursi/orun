(function () {
  let uiKatrid = Katrid.uiKatrid;

  uiKatrid.directive('inlineForm', $compile => ({
    restrict: 'A',
    scope: {}
  }));

  uiKatrid.directive('grid', $compile =>
    ({
      restrict: 'E',
      replace: true,
      scope: {},
      link(scope, element, attrs) {
        // Load remote field model info
        const field = scope.$parent.view.fields[attrs.name];
        scope.action = scope.$parent.action;
        scope.fieldName = attrs.name;
        scope.field = field;
        scope.records = [];
        scope.recordIndex = -1;
        scope._cachedViews = {};
        scope._changeCount = 0;
        scope.dataSet = [];
        scope.parent = scope.$parent;
        scope.model = new Katrid.Services.Model(field.model);

        scope.getContext = function() {
          return {}
        };

        scope.$setDirty = function () {
          return {}
        };

        // Set parent/master data source
        scope.dataSource = new Katrid.Data.DataSource(scope);
        scope.dataSource.readonly = attrs.readonly;
        let p = scope.$parent;
        while (p) {
          if (p.dataSource) {
            scope.dataSource.setMasterSource(p.dataSource);
            break;
          }
          p = p.$parent;
        }

        scope.dataSource.fieldName = scope.fieldName;
        scope.gridDialog = null;
        let gridEl = null;
        // check if element already has the list view template
        let lst = element.find('list');
        if (lst.length) scope.model.getFieldsInfo({ view_type: 'list' }).done(res => {
          loadViews({
            list: {
              content: lst,
              fields: res.result
            }
          })
        });
        else scope.model.loadViews()
          .done(res =>
            scope.$apply(function() {
              // detects the relational field
              let fld = res.result.list.fields[scope.field.field];
              if (fld) fld.visible = false;
              loadViews(res.result);
            })
          );

        var renderDialog = function() {
          let el;
          let html = scope._cachedViews.form.content;
          if (attrs.inline) {
            el = $compile(html)(scope);
            gridEl.find('.inline-input-dialog').append(el);
          } else {
            html = $(Katrid.UI.Utils.Templates.gridDialog().replace('<!-- view content -->', html));
            el = $compile(html)(scope);
          }

          // Get the first form controller
          scope.formElement = el.find('form').first();
          scope.form = scope.formElement.controller('form');
          scope.gridDialog = el;

          if (!attrs.inline) {
            el.modal('show');
            el.on('hidden.bs.modal', function() {
              scope.dataSource.setState(Katrid.Data.DataSourceState.browsing);
              el.remove();
              scope.gridDialog = null;
              return scope.recordIndex = -1;
            });
          }
          return false;
        };

        var loadViews = (obj) => {
          scope._cachedViews = obj;
          scope.view = scope._cachedViews.list;
          let onclick = 'openItem($index)';
          if (attrs.inline === 'tabular') onclick = '';
          const html = Katrid.UI.Utils.Templates.renderGrid(scope, $(scope.view.content), attrs, onclick);
          gridEl = $compile(html)(scope);
          element.replaceWith(gridEl);
          // if (attrs.inline === 'inline') {
          //   return renderDialog();
          // }
          return gridEl;
        };

        scope.doViewAction = (viewAction, target, confirmation) => scope.action._doViewAction(scope, viewAction, target, confirmation);

        scope._incChanges = function() {
          scope.parent.record[`$${scope.fieldName}`] = ++scope._changeCount;
          return scope.parent.record[scope.fieldName] = scope.records;
        };

        scope.addItem = function() {
          scope.dataSource.newRecord();
          if (attrs.inline === 'tabular') {
            scope.records.push({});
          } else if (!attrs.inline) {
            return scope.showDialog();
          }
        };

        scope.cancelChanges = () => scope.dataSource.setState(Katrid.Data.DataSourceState.browsing);

        scope.openItem = function(index) {
          scope.showDialog(index);
          if (scope.parent.dataSource.changing && !scope.dataSource.readonly) {
            return scope.dataSource.editRecord();
          }
        };

        scope.removeItem = function(idx) {
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

        scope.save = function() {
          const data = scope.dataSource.applyModifiedData(scope.form, scope.gridDialog, scope.record);
          if (scope.recordIndex > -1) {
            const rec = scope.records[scope.recordIndex];
            for (let attr in data) {
              const v = data[attr];
              rec[attr] = v;
            }
          } else if (scope.recordIndex === -1) {
            scope.records.push(scope.record);
          }
          if (!attrs.inline) {
            scope.gridDialog.modal('toggle');
          }
          scope._incChanges();
        };

        scope.showDialog = function(index) {
          if (index != null) {
            // Show item dialog
            scope.recordIndex = index;

            if (!scope.dataSet[index]) {
              scope.dataSource.get(scope.records[index].id, 0)
              .done(function(res) {
                if (res.ok) {
                  return scope.$apply(function() {
                    scope.dataSet[index] = scope.record;
                    if (scope.parent.dataSource.changing) {
                      return scope.dataSource.editRecord();
                    }
                  });
                }
              });
            }
            const rec = scope.dataSet[index];
            scope.record = rec;
          } else {
            scope.recordIndex = -1;
          }

          if (scope._cachedViews.form) {
            setTimeout(() => renderDialog());
          } else {
            scope.model.getViewInfo({ view_type: 'form' })
            .done(function(res) {
              if (res.ok) {
                scope._cachedViews.form = res.result;
                return renderDialog();
              }
            });
          }

        };

        const masterChanged = function(key) {
          // Ajax load nested data
          scope._changeCount = 0;
          scope.records = [];
          if (key !== null) {
            const data = {};
            data[field.field] = key;
            scope.dataSource.search(data);
          }
        };

        return scope.$parent.$watch('recordId', key => masterChanged(key));
      }
    })
  );
  }
).call(this);