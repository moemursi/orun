
var Katrid = {};

(function() {

  class Application {
    constructor(opts) {
      Katrid.app = this;
      this.title = opts.title;
      this.plugins = ['ui.router', 'ui.katrid'];

      // initialize angular app (katrid module)
      this.ngApp = angular.module('katridApp', this.plugins)
      .run(['$templateCache', ($templateCache) => {
        this.$templateCache = $templateCache;
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
      }]);

      angular.element(function() {
        angular.bootstrap(document, ['katridApp']);
      });
    }

    async getTemplate(tpl) {
      return fetch(tpl)
      .then(async res => {
        let content = await res.text();
        this.$templateCache.put(tpl, content);
        return content;
      });
    }
  }

  Settings = {};

  Katrid.Core = { Application, Settings };
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
      let context = Katrid.Application.context;
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
      if (Katrid.Settings.servicesProtocol === 'io') {
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
        let rpcName = Katrid.Settings.server + this.constructor.url + methName + name + '/';
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

    getDefaults() {
      return this.post('get_defaults', {});
    }

    copy(id) {
      return this.post('copy', { args: [id] });
    }

    static _prepareFields(res) {
      if (res) {
        res.fields = Katrid.Data.Fields.Field.fromArray(res.fields);
        res.fieldList = Object.values(res.fields);
        Object.values(res.views).map(v => v.fields = Katrid.Data.Fields.Field.fromArray(v.fields));
        Object.keys(res.views).map(k => res.views[k] = new Katrid.Data.View(res.views[k]));
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
          Katrid.Dialogs.Alerts.success(Katrid.i18n.gettext('Record saved successfully.'));
          resolve(res);
        })
        .catch(res => {
          if ((res.status === 500) && res.responseText)
            alert(res.responseText);
          else
            Katrid.Dialogs.Alerts.error(Katrid.i18n.gettext('Error saving record changes'));
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
          Katrid.Dialogs.Alerts.success('Operação realizada com sucesso.')
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


(function() {

  class Field {
    constructor(info) {
      this._info = info;
      this.displayChoices = _.object(info.choices);
      this.template = {
        list: 'view.list.field.pug',
        form: 'view.form.field.pug',
      };
      if (this._info.listTemplate)
        this.template.list = this._info.listTemplate;
      if (this._info.formTemplate)
        this.template.form = this._info.formTemplate;
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

    fromJSON(value, dataSource) {
      dataSource.record[this.name] = value;
    }

    get onChange() {
      return this._info.onchange;
    }

    get hasChoices() {
      return this._info.choices && this._info.choices.length > 0;
    }

    get choices() {
      return this._info.choices;
    }

    get name() {
      return this._info.name;
    }

    get model() {
      return this._info.model;
    }

    get caption() {
      return this._info.caption;
    }

    get readonly() {
      return this._info.readonly;
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
        if (this.name === 'status')
          widget = 'StatusField';
        else if (this.hasChoices)
          widget = 'SelectionField';
      }
      let cls = Katrid.UI.Widgets[widget || this.type] || Katrid.UI.Widgets.StringField;
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
  }

  class BooleanField extends Field {
    get paramTemplate() {
      return 'view.param.Boolean';
    }
  }

  class DateField extends Field {
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
  }

  class DateTimeField extends DateField {
    get paramTemplate() {
      return 'view.param.DateTime';
    }
  }

  class NumericField extends Field {
    toJSON(val) {
      if (val && _.isString(val))
        return parseFloat(val);
      return val;
    }
  }

  class IntegerField extends Field {
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
  }

  class ForeignKey extends Field {
    toJSON(val) {
      if (_.isArray(val))
        return val[0];
      return val;
    }

    get domain() {
      return this._info.domain;
    }
  }

  class OneToManyField extends Field {
    get field() {
      return this._info.field;
    }

    fromJSON(val, dataSource) {
      if (val && val instanceof Array) {
        val.map((obj) => {
          if (obj.action === 'CREATE') {
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
    DateField,
    BooleanField,
  }


})();


(function() {

  Katrid.ui = {};
  Katrid.ui.uiKatrid = angular.module('ui.katrid', []);

})();

(function() {

  Katrid.ui.uiKatrid

  .directive('grid', ['$compile', function ($compile) {
    return {
      restrict: 'E',
      compile(el) {
        el = $(el);
        let views = {};
        for (let child of el.children())
          views[child.tagName.toLowerCase()] = { content: child, fields: {} };
        $(el).replaceWith('<div class="grid"></div>');
        return function (scope, el) {
          $(views.list).find('field').attr('list-field', 'list-field');
          // el.append($compile(views.list)(scope));
        }

      },
    }
  }])

  .directive('list', () => ({
    restrict: 'E',
    transclude: true,
    replace: true,
    template: '<table><tr ng-transclude></tr></table>',
  }))

  .directive('listField', ['$compile', ($compile) => ({
    restrict: 'A',
    replace: true,
    transclude: true,
    template: '<td ng-transclude></td>',
    compile(el, attrs) {
      let content = el.html();
      return async function(scope, el, attrs) {
        let fieldTemplate = await Katrid.app.getTemplate('../src/templates/view.list.field.td.pug');
        fieldTemplate = pug.compile(fieldTemplate)({name: attrs.name});
        el.replaceWith($compile(fieldTemplate)(scope));
        el.append(fieldContent);
      }
    }
  })]);

})();

//# sourceMappingURL=katrid.full.js.map