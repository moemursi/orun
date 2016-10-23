
var findProduct = function (s) {
  var r = [];
  for (var i=0;i<demo_data.length;i++) r.push({ id: i, name: demo_data[i].name, img: demo_data[i].img, value: demo_data[i].value });
  return r;
};

var posApp = angular.module('posApp', ['ngRoute', 'ngCookies', 'ngSanitize'], function ($routeProvider, $locationProvider, $httpProvider) {
    $httpProvider.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';
}).config(['$routeProvider', '$locationProvider',
    function ($routeProvider, $locationProvider) {
            $routeProvider
            .when('/pos/:page/', {
                templateUrl: function(params) {
                    var u = '/client/content/show/' + params.app + '/' + params.content + '/';
                    if (params.mode)
                        u += '?' + $.param({mode: params.mode});
                    return u;
                }
            })
    }
]).run(['$http', '$cookies', function($http, $cookies) {
    $http.defaults.headers.post['X-CSRFToken'] = $cookies.csrftoken;
}]);


posApp.controller('PosController', function ($scope, $rootScope, $location) {
  var tm;
  $scope.pages = [];
  $scope.page = null;
  $scope.pageIndex = null;
  $scope.vpadFn = 'qty';

  $scope.keyCode = "";
  $scope.keyPressed = function(e) {
    if (e.which === 27) {
      if ($scope.productList === undefined) $scope.productList = {};
      $scope.productList.visible = false;
      $('#customer').focus();
    }
  };

  $scope.addPage = function () {
    var page = { name: new Date().toTimeString().replace(/.*(\d{2}:\d{2}:\d{2}).*/, "$1"), items: [] };
    $scope.pages.push(page);
    $scope.selPage($scope.pages.length-1);

  };

  $scope.selPage = function (idx) {
    $scope.pageIndex = idx;
    $scope.page = $scope.pages[idx];
  };

  $scope.removePage = function () {
    if ($scope.pageIndex) $scope.pages.splice($scope.pageIndex, 1);
    $scope.pageIndex--;
    console.log('remove page', $scope.pageIndex);
  };

  $scope.products = ['test', 'test2'];

  $scope.initList = function () {
    var results = findProduct('');
    $scope.products = [];
    var rows = results;
    for (var i=0;i<rows.length;i++) $scope.products.push(rows[i]);
  };

  $scope.search = function() {
    var s = $scope.searchValue;

    var fn = function() {
      $scope.products = [];
      rows = findProduct(s);
      for (var i=0;i<rows.length;i++) $scope.products.push(rows[i]);
    };

    clearTimeout(tm);

    tm = setTimeout(function(){ fn(); }, 500);

  };

  $scope.itemClick = function (obj) {
    $scope.addItem(obj);
  };

  var findItem = function (id) {
    var items = $scope.page.items;
    for (var i=0;i<items.length;i++) {
      var item = items[i];
      if (id === item.id)
        return item;
    }
  };

  $scope.vpadClick = function (v) {
    if ($scope.vpadFn === 'qty') {
      $scope.page.items[$scope.page.printItemIndex].qty = parseFloat($scope.page.items[$scope.page.printItemIndex].qty.toString() + v.toString());
    }
    else if ($scope.vpadFn === 'price') $scope.page.items[$scope.page.printItemIndex].value = v;
    _changeTotal();
  };

  $scope.vpadBack = function () {
    if (($scope.vpadFn === 'qty') && ($scope.page.items[$scope.page.printItemIndex].qty)) {
      var s = $scope.page.items[$scope.page.printItemIndex].qty.toString();
      s = s.substr(0, s.length-1) || '0';
      $scope.page.items[$scope.page.printItemIndex].qty = parseFloat(s);
    }
    else if ($scope.vpadFn === 'price') $scope.page.items[$scope.page.printItemIndex].value = v;
    _changeTotal();
  };

  var _changeTotal = function () {
    var items = $scope.page.items;
    var t = 0;
    for (var i=0;i<items.length;i++) {
      var item = items[i];
      t += item.qty * item.value;
    }
    $scope.page.total = t;
    $('#input-search').focus();
  };

  $scope.printItemClick = function (idx) {
    $scope.page.printItemIndex = idx;
  };

  $scope.addItem = function (obj) {
    var items = $scope.page.items;
    var i = items.indexOf(obj);
    if (items.length) {
      var _obj = items[items.length - 1];
      if (_obj.id !== obj.id) _obj = null;
    }

    if (_obj) _obj.qty++;
    else {
      _obj = {
        qty: 1,
        id: obj.id,
        value: parseFloat(obj.value),
        name: obj.name
      };
      items.push(_obj);
    }
    _changeTotal();

    $scope.page.printItemIndex = items.length-1;

    setTimeout(function() {
      $('.pos-print').animate({scrollTop: 5000});
    }, 100);
  }

});

posApp.directive('shortcut', function() {
  return {
    restrict: 'A',
    replace: true,
    scope: true,
    link:    function postLink(scope, iElement, iAttrs){
      $(document).on('keydown', function(e){
         scope.$apply(scope.keyPressed(e));
       });
    }
  };
});
