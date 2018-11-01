(function () {

  let uiKatrid = Katrid.uiKatrid;

  let formCount = 0;

  uiKatrid.directive('field', function ($compile) {
    return {
      restrict: 'E',
      replace: true,
      priority: -1,
      link(scope, element, attrs, ctrl) {
        let inplaceEditor = $(element).closest('.table.dataTable').length > 0;
        let field = scope.view.fields[attrs.name];
        if (field && field.visible === false) {
          element.remove();
          return;
        }
        // Overrides the field label
        if (attrs.label) field.caption = attrs.label;

        if (!element.parent('list').length) {
          let v;
          element.removeAttr('name');

          if (_.isUndefined(field))
            throw Error('Field not found: ' + attrs.name);

          let widget = field.createWidget(attrs.widget, scope, attrs, element);
          widget.inplaceEditor = inplaceEditor;

          let templ = widget.renderTo('section', inplaceEditor);
          templ = $compile(templ)(scope);
          element.replaceWith(templ);
          if (!inplaceEditor && widget.col) templ.addClass(`col-md-${widget.col}`);

          // Add input field for tracking on FormController
          let fcontrol = templ.find('.form-field');
          if (fcontrol.length) {
            fcontrol = fcontrol[fcontrol.length - 1];
            const form = templ.controller('form');
            ctrl = angular.element(fcontrol).data().$ngModelController;
            if (ctrl) form.$addControl(ctrl);
          }

          //templ.find('.field').addClass("col-md-#{attrs.cols or cols or 6}")
          // Remove field attrs from section element
          let fieldAttrs = {};

          widget.link(scope, templ, fieldAttrs, $compile, field);

          for (let [k, v] of Object.entries(attrs))
            if (k.startsWith('field')) {
              fieldAttrs[k] = v;
              element.removeAttr(k);
              attrs.$set(k);
            }

          fieldAttrs.name = attrs.name;
        }
      }
    };
  });

  uiKatrid.directive('inputField', () => ({
    restrict: 'A',
    scope: false,
    link(scope, element, attrs) {
      $(element).on('click', function() {
        // input field select all text on click
        $(this).select();
      });
    }
  }));


  uiKatrid.directive('view', () =>
    ({
      restrict: 'E',
      template(element, attrs) {
        formCount++;
        return '';
      },
      link(scope, element, attrs) {
        if (scope.model) {
          element.attr('class', `view-form-${scope.model.name.replace(new RegExp('\.', 'g'), '-')}`);
          element.attr('id', `katrid-form-${formCount.toString()}`);
          element.attr('model', scope.model);
          return element.attr('name', `dataForm${formCount.toString()}`);
        }
      }
    })
  );

  // uiKatrid.directive('list', ($compile, $http) =>
  //   ({
  //     restrict: 'E',
  //     priority: 700,
  //     link(scope, element, attrs) {
  // console.log('render list');
  //       let html = Katrid.UI.Utils.Templates.renderList(scope, element, attrs);
  //       html = $compile(html)(scope);
  //       return element.replaceWith(html);
  //     }
  //   })
  // );

  class Total {
    constructor($filter) {
      this.restrict = 'E';
      this.scope = false;
      this.replace = true;
      this.$filter = $filter;
    }

    template(el, attrs) {
      if (attrs.type[0] === "'")
        return `<span>${ attrs.type.substring(1, attrs.type.length - 1) }</span>`;
      else
        return `<span ng-bind="total$${attrs.field}|number:2"></span>`;
    }

    link(scope, element, attrs, controller) {
      if (attrs.type[0] !== "'")
        scope.$watch(`records`, (newValue) => {
          let total = 0;
          newValue.map((r) => total += parseFloat(r[attrs.field]));
          console.log('RECORDS CHANGED', total);
          scope['total$' + attrs.field] = total;
        });
    }
  }

  uiKatrid.directive('ngTotal', Total);

  uiKatrid.directive('ngSum', () =>
    ({
      restrict: 'A',
      priority: 9999,
      require: 'ngModel',
      link(scope, element, attrs, controller) {
        const nm = attrs.ngSum.split('.');
        const field = nm[0];
        const subField = nm[1];
        return scope.$watch(`record.$${field}`, function (newValue, oldValue) {
          if (newValue && scope.record) {
            let v = 0;
            scope.record[field].map(obj => v += parseFloat(obj[subField]));
            if (v.toString() !== controller.$modelValue) {
              controller.$setViewValue(v);
              controller.$render();
            }
          }
        });
      }
    })
  );


  uiKatrid.directive('ngEnter', () =>
    (scope, element, attrs) =>
      element.bind("keydown keypress", (event) => {
        if (event.which === 13) {
          scope.$apply(() => scope.$eval(attrs.ngEnter, {$event: event}));
          event.preventDefault();
        }
      })
  );

  uiKatrid.directive('ngEsc', () =>
    (scope, element, attrs) =>
      element.bind("keydown keypress", (event) => {
        if (event.which === 27) {
          scope.$apply(() => scope.$eval(attrs.ngEsc, {$event: event}));
          event.preventDefault();
        }
      })
  );

  uiKatrid.directive('datetimepicker', ['$filter', $filter => ({
    restrict: 'A',
    require: '?ngModel',
    link(scope, el, attrs, controller) {
      let calendar = $(el).datetimepicker({
      });
      const dateFmt = Katrid.i18n.gettext('yyyy-MM-dd hh:mma');
      // Mask date format
      if (Katrid.Settings.UI.dateInputMask === true) {
        console.log('set input mask');
        el = el.mask(dateFmt.replace(/[A-z]/g, 0));
      } else if (Katrid.Settings.UI.dateInputMask) {
        el = el.mask(Katrid.Settings.UI.dateInputMask);
      }

      el.on('click', () => setTimeout(() => $(el).select()));
      controller.$formatters.push(function (value) {
        if (value) {
          const dt = new Date(value);
          // calendar.datepicker('setDate', dt);
          return $filter('date')(value, dateFmt);
        }
        return value;
      });

      controller.$render = function () {
        if (_.isDate(controller.$viewValue)) {
          const v = $filter('date')(controller.$viewValue, dateFmt);
          return el.val(v);
        } else {
          return el.val(controller.$viewValue);
        }
      };

    }
  })]);


  uiKatrid.directive('datepicker', ['$filter', $filter =>
    ({
      restrict: 'A',
      priority: 1,
      require: '?ngModel',
      link(scope, element, attrs, controller) {
        let el = element;
        const dateFmt = Katrid.i18n.gettext('yyyy-mm-dd');
        const shortDate = dateFmt.replace(/[m]/g, 'M');
        var calendar = element.parent('div').datePicker({
          format: dateFmt,
          keyboardNavigation: false,
          language: Katrid.i18n.languageCode,
          forceParse: false,
          autoClose: true,
          showOnFocus: false
        }).on('changeDate', function (e) {
          const dp = calendar.data('datepicker');
          if (dp.picker && dp.picker.is(':visible')) {
            el.val($filter('date')(dp._utc_to_local(dp.viewDate), shortDate));
            return dp.hide();
          }
        });

        el.on('click', () => setTimeout(() => $(el).select()));

        // Mask date format
        if (Katrid.Settings.UI.dateInputMask === true) {
          el = el.mask(dateFmt.replace(/[A-z]/g, 0));
        } else if (Katrid.Settings.UI.dateInputMask) {
          el = el.mask(Katrid.Settings.UI.dateInputMask);
        }

        controller.$formatters.push(function (value) {
          if (value) {
            const dt = new Date(value);
            calendar.datepicker('setDate', dt);
            return $filter('date')(value, shortDate);
          }
        });

        controller.$parsers.push(function (value) {
          if (_.isDate(value)) {
            return moment.utc(value).format('YYYY-MM-DD');
          }
          if (_.isString(value)) {
            return moment.utc(value, shortDate.toUpperCase()).format('YYYY-MM-DD');
          }
        });

        controller.$render = function () {
          if (_.isDate(controller.$viewValue)) {
            const v = $filter('date')(controller.$viewValue, shortDate);
            return el.val(v);
          } else {
            return el.val(controller.$viewValue);
          }
        };

        return el.on('blur', function (evt) {
          let sep, val;
          const dp = calendar.data('datepicker');
          if (dp.picker.is(':visible')) {
            dp.hide();
          }
          if (Array.from(Katrid.i18n.formats.SHORT_DATE_FORMAT).includes('/')) {
            sep = '/';
          } else {
            sep = '-';
          }
          const fmt = Katrid.i18n.formats.SHORT_DATE_FORMAT.toLowerCase().split(sep);
          const dt = new Date();
          let s = el.val();
          if ((fmt[0] === 'd') && (fmt[1] === 'm')) {
            if ((s.length === 5) || (s.length === 6)) {
              if (s.length === 6) {
                s = s.substr(0, 5);
              }
              val = s + sep + dt.getFullYear().toString();
            }
            if ((s.length === 2) || (s.length === 3)) {
              if (s.length === 3) {
                s = s.substr(0, 2);
              }
              val = new Date(dt.getFullYear(), dt.getMonth(), s);
            }
          } else if ((fmt[0] === 'm') && (fmt[1] === 'd')) {
            if ((s.length === 5) || (s.length === 6)) {
              if (s.length === 6) {
                s = s.substr(0, 5);
              }
              val = s + sep + dt.getFullYear().toString();
            }
            if ((s.length === 2) || (s.length === 3)) {
              if (s.length === 3) {
                s = s.substr(0, 2);
              }
              val = new Date(dt.getFullYear(), s, dt.getDay());
            }
          }
          if (val) {
            calendar.datepicker('setDate', val);
            el.val($filter('date')(dp._utc_to_local(dp.viewDate), shortDate));
            return controller.$setViewValue($filter('date')(dp._utc_to_local(dp.viewDate), shortDate));
          }
        });
      }
    })

  ]);

  uiKatrid.directive('ajaxChoices', $location =>
    ({
      restrict: 'A',
      require: '?ngModel',
      link(scope, element, attrs, controller) {
        const {multiple} = attrs;
        const serviceName = attrs.ajaxChoices;
        const cfg = {
          ajax: {
            type: 'POST',
            url: serviceName,
            dataType: 'json',
            quietMillis: 500,
            params: { contentType: "application/json; charset=utf-8" },
            data(term, page) {
              return JSON.stringify({
                q: term,
                count: 1,
                page: page - 1,
                //file: attrs.reportFile
                field: attrs.field,
                model: attrs.modelChoices
              });
            },
            results(res, page) {
              let data = res.items;
              const more = (page * Katrid.Settings.Services.choicesPageLimit) < res.count;
              return {
                results: (Array.from(data).map((item) => ({id: item[0], text: item[1]}))),
                more
              };
            }
          },
          escapeMarkup(m) {
            return m;
          },
          initSelection(element, callback) {
            const v = controller.$modelValue;
            if (v) {
              if (multiple) {
                const values = [];
                for (let i of Array.from(v)) {
                  values.push({id: i[0], text: i[1]});
                }
                return callback(values);
              } else {
                return callback({id: v[0], text: v[1]});
              }
            }
          }
        };
        if (multiple)
          cfg['multiple'] = true;

        const el = element.select2(cfg);
        element.on('$destroy', function () {
          $('.select2-hidden-accessible').remove();
          $('.select2-drop').remove();
          return $('.select2-drop-mask').remove();
        });
        el.on('change', function (e) {
          const v = el.select2('data');
          controller.$setDirty();
          if (v)
            controller.$viewValue = v;

          return scope.$apply();
        });

        controller.$render = () => {
          if (controller.$viewValue)
            return element.select2('val', controller.$viewValue);
        };
      }
    })
  );

  uiKatrid.directive('uiMask', () =>
    ({
      restrict: 'A',
      link(scope, element, attrs) {
        element.mask(attrs.uiMask);
      }
    })
  );


  class Decimal {
    constructor($filter) {
      this.restrict = 'A';
      this.require = 'ngModel';
      this.$filter = $filter;
    }

    link(scope, element, attrs, controller) {
      let precision = 2;
      if (attrs.decimalPlaces)
       precision = parseInt(attrs.decimalPlaces);

      const thousands = attrs.uiMoneyThousands || ".";
      const decimal = attrs.uiMoneyDecimal || ",";
      const symbol = attrs.uiMoneySymbol;
      const negative = attrs.uiMoneyNegative || true;

      const el = element.maskMoney({
        symbol,
        thousands,
        decimal,
        precision,
        allowNegative: negative,
        allowZero: true
      })
      .bind('keyup blur', function (event) {
      });

      controller.$render = () => {
        if (controller.$viewValue) {
          return element.val(this.$filter('number')(controller.$viewValue, precision));
        } else {
          return element.val('');
        }
      };

      controller.$parsers.push(value => {
        if (_.isString(value) && value) {
          if (precision)
             value = element.maskMoney('unmasked')[0];
          else {
            value = value.replace(new RegExp(`\\${thousands}`, 'g'), '');
            value = parseInt(value);
          }
        } else if (value)
          return value;
        else
          value = null;
        return value;
        // if (el.val()) {
        //   if (precision) {
        //     let newVal = element.maskMoney('unmasked')[0];
        //     if (_.isString(newVal))
        //       newVal = parseFloat(newVal.replace(new RegExp('\\' + decimal, 'g'), '.'));
        //     console.log('decimal new val', newVal);
        //     if (newVal !== parseFloat(controller.$viewValue)) {
        //       controller.$setViewValue(parseFloat(newVal));
        //       scope.$apply();
        //     }
        //   } else {
        //     let s = `\\${thousands}`;
        //     let newVal = el.val().replace(new RegExp(s, 'g'), '');
        //     newVal = parseInt(newVal);
        //
        //     if (newVal !== parseInt(controller.$viewValue)) {
        //       controller.$setViewValue(newVal);
        //       scope.$apply();
        //     }
        //   }
        // } else if (controller.$viewValue)
        //   controller.$setViewValue('');
      })
    }

  }

  uiKatrid.directive('decimal', Decimal);

  Katrid.uiKatrid.directive('getFieldChoices', ($compile, $controller) =>
    ({
      restrict: 'A',
      require: 'ngModel',
      link(scope, el, attrs, controller) {
        //f = scope.view.fields['model']
        let domain;
        let sel = el;
        let _shown = false;
        const field = attrs['fieldName'];

        el.addClass('form-field');

        let serviceName = attrs.getFieldChoices;

        let _timeout = null;

        let config = {
          allowClear: true,

          query(query) {

            let data = {
              args: [query.term],
              kwargs: {
                count: 1,
                page: query.page,
                domain,
                name_fields: (attrs.nameFields && attrs.nameFields.split(',')) || null
              }
            };

            const f = () => {
              let svc;
              svc = (new Katrid.Services.Model(serviceName)).getFieldChoices(field, query.term, data.kwargs);
              svc.then(res => {

                console.log(res);
                let data = res.items;
                const r = data.map(item => ({ id: item[0], text: item[1] }));
                const more = (query.page * Katrid.Settings.Services.choicesPageLimit) < res.count;
                return query.callback({ results: r, more });

              });
            };
            if (_timeout)
              clearTimeout(_timeout);

            _timeout = setTimeout(f, 400);
          },

          ajax: {
            url: `/api/rpc/${serviceName}/get_field_choices/`,
            contentType: 'application/json',
            dataType: 'json',
            type: 'POST'
          },

          initSelection(el, cb) {
            let v = controller.$modelValue;
            if (multiple) {
              v = v.map(obj => ({id: obj[0], text: obj[1]}));
              return cb(v);
            } else if (_.isArray(v)) {
              return cb({id: v[0], text: v[1]});
            }
          }
        };

        let {multiple} = attrs;

        if (multiple) {
          config['multiple'] = true;
        }

        sel = sel.select2(config);

        sel.on('change', (e) => {
          let v = e.added;
          if (multiple && e.val.length) {
            return controller.$setViewValue(e.val);
          } else {
            controller.$setDirty();
            if (v) {
              return controller.$setViewValue([v.id, v.text]);
            } else {
              return controller.$setViewValue(null);
            }
          }
        })
        .on('select2-open', () => {
          if (!_shown) {
            // remove select2 on modal hide event
            _shown = true;
            let parentModal = el.closest('div.modal');
            if (parentModal.length)
              parentModal.on('hide.bs.modal', () => sel.select2('destroy'));
          }
        });

        controller.$parsers.push((value) => {
          if (value) {
            if (_.isArray(value))
              return value;
            else if (_.isObject(value))
              return [value.id, value.text];
            else
              return value;
          }
          return null;
        });

        if (!multiple) scope.$watch(attrs.ngModel, (newValue, oldValue) => sel.select2('val', newValue));

        return controller.$render = function () {
          if (multiple) {
            if (controller.$viewValue) {
              const v = (Array.from(controller.$viewValue).map((obj) => obj[0]));
              sel.select2('val', v);
            }
          }
          if (controller.$viewValue) {
            return sel.select2('val', controller.$viewValue[0]);
          } else {
            return sel.select2('val', null);
          }
        };
      }
    })
  );


  Katrid.uiKatrid.directive('foreignkey', ($compile, $controller) =>
    ({
      restrict: 'A',
      require: 'ngModel',
      link(scope, el, attrs, controller) {
        //f = scope.view.fields['model']
        let domain, serviceName;
        let sel = el;
        let _shown = false;
        const field = scope.view.fields[attrs.name];

        if (attrs.domain != null)
          domain = attrs.domain;
        else if (field.domain)
          domain = field.domain;

        el.addClass('form-field');

        if (attrs.serviceName)
          serviceName = attrs;
        else if (scope.action)
          serviceName = scope.action.model.name;
        else
          serviceName = attrs.foreignkey;

        const newItem = function () {};
        const newEditItem = function () {};
        let _timeout = null;

        let config = {
          allowClear: true,

          query(query) {

            let limitChoicesTo;
            if (domain)
              limitChoicesTo = scope.$eval(domain);

            console.log('limit choices', limitChoicesTo, el);
            let data = {
              args: [query.term],
              kwargs: {
                count: 1,
                page: query.page,
                domain: limitChoicesTo,
                name_fields: (attrs.nameFields && attrs.nameFields.split(',')) || null
              }
            };

            const f = () => {
              let svc;
              if (scope.model)
                svc = scope.model.getFieldChoices(field.name, query.term, data.kwargs);
              else
                svc = (new Katrid.Services.Model(field.model)).searchName(data);
              svc.then(res => {

                let data = res.items;
                const r = data.map(item => ({ id: item[0], text: item[1] }));
                const more = (query.page * Katrid.Settings.Services.choicesPageLimit) < res.count;
                if (!multiple && !more) {
                  let msg;
                  const v = sel.data('select2').search.val();
                  if (((attrs.allowCreate && (attrs.allowCreate !== 'false')) || (attrs.allowCreate == null)) && v) {
                    msg = Katrid.i18n.gettext('Create <i>"%s"</i>...');
                    r.push({
                      id: newItem,
                      text: msg
                    });
                  }
                  if (((attrs.allowCreateEdit && (attrs.allowCreateEdit !== 'false')) || !attrs.allowCreateEdit) && v) {
                    msg = Katrid.i18n.gettext('Create and Edit...');
                    r.push({
                      id: newEditItem,
                      text: msg
                    });
                  }
                }
                return query.callback({ results: r, more });

              });

            };
            if (_timeout)
              clearTimeout(_timeout);

            _timeout = setTimeout(f, 400);
          },

          ajax: {
            url: `/api/rpc/${serviceName}/get_field_choices/`,
            contentType: 'application/json',
            dataType: 'json',
            type: 'POST'
          },

          formatSelection(val) {
            if ((val.id === newItem) || (val.id === newEditItem))
              return Katrid.i18n.gettext('Creating...');
            return val.text;
          },

          formatResult(state) {
            const s = sel.data('select2').search.val();
            if (state.id === newItem) {
              state.str = s;
              return `<strong>${sprintf(state.text, s)}</strong>`;
            } else if (state.id === newEditItem) {
              state.str = s;
              return `<strong>${sprintf(state.text, s)}</strong>`;
            }
            return state.text;
          },

          initSelection(el, cb) {
            let v = controller.$modelValue;
            if (multiple) {
              v = v.map(obj => ({id: obj[0], text: obj[1]}));
              return cb(v);
            } else if (_.isArray(v)) {
              return cb({id: v[0], text: v[1]});
            }
          }
        };

        let {multiple} = attrs;

        if (multiple) {
          config['multiple'] = true;
        }

        sel = sel.select2(config);

        sel.on('change', (e) => {
          let v = e.added;
          if (v && (v.id === newItem)) {
            let service = new Katrid.Services.Model(field.model);
            return service.createName(v.str)
            .done((res) => {
              // check if dialog is needed
              if (res.ok) {
                controller.$setDirty();
                controller.$setViewValue({id: res.result[0], text: res.result[1]});
                //sel.select2('val', {id: res.result[0], text: res.result[1]});
              }
            })
            .fail(res => {
              // if error creating record
              // show the creation dialog
              service.getViewInfo({view_type: 'form'})
              .done(res => {
                console.log('view info', res);
              });
            });
          } else if (v && (v.id === newEditItem)) {
            let service = new Katrid.Services.Model(field.model);
            return service.getViewInfo({ view_type: 'form' })
            .done(function (res) {
              let wnd = new Katrid.Dialogs.Window(scope, { view: res.result }, $compile);
              //let el = Katrid.Dialogs.showWindow(scope, field, res.result, $compile, $controller);
              wnd.show();/*.modal('show').on('hide.bs.modal', () => {
                let elScope = wnd.scope;
                if (elScope.result) {
                  return $.get(`/api/rpc/${serviceName}/get_field_choices/`, {
                    args: attrs.name,
                    ids: elScope.result[0]
                  })
                  .done(function (res) {
                    if (res.ok) {
                      controller.$setDirty();
                      controller.$setViewValue({id: res.result[0], text: res.result[1]});
                      // console.log('set value', res.result);
                      // sel.select2('val', {id: res.result[0], text: res.result[1]});
                    }
                  });
                }
              })*/
            });

          } else if (multiple && e.val.length) {
            return controller.$setViewValue(e.val);
          } else {
            controller.$setDirty();
            if (v) {
              return controller.$setViewValue([v.id, v.text]);
            } else {
              return controller.$setViewValue(null);
            }
          }
        })
        .on('select2-open', () => {
          if (!_shown) {
            // remove select2 on modal hide event
            _shown = true;
            let parentModal = el.closest('div.modal');
            if (parentModal.length)
              parentModal.on('hide.bs.modal', () => sel.select2('destroy'));
          }
        });

        controller.$parsers.push((value) => {
          if (value) {
            if (_.isArray(value))
              return value;
            else if (_.isObject(value))
              return [value.id, value.text];
            else
              return value;
          }
          return null;
        });

        if (!multiple) scope.$watch(attrs.ngModel, (newValue, oldValue) => sel.select2('val', newValue));

        return controller.$render = function () {
          if (multiple) {
            if (controller.$viewValue) {
              const v = (Array.from(controller.$viewValue).map((obj) => obj[0]));
              sel.select2('val', v);
            }
          }
          if (controller.$viewValue) {
            return sel.select2('val', controller.$viewValue[0]);
          } else {
            return sel.select2('val', null);
          }
        };
      }
    })
  );


  // uiKatrid.directive('searchView', $compile =>
  //   ({
  //     restrict: 'E',
  //     scope: false,
  //     //require: 'ngModel'
  //     templateUrl: 'view.search',
  //     replace: true,
  //     link(scope, el, attrs, controller) {
  //       console.log(scope);
  //       scope.search = {};
  //       const widget = new Katrid.UI.Views.SearchView(scope, {});
  //       widget.link(scope, el, attrs, controller, $compile);
  //     }
  //   })
  // );


  // uiKatrid.directive('searchBox', () =>
  //   ({
  //     restrict: 'A',
  //     require: 'ngModel',
  //     link(scope, el, attrs, controller) {
  //       const view = scope.views.search;
  //       const {fields} = view;
  //
  //       const cfg = {
  //         multiple: true,
  //         minimumInputLength: 1,
  //         formatSelection: (obj, element) => {
  //           if (obj.field) {
  //             element.append(`<span class="search-icon">${obj.field.caption}</span>: <i class="search-term">${obj.text}</i>`);
  //           } else if (obj.id.caption) {
  //             element.append(`<span class="search-icon">${obj.id.caption}</span>: <i class="search-term">${obj.text}</i>`);
  //           } else {
  //             element.append(`<span class="fa fa-filter search-icon"></span><span class="search-term">${obj.text}</span>`);
  //           }
  //         },
  //
  //         id(obj) {
  //           if (obj.field) {
  //             return obj.field.name;
  //             return `<${obj.field.name} ${obj.id}>`;
  //           }
  //           return obj.id.name;
  //           return obj.id.name + '-' + obj.text;
  //         },
  //
  //         formatResult: (obj, element, query) => {
  //           if (obj.id.type === 'ForeignKey') {
  //             return `> Pesquisar <i>${obj.id.caption}</i> por: <strong>${obj.text}</strong>`;
  //           } else if (obj.field && (obj.field.type === 'ForeignKey')) {
  //             return `${obj.field.caption}: <i>${obj.text}</i>`;
  //           } else {
  //             return `Pesquisar <i>${obj.id.caption}</i> por: <strong>${obj.text}</strong>`;
  //           }
  //         },
  //
  //         query: options => {
  //           if (options.field) {
  //             scope.model.getFieldChoices(options.field.name, options.term)
  //             .done(res =>
  //               options.callback({
  //                 results: (Array.from(res.result).map((obj) => ({id: obj[0], text: obj[1], field: options.field})))
  //               })
  //             );
  //             return;
  //           }
  //
  //           options.callback({
  //             results: ((() => {
  //               const result = [];
  //               for (let f in fields) {
  //                 result.push({id: fields[f], text: options.term});
  //               }
  //               return result;
  //             })())
  //           });
  //         }
  //       };
  //
  //       el.select2(cfg);
  //       el.data('select2').blur();
  //       el.on('change', () => {
  //         return controller.$setViewValue(el.select2('data'));
  //       });
  //
  //       el.on('select2-selecting', e => {
  //         if (e.choice.id.type === 'ForeignKey') {
  //           const v = el.data('select2');
  //           v.opts.query({
  //             element: v.opts.element,
  //             term: v.search.val(),
  //             field: e.choice.id,
  //             callback(data) {
  //               v.opts.populateResults.call(v, v.results, data.results, {term: '', page: null, context: v.context});
  //               return v.postprocessResults(data, false, false);
  //             }
  //           });
  //
  //           return e.preventDefault();
  //         }
  //       });
  //
  //     }
  //   })
  // );


  uiKatrid.filter('m2m', () =>
    function (input) {
      if (_.isArray(input))
        return input.map((obj) => obj ? obj[1] : null).join(', ');
    }
  );


  uiKatrid.filter('moment', () =>
    function (input, format) {
      if (format) {
        return moment().format(format);
      }
      return moment(input).fromNow();
    }
  );


  uiKatrid.directive('fileReader', () =>
    ({
      restrict: 'A',
      require: 'ngModel',
      scope: {},
      link(scope, element, attrs, controller) {

        if (attrs.accept === 'image/*') {
          element.tag === 'INPUT';
        }

        return element.bind('change', function () {
          const reader = new FileReader();
          reader.onload = event => controller.$setViewValue(event.target.result);
          return reader.readAsDataURL(event.target.files[0]);
        });
      }
    })
  );


  uiKatrid.directive('dateInput', ['$filter', ($filter) => ({
    restrict: 'A',
    require: '?ngModel',
    link(scope, element, attrs, controller) {

      let setNow = () => {
        let value;
        if (attrs['type'] === 'date')
           value = (new Date()).toISOString().split('T')[0];
        else
          value = moment(new Date()).format('YYYY-MM-DD HH:mm').replace(' ', 'T');  // remove timezone info
        $(element).val(value);
        controller.$setViewValue(value);
        _focus = false;
      };

      let _focus = true;

      element
      .focus(function() {
        if (($(this).val() === ''))
          _focus = true;
      })
      .keypress(function(evt) {
        if (evt.key.toLowerCase() === 'h') {
          setNow();
          evt.stopPropagation();
          evt.preventDefault();
        }
      })
      .keydown(function(evt) {
        if (/\d/.test(evt.key)) {
          if (($(this).val() === '') && (_focus))
            setNow();
        }
      });

      controller.$formatters.push(function(value) {
        if (value) {
          if (attrs['type'] === 'date')
            return new Date(moment.utc(value).format('YYYY-MM-DD') + 'T00:00');
          else
            return new Date(value);
        }
      });

      controller.$parsers.push(function (value) {
        if (_.isDate(value)) {
          if (attrs['type'] === 'date')
            return moment.utc(value).format('YYYY-MM-DD');
          else
            return moment.utc(value).format('YYYY-MM-DDTHH:mm:ss');
        }
      });

    }
  })]);


  uiKatrid.directive('statusField', ['$compile', '$timeout', ($compile, $timeout) =>
    ({
      restrict: 'E',
      require: 'ngModel',
      replace: true,
      link(scope, element, attrs, controller) {
        const field = scope.$parent.view.fields[attrs.name];
        scope.choices = field.choices;
        if (!attrs.readonly) {
          scope.itemClick = () => console.log('status field item click');
        }
      },
      template(element, attrs) {
        return sprintf(Katrid.$templateCache.get('view.field.StatusField'), { fieldName: attrs.name });
      }
    })

  ]);


  uiKatrid.directive('sortableField', ['$compile', '$timeout', ($compile, $timeout) =>
    ({
      restrict: 'E',
      require: 'ngModel',
      replace: true,
      scope: {},
      link: {
        post: function (scope, el, attrs) {
          let tbl = el.closest('tbody');
          let fixHelperModified = function (e, tr) {
            let $originals = tr.children();
            let $helper = tr.clone();
            $helper.children().each(function (index) {
              $(this).width($originals.eq(index).width())
            });
            return $helper;
          },
          updateIndex = function (e, ui) {
            $('td.list-column-sortable', ui.item.parent()).each(function (i) {
                // $(this).html(i + 1);
            });
          };

          tbl.sortable({
            helper: fixHelperModified,
            stop: updateIndex
          }).disableSelection();
        }
      },
      template(element, attrs) {
        return sprintf(Katrid.$templateCache.get('view.field.SortableField'), { fieldName: attrs.name });
      }
    })

  ]);

  uiKatrid.directive('cardDraggable', () => {
    return {
      restrict: 'A',
      link(scope, element, attrs, controller) {
        let cfg = {
          connectWith: attrs.cardDraggable,
          items: '> .sortable-item'
        };
        // Draggable write expression
        if (!_.isUndefined(attrs.cardItem))
          cfg['receive'] = (event, ui) => {
            let parent = angular.element(ui.item.parent()).scope();
            let scope = angular.element(ui.item).scope();
            console.log(scope);
            console.log(parent);
            let data = {};
            data['id'] = scope.record.id;
            $.extend(data, parent.group._domain);
            parent.model.write([data])
            .then(res => {
              console.log('write ok', res);
            });
          };
        // Group reorder
        if (!_.isUndefined(attrs.cardGroup))
          cfg['update'] = (event, ui) => {
            let ids = [];
            $.each(ui.item.parent().find('.card-group'), (idx, el) => {
              ids.push($(el).data('id'));
            });
            let groupName = element.find('.card-group').first().data('group-name');
            let modelName = scope.$parent.$parent.view.fields[groupName].model;
            Katrid.Services.data.reorder(modelName, ids)
            .done(res => {
              console.log(res);
            });
          };
        element.sortable(cfg).disableSelection();
      }
    };
  });

  uiKatrid.directive('uiTooltip', () => ({
    restrict: 'A',
    link: (scope, el, attrs) => {
      $(el).tooltip({
        container: 'body',
        delay: {
          show: 200,
          hide: 500
        }
      });
    }
  }));

  uiKatrid.setFocus = (el) => {
    let e = $(el);
    // check if element object has select2 data
    if (e.data('select2')) e.select2('focus');
    else el.focus();
  };

  uiKatrid.directive('attachmentsButton', () => ({
    restrict: 'A',
    scope: false,
    link: (scope, el) => {
      let _pendingOperation;
      scope.$parent.$watch('recordId', (key) => {
        let attachment = new Katrid.Services.Model('ir.attachment', scope);
        scope.$parent.attachments = [];
        clearTimeout(_pendingOperation);
        _pendingOperation = setTimeout(() => {
          attachment.search({ params: { model: scope.action.model.name, object_id: key }, count: false })
          .then(res => {
            let r = null;
            if (res && res.data)
              r = res.data;
            scope.$apply(() => scope.attachments = r );
          });
        }, 1000);

      });
    }
  }));

  uiKatrid.directive('action', ($compile) => ({
    restrict: 'E',
    priority: 99,
    link: (scope, el, attrs) => {
      console.log('define action', attrs.ngClick);
      let div = el.closest('div.data-form');
      let actions = div.find('.dropdown-menu-actions');
      let name = attrs.name;
      let label = el.html();
      let html = `<li><a href="javascript:void(0)">${label}</a></li>`;
      let newItem = $(html);
      newItem.click(() => {
        if (attrs.object) scope.model.rpc(attrs.object, [scope.$parent.record.id]);
        //scope.$eval(attrs.ngClick);
      });
      actions.append(newItem);
      el.remove();
    }
  }));

  class CardView {
    constructor() {
      this.restrict = 'E';
      this.scope = false;
    }

    controller($scope, element, attrs) {
      console.log('controller started');
      $scope.dataSource.autoLoadGrouping = true;

      $scope.cardShowAddGroupDlg = (event) => {
        $scope.cardAddGroupDlg = true;
        setTimeout(() => $(event.target).closest('.card-add-group').find('input').focus(), 10);
      };

      $scope.cardAddGroup = (event, name) => {
        let gname = $(event.target).closest('.card-add-group').data('group-name');
        let field = $scope.action.view.fields[gname];
        let svc = new Katrid.Services.Model(field.model);
        console.log('the name is', name);
        svc.createName(name)
        .done((res) => {
          console.log(res);
        });
      };

      $scope.cardAddItem = (event, name) => {
        if (name) {
          let ctx = {};
          let g = $(event.target).closest('.card-group');
          ctx['default_' + g.data('group-name')] = g.data('sequence-id');
          scope.model.createName(name, ctx)
          .done((res) => {
            if (res.ok) {
              let id = res.result[0];
              scope.model.getById(id)
              .done((res) => {
                if (res.ok) {
                  let s = angular.element(event.target).scope();
                  let g = s.group;
                  s.$apply(() => {
                    g.records.push(res.result.data[0]);
                  });
                }
              })
            }
          });
        }
        $scope.kanbanHideAddGroupItemDlg(event);
      };

    }
  }

  if (Katrid.Settings.UI.isMobile) {
    let _select2 = jQuery.fn.select2;
    jQuery.fn.select2 = function () {
      let el = _select2.apply(this, arguments);
      el.off('select2-focus').on('select2-focus', function(evt) {
        $('html, body').scrollTop($($(evt.target).parent()).offset().top);
      });
      return el;
    };
    jQuery.fn.select2.locales = _select2.locales;
    jQuery.fn.select2.defaults = _select2.defaults;
  }

})();
