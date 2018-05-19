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
    console.log('socketio defined');
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
      var me = this;
      // return new Proxy(this, {
      //   get(target, name, receiver) {
      //     if (Reflect.has(target, name)) return Reflect.get(target, name, receiver);
      //     if (name !== 'toJSON') {
      //       // RPC
      //       return function (...args) {
      //         let data = {};
      //         if (_.isObject(args[0])) data['kwargs'] = args[0];
      //         me.post(name, null, data)
      //         .done((res) => {
      //           scope.$apply(() => {
      //             if (res.ok && res.result) {
      //               if (res.result.values) {
      //                 for (let attr of Object.keys(res.result.values)) scope.$set(attr, res.result.values[attr]);
      //               }
      //             }
      //           });
      //         });
      //       };
      //     }
      //   }
      // });
    }

    delete(name, params, data) {
    }

    get(name, params) {
      if (Katrid.Settings.servicesProtocol === 'ws') {
        // Using websocket protocol
        return Katrid.socketio.emit('api', {channel: 'rpc', service: this.name, method: name, data, args: params});
      } else {
        // Using http/https protocol
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
        let rpcName = Katrid.Settings.server + this.constructor.url + methName + 'call/';
        if (params) {
          rpcName += `?${$.param(params)}`;
        }
        let def = $.Deferred();
        $.ajax({
          method: 'POST',
          url: rpcName,
          data: JSON.stringify(data),
          contentType: "application/json; charset=utf-8",
          dataType: 'json'
        })
        .done(res => {
          if (res.error)
            def.reject(res.error);
          else
            def.resolve(res.result);
        })
        .fail(res => def.reject(res));
        return def;
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
      return this.post('destroy', { kwargs: {ids: [id]} });
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
        Object.values(res.views).map(v => v.fields = Katrid.Data.Fields.Field.fromArray(v.fields));
        Object.keys(res.views).map(k => res.views[k] = new Katrid.Data.View(res.views[k]));
      }
    }

    fieldChange(methName, values) {
      return this.post(methName, null);
    }

    getViewInfo(data) {
      return this.post('get_view_info', { kwargs: data })
      .done(this.constructor._prepareFields);
    }

    loadViews(data) {
      return this.post('load_views', { kwargs: data })
      .done(this.constructor._prepareFields);
    }

    getFieldsInfo(data) {
      return this.post('get_fields_info', { kwargs: data })
      .done(this.constructor._prepareFields);
    }

    getFieldChoices(field, term) {
      return this.post('get_field_choices', { args: [ field, term ]} );
    }

    doViewAction(data) {
      return this.post('do_view_action', { kwargs: data });
    }

    write(data, params) {
      return this.post('write', { kwargs: {data} }, params)
      .done(() => Katrid.Dialogs.Alerts.success(Katrid.i18n.gettext('Record saved successfully.')))
      .fail(res => {
        if ((res.status === 500) && res.responseText)
          return alert(res.responseText);
        else
          return Katrid.Dialogs.Alerts.error(Katrid.i18n.gettext('Error saving record changes'));
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



  this.Katrid.Services = {
    Data,
    View,
    data: new Data('', ),
    Attachments,
    Service,
    Model,
    Query,
    Actions
  };

})();
