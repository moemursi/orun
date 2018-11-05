(function() {

  class Grid {
    constructor($compile) {
      this.restrict = 'E';
      this.scope = {};
      this.$compile = $compile;
    }
    async loadViews(scope, element, views) {

      let res = await scope.model.loadViews();
        // detects the relational field
        let fld = res.views.list.fields[scope.field.field];
        // hides the relational field
        if (fld)
          fld.visible = false;

        let newViews = res.views;

        for (let [k, v] of Object.entries(views))
          newViews[k].content = v;

        scope.views = newViews;
        scope.view = newViews.list;
        let content = $(scope.view.content);
        if (scope.inline)
          content.attr('ng-row-click', 'editItem($event, $index)').attr('inline-editor', scope.inline);
        content.attr('list-options', '{"deleteRow": true}');

        // render the list component
        let el = (this.$compile(content)(scope));
        element.html(el);
        element.prepend(this.$compile(Katrid.app.getTemplate('view.form.grid.toolbar.pug'))(scope));
        element.find('table').addClass('table-bordered grid');
    }
    async showDialog(scope, index) {

      let needToLoad = false;

      if (index != null) {
        // Show item dialog
        scope.recordIndex = index;

        if (scope.records[index] && !scope.records[index].$loaded) {
          scope.dataSource.get(scope.records[index].id, 0, false, index)
          .then(res => {
            res.$loaded = true;
            scope.records[index] = res;
            scope.dataSource.edit();

            // load nested data
            let currentRecord = scope.record;
            if (res.id)
              for (let child of dataSource.children) {
                child.scope.masterChanged(res.id)
                .then(res => {
                  _cacheChildren(child.fieldName, currentRecord, res.data);
                })

              }
          });

        }
        else {
          needToLoad = true;
        }

      } else
        scope.recordIndex = -1;

      let done = () => {
        if (needToLoad) {
          scope.record = scope.records[index];
          for (let child of dataSource.children)
            _loadChildFromCache(child);
          scope.$apply();
        }

      };

      if (scope._cachedViews.form) {
        this.renderDialog().then(done);
      } else {
        scope.model.getViewInfo({view_type: 'form'})
        .then(function (res) {
          if (res.result) {
            scope._cachedViews.form = res.result;
            return renderDialog().then(done);
          }
        });
      }

    };

    async link(scope, element, attrs) {
      let me = this;
      // Load remote field model info

      const field = scope.$parent.view.fields[attrs.name];

      scope.totalDisplayed = 1000;
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
      scope.isList = true;

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
      let dataSource = scope.dataSource = new Katrid.Data.DataSource(scope);
      dataSource.readonly = !_.isUndefined(attrs.readonly);
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

      // check if the grid has custom views grid:view
      let views = {};
      for (let child of element.children()) {
        if (child.tagName.startsWith('GRID:')) {
          let viewType = child.tagName.split(':')[1].toLowerCase();
          child = $(child);
          views[viewType] = `<${viewType}>${child.html()}</${viewType}>`;
        }
      }

      await me.loadViews(scope, element, views);

      let _destroyChildren = () => {
        dataSource.children = [];
      };


      scope.doViewAction = (viewAction, target, confirmation) => scope.action._doViewAction(scope, viewAction, target, confirmation);

      let _cacheChildren = (fieldName, record, records) => {
        record[fieldName] = records;
      };

      scope._incChanges = () => {
        //return scope.parent.record[scope.fieldName] = scope.records;
      };

      scope.addItem = () => {
        scope.dataSource.insert();
        if (attrs.$attr.inlineEditor) {
          scope.records.splice(0, 0, scope.record);
          scope.dataSource.edit();
        }
        else
          return this.showDialog(scope);
      };

      scope.addRecord = function (rec) {
        let record = Katrid.Data.createRecord({}, scope.dataSource);
        for (let [k, v] of Object.entries(rec))
          record[k] = v;
        scope.records.push(record);
      };

      scope.cancelChanges = () => scope.dataSource.setState(Katrid.Data.DataSourceState.browsing);

      scope.openItem = index => {
        this.showDialog(scope, index);
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
        rec.$record.$delete();
        //scope.$parent.record.$modifiedData[scope.fieldName].$deleted.append(rec);
        // return scope.dataSource.applyModifiedData(null, null, rec);
      };

      scope.$set = (field, value) => {
        const control = scope.form[field];
        control.$setViewValue(value);
        control.$render();
      };

      scope.save = function () {
        // const data = scope.dataSource.applyModifiedData(scope.form, scope.gridDialog, scope.record);
        if (scope.inline)
          return;
        // return scope.$parent.record[scope.fieldName] = scope.records;
        if (scope.recordIndex > -1) {
          let rec = scope.record;
          scope.record = null;
          scope.records.splice(scope.recordIndex, 1);
          setTimeout(() => {
            scope.records.splice(scope.recordIndex, 0, rec);
            scope.$apply();
          });
        } else if (scope.recordIndex === -1) {
          scope.records.push(scope.record);
          // scope.$parent.record[scope.fieldName] = scope.records;
        }
        if (!scope.inline) {
          scope.gridDialog.modal('toggle');
        }
        scope._incChanges();
      };


      let _loadChildFromCache = (child) => {
        if (scope.record.hasOwnProperty(child.fieldName)) {
          child.scope.records = scope.record[child.fieldName];
        }
      };

      function trim(str) {
        str = str.replace(/^\s+/, '');
        for (let i = str.length - 1; i >= 0; i--) {
          if (/\S/.test(str.charAt(i))) {
            str = str.substring(0, i + 1);
            break;
          }
        }
        return str;
      }

      scope.pasteData = async function () {
        let cache = {};

        let _queryForeignKeyField = async function (field, val) {
          return new Promise(async (resolve, reject) => {

            if (!cache[field.name])
              cache[field.name] = {};
            if (cache[field.name][val] === undefined) {
              let res = await scope.model.getFieldChoices(field.name, val, {exact: true});
              if (res.items && res.items.length)
                cache[field.name][val] = res.items[0];
              else
                cache[field.name][val] = null;
            }
            resolve(cache[field.name][val]);

          });
        };

        let fields = [];
        for (let f of $(scope.view.content).find('field')) {
          let field = scope.view.fields[$(f).attr('name')];
          if (field && (_.isUndefined(field.visible) || field.visible))
            fields.push(field);
        }
        let txt = await navigator.clipboard.readText();

        // read lines
        let rowNo = 0;
        for (let row of txt.split(/\r?\n/)) {
          rowNo++;
          if (row) {
            let i = 0;
            let newObj = {};
            for (let col of row.split(/\t/)) {
              let field = fields[i];
              if (field instanceof Katrid.Data.Fields.ForeignKey)
                newObj[field.name] = await _queryForeignKeyField(field, trim(col));
              else
                newObj[field.name] = trim(col);
              i++;
            }
            scope.addRecord(newObj);
          }
        }
        scope.$apply();
      };


      scope.$on('masterChanged', async function(evt, key) {
        // Ajax load nested data
        scope.dataSet = [];
        scope._changeCount = 0;
        scope.records = [];
        if (key != null) {
          const data = {};
          data[field.field] = key;
          if (key)
            return await scope.dataSource.search(data)
            .finally(() => scope.dataSource.state = Katrid.Data.DataSourceState.browsing);
        }
      });

    }
    renderDialog(scope) {
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
        html = $(Katrid.app.$templateCache.get('view.field.OneToManyField.Dialog').replace('<!-- view content -->', html));
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
          _destroyChildren();
        });
      }
      el.find('.modal-dialog').addClass('ng-form');
      const def = new $.Deferred();
      el.on('shown.bs.modal', () => def.resolve());
      return def;
    };

  }

  Katrid.ui.uiKatrid

  .directive('grid', ['$compile', Grid])

  .directive('list', ['$compile', $compile => ({
    restrict: 'E',
    compile(el, attrs) {
      let rowClick = attrs.ngRowClick;
      let content = el.html();
      let options = JSON.parse(attrs.listOptions);
      let template = Katrid.app.getTemplate('view.list.table.pug', { attrs, rowClick, options });

      return function(scope, el, attrs, controller) {
        let templ = $(template);
        let tr = templ.find('tbody>tr').first();
        let thead = templ.find('thead>tr').first();
        let tfoot = templ.find('tfoot>tr').first();

        let formView;
        if (attrs.inlineEditor) {
          templ.addClass('inline-editor');
          formView = $(scope.views.form.content);
          tr
          .attr('ng-class', "{'group-header': record._hasGroup, 'form-data-changing': (dataSource.changing && dataSource.recordIndex === $index), 'form-data-readonly': !(dataSource.changing && dataSource.recordIndex === $index)}")
          .attr('ng-form', "grid-row-form-{{$index}}")
          .attr('id', 'grid-row-form-{{$index}}');
        }

        // compile fields
        let fields = $('<div>').append(content);
        let totals = [];
        let hasTotal = false;
        for (let fld of fields.children('field')) {
          fld = $(fld);
          let fieldName = fld.attr('name');
          let field = scope.view.fields[fieldName];
          field.assign(fld);

          let total = fld.attr('total');
          if (total) {
            hasTotal = true;
            totals.push({
              field: field,
              name: fieldName,
              total: total,
            });
          }
          else
            totals.push(false);

          if (!field.visible)
            continue;

          let inplaceEditor = false;
          if (formView) {
            inplaceEditor = formView.find(`field[name="${fieldName}"]`);
            inplaceEditor = $(inplaceEditor[0].outerHTML).attr('form-field', 'form-field').attr('inline-editor', attrs.inlineEditor)[0].outerHTML;
          }
          let fieldEl = $(Katrid.app.getTemplate(field.template.list, {
            name: fieldName, field, inplaceEditor,
          }));
          let th = fieldEl.first();
          let td = $(th).next();
          tr.append(td);
          thead.append(th);
        }

        if (hasTotal)
          for (total of totals)
            tfoot.append(Katrid.app.getTemplate('view.list.table.total.pug', {field: total.field}));
        else
          tfoot.remove();

        if (options.deleteRow) {
          let delRow = $(Katrid.app.getTemplate('view.list.table.delete.pug'));
          tr.append(delRow[1]);
          thead.append(delRow[0]);
        }
        el.html('');
        el.append($compile(templ)(scope));
      }
    }
  })]);


})();
