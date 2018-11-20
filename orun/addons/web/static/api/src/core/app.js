(function() {

  class Application {

    constructor(opts) {
      Katrid.app = this;
      this.actionManager = new Katrid.Actions.ActionManager();
      this.title = opts.title;
      this.plugins = ['ui.router', 'ui.katrid', 'ngSanitize'];

      // initialize sync resources
      $.get('/web/client/templates/')
      .then((templates) => {

        // initialize angular app (katrid module)
        this.ngApp = angular.module('katridApp', this.plugins)
        .run(['$templateCache', ($templateCache) => {
          this.$templateCache = $templateCache;
          new Katrid.ui.Templates(this, templates);
        }])

        // config hash
        .config(['$locationProvider', function ($locationProvider) {
          $locationProvider.hashPrefix('');
        }])

        // config urls
        .config(['$stateProvider', ($stateProvider) => {
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
                  Katrid.app.actionManager.clear();
                  let info = await Katrid.Services.Actions.load(params.actionId);
                  let model = new Katrid.Services.Model(info.model);
                  let action = new (Katrid.Actions[info.action_type])(info, null, $location);
                  action.model = model;
                  $state.$current.data = {action};
                  await action.execute();
                  return action;
                }
              ]
            },
            templateProvider: ['$stateParams', '$state', async ($stateParams, $state) => {
              let action = $state.$current.data.action;
              if (action.info.action_type === 'ir.action.window') {
                let views = $state.$current.data.action.views;
                if (views)
                  Object.keys(views).map(k => views[k].type = k);
                return this.getTemplate(action.templateUrl, {views: $state.$current.data.action.views});
              } else
                return this.getTemplate(action.templateUrl);
            }]
          })
        }]);

        this._initControllers();

        angular.element(function () {
          angular.bootstrap(document, ['katridApp']);
          $(Katrid).trigger('app.ready', [this]);
        });
      });
    }

    getTemplate(tpl, context) {
      let text = this.$templateCache.get(tpl);
      if (tpl.endsWith('pug')) {
        text = text(context);
      }
      return text;
    }

    static get context() {
      return this.actionManager.context;
    }

    _initControllers() {

      this.ngApp.controller('MenuController', ['$scope', '$stateParams', function($scope, $stateParams) {
        setTimeout(() => {
          let menu = $stateParams.menuId;
          let action = $(`#left-side-menu[data-menu-id='${ menu }']`).find('.menu-item-action').first();
          $scope.$parent.current_menu = parseInt(menu);
          action.click();
        }, 0);
      }]);

      this.ngApp.controller('ActionController', ['$scope', '$compile', '$state', 'action', '$element', '$location',
        '$transitions', function($scope, $compile, $state, action, $element, $location, $transitions) {

        Katrid.Core.compile = $compile;
        action.$state = $state;
        action.scope = $scope;
        action.$element = $element;
        $scope.action = action;
        $scope.model = action.model;
        // add katrid namespace to scope
        $scope.Katrid = Katrid;

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

        $transitions.onBefore({ to: 'actionView' }, function(transition, state) {
          if ($state.params.actionId !== transition.params().actionId)
            action._unregisterHook();
        });

        if (action instanceof Katrid.Actions.WindowAction)
          action.viewType = $location.$$search.view_type || action.viewModes[0];

        action._unregisterHook = $scope.$on('$locationChangeSuccess', () => {
          action.routeUpdate($location.$$search);
        });

        action.routeUpdate($location.$$search);

      }]);
    }
  }

  Katrid.Core.Application = Application;

})();
