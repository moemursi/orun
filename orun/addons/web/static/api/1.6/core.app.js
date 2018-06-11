(function () {

  Katrid.bootstrap();

  const ngApp = angular.module('katridApp', ['ui.router', 'ngRoute', 'ngCookies', 'ngSanitize', 'cfp.hotkeys', 'ui.katrid'].concat(Katrid.Settings.additionalModules));

  ngApp.config(['$locationProvider', function($locationProvider) {
    $locationProvider.hashPrefix('');
  }]);

  ngApp.run(function ($rootScope, $state, $transitions) {
  });

  ngApp.run(
    ['$route', '$rootScope', '$location', '$templateCache', ($route, $rootScope, $location, $templateCache) => {
      Katrid.UI.Templates.init($templateCache);
      let original = $location.path;
      $location.path = function (path, reload, info) {
        if (info) {
          let un = $rootScope.$on('$locationChangeSuccess', function () {
            // use cached action info
            // $route.current.actionInfo = info;
            un();
          });
        }
        r = original.apply($location, [path]);
        return r;
      };
    }]
  );

  // const actionTempl = `<ui-view><h4 id="h-loading" class="ajax-loading-animation"><i class="fa fa-refresh fa-spin"></i> <span ng-bind="::_.gettext('Loading...')"></span></h4></ui-view>`;

  ngApp.config(function($stateProvider) {
    $stateProvider
    .state('menuEntry', {
      url: '/menu/:menuId/',
      controller: 'MenuController',
      reloadOnSearch: false
    })
    .state('actionView', {
      url: '/action/:actionId/?view_type&id',
      reloadOnSearch: false,
      controller: 'ActionController',
      resolve: {
        action: ['$stateParams', '$state', '$location',
          async ($stateParams, $state, $location) => {
            let params = $stateParams;
            Katrid.Actions.actionManager.clear();
            let info = await Katrid.Services.Actions.load(params.actionId);
            let model = new Katrid.Services.Model(info.model);
            let action = new (Katrid.Actions[info.action_type])(info, null, $location);
            action.model = model;
            $state.$current.data = { action };
            await action.execute();
            return action;
          }
        ]
      },
      templateProvider: async ($stateParams, $state) => {
        return $state.$current.data.action.template;
        // return $state.$current.data.action.template;
      }
    })
    .state('modelView', {
      url: '/action/:service/view/?view_type&id',
      controller: 'ActionController',
      reloadOnSearch: false,
      resolve: {
        action: ['$stateParams', '$state', '$location',
          async function($stateParams, $state, $location) {
            let info = await (
              new Katrid.Services.Model($stateParams.service))
              .rpc('get_formview_action', [$stateParams.id]
            );

            let model = info.model;
            if (model instanceof Array)
              model = model[1];
            model = new Katrid.Services.Model(model);
            let action = new (Katrid.Actions[info.action_type])(info, null, $location);
            action.model = model;
            $state.$current.data = { action };
            await action.execute();
            action.viewType = $stateParams.view_type;
            return action;

          }
        ],
      },
      templateProvider: ($stateParams, $state) => {
        return $state.$current.data.action.template;
      }

    });
  });


  ngApp.controller('MenuController', function($scope, $stateParams) {
    setTimeout(() => {
      let menu = $stateParams.menuId;
      let action = $(`#left-side-menu[data-menu-id='${ menu }']`).find('.menu-item-action').first();
      $scope.$parent.current_menu = parseInt(menu);
      action.click();
    }, 0);
  });


  ngApp.controller('LoginController', function($scope, $location) {
    $scope.login = (username, password) => {
      $scope.loading = true;
      Katrid.Services.Auth.login(username, password)
      .then(res => {
        if (res.success) {
          console.log(res.redirect);
          $scope.messages = [{ message: _.gettext('Loading...'), type: 'success' }];
          if ($location.$$url)
            window.location.href = '/web/#' + $location.$$url;
          else if (res.redirect)
            window.location.href = res.redirect;
        } else {
          $scope.loading = false;
          $scope.messages = [{ message: res.message, type: 'danger' }];
        }
        $scope.$apply();
      })
      .catch(() => {
        $scope.loading = false;
        $scope.$apply();
      });
    }
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

  ngApp.controller('ActionController', function($scope, $compile, $state, $location, hotkeys, $element, action) {
    Katrid.core.compile = $compile;
    action.$state = $state;
    action.scope = $scope;
    action.$element = $element;
    console.log('action controller', $location);
    if (action instanceof Katrid.Actions.WindowAction)
      action.viewType = $location.$$search.view_type || action.viewModes[0];
    $scope.action = action;
    $scope.model = action.model;

    $scope._ = _;
    $scope.data = null;
    $scope.record = null;
    Object.defineProperty($scope, 'self', {
      get: () => ($scope.record)
    });
    $scope.recordIndex = null;
    $scope.recordId = null;
    $scope.records = null;
    $scope.recordCount = 0;
    $scope.dataSource = new Katrid.Data.DataSource($scope);
    $scope.$setDirty = (field) => {
      const control = $scope.form[field];
      if (control) {
        control.$setDirty();
      }
    };

    action.routeUpdate($location.$$search)
    .then(() => {
      action._unregisterHook = $scope.$on('$locationChangeSuccess', () => {
        action.routeUpdate($location.$$search);
      });
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
  });


  ngApp.controller('ActionController1', function($scope, $compile, $location, $route, action, reset, hotkeys) {
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
      // $scope.$on('$locationChangeStart', () => console.log('location change start'));
    }
    initAction(action);
  });


  this.Katrid.ngApp = ngApp;

})();
