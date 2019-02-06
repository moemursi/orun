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
              else {
                if (res.result) {
                  if (res.result.message)
                    Katrid.ui.Dialogs.Alerts.success(res.result.message);
                  else if (res.result.messages)
                    res.result.messages.forEach(function (msg) {
                      Katrid.ui.Dialogs.Alerts.success(msg);
                    });
                }
                resolve(res.result);
              }
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
      let url = `/web/file/upload/${scope.model.name}/${service}/`;
      if (scope.record && scope.record.id)
        url += `?id=${scope.record.id}`;
      $.ajax({
        url: url,
        data: form,
        processData: false,
        contentType: false,
        type: 'POST',
        success: (data) => {
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

