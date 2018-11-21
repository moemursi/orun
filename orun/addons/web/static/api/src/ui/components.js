(function () {

  let uiKatrid = Katrid.ui.uiKatrid;

  let formCount = 0;

  uiKatrid.directive('formField', ['$compile', function ($compile) {
    return {
      restrict: 'A',
      priority: 99,
      replace: true,
      // priority: -1,
      compile(el, attrs) {
        return function(scope, element, attrs, ctrl) {
          let field = scope.view.fields[attrs.name];
          if (_.isUndefined(field))
            throw Error('Invalid field name "' + attrs.name + '"');
          let templ = field.template.form;
          field.assign(element);
          if (!field.visible) {
            el.remove();
            return;
          }
          let fieldAttributes = field.getAttributes(attrs);
          let sectionAttrs = {};
          if (fieldAttributes['ng-readonly'])
            sectionAttrs['ng-readonly'] = fieldAttributes['ng-readonly'].toString();
          if (attrs.ngShow)
            sectionAttrs['ng-show'] = attrs.ngShow;
          let content = element.html();
          templ = Katrid.app.getTemplate(templ, {
            name: attrs.name, field, attrs: fieldAttributes, content, fieldAttributes: attrs, sectionAttrs,
          });
          templ = $compile(templ)(scope);
          element.replaceWith(templ);

          // Add input field for tracking on FormController
          let fcontrol = templ.find('.form-field');
          if (fcontrol.length) {
            fcontrol = fcontrol[fcontrol.length - 1];
            const form = templ.controller('form');
            ctrl = angular.element(fcontrol).data().$ngModelController;
            if (ctrl)
              form.$addControl(ctrl);
          }
        }
      },
    };
  }]);

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
      } else if (Katrid.settings.UI.dateInputMask) {
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


  uiKatrid.directive('ajaxChoices', ['$location', $location =>
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
              const more = (page * Katrid.settings.services.choicesPageLimit) < res.count;
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
    })]
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
      let field = scope.view.fields[attrs.name];
      let precision = field.decimalPlaces;
      if (attrs.decimalPlaces)
       precision = parseInt(attrs.decimalPlaces);

      const thousands = attrs.uiMoneyThousands || ".";
      const decimal = attrs.uiMoneyDecimal || ",";
      const symbol = attrs.uiMoneySymbol;
      const negative = attrs.uiMoneyNegative || true;

      const el = $(element).number(true, precision, decimal, thousands);

      // controller.$render = () => {
      //   if (controller.$viewValue) {
      //     return element.val(this.$filter('number')(controller.$viewValue, precision));
      //   } else {
      //     return element.val('');
      //   }
      // };
      //
      // controller.$parsers.push(value => {
      //   if (_.isString(value) && value) {
      //     value = value.replace(new RegExp(`\\${thousands}`, 'g'), '');
      //     value = parseInt(value);
      //   } else if (value)
      //     return value;
      //   else
      //     value = null;
      //   return value;
      // })
    }

  }

  uiKatrid.directive('decimal', ['$filter', Decimal]);



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
        console.log('parser', value, controller);
        if (_.isDate(value)) {
          if (attrs['type'] === 'date')
            return moment.utc(value).format('YYYY-MM-DD');
          else
            return moment.utc(value).format('YYYY-MM-DDTHH:mm:ss');
        }
      });

    }
  })]);


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

  uiKatrid.directive('action', ['$compile', ($compile) => ({
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
  })]);

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

})();
