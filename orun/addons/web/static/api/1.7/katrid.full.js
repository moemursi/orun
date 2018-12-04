
var Katrid = {
  Core: {},
};

(function() {

  _.emptyText = '--';

  class LocalSettings {
    static init() {
      Katrid.localSettings = new LocalSettings();
    }

    constructor() {
    }

    get searchMenuVisible() {
      return parseInt(localStorage.searchMenuVisible) === 1;
    }

    set searchMenuVisible(value) {
      localStorage.searchMenuVisible = value ? 1 : 0;
    }
  }


  const _isMobile = function isMobile() {
    var check = false;
    (function (a) {
      if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0, 4))) check = true;
    })(navigator.userAgent || navigator.vendor || window.opera);
    return check;
  }();

  Katrid.settings = {
    additionalModules: [],
    server: '',
    servicesProtocol: (typeof io !== 'undefined' && io !== null) && io.connect ? 'io' : 'http',

    // Katrid Framework UI Settings
    ui: {
      isMobile: _isMobile,
      dateInputMask: true,
      defaultView: 'list',
      goToDefaultViewAfterCancelInsert: true,
      goToDefaultViewAfterCancelEdit: false,
      horizontalForms: true
    },

    services: {
      choicesPageLimit: 10
    },

    speech: {
      enabled: false
    }
  };

  Katrid.Core.LocalSettings = LocalSettings;

  if (Katrid.settings.servicesProtocol === 'io') {
    Katrid.socketio = io.connect(`//${document.domain}:${location.port}/rpc`);
  }

})();

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

        // check if it's a dialog action
        if ($transitions) {
          $transitions.onBefore({to: 'actionView'}, function (transition, state) {
            if ($state.params.actionId !== transition.params().actionId)
              action._unregisterHook();
          });

          if (action instanceof Katrid.Actions.WindowAction)
            action.viewType = $location.$$search.view_type || action.viewModes[0];

          action._unregisterHook = $scope.$on('$locationChangeSuccess', () => {
            action.routeUpdate($location.$$search);
          });

          action.routeUpdate($location.$$search);
        }

      }]);
    }
  }

  Katrid.Core.Application = Application;

})();

(function () {

  Katrid.$hashId = 0;

  _.mixin({
    hash(obj) {
      if (!obj.$hashId) {
        obj.$hashId = ++Katrid.$hashId;
      }
      return obj.$hashId;
    }
  });

}).call(this);

(function() {

  const globals = this;

  // Internationalization
  Katrid.i18n = {
    languageCode: 'pt-BR',
    formats: {},
    catalog: {},

    initialize(plural, catalog, formats) {
      Katrid.i18n.plural = plural;
      Katrid.i18n.catalog = catalog;
      Katrid.i18n.formats = formats;
      if (plural) {
        Katrid.i18n.pluralidx = function (n) {
          if (plural instanceof boolean) {
            if (plural) {
              return 1;
            } else {
              return 0;
            }
          } else {
            return plural;
          }
        };
      } else {
        Katrid.i18n.pluralidx = function (n) {
          if (count === 1) {
            return 0;
          } else {
            return 1;
          }
        };
      }

      globals.pluralidx = Katrid.i18n.pluralidx;
      globals.gettext = Katrid.i18n.gettext;
      globals.ngettext = Katrid.i18n.ngettext;
      globals.gettext_noop = Katrid.i18n.gettext_noop;
      globals.pgettext = Katrid.i18n.pgettext;
      globals.npgettext = Katrid.i18n.npgettext;
      globals.interpolate = Katrid.i18n.interpolate;
      globals.get_format = Katrid.i18n.get_format;

      _.mixin({
        gettext: Katrid.i18n.gettext,
        sprintf: sprintf,
      });

      return Katrid.i18n.initialized = true;
    },

    merge(catalog) {
      return Array.from(catalog).map((key) =>
        (Katrid.i18n.catalog[key] = catalog[key]));
    },

    gettext(s) {
      const value = Katrid.i18n.catalog[s];
      if (value != null) {
        return value;
      } else {
        return s;
      }
    },

    gettext_noop(s) {
      return s;
    },

    ngettext(singular, plural, count) {
      const value = Katrid.i18n.catalog[singular];
      if (value != null) {
        return value[Katrid.i18n.pluralidx(count)];
      } else if (count === 1) {
        return singular;
      } else {
        return plural;
      }
    },

    pgettext(s) {
      let value = Katrid.i18n.gettext(s);
      if (value.indexOf('\x04') !== -1) {
        value = s;
      }
      return value;
    },

    npgettext(ctx, singular, plural, count) {
      let value = Katrid.i18n.ngettext(ctx + '\x04' + singular, ctx + '\x04' + plural, count);
      if (value.indexOf('\x04') !== -1) {
        value = Katrid.i18n.ngettext(singular, plural, count);
      }
      return value;
    },

    interpolate(fmt, obj, named) {
      if (named) {
        fmt.replace(/%\(\w+\)s/g, match => String(obj[match.slice(2, -2)]));
      } else {
        fmt.replace(/%s/g, match => String(obj.shift()));
      }

      return {
        get_format(formatType) {
          const value = Katrid.i18n.formats[formatType];
          if (value != null) {
            return value;
          } else {
            return formatType;
          }
        }
      };
    }
  };

})();

(function () {

  let requestManager;
  class RequestManager {
    constructor() {
      this.requestId = 0;
      this.requests = {};
    }

    request() {
      const reqId = ++requestManager.requestId;
      const def = new $.Deferred();
      this.requests[reqId] = def;
      def.requestId = reqId;
      return def;
    }
  }


  if (Katrid.socketio) {
    requestManager = new RequestManager();

    Katrid.socketio.on('connect', () => console.log("I'm connected!"));

    Katrid.socketio.on('api', function (data) {
      if (_.isString(data)) {
        data = JSON.parse(data);
      }
      const def = requestManager.requests[data['req-id']];
      return def.resolve(data);
    });
  }


  class Service {
    static get url() { return '/api/rpc/' };

    constructor(name, scope) {
      this.name = name;
    }

    static $fetch(url, config, params) {
      if (params) {
        url = new URL(url);
        Object.entries(params).map((k, v) => url.searchParams.append(k, v));
      }
      return fetch(url, config);
    }

    static $post(url, data, params) {
      return this.$fetch(url, {
        method: 'POST',
        credentials: "same-origin",
        body: JSON.stringify(data),
        headers: {
          'content-type': 'application/json',
        }
      }, params)
      .then(res => res.json());
    }

    delete(name, params, data) {
    }

    get(name, params) {
      if (Katrid.Settings.servicesProtocol === 'ws') {
        // Using websocket protocol
        return Katrid.socketio.emit('api', {channel: 'rpc', service: this.name, method: name, data, args: params});
      } else {
        // Using http protocol
        const methName = this.name ? this.name + '/': '';
        const rpcName = Katrid.Settings.server + this.constructor.url + methName + name + '/';
        return $.get(rpcName, params);
      }
    }

    post(name, data, params) {
      let context = Katrid.app.context;
      if (!data)
        data = {};
      if (context)
        data.context = context;

      data = {
        jsonrpc: '2.0',
        method: name,
        params: data,
        id: Math.floor(Math.random() * 1000 * 1000 * 1000)
      };

      // Check if protocol is socket.io
      if (Katrid.settings.servicesProtocol === 'io') {
        const def = requestManager.request();
        Katrid.socketio.emit('api',
          {
            "req-id": def.requestId,
            "req-method": 'POST',
            service: this.name,
            method: name,
            data,
            args: params
          }
        );
        return def;

        // Else, using ajax
      } else {
        const methName = this.name ? this.name + '/': '';
        let rpcName = Katrid.settings.server + this.constructor.url + methName + name + '/';
        if (params) {
          rpcName += `?${$.param(params)}`;
        }
        return new Promise(
          (resolve, reject) => {

            $.ajax({
              method: 'POST',
              url: rpcName,
              data: JSON.stringify(data),
              contentType: "application/json; charset=utf-8",
              dataType: 'json'
            })
            .then(res => {
              if (res.error)
                reject(res.error);
              else
                resolve(res.result);
            })
            .fail(res => reject(res));

          }
        );
      }
    }
  }


  class Model extends Service {
    searchName(name) {
      if (_.isString(name))
        name = { args: name };
      return this.post('search_name', name);
    }

    createName(name) {
      let kwargs = {name};
      return this.post('create_name', { kwargs: kwargs });
    }

    search(data, params) {
      return this.post('search', { kwargs: data }, params);
    }

    destroy(id) {
      if (!_.isArray(id))
        id = [id];
      return this.post('destroy', { kwargs: {ids: id} });
    }

    getById(id) {
      return this.post('get', { args: [id] });
    }

    getDefaults(kwargs) {
      return this.post('get_defaults', { kwargs });
    }

    copy(id) {
      return this.post('copy', { args: [id] });
    }

    static _prepareFields(res) {
      if (res) {
        res.fields = Katrid.Data.Fields.Field.fromArray(res.fields);
        res.fieldList = Object.values(res.fields);
        if (res.views) {
          Object.values(res.views).map(v => v.fields = Katrid.Data.Fields.Field.fromArray(v.fields));
          Object.keys(res.views).map(k => res.views[k] = new Katrid.ui.ViewInfo(res.views[k]));
        }
      }
      return res;
    }

    getViewInfo(data) {
      return this.post('get_view_info', { kwargs: data })
      .then(this.constructor._prepareFields);
    }

    async loadViews(data) {
      return this.post('load_views', { kwargs: data })
      .then(this.constructor._prepareFields);
    }

    getFieldsInfo(data) {
      return this.post('get_fields_info', { kwargs: data })
      .then(this.constructor._prepareFields);
    }

    getFieldChoices(field, term, kwargs) {
      return this.post('get_field_choices', { args: [ field, term ], kwargs: kwargs } );
    }

    doViewAction(data) {
      return this.post('do_view_action', { kwargs: data });
    }

    write(data, params) {
      return new Promise((resolve, reject) => {
        this.post('write', {kwargs: {data}}, params)
        .then((res) => {
          Katrid.ui.Dialogs.Alerts.success(Katrid.i18n.gettext('Record saved successfully.'));
          resolve(res);
        })
        .catch(res => {
          if ((res.status === 500) && res.responseText)
            alert(res.responseText);
          else
            Katrid.ui.Dialogs.Alerts.error(Katrid.i18n.gettext('Error saving record changes'));
          reject(res);
        });
      });
    }

    groupBy(grouping) {
      return this.post('group_by', { kwargs: grouping });
    }

    autoReport() {
      return this.post('auto_report', { kwargs: {} });
    }

    rpc(meth, args, kwargs) {
      return this.post(meth, { args: args, kwargs: kwargs });
    }
  }


  class Query extends Model {
    constructor() {
      super('ir.query');
    }

    static read(id) {
      return (new Query()).post('read', { args: [id] });
    }
  }


  class Data extends Service {
    static get url() { return '/web/data/' };

    reorder(model, ids, field='sequence', offset=0) {
      return this.post('reorder', { args: [ model, ids, field, offset ] });
    }
  }

  class Attachments {
    static destroy(id) {
      let svc = new Model('ir.attachment');
      svc.destroy(id);
    }

    static upload(file, scope=null) {
      let data = new FormData();
      if (scope === null) scope = angular.element(file).scope();
      data.append('model', scope.model.name);
      data.append('id', scope.recordId);
      for (let f of file.files) data.append('attachment', f, f.name);
      return $.ajax({
        url: '/web/content/upload/',
        type: 'POST',
        data: data,
        processData: false,
        contentType: false
      })
      .done((res) => {
        console.log('attachments', scope.attachments, scope);
        if (!scope.attachments)
          scope.attachments = [];
        if (res)
          for (let obj of res) scope.attachments.push(obj);
        scope.$apply();
      });
    }
  }

  class View extends Model {
    constructor() {
      super('ui.view');
    }

    fromModel(model) {
      return this.post('from_model', null, {model});
    }
  }


  class Actions extends Model {
    static load(action) {
      let svc = new Model('ir.action');
      return svc.post('load', { args: [action] });
    }
  }


  class Auth extends Service {
    static login(username, password) {
      return this.$post('/web/login/', { username: username, password: password });
    }
  }

  class Upload {
    static sendFile(service, file) {
      let form = new FormData();
      form.append('files', file.files[0]);
      let scope = angular.element(file).scope();
      $.ajax({
        url: `/web/file/upload/${scope.model.name}/${service}/?id=${scope.record.id}`,
        data: form,
        processData: false,
        contentType: false,
        type: 'POST',
        success: (data) => {
          console.log('success', data);
          scope.dataSource.refresh();
          Katrid.ui.Dialogs.Alerts.success('Operação realizada com sucesso.')
        }
      });
    }
  }

  this.Katrid.Services = {
    Data,
    View,
    data: new Data('', ),
    Attachments,
    Service,
    Model,
    Query,
    Auth,
    Upload,
    Actions
  };

})();


Katrid.Data = {};

(function() {

  class Record {
    constructor(data, dataSource, state) {
      this.raw = data;
      this.data = {};
      this.old = jQuery.extend({}, data);
      this.dataSource = dataSource;
      this.pending = null;
      this.modified = false;
      this.children = [];
      this.state = state;
      this.submitted = false;
      data.$record = this;
    }

    get scope() {
      return this.dataSource.scope;
    }

    get pk() {
      return this.raw.id;
    }

    $delete() {
      this.state = RecordState.destroyed;
      if (this.pk)
        this.setModified();
      else if (this.parent.children.indexOf(this) > -1)
        this.parent.children.splice(this.parent.children.indexOf(this), 1);
    }

    _prepareRecord(rec) {
      let res = {};
      Object.entries(rec).map(obj => {
        if (!obj[0].startsWith('$'))
          res[obj[0]] = obj[1]
      });
      return res;
    }

    setModified(field) {
      if (!this.modified && (this.state !== RecordState.destroyed)) {
        if (this.pk)
          this.state = RecordState.modified;
        else
          this.state = RecordState.created;
      }
      if (field)
        this.dataSource.$setDirty(field);
      this.dataSource._pendingChanges = true;
      this.modified = true;

      if (this.parent && this.scope.fieldName) {
        this.parent.setModified(this.scope.fieldName);
        this.parent.addChild(this);
      }
    }

    get parent() {
      return this.dataSource.parent && this.dataSource.parent.record.$record;
    }

    addChild(child) {
      this.setModified(child.scope.fieldName);
      if (this.children.indexOf(child) === -1) {
        this.children.push(child);
      }
    }

    compare(oldValue, newValue) {
      if (_.isArray(oldValue) && _.isArray(newValue))
        return oldValue.join(',') !== newValue.join(',');
      return oldValue != newValue;
    }

    set(propKey, value) {
      let field = this.dataSource.fieldByName(propKey);
      if (field) {
        let oldValue = this.raw[propKey];
        value = field.toJSON(value);
        // check if field value has been changed
        if (this.compare(oldValue, value)) {
          this.setModified(propKey);
          this.data[propKey] = value;
          this.modified = true;
          // send field change event
          if (field.onChange) {
            let rec = this._prepareRecord(this.raw);
            rec[propKey] = value;
            this.dataSource.dispatchEvent('field_change_event', [propKey, rec]);
          }
        }
      }
      return true;
    }

    $new() {
      return Record(this.raw);
    }

    toObject() {
      let data = jQuery.extend({}, this.data);
      if (this.pk)
        data.id = this.pk;
      for (let child of this.children) {
        if (!(child.scope.fieldName in data))
          data[child.scope.fieldName] = [];
        if (child.state === RecordState.created)
          data[child.scope.fieldName].push({ action: 'CREATE', values: child.toObject() });
        else if (child.state === RecordState.modified)
          data[child.scope.fieldName].push({ action: 'UPDATE', values: child.toObject() });
        else if (child.state === RecordState.destroyed)
          data[child.scope.fieldName].push({ action: 'DESTROY', id: child.pk });
      }
      return data;
    }
  }

  class SubRecords {
    constructor(recs) {
      this.recs = recs;
    }

    append(rec) {
      if (this.recs.indexOf(rec) === -1)
        this.recs.push(rec);
    }
  }


  function createRecord(rec, dataSource) {
    new Record(rec, dataSource);
    return new Proxy(rec, {
      set(target, propKey, value, receiver) {
        let scope = dataSource.scope;
        if (!propKey.startsWith('$$')) {
          if (!propKey.startsWith('$') && scope) {
            rec.$record.set(propKey, value);
            // if (fld instanceof Katrid.Data.Fields.OneToManyField) {
            //   if (!rec.$modifiedData[propKey]) {
            //     rec.$modifiedData[propKey] = new SubRecords(value);
            //     rec.$modifiedData[propKey].$deleted = new SubRecords([]);
            //   } else
            //     rec.$modifiedData[propKey].recs = value;
            //
            //   return Reflect.set(target, propKey, value, receiver);
            // }
          }
        }
        return Reflect.set(target, propKey, value, receiver);
      }
    })
  }

  class RecordState {
    static initClass() {
      this.destroyed = 'destroyed';
      this.created = 'created';
      this.modified = 'modified';
    }
  }
  RecordState.initClass();

  Katrid.Data.RecordState = RecordState;
  Katrid.Data.createRecord = createRecord;
  Katrid.Data.SubRecords = SubRecords;

})();

(function () {

  class DataSourceState {
    static initClass() {
      this.inserting = 'inserting';
      this.browsing = 'browsing';
      this.editing = 'editing';
      this.loading = 'loading';
      this.inactive = 'inactive';
    }
  }
  DataSourceState.initClass();

  DEFAULT_REQUEST_INTERVAL = 300;

  class DataSource {
    constructor(scope) {
      this.readonly = false;
      this.$modifiedRecords = [];
      // this.onFieldChange = this.onFieldChange.bind(this);
      this.scope = scope;
      this.action = scope.action;
      this._recordIndex = 0;
      this.recordCount = null;
      this.loading = false;
      this.loadingRecord = false;
      this._masterSource = null;
      this.pageIndex = 0;
      this.pageLimit = 100;
      this.offset = 0;
      this.offsetLimit = 0;
      this.requestInterval = DEFAULT_REQUEST_INTERVAL;
      this.pendingRequest = null;
      this.fieldName = null;
      this.children = [];
      this.modifiedData = null;
      this.uploading = 0;
      this._state = null;
      this.fieldWatchers = [];
      this._pendingChanges = false;
    }

    addFieldWatcher(field) {

    }

    get fields() {
      return this.scope.view.fields;
    }

    get loadingAction() {
      return this._loadingAction;
    }

    set loadingAction(v) {
      if (v) this.requestInterval = 0;
      else this.requestInterval = DEFAULT_REQUEST_INTERVAL;
      this._loadingAction = v;
    }

    async cancel() {
      if (!this.changing)
        return;

      for (let child of this.children)
        child.cancel();

      this._recordIndex = null;
      this._pendingChanges = false;

      if ((this.state === DataSourceState.inserting) && Katrid.settings.ui.goToDefaultViewAfterCancelInsert) {
        this.record = {};
        this.scope.action.viewType = 'list';
      } else {
        if (this.state === DataSourceState.editing) {
          if (this.scope.record) {
            let r = await this.refresh([this.scope.record.id]);
            this.state = DataSourceState.browsing;
            this.recordId = this.record.id;
          }
        } else {
          this.record = {};
          this.state = DataSourceState.browsing;
        }
      }
    }

    async saveAndClose() {
      // Save changes and close dialog
      let r = await this.save(false);
      this.scope.$emit('saveAndClose', this.scope, r);
      return this.scope.action.$element.closest('.modal').modal('hide');
    }


    async copy(id) {
      let res = await this.model.copy(id);
      this.record = {};
      this.state = DataSourceState.inserting;
      this.setValues(res);
      return res;
    }

    findById(id) {
      for (let rec of this.scope.records)
        if (rec.id === id)
          return rec;
      return null;
    }

    hasKey(id) {
      return this.findById(id) !== null;
    }

    refresh(data) {
      let r;
      if (data) {
        // Refresh current record
        r = this.get(data[0]);
      } else if (this.scope.record.id) {
        r = this.get(this.scope.record.id);
      } else {
        r = this.search(this._params, this._page);
      }
      r.then(() => {
        for (let child in this.children)
          if (child.invalidate) {
            child.invalidate(this.recordId);
            child.scope.$apply();
          }
      });
      return r;
    }

    _validateForm(elForm, form, errorMsgs) {
      let elfield;
      for (let errorType in form.$error)
        if (errorType === 'required')
        for (let child of Array.from(form.$error[errorType])) {
          if (child.$name.startsWith('grid-row-form'))
            elfield = this._validateForm(elForm.find('#' + child.$name), child, errorMsgs);
          else {
            elfield = elForm.find(`.form-field[name="${child.$name}"]`);
            elfield.addClass('ng-touched');
            let scope = angular.element(elForm).scope();
            const field = scope.view.fields[child.$name];
            errorMsgs.push(`<span>${field.caption}</span><ul><li>${Katrid.i18n.gettext('This field cannot be empty.')}</li></ul>`);
          }
        }
        else
          console.log(form.$error[errorType]);

      return elfield;
    }

    validate(raiseError=true) {
      if (this.scope.form.$invalid) {
        let elfield;
        let errors = [];
        let s = `<span>${Katrid.i18n.gettext('The following fields are invalid:')}</span><hr>`;
        const el = this.scope.formElement;
        elfield = this._validateForm(el, this.scope.form, errors);
        Katrid.ui.uiKatrid.setFocus(elfield);
        s += errors.join('');
        Katrid.ui.Dialogs.Alerts.error(s);
        if (raiseError)
          throw Error('Error validating form: ' + s);
        return false;
      }
      return true;
    }

    indexOf(obj) {
      return this.scope.records.indexOf(this.findById(obj.id));
    }

    search(params, page, fields, timeout) {
      let master = this.masterSource;
      if (this.groups && !this.groups.length && this.scope.defaultGrouping) {
        let g = {
          context: {
            grouping: [this.scope.defaultGrouping]
          }
        };
        this.groupBy(g);
        return;
      }
      this._params = params;
      this._page = page;
      this._clearTimeout();
      this.pendingRequest = true;
      this.loading = true;
      page = page || 1;
      this.pageIndex = page;
      let { domain } = this.scope.action.info;
      if (domain) {
        domain = JSON.parse(domain);
      }
      params = {
        count: true,
        page,
        params,
        fields,
        domain,
        limit: this.limit
      };

      return new Promise(
        (resolve, reject) => {

          let req = () => {
            this.model.search(params)
            .catch(res => {
              return reject(res);
            })
            .then(res => {
              if (this.pageIndex > 1) {
                this.offset = ((this.pageIndex - 1) * this.pageLimit) + 1;
              } else {
                this.offset = 1;
              }
              this.scope.$apply(() => {
                if (res.count != null)
                  this.recordCount = res.count;

                let data = res.data;
                if (this.readonly)
                  this.scope.records = data;
                else
                  this.scope.records = data.map((obj) => Katrid.Data.createRecord(obj, this));
                if (this.pageIndex === 1) {
                  return this.offsetLimit = this.scope.records.length;
                } else {
                  return this.offsetLimit = (this.offset + this.scope.records.length) - 1;
                }
              });
              return resolve(res);
            })
            .finally(() => {
              this.pendingRequest = false;
              this.scope.$apply(() => {
                this.loading = false;
              });
            });
          };

          if (((this.requestInterval > 0) || timeout) && (timeout !== false))
            this.pendingRequest = setTimeout(req, this.requestInterval);
          else req();
        }
      );
    }

    groupBy(group) {
      if (!group) {
        this.groups = [];
        return;
      }
      this.scope.groupings = [];
      this.groups = [group];
      return this.model.groupBy(group.context)
      .then(res => {
        this.scope.records = [];
        const groupName = group.context.grouping[0];
        for (let r of Array.from(res)) {
          let s = r[groupName];
          if ($.isArray(s)) {
            r._paramValue = s[0];
            s = s[1];
          } else {
            r._paramValue = s;
          }
          r.__str__ = s;
          r.expanded = false;
          r.collapsed = true;
          r._searchGroup = group;
          r._paramName = groupName;
          r._domain = {};
          r._domain[r._paramName] = r._paramValue;
          const row = {_group: r, _hasGroup: true};

          // load groupings info
          let grouping = r;
          this.scope.groupings.push(grouping);

          // auto load records
          if (this.autoLoadGrouping) {
            ((grouping) => {
              this.model.search({params: r._domain})
              .then(res => {
                if (res.ok) this.scope.$apply(() => {grouping.records = res.result.data});
              })})(grouping);
          }

          this.scope.records.push(row);
        }
        return this.scope.$apply();
      });
    }

    goto(index) {
      return this.recordIndex = index;
    }

    moveBy(index) {
      const newIndex = (this._recordIndex + index);
      if ((newIndex > -1) && (newIndex < this.scope.records.length))
        this.recordIndex = newIndex;
    }

    _clearTimeout() {
      this.loading = false;
      this.loadingRecord = false;
      this._canceled = true;
      clearTimeout(this.pendingRequest);
    }

    set masterSource(master) {
      this._masterSource = master;
      master.children.push(this);
    }

    get masterSource() {
      return this._masterSource;
    }

    applyModifiedData(form, element, record) {
      const data = this.getModifiedData(form, element, record);
      const _id = _.hash(record);
      if (data) {
        let ds = this.modifiedData;
        if ((ds == null)) {
          ds = {};
        }
        let obj = ds[_id];
        if (!obj) {
          obj = {};
          ds[_id] = obj;
        }
        for (let attr in data) {
          const v = data[attr];
          obj[attr] = v;
          //record[attr] = v;
        }

        this.modifiedData = ds;
        this.masterSource.scope.form.$setDirty();
      }
      return data;
    }

    getNestedData() {
      let ret = {};
      for (let child of this.children)
        if (child.$modifiedRecords.length) {
          let res = [];
          let deleted = [];
          for (let rec of child.$modifiedRecords) {
            if (rec.$deleted) {
              deleted.push(rec);
              if ((rec.id !== null) && (rec.id !== undefined))
                res.push({id: rec.id, action: 'DESTROY'})
            }
          }

          for (let rec of child.$modifiedRecords) {
            console.log(rec.$modified, rec.$modifiedData);
            if (rec.$modifiedData && !rec.$deleted && rec.$modified && (deleted.indexOf(rec) === -1)) {
              let data = this._getModified(rec.$modifiedData);
              if (rec.id)
                data['id'] = rec.id;
              jQuery.extend(data, child.getNestedData());
              if ((rec.id === null) || (rec.id === undefined))
                res.push({
                  action: 'CREATE',
                  values: data,
                });
              else if ((rec.id !== null) && (rec.id !== undefined))
                res.push({
                  action: 'UPDATE',
                  values: data,
                });
            }
          }
          if (Object.keys(res).length > 0)
            ret[child.fieldName] = res;
        }
      return ret;
    }

    save(autoRefresh=true) {
      // Save pending children
      for (let child of this.children)
        if (child.changing)
          child.scope.save();

      const el = this.scope.formElement;
      if (this.validate()) {
        const data = this.record.$record.toObject();
        // const data = this.getModifiedData(this.scope.form, el, this.scope.record);
        this.scope.form.data = data;

        let beforeSubmit = el.attr('before-submit');
        if (beforeSubmit)
          beforeSubmit = this.scope.$eval(beforeSubmit);

        //@scope.form.data = null

        if (data) {
          this.uploading++;
          return this.model.write([data])
          .then(res => {
            // this._clearCache();
            if (this.scope.action && this.scope.action.location)
              this.scope.action.location.search('id', res[0]);
            this.scope.form.$setPristine();
            this.scope.form.$setUntouched();
            this._pendingChanges = false;
            this.state = DataSourceState.browsing;
            if (autoRefresh)
              return this.refresh(res);
            else
              return res;

          })
          .catch(error => {
            let s = `<span>${Katrid.i18n.gettext('The following fields are invalid:')}<hr></span>`;
            if (error.message)
              s = error.message;
            else if (error.messages) {
              let elfield;
              for (let fld of Object.keys(error.messages)) {
                const msgs = error.messages[fld];
                let field;
                // check qualified field name
                if (fld.indexOf('.') > -1) {
                  fld = fld.split('.');
                  let subField = fld[1];
                  for (let child of this.children)
                    if (child.scope.fieldName === fld[0]) {
                      field = child.scope.view.fields[subField];
                    }
                } else
                  field = this.scope.view.fields[fld];
                console.log('field invalid', field);
                if (!field || !field.name)
                  continue;
                elfield = el.find(`.form-field[name="${field.name}"]`);
                elfield.addClass('ng-invalid ng-touched');
                s += `<strong>${field.caption}</strong><ul>`;
                for (let msg of msgs) {
                  s += `<li>${msg}</li>`;
                }
                s += '</ul>';
              }
              if (elfield)
                elfield.focus();
            }

            return Katrid.ui.Dialogs.Alerts.error(s);

          })
          .finally(() => this.scope.$apply(() => this.uploading-- ) );
        } else
          Katrid.Dialogs.Alerts.warn(Katrid.i18n.gettext('No pending changes'));
      }
    }

    _getNested(recs) {
      let res = [];
      if (recs.$deleted && recs.$deleted.recs.length)
        for (let rec of recs.$deleted.recs)
          res.push({id: rec.id, action: 'DESTROY'});

      let vals;
      if (recs.recs.length)
        for (let rec of recs.recs) if (rec) {
          vals = {};
          if (rec.$created)
            vals = {
              action: 'CREATE',
              values: this._getModified(rec.$modifiedData)
            };
          else if (rec.$modified) {
            vals = {
              action: 'UPDATE',
              values: this._getModified(rec.$modifiedData)
            };
            vals.values.id = rec.id;
          }
          else
            continue;
          res.push(vals);
        }

      return res;
    }


    _getModified(data) {
      let res = {};
      if (data)
        for (let [k, v] of Object.entries(data))
          if (v instanceof Katrid.Data.SubRecords) {
            res[k] = this._getNested(v);
          } else
            res[k] = v;
      return res;
    }

    getModifiedData(form, element, record) {
      let data = {};
      if (record.$modified)
        jQuery.extend(data, this._getModified(record.$modifiedData));

      if (this.record.id)
        data['id'] = record.id;
      return data;
    }

    get(id, timeout, apply=true, index=false) {
      this._clearTimeout();
      this.state = DataSourceState.loading;
      this.loadingRecord = true;
      this._canceled = false;

      return new Promise(
        (resolve, reject) => {
          const _get = () => {
            return this.model.getById(id)
            .catch(res => {
              return reject(res);
            })
            .then(res => {
              if (this._canceled || !res)
                return;
              if (this.state === DataSourceState.loading)
                this.state = DataSourceState.browsing;
              else if (this.state === DataSourceState.inserting)
                return;
              this.record = res.data[0];
              if (index !== false)
                this.scope.records[index] = this.record;
              // if (apply)
              //   this.scope.$apply();
              return resolve(this.record);
            })
            .finally(() => {
                this.loadingRecord = false;
              if (apply)
                return this.scope.$apply();
            });
          };
          if (!timeout && !this.requestInterval)
            return _get();
          else
            this.pendingRequest = setTimeout(_get, timeout || this.requestInterval);

        }
      );
    }

    async insert(loadDefaults=true, defaultValues, kwargs) {
      this._clearTimeout();
      for (let child of this.children)
        child._clearTimeout();
      let rec = {};
      rec.$created = true;
      let oldRecs = this.scope.records;
      this.record = rec;
      this.scope.records = oldRecs;
      let res;
      // check if load defaults is needed
      if (loadDefaults)
        // load default fields values with optional kwargs
        res = await this.model.getDefaults(kwargs);

      for (let child of this.children)
        child.scope.records = [];

      this.state = DataSourceState.inserting;
      this.scope.record.display_name = Katrid.i18n.gettext('(New)');
      if (defaultValues)
        Object.assign(res, defaultValues);
      if (res)
        this.setValues(res);
    }

    _new() {
      return Katrid.Data.createRecord({}, this);
    }

    setValues(values) {
      Object.entries(values).forEach(([k, v]) => {
        let fld = this.scope.view.fields[k];
        if (fld)
          fld.fromJSON(v, this);
        else
          this.scope.record[k] = v
      });
      this.scope.$apply();
    }

    edit() {
      this.state = DataSourceState.editing;
    }

    toClientValue(attr, value) {
      const field = this.scope.view.fields[attr];
      if (field) {
        if (field.type === 'DateTimeField') {
          value = new Date(value);
        }
      }
      return value;
    }

    fieldByName(fieldName) {
      return this.scope.view.fields[fieldName];
    }

    set state(state) {
      // Clear modified fields information
      this._modifiedFields = [];
      this._state = state;
      this.inserting = state === DataSourceState.inserting;
      this.editing = state === DataSourceState.editing;
      this.loading = state === DataSourceState.loading;
      this.changing =  [DataSourceState.editing, DataSourceState.inserting].includes(this.state);
      if (this.changing)
        setTimeout(() => {
          if (this.action.$element)
            for (let el of Array.from(this.action.$element.find("input[type!=hidden].form-field:visible"))) {
              el = $(el);
              if (!el.attr('readonly')) {
                $(el).focus();
                return;
              }
            }
        });
    }

    get browsing() {
      return this._state === DataSourceState.browsing;
    }

    childByName(fieldName) {
      for (let child of this.children) {
        if (child.fieldName === fieldName)
          return child;
      }
    }

    get state() {
      return this._state;
    }

    get record() {
      return this.scope.record;
    }

    set recordId(value) {
      // refresh record id
      this.scope.recordId = value;
      // refresh children
      this.scope.$broadcast('masterChanged', this, value);
    }

    get recordId() {
      return this.scope.recordId;
    }

    set record(rec) {
      // Track field changes
      this.scope.record = Katrid.Data.createRecord(rec, this);
      this.recordId = rec.id;
      this._pendingChanges = false;
      if (this.scope.form)
        this.scope.form.$setPristine();
      // this.state = DataSourceState.browsing;
    }

    next() {
      return this.moveBy(1);
    }

    prior() {
      return this.moveBy(-1);
    }

    nextPage() {
      let p = this.recordCount / this.pageLimit;
      if (Math.floor(p)) {
        p++;
      }
      if (p > (this.pageIndex + 1)) {
        return this.scope.action.location.search('page', this.pageIndex + 1);
      }
    }

    prevPage() {
      if (this.pageIndex > 1) {
        return this.scope.action.location.search('page', this.pageIndex - 1);
      }
    }

    set recordIndex(index) {
      this._recordIndex = index;
      if (!this.masterSource)
        return this.action.location.search('id', this.scope.records[index].id);
      this.scope.record = this.scope.records[index];
      // load record
      this.scope.recordId = null;
      // set new id on browser address
    }

    get recordIndex() {
      return this._recordIndex;
    }

    expandGroup(index, row) {
      const rg = row._group;
      const params =
        {params: {}};
      params.params[rg._paramName] = rg._paramValue;
      return this.model.search(params)
      .then(res => {
        if (res.ok && res.result.data) {
          return this.action.scope.$apply(() => {
            rg._children = res.result.data;
            return this.action.scope.records.splice.apply(this.scope.records, [index + 1, 0].concat(res.result.data));
          });
        }
      });
    }

    collapseGroup(index, row) {
      const group = row._group;
      this.scope.records.splice(index + 1, group._children.length);
      return delete group._children;
    }

    _applyResponse(res) {
      if (res.value)
        this.setValues(res.value);
      this.scope.$apply();
    }

    async dispatchEvent(name, ...args) {
      let res = await this.model.rpc(name, ...args);
      this._applyResponse(res);
    }

    get model() {
      return this.scope.model;
    }

    get parent() {
      return this.masterSource;
    }

    $setDirty(field) {
      this.scope.$setDirty(field);
    }
  }


  Katrid.Data.DataSource = DataSource;
  Katrid.Data.DataSourceState = DataSourceState;

})();

(function() {

  class Field {
    constructor(info) {
      this.cols = info.cols || 6;
      this.visible = true;
      this._info = info;
      this.caption = this._info.caption;
      this.helpText = this._info.help_text;
      this.onChange = this._info.onchange;
      this.required = this._info.required;

      if (this._info.visible === false)
        this.visible = false;
      this.readonly = this._info.readonly;
      if (!this.readonly)
        this.readonly = false;

      this.displayChoices = _.object(info.choices);
      this.choices = info.choices;

      if (info.choices)
        this.template = {
          list: 'view.list.selection-field.pug',
          form: 'view.form.selection-field.pug',
        };
      else
        this.template = {
          list: 'view.list.field.pug',
          form: 'view.form.field.pug',
        };

      if (info._listChoices)
        console.log(info._listChoices);
      if (info.template)
        this.template = Object.assign(this.template, info.template);

      this.emptyText = '--';
    }

    static fromInfo(info) {
      let cls = Katrid.Data.Fields[info.type] || StringField;
      return new cls(info);
    }

    static fromArray(fields) {
      let r = {};
      Object.keys(fields).map(k => r[k] = this.fromInfo(fields[k]));
      return r;
    }

    assign(el) {
      this.$el = el;
      this.caption = el.attr('label') || this.caption;
      let readonly = el.attr('ng-readonly');
      if (!_.isUndefined(readonly))
        this.ngReadonly = readonly;
      let cols = el.attr('cols');
      if (!_.isUndefined(cols))
        this.cols = cols;

    }

    fromJSON(value, dataSource) {
      dataSource.record[this.name] = value;
    }

    get validAttributes() {
       return ['name', 'nolabel', 'readonly', 'required'];
    }

    getAttributes(attrs) {
      let res = {};
      let validAttrs = this.validAttributes;
      for (let [k, v] of Object.entries(attrs.$attr))
        if (validAttrs.includes(v)) {
          res[v] = attrs[k];
          if (res[v] === '')
            res[v] = v;
        }
      if (this.ngReadonly)
        res['ng-readonly'] = this.ngReadonly;
      else if (this.readonly)
        res['readonly'] = this.readonly;
      res['ng-model'] = 'record.' + this.name;
      if (attrs.ngFieldChange) {
        res['ng-change'] = attrs.ngFieldChange;
        console.log('change', attrs.ngFieldChange);
      }
      if (this.required)
        res['required'] = this.required;
      return res;
    }

    get hasChoices() {
      return this._info.choices && this._info.choices.length > 0;
    }

   get name() {
      return this._info.name;
    }

    get model() {
      return this._info.model;
    }

    get maxLength() {
      return this._info.max_length;
    }

    get type() {
      return this._info.type;
    }

    get paramTemplate() {
      return 'view.param.String';
    }

    format(value) {
      return value.toString();
    }

    toJSON(val) {
      return val;
    }

    createWidget(widget, scope, attrs, element) {
      if (!widget) {
        // special fields case
        if (this.hasChoices)
          widget = 'SelectionField';
      }
      let cls = Katrid.ui.Widgets[widget || this.type] || Katrid.ui.Widgets.StringField;
      return new cls(scope, attrs, this, element);
    }

    validate() {

    }

    get defaultCondition() {
      return '=';
    }

    isControlVisible(condition) {
      switch (condition) {
        case 'is null':
          return false;
        case 'is not null':
          return false;
      }
      return true;
    }

  }

  class StringField extends Field {
    constructor(info) {
      if (!info.cols)
        info.cols = 3;
      super(...arguments);
    }
  }

  class BooleanField extends Field {
    constructor(info) {
      if (!info.cols)
        info.cols = 3;
      if (!info.template)
        info.template = {};
      if (!info.template.form)
        info.template.form = 'view.form.boolean-field.pug';
      super(...arguments);
    }

    get paramTemplate() {
      return 'view.param.Boolean';
    }

  }

  class DateField extends Field {
    constructor(info) {
      if (!info.cols)
        info.cols = 3;
      super(...arguments);
      this.template.form = 'view.form.date-field.pug';
      this.template.list = 'view.list.date-field.pug';
    }
    toJSON(val) {
      return val;
    }

    get paramTemplate() {
      return 'view.param.Date';
    }

    format(value) {
      if (_.isString(value))
        return moment(value).format(Katrid.i18n.gettext('yyyy-mm-dd').toUpperCase());
      return '';
    }

    getAttributes(attrs) {
      let res = super.getAttributes(attrs);
      res['type'] = 'date';
      return res;
    }
  }

  class DateTimeField extends DateField {
    get paramTemplate() {
      return 'view.param.DateTime';
    }

    getAttributes(attrs) {
      let res = super.getAttributes(attrs);
      res['type'] = 'datetime-local';
      return res;
    }
  }

  class NumericField extends Field {
    constructor(info) {
      if (!info.cols)
        info.cols = 3;
      super(...arguments);
      if (Katrid.ui.isMobile)
        this.template.form = 'view.form.numpad-field.pug';
      else
        this.template.form = 'view.form.numeric-field.pug';
      this.template.list = 'view.list.numeric-field.pug';
    }

    toJSON(val) {
      if (val && _.isString(val))
        return parseFloat(val);
      return val;
    }

  }

  class IntegerField extends Field {
    constructor(info) {
      if (!info.cols)
        info.cols = 3;
      super(...arguments);
    }

    toJSON(val) {
      if (val && _.isString(val))
        return parseInt(val);
      return val;
    }

    get paramTemplate() {
      return 'view.param.Integer';
    }
  }

  class FloatField extends NumericField {
  }

  class DecimalField extends NumericField {
    constructor() {
      super(...arguments);
      this.decimalPlaces = 2;
      if (this._info.attrs) {
        this.decimalPlaces = this._info.attrs.decimal_places || 2;
      }
    }
  }

  class ForeignKey extends Field {
    constructor(info) {
      super(...arguments);
      this.domain = info.domain;
      Object.assign(this.template, {
        list: 'view.list.foreignkey.pug',
        form: 'view.form.foreignkey.pug',
      });
    }

    assign(el) {
      super.assign(el);
      let domain = $(el).attr('domain');
      if (domain)
        this.domain = domain;
    }

    toJSON(val) {
      if (_.isArray(val))
        return val[0];
      return val;
    }

    get validAttributes() {
      return super.validAttributes.concat(['domain']);
    }
  }

  class OneToManyField extends Field {
    constructor(info) {
      if (!info.cols)
        info.cols = 12;
      super(...arguments);
      this.template.form = 'view.form.grid.pug';
    }
    get field() {
      return this._info.field;
    }

    get validAttributes() {
      return super.validAttributes.concat(['inline-editor']);
    }

    fromJSON(val, dataSource) {
      if (val && val instanceof Array) {
        val.map((obj) => {
          if (obj.action === 'CLEAR')
            dataSource.childByName(this.name).scope.records = [];
          else if (obj.action === 'CREATE') {
            let child = dataSource.childByName(this.name);
            child.scope.addRecord(obj.values);
          }
        });
      }
    }
  }

  class ManyToManyField extends ForeignKey {
    toJSON(val) {
      if (_.isArray(val))
        return val.map(obj => _.isArray(obj) ? obj[0] : obj);
      else if (_.isString(val))
        val = val.split(',');
      return val;
    }
  }

  class TextField extends StringField {
    constructor(info) {
      super(...arguments);
      if (!info.template || (info.template && !info.template.form))
        this.template.form = 'view.form.text-field.pug';
    }
  }

  class ImageField extends Field {
    constructor(info) {
      if (!info.template)
        info.template = {};
      if (!info.template.form)
        info.template.form = 'view.form.image-field.pug';
      super(...arguments);
      this.noImageUrl = '/static/web/assets/img/no-image.png';
    }

    getAttributes(attrs) {
      let res = super.getAttributes(attrs);
      res.ngSrc = attrs.ngEmptyImage || (attrs.emptyImage && (`'${attrs.emptyImage}`)) || `'${this.noImageUrl}'`;
      res.ngSrc = `{{ ${res['ng-model']} || ${res.ngSrc} }}`;
      return res;
    }
  }

  Katrid.Data.Fields = {
    Field,
    StringField,
    IntegerField,
    FloatField,
    DecimalField,
    DateTimeField,
    ForeignKey,
    OneToManyField,
    ManyToManyField,
    TextField,
    DateField,
    BooleanField,
    ImageField,
  }


})();


(function() {

  Katrid.ui = {
    Keyboard: {
      keyCode: {
        BACKSPACE: 8,
        COMMA: 188,
        DELETE: 46,
        DOWN: 40,
        END: 35,
        ENTER: 13,
        ESCAPE: 27,
        HOME: 36,
        LEFT: 37,
        PAGE_DOWN: 34,
        PAGE_UP: 33,
        PERIOD: 190,
        RIGHT: 39,
        SPACE: 32,
        TAB: 9,
        UP: 38
      }
    },
    toggleFullScreen() {
      if (!document.fullscreenElement &&
        !document.mozFullScreenElement && !document.webkitFullscreenElement && !document.msFullscreenElement) {
        if (document.documentElement.requestFullscreen) {
          document.documentElement.requestFullscreen();
        } else if (document.documentElement.msRequestFullscreen) {
          document.documentElement.msRequestFullscreen();
        } else if (document.documentElement.mozRequestFullScreen) {
          document.documentElement.mozRequestFullScreen();
        } else if (document.documentElement.webkitRequestFullscreen) {
          document.documentElement.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
        }
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen();
        } else if (document.msExitFullscreen) {
          document.msExitFullscreen();
        } else if (document.mozCancelFullScreen) {
          document.mozCancelFullScreen();
        } else if (document.webkitExitFullscreen) {
          document.webkitExitFullscreen();
        }
      }
    }
  };

  Katrid.ui.uiKatrid = angular.module('ui.katrid', []);

})();

(function () {

  class ActionManager extends Array {
    constructor() {
      super();
      this.mainAction = null;
    }

    addAction(action) {
      if (!this.mainAction)
        this.mainAction = action;
      this.push(action);
    }

    removeAction(action) {
      this.splice(this.indexOf(action), this.length);
    }

    get action() {
      return this[this.length-1];
    }

    set action(action) {
      this.splice(this.indexOf(action) + 1, this.length);
    }

    clear() {
      this.length = 0;
      this.mainAction = null;
    }

    get path() {
      return this.action.path;
    }

    doAction(action) {

    }

    get context() {
      return this.action.getContext();
    }
  }

  class Action {
    static initClass() {
      this.actionType = null;
    }
    constructor(info, scope, location) {
      Katrid.app.actionManager.addAction(this);
      this.info = info;
      this.scope = scope;
      this.location = location;
      this.currentUrl = this.location.$$path;
    }

    getContext() {
      let ctx;
      if (_.isString(this.info.context))
        ctx = JSON.parse(this.info.context);
      if (!ctx)
        ctx = {};
      // ctx['params'] = this.location.$$search;
      return ctx;
    }

    doAction(act) {
      let type = act.type || act.action_type;
      return Katrid.Actions[type].dispatchAction(this, act);
    }

    openObject(service, id, evt) {
      if (this._unregisterHook)
        this._unregisterHook();

      evt.preventDefault();
      evt.stopPropagation();
      if (evt.ctrlKey) {
        window.open(evt.target.href);
        return false;
      }
      const url = `action/${ service }/view/`;
      this.location.path(url, this).search({
        view_type: 'form',
        id
      });
      return false;
    }

    restore() {}

    apply() {}
    backTo(index, viewType) {
      if (this._currentPath !==  this._unregisterHook && (Katrid.app.actionManager.length > 1))
        this._unregisterHook();

      // restore to query view
      let action = Katrid.app.actionManager[index];
      if ((index === 0) && (viewType === 0))
        return action.restore(action.searchViewType || action.viewModes[0]);
      else if ((index === 0) && (viewType === 'form'))
        return action.restore('form');

      Katrid.app.actionManager.action = action;

      if (!viewType)
        viewType = 'form';

      let location;
      location = action.currentUrl;
      action.info.__cached = true;
      let p = this.location.path(location, true, action.info);
      let search = action._currentParams[viewType];
      console.log('search', search);
      if (search)
        p.search(search);
    }

    execute() {}

    getCurrentTitle() {
      return this.info.display_name;
    }

    search() {
      if (!this.isDialog) {
        return this.location.search.apply(null, arguments);
      }
    }
  }
  Action.initClass();




  class ViewAction extends Action {
    static initClass() {
      this.actionType = 'ir.action.view';
    }
    routeUpdate(search) {
      return Katrid.core.setContent(this.info.content, this.scope);
    }
  }
  ViewAction.initClass();


  class UrlAction extends Action {
    static initClass() {
      this.actionType = 'ir.action.url';
    }

    constructor(info, scope, location) {
      super(info, scope, location);
      window.location.href = info.url;
    }
  }
  UrlAction.initClass();


  Katrid.Actions = {
    Action,
    ViewAction,
    UrlAction,
    ActionManager,
  };


  Katrid.Actions[ViewAction.actionType] = ViewAction;
  Katrid.Actions[UrlAction.actionType] = UrlAction;


})();

(function() {

  class ClientAction extends Katrid.Actions.Action {
    static initClass() {
      this.actionType = 'ir.action.client';
      this.registry = {};
    }

    static register(tag, obj) {
      this.registry[tag] = obj;
    }

    static executeTag(parent, act) {
      // get action
      let action = this.registry[act.tag];
      if (action.prototype instanceof Katrid.UI.Views.ActionView) {
        action = new action(parent.scope);
        action.renderTo(parent);
      }
      else console.log('is a function');
    }

    static tagButtonClick(btn) {
      let action = {
        type: 'ir.action.client',
        tag: btn.attr('name'),
        target: btn.attr('target') || 'new',
      };

      action = new ClientAction(action, Katrid.Actions.actionManager.action.scope, Katrid.Actions.actionManager.action.location);
      action.execute();
    }

    tag_refresh() {
      this.dataSource.refresh();
    }

    get templateUrl() {
      console.log(this.tag);
      return this.tag.templateUrl;
    }

    execute() {
      let tag = ClientAction.registry[this.info.tag];
      this.tag = tag;
      if (tag.prototype instanceof Katrid.ui.Views.ClientView) {
        this.tag = new tag(this);
        console.log(this.scope);
        let el = this.tag.render();
        if (this.info.target === 'new') {
          el = el.modal();
          el = Katrid.core.compile(el)(this.scope);
        }
      } else if (_.isString(tag))
        this[tag].apply(this);
    }

    async routeUpdate(location) {
      // this.execute();
    }

    get template() {
      return this.tag.template;
    }
  }

  ClientAction.initClass();

  Katrid.Actions.ClientAction = ClientAction;
  Katrid.Actions[ClientAction.actionType] = ClientAction;

})();

(function() {

  class WindowAction extends Katrid.Actions.Action {
    static initClass() {
      this.actionType = 'ir.action.window';
    }
    constructor(info, scope, location) {
      super(info, scope, location);
      this.templateUrl = 'ir.action.window.pug';
      this.notifyFields = [];
      this.viewMode = info.view_mode;
      this.viewModes = this.viewMode.split(',');
      this.selectionLength = 0;
      this._cachedViews = {};
      this._currentParams = {};
      this._currentPath = null;
      this.searchView = null;
    }

    getContext() {
      let ctx = super.getContext();
      let sel = this.selection;
      if (sel && sel.length) {
        ctx.active_id = sel[0];
        ctx.active_ids = sel;
      }
      return ctx;
    }

    restore(viewType) {
      // restore the last search mode view type
      let url = this._currentPath || this.location.$$path;
      let params = this._currentParams[viewType] || {};
      params['view_type'] = viewType;
      if (Katrid.app.actionManager.length > 1) {
        console.log(this.info);
        params['actionId'] = this.info.id;
        this.$state.go('actionView', params);
        // this.location.path(url);
        // this.location.search(params);
      } else {
        this.viewType = viewType;
      }
      // window.location.href = '/web/#' + url + '?view_type=list';
      // this.setViewType(viewType, this._currentParams[viewType]);
    }

    // registerFieldNotify(field) {
    //   // Add field to notification list
    //   if (this.notifyFields.indexOf(field.name) === -1) {
    //     this.scope.$watch(`record.${field.name}`, () => console.log('field changed', field));
    //     return this.notifyFields.push(fields);
    //   }
    // }

    getCurrentTitle() {
      if (this.viewType === 'form') {
        return this.scope.record.display_name;
      }
      return super.getCurrentTitle();
    }

    createNew() {
      this.viewType = 'form';
      setTimeout(async () => {
        try {
          Katrid.ui.Dialogs.WaitDialog.show();
          await this.dataSource.insert();
        } finally {
          Katrid.ui.Dialogs.WaitDialog.hide();
        }
      });
    }

    deleteSelection() {
      let sel = this.selection;
      if (!sel)
        return false;
      if (
        ((sel.length === 1) && confirm(Katrid.i18n.gettext('Confirm delete record?'))) ||
        ((sel.length > 1) && confirm(Katrid.i18n.gettext('Confirm delete records?')))
      ) {
        this.model.destroy(sel);
        const i = this.scope.records.indexOf(this.scope.record);
        this.viewType = 'list';
        this.dataSource.refresh();
      }
    }

    async copy() {
      this.viewType = 'form';
      await this.dataSource.copy(this.scope.record.id);
      return false;
    }

    async copyTo(configId) {
      console.log('copy to', configId);
      if (this.scope.recordId) {
        let svc = new Katrid.Services.Model('ir.copy.to');
        let res = await svc.rpc('copy_to', [configId, this.scope.recordId]);
        let model = new Katrid.Services.Model(res.model);
        let views = await model.getViewInfo({ view_type: 'form' });
        let wnd = new Katrid.ui.Dialogs.Window(this.scope, { view: views }, Katrid.Core.compile, null, model);
        wnd.createNew({ defaultValues: res.value });
      }
    }

    async routeUpdate(search) {
      const viewType = this.viewType;
      let oldViewType = this._currentViewType;

      if (viewType != null) {
        if ((this.scope.records == null)) {
          this.scope.records = [];
        }
        if (this.viewType !== oldViewType) {
          this.dataSource.pageIndex = null;
          this.dataSource.record = {};
          this.viewType = viewType;
          // let r = await this.execute();
          this._currentViewType = this.viewType;
          //if (r !== true)
          //  return this.routeUpdate(this.location.$$search);
        }

        if (Katrid.ui.Views.searchModes.includes(this.viewType) && (search.page !== this.dataSource.pageIndex)) {
          const filter = this.searchParams || {};
          const fields = Object.keys(this.view.fields);
          this.dataSource.pageIndex = parseInt(search.page);
          this.dataSource.limit = parseInt(search.limit || this.info.limit);
          await this.dataSource.search(filter, this.dataSource.pageIndex || 1, fields);
        } else if (search.id && (this.dataSource.recordId !== search.id)) {
          this.scope.record = null;
          this.dataSource.get(search.id);
        }

        if ((search.page == null) && (this.viewType !== 'form')) {
          this.location.search('page', 1);
          console.log('set limit', this._viewType);
          this.location.search('limit', this.info.limit);
        }


      }
      if (search.view_type !== this.viewType)
        this.viewType = search.view_type;

      this._currentParams[this.viewType] = jQuery.extend({}, search);
      this._currentPath = this.location.$$path;

      if (search.title)
        this.info.display_name = search.title;

    }

    switchView(viewType) {
      return;
      // TODO optimize the view transitions: if oldview in searchModes and newview in searchModes change content only
      let saveState = this.viewType && this.searchView;

      if (viewType === 0)
        for (let v of this.viewModes) if (v !== 'form') {
          viewType = v;
          break;
        }

      // save previous state
      let data;
      if (saveState) {
        data = this.searchView.dump();
        this.searchParams = this.searchView.query.getParams();
      }

      const search = this.location.$$search;
      if (viewType !== 'form')
        delete search.id;
      search.view_type = viewType;

      this.routeUpdate(search);
      this.location.search(search);

      // restore previous state
      if (saveState)
        setTimeout(() => this.searchView.load(data), 0);
    }

    get dataSource() {
      return this.scope.dataSource;
    }

    apply() {
      if (this.viewModes.length) {
        let templ = [];
        for (let [k, v] of Object.entries(this.views)) {
          let viewCls = Katrid.ui.Views[k];
          if (viewCls) {
            let view = new viewCls(this, this.scope, v, v.content);
            this._cachedViews[k] = view;
            let s = view.render();
            if (!_.isString(s))
              s = s[0].outerHTML;
            templ.push(`<div class="action-view" ng-if="action.viewType === '${k}'">${s}</div>`);
          }
        }
        this._template = templ.join('');
      } else {
        // this.render(this.scope, this.scope.view.content, this.viewType);
        let viewCls = Katrid.UI.Views[this.viewType];
        let view = new viewCls(this, this.scope, this.view, this.view.content);

        this._cachedViews[this.viewType] = view;
        this._template = view.render();
        // Katrid.core.setContent(cache, this.scope);
        // if (Katrid.UI.Views.searchModes.includes(this.viewType)) this.lastViewType = this.viewType;
        // return this.routeUpdate(this.location.$$search);
      }
    }

    async execute() {
      if (!this.views) {
        let res = await this.model.loadViews({
          views: this.info.views,
          action: this.info.id,
          toolbar: true
        });
        this.fields = res.fields;
        this.fieldList = res.fieldList;
        this.views = res.views;
      }
    }

    get viewType() {
      return this._viewType;
    }

    set viewType(value) {
      if (!value)
        value = this.viewModes[0];

      if (value === this._viewType)
        return;

      if (!this._viewType)
        this.searchViewType = this.viewModes[0];

      this.view = this.views[value];
      this._viewType = value;
      this.switchView(value);

      if (!this.scope.$$phase)
        this.scope.$apply();

      if (this.location.$$search.view_type !== value) {
        this.location.search({ view_type: value });
      }
    }

    set view(value) {
      this._view = value;
      if (this.scope)
        this.scope.view = value;
    }

    get view() {
      return this._view;
    }

    searchText(q) {
      return this.location.search('q', q);
    }

    _prepareParams(params) {
      const r = {};
      for (let p of Array.from(params)) {
        if (p.field && (p.field.type === 'ForeignKey')) {
          r[p.field.name] = p.id;
        } else {
          r[p.id.name + '__icontains'] = p.text;
        }
      }
      return r;
    }

    setSearchParams(params) {
      let p = {};
      if (this.info.domain)
        p = $.parseJSON(this.info.domain);
      for (let [k, v] of Object.entries(p)) {
        let arg = {};
        arg[k] = v;
        params.push(arg);
      }
      return this.dataSource.search(params);
    }

    applyGroups(groups) {
      return this.dataSource.groupBy(groups[0]);
    }

    doViewAction(viewAction, target, confirmation, prompt) {
      return this._doViewAction(this.scope, viewAction, target, confirmation, prompt);
    }

    _doViewAction(scope, viewAction, target, confirmation, prompt) {
      let promptValue = null;
      if (prompt) {
        promptValue = window.prompt(prompt);
      }
      if (!confirmation || (confirmation && confirm(confirmation))) {
        return this.model.doViewAction({ action_name: viewAction, target, prompt: promptValue })
        .then(function(res) {
          let msg, result;
          if (res.status === 'open') {
            return window.open(res.open);
          } else if (res.status === 'fail') {
            return (() => {
              result = [];
              for (msg of Array.from(res.messages)) {
                result.push(Katrid.Dialogs.Alerts.error(msg));
              }
              return result;
            })();
          } else if ((res.status === 'ok') && res.result.messages) {
            return (() => {
              const result1 = [];
              for (msg of Array.from(res.result.messages)) {
                result1.push(Katrid.Dialogs.Alerts.success(msg));
              }
              return result1;
            })();
          }
        });
      }
    }

    async formButtonClick(id, meth, self) {
      const res = await this.scope.model.post(meth, { kwargs: { id: id } });
      if (res.open)
        return window.open(res.open);
      if (res.tag === 'refresh')
        this.dataSource.refresh();
      if (res.type) {
        const act = new (Katrid.Actions[res.type])(res, this.scope, this.scope.location);
        act.execute();
      }
    };

    doBindingAction(evt) {
      this.selection;
      Katrid.Services.Actions.load($(evt.currentTarget).data('id'))
      .then(action => {

        if (action.action_type === 'ir.action.report')
          Katrid.Actions.ReportAction.dispatchBindingAction(this, action);

      });
    }

    listRowClick(index, row, evt) {
      const search = {
        view_type: 'form',
        id: row.id,
        actionId: this.info.id,
      };
      if (evt.ctrlKey) {
        const url = `#${this.location.$$path}?${$.param(search)}`;
        window.open(url);
        return;
      }
      if (row._group) {
        row._group.expanded = !row._group.expanded;
        row._group.collapsed = !row._group.expanded;
        if (row._group.expanded) {
          this.dataSource.expandGroup(index, row);
        } else {
          this.dataSource.collapseGroup(index, row);
        }
      } else {
        this.dataSource.recordIndex = index;
        this.viewType = 'form';
        this.$state.go('.', search, { inherit: false });
      }
    }

    autoReport() {
      return this.model.autoReport()
      .then(function(res) {
        if (res.ok && res.result.open) {
          return window.open(res.result.open);
        }
      });
    }

    showDefaultValueDialog() {
      const html = Katrid.UI.Utils.Templates.getSetDefaultValueDialog();
      const modal = $(Katrid.core.compile(html)(this.scope)).modal();
      modal.on('hidden.bs.modal', function() {
        $(this).data('bs.modal', null);
        return $(this).remove();
      });
    }

    selectToggle(el) {
      this._selection = $(el).closest('table').find('td.list-record-selector :checkbox').filter(':checked');
      this.selectionLength = this._selection.length;
    }

    get selection() {
      if (this.viewType === 'form') {
        if (this.scope.recordId)
          return [this.scope.recordId];
        else
          return;
      }
      if (this._selection)
        return Array.from(this._selection).map((el) => ($(el).data('id')));
    }

    deleteAttachment(attachments, index) {
      let att = attachments[index];
      if (confirm(Katrid.i18n.gettext('Confirm delete attachment?'))) {
        attachments.splice(index, 1);
        Katrid.Services.Attachments.destroy(att.id);
      }
    }
  }
  WindowAction.initClass();

  Katrid.Actions.WindowAction = WindowAction;
  Katrid.Actions[WindowAction.actionType] = WindowAction;

})();

(function() {

  class ReportAction extends Katrid.Actions.Action {
    static initClass() {
      this.actionType = 'ir.action.report';
    }

    static async dispatchBindingAction(parent, action) {
      let format = localStorage.katridReportViewer || 'pdf';
      let sel = parent.selection;
      console.log('selection ', sel);
      if (sel)
        sel = sel.join(',');
      let params = { data: [{ name: 'id', value: sel }] };
      const svc = new Katrid.Services.Model('ir.action.report');
      let res = await svc.post('export_report', { args: [action.id], kwargs: { format, params } });
      if (res.open)
        return window.open(res.open);
    }

    constructor(info, scope, location) {
      super(info, scope, location);
      this.templateUrl = 'view.report';
      this.userReport = {};
    }

    userReportChanged(report) {
      return this.location.search({
        user_report: report});
    }

    async routeUpdate(search) {
      this.userReport.id = search.user_report;
      if (this.userReport.id) {
        const svc = new Katrid.Services.Model('ir.action.report');
        let res = await svc.post('load_user_report', { kwargs: { user_report: this.userReport.id } });
        this.userReport.params = res.result;
      } else {
        // Katrid.core.setContent(, this.scope);
      }
    }

    get template() {
      return Katrid.Reports.Reports.renderDialog(this);
    }
  }
  ReportAction.initClass();

  Katrid.Actions.ReportAction = ReportAction;
  Katrid.Actions[ReportAction.actionType] = ReportAction;

})();

(function () {
  let _counter = 0;


  class Reports {
    static initClass() {
      this.currentReport = {};
      this.currentUserReport = {};
    }

    static get(repName) {}

    static renderDialog(action) {
      return Katrid.app.getTemplate('view.report');
    }
  }
  Reports.initClass();


  class Report {
    constructor(action, scope) {
      this.action = action;
      this.scope = scope;
      this.info = this.action.info;
      Katrid.Reports.Reports.currentReport = this;
      if ((Params.Labels == null)) {
        Params.Labels = {
          exact: Katrid.i18n.gettext('Is equal'),
          in: Katrid.i18n.gettext('Selection'),
          contains: Katrid.i18n.gettext('Contains'),
          startswith: Katrid.i18n.gettext('Starting with'),
          endswith: Katrid.i18n.gettext('Ending with'),
          gt: Katrid.i18n.gettext('Greater-than'),
          lt: Katrid.i18n.gettext('Less-than'),
          between: Katrid.i18n.gettext('Between'),
          isnull: Katrid.i18n.gettext('Is Null')
        };
      }

      this.name = this.info.name;
      this.id = ++_counter;
      this.values = {};
      this.params = [];
      this.filters = [];
      this.groupables = [];
      this.sortables = [];
      this.totals = [];
    }

    getUserParams() {
      const report = this;
      const params = {
        data: [],
        file: report.container.find('#id-report-file').val()
      };
      for (let p of Array.from(this.params)) {
        params.data.push({
          name: p.name,
          op: p.operation,
          value1: p.value1,
          value2: p.value2,
          type: p.type
        });
      }

      const fields = report.container.find('#report-id-fields').val();
      params['fields'] = fields;

      const totals = report.container.find('#report-id-totals').val();
      params['totals'] = totals;

      const sorting = report.container.find('#report-id-sorting').val();
      params['sorting'] = sorting;

      const grouping = report.container.find('#report-id-grouping').val();
      params['grouping'] = grouping;

      return params;
    }

    loadFromXml(xml) {
      if (_.isString(xml)) {
        xml = $(xml);
      }
      this.scope.customizableReport = xml.attr('customizableReport');
      this.scope.advancedOptions = xml.attr('advancedOptions');
      this.model = xml.attr('model');
      const fields = [];

      for (let f of Array.from(xml.find('field'))) {
        let tag = f.tagName;
        f = $(f);
        const name = f.attr('name');
        console.log(this.info);
        let fld;
        if (this.info.fields)
          fld = this.info.fields[name];
        const label = f.attr('label') || (fld && fld.caption) || name;
        const groupable = f.attr('groupable');
        const sortable = f.attr('sortable');
        const total = f.attr('total');
        let param = f.attr('param');
        if ((tag === 'FIELD') && (!param))
          param = 'static';
        const required = f.attr('required');
        const autoCreate = f.attr('autoCreate') || required || (param === 'static');
        const operation = f.attr('operation');
        let type = f.attr('type') || (fld && fld.type);
        const modelChoices = f.attr('model-choices');
        if (!type && modelChoices) type = 'ModelChoices';
        fields.push({
          name,
          label,
          groupable,
          sortable,
          total,
          param,
          required,
          operation,
          modelChoices,
          type,
          autoCreate,
          field: f,
        });
      }

      const params = (Array.from(xml.find('param')).map((p) => $(p).attr('name')));

      return this.load(fields, params);
    }

    saveDialog() {
      const params = this.getUserParams();
      const name = window.prompt(Katrid.i18n.gettext('Report name'), Katrid.Reports.Reports.currentUserReport.name);
      if (name) {
        Katrid.Reports.Reports.currentUserReport.name = name;
        $.ajax({
          type: 'POST',
          url: this.container.find('#report-form').attr('action') + '?save=' + name,
          contentType: "application/json; charset=utf-8",
          dataType: 'json',
          data: JSON.stringify(params)
        });
      }
      return false;
    }

    load(fields, params) {
      if (!fields) {
        ({ fields } = this.info);
      }
      if (!params) {
        params = [];
      }
      this.fields = fields;
      this.scope.fields = {};

      // Create params
      for (let p of fields) {
        this.scope.fields[p.name] = p;
        if (p.groupable)
          this.groupables.push(p);
        if (p.sortable)
          this.sortables.push(p);
        if (p.total)
          this.totals.push(p);
        if (!p.autoCreate) p.autoCreate = params.includes(p.name);
      }
    }

    loadParams() {
      for (let p of Array.from(this.fields)) {
        if (p.autoCreate)
          this.addParam(p.name);
      }
    }

    addParam(paramName) {
      for (let p of Array.from(this.fields))
        if (p.name === paramName) {
          p = new Param(p, this);
          this.params.push(p);
          //$(p.render(@elParams))
          break;
        }
    }

    getValues() {}


    export(format) {
      if (format == null)
        format = localStorage.katridReportViewer || 'pdf';
      const params = this.getUserParams();
      const svc = new Katrid.Services.Model('ir.action.report');
      svc.post('export_report', { args: [this.info.id], kwargs: { format, params } })
      .then(function(res) {
        if (res.open) {
          return window.open(res.open);
        }
      });
      return false;
    }

    preview() {
      return this.export(localStorage.katridReportViewer);
    }

    renderFields() {
      let p;
      let el = $('<div></div>');
      const flds = this.fields.map(p => `<option value="${p.name}">${p.label}</option>`).join('');
      const aggs = ((() => {
        const result1 = [];
        for (p of Array.from(this.fields)) {
          if (p.total) {
            result1.push(`<option value="${p.name}">${p.label}</option>`);
          }
        }
        return result1;
      })()).join('');
      el = this.container.find('#report-params');
      let sel = el.find('#report-id-fields');
      sel.append($(flds))
      .select2({ tags: ((() => {
        const result2 = [];
        for (p of Array.from(this.fields)) result2.push({id: p.name, text: p.label});
        return result2;
      })()) })
      .select2("container").find("ul.select2-choices").sortable({
          containment: 'parent',
          start() { return sel.select2("onSortStart"); },
          update() { return sel.select2("onSortEnd"); }
      });
      if (Katrid.Reports.Reports.currentUserReport.params && Katrid.Reports.Reports.currentUserReport.params.fields) {
        console.log(Katrid.Reports.Reports.currentUserReport.params.fields);
        sel.select2('val', Katrid.Reports.Reports.currentUserReport.params.fields);
      }
      //sel.data().select2.updateSelection([{ id: 'vehicle', text: 'Vehicle'}])
      sel = el.find('#report-id-totals');
      sel.append(aggs)
      .select2({ tags: ((() => {
        const result3 = [];
        for (p of Array.from(this.fields)) {         if (p.total) {
            result3.push({ id: p.name, text: p.label });
          }
        }
        return result3;
      })()) })
      .select2("container").find("ul.select2-choices").sortable({
          containment: 'parent',
          start() { return sel.select2("onSortStart"); },
          update() { return sel.select2("onSortEnd"); }
      });
      return el;
    }

    renderParams(container) {
      let p;
      const el = $('<div></div>');
      this.elParams = el;
      const loaded = {};

      const userParams = Katrid.Reports.Reports.currentUserReport.params;
      if (userParams && userParams.data) {
        for (p of Array.from(userParams.data)) {
          loaded[p.name] = true;
          this.addParam(p.name, p.value);
        }
      }

      for (p of Array.from(this.params)) {
        if (p.static && !loaded[p.name]) {
          $(p.render(el));
        }
      }
      return container.find('#params-params').append(el);
    }

    renderGrouping(container) {
      const opts = (Array.from(this.groupables).map((p) => `<option value="${p.name}">${p.label}</option>`)).join('');
      const el = container.find("#params-grouping");
      const sel = el.find('select').select2();
      return sel.append(opts)
      .select2("container").find("ul.select2-choices").sortable({
          containment: 'parent',
          start() { return sel.select2("onSortStart"); },
          update() { return sel.select2("onSortEnd"); }
      });
    }

    renderSorting(container) {
      const opts = (Array.from(this.sortables).filter((p) => p.sortable).map((p) => `<option value="${p.name}">${p.label}</option>`)).join('');
      const el = container.find("#params-sorting");
      const sel = el.find('select').select2();
      return sel.append(opts)
      .select2("container").find("ul.select2-choices").sortable({
          containment: 'parent',
          start() { return sel.select2("onSortStart"); },
          update() { return sel.select2("onSortEnd"); }
      });
    }

    render(container) {
      this.container = container;
      let el = this.renderFields();
      if (this.sortables.length) {
        el = this.renderSorting(container);
      } else {
        container.find("#params-sorting").hide();
      }

      if (this.groupables.length) {
        el = this.renderGrouping(container);
      } else {
        container.find("#params-grouping").hide();
      }

      return el = this.renderParams(container);
    }
  }


  class Params {
    static initClass() {
      this.Operations = {
        exact: 'exact',
        in: 'in',
        contains: 'contains',
        startswith: 'startswith',
        endswith: 'endswith',
        gt: 'gt',
        lt: 'lt',
        between: 'between',
        isnull: 'isnull'
      };

      this.DefaultOperations = {
        CharField: this.Operations.exact,
        IntegerField: this.Operations.exact,
        DateTimeField: this.Operations.between,
        DateField: this.Operations.between,
        FloatField: this.Operations.between,
        DecimalField: this.Operations.between,
        ForeignKey: this.Operations.exact,
        ModelChoices: this.Operations.exact,
        SelectionField: this.Operations.exact,
      };

      this.TypeOperations = {
        CharField: [this.Operations.exact, this.Operations.in, this.Operations.contains, this.Operations.startswith, this.Operations.endswith, this.Operations.isnull],
        IntegerField: [this.Operations.exact, this.Operations.in, this.Operations.gt, this.Operations.lt, this.Operations.between, this.Operations.isnull],
        FloatField: [this.Operations.exact, this.Operations.in, this.Operations.gt, this.Operations.lt, this.Operations.between, this.Operations.isnull],
        DecimalField: [this.Operations.exact, this.Operations.in, this.Operations.gt, this.Operations.lt, this.Operations.between, this.Operations.isnull],
        DateTimeField: [this.Operations.exact, this.Operations.in, this.Operations.gt, this.Operations.lt, this.Operations.between, this.Operations.isnull],
        DateField: [this.Operations.exact, this.Operations.in, this.Operations.gt, this.Operations.lt, this.Operations.between, this.Operations.isnull],
        ForeignKey: [this.Operations.exact, this.Operations.in, this.Operations.isnull],
        ModelChoices: [this.Operations.exact, this.Operations.in, this.Operations.isnull],
        SelectionField: [this.Operations.exact, this.Operations.isnull],
      };

      this.Widgets = {
        CharField(param) {
          return `<div><input id="rep-param-id-${param.id}" ng-model="param.value1" type="text" class="form-control"></div>`;
        },

        IntegerField(param) {
          let secondField = '';
          if (param.operation === 'between') {
            secondField = `<div class="col-xs-6"><input id="rep-param-id-${param.id}-2" ng-model="param.value2" type="text" class="form-control"></div>`;
          }
          return `<div class="row"><div class="col-sm-6"><input id="rep-param-id-${param.id}" type="number" ng-model="param.value1" class="form-control"></div>${secondField}</div>`;
        },

        DecimalField(param) {
          let secondField = '';
          if (param.operation === 'between') {
            secondField = `<div class="col-xs-6"><input id="rep-param-id-${param.id}-2" ng-model="param.value2" type="text" class="form-control"></div>`;
          }
          return `<div class="col-sm-6"><input id="rep-param-id-${param.id}" type="number" ng-model="param.value1" class="form-control"></div>${secondField}`;
        },

        DateTimeField(param) {
          let secondField = '';
          if (param.operation === 'between') {
            secondField = `<div class="col-xs-6"><input id="rep-param-id-${param.id}-2" type="datetime-local" ng-model="param.value2" class="form-control"></div>`;
          }
          return `<div class="row"><div class="col-xs-6"><input id="rep-param-id-${param.id}" type="date" ng-model="param.value1" class="form-control"></div>${secondField}</div>`;
        },

        DateField(param) {
          let secondField = '';
          if (param.operation === 'between') {
            secondField = `<div class="col-xs-6"><input id="rep-param-id-${param.id}-2" type="date" ng-model="param.value2" class="form-control"></div>`;
          }
          return `<div class="col-sm-12 row"><div class="col-xs-6"><input id="rep-param-id-${param.id}" type="date" ng-model="param.value1" class="form-control"></div>${secondField}</div>`;
        },

        ForeignKey(param) {
          const serviceName = param.info.field.attr('model') || param.params.model;
          let multiple = '';
          if (param.operation === 'in') {
            multiple = 'multiple';
          }
          return `<div><input id="rep-param-id-${param.id}" ajax-choices="${serviceName}" field="${param.name}" ng-model="param.value1" ${multiple}></div>`;
        },

        ModelChoices(param) {
          return `<div><input id="rep-param-id-${param.id}" ajax-choices="ir.action.report" model-choices="${param.info.modelChoices}" ng-model="param.value1"></div>`;
        },

        SelectionField(param) {
          param.info.choices = param.info.field.data('choices');
          let defaultValue = param.info.field.attr('default');
          if (defaultValue)
            defaultValue = ` ng-init="param.value1='${defaultValue}'"`;
          return `<div${defaultValue}><select class="form-control" ng-model="param.value1"><option value="{{ key }}" ng-repeat="(key, value) in fields.${param.name}.choices">{{ value }}</option></select></div>`
        }
      };
    }
  }
  Params.initClass();


  class Param {
    constructor(info, params) {
      this.info = info;
      this.params = params;
      this.name = this.info.name;
      this.field = this.params.info.fields && this.params.info.fields[this.name];
      this.label = this.info.label || this.params.info.caption;
      this.static = this.info.param === 'static' || this.field.param === 'static';
      this.type = this.info.type || (this.field && this.field.type) || 'CharField';
      this.defaultOperation = this.info.operation || Params.DefaultOperations[this.type];
      this.operation = this.defaultOperation;
      // @operations = @info.operations or Params.TypeOperations[@type]
      this.operations = this.getOperations();
      this.exclude = this.info.exclude;
      this.id = ++_counter;
    }

    defaultValue() {
      return null;
    }

    setOperation(op, focus) {
      if (focus == null) { focus = true; }
      this.createControls(this.scope);
      const el = this.el.find(`#rep-param-id-${this.id}`);
      if (focus) {
        el.focus();
      }
    }

    createControls(scope) {
      const el = this.el.find(".param-widget");
      el.empty();
      let widget = Params.Widgets[this.type](this);
      widget = Katrid.Core.compile(widget)(scope);
      return el.append(widget);
    }

    getOperations() { return (Array.from(Params.TypeOperations[this.type]).map((op) => ({ id: op, text: Params.Labels[op] }))); }

    operationTemplate() {
      const opts = this.getOperations();
      return `<div class="col-sm-4"><select id="param-op-${this.id}" ng-model="param.operation" ng-init="param.operation='${this.defaultOperation}'" class="form-control" onchange="$('#param-${this.id}').data('param').change();$('#rep-param-id-${this.id}')[0].focus()">
  ${opts}
  </select></div>`;
    }

    template() {
      let operation = '';
      if (!this.operation) operation = this.operationTemplate();
      return `<div id="param-${this.id}" class="row form-group" data-param="${this.name}" ng-controller="ParamController"><label class="control-label">${this.label}</label>${operation}<div id="param-widget-${this.id}"></div></div>`;
    }

    render(container) {
      this.el = this.params.scope.compile(this.template())(this.params.scope);
      this.el.data('param', this);
      console.log('render param');
      this.createControls(this.el.scope());
      return container.append(this.el);
    }
  }


  Katrid.ui.uiKatrid.controller('ReportController', ['$scope', '$element', '$compile', function($scope, $element, $compile) {
    const xmlReport = $scope.$parent.action.info.content;
    const report = new Report($scope.$parent.action, $scope);
    $scope.report = report;
    report.loadFromXml(xmlReport);
    report.render($element);
    return report.loadParams();
  }]);


  Katrid.ui.uiKatrid.controller('ReportParamController', ['$scope', '$element', function($scope, $element) {
    $scope.$parent.param.el = $element;
    $scope.$parent.param.scope = $scope;
    return $scope.$parent.param.setOperation($scope.$parent.param.operation, false);
  }]);



  class ReportEngine {
    static load(el) {
      $('row').each((idx, el) => {
        el.addClass('row');
      });
      $('column').each((idx, el) => {
        el.addClass('col');
      })
    }
  }


  Katrid.Reports = {
    Reports,
    Report,
    Param
  };
})();

(() => {

  class Templates {
    constructor(app, templates) {
      this.app = app;
      let oldGet = app.$templateCache.get;
      app.$templateCache.get = name => this.prepare(name, oldGet.call(this, name));
      this.loadTemplates(app.$templateCache, templates);
      for (let [k, v] of Object.entries(PRE_LOADED_TEMPLATES))
        app.$templateCache.put(k, v);
    }

    prepare(name, templ) {
      if (_.isUndefined(templ)) throw Error('Template not found: ' + name);
      if (templ.tagName === 'SCRIPT')
        return templ.innerHTML;
      return templ;
    }

    compileTemplate(base, templ) {
      let el = $(base);
      templ = $(templ.innerHTML);
      for (let child of Array.from(templ))
        if (child.tagName === 'JQUERY') {
          child = $(child);
          let sel = child.attr('selector');
          let op = child.attr('operation');
          if (sel) sel = $(el).find(sel);
          else sel = el;
          sel[op](child[0].innerHTML);
        }
      return el[0].innerHTML;
    }

    loadTemplates(templateCache, res) {
      let templateLst = {};
      let readTemplates = el => {
        if (el.tagName === 'TEMPLATES') Array.from(el.children).map(readTemplates);
        else if (el.tagName === 'SCRIPT') {
          templateLst[el.id] = el.innerHTML;
        }
      };
      let preProcess = el => {
        if (el.tagName === 'TEMPLATES') Array.from(el.children).map(preProcess);
        else if (el.tagName === 'SCRIPT') {
          let base = el.getAttribute('extends');
          let id = el.getAttribute('id') || base;
          if (base) {
            el = templateLst[base] + el;
          } else
            id = el.id;
          templateCache.put(id, el);
        }
      };
      let parser = new DOMParser();
      let doc = parser.parseFromString(res, 'text/html');
      let root = doc.firstChild.children[1].firstChild;
      readTemplates(root);
      preProcess(root);
    }

  }

  let PRE_LOADED_TEMPLATES = {};

  Katrid.ui.registerTemplate = function(name, tmpl) {
    PRE_LOADED_TEMPLATES[name] = tmpl;
  };

  Katrid.ui.Templates = Templates;
  Katrid.ui.Templates.PRE_LOADED_TEMPLATES = PRE_LOADED_TEMPLATES;

})();

(() => {

  class Widget {
  }

  class Component {
  }

  Katrid.ui.Widgets = {
    Widget,
    Component
  };
})();

(() => {

  let compileButtons = (container) => {
    return container.find('button').each((idx, btn) => {
      btn = $(btn);
      let type = btn.attr('type');

      if (!btn.attr('type') || (btn.attr('type') === 'object'))
        btn.attr('type', 'button');
      if (type === 'object') {
        btn.attr('button-object', btn.attr('name'));
        btn.attr('ng-click', `action.formButtonClick(record.id, '${ btn.attr('name') }', $event.target);$event.stopPropagation();`);
      } else if (type === 'tag') {
        btn.attr('button-tag', btn.attr('name'));
        btn.attr('onclick', `Katrid.Actions.ClientAction.tagButtonClick($(this))`);
      }
      if (!btn.attr('class'))
        btn.addClass('btn btn-outline-secondary');
    });
  };

  class ToolbarComponent extends Katrid.ui.Widgets.Component {
    constructor() {
      super();
      this.scope = false;
      this.restrict = 'E';
      this.replace = true;
      this.transclude = true;
      this.templateUrl = 'view.header';
    }
  }
  Katrid.ui.uiKatrid.directive('toolbar', ToolbarComponent);


  class ClientView {
    constructor(action) {
      this.action = action;
    }

    get template() {
      return Katrid.app.getTemplate(this.templateUrl);
    }

    render() {
      return $(this.template);
    }
  }


  class BaseView {
    constructor(scope) {
      this.scope = scope;
    }

    render() {
      return Katrid.app.getTemplate(this.templateUrl);
    }
  }

  class ActionView extends BaseView{
    constructor(action, scope, view, content) {
      super(scope);
      this.action = action;
      this.view = view;
      this.templateUrl = 'view.basic';
      this.toolbar = true;
      this.content = content;
    }

    getTemplateContext() {
      return { content: this.content };
    }

    render() {
      return sprintf(Katrid.app.getTemplate(this.templateUrl), this.getTemplateContext());
    }

    renderTo(parent) {
      Katrid.core.setContent(this.render(), this.scope);
    }
  }

  class View extends ActionView {
    getBreadcrumb() {
      let html = `<ol class="breadcrumb">`;
      let i = 0;
      for (let h of Katrid.app.actionManager) {
        if (i === 0 && h.viewModes.length > 1)
          html += `<li class="breadcrumb-item"><a href="#" ng-click="action.backTo(0, 0)">${ h.info.display_name }</a></li>`;
        i++;
        if (Katrid.Actions.actionManager.length > i && h.viewType === 'form')
          html += `<li class="breadcrumb-item"><a href="#" ng-click="action.backTo(${i-1}, 'form')">${ h.scope.record.display_name }</a></li>`;
      }
      if (this.constructor.type === 'form')
        html += `<li class="breadcrumb-item">{{ self.display_name }}</li>`;
      return html + '</ol>';
    }

    render() {
      return sprintf(Katrid.app.$templateCache.get(this.templateUrl), { content: this.content });
    }

    getViewButtons() {
      let btns = Object.entries(View.buttons).map((btn) => this.view.viewModes.includes(btn[0]) ? btn[1] : '').join('');
      if (btns) btns = `<div class="btn-group">${btns}</div>`;
      return btns;
    }

  }


  class FormView extends View {
    constructor(action, scope, view, content) {
      super(action, scope, view, content);
      this.templateUrl = 'view.form';
    }

    render() {
      let el = $(
        Katrid.$templateCache.get(this.templateUrl)
        .replace('<!-- replace-content -->', this.content)
        .replace('<!-- replace-breadcrumbs -->', this.getBreadcrumb())
      );
      let frm = el.find('form').first().addClass('row');
      // this.buildHeader(frm);
      return el;
    }
  }
  FormView.type = 'form';


  class Form {
    constructor() {
      this.replace = true;
      this.scope = false;
    }

    getBreadcrumb() {
      let html = `<ol class="breadcrumb">`;
      let i = 0;
      for (let h of Katrid.app.actionManager) {
        if (i === 0 && h.viewModes.length > 1)
          html += `<li class="breadcrumb-item"><a href="#" ng-click="action.backTo(0, 0);$event.preventDefault();">${ h.info.display_name }</a></li>`;
        i++;
        if (Katrid.app.actionManager.length > i && h.viewType === 'form')
          html += `<li class="breadcrumb-item"><a href="#" ng-click="action.backTo(${i-1}, 'form');$event.preventDefault();">${ h.scope.record.display_name }</a></li>`;
      }
      html += `<li class="breadcrumb-item">{{ self.display_name }}</li>`;
      return html + '</ol>';
    }

    template($el) {
      compileButtons($el);
      let headerEl = $el.find('header').first();
      let header = '';
      if (headerEl.length) {
        let statusField = headerEl.find('field[name=status]').attr('status-field', 'status-field');
        header = headerEl.html();
        headerEl.remove();
      }
      $el.find('field').each((idx, el) => {
        el = $(el);
        if (!el.attr('status-field') && !el.parents('field').length)
          el.attr('form-field', 'form-field');
      });
      let templName = 'view.form';
      if ($el.attr('form-dialog'))
        templName = 'view.form.dialog';
      return Katrid.app.getTemplate(templName)
      .replace('<!-- replace-header -->', header)
      .replace('<!-- replace-content -->', $el.html())
      .replace('<!-- replace-actions -->', '')
      .replace('<!-- replace-breadcrumbs -->', this.getBreadcrumb());
    }

    link($scope, $el) {
      $el.addClass('ng-form');
      let form = $el.find('form').addClass('row').attr('novalidate', 'novalidate');
      $scope.$parent.formElement = $el.find('form').first();
      $scope.$parent.form = angular.element($scope.formElement).controller('form');

      let copySvc = new Katrid.Services.Model('ir.copy.to');

      copySvc.rpc('get_copy_to_choices', [$scope.$parent.model.name])
      .then(function(res) {
        if (res)
          $scope.copyToOpts = res;
      })

//       $el.on('contextmenu', function(e) {
//   var top = e.pageY - 10;
//   var left = e.pageX - 90;
//   $("#context-menu").css({
//     display: "block",
//     top: top,
//     left: left
//   }).addClass("show");
//   return false; //blocks default Webbrowser right click menu
// }).on("click", function() {
//   $("#context-menu").removeClass("show").hide();
// });
//
// $("#context-menu a").on("click", function() {
//   $(this).parent().removeClass("show").hide();
// });

    }
  }

  Katrid.ui.uiKatrid
  .directive('formView', Form)

  .directive('listView', () => ({
    replace: true,
    template($el) {
      $el.find('list').attr('list-options', '{"rowSelector": true}').attr('ng-row-click', 'action.listRowClick($index, record, $event)');
      return sprintf(Katrid.app.getTemplate('view.list'), { content: $el.html() });
    },
  }))

  .directive('card', () => ({
    replace: true,
    template($el) {
      $el.children('field').remove();
      $el.find('field').each((idx, el) => $(el).replaceWith(`{{ ::record.${ $(el).attr('name') } }}`));
      return sprintf(Katrid.app.getTemplate('view.card'), { content: $el.html() });
    }
  }));


  Katrid.ui.Views = {
    View,
    BaseView,
    ActionView,
    FormView,
    ClientView,
    searchModes: ['list', 'card']
  };

  Katrid.ui.Views[FormView.type] = FormView;

})();


(function () {

  class ViewInfo {
    constructor(info) {
      this._info = info;
      this.fields = info.fields;
      this.content = info.content;
      this.toolbar = info.toolbar;
    }
  }

  Katrid.ui.ViewInfo = ViewInfo;
})();

(function() {

  class Grid {
    constructor($compile) {
      this.restrict = 'E';
      this.scope = {};
      this.$compile = $compile;
    }

    async loadViews(scope, element, views, attrs) {

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
      else
        content.attr('ng-row-click', 'openItem($event, $index)');

      content.attr('list-options', '{"deleteRow": true}');

      // render the list component
      let el = (this.$compile(content)(scope));
      element.html(el);
      element.prepend(this.$compile(Katrid.app.getTemplate('view.form.grid.toolbar.pug', { attrs }))(scope));
      element.find('table').addClass('table-bordered grid');
    }
    async showDialog(scope, attrs, index) {

      if (scope.views.form)
        await this.renderDialog(scope, attrs);

      if (index != null) {
        // Show item dialog
        scope.recordIndex = index;
        let record = scope.records[index];

        // load the target record from server
        if (record && record.$loaded)
          scope.record = record;
        else if (record) {
          let res = await scope.dataSource.get(scope.records[index].id, 0, false, index);
          res.$loaded = true;

          // load nested data
          // let currentRecord = scope.record;
          // if (res.id)
          //   for (let child of dataSource.children) {
          //     child.scope.masterChanged(res.id)
          //     .then(res => {
          //       _cacheChildren(child.fieldName, currentRecord, res.data);
          //     })
          //
          //   }

        }

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

      await me.loadViews(scope, element, views, attrs);

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

      scope.addItem = async () => {
        await scope.dataSource.insert();
        if (attrs.$attr.inlineEditor) {
          scope.records.splice(0, 0, scope.record);
          scope.dataSource.edit();
          scope.$apply();
        }
        else
          return this.showDialog(scope, attrs);
      };

      scope.addRecord = function (rec) {
        let record = Katrid.Data.createRecord({$loaded: true}, scope.dataSource);
        for (let [k, v] of Object.entries(rec))
          record[k] = v;
        scope.records.push(record);
      };

      scope.cancelChanges = () => scope.dataSource.setState(Katrid.Data.DataSourceState.browsing);

      scope.openItem = async (evt, index) => {
        await this.showDialog(scope, attrs, index);
        if (scope.parent.dataSource.changing && !scope.dataSource.readonly) {
          scope.dataSource.edit();
        }
        scope.$apply();
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


      let unkook = scope.$on('masterChanged', async function(evt, master, key) {
        // Ajax load nested data
        if (master === scope.dataSource.masterSource) {
          scope.dataSet = [];
          scope._changeCount = 0;
          scope.records = [];
          if (key != null) {
            const data = {};
            data[field.field] = key;
            if (key) {
              return await scope.dataSource.search(data)
              .finally(() => scope.dataSource.state = Katrid.Data.DataSourceState.browsing);
            }
          }
        }
      });

      scope.$on('$destroy', function() {
        unkook();
        dataSource.masterSource.children.splice(dataSource.masterSource.indexOf(dataSource), 1);
      });


    }
    async renderDialog(scope, attrs) {
      let el;
      let html = scope.views.form.content;

      scope.view = scope.views.form;
      let fld = scope.views.form.fields[scope.field.field];
      if (fld)
        fld.visible = false;

      if (attrs.inline) {
        el = me.$compile(html)(scope);
        gridEl.find('.inline-input-dialog').append(el);
      } else {
        html = $(Katrid.app.$templateCache.get('view.field.OneToManyField.Dialog').replace(
          '<!-- view content -->',
          '<form-view form-dialog="dialog">' + html + '</form-view>',
        ));
        el = this.$compile(html)(scope);
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
      return new Promise(function(resolve) {
        el.on('shown.bs.modal', () => resolve(el));
      });
    };

  }

  Katrid.ui.uiKatrid

  .directive('grid', ['$compile', Grid])

  .directive('list', ['$compile', $compile => ({
    restrict: 'E',
    compile(el, attrs) {
      el.addClass('table-responsive');
      let rowClick = attrs.ngRowClick;
      let content = el.html();
      let options = {};
      if (attrs.listOptions)
        options = JSON.parse(attrs.listOptions);
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
          if (hasTotal)
            tfoot.append('<td class="list-column-delete" ng-show="parent.dataSource.changing && !dataSource.readonly"></td>');
        }
        el.html('');
        el.append($compile(templ)(scope));
      }
    }
  })]);


})();

(function () {
  const uiKatrid = Katrid.ui.uiKatrid;

  uiKatrid.filter('numberFormat', () => {
    return (value, maxDigits = 3) => {
      if (value == null)
        return '';
      return new Intl.NumberFormat('pt-br', { maximumSignificantDigits: maxDigits }).format(value);
    }
  });

})();

(function() {

  let conditionsLabels = {
    '=': Katrid.i18n.gettext('Is equal'),
    '!=': Katrid.i18n.gettext('Is different'),
    '>': Katrid.i18n.gettext('Greater-than'),
    '<': Katrid.i18n.gettext('Less-than'),
  };

  let conditionSuffix = {
    '=': '',
    '!=': '__isnot',
    'like': '__icontains',
    'not like': '__not_icontains',
    '>': '__gt',
    '>=': '__gte',
    '<': '__lt',
    '<=': '__lte',
    'in': '__in',
    'not in': '__not_in',
  };

  class SearchMenu {
    show() {
      this.element.show();
      return this.searchView.first();
    }

    close() {
      this.element.hide();
      this.reset();
    }

    async expand(item) {
      let res = await this.searchView.scope.model.getFieldChoices(item.ref.name, this.searchView.scope.search.text);
      console.log(res);
      return res.items.map((obj) => this.searchView.loadItem(item.item, obj, item));
    }

    collapse(item) {
      for (let i of Array.from(item.children)) {
        i.destroy();
      }
      return item.children = [];
    }

    reset() {
      for (let i of this.searchView.items)
        if (i.children) {
          this.collapse(i);
          i.reset();
        }
    }

    select(evt, item) {
      if (this.options.select) {
        if (item.parentItem) {
          item.parentItem.value = item.value;
          item = item.parentItem;
        }
        item.searchString = this.input.val();
        this.options.select(evt, item);
        return this.input.val('');
      }
    }
  }


  class SearchQuery {
    constructor(searchView) {
      this.searchView = searchView;
      this.items = [];
      this.groups = [];
    }

    add(item) {
      if (this.items.includes(item)) {
        item.facet.addValue(item);
        item.facet.refresh();
      } else {
        this.items.push(item);
        this.searchView.renderFacets();
      }
      if (item instanceof SearchGroup)
        this.groups.push(item);
      this.searchView.change();
    }

    loadItem(item) {
      this.items.push(item);
      if (item instanceof SearchGroup)
        this.groups.push(item);
    }

    remove(item) {
      this.items.splice(this.items.indexOf(item), 1);
      if (item instanceof SearchGroup) {
        this.groups.splice(this.groups.indexOf(item), 1);
      }
      this.searchView.change();
    }

    getParams() {
      let r = [];
      for (let i of this.items)
        r = r.concat(i.getParamValues());
      return r;
    }
  }


  class FacetView {
    constructor(item) {
      this.item = item;
      this.values = [];
      this.teste = 'teste';
    }

    init(item, values) {
      this.item = item;
      if (values)
        this.values = values;
      else
        this.values = [{searchString: this.item.getDisplayValue(), value: this.item.value}];
    }

    addValue(value) {
      return this.values.push(value);
    }

    get caption() {
      return this.item.caption;
    }

    clear() {
      this.values = [];
    }

    get templateValue() {
      const sep = ` <span class="facet-values-separator">${Katrid.i18n.gettext('or')}</span> `;
      return (Array.from(this.values).map((s) => s instanceof SearchObject ? s.display : s)).join(sep);
    }

  //   template() {
  //     const s = `<span class="facet-label">${this.item.getFacetLabel()}</span>`;
  //     return `<div class="facet-view">
  // ${s}
  // <span class="facet-value">${this.templateValue()}</span>
  // <span class="fa fa-sm fa-remove facet-remove"></span>
  // </div>`;
  //   }

    link(searchView) {
      const html = $(this.template());
      this.item.facet = this;
      this.element = html;
      const rm = html.find('.facet-remove');
      rm.click(evt => searchView.onRemoveItem(evt, this.item));
      return html;
    }

    refresh() {
      return this.element.find('.facet-value').html(this.templateValue());
    }

    load(searchView) {
      searchView.query.loadItem(this.item);
      this.render(searchView);
    }

    destroy() {
      this.clear();
    }

    getParamValues() {
      const r = [];
      for (let v of this.values) {
        r.push(this.item.getParamValue(v));
      }
      if (r.length > 1)
        return [{'OR': r}];
      return r;
    }
  }


  class _SearchItem {
    constructor(name, item, parent, ref, menu) {
      this.name = name;
      this.item = item;
      this.parent = parent;
      this.ref = ref;
      this.menu = menu;
      this.label = this.item.attr('label') || (this.ref && this.ref['caption']) || this.name;
    }

    templateLabel() {
      return sprintf(Katrid.i18n.gettext(`Search <i>%(caption)s</i> by: <strong>%(text)s</strong>`), {
        caption: this.label,
        text: '{{search.text}}'
      });
    }

    template() {
      let s = '';
      if (this.expandable)
        s = `<a class="expandable" href="#"></a>`;
      if (this.value)
        s = `<a class="search-menu-item indent" href="#">${this.value[1]}</a>`;
      else
        s += `<a href="#" class="search-menu-item">${this.templateLabel()}</a>`;
      return `<li>${s}</li>`;
    }

    link(action, $compile, parent) {
      const html = $compile(this.template())(action);
      if (parent != null) {
        html.insertAfter(parent.element);
        parent.children.push(this);
        this.parentItem = parent;
      } else
        html.appendTo(this.parent);

      this.element = html;

      this.itemEl = html.find('.search-menu-item')
      .click(evt => evt.preventDefault())
      .mousedown(evt => {
        return this.select(evt);
      })
      .mouseover(function(evt) {
        const el = html.parent().find('>li.active');
        if (el !== html) {
          el.removeClass('active');
          return html.addClass('active');
        }
      });

      this.element.data('searchItem', this);

      this.expand = html.find('.expandable').on('mousedown', evt => {
        this.expanded = !this.expanded;
        evt.stopPropagation();
        evt.preventDefault();
        $(evt.target).toggleClass('expandable expanded');
        if (this.expanded) {
          return this.searchView.menu.expand(this);
        } else {
          return this.searchView.menu.collapse(this);
        }
      }).click(evt => evt.preventDefault());
      return false;
    }

    select(evt) {
      if (evt) {
        evt.stopPropagation();
        evt.preventDefault();
      }
      this.menu.select(evt, this);
      return this.menu.close();
    }

    getFacetLabel() {
      return this.label;
    }

    getDisplayValue() {
      if (this.value) {
        return this.value[1];
      }
      return this.searchString;
    }

    getValue() {
      return this.facet.values.map(s => s.value || s.searchString);
    }

    getParamValue(name, value) {
      const r = {};
      if ($.isArray(value)) {
        r[name] = value[0];
      } else {
        r[name + '__icontains'] = value;
      }
      return r;
    }

    getParamValues() {
      const r = [];
      for (let v of Array.from(this.getValue())) {
        r.push(this.getParamValue(this.name, v));
      }
      if (r.length > 1) {
        return [{'OR': r}];
      }
      return r;
    }

    destroy() {
      return this.element.remove();
    }

    remove() {
      this.searchView.removeItem(this);
    }

    reset() {
      this.expanded = false;
      this.expand.removeClass('expanded');
      return this.expand.addClass('expandable');
    }

    onSelect() {
      // do nothing
    }

    onRemove() {
      this.facet.element.remove();
      delete this.facet;
    }
  }


  class _SearchFilter extends _SearchItem {
    constructor(name, item, parent, ref, menu) {
      super(name, item, parent, ref, menu);
      this.domain = JSON.parse(item.attr('domain').replace(/'/g, '"'));
    }
    link(scope, $compile, parent) {
      const ul = this.searchView.toolbar.find('.search-view-filter-menu');
      let el = $(`<a class="dropdown-item" href="#" onclick="event.preventDefault();">${this.label}</a>`);
      this._toggleMenuEl = el;
      let me = this;
      el.click(function(evt) {
        evt.preventDefault();
        let e = $(this);
        if (me.facet) me.remove();
        else me.select();
      });
      return ul.append(el);
    }

    select(el) {
      super.select(null);
    }

    getFacetLabel() {
      return '<span class="fa fa-filter"></span>';
    }

    getDisplayValue() {
      return this.label;
    }

    onSelect() {
      this._toggleMenuEl.addClass('selected');
    }

    onRemove() {
      this._toggleMenuEl.removeClass('selected');
      super.onRemove();
    }

    getParamValue() {
      return this.domain;
    }

  }


  class SearchGroup extends _SearchItem {
    constructor(name, item, parent, ref, menu) {
      super(name, item, parent, ref, menu);
      const ctx = item.attr('context');
      if (typeof ctx === 'string') {
        this.context = JSON.parse(ctx);
      } else {
        this.context =
          {grouping: [name]};
      }
    }

    getFacetLabel() {
      return '<span class="fa fa-bars"></span>';
    }

    templateLabel() {
      return Katrid.i18n.gettext('Group by:') + ' ' + this.label;
    }

    getDisplayValue() {
      return this.label;
    }
  }


  class SearchItem {
    constructor(view, name, el) {
      this.view = view;
      this.name = name;
      this.el = el;
    }

    getDisplayValue() {
      if (this.value) {
        return this.value[1];
      }
      return this.searchString;
    }

    getParamValue(name, value) {
      const r = {};
      if (_.isArray(value)) {
        r[name] = value[0];
      } else {
        r[name + '__icontains'] = value;
      }
      return r;
    }

    _doChange() {
      this.view.update();
    }
  }

  class SearchFilter extends SearchItem {
    constructor(view, name, label, domain, group, el) {
      super(view, name, el);
      this.group = group;
      this.label = label;
      if (_.isString(domain))
        domain = JSON.parse(domain.replace(/'/g, '"'));
      this.domain = domain;
      this._selected = false;
    }

    static fromItem(view, el, group) {
      return new SearchFilter(view, el.attr('name'), el.attr('label'), el.attr('domain'), group, el);
    }

    toString() {
      return this.label;
    }

    toggle() {
      this.selected = !this.selected;
    }

    get selected() {
      return this._selected;
    }

    set selected(value) {
      this._selected = value;
      if (value)
        this.group.addValue(this);
      else
        this.group.removeValue(this);
      this._doChange();
    }

    getDisplayValue() {
      return this.label;
    }

    get facet() {
      return this.group.facet;
    }

    getParamValue() {
      return this.domain;
    }

    get value() {
      return this.domain;
    }
  }

  class SearchFilterGroup extends Array {
    constructor(view) {
      super();
      this.view = view;
      this._selection = [];
      this._facet = new FacetView(this);
    }

    static fromItem(view, el) {
      let group = new SearchFilterGroup(view);
      group.push(SearchFilter.fromItem(view, el, group));
      return group;
    }

    static fromGroup(view, el) {
      let group = new SearchFilterGroup(view);
      for (let child of el.children())
        group.push(SearchFilter.fromItem(view, $(child), group));
      return group;
    }

    addValue(item) {
      this._selection.push(item);
      console.log(item.value);
      this._facet.values = this._selection.map(item => (new SearchObject(item.toString(), item.value)));
      this._refresh();
    }

    removeValue(item) {
      this._selection.splice(this._selection.indexOf(item), 1);
      this._facet.values = this._selection.map(item => ({ searchString: item.getDisplayValue(), value: item.value }));
      this._refresh();
    }

    selectAll() {
      for (let item of this)
        this.addValue(item);
      this.view.update();
    }

    get caption() {
      return '<span class="fa fa-filter"></span>';
    }

    _refresh() {
      if (this._selection.length) {
        if (this.view.facets.indexOf(this._facet) === -1)
          this.view.facets.push(this._facet);
      } else if (this.view.facets.indexOf(this._facet) > -1)
        this.view.facets.splice(this.view.facets.indexOf(this._facet), 1);
      console.log(this.view.facets);
    }

    getParamValue(v) {
      return v.value;
    }

    clear() {
      this._selection = [];
    }

  }

  class SearchObject {
    constructor(display, value) {
      this.display = display;
      this.value = value;
    }
  }

  class SearchField extends SearchItem {
    constructor(view, name, el, field) {
      super(view, name, el);
      this.field = field;
      this._expanded = false;
      if (field.type === 'ForeignKey') {
        this.expandable = true;
        this.children = [];
      } else {
        this.expandable = false;
      }
    }

    get expanded() {
      return this._expanded;
    }

    set expanded(value) {
      this._expanded = value;
      if (value)
        this._loadChildren();
      else
        this.children = [];
    }

    _loadChildren() {
      this.loading = true;
      this.view.scope.model.getFieldChoices(this.name, this.view.text)
      .then(res => this.children = res.items)
      .finally(() => this.view.scope.$apply(() => this.loading = false));
    }

    get facet() {
      if (!this._facet)
        this._facet = new FacetView(this);
      return this._facet;
    }

    getDisplayValue() {
      return this.value;
    }

    getParamValue(value) {
      const r = {};
      let name = this.name;
      if (_.isArray(value)) {
        r[name] = value[0];
      } else if (value instanceof SearchObject) {
        return value.value;
      } else {
        r[name + '__icontains'] = value;
      }
      return r;
    }

    get caption() {
      return this.field.caption;
    }

    get value() {
      if (this._value)
        return this._value[1];
      return this.view.text;
    }

    select() {
      this.facet.addValue(this.value);
      this.view.addFacet(this.facet);
      this.view.close();
      this.view.update();
    }

    selectItem(item) {
      let domain = {};
      domain[this.field.name] = item[0];
      this.facet.addValue(new SearchObject(item[1], domain));
      this.view.addFacet(this.facet);
      this.view.close();
      this.view.update();
    }

    static fromField(view, el) {
      let field = view.view.fields[el.attr('name')];
      return new SearchField(view, field.name, el, field);
    }

    get template() {
      return _.sprintf(Katrid.i18n.gettext(`Search <i>%(caption)s</i> by: <strong>%(text)s</strong>`), {
        caption: this.field.caption,
        text: this.view.text,
      });
    }
  }

  class CustomFilterItem extends SearchFilter {
    constructor(view, field, condition, value, group) {
      super(view, field.name, field.caption, null, group);
      this.field = field;
      this.condition = condition;
      this._value = value;
      this._selected = true;
    }

    toString() {
      let s = this.field.format(this._value);
      return this.field.caption + ' ' + conditionsLabels[this.condition].toLowerCase() + ' "' + s + '"';
    }

    get value() {
      let r = {};
      r[this.field.name + conditionSuffix[this.condition]] = this._value;
      return r;
    }

  }

  Katrid.ui.uiKatrid.controller('CustomFilterController', ['$scope', '$element', '$filter', function ($scope, $element, $filter) {
    $scope.tempFilter = null;
    $scope.customFilter = [];

    $scope.fieldChange = function (field) {
      $scope.field = field;
      $scope.condition = field.defaultCondition;
      $scope.conditionChange($scope.condition);
    };

    $scope.conditionChange = (condition) => {
      $scope.controlVisible = $scope.field.isControlVisible(condition);
    };

    $scope.valueChange = (value) => {
      $scope.searchValue = value;
    };

    $scope.addCondition = (field, condition, value) => {
      if (!$scope.tempFilter)
        $scope.tempFilter = new SearchFilterGroup($scope.$parent.search);
      $scope.tempFilter.push(new CustomFilterItem($scope.$parent.search, field, condition, value, $scope.tempFilter));
      $scope.field = null;
      $scope.condition = null;
      $scope.controlVisible = false;
      $scope.searchValue = undefined;
    };

    $scope.applyFilter = () => {
      if ($scope.searchValue)
        $scope.addCondition($scope.field, $scope.condition, $scope.searchValue);
      $scope.customFilter.push($scope.tempFilter);
      $scope.tempFilter.selectAll();
      $scope.tempFilter = null;
      $scope.customSearchExpanded = false;
    };
  }])

  .directive('customFilter', () => (
    {
      restrict: 'A',
      scope: {
        action: '=',
      },
    }
  ));

  class SearchView {
    constructor(scope, element, view) {
      this.scope = scope;
      this.element = element;
      this.query = new SearchQuery(this);
      this.viewMoreButtons = false;
      this.items = [];
      this.fields = [];
      this.filterGroups = [];
      this.groups = [];
      this.facets = [];
      this.input = element.find('.search-view-input');
      this.view = view;
      this.el = $(view.content);
      this.menu = element.find('.search-dropdown-menu.search-view-menu');
      // let menu = this.createMenu(scope, element.find('.search-dropdown-menu.search-view-menu'), element);

      for (let child of this.el.children()) {
        child = $(child);
        let tag = child.prop('tagName');
        let obj;
        if (tag === 'FILTER') {
          obj = SearchFilterGroup.fromItem(this, child);
          this.filterGroups.push(obj);
        }
        else if (tag === 'FILTER-GROUP') {
          obj = SearchFilterGroup.fromGroup(this, child);
          this.filterGroups.push(obj);
        }
        else if (tag === 'FIELD') {
          obj = SearchField.fromField(this, child);
          this.fields.push(obj);
          continue;
        }
        this.append(obj);
      }

      this.input
      .on('input', evt => {
        if (this.input.val().length) {
          return this.show(evt);
        } else {
          return this.close(evt);
        }
      })
      .on('keydown', evt => {
        switch (evt.which) {
          case Katrid.ui.Keyboard.keyCode.DOWN:
            this.move(1);
            evt.preventDefault();
            break;
          case Katrid.ui.Keyboard.keyCode.UP:
            this.move(-1);
            evt.preventDefault();
            break;
          case Katrid.ui.Keyboard.keyCode.ENTER:
            this.scope.$apply(() => angular.element(this.menu.find('a.search-menu-item.active')).scope().item.select(evt));
            break;
          case $.ui.keyCode.BACKSPACE:
            if (this.input.val() === '') {
              this.scope.$apply(() => this.facets.splice(this.facets.length-1, 1).map(facet => facet.clear()));
              this.update();
              // const item = this.query.items[this.searchView.query.items.length-1];
            }
            break;
        }
      })
      .on('blur', evt => {
        this.input.val('');
        return this.close();
      });
    }

    append(item) {
      this.items.push(item);
    }

    addFacet(facet) {
      if (!this.facets.includes(facet))
        this.facets.push(facet);
    }

    first() {
      this.menu.find('a.search-menu-item.active').removeClass('active');
      this.menu.find('a.search-menu-item').first().addClass('active');
    }

    remove(index) {
      let facet = this.facets[index];
      facet.destroy();
      this.facets.splice(index, 1);
      this.update();
    }

    getParams() {
      let r = [];
      for (let i of this.facets)
        r = r.concat(i.getParamValues());
      return r;
    }

    move(distance) {
      const fw = distance > 0;
      distance = Math.abs(distance);
      while (distance !== 0) {
        distance--;
        let el = this.element.find('.search-view-menu > li.active');
        if (el.length) {
          el.removeClass('active');
          if (fw) {
            el = el.next();
          } else {
            el = el.prev();
          }
          el.addClass('active');
        } else {
          if (fw) {
            el = this.element.find('.search-view-menu > li').first();
          } else {
            el = this.element.find('.search-view-menu > li').last();
          }
          el.addClass('active');
        }
      }
    }

    update() {
      this.scope.action.setSearchParams(this.getParams());
    }

    show() {
      this.menu.show();
      this.first();
    }

    close() {
      this.menu.hide();
      this.reset();
      this.input.val('');
    }

    reset() {
      for (let i of this.fields)
        if (i && i.children && i.children.length)
          i.expanded = false;
    }
  }

  class SearchViewComponent {
    constructor() {
      this.retrict = 'E';
      this.templateUrl = 'view.search';
      this.replace = true;
      this.scope = false;
    }
  }

  class SearchViewArea {
    constructor() {
      this.restrict = 'A';
      this.scope = false;
    }

    link(scope, el, attrs) {
      let view = scope.action.views.search;
      scope.search = new SearchView(scope, el, view);
    }
  }

  Katrid.ui.uiKatrid.controller('SearchMenuController', ['$scope', function($scope) {

  }]);

  Katrid.ui.uiKatrid.directive('searchView', SearchViewComponent);
  Katrid.ui.uiKatrid.directive('searchViewArea', SearchViewArea);

  Katrid.ui.Views.SearchView = SearchView;
  Katrid.ui.Views.SearchViewComponent = SearchViewComponent;
  Katrid.ui.Views.SearchMenu = SearchMenu;

})();

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


  $.fn.modal.Constructor.prototype._enforceFocus = function() {};

  uiKatrid.directive('ajaxChoices', ['$location', $location =>
    ({
      restrict: 'A',
      require: '?ngModel',
      link(scope, element, attrs, controller) {
        const {multiple} = attrs;
        const serviceName = attrs.ajaxChoices;
        let field = attrs.field;
        let _timeout = null;
        let domain;

        const cfg = {
          allowClear: true,
          query(query) {

            // make params
            let data = {
              args: [query.term],
              kwargs: {
                count: 1,
                page: query.page,
                name_fields: attrs.nameFields && attrs.nameFields.split(",") || null
              }
            };

            if (domain)
              data.domain = domain;

            const f = () => {
              let svc = new Katrid.Services.Model(serviceName);
              if (field) svc = svc.getFieldChoices(field, query.term, data.kwargs);
              else svc = new Katrid.Services.Model(attrs.modelChoices).searchName(data);
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
                }
                console.log(r);
                return query.callback({
                  results: r,
                  more: more
                })
              });
            };
            if (_timeout) clearTimeout(_timeout);
            _timeout = setTimeout(f, 400)

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
        let sel = el;
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

(function () {

  let WIDGET_COUNT = 0;

  let DEFAULT_COLS = {
    'BooleanField': 3,
    'DecimalField': 3,
    'FloatField': 3,
    'DateField': 3,
    'DateTimeField': 3,
    'IntegerField': 3,
    'SmallIntegerField': 3,
    'TimeField': 3,
    'CharField': 3,
    'OneToManyField': 12
  };

  class Field {
    static get tag() {
      return 'input';
    }

    constructor(scope, attrs, field, element) {
      this.attrs = attrs;
      this.scope = scope;
      this.templAttrs = {};
      this.wAttrs = {};
      this.field = field;
      this.element = element;
      this.content = element.html();
      // this.inline = scope.inline;
      this.spanPrefix = '';

      // Check if field depends from another
      if ((field.depends != null) && field.depends.length)
        scope.dataSource.addFieldWatcher(field);

      if (attrs.ngShow)
        this.templAttrs['ng-show'] = attrs.ngShow;

      if (attrs.ngReadonly || field.readonly)
        this.templAttrs['ng-readonly'] = attrs.ngReadonly || field.readonly;

      if (field.attrs)
        for (let k of field.attrs) {
          let v = field.attrs[k];
          if (k.startsWith('container') || ((k === 'ng-show') && !attrs.ngShow)) {
            this.templAttrs[k] = v;
          }
        }

      if (attrs.ngFieldChange) {
        this.wAttrs['ng-change'] = attrs.ngFieldChange;
      }

      let cols = attrs.cols;

      if (!cols) {
        if (field.type === 'CharField')
          if (field.max_length && (field.max_length < 30)) cols = 3;
        if (!cols)
          cols = DEFAULT_COLS[field.type] || 6;
      }

      this.col = cols;
      this.classes = ['form-field'];

      // track field changes
      if (field.onchange)
        scope.$watch();
    }

    fieldChangeEvent() {

    }

    get caption() {
      return this.element.attr('label') || this.field.caption;
    }

    renderTo(templTag, inplaceEditor=false, cls='') {
      let templAttrs = [];
      for (let [k, v] of Object.entries(this.templAttrs))
        templAttrs.push(k + '=' + '"' + v + '"');

      if (inplaceEditor)
        return `<${templTag} class="${cls}" ${templAttrs.join('')}>${this.template(this.scope, this.element, this.attrs, this.field)}</${templTag}>`;

      return `<${templTag} class="${this.field.type} section-field-${this.field.name} form-group" ${templAttrs.join('')}>` +
            this.template(this.scope, this.element, this.attrs, this.field) +
            `</${templTag}>`
    }

    get ngModel() {
      return `record.${this.field.name}`;
    }

    get id() {
      if (!this._id)
        this._id = ++WIDGET_COUNT;
      return `katrid-input-${this._id.toString()}`;
    }

    widgetAttrs() {
      let v;
      const r = this.wAttrs;
      if (this.field.required) {
        r['required'] = null;
      }

      r['ng-model'] = this.ngModel;
      if (this.field.attrs) {
        for (let attr of Object.keys(this.field.attrs)) {
          v = this.field.attrs[attr];
          if (!attr.startsWith('container-') && (attr !== 'ng-show') && (attr !== 'ng-readonly')) {
            r[attr] = v;
          }
        }
      }

      if (!_.isUndefined(this.attrs.$attr))
      for (let attr of Object.keys(this.attrs.$attr)) {
        let attrName = this.attrs.$attr[attr];
        if (!attrName.startsWith('container-') && (attr !== 'ngShow') && (attr !== 'ngReadonly')) {
          v = this.attrs[attr];
          if (attrName.startsWith('field-')) {
            attrName = attrName.substr(6, attrName.length - 6);
          } else if (attrName === 'class')
            this.classes.push(v);
          r[attrName] = v;
        }
      }

      if ((this.attrs.readonly != null) || this.field.readonly)
        r['readonly'] = '';

      if (this.classes)
        r['class'] = this.classes.join(' ');

      return r;
    }

    _getWidgetAttrs(scope, el, attrs, field) {
      let html = '';
      const attributes = this.widgetAttrs(scope, el, attrs, field);
      for (let att in attributes) {
        const v = attributes[att];
        html += ` ${att}`;
        if (v || (v === false)) {
          if (_.isString(v) && (v.indexOf('"') > -1)) {
            html += `='${v}'`;
          } else {
            html += `="${v}"`;
          }
        }
      }
      if (this.placeholder)
        html += ` placeholder="${this.placeholder}" `;

      return html;
    }

    innerHtml() {
      return '';
    }

    labelTemplate() {
      const placeholder = '';
      const label = this.caption;
      if (this.attrs.nolabel === 'placeholder') {
        this.placeholder = label;
        return '';
      } else if (!_.isUndefined(this.attrs.nolabel))
        return '';
      return `<label for="${this.id}" class="form-label">${label}</label>`;
    }

    get emptyText() {
      if (this.inplaceEditor)
        return '';
      return '--';
    }

    get readOnlyClass() {
      if (this.inplaceEditor || this.spanPrefix === '::')
        return 'grid-field-readonly';
      return 'form-field-readonly';
    }

    spanTemplate(scope, el, attrs, field) {
      return `<span class="${this.readOnlyClass}">{{ ${this.spanPrefix}record.${this.field.name}.toString() || '${this.emptyText}' }}</span>`;
    }

    widgetTemplate() {
      let html = `<${this.constructor.tag} id="${this.id}" name="${this.field.name}" ${this._getWidgetAttrs()}>`;
      const inner = this.innerHtml();
      if (inner)
        html += inner + `</${this.constructor.tag}>`;
      return html;
    }

    template() {
      let label = '';
      let span = this.spanTemplate();
      if (!this.inplaceEditor) {
        label = this.labelTemplate();
        // span =
      }
      let widget = this.widgetTemplate();
      if (this.inline === 'inline')
        widget = `<div ng-if="dataSource.changing && dataSource.recordIndex === $index">${widget}</div>`;
      return `<div>${label}${span}${widget}</div>`;
    }

    link(scope, el, attrs, $compile, field) {
      // Add watcher for field dependencies
      if (field.depends) {
        return (() => {
          const result = [];
          for (let dep of Array.from(field.depends)) {
            if (!Array.from(scope.dataSource.fieldChangeWatchers).includes(dep)) {
              scope.dataSource.fieldChangeWatchers.push(dep);
              result.push(scope.$watch(`record.${dep}`, function(newValue, oldValue) {
                // Ignore if dataSource is not in changing state
                if ((newValue !== oldValue) && scope.dataSource.changing) {
                  return scope.model.onFieldChange(dep, scope.record)
                  .done(scope.dataSource.onFieldChange);
                }
              }));
            }
          }
          return result;
        })();
      }
    }

    th() {
      let cls = `${this.field.type} list-column`;
      let lbl = this.element.attr('label') || `{{view.fields.${this.field.name}.caption}}`;
      return `<th class="${cls}" name="${this.field.name}"><span>${lbl}</span></th>`;
    }

    _gridEditor(cls) {
      return this.renderTo('section', true, cls);
    }

    _tdContent() {
      return this.spanTemplate();
    }

    _td(cls) {
      let content;
      if (this.inplaceEditor)
        content = this._gridEditor(cls);
      else {
        this.spanPrefix = '::';
        content = this.spanTemplate();
      }
      return `<td class="${cls}">${ content }</td>`;
    }

    td() {
      if (this.content)
        return this.content;
      return this._td(`${this.field.type} field-${this.field.name}`);

      let colHtml = this.element.html();
      let s;
      let fieldInfo = this.field;
      let name = fieldInfo.name;
      let editor = '';
      if ((gridEditor === 'tabular') && html) editor = html;
      if (colHtml) {
        s = `<td><a data-id="{{::record.${name}[0]}}">${colHtml}</a>${editor}</td>`;
      } else if (fieldInfo.type === 'ForeignKey') {
        s = `<td><a data-id="{{::row.${name}[0]}}">{{row.${name}[1]}}</a>${editor}</td>`;
      } else if  (fieldInfo._listChoices) {
        s = `<td class="${cls}">{{::view.fields.${name}._listChoices[row.${name}]}}${editor}</td>`;
      } else if (fieldInfo.type === 'BooleanField') {
        s = `<td class="bool-text ${cls}">{{::row.${name} ? '${Katrid.i18n.gettext('yes')}' : '${Katrid.i18n.gettext('no')}'}}${editor}</td>`;
      } else if (fieldInfo.type === 'IntegerField') {
        s = `<td class="${cls}">{{::row.${name}|number}}${editor}</td>`;
      } else if (fieldInfo.type === 'DecimalField') {
        let decimalPlaces = this.element.attr('decimal-places') || 2;
        s = `<td class="${cls}">{{::row.${name}|number:${ decimalPlaces } }}${editor}</td>`;
      } else if (fieldInfo.type === 'DateField') {
        s = `<td class="${cls}">{{::row.${name}|date:'${Katrid.i18n.gettext('yyyy-mm-dd').replace(/[m]/g, 'M')}'}}${editor}</td>`;
      } else if (fieldInfo.type === 'DateTimeField') {
        s = `<td class="${cls}">{{::row.${name}|date:'${Katrid.i18n.gettext('yyyy-mm-dd').replace(/[m]/g, 'M')}'}}${editor}</td>`;
      } else {
        s = `<td>{{ ::row.${name} }}</td>`;
      }
      return s;
    }
  }


  class InputWidget extends Field {
    static get tag() {
      return 'input input-field';
    }

    constructor() {
      super(...arguments);
      this.classes.push('form-control');
    }

    get type() {
      return 'text';
    }

    widgetTemplate1() {
      let html;
      if (this.constructor.tag.startsWith('input')) {
        html = `<${this.tag} id="${attrs._id}" type="${type}" name="${attrs.name}" ${this._getWidgetAttrs(scope, el, attrs, field)}>`;
      } else {
        html = `<${this.tag} id="${attrs._id}" name="${attrs.name}" ${this._getWidgetAttrs(scope, el, attrs, field)}>`;
      }
      const inner = this.innerHtml(scope, el, attrs, field);
      if (inner) {
        html += inner + `</${this.tag}>`;
      }
      return html;
    }

    widgetTemplate() {
      let type = this.type;
      const prependIcon = this.attrs.icon;
      let html = `<${this.constructor.tag} id="${this.id}" type="${this.type}" name="${this.field.name}" ${this._getWidgetAttrs()}>`;
      if (prependIcon)
        return `<label class="prepend-icon"><i class="icon ${prependIcon}"></i>${html}</label>`;

      const inner = this.innerHtml();
      if (inner)
        html += inner + `</${this.constructor.tag}>`;

      return html;
    }
  }


  class StringField extends InputWidget {
    widgetAttrs() {
      const attributes = super.widgetAttrs();
      if (this.field.maxLength)
        attributes['maxlength'] = this.field.maxLength.toString();

      return attributes;
    }
  }


  class NumericField extends InputWidget {
    static get tag() {
      return 'input decimal';
    }

    get type() {
      if (Katrid.settings.ui.isMobile)
        return 'number';
      return 'text';
    }

    spanTemplate() {
      return `<span class="${this.readOnlyClass}">{{ ${this.spanPrefix}(record.${this.field.name}|number) || '${this.emptyText}' }}</span>`;
    }
  }


  class IntegerField extends NumericField {
    static get tag() {
      return 'input decimal decimal-places="0"';
    }
  }


  class TimeField extends InputWidget {
    get type() {
      return 'time';
    }
  }


  class SelectionField extends InputWidget {
    static get tag() {
      return 'select';
    }

    spanTemplate() {
      return `<span class="${this.readOnlyClass}">{{ ${this.spanPrefix}view.fields.${this.field.name}.displayChoices[record.${this.field.name}] || '${this.emptyText}' }}</span>`;
    }

    innerHtml() {
      return `<option ng-repeat="choice in view.fields.${this.field.name}.choices" value="{{choice[0]}}">{{choice[1]}}</option>`;
    }
  }


  class ForeignKey extends Field {
    static get tag() {
      return 'input foreignkey';
    }

    spanTemplate() {
      let allowOpen = true;
      if (((this.attrs.allowOpen != null) && (this.attrs.allowOpen === 'false')) || ((this.attrs.allowOpen == null) && this.field.attrs && (this.field.attrs['allow-open'] === false)))
        allowOpen = false;

      if (!allowOpen || this.inList)
        return `<span class="${this.readOnlyClass}"><a href="javascript:void(0)">{{ ${this.spanPrefix}record.${this.field.name}[1] || '${this.emptyText}' }}</a></span>`;

      return `<span class="${this.readOnlyClass}"><a href="#/action/${ this.field.model }/view/?id={{ ${this.spanPrefix}record.${this.field.name}[0] }}" ng-click="action.openObject('${ this.field.model }', record.${this.field.name}[0], $event, '${ this.field.caption }')">{{ ${this.spanPrefix}record.${this.field.name}[1] }}</a><span ng-if="!record.${this.field.name}[1]">--</span></span>`;
    }

    get type() {
      return 'hidden';
    }

    _tdContent() {
      return `{{record.${this.field.name}[1]}}`;
    }
  }


  class TextField extends StringField {
    static get tag() {
      return 'textarea';
    }
  }


  class FloatField extends NumericField {
    static get tag() {
      if (Katrid.settings.ui.isMobile)
        return 'input';
      return 'input decimal';
    }

    get type() {
      if (Katrid.settings.ui.isMobile)
        return 'number';
      return 'text';
    }

    spanTemplate() {
      let decimalPlaces = this.attrs.decimalPlaces || 2;
      return `<span class="${this.readOnlyClass}">{{ ${this.spanPrefix}(record.${this.field.name}|number:${ decimalPlaces }) || '${this.emptyText}' }}</span>`;
    }

    _tdContent() {
      let filter;
      let decimalPlaces = this.element.attr('decimal-places');
      if (decimalPlaces)
        filter `number:${ decimalPlaces }`;
      else
        filter = `numberFormat:${this.element.attr('max-digits') || 6}`;
      return `{{::record.${this.field.name}|${filter} }}`;
    }
  }


  class DecimalField extends FloatField {
    spanTemplate() {
      let maxDigits = this.attrs.maxDigits;
      let fmt = 'number';
      if (maxDigits)
        fmt = 'numberFormat';
      else
        maxDigits = this.attrs.decimalPlaces || 2;
      return `<span class="${this.readOnlyClass}">{{ ${this.spanPrefix}(record.${this.field.name}|${ fmt }:${ maxDigits }) || '${this.emptyText}' }}</span>`;
    }

    _tdContent(cls) {
      let maxDigits = this.element.attr('max-digits');
      if (maxDigits)
        return `<td class="${cls}">{{::record.${this.field.name}|numberFormat:${ maxDigits } }}${this._gridEditor()}</td>`;
      else {
        maxDigits = 2;
        return `{{::record.${this.field.name}|number:${ maxDigits } }}`;
      }
    }
  }


  class DateField extends TextField {
    static get tag() {
      return 'input date-input';
    }

    get type() {
      return 'date';
    }

    spanTemplate() {
      return `<span class="${this.readOnlyClass}">{{ ${this.spanPrefix}(record.${this.field.name}|date:'${Katrid.i18n.gettext('yyyy-mm-dd').replace(/[m]/g, 'M')}') || '${this.emptyText}' }}</span>`;
    }

    // widgetTemplate() {
    //   return `<div class="input-group date" ng-show="dataSource.changing">${ super.widgetTemplate() }<div class="input-group-append"><button class="btn btn-default" type="button"><span class="fa fa-calendar"></span></button></div></div>`;
    // }

    _tdContent(cls) {
      return `{{::record.${this.field.name}|date:'${Katrid.i18n.gettext('yyyy-MM-dd')}'}}`;
    }
  }


  class DateTimeField extends TextField {
    static get tag() {
      return 'input date-input';
    }

    get type() {
      return 'datetime-local';
    }

    spanTemplate() {
      return `<span class="${this.readOnlyClass}">{{ ${this.spanPrefix}(record.${this.field.name}|date:'${Katrid.i18n.gettext('yyyy-MM-dd hh:mma')}') || '${this.emptyText}' }}</span>`;
    }
  }


  class OneToManyField extends Field {
    static get tag() {
      return 'grid';
    }

    spanTemplate() {
      return '';
    }

    innerHtml() {
      return this.content;
      let html = his.element.html();
      if (html)
        return html;
      return '';
    }

  }


  class ManyToManyField extends Field {
    static get tag() {
      return 'input foreignkey multiple';
    }

    spanTemplate() {
      return `<span class="${this.readOnlyClass}">{{ ${this.spanPrefix}record.${this.field.name}|m2m }}</span>`;
    }

    get type() {
      return 'hidden';
    }
  }


  class BooleanField extends InputWidget {
    spanTemplate() {
      return `<span class="${this.readOnlyClass} bool-text">
  {{${this.spanPrefix}record.${this.field.name} ? '${Katrid.i18n.gettext('yes')}' : '${Katrid.i18n.gettext('no')}'}}
  </span>`;
    }

    get type() {
      return 'checkbox';
    }

    _td(cls) {
      return super._td('bool-text ' + cls);
    }

    widgetTemplate() {
      let html = super.widgetTemplate();
      html = `<label class="checkbox" ng-show="dataSource.changing">${html}`;
      if (this.field.help_text) {
        html += this.field.help_text;
      } else {
        html += this.field.caption;
      }
      html += '<i></i></label>';
      return html;
    }

    labelTemplate() {
      if (this.field.help_text)
        return super.labelTemplate();
      return `<label for="${ this.id }" class="form-label form-label-checkbox"><span>${ this.caption }</span>&nbsp;</label>`;
    }
  }


  class FileField extends InputWidget {
    static get tag() {
      return 'input file-reader';
    }

    get type() {
      return 'file';
    }
  }


  class ImageField extends FileField {
    static get tag() {
      return 'input file-reader accept="image/*"';
    }

    spanTemplate() { return ''; }

    widgetTemplate() {
      let html = super.widgetTemplate();
      let imgSrc = this.attrs.ngEmptyImage || (this.attrs.emptyImage && ("'" + this.attrs.emptyImage + "'")) || "'/static/web/assets/img/no-image.png'";
      html = `<div class="image-box image-field">
  <img ng-src="{{ record.${this.field.name} || ${imgSrc} }}" />
    <div class="text-right image-box-buttons">
    <button class="btn btn-default" type="button" title="${Katrid.i18n.gettext('Change')}" onclick="$(this).closest('.image-box').find('input').trigger('click')"><i class="fa fa-pencil"></i></button>
    <button class="btn btn-default" type="button" title="${Katrid.i18n.gettext('Clear')}" ng-click="$set('${this.field.name}', null)"><i class="fa fa-trash"></i></button>
    </div>
      ${html}</div>`;
      return html;
    }
  }


  class PasswordField extends InputWidget {

    get type() {
      return 'password';
    }

    spanTemplate() {
      return `<span class="form-field-readonly">*******************</span>`;
    }
  }


  class SortableField extends Field {
    constructor(...args) {
      super(...args);
      this.col = null;
    }
    static get tag() {
      return 'sortable-field';
    }


    get type() {
      return 'hidden';
    }

    _td(cls) {
      return `<td onclick="event.preventDefault();event.stopPropagation();" class="list-column-sortable">${ this.spanTemplate() }</td>`;
    }

    th() {
      return `<th class="list-column-sortable" name="${this.field.name}"></th>`;
    }

    spanTemplate() {
      return `<sortable-field id="${this.id}" name="${this.field.name}" ng-model="record.${this.field.name}"/>`;
    }
  }

  Object.assign(this.Katrid.ui.Widgets,
    {
      Field,
      InputWidget,
      StringField,
      IntegerField,
      SelectionField,
      ForeignKey,
      TextField,
      DecimalField,
      FloatField,
      DateField,
      DateTimeField,
      TimeField,
      BooleanField,
      OneToManyField,
      ManyToManyField,
      FileField,
      PasswordField,
      ImageField,
      SortableField,
      input: InputWidget,
      string: StringField,
      integer: IntegerField,
      selection: SelectionField,
      text: TextField,
      decimal: DecimalField,
      float: FloatField,
      file: FileField,
      boolean: BooleanField,
      password: PasswordField,
      image: ImageField,
      sortable: SortableField,
    }
  );
})();

(function() {

  let uiKatrid = Katrid.ui.uiKatrid;

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
      template: `<div class="tabset"><div class=\"clearfix\"></div>\n` +
      "  <div class=\"nav nav-{{type || 'tabs'}}\" ng-class=\"{'nav-stacked': vertical, 'nav-justified': justified}\" ng-transclude></div>\n" +
      "  <div class=\"tab-content\">\n" +
      "    <div class=\"tab-pane\" \n" +
      "         ng-repeat=\"tab in tabs\" \n" +
      `         ng-class="{active: tab.active}">` +
      `<div class="col-12"><div class="row" tab-content-transclude="tab"></div></div>` +
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
        template: `<a class="nav-item nav-link" href ng-click="select()" tab-heading-transclude ng-class="{active: active, disabled: disabled}">{{heading}}</a>`,
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

}).call(this);

(function () {

  class Comments {
    constructor(scope) {
      this.scope = scope;
      this.model = this.scope.$parent.model;

      this.scope.$parent.$watch('recordId', key => {
        this.items = null;
        this.scope.loading = Katrid.i18n.gettext('Loading...');
        clearTimeout(this._pendingOperation);
        this._pendingOperation = setTimeout(() => {
          this._pendingOperation = null;
          this.masterChanged(key);
          return this.scope.$apply(() => {
            return this.scope.loading = null;
          });
        }
        , 1000);
      });

      this.items = [];
    }

    async masterChanged(key) {
      if (key) {
        const svc = new Katrid.Services.Model('mail.message');
        if (this.scope.$parent.record)
        return svc.post('get_messages', { args: [this.scope.$parent.record.messages] })
        .then(res => {
          this.items = res;
          this.scope.$apply();
        });
      }
    }

    async _sendMesage(msg, attachments) {
      if (attachments)
        attachments = attachments.map((obj) => obj.id);
      let msgs = await this.model.post('post_message', { args: [[this.scope.$parent.recordId]], kwargs: { content: msg, content_subtype: 'html', format: true, attachments: attachments } });
      this.scope.message = '';
      this.items = msgs.concat(this.items);
      this.scope.$apply();
      this.scope.files = null;
      this.scope.hideEditor();
    }

    postMessage(msg) {
      if (this.scope.files.length) {
        let files = [];
        for (let f of this.scope.files) files.push(f.file);
        var me = this;
        Katrid.Services.Attachments.upload({files: files}, this.scope)
        .done((res) => {
          me._sendMesage(msg, res);
        });
      } else
        this._sendMesage(msg);
    }
  }


  Katrid.ui.uiKatrid.directive('comments', () =>
    ({
      restrict: 'E',
      scope: {},
      replace: true,
      template: '<div class="content"><div class="comments"><mail-comments/></div></div>',
      link(scope, element, attrs) {
        if (element.closest('.modal-dialog').length)
          element.remove();
        else
          $(element).closest('.form-view[ng-form=form]').find('.content-scroll>.content').append(element);
      }
    })
  );

  Katrid.ui.uiKatrid.directive('mailComments', () =>
    ({
      restrict: 'E',
      controller: ['$scope', ($scope) => {
        $scope.comments = new Comments($scope);
        $scope.files = [];

        $scope.showEditor = () => {
          $($scope.el).find('#mail-editor').show();
          $($scope.el).find('#mail-msgEditor').focus();
        };

        $scope.hideEditor = () => {
          $($scope.el).find('#mail-editor').hide();
        };

        $scope.attachFile = (file) => {
          for (let f of file.files)
            $scope.files.push({
              name: f.name,
              type: f.type,
              file: f
            });
          $scope.$apply();
        };

        $scope.deleteFile = (idx) => {
          $scope.files.splice(idx, 1);
        }
      }],
      replace: true,
      link(scope, element, attrs) {
        scope.el = element;
      },

      template() {
        return `
  <div class="container">
          <h3>${Katrid.i18n.gettext('Comments')}</h3>
          <div class="form-group">
          <button class="btn btn-outline-secondary" ng-click="showEditor();">${Katrid.i18n.gettext('New message')}</button>
          <button class="btn btn-outline-secondary">${Katrid.i18n.gettext('Log an internal note')}</button>
          </div>
          <div id="mail-editor" style="display: none;">
            <div class="form-group">
              <textarea id="mail-msgEditor" class="form-control" ng-model="message"></textarea>
            </div>
            <div class="form-group">
              <button class="btn btn-default" type="button" onclick="$(this).next().click()"><i class="fa fa-paperclip"></i></button>
              <input class="input-file-hidden" type="file" multiple onchange="angular.element(this).scope().attachFile(this)">
            </div>
            <div class="form-group" ng-show="files.length">
              <ul class="list-inline attachments-area">
                <li ng-repeat="file in files" ng-click="deleteFile($index)" title="${ Katrid.i18n.gettext('Delete this attachment') }">{{ file.name }}</li>
              </ul>
            </div>
            <div class="from-group">
              <button class="btn btn-primary" ng-click="comments.postMessage(message)">${Katrid.i18n.gettext('Send')}</button>
            </div>
          </div>
  
          <hr>
  
          <div ng-show="loading">{{ loading }}</div>
          <div class="comment media col-sm-12" ng-repeat="comment in comments.items">
            <div class="media-left">
              <img src="/static/web/assets/img/avatar.png" class="avatar rounded">
            </div>
            <div class="media-body">
              <strong>{{ ::comment.author[1] }}</strong> - <span class="timestamp text-muted" title="{{ ::comment.date_time|moment:'LLLL'}}"> {{::comment.date_time|moment}}</span>
              <div class="clearfix"></div>
              <div class="form-group">
                {{::comment.content}}
              </div>
              <div class="form-group" ng-if="comment.attachments">
                <ul class="list-inline">
                  <li ng-repeat="file in comment.attachments"><a href="/web/content/{{ ::file.id }}/?download">{{ ::file.name }}</a></li>
                </ul>
              </div>
            </div>
          </div>
    </div>`;
      }
    })
  );


  class MailFollowers {}


  class MailComments extends Katrid.ui.Widgets.Widget {
    static initClass() {
      this.prototype.tag = 'mail-comments';
    }

    spanTemplate(scope, el, attrs, field) {
      return '';
    }
  }
  MailComments.initClass();


  Katrid.ui.Widgets.MailComments = MailComments;

})();

(function () {
  class BaseTemplate {

    getSettingsDropdown(viewType) {
      if (viewType === 'form') {
        return `<ul class="dropdown-menu pull-right">
    <li>
      <a href="javascript:void(0);" ng-click="action.showDefaultValueDialog()">${ Katrid.i18n.gettext('Set Default') }</a>
    </li>
  </ul>`;
      }
    }


    getSetDefaultValueDialog() {
      return `\
  <div class="modal fade" id="set-default-value-dialog" tabindex="-1" role="dialog">
    <div class="modal-dialog" role="document">
      <div class="modal-content">
        <div class="modal-header">
          <button type="button" class="close" data-dismiss="modal" aria-label="${ Katrid.i18n.gettext('Close') }"><span aria-hidden="true">&times;</span></button>
          <h4 class="modal-title">${ Katrid.i18n.gettext('Set Default') }</h4>
        </div>
        <div class="modal-body">
          <select class="form-control" id="id-set-default-value">
            <option ng-repeat="field in view.fields">{{ field.caption }} = {{ record[field.name] }}</option>
          </select>
          <div class="radio">
            <label><input type="radio" name="public">${ Katrid.i18n.gettext('Only me') }</label>
          </div>
          <div class="radio">
            <label><input type="radio" name="public">${ Katrid.i18n.gettext('All users') }</label>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-primary">${ Katrid.i18n.gettext('Save') }</button>
          <button type="button" class="btn btn-default" data-dismiss="modal">${ Katrid.i18n.gettext('Cancel') }</button>
        </div>
      </div>
    </div>
  </div>\
  `;
    }

    static get cssListClass() {
      return 'table table-striped table-bordered table-condensed table-hover display responsive nowrap dataTable no-footer dtr-column';
    }

    renderList(scope, element, attrs, rowClick, parentDataSource, showSelector=true) {
      let ths = '<th ng-show="dataSource.groups.length"></th>';
      let tfoot = false;
      let totals = [];
      let cols = `<td ng-show="dataSource.groups.length" class="group-header">
  <div ng-show="record._group">
  <span class="fa fa-fw fa-caret-right"
    ng-class="{'fa-caret-down': record._group.expanded, 'fa-caret-right': record._group.collapsed}"></span>
    {{::record._group.__str__}} ({{::record._group.count }})</div></td>`;
      if (showSelector) {
        ths += `<th class="list-record-selector"><input type="checkbox" ng-click="action.selectToggle($event.currentTarget)" onclick="$(this).closest('table').find('td.list-record-selector input').prop('checked', $(this).prop('checked'))"></th>`;
        cols += `<td class="list-record-selector" onclick="event.stopPropagation();"><input title="teste" type="checkbox" ng-click="action.selectToggle($event.currentTarget)" onclick="if (!$(this).prop('checked')) $(this).closest('table').find('th.list-record-selector input').prop('checked', false)"></td>`;
      }

      for (let col of Array.from(element.children())) {
        let colHtml = col.outerHTML;
        col = $(col);
        let name = col.attr('name');
        if (!name) {
          cols += `<td>${col.html()}</td>`;
          ths += "<th><span>${col.attr('label')}</span></th>";
          continue;
        }

        let total = col.attr('total');
        if (total) {
          totals.push([name, total]);
          tfoot = true;
        } else totals.push(total);

        name = col.attr('name');
        const fieldInfo = scope.view.fields[name];

        if ((col.attr('visible') === 'False') || (fieldInfo.visible === false))
          continue;

        // if (fieldInfo.choices) {
        //   fieldInfo._listChoices = {};
        //   for (let choice of Array.from(fieldInfo.choices)) {
        //     fieldInfo._listChoices[choice[0]] = choice[1];
        //   }
        // }

        let _widget = fieldInfo.createWidget(col.attr('widget'), scope, col, col);
        _widget.inList = true;
        _widget.inplaceEditor = Boolean(scope.inline);
        ths += _widget.th(col.attr('label'));

        cols += _widget.td(scope.inline, colHtml, col);
      }
      if (parentDataSource) {
        ths += '<th class="list-column-delete" ng-show="parent.dataSource.changing && !dataSource.readonly">';
        cols += '<td class="list-column-delete" ng-show="parent.dataSource.changing && !dataSource.readonly" ng-click="removeItem($index);$event.stopPropagation();"><i class="fa fa-trash-o"></i></td>';
      }
      if ((rowClick == null)) {
        rowClick = 'action.listRowClick($index, row, $event)';
      }

      if (tfoot)
        tfoot = `<tfoot><tr>${ totals.map(t => (t ? `<td class="text-right"><strong><ng-total field="${ t[0] }" type="${ t[1] }"></ng-total></ strong></td>` : '<td class="borderless"></td>')).join('') }</tr></tfoot>`;
      else
        tfoot = '';
      let gridClass = ' grid';
      if (scope.inline)
        gridClass += ' inline-editor';
      return `<table class="${this.constructor.cssListClass}${gridClass}">
  <thead><tr>${ths}</tr></thead>
  <tbody>
  <tr ng-repeat="record in records | limitTo:totalDisplayed" ng-click="${rowClick}" ng-class="{'group-header': record._hasGroup, 'form-data-changing': (dataSource.changing && dataSource.recordIndex === $index), 'form-data-readonly': !(dataSource.changing && dataSource.recordIndex === $index)}" ng-form="grid-row-form-{{$index}}" id="grid-row-form-{{$index}}">${cols}</tr>
  </tbody>
  ${ tfoot }
  </table>
  <a href="javascript:void(0)" ng-show="records.length > totalDisplayed" ng-click="totalDisplayed = totalDisplayed + 1000">${ Katrid.i18n.gettext('View more...') }</a>
  `;
    }

    renderGrid(scope, element, attrs, rowClick) {
      const tbl = this.renderList(scope, element, attrs, rowClick, true, false);
      let buttons;
      if (attrs.inline == 'inline')
        buttons = `
<button class="btn btn-xs btn-info" ng-click="addItem()" ng-show="parent.dataSource.changing && !dataSource.changing" type="button">${Katrid.i18n.gettext('Add')}</button>
<button class="btn btn-xs btn-info" ng-click="addItem()" ng-show="dataSource.changing" type="button">${Katrid.i18n.gettext('Save')}</button>
<button class="btn btn-xs btn-info" ng-click="cancelChanges()" ng-show="dataSource.changing" type="button">${Katrid.i18n.gettext('Cancel')}</button>
`;
      else
        buttons = `
<button class="btn btn-xs btn-info" ng-click="addItem()" ng-show="parent.dataSource.changing" type="button">${Katrid.i18n.gettext('Add')}</button>
<button class="btn btn-xs btn-outline-secondary float-right" ng-click="pasteData()" ng-show="parent.dataSource.changing" type="button" title="${Katrid.i18n.gettext('Paste')}">
<i class="fa fa-clipboard"></i>
</button>
`;
      return `<div style="overflow-x: auto;"><div ng-show="!dataSource.readonly">
  ${buttons}
  </div><div class="row inline-input-dialog" ng-show="dataSource.changing"/>${tbl}</div>`;
    }

    windowDialog(scope) {
      console.log('window dialog', scope);
      return `\
  <div class="modal fade" tabindex="-1" role="dialog">
    <div class="modal-dialog modal-lg" role="document">
      <div class="modal-content">
        <div class="modal-header">
          <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
          <h4 class="modal-title" id="myModalLabel">
          {{dialogTitle}}
          {{action.info.display_name}}</h4>
        </div>
        <div class="modal-body">
    <div class="modal-dialog-body" ng-class="{'form-data-changing': dataSource.changing}"></div>
  <div class="clearfix"></div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-primary" type="button" ng-click="dataSource.saveAndClose()" ng-show="dataSource.changing">${Katrid.i18n.gettext('Save')}</button>
          <button type="button" class="btn btn-default" type="button" data-dismiss="modal" ng-show="dataSource.changing">${Katrid.i18n.gettext('Cancel')}</button>
          <button type="button" class="btn btn-default" type="button" data-dismiss="modal" ng-show="!dataSource.changing">${Katrid.i18n.gettext('Close')}</button>
        </div>
      </div>
    </div>
  </div>\
  `;
    }

    renderReportDialog(scope) {
      return `<div ng-controller="ReportController">
  <form id="report-form" method="get" action="/web/reports/report/">
    <div class="data-heading panel panel-default">
      <div class="panel-body">
      <h2>{{ report.name }}</h3>
      <div class="toolbar">
        <button class="btn btn-primary" type="button" ng-click="report.preview()"><span class="fa fa-print fa-fw"></span> ${ Katrid.i18n.gettext('Preview') }</button>
  
        <div class="btn-group">
          <button class="btn btn-default dropdown-toggle" data-toggle="dropdown" aria-haspopup="true"
                  aria-expanded="false">${ Katrid.i18n.gettext('Export')  } <span class="caret"></span></button>
          <ul class="dropdown-menu">
            <li><a ng-click="Katrid.Reports.Reports.preview()">PDF</a></li>
            <li><a href="javascript:void(0)" ng-click="Katrid.Reports.Reports.export('docx')">Word</a></li>
            <li><a href="javascript:void(0)" ng-click="Katrid.Reports.Reports.export('xlsx')">Excel</a></li>
            <li><a href="javascript:void(0)" ng-click="Katrid.Reports.Reports.export('pptx')">PowerPoint</a></li>
            <li><a href="javascript:void(0)" ng-click="Katrid.Reports.Reports.export('csv')">CSV</a></li>
            <li><a href="javascript:void(0)" ng-click="Katrid.Reports.Reports.export('txt')">${ Katrid.i18n.gettext('Text File') }</a></li>
          </ul>
        </div>
  
        <div class="btn-group">
          <button class="btn btn-default dropdown-toggle" data-toggle="dropdown" aria-haspopup="true"
                  aria-expanded="false">${ Katrid.i18n.gettext('My reports')  } <span class="caret"></span></button>
          <ul class="dropdown-menu">
            <li><a ng-click="Katrid.Reports.Reports.preview()">PDF</a></li>
            <li><a href="javascript:void(0)" ng-click="Katrid.Reports.Reports.export('docx')">Word</a></li>
            <li><a href="javascript:void(0)" ng-click="Katrid.Reports.Reports.export('xlsx')">Excel</a></li>
            <li><a href="javascript:void(0)" ng-click="Katrid.Reports.Reports.export('pptx')">PowerPoint</a></li>
            <li><a href="javascript:void(0)" ng-click="Katrid.Reports.Reports.export('csv')">CSV</a></li>
            <li><a href="javascript:void(0)" ng-click="Katrid.Reports.Reports.export('txt')">${ Katrid.i18n.gettext('Text File') }</a></li>
          </ul>
        </div>
  
      <div class="pull-right btn-group">
        <button class="btn btn-default dropdown-toggle" data-toggle="dropdown" aria-haspopup="true"
                aria-expanded="false"><i class="fa fa-gear fa-fw"></i></button>
        <ul class="dropdown-menu">
          <li><a href="javascript:void(0)" ng-click="report.saveDialog()">${ Katrid.i18n.gettext('Save') }</a></li>
          <li><a href="#">${ Katrid.i18n.gettext('Load') }</a></li>
        </ul>
      </div>
  
      </div>
    </div>
    </div>
    <div class="col-sm-12">
      <table class="col-sm-12" style="margin-top: 20px; display:none;">
        <tr>
          <td colspan="2" style="padding-top: 8px;">
            <label>${ Katrid.i18n.gettext('My reports') }</label>
  
            <select class="form-control" ng-change="action.userReportChanged(action.userReport.id)" ng-model="action.userReport.id">
                <option value=""></option>
                <option ng-repeat="rep in userReports" value="{{ rep.id }}">{{ rep.name }}</option>
            </select>
          </td>
        </tr>
      </table>
    </div>
  <div id="report-params">
  <div id="params-fields" class="col-sm-12 form-group">
    <div class="checkbox"><label><input type="checkbox" ng-model="paramsAdvancedOptions"> ${ Katrid.i18n.gettext('Advanced options') }</label></div>
    <div ng-show="paramsAdvancedOptions">
      <div class="form-group">
        <label>${ Katrid.i18n.gettext('Printable Fields') }</label>
        <input type="hidden" id="report-id-fields"/>
      </div>
      <div class="form-group">
        <label>${ Katrid.i18n.gettext('Totalizing Fields') }</label>
        <input type="hidden" id="report-id-totals"/>
      </div>
    </div>
  </div>
  
  <div id="params-sorting" class="col-sm-12 form-group">
    <label class="control-label">${ Katrid.i18n.gettext('Sorting') }</label>
    <select multiple id="report-id-sorting"></select>
  </div>
  
  <div id="params-grouping" class="col-sm-12 form-group">
    <label class="control-label">${ Katrid.i18n.gettext('Grouping') }</label>
    <select multiple id="report-id-grouping"></select>
  </div>
  
  <div class="clearfix"></div>
  
  </div>
    <hr>
      <table class="col-sm-12">
        <tr>
          <td class="col-sm-4">
            <select class="form-control" ng-model="newParam">
              <option value="">--- ${ Katrid.i18n.gettext('FILTERS') } ---</option>
              <option ng-repeat="field in report.fields" value="{{ field.name }}">{{ field.label }}</option>
            </select>
          </td>
          <td class="col-sm-8">
            <button
                class="btn btn-default" type="button"
                ng-click="report.addParam(newParam)">
              <i class="fa fa-plus fa-fw"></i> ${ Katrid.i18n.gettext('Add Parameter') }
            </button>
          </td>
        </tr>
      </table>
  <div class="clearfix"></div>
  <hr>
  <div id="params-params">
    <div ng-repeat="param in report.params" ng-controller="ReportParamController" class="row form-group">
      <div class="col-sm-12">
      <div class="col-sm-4">
        <label class="control-label">{{param.label}}</label>
        <select ng-model="param.operation" class="form-control" ng-change="param.setOperation(param.operation)">
          <option ng-repeat="op in param.operations" value="{{op.id}}">{{op.text}}</option>
        </select>
      </div>
      <div class="col-sm-8" id="param-widget"></div>
      </div>
    </div>
  </div>
  </form>
  </div>\
  `;
    }

  }


  Katrid.ui.utils = {
    BaseTemplate,
    Templates: new BaseTemplate()
  };

})();

(function() {

  class NumPad {
    constructor($compile) {
      this.restrict = 'A';
      this.require = 'ngModel';
      this.scope = {};
      this.$compile = $compile;
    }
    link(scope, el, attrs, ngModel) {

      el.bind('click', () => {
        console.log('numpad click');
        let templ = this.$compile(Katrid.app.getTemplate('ui.numpad.pug'))(scope);
        scope.val = parseFloat(ngModel.$modelValue || 0);
        scope.$apply();
        let modal = $(templ).modal();
        modal.on('hidden.bs.modal', function() {
          $(this).remove();
        });

        let comma = false;
        let frac = '';

        scope.done = () => {
          scope.$parent.record[ngModel.$name] = scope.val.toString();
          if (attrs.ngChange)
            scope.$parent.$eval(attrs.ngChange);
          ngModel.$setDirty();
          modal.modal('hide');
        };

        scope.cancel = () => {
          modal.modal('hide');
        };

        scope.buttonClick = (num) => {
          let s = scope.val.toFixed(2).toString().replace('.', '');
          if (num === 'bs') {
            s = s.substr(0, s.length-1);
            if (s)
              scope.val = parseFloat(s) / 100;
            else
              scope.val = 0;
          }
          else if (num === '0')
            scope.val *= 10;
          else
            scope.val = parseFloat(s + num) / 100;
        }
      });


    }
  }

  Katrid.ui.uiKatrid.directive('numpadInput', ['$compile', NumPad]);

})();

(function() {

  Katrid.ui.uiKatrid
  .constant('uiAceConfig', {})
  .directive('codeEditor', ['uiAceConfig', function (uiAceConfig) {

    if (angular.isUndefined(window.ace)) {
      throw new Error('ui-ace need ace to work... (o rly?)');
    }

    var setOptions = function(acee, session, opts) {

      // sets the ace worker path, if running from concatenated
      // or minified source
      if (angular.isDefined(opts.workerPath)) {
        var config = window.ace.require('ace/config');
        config.set('workerPath', opts.workerPath);
      }
      // ace requires loading
      if (angular.isDefined(opts.require)) {
        opts.require.forEach(function (n) {
          window.ace.require(n);
        });
      }
      // Boolean options
      if (angular.isDefined(opts.showGutter)) {
        acee.renderer.setShowGutter(opts.showGutter);
      }
      if (angular.isDefined(opts.useWrapMode)) {
        session.setUseWrapMode(opts.useWrapMode);
      }
      if (angular.isDefined(opts.showInvisibles)) {
        acee.renderer.setShowInvisibles(opts.showInvisibles);
      }
      if (angular.isDefined(opts.showIndentGuides)) {
        acee.renderer.setDisplayIndentGuides(opts.showIndentGuides);
      }
      if (angular.isDefined(opts.useSoftTabs)) {
        session.setUseSoftTabs(opts.useSoftTabs);
      }
      if (angular.isDefined(opts.showPrintMargin)) {
        acee.setShowPrintMargin(opts.showPrintMargin);
      }

      // commands
      if (angular.isDefined(opts.disableSearch) && opts.disableSearch) {
        acee.commands.addCommands([
          {
            name: 'unfind',
            bindKey: {
              win: 'Ctrl-F',
              mac: 'Command-F'
            },
            exec: function () {
              return false;
            },
            readOnly: true
          }
        ]);
      }

      // Basic options
      if (angular.isString(opts.theme)) {
        acee.setTheme('ace/theme/' + opts.theme);
      }
      if (angular.isString(opts.mode)) {
        session.setMode('ace/mode/' + opts.mode);
      }
      // Advanced options
      if (angular.isDefined(opts.firstLineNumber)) {
        if (angular.isNumber(opts.firstLineNumber)) {
          session.setOption('firstLineNumber', opts.firstLineNumber);
        } else if (angular.isFunction(opts.firstLineNumber)) {
          session.setOption('firstLineNumber', opts.firstLineNumber());
        }
      }

      // advanced options
      var key, obj;
      if (angular.isDefined(opts.advanced)) {
        for (key in opts.advanced) {
          // create a javascript object with the key and value
          obj = { name: key, value: opts.advanced[key] };
          // try to assign the option to the ace editor
          acee.setOption(obj.name, obj.value);
        }
      }

      // advanced options for the renderer
      if (angular.isDefined(opts.rendererOptions)) {
        for (key in opts.rendererOptions) {
          // create a javascript object with the key and value
          obj = { name: key, value: opts.rendererOptions[key] };
          // try to assign the option to the ace editor
          acee.renderer.setOption(obj.name, obj.value);
        }
      }

      // onLoad callbacks
      angular.forEach(opts.callbacks, function (cb) {
        if (angular.isFunction(cb)) {
          cb(acee);
        }
      });
    };

    return {
      restrict: 'EA',
      require: '?ngModel',
      link: function (scope, elm, attrs, ngModel) {

        /**
         * Corresponds the uiAceConfig ACE configuration.
         * @type object
         */
        var options = uiAceConfig.ace || {};

        /**
         * uiAceConfig merged with user options via json in attribute or data binding
         * @type object
         */
        var opts = angular.extend({}, options, scope.$eval(attrs.codeEditorOptions));

        /**
         * ACE editor
         * @type object
         */
        var acee = window.ace.edit(elm[0]);

        /**
         * ACE editor session.
         * @type object
         * @see [EditSession]{@link http://ace.c9.io/#nav=api&api=edit_session}
         */
        var session = acee.getSession();

        /**
         * Reference to a change listener created by the listener factory.
         * @function
         * @see listenerFactory.onChange
         */
        var onChangeListener;

        /**
         * Reference to a blur listener created by the listener factory.
         * @function
         * @see listenerFactory.onBlur
         */
        var onBlurListener;

        /**
         * Calls a callback by checking its existing. The argument list
         * is variable and thus this function is relying on the arguments
         * object.
         * @throws {Error} If the callback isn't a function
         */
        var executeUserCallback = function () {

          /**
           * The callback function grabbed from the array-like arguments
           * object. The first argument should always be the callback.
           *
           * @see [arguments]{@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions_and_function_scope/arguments}
           * @type {*}
           */
          var callback = arguments[0];

          /**
           * Arguments to be passed to the callback. These are taken
           * from the array-like arguments object. The first argument
           * is stripped because that should be the callback function.
           *
           * @see [arguments]{@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions_and_function_scope/arguments}
           * @type {Array}
           */
          var args = Array.prototype.slice.call(arguments, 1);

          if (angular.isDefined(callback)) {
            scope.$evalAsync(function () {
              if (angular.isFunction(callback)) {
                callback(args);
              } else {
                throw new Error('ui-ace use a function as callback.');
              }
            });
          }
        };

        /**
         * Listener factory. Until now only change listeners can be created.
         * @type object
         */
        var listenerFactory = {
          /**
           * Creates a change listener which propagates the change event
           * and the editor session to the callback from the user option
           * onChange. It might be exchanged during runtime, if this
           * happens the old listener will be unbound.
           *
           * @param callback callback function defined in the user options
           * @see onChangeListener
           */
          onChange: function (callback) {
            return function (e) {
              var newValue = session.getValue();

              if (ngModel && newValue !== ngModel.$viewValue &&
                // HACK make sure to only trigger the apply outside of the
                // digest loop 'cause ACE is actually using this callback
                // for any text transformation !
                !scope.$$phase && !scope.$root.$$phase) {
                scope.$evalAsync(function () {
                  ngModel.$setViewValue(newValue);
                });
              }

              executeUserCallback(callback, e, acee);
            };
          },
          /**
           * Creates a blur listener which propagates the editor session
           * to the callback from the user option onBlur. It might be
           * exchanged during runtime, if this happens the old listener
           * will be unbound.
           *
           * @param callback callback function defined in the user options
           * @see onBlurListener
           */
          onBlur: function (callback) {
            return function () {
              executeUserCallback(callback, acee);
            };
          }
        };

        attrs.$observe('readonly', function (value) {
          acee.setReadOnly(!!value || value === '');
        });

        // Value Blind
        if (ngModel) {
          ngModel.$formatters.push(function (value) {
            if (angular.isUndefined(value) || value === null) {
              return '';
            }
            else if (angular.isObject(value) || angular.isArray(value)) {
              throw new Error('ui-ace cannot use an object or an array as a model');
            }
            return value;
          });

          ngModel.$render = function () {
            session.setValue(ngModel.$viewValue);
          };
        }

        // Listen for option updates
        var updateOptions = function (current, previous) {
          if (current === previous) return;
          opts = angular.extend({}, options, scope.$eval(attrs.codeEditorOptions));

          opts.callbacks = [ opts.onLoad ];
          if (opts.onLoad !== options.onLoad) {
            // also call the global onLoad handler
            opts.callbacks.unshift(options.onLoad);
          }

          // EVENTS

          // unbind old change listener
          session.removeListener('change', onChangeListener);

          // bind new change listener
          onChangeListener = listenerFactory.onChange(opts.onChange);
          session.on('change', onChangeListener);

          // unbind old blur listener
          //session.removeListener('blur', onBlurListener);
          acee.removeListener('blur', onBlurListener);

          // bind new blur listener
          onBlurListener = listenerFactory.onBlur(opts.onBlur);
          acee.on('blur', onBlurListener);

          setOptions(acee, session, opts);
        };

        scope.$watch(attrs.codeEditorOptions, updateOptions, /* deep watch */ true);

        // set the options here, even if we try to watch later, if this
        // line is missing things go wrong (and the tests will also fail)
        updateOptions(options);

        elm.on('$destroy', function () {
          acee.session.$stopWorker();
          acee.destroy();
        });

        scope.$watch(function() {
          return [elm[0].offsetWidth, elm[0].offsetHeight];
        }, function() {
          acee.resize();
          acee.renderer.updateFull();
        }, true);

      }
    };
  }]);

})();

(function () {

  class Alerts {
    static success(msg) {
      return toastr['success'](msg);
    }

    static warn(msg) {
      return toastr['warning'](msg);
    }

    static error(msg) {
      return toastr['error'](msg);
    }
  }

  class WaitDialog {
    static show() {
      $('#loading-msg').show();
    }

    static hide() {
      $('#loading-msg').hide();
    }
  }

  class Dialog extends Katrid.ui.Views.BaseView {
    constructor(scope, options, $compile) {
      super(scope);
      this.$compile = $compile;
      this.templateUrl = 'dialog.base';
      this.scope.isDialog = true;
    }

    render() {
      return $(Katrid.app.getTemplate(this.templateUrl).replace('<!-- replace-content -->', this.content));
    }

    show() {
      if (!this.el) {
        this.el = $(this.render());
        this.root = this.el.find('.modal-dialog-body');
        this.el.find('form').first().addClass('row');
        this.$compile(this.el)(this.scope);
      }
      this.el.modal('show')
      .on('shown.bs.modal', () => Katrid.ui.uiKatrid.setFocus(this.el.find('.form-field').first()));
      return this.el;
    }
}

  class Window extends Dialog {
    constructor(scope, options, $compile, $controller, model, viewType) {
      super(scope.$new(true), options, $compile);
      this.scope._ = this.scope.$parent._;
      this.scope.parentAction = scope.action;
      this.scope.views = {form: options.view};
      this.scope.dialogTitle = (options && options.title) || Katrid.i18n.gettext('Create: ');
      this.scope.view = options.view;
      this.scope.model = model;
      this.options = options;
    }

    async createNew(config) {
      let field = this.options.field;

      this.scope.$setDirty = (field) => {
        const control = this.scope.form[field];
        if (control) {
          control.$setDirty();
        }
      };

      let view = this.scope.view;
      let elScope = this.scope;
      elScope.views = { form: view };
      elScope.isDialog = true;
      let el = $(Katrid.app.$templateCache.get('view.form.dialog.modal').replace(
        '<!-- view content -->',
        '<form-view form-dialog="dialog">' + view.content + '</form-view>',
      ));
      elScope.root = el.find('form-view');

      el = this.$compile(el)(elScope);
      let form = el.find('form').first().addClass('row');
      el.modal('show').on('shown.bs.modal', () => Katrid.ui.uiKatrid.setFocus(el.find('.form-field').first()))
      .on('hidden.bs.modal', function() {
        $(this).modal('dispose').remove();
      });

      this.scope.form = form.controller('form');
      this.scope.formElement = form;
      if (field) {
        let evt = this.scope.$on('saveAndClose', async (event, targetScope, data) => {
          if (this.scope === targetScope) {
            if (_.isArray(data) && data.length) {
              data = await this.scope.$parent.model.getFieldChoices(field.name, null, {ids: data});
              let vals = {};
              let res = data.items[0];
              vals[field.name] = res;
              this.scope.$parent.dataSource.setValues(vals);
              if (this.options.sel)
                this.options.sel.select2('data', { id: res[0], text: res[1] });
            }
            // unhook event
            evt();
          }
        });
      }
      this.scope.action = {
        $element: el,
      };
      this.scope.dataSource = new Katrid.Data.DataSource(this.scope);

      return new Promise(async (resolve, reject) => {
        setTimeout(async () => {
          // check if there's a creation name
          let kwargs, defaultValues;
          if (config) {
            if (config.creationName)
              kwargs = { creation_name: name };
            if (config.defaultValues)
              defaultValues = config.defaultValues;
          }
          await this.scope.dataSource.insert(true, defaultValues, kwargs);
          this.scope.$apply();
          resolve(el);
        });

      });

    };
  }

  Katrid.ui.Dialogs = {
    Alerts,
    WaitDialog,
    Dialog,
    Window
  };

})();

(function() {

  Katrid.ui.uiKatrid.directive("foreignkey", ['$compile', '$controller', ($compile, $controller) => ({
    restrict: "A",
    require: "ngModel",
    link(scope, el, attrs, controller) {
      let serviceName;
      let sel = el;
      let _shown = false;
      const field = scope.view.fields[attrs.name];
      console.log(scope, scope.action);
      el.addClass("form-field");
      if (attrs.serviceName) serviceName = attrs;
      else if (scope.action && scope.action.model) serviceName = scope.action.model.name;
      else serviceName = attrs.foreignkey;
      const newItem = function() {};
      const newEditItem = function() {};
      let _timeout = null;

      let config = {
        allowClear: true,
        query(query) {
          // evaluate domain attribute
          let domain = field.domain;
          if (domain && _.isString(domain))
            domain = scope.$eval(domain);

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

      let allowCreateEdit = attrs.noCreateEdit;
      allowCreateEdit = _.isUndefined(allowCreateEdit) || !Boolean(allowCreateEdit);

      let {
        multiple: multiple
      } = attrs;
      if (multiple) {
        config["multiple"] = true
      }
      sel = sel.select2(config);

      let createNew = () => {
        sel.select2('close');
        let service = new Katrid.Services.Model(field.model);
        return service.getViewInfo({
          view_type: "form"
        }).then(function(res) {
          let title = _.sprintf(Katrid.i18n.gettext('Create: %(title)s'), { title: field.caption });
          let wnd = new Katrid.ui.Dialogs.Window(scope, { sel: sel, field: field, title: title, view: res }, $compile, $controller, service);
          wnd.createNew();
        })
      };

      if (allowCreateEdit)
        sel.parent().find('div.select2-container>div.select2-drop')
        .append(`<div style="padding: 4px;"><button class="btn btn-link btn-sm">${Katrid.i18n.gettext('Create New...')}</button></div>`)
        .find('button').click(createNew);


      sel.on("change", async e => {
        let v = e.added;
        if (v && v.id === newItem) {
          let service = new Katrid.Services.Model(field.model);
          try {
            let res = await service.createName(v.str);
            let vals = {};
            vals[field.name] = res;
            scope.dataSource.setValues(vals);
            sel.select2('data', { id: res[0], text: res[1] });
          } catch(err) {
            let res = await service.getViewInfo({
              view_type: "form"
            });
            let title = _.sprintf(Katrid.i18n.gettext('Create: %(title)s'), { title: field.caption });
            let wnd = new Katrid.ui.Dialogs.Window(scope, { sel: sel, field: field, title: title, view: res }, $compile, $controller, service);
            wnd.createNew({ creationName: v.str });
            sel.select2('data', null);
          }
        } else if (v && v.id === newEditItem) {
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

(function() {

  Katrid.ui.uiKatrid.directive('statusField', ['$compile', ($compile) =>
    ({
      restrict: 'A',
      priority: 1,
      replace: true,
      link(scope, element, attrs, controller) {
        const field = scope.view.fields[attrs.name];
        scope.choices = field.choices;
        if (!attrs.readonly) {
          scope.itemClick = () => console.log('status field item click');
        }
        element.closest('header').prepend(element);
      },
      template(element, attrs) {
        return sprintf(Katrid.app.$templateCache.get('view.field.StatusField'), { fieldName: attrs.name });
      }
    })

  ]);

})();

(function() {

  Katrid.ui.uiKatrid.directive('sortableField', ['$compile', '$timeout', ($compile, $timeout) =>
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

})();

/**
 * jQuery number plug-in 2.1.3
 * Copyright 2012, Digital Fusion
 * Licensed under the MIT license.
 * http://opensource.teamdf.com/license/
 *
 * A jQuery plugin which implements a permutation of phpjs.org's number_format to provide
 * simple number formatting, insertion, and as-you-type masking of a number.
 *
 * @author	Sam Sehnert
 * @docs	http://www.teamdf.com/web/jquery-number-format-redux/196/
 */
(function($){

	"use strict";

	/**
	 * Method for selecting a range of characters in an input/textarea.
	 *
	 * @param int rangeStart			: Where we want the selection to start.
	 * @param int rangeEnd				: Where we want the selection to end.
	 *
	 * @return void;
	 */
	function setSelectionRange( rangeStart, rangeEnd )
	{
		// Check which way we need to define the text range.
		if( this.createTextRange )
		{
			var range = this.createTextRange();
				range.collapse( true );
				range.moveStart( 'character',	rangeStart );
				range.moveEnd( 'character',		rangeEnd-rangeStart );
				range.select();
		}

		// Alternate setSelectionRange method for supporting browsers.
		else if( this.setSelectionRange )
		{
			this.focus();
			this.setSelectionRange( rangeStart, rangeEnd );
		}
	}

	/**
	 * Get the selection position for the given part.
	 *
	 * @param string part			: Options, 'Start' or 'End'. The selection position to get.
	 *
	 * @return int : The index position of the selection part.
	 */
	function getSelection( part )
	{
		var pos	= this.value.length;

		// Work out the selection part.
		part = ( part.toLowerCase() == 'start' ? 'Start' : 'End' );

		if( document.selection ){
			// The current selection
			var range = document.selection.createRange(), stored_range, selectionStart, selectionEnd;
			// We'll use this as a 'dummy'
			stored_range = range.duplicate();
			// Select all text
			//stored_range.moveToElementText( this );
			stored_range.expand('textedit');
			// Now move 'dummy' end point to end point of original range
			stored_range.setEndPoint( 'EndToEnd', range );
			// Now we can calculate start and end points
			selectionStart = stored_range.text.length - range.text.length;
			selectionEnd = selectionStart + range.text.length;
			return part == 'Start' ? selectionStart : selectionEnd;
		}

		else if(typeof(this['selection'+part])!="undefined")
		{
		 	pos = this['selection'+part];
		}
		return pos;
	}

	/**
	 * Substitutions for keydown keycodes.
	 * Allows conversion from e.which to ascii characters.
	 */
	var _keydown = {
		codes : {
			188 : 44,
      110 : 44,
      108 : 44,
			109 : 45,
			190 : 46,
			191 : 47,
			192 : 96,
			220 : 92,
			222 : 39,
			221 : 93,
			219 : 91,
			173 : 45,
			187 : 61, //IE Key codes
			186 : 59, //IE Key codes
			189 : 45, //IE Key codes
        },
        shifts : {
			96 : "~",
			49 : "!",
			50 : "@",
			51 : "#",
			52 : "$",
			53 : "%",
			54 : "^",
			55 : "&",
			56 : "*",
			57 : "(",
			48 : ")",
			45 : "_",
			61 : "+",
			91 : "{",
			93 : "}",
			92 : "|",
			59 : ":",
			39 : "\"",
			44 : "<",
			46 : ">",
			47 : "?"
        }
    };

	/**
	 * jQuery number formatter plugin. This will allow you to format numbers on an element.
	 *
	 * @params proxied for format_number method.
	 *
	 * @return : The jQuery collection the method was called with.
	 */
	$.fn.number = function( number, decimals, dec_point, thousands_sep ){

	    // Enter the default thousands separator, and the decimal placeholder.
	    thousands_sep	= (typeof thousands_sep === 'undefined') ? ',' : thousands_sep;
	    dec_point		= (typeof dec_point === 'undefined') ? '.' : dec_point;
	    decimals		= (typeof decimals === 'undefined' ) ? 0 : decimals;

	    // Work out the unicode character for the decimal placeholder.
	    var u_dec			= ('\\u'+('0000'+(dec_point.charCodeAt(0).toString(16))).slice(-4)),
	    	regex_dec_num	= new RegExp('[^-'+u_dec+'0-9]','g'),
	    	regex_dec		= new RegExp(u_dec,'g');

	    // If we've specified to take the number from the target element,
	    // we loop over the collection, and get the number.
	    if( number === true )
	    {
	    	// If this element is a number, then we add a keyup
	    	if( this.is('input:text') )
	    	{
	    		// Return the jquery collection.
	    		return this.on({

	    			/**
	    			 * Handles keyup events, re-formatting numbers.
	    			 *
	    			 * @param object e			: the keyup event object.s
	    			 *
	    			 * @return void;
	    			 */
	    			'keydown.format' : function(e){


	    				// Define variables used in the code below.
	    				var $this	= $(this),
	    					data	= $this.data('numFormat'),
	    					code	= (e.keyCode ? e.keyCode : e.which),
							chara	= '', //unescape(e.originalEvent.keyIdentifier.replace('U+','%u')),
	    					start	= getSelection.apply(this,['start']),
	    					end		= getSelection.apply(this,['end']),
	    					val		= '',
	    					setPos	= false;

              if (e.key === '-') {
              	if ($this.val() === 0)
              		data.negative = true;
              	else {
              	  data.negative = false;
                  if (this.value.includes('-'))
                    this.value = this.value.substr(1, this.value.length - 1);
                  else
                    this.value = '-' + this.value;
                }
                $this.val(this.value);
                e.preventDefault();
                return;
              }

	    				// Webkit (Chrome & Safari) on windows screws up the keyIdentifier detection
	    				// for numpad characters. I've disabled this for now, because while keyCode munging
	    				// below is hackish and ugly, it actually works cross browser & platform.

//	    				if( typeof e.originalEvent.keyIdentifier !== 'undefined' )
//	    				{
//	    					chara = unescape(e.originalEvent.keyIdentifier.replace('U+','%u'));
//	    				}
//	    				else
//	    				{
	    					if (_keydown.codes.hasOwnProperty(code)) {
					            code = _keydown.codes[code];
					        }
					        if (!e.shiftKey && (code >= 65 && code <= 90)){
					        	code += 32;
					        } else if (!e.shiftKey && (code >= 69 && code <= 105)){
					        	code -= 48;
					        } else if (e.shiftKey && _keydown.shifts.hasOwnProperty(code)){
					            //get shifted keyCode value
					            chara = _keydown.shifts[code];
					        }

					        if( chara == '' ) chara = String.fromCharCode(code);
//	    				}



	    				// Stop executing if the user didn't type a number key, a decimal character, or backspace.
	    				if( code !== 8 && chara != dec_point && !chara.match(/[0-9]/) )
	    				{
	    					// We need the original keycode now...
	    					var key = (e.keyCode ? e.keyCode : e.which);
	    					if( // Allow control keys to go through... (delete, etc)
	    						key == 46 || key == 8 || key == 9 || key == 27 || key == 13 ||
	    						// Allow: Ctrl+A, Ctrl+R
	    						( (key == 65 || key == 82 ) && ( e.ctrlKey || e.metaKey ) === true ) ||
	    						// Allow: Ctrl+V, Ctrl+C
	    						( (key == 86 || key == 67 ) && ( e.ctrlKey || e.metaKey ) === true ) ||
	    						// Allow: home, end, left, right
	    						( (key >= 35 && key <= 39) )
							){
								return;
							}
							// But prevent all other keys.
							e.preventDefault();
							return false;
	    				}

	    				// The whole lot has been selected, or if the field is empty...
	    				if( start == 0 && end == this.value.length || $this.val() == 0 )
	    				{
	    					if( code === 8 )
	    					{
		    					// Blank out the field, but only if the data object has already been instanciated.
	    						start = end = 1;
	    						this.value = '';

	    						// Reset the cursor position.
		    					data.init = (decimals>0?-1:0);
		    					data.c = (decimals>0?-(decimals+1):0);
		    					setSelectionRange.apply(this, [0,0]);
		    				}
		    				else if( chara === dec_point )
		    				{
		    					start = end = 1;
		    					this.value = '0'+ dec_point + (new Array(decimals+1).join('0'));

		    					// Reset the cursor position.
		    					data.init = (decimals>0?1:0);
		    					data.c = (decimals>0?-(decimals+1):0);
		    				}
		    				else if( this.value.length === 0 )
		    				{
		    					// Reset the cursor position.
		    					data.init = (decimals>0?-1:0);
		    					data.c = (decimals>0?-(decimals):0);
		    				}
	    				}

	    				// Otherwise, we need to reset the caret position
	    				// based on the users selection.
	    				else
	    				{
	    					data.c = end-this.value.length;
	    				}

	    				// If the start position is before the decimal point,
	    				// and the user has typed a decimal point, we need to move the caret
	    				// past the decimal place.
	    				if( decimals > 0 && chara == dec_point && start == this.value.length-decimals-1 )
	    				{
	    					data.c++;
	    					data.init = Math.max(0,data.init);
	    					e.preventDefault();

	    					// Set the selection position.
	    					setPos = this.value.length+data.c;
	    				}

	    				// If the user is just typing the decimal place,
	    				// we simply ignore it.
	    				else if( chara == dec_point )
	    				{
	    					data.init = Math.max(0,data.init);
	    					e.preventDefault();
	    				}

	    				// If hitting the delete key, and the cursor is behind a decimal place,
	    				// we simply move the cursor to the other side of the decimal place.
	    				else if( decimals > 0 && code == 8 && start == this.value.length-decimals )
	    				{
	    					e.preventDefault();
	    					data.c--;

	    					// Set the selection position.
	    					setPos = this.value.length+data.c;
	    				}

	    				// If hitting the delete key, and the cursor is to the right of the decimal
	    				// (but not directly to the right) we replace the character preceeding the
	    				// caret with a 0.
	    				else if( decimals > 0 && code == 8 && start > this.value.length-decimals )
	    				{
	    					if( this.value === '' ) return;

	    					// If the character preceeding is not already a 0,
	    					// replace it with one.
	    					if( this.value.slice(start-1, start) != '0' )
	    					{
	    						val = this.value.slice(0, start-1) + '0' + this.value.slice(start);
	    						$this.val(val.replace(regex_dec_num,'').replace(regex_dec,dec_point));
	    					}

	    					e.preventDefault();
	    					data.c--;

	    					// Set the selection position.
	    					setPos = this.value.length+data.c;
	    				}

	    				// If the delete key was pressed, and the character immediately
	    				// before the caret is a thousands_separator character, simply
	    				// step over it.
	    				else if( code == 8 && this.value.slice(start-1, start) == thousands_sep )
	    				{
	    					e.preventDefault();
	    					data.c--;

	    					// Set the selection position.
	    					setPos = this.value.length+data.c;
	    				}

	    				// If the caret is to the right of the decimal place, and the user is entering a
	    				// number, remove the following character before putting in the new one.
	    				else if(
	    					decimals > 0 &&
	    					start == end &&
	    					this.value.length > decimals+1 &&
	    					start > this.value.length-decimals-1 && isFinite(+chara) &&
		    				!e.metaKey && !e.ctrlKey && !e.altKey && chara.length === 1
	    				)
	    				{
	    					// If the character preceeding is not already a 0,
	    					// replace it with one.
	    					if( end === this.value.length )
	    					{
	    						val = this.value.slice(0, start-1);
	    					}
	    					else
	    					{
	    						val = this.value.slice(0, start)+this.value.slice(start+1);
	    					}

	    					// Reset the position.
	    					this.value = val;
	    					setPos = start;
	    				}

	    				if (setPos === false && code === 44 && chara === dec_point)
	    					setPos = this.value.indexOf(dec_point) + 1;

	    				// If we need to re-position the characters.
	    				if( setPos !== false )
	    				{
	    					setSelectionRange.apply(this, [setPos, setPos]);
	    				}

	    				// Store the data on the element.
	    				$this.data('numFormat', data);

	    			},

	    			/**
	    			 * Handles keyup events, re-formatting numbers.
	    			 *
	    			 * @param object e			: the keyup event object.s
	    			 *
	    			 * @return void;
	    			 */
	    			'keyup.format' : function(e){

	    				// Store these variables for use below.
	    				var $this	= $(this),
	    					data	= $this.data('numFormat'),
	    					code	= (e.keyCode ? e.keyCode : e.which),
	    					start	= getSelection.apply(this,['start']),
	    					setPos;

	    				// Stop executing if the user didn't type a number key, a decimal, or a comma.
	    				if( this.value === '' || (code < 48 || code > 57) && (code < 96 || code > 105 ) && code !== 8 )
	    				  return;

	    				// Re-format the textarea.
	    				$this.val($this.val());

	    				if( decimals > 0 )
	    				{
		    				// If we haven't marked this item as 'initialised'
		    				// then do so now. It means we should place the caret just
		    				// before the decimal. This will never be un-initialised before
		    				// the decimal character itself is entered.
		    				if( data.init < 1 )
		    				{
		    					start		= this.value.length-decimals-( data.init < 0 ? 1 : 0 );
		    					data.c		= start-this.value.length;
		    					data.init	= 1;

		    					$this.data('numFormat', data);
		    				}

		    				// Increase the cursor position if the caret is to the right
		    				// of the decimal place, and the character pressed isn't the delete key.
		    				else if( start > this.value.length-decimals && code != 8 )
		    				{
		    					data.c++;

		    					// Store the data, now that it's changed.
		    					$this.data('numFormat', data);
		    				}
	    				}

	    				//console.log( 'Setting pos: ', start, decimals, this.value.length + data.c, this.value.length, data.c );

	    				// Set the selection position.
	    				setPos = this.value.length+data.c;
	    				if (((this.value.length - setPos) === data.decimals) && (String.fromCharCode(code) !== data.dec_point)) {
                setPos -= 1;
                console.log('set pos', data.dec_point, code, String.fromCharCode(code));
              }
	    				setSelectionRange.apply(this, [setPos, setPos]);
	    			},

	    			/**
	    			 * Reformat when pasting into the field.
	    			 *
	    			 * @param object e 		: jQuery event object.
	    			 *
	    			 * @return false : prevent default action.
	    			 */
	    			'paste.format' : function(e){

	    				// Defint $this. It's used twice!.
	    				var $this		= $(this),
	    					original	= e.originalEvent,
	    					val		= null;

						// Get the text content stream.
						if (window.clipboardData && window.clipboardData.getData) { // IE
							val = window.clipboardData.getData('Text');
						} else if (original.clipboardData && original.clipboardData.getData) {
							val = original.clipboardData.getData('text/plain');
						}

	    				// Do the reformat operation.
	    				$this.val(val);

	    				// Stop the actual content from being pasted.
	    				e.preventDefault();
	    				return false;
	    			}

	    		})

	    		// Loop each element (which isn't blank) and do the format.
    			.each(function(){

    				var $this = $(this).data('numFormat',{
    					c				: -(decimals+1),
    					decimals		: decimals,
    					thousands_sep	: thousands_sep,
    					dec_point		: dec_point,
    					regex_dec_num	: regex_dec_num,
    					regex_dec		: regex_dec,
    					init			: false
    				});

    				// Return if the element is empty.
    				if( this.value === '' ) return;

    				// Otherwise... format!!
    				$this.val($this.val());
    			});
	    	}
	    	else
	    	{
		    	// return the collection.
		    	return this.each(function(){
		    		var $this = $(this), num = +$this.text().replace(regex_dec_num,'').replace(regex_dec,'.');
		    		$this.number( !isFinite(num) ? 0 : +num, decimals, dec_point, thousands_sep );
		    	});
	    	}
	    }

	    // Add this number to the element as text.
	    return this.text( $.number.apply(window,arguments) );
	};

	//
	// Create .val() hooks to get and set formatted numbers in inputs.
	//

	// We check if any hooks already exist, and cache
	// them in case we need to re-use them later on.
	var origHookGet = null, origHookSet = null;

	// Check if a text valHook already exists.
	if( $.isPlainObject( $.valHooks.text ) )
	{
	    // Preserve the original valhook function
	    // we'll call this for values we're not
	    // explicitly handling.
	    if( $.isFunction( $.valHooks.text.get ) ) origHookGet = $.valHooks.text.get;
	    if( $.isFunction( $.valHooks.text.set ) ) origHookSet = $.valHooks.text.set;
	}
	else
	{
	    // Define an object for the new valhook.
	    $.valHooks.text = {};
	}

	/**
	 * Define the valHook to return normalised field data against an input
	 * which has been tagged by the number formatter.
	 *
	 * @param object el			: The raw DOM element that we're getting the value from.
	 *
	 * @return mixed : Returns the value that was written to the element as a
	 *				   javascript number, or undefined to let jQuery handle it normally.
	 */
	$.valHooks.text.get = function( el ){

		// Get the element, and its data.
		var $this	= $(el), num,
			data	= $this.data('numFormat');

        // Does this element have our data field?
        if( !data )
        {
            // Check if the valhook function already existed
            if( $.isFunction( origHookGet ) )
            {
                // There was, so go ahead and call it
                return origHookGet(el);
            }
            else
            {
                // No previous function, return undefined to have jQuery
                // take care of retrieving the value
                return undefined;
			}
		}
		else
		{
			// Remove formatting, and return as number.
			if( el.value === '' ) return '';

			// Convert to a number.
			num = +(el.value
				.replace( data.regex_dec_num, '' )
				.replace( data.regex_dec, '.' ));

			// If we've got a finite number, return it.
			// Otherwise, simply return 0.
			// Return as a string... thats what we're
			// used to with .val()
			return ''+( isFinite( num ) ? num : 0 );
		}
	};

	/**
	 * A valhook which formats a number when run against an input
	 * which has been tagged by the number formatter.
	 *
	 * @param object el		: The raw DOM element (input element).
	 * @param float			: The number to set into the value field.
	 *
	 * @return mixed : Returns the value that was written to the element,
	 *				   or undefined to let jQuery handle it normally.
	 */
	$.valHooks.text.set = function( el, val )
	{
		// Get the element, and its data.
		var $this	= $(el),
			data	= $this.data('numFormat');

		// Does this element have our data field?
		if( !data )
		{

		    // Check if the valhook function already exists
		    if( $.isFunction( origHookSet ) )
		    {
		        // There was, so go ahead and call it
		        return origHookSet(el,val);
		    }
		    else
		    {
		        // No previous function, return undefined to have jQuery
		        // take care of retrieving the value
		        return undefined;
			}
		}
		else
		{
			// Otherwise, don't worry about other valhooks, just run ours.
			return el.value = $.number( val, data.decimals, data.dec_point, data.thousands_sep );
		}
	};

	/**
	 * The (modified) excellent number formatting method from PHPJS.org.
	 * http://phpjs.org/functions/number_format/
	 *
	 * @modified by Sam Sehnert (teamdf.com)
	 *	- don't redefine dec_point, thousands_sep... just overwrite with defaults.
	 *	- don't redefine decimals, just overwrite as numeric.
	 *	- Generate regex for normalizing pre-formatted numbers.
	 *
	 * @param float number			: The number you wish to format, or TRUE to use the text contents
	 *								  of the element as the number. Please note that this won't work for
	 *								  elements which have child nodes with text content.
	 * @param int decimals			: The number of decimal places that should be displayed. Defaults to 0.
	 * @param string dec_point		: The character to use as a decimal point. Defaults to '.'.
	 * @param string thousands_sep	: The character to use as a thousands separator. Defaults to ','.
	 *
	 * @return string : The formatted number as a string.
	 */
	$.number = function( number, decimals, dec_point, thousands_sep ){
		// Set the default values here, instead so we can use them in the replace below.
		thousands_sep	= (typeof thousands_sep === 'undefined') ? ',' : thousands_sep;
		dec_point		= (typeof dec_point === 'undefined') ? '.' : dec_point;
		decimals		= !isFinite(+decimals) ? 0 : Math.abs(decimals);

		// Work out the unicode representation for the decimal place and thousand sep.
		var u_dec = ('\\u'+('0000'+(dec_point.charCodeAt(0).toString(16))).slice(-4));
		var u_sep = ('\\u'+('0000'+(thousands_sep.charCodeAt(0).toString(16))).slice(-4));

		// Fix the number, so that it's an actual number.
		number = (number + '')
			.replace('\.', dec_point) // because the number if passed in as a float (having . as decimal point per definition) we need to replace this with the passed in decimal point character
			.replace(new RegExp(u_sep,'g'),'')
			.replace(new RegExp(u_dec,'g'),'.')
			.replace(new RegExp('[^0-9+\-Ee.]','g'),'');

		var n = !isFinite(+number) ? 0 : +number,
		    s = '',
		    toFixedFix = function (n, decimals) {
		        var k = Math.pow(10, decimals);
		        return '' + Math.round(n * k) / k;
		    };

		// Fix for IE parseFloat(0.55).toFixed(0) = 0;
		s = (decimals ? toFixedFix(n, decimals) : '' + Math.round(n)).split('.');
		if (s[0].length > 3) {
		    s[0] = s[0].replace(/\B(?=(?:\d{3})+(?!\d))/g, thousands_sep);
		}
		if ((s[1] || '').length < decimals) {
		    s[1] = s[1] || '';
		    s[1] += new Array(decimals - s[1].length + 1).join('0');
		}
		return s.join(dec_point);
	}

})(jQuery);

(function() {

  class Total {
    constructor($filter) {
      this.restrict = 'E';
      this.scope = false;
      this.replace = true;
      this.$filter = $filter;
    }

    template(el, attrs) {
      if (attrs.expr[0] === "'")
        return `<span>${ attrs.expr.substring(1, attrs.expr.length - 1) }</span>`;
      else
        return `<span ng-bind="total$${attrs.field}|number:2"></span>`;
    }

    link(scope, element, attrs, controller) {
      if (attrs.expr[0] !== "'")
        scope.$watch(`records`, (newValue) => {
          let total = 0;
          newValue.map((r) => total += parseFloat(r[attrs.field]));
          scope['total$' + attrs.field] = total;
          scope.parent['total$' + scope.fieldName + '$' + attrs.field] = total;
        });
    }
  }

  Katrid.ui.uiKatrid.directive('ngTotal', ['$filter', Total]);

})();

(function() {

  class Dashboard extends Katrid.ui.Views.ClientView {
    get templateUrl() {
      return 'view.dashboard';
    }
  }

  class DashboardComponent extends Katrid.ui.Widgets.Component {
    constructor($compile) {
      super();
      this.$compile = $compile;
      this.restrict = 'E';
      this.scope = false;
    }

    async link(scope, el, attrs, controller) {
      let dashboardId = attrs.dashboardId;
      let model = new Katrid.Services.Model('ir.dashboard.settings');
      let res = await model.search({ dashboard_id: dashboardId });
      if (res.data) {
        let content = res.data[0].content;
        content = this.$compile(content)(scope);
        el.append(content);
      }
    }
  }

  class Chart extends Katrid.ui.Widgets.Component {
    constructor() {
      super();
      this.replace = true;
      this.template = '<div></div>';
    }

    async link(scope, el, attrs) {
      let res, chart;

      let observe = async () => {
        if (_.isUndefined(attrs.url))
          res = await Katrid.Services.Query.read(attrs.queryId);
        else
          res = await $.ajax({
            url: attrs.url,
            type: 'get',
          });

        if (chart)
          chart.destroy();

        chart = c3.generate({
          bindto: el[0],
          data: {
            type: 'donut',
            columns: res.data
          }
        });
      };

      observe();
      attrs.$observe('url', observe);

    }
  }

  class Query extends Katrid.ui.Widgets.Component {
    constructor() {
      super();
      this.scope = false;
    }
    link(scope, el, attrs) {
      if (!attrs.name)
        throw Error('Query name attribute is required!');
      let r;
      if (_.isUndefined(attrs.url))
        r = Katrid.Services.Query.read(attrs.id);
      else
        r = $.get(attrs.url);
      r.then(res => {
        let data = res.data.map((row) => (_.object(res.fields, row)));
        scope.$apply(() => scope[attrs.name] = data);
      });
      el.remove();
    }
  }

  Katrid.Actions.ClientAction.register('dashboard', Dashboard);

  Katrid.ui.uiKatrid.directive('dashboard', ['$compile', DashboardComponent]);
  Katrid.ui.uiKatrid.directive('chart', Chart);
  Katrid.ui.uiKatrid.directive('query', Query);

})();

(function() {

  class Telegram {
    static async export(report, format) {
      let templ = Katrid.app.$templateCache.get('reportbot.dialog.contacts');
      let modal = $(templ);
      $('body').append(modal);

      let sel = modal.find('#id-reportbot-select-contacts');
      let partners = new Katrid.Services.Model('res.partner');
      let res = await partners.post('get_telegram_contacts');
      if (res) {
        if (res)
          res.map(c => sel.append(`<option value="${ c[0] }">${ c[1] }</option>`));
        sel.select2();
      }
      modal.find('#id-btn-ok').click(async () => {

        let svc = new Katrid.Services.Model('telegram.pending');
        format = 'pdf';
        const params = report.getUserParams();
        let res = svc.post('export_report', { args: [report.info.id], kwargs: { contacts: sel.val(), format, params } });
        if (res.ok) console.log('ok');
      });
      modal.modal();
      return true;

    }
  }

  Katrid.Reports.Telegram = Telegram;
})();

//# sourceMappingURL=katrid.full.js.map