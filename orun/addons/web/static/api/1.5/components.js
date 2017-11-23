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
        // Override the field label
        if (attrs.label) {
          field.caption = attrs.label;
        }

        if (element.parent('list').length === 0) {
          let v;
          element.removeAttr('name');

          let widget = Katrid.UI.Widgets.Widget.fromField(field, attrs.widget);
          widget = new widget(scope, attrs, field, element);
          widget.inplaceEditor = inplaceEditor;

          let templ = widget.renderTo('section', inplaceEditor);
          templ = $compile(templ)(scope);
          element.replaceWith(templ);
          if (!inplaceEditor) templ.addClass(`col-md-${widget.cols}`);

          // Add input field for tracking on FormController
          let fcontrol = templ.find('.form-field');
          if (fcontrol.length) {
            fcontrol = fcontrol[fcontrol.length - 1];
            const form = templ.controller('form');
            ctrl = angular.element(fcontrol).data().$ngModelController;
            if (ctrl) {
              form.$addControl(ctrl);
            }
          }

          //templ.find('.field').addClass("col-md-#{attrs.cols or cols or 6}")

          widget.link(scope, templ, fieldAttrs, $compile, field);

          // Remove field attrs from section element
          var fieldAttrs = {};
          for (let att in attrs) {
            v = attrs[att];
            if (att.startsWith('field')) {
              fieldAttrs[att] = v;
              element.removeAttr(att);
              attrs.$set(att);
            }
          }

          return fieldAttrs.name = attrs.name;
        }
      }
    };
  });


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


  uiKatrid.directive('list', ($compile, $http) =>
    ({
      restrict: 'E',
      priority: 700,
      link(scope, element, attrs) {
        let html = Katrid.UI.Utils.Templates.renderList(scope, element, attrs);
        html = $compile(html)(scope);
        return element.replaceWith(html);
      }
    })
  );


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


  uiKatrid.directive('datepicker', ['$filter', $filter =>
    ({
      restrict: 'A',
      priority: 1,
      require: '?ngModel',
      link(scope, element, attrs, controller) {
        let el = element;
        const dateFmt = Katrid.i18n.gettext('yyyy-mm-dd');
        const shortDate = dateFmt.replace(/[m]/g, 'M');
        var calendar = element.parent('div').datepicker({
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
            url: serviceName,
            dataType: 'json',
            quietMillis: 500,
            data(term, page) {
              return {
                q: term,
                count: 1,
                page: page - 1,
                //file: attrs.reportFile
                field: attrs.field
              };
            },
            results(data, page) {
              const res = data.result;
              data = res.items;
              const more = (page * Katrid.Settings.Services.choicesPageLimit) < res.count;
              //if not multiple and (page is 1)
              //  data.splice(0, 0, {id: null, text: '---------'})
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
        if (multiple) {
          cfg['multiple'] = true;
        }
        const el = element.select2(cfg);
        element.on('$destroy', function () {
          $('.select2-hidden-accessible').remove();
          $('.select2-drop').remove();
          return $('.select2-drop-mask').remove();
        });
        el.on('change', function (e) {
          const v = el.select2('data');
          controller.$setDirty();
          if (v) {
            controller.$viewValue = v;
          }
          return scope.$apply();
        });

        return controller.$render = function () {
          if (controller.$viewValue) {
            return element.select2('val', controller.$viewValue);
          }
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


  uiKatrid.directive('decimal', $filter =>
    ({
      restrict: 'A',
      require: 'ngModel',
      link(scope, element, attrs, controller) {

        const precision = parseInt(attrs.precision) || 2;

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
        }).bind('keyup blur', function (event) {
          const newVal = element.maskMoney('unmasked')[0];
          if (newVal.toString() !== controller.$viewValue) {
            controller.$setViewValue(newVal);
            return scope.$apply();
          }
        });

        return controller.$render = function () {
          if (controller.$viewValue) {
            return element.val($filter('number')(controller.$viewValue, precision));
          } else {
            return element.val('');
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
        const field = scope.view.fields[attrs.name];
        if (attrs.domain != null) {
          ({domain} = attrs);
        } else if (field.domain) {
          ({domain} = field);
        }

        if (_.isString(domain)) {
          domain = $.parseJSON(domain);
        }

        el.addClass('form-field');

        if (attrs.serviceName) {
          ({serviceName} = attrs);
        } else {
          serviceName = scope.model.name;
        }

        const newItem = function () {
        };
        const newEditItem = function () {
        };
        let _timeout = null;

        var config = {
          allowClear: true,

          query(query) {
            const data = {
              args: [attrs.name],
              kwargs: {
                count: 1,
                page: query.page,
                q: query.term,
                domain,
                name_fields: (attrs.nameFields && attrs.nameFields.split(',')) || null
              }
            };

            const f = () =>
                $.ajax({
                  url: config.ajax.url,
                  type: config.ajax.type,
                  dataType: config.ajax.dataType,
                  contentType: config.ajax.contentType,
                  data: JSON.stringify(data),
                  success(data) {
                    const res = data.result;
                    data = res.items;
                    const r = (Array.from(data).map((item) => ({id: item[0], text: item[1]})));
                    const more = (query.page * Katrid.Settings.Services.choicesPageLimit) < res.count;
                    if (!multiple && !more) {
                      let msg;
                      const v = sel.data('select2').search.val();
                      if (((attrs.allowCreate && (attrs.allowCreate !== 'false')) || (attrs.allowCreate == null)) && v) {
                        msg = Katrid.i18n.gettext('Create <i>"{0}"</i>...');
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
                    return query.callback({results: r, more});
                  }
                })
              ;
            if (_timeout) {
              clearTimeout(_timeout);
            }
            return _timeout = setTimeout(f, 400);
          },

          ajax: {
            url: `/api/rpc/${serviceName}/get_field_choices/`,
            contentType: 'application/json',
            dataType: 'json',
            type: 'POST'
          },

          formatSelection(val) {
            if ((val.id === newItem) || (val.id === newEditItem)) {
              return Katrid.i18n.gettext('Creating...');
            }
            return val.text;
          },

          formatResult(state) {
            const s = sel.data('select2').search.val();
            if (state.id === newItem) {
              state.str = s;
              return `<strong>${state.text.format(s)}</strong>`;
            } else if (state.id === newEditItem) {
              state.str = s;
              return `<strong>${state.text.format(s)}</strong>`;
            }
            return state.text;
          },

          initSelection(el, cb) {
            let v = controller.$modelValue;
            if (multiple) {
              v = (Array.from(v).map((obj) => ({id: obj[0], text: obj[1]})));
              return cb(v);
            } else if (v) {
              return cb({id: v[0], text: v[1]});
            }
          }
        };

        var {multiple} = attrs;

        if (multiple) {
          config['multiple'] = true;
        }

        sel = sel.select2(config);

        sel.on('change', function (e) {
          let service;
          let v = sel.select2('data');
          if (v && (v.id === newItem)) {
            service = new Katrid.Services.Model(field.model);
            return service.createName(v.str)
            .done(function (res) {
              // check if dialog is needed
              if (res.ok) {
                controller.$setDirty();
                controller.$setViewValue(res.result);
                return sel.select2('val', {id: res.result[0], text: res.result[1]});
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
            service = new Katrid.Services.Model(field.model);
            return service.getViewInfo({ view_type: 'form' })
            .done(function (res) {
              let el = Katrid.Dialogs.showWindow(scope, field, res.result, $compile, $controller);
              el.modal('show').on('hide.bs.modal', () => {
                let elScope = angular.element(el).scope();
                if (elScope.result) {
                  return $.get(`/api/rpc/${serviceName}/get_field_choices/`, {
                    args: attrs.name,
                    ids: elScope.result[0]
                  })
                  .done(function (res) {
                    if (res.ok) {
                      const result = res.result.items[0];
                      controller.$setDirty();
                      controller.$setViewValue(result);
                      return sel.select2('val', {id: result[0], text: result[1]});
                    }
                  });
                }
              })
            });

          } else if (v && multiple) {
            v = (Array.from(v).map((obj) => obj.id));
            return controller.$setViewValue(v);
          } else {
            controller.$setDirty();
            if (v) {
              return controller.$setViewValue([v.id, v.text]);
            } else {
              return controller.$setViewValue(null);
            }
          }
        });

        scope.$watch(attrs.ngModel, (newValue, oldValue) => sel.select2('val', newValue));

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


  uiKatrid.directive('searchView', $compile =>
    ({
      restrict: 'E',
      //require: 'ngModel'
      replace: true,
      link(scope, el, attrs, controller) {
        scope.search = {};
        const widget = new Katrid.UI.Views.SearchView(scope, {});
        widget.link(scope, el, attrs, controller, $compile);
      }
    })
  );


  uiKatrid.directive('searchBox', () =>
    ({
      restrict: 'A',
      require: 'ngModel',
      link(scope, el, attrs, controller) {
        const view = scope.views.search;
        const {fields} = view;

        const cfg = {
          multiple: true,
          minimumInputLength: 1,
          formatSelection: (obj, element) => {
            if (obj.field) {
              element.append(`<span class="search-icon">${obj.field.caption}</span>: <i class="search-term">${obj.text}</i>`);
            } else if (obj.id.caption) {
              element.append(`<span class="search-icon">${obj.id.caption}</span>: <i class="search-term">${obj.text}</i>`);
            } else {
              element.append(`<span class="fa fa-filter search-icon"></span><span class="search-term">${obj.text}</span>`);
            }
          },

          id(obj) {
            if (obj.field) {
              return obj.field.name;
              return `<${obj.field.name} ${obj.id}>`;
            }
            return obj.id.name;
            return obj.id.name + '-' + obj.text;
          },

          formatResult: (obj, element, query) => {
            if (obj.id.type === 'ForeignKey') {
              return `> Pesquisar <i>${obj.id.caption}</i> por: <strong>${obj.text}</strong>`;
            } else if (obj.field && (obj.field.type === 'ForeignKey')) {
              return `${obj.field.caption}: <i>${obj.text}</i>`;
            } else {
              return `Pesquisar <i>${obj.id.caption}</i> por: <strong>${obj.text}</strong>`;
            }
          },

          query: options => {
            if (options.field) {
              scope.model.getFieldChoices(options.field.name, options.term)
              .done(res =>
                options.callback({
                  results: (Array.from(res.result).map((obj) => ({id: obj[0], text: obj[1], field: options.field})))
                })
              );
              return;
            }

            options.callback({
              results: ((() => {
                const result = [];
                for (let f in fields) {
                  result.push({id: fields[f], text: options.term});
                }
                return result;
              })())
            });
          }
        };

        el.select2(cfg);
        el.data('select2').blur();
        el.on('change', () => {
          return controller.$setViewValue(el.select2('data'));
        });

        el.on('select2-selecting', e => {
          if (e.choice.id.type === 'ForeignKey') {
            const v = el.data('select2');
            v.opts.query({
              element: v.opts.element,
              term: v.search.val(),
              field: e.choice.id,
              callback(data) {
                v.opts.populateResults.call(v, v.results, data.results, {term: '', page: null, context: v.context});
                return v.postprocessResults(data, false, false);
              }
            });

            return e.preventDefault();
          }
        });

      }
    })
  );

  uiKatrid.controller('TabsetController', [
    '$scope',
    function ($scope) {
      const ctrl = this;
      const tabs = (ctrl.tabs = ($scope.tabs = []));

      ctrl.select = function (selectedTab) {
        angular.forEach(tabs, function (tab) {
          if (tab.active && (tab !== selectedTab)) {
            tab.active = false;
            tab.onDeselect();
          }
        });
        selectedTab.active = true;
        selectedTab.onSelect();
      };

      ctrl.addTab = function (tab) {
        tabs.push(tab);
        // we can't run the select function on the first tab
        // since that would select it twice
        if (tabs.length === 1) {
          tab.active = true;
        } else if (tab.active) {
          ctrl.select(tab);
        }
      };

      ctrl.removeTab = function (tab) {
        const index = tabs.indexOf(tab);
        //Select a new tab if the tab to be removed is selected and not destroyed
        if (tab.active && (tabs.length > 1) && !destroyed) {
          //If this is the last tab, select the previous tab. else, the next tab.
          const newActiveIndex = index === (tabs.length - 1) ? index - 1 : index + 1;
          ctrl.select(tabs[newActiveIndex]);
        }
        tabs.splice(index, 1);
      };

      var destroyed = undefined;
      $scope.$on('$destroy', function () {
        destroyed = true;
      });
    }
  ]);

  uiKatrid.directive('tabset', () =>
    ({
      restrict: 'EA',
      transclude: true,
      replace: true,
      scope: {
        type: '@'
      },
      controller: 'TabsetController',
      template: "<div><div class=\"clearfix\"></div>\n" +
      "  <ul class=\"nav nav-{{type || 'tabs'}}\" ng-class=\"{'nav-stacked': vertical, 'nav-justified': justified}\" ng-transclude></ul>\n" +
      "  <div class=\"tab-content\">\n" +
      "    <div class=\"tab-pane\" \n" +
      "         ng-repeat=\"tab in tabs\" \n" +
      "         ng-class=\"{active: tab.active}\"\n" +
      "         tab-content-transclude=\"tab\">\n" +
      "    </div>\n" +
      "  </div>\n" +
      "</div>\n",
      link(scope, element, attrs) {
        scope.vertical = angular.isDefined(attrs.vertical) ? scope.$parent.$eval(attrs.vertical) : false;
        return scope.justified = angular.isDefined(attrs.justified) ? scope.$parent.$eval(attrs.justified) : false;
      }
    })
  );


  uiKatrid.directive('tab', [
    '$parse',
    $parse =>
      ({
        require: '^tabset',
        restrict: 'EA',
        replace: true,
        template: "<li ng-class=\"{active: active, disabled: disabled}\">\n" +
        "  <a href ng-click=\"select()\" tab-heading-transclude>{{heading}}</a>\n" +
        "</li>\n",
        transclude: true,
        scope: {
          active: '=?',
          heading: '@',
          onSelect: '&select',
          onDeselect: '&deselect'
        },
        controller() {
          //Empty controller so other directives can require being 'under' a tab
        },
        compile(elm, attrs, transclude) {
          return function (scope, elm, attrs, tabsetCtrl) {
            scope.$watch('active', function (active) {
              if (active) {
                tabsetCtrl.select(scope);
              }
            });
            scope.disabled = false;
            if (attrs.disabled) {
              scope.$parent.$watch($parse(attrs.disabled), function (value) {
                scope.disabled = !!value;
              });
            }

            scope.select = function () {
              if (!scope.disabled) {
                scope.active = true;
              }
            };

            tabsetCtrl.addTab(scope);
            scope.$on('$destroy', function () {
              tabsetCtrl.removeTab(scope);
            });
            //We need to transclude later, once the content container is ready.
            //when this link happens, we're inside a tab heading.
            scope.$transcludeFn = transclude;
          };
        }

      })

  ]);

  uiKatrid.directive('tabHeadingTransclude', [() =>
    ({
      restrict: 'A',
      require: '^tab',
      link(scope, elm, attrs, tabCtrl) {
        scope.$watch('headingElement', function (heading) {
          if (heading) {
            elm.html('');
            elm.append(heading);
          }
        });
      }

    })

  ]);


  uiKatrid.directive('tabContentTransclude', function () {

    const isTabHeading = node => node.tagName && (node.hasAttribute('tab-heading') || node.hasAttribute('data-tab-heading') || (node.tagName.toLowerCase() === 'tab-heading') || (node.tagName.toLowerCase() === 'data-tab-heading'));

    return {
      restrict: 'A',
      require: '^tabset',
      link(scope, elm, attrs) {
        const tab = scope.$eval(attrs.tabContentTransclude);
        //Now our tab is ready to be transcluded: both the tab heading area
        //and the tab content area are loaded.  Transclude 'em both.
        tab.$transcludeFn(tab.$parent, function (contents) {
          angular.forEach(contents, function (node) {
            if (isTabHeading(node)) {
              //Let tabHeadingTransclude know.
              tab.headingElement = node;
            } else {
              elm.append(node);
            }
          });
        });
      }

    };
  });


  uiKatrid.filter('m2m', () =>
    function (input) {
      if (_.isArray(input)) {
        return (Array.from(input).map((obj) => obj[1])).join(', ');
      }
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


  uiKatrid.directive('statusField', ['$compile', '$timeout', ($compile, $timeout) =>
    ({
      restrict: 'A',
      require: 'ngModel',
      scope: {},
      link(scope, element, attrs, controller) {
        const field = scope.$parent.view.fields[attrs.name];
        const html = $compile(Katrid.UI.Utils.Templates.renderStatusField(field.name))(scope);
        scope.choices = field.choices;
        $timeout(function () {
          // append element into status bar
          element.closest('.content.jarviswidget').find('header').append(html);
          // remove old element
          return $(element).closest('section').remove();
        });

        if (!attrs.readonly) {
          return scope.itemClick = () => console.log('status field item click');
        }
      }
    })

  ]);

  uiKatrid.directive('kanbanDraggable', () => {
    return {
      restrict: 'A',
      link(scope, element, attrs, controller) {
        let cfg = {
          connectWith: attrs.kanbanDraggable,
          items: '> .sortable-item'
        };
        // Draggable write expression
        if (!_.isUndefined(attrs.kanbanItem))
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
        if (!_.isUndefined(attrs.kanbanGroup))
          cfg['update'] = (event, ui) => {
            let ids = [];
            $.each(ui.item.parent().find('.kanban-group'), (idx, el) => {
              ids.push($(el).data('id'));
            });
            let groupName = element.find('.kanban-group').first().data('group-name');
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

  uiKatrid.directive('action', ($compile) => ({
    restrict: 'E',
    priority: 99,
    link: (scope, el, attrs) => {
      console.log('define action', attrs.ngClick);
      let div = el.closest('div.data-form');
      let actions = div.find('.dropdown-menu-actions');
      let name = attrs.name;
      let label = el.html();
      scope.doTest = () => console.log(scope.model);
      let html = `<li><a href="javascript:void(0)">${label}</a></li>`;
      let newItem = $(html);
      newItem.click(() => {
        if (attrs.object) scope.model.rpc(attrs.object, [scope.$parent.record.id]);
        //scope.$eval(attrs.ngClick);
      });
      actions.append(newItem);
      el.remove();
    }
  }))

}).call(this);

$(document).ready(() => {
  var originalLeave = $.fn.tooltip.Constructor.prototype.leave;
  $.fn.tooltip.Constructor.prototype.leave = function (obj) {
    var self = obj instanceof this.constructor ?
      obj : $(obj.currentTarget)[this.type](this.getDelegateOptions()).data('bs.' + this.type)
    var container, timeout;

    originalLeave.call(this, obj);

    if (obj.currentTarget) {
      container = $(obj.currentTarget).siblings('.tooltip');
      timeout = self.timeout;
      container.one('mouseenter', function () {
        //We entered the actual popover – call off the dogs
        clearTimeout(timeout);
        //Let's monitor popover content instead
        container.one('mouseleave', function () {
          $.fn.tooltip.Constructor.prototype.leave.call(self, self);
        });
      })
    }
  };

});
