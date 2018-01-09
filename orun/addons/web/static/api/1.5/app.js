(function () {

  const ngApp = angular.module('katridApp', ['ngRoute', 'ngCookies', 'ngSanitize', 'ui-katrid'].concat(Katrid.Bootstrap.additionalModules));

  ngApp.config(function($interpolateProvider) {
    $interpolateProvider.startSymbol('${');
    return $interpolateProvider.endSymbol('}');
  });

  ngApp.config(['$locationProvider', function($locationProvider) {
    $locationProvider.hashPrefix('');
  }]);

  ngApp.run(['$route', '$rootScope', '$location', function($route, $rootScope, $location) {

    const original = $location.path;
    return $location.path = function(path, currentAction, back) {
      let reload;
      if (currentAction === false) {
        reload = false;
      } else {
        reload = true;
      }

      if (currentAction != null) {
        const lastRoute = $route.current;
        var un = $rootScope.$on('$locationChangeSuccess', function() {
          if ($route.current) {
            $route.current.currentAction = currentAction;
            $route.current.reload = reload;
            $route.current.back = back;
          }
          return un();
        });
      }
      return original.apply($location, [path]);
    };
  }
  ]);


  ngApp.factory('actions', () =>
    ({
      get(service, id) {
        return $.get(`/web/action/${service}/${id}/` );
      }
    })
  );

  const actionTempl = "<div id=\"katrid-action-view\"><h1 class=\"ajax-loading-animation margin-left-8\"><i class=\"fa fa-cog fa-spin\"></i> ${ Katrid.i18n.gettext('Loading...') }</h1></div>";

  ngApp.config(function($routeProvider) {
    $routeProvider
    .when('/action/:actionId/', {
      controller: 'ActionController',
      reloadOnSearch: false,
      resolve: {
        action: ['$route', function($route) {
          if ($route.current.back) {
            $route.current.back.info._back = $route.current.back;
            return $route.current.back.info;
          }
          return $.get(`/web/action/${ $route.current.params.actionId }/`);
        }
        ]
      },
      template: actionTempl
    })
    .when('/action/:service/view/', {
      controller: 'ActionController',
      reloadOnSearch: false,
      resolve: {
        action: ['actions', '$route', function(actions, $route) {
          const { params } = $route.current;
          return {
            model: [null, $route.current.params.service],
            action_type: "sys.action.window",
            view_mode: 'form',
            object_id: params.id,
            display_name: params.title,
            _currentAction: $route.current.currentAction
          };
        }
        ]
      },
      template: actionTempl
    });
  });


  ngApp.controller('BasicController', function($scope, $compile, $location) {
    $scope.compile = $compile;
    return $scope.Katrid = Katrid;
  });


  class DialogLocation {
    constructor() {
      this.$$search = {};
    }
    search() {}
  }


  ngApp.controller('ActionController', function($scope, $compile, $location, $route, action) {
    let root;
    $scope.Katrid = Katrid;
    $scope.data = null;
    $scope.location = $location;
    $scope.record = null;
    $scope.recordIndex = null;
    $scope.recordId = null;
    $scope.records = null;
    $scope.viewType = null;
    $scope.recordCount = 0;
    $scope.dataSource = new Katrid.Data.DataSource($scope);
    $scope.compile = $compile;
    Katrid.core = {
      compile: $compile
    };

    $scope.$on('$locationChangeStart', function(event) {
      if ($scope.dataSource && $scope.dataSource._pendingChanges) {
        let answer = confirm(Katrid.i18n.gettext("You still have pending changes, are you sure you want to leave this page?"));
        if (!answer) {
          event.preventDefault();
        }
      }
    });

    $scope.$set = function(field, value) {
      $scope.record[field] = value;
      $scope.$setDirty(field);
    };

    $scope.$setDirty = function(field) {
      const control = $scope.form[field];
      if (control) {
        control.$setDirty();
      }
    };

    $scope.setContent = function(content) {
      $('html, body').animate({ scrollTop: 0 }, 'fast');
      content = ($scope.content = $(content));

      //# Prepare form special elements
      // Prepare form header
      const header = content.find('form header').first();
      // Create a new scope for the new form element
      const newScope = $scope.$new(false);
      const el = root.html($compile($scope.content)(newScope));

      // Get the first form controller
      $scope.formElement = el.find('form').first();
      $scope.form = $scope.formElement.controller('form');

      // Add form header
      if (header.length) {
        let newHeader = $compile(header)($scope);
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

    var doButtonClick = function() {
      const btn = $(this);
      const meth = btn.prop('name');
      return $scope.model.post(meth, null, { kwargs: { id: $scope.record.id } })
      .done(function(res) {
        if (res.ok) {
          if (res.result.type) {
            const act = new (Katrid.Actions[res.result.type])(res.result, $scope, $location);
            return act.execute();
          }
        }
      });
    };

    $scope.getContext = () => {
      if (_.isString($scope.action.info.context)) return JSON.parse($scope.action.info.context);
      return {};
    };

    const init = function(action) {
      // Check if there's a history/back information
      let act, location;
      if ($scope.isDialog) {
        location = new DialogLocation();
      } else {
        location = $location;
      }

      $scope.action = (act = new (Katrid.Actions[action.action_type])(action, $scope, location));
      if (action.model) {
        $scope.model = new Katrid.Services.Model(action.model[1], $scope);
        if (action._back && action._back.views) {
          act.views = action._back.views;
          $scope.views = act.views;
          delete action._back;
        } else {
          act.views = $scope.views;
        }
      }

      if ($scope.isDialog) {
        act.isDialog = $scope.isDialog;
      }
      if ($scope.parentAction) {
        act.parentAction = $scope.parentAction;
      }
      if (act && act.isDialog) {
        act.routeUpdate({ view_type: action.view_type });
        return act.createNew();
      } else {
        return act.routeUpdate($location.$$search);
      }
    };

    // Check if the element is a child
    if ($scope.parentAction) {
      ({ root } = $scope);
    } else {
      root = angular.element('#katrid-action-view');
      $scope.$on('$routeUpdate', () => $scope.action.routeUpdate($location.$$search));
    }
    return init(action);
  });


  this.Katrid.ngApp = ngApp;

}).call(this);
