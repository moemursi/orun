(function() {

  Katrid.ui.uiKatrid.directive("foreignkey", ['$compile', '$controller', ($compile, $controller) => ({
    restrict: "A",
    require: "ngModel",
    link(scope, el, attrs, controller) {
      let serviceName;
      let sel = el;
      let _shown = false;
      const field = scope.view.fields[attrs.name];
      el.addClass("form-field");
      if (attrs.serviceName) serviceName = attrs;
      else if (scope.action) serviceName = scope.action.model.name;
      else serviceName = attrs.foreignkey;
      const newItem = function() {};
      const newEditItem = function() {};
      let _timeout = null;
      let config = {
        allowClear: true,
        query(query) {
          // evaluate domain attribute
          let domain = field.getDomain(el);
          if (domain)
            domain = scope.$eval(field.getDomain(el));

          // make params
          let data = {
            args: [query.term],
            kwargs: {
              count: 1,
              page: query.page,
              domain: domain,
              name_fields: attrs.nameFields && attrs.nameFields.split(",") || null
            }
          };
          const f = () => {
            let svc;
            if (scope.model) svc = scope.model.getFieldChoices(field.name, query.term, data.kwargs);
            else svc = new Katrid.Services.Model(field.model).searchName(data);
            svc.then(res => {
              let data = res.items;
              const r = data.map(item => ({
                id: item[0],
                text: item[1]
              }));
              const more = query.page * Katrid.settings.services.choicesPageLimit < res.count;
              if (!multiple && !more) {
                let msg;
                const v = sel.data("select2").search.val();
                if ((attrs.allowCreate && attrs.allowCreate !== "false" || attrs.allowCreate == null) && v) {
                  msg = Katrid.i18n.gettext('Create <i>"%s"</i>...');
                  r.push({
                    id: newItem,
                    text: msg
                  })
                }
                if ((attrs.allowCreateEdit && attrs.allowCreateEdit !== "false" || !attrs.allowCreateEdit) && v) {
                  msg = Katrid.i18n.gettext("Create and Edit...");
                  r.push({
                    id: newEditItem,
                    text: msg
                  })
                }
              }
              return query.callback({
                results: r,
                more: more
              })
            })
          };
          if (_timeout) clearTimeout(_timeout);
          _timeout = setTimeout(f, 400)
        },
        ajax: {
          url: `/api/rpc/${serviceName}/get_field_choices/`,
          contentType: "application/json",
          dataType: "json",
          type: "POST"
        },
        formatSelection(val) {
          if (val.id === newItem || val.id === newEditItem) return Katrid.i18n.gettext("Creating...");
          return val.text
        },
        formatResult(state) {
          const s = sel.data("select2").search.val();
          if (state.id === newItem) {
            state.str = s;
            return `<strong>${sprintf(state.text,s)}</strong>`
          } else if (state.id === newEditItem) {
            state.str = s;
            return `<strong>${sprintf(state.text,s)}</strong>`
          }
          return state.text
        },
        initSelection(el, cb) {
          let v = controller.$modelValue;
          if (multiple) {
            v = v.map(obj => ({
              id: obj[0],
              text: obj[1]
            }));
            return cb(v)
          } else if (_.isArray(v)) {
            return cb({
              id: v[0],
              text: v[1]
            })
          }
        }
      };
      let {
        multiple: multiple
      } = attrs;
      if (multiple) {
        config["multiple"] = true
      }
      sel = sel.select2(config);
      sel.on("change", async e => {
        let v = e.added;
        if (v && v.id === newItem) {
          let service = new Katrid.Services.Model(field.model);
          try {
            let res = await service.createName(v.str);
            controller.$setDirty();
            sel.select2('data', { id: res[0], text: res[1] });
            controller.$setViewValue({
              id: res.result[0],
              text: res.result[1]
            });
          }
          catch {

              let res = await service.getViewInfo({
                view_type: "form"
              });
              let wnd = Katrid.ui.Dialogs.Window(scope, { view: res }, $compile);
              wnd.show();
          }
        } else if (v && v.id === newEditItem) {
          let service = new Katrid.Services.Model(field.model);
          return service.getViewInfo({
            view_type: "form"
          }).done(function(res) {
            let wnd = new Katrid.Dialogs.Window(scope, {
              view: res.result
            }, $compile);
            wnd.show()
          })
        } else if (multiple && e.val.length) {
          return controller.$setViewValue(e.val)
        } else {
          controller.$setDirty();
          if (v) {
            return controller.$setViewValue([v.id, v.text])
          } else {
            return controller.$setViewValue(null)
          }
        }
      }).on("select2-open", () => {
        if (!_shown) {
          _shown = true;
          let parentModal = el.closest("div.modal");
          if (parentModal.length) parentModal.on("hide.bs.modal", () => sel.select2("destroy"))
        }
      });
      controller.$parsers.push(value => {
        if (value) {
          if (_.isArray(value)) return value;
          else if (_.isObject(value)) return [value.id, value.text];
          else return value
        }
        return null
      });
      if (!multiple) scope.$watch(attrs.ngModel, (newValue, oldValue) => sel.select2("val", newValue));
      return controller.$render = function() {
        if (multiple) {
          if (controller.$viewValue) {
            const v = Array.from(controller.$viewValue).map(obj => obj[0]);
            sel.select2("val", v)
          }
        }
        if (controller.$viewValue) {
          return sel.select2("val", controller.$viewValue[0])
        } else {
          return sel.select2("val", null)
        }
      }
    }
  })]);


  Katrid.ui.uiKatrid.filter('m2m', () =>
    function (input) {
      if (_.isArray(input))
        return input.map((obj) => obj ? obj[1] : null).join(', ');
    }
  );


})();
