(function () {

  Katrid.bootstrap();

  const ngApp = angular.module('katridApp', ['ngRoute', 'ngCookies', 'ngSanitize', 'cfp.hotkeys', 'ui-katrid'].concat(Katrid.Settings.additionalModules));

  ngApp.config(['$locationProvider', function($locationProvider) {
    $locationProvider.hashPrefix('');
  }]);

  ngApp.run(
    ['$route', '$rootScope', '$location', '$templateCache', ($route, $rootScope, $location, $templateCache) => {
      Katrid.UI.Templates.init($templateCache);
      let original = $location.path;
      $location.path = function (path, reload, info) {
        if (info) {
          let un = $rootScope.$on('$locationChangeSuccess', function () {
            // use cached action info
            $route.current.actionInfo = info;
            un();
          });
        }
        r = original.apply($location, [path]);
        return r;
      };
    }]
  );

  // ngApp.run(['$route', '$rootScope', '$location', function($route, $rootScope, $location) {
  //
  //   const original = $location.path;
  //   return $location.path = function(path, currentAction, back) {
  //     let reload;
  //     if (currentAction === false) {
  //       reload = false;
  //     } else {
  //       reload = true;
  //     }
  //
  //     if (currentAction != null) {
  //       const lastRoute = $route.current;
  //       var un = $rootScope.$on('$locationChangeSuccess', function() {
  //         if ($route.current) {
  //           $route.current.currentAction = currentAction;
  //           $route.current.reload = reload;
  //           $route.current.back = back;
  //         }
  //         return un();
  //       });
  //     }
  //     return original.apply($location, [path]);
  //   };
  // }
  // ]);


  // ngApp.factory('actions', () =>
  //   ({
  //     get(service, id) {
  //       return $.get(`/web/action/${service}/${id}/` );
  //     }
  //   })
  // );


  let setContent = function(content, scope) {
    const doButtonClick = function() {
      const btn = $(this);
      const meth = btn.prop('name');
      return scope.model.post(meth, { kwargs: { id: scope.record.id } })
      .done(function(res) {
        if (res.ok) {
          if (res.result.type) {
            const act = new (Katrid.Actions[res.result.type])(res.result, scope, scope.location);
            return act.execute();
          }
        }
      });
    };

    $('html, body').animate({ scrollTop: 0 }, 'fast');
    content = scope.content = $(content);

    //# Prepare form special elements
    // Prepare form header
    const header = content.find('form header').first();
    // Create a new scope for the new form element
    // const newScope = scope.$new(false);
    let el = Katrid.core.compile(scope.content)(scope);
    el.find('form.full-width').closest('.container').removeClass('container').find('.card').first().addClass('full-width no-border');
    el = Katrid.core.rootElement.html(el);

    // Get the first form controller
    scope.formElement = el.find('form').first();
    scope.form = scope.formElement.controller('form');

    // Add form header
    if (header.length) {
      let newHeader = Katrid.core.compile(header)(scope);
      el.find('header').first().replaceWith(newHeader);
      newHeader.addClass('content-container-heading');
      let headerButtons = $('<div class="header-buttons"></div>');
      newHeader.prepend(headerButtons);
      (() => {
        const result = [];
        for (let child of header.children()) {
          child = $(child);
          if (!child.attr('class')) {
            child.addClass('btn btn-default');
          }
          if (child.prop('tagName') === 'BUTTON') headerButtons.append(child);
          if ((child.prop('tagName') === 'BUTTON') && (child.attr('type') === 'object')) {
            child.attr('type', 'button');
            child.attr('button-type', 'object');
            result.push(child.click(doButtonClick));
          } else if ((child.prop('tagName') === 'BUTTON') && !child.attr('type')) {
            result.push(child.attr('type', 'button'));
          } else {
            result.push(undefined);
          }
        }
        return result;
      })();
    }
  };

  const actionTempl = `<div id="katrid-action-view"><h4 id="h-loading" class="ajax-loading-animation"><i class="fa fa-cog fa-spin"></i> {{ ::_.gettext('Loading...') }}</h4></div>`;

  ngApp.config(function($routeProvider) {
    $routeProvider
    .when('/client/action/:actionName/', {

    })
    .when('/action/:actionId/', {
      controller: 'ActionController',
      reloadOnSearch: false,
      resolve: {
        action: ['$route',
          ($route) => {
            if ($route.current.actionInfo)
              return $route.current.actionInfo;
            Katrid.Actions.actionManager.clear();
            return Katrid.Services.Actions.load($route.current.params.actionId);
          }
        ],
        reset: () => true
      },
      template: actionTempl
    })
    .when('/action/:service/view/', {
      controller: 'ActionController',
      reloadOnSearch: false,
      resolve: {
        action: ['$route', function($route) {
          let act = $.post(
            '/api/rpc/' + $route.current.params.service + '/get_formview_action/', { id: $route.current.params.id }
          );
          let defer = $.Deferred();
          act.done(res => defer.resolve(res.result));
          return defer;
        }],
        reset: () => false
      },
      template: actionTempl
    }).when('/menu/:menuId/', {
      controller: 'MenuController',
      resolve: {
        menu: ['$route', ($route) => {
          return $route.current.params.menuId;
        }]
      },
      reloadOnSearch: false,
      template: actionTempl
    });
  });

  ngApp.controller('BasicController', function($scope, $compile, $location) {
    $scope.compile = $compile;
    return $scope.Katrid = Katrid;
  });

  ngApp.controller('MenuController', function($scope, menu) {
    console.log('menu controller');
    let action = $(`#left-side-menu[data-menu-id='${ menu }']`).find('.menu-item-action').first();
    $scope.$parent.current_menu = parseInt(menu);
    action.click();
  });


  class DialogLocation {
    constructor() {
      this.$$search = {};
    }
    search() {}
  }

  let $set = function(field, value) {
    $scope.record[field] = value;
    $scope.$setDirty(field);
  };

  function prepareScope(scope, $location) {
    scope._ = _;
    scope.data = null;
    scope.location = $location;
    scope.record = null;
    Object.defineProperty(scope, 'self', {
      get: () => (scope.record)
    });
    scope.recordIndex = null;
    scope.recordId = null;
    scope.records = null;
    scope.viewType = null;
    scope.recordCount = 0;
    scope.dataSource = new Katrid.Data.DataSource(scope);
    scope.$set = $set;
    scope.$setDirty = (field) => {
      const control = scope.form[field];
      if (control) {
        control.$setDirty();
      }
    };

  }


  ngApp.controller('ActionController', function($scope, $compile, $location, $route, action, reset, hotkeys) {
    prepareScope($scope, $location);
    Katrid.core.setContent = setContent;
    Katrid.core.compile = $compile;
    $scope.Katrid = Katrid;

    $scope.$on('$locationChangeStart', function(event) {
      if ($scope.dataSource && $scope.dataSource._pendingChanges) {
        let answer = confirm(Katrid.i18n.gettext("You still have pending changes, are you sure you want to leave this page?"));
        if (!answer)
          event.preventDefault();
      }
    });

    hotkeys.bindTo($scope)
    .add({
      combo: 'ctrl+s',
      description: 'Save record changes',
      allowIn: ['INPUT', 'SELECT', 'TEXTAREA'],
      callback: (evt) => {
        evt.preventDefault();
        $scope.dataSource.save();
      }
    })
    .add({
      combo: 'f2',
      description: 'Edit record',
      allowIn: ['INPUT', 'SELECT', 'TEXTAREA'],
      callback: (evt) => {
        evt.preventDefault();
        $scope.dataSource.edit();
        console.log('edit');
      }
    })
    .add({
      combo: 'esc',
      allowIn: ['INPUT', 'SELECT', 'TEXTAREA'],
      callback: (evt) => {
        if (!$(evt.target).hasClass('modal')) {
          let btn = $('.maximize-button').first();
          if ($scope.dataSource && $scope.dataSource.changing) {
            evt.preventDefault();
            $scope.dataSource.cancel();
          }
          else if (btn.closest('div.card.data-panel').hasClass('box-fullscreen')) {
            evt.preventDefault();
            btn.click();
          }
        }
      }
    });

    let initAction = (action) => {
      let act, location;
      if ($scope.isDialog) location = new DialogLocation();
      else location = $location;

      $scope.action = act = new (Katrid.Actions[action.action_type])(action, $scope, location);
      // restored cached action datae
      if (action.__cached)
        act.views = Katrid.Actions.Action.history[Katrid.Actions.Action.history.length - 1].views;
      if (reset)
        Katrid.Actions.Action.history = [];
      Katrid.Actions.Action.history.push($scope.action);
      if (_.isArray(action.model))
        action.model = action.model[1];
      if (action.model)
        $scope.model = new Katrid.Services.Model(action.model, $scope);
      if ($scope.isDialog)
        act.isDialog = $scope.isDialog;
      if ($scope.parentAction)
        act.parentAction = $scope.parentAction;

      if (act && act.isDialog) {
        act.routeUpdate({ view_type: action.view_type });
        act.createNew();
      } else act.routeUpdate($location.$$search);
    };

    // Check if the element is a child
    if ($scope.parentAction) {
    } else {
      Katrid.core.rootElement = angular.element('#katrid-action-view');
      $scope.$on('$routeUpdate', () => $scope.action.routeUpdate($location.$$search));
      // $scope.$on('$routeUpdate', () => console.log('route update'));
      // $scope.$on('$locationChangeStart', () => console.log('location change start'));
    }
    initAction(action);
  });


  this.Katrid.ngApp = ngApp;

})();
