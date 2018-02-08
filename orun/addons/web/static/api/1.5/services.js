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

    post(name, params, data) {
      // Check if protocol is socket.io
      if (Katrid.Settings.servicesProtocol === 'io') {
        const def = requestManager.request();
        Katrid.socketio.emit('api', {
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
        return $.ajax({
          method: 'POST',
          url: rpcName,
          data: JSON.stringify(data),
          contentType: "application/json; charset=utf-8",
          dataType: 'json'
        });
      }
    }
  }


  class Model extends Service {
    searchName(name) {
      return this.post('search_name', {name});
    }

    createName(name, context) {
      let kwargs = {name};
      if (!_.isUndefined(context)) kwargs.context = context;
      return this.post('create_name', null, { kwargs: kwargs });
    }

    search(data, params) {
      data = {kwargs: data};
      return this.post('search', params, data);
    }

    destroy(id) {
      return this.post('destroy', null, {kwargs: {ids: [id]}});
    }

    getById(id) {
      return this.post('get', null, {kwargs: {id}});
    }

    getDefaults(context) {
      return this.post('get_defaults', null, {kwargs: {context}});
    }

    copy(id) {
      return this.post('copy', null, {args: [id]});
    }

    static _prepareFields(view) {
      if (view.fields)
        for (let f of Object.values(view.fields))
          // Add field display choices object
          if (f.choices) f.displayChoices = _.object(f.choices);
    }

    fieldChange(methName, values) {
      return this.post(methName, null);
    }

    getViewInfo(data) {
      return this.post('get_view_info', null, {kwargs: data})
      .done(res => this.constructor._prepareFields(res.result) );
    }

    loadViews(data) {
      return this.post('load_views', null, {kwargs: data})
      .done(res => Object.values(res.result.views).map(this.constructor._prepareFields));
    }

    getFieldsInfo(data) {
      return this.post('get_fields_info', null, {kwargs: data})
      .done(res => {
        return this.constructor._prepareFields(res.result);
      })
    }

    getFieldChoices(field, term) {
      return this.get('get_field_choices', {args: field, q: term});
    }

    doViewAction(data) {
      return this.post('do_view_action', null, {kwargs: data});
    }

    write(data, params) {
      return this.post('write', params, {kwargs: {data}})
      .done(() => Katrid.Dialogs.Alerts.success(Katrid.i18n.gettext('Record saved successfully.'))).fail(function (res) {
        if ((res.status === 500) && res.responseText) {
          return alert(res.responseText);
        } else {
          return Katrid.Dialogs.Alerts.error(Katrid.i18n.gettext('Error saving record changes'));
        }
      });
    }

    groupBy(grouping) {
      return this.post('group_by', null, {kwargs: grouping});
    }

    autoReport() {
      return this.post('auto_report', null, {kwargs: {}});
    }

    rpc(meth, ...args) {
      return this.post(meth, null, {args: args});
    }
  }

  class Data extends Service {
    static get url() { return '/web/data/' };

    reorder(model, ids, field='sequence', offset=0) {
      return this.post('reorder', null, { args: [ model, ids, field, offset ] });
    }
  }

  class Attachments {
    static upload(file, scope=null) {
      let data = new FormData();
      if (scope === null) scope = angular.element(file).scope().$parent;
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



  this.Katrid.Services = {
    Data,
    View,
    data: new Data('', ),
    Attachments,
    Service,
    Model
  };

  this.Katrid.Services.upload
}).call(this);
