
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

  Katrid.socketio.on('api', function(data) {
    if (_.isString(data)) {
      data = JSON.parse(data);
    }
    const def = requestManager.requests[data['req-id']];
    return def.resolve(data);
  });
}


class Service {
  constructor(name) {
    this.name = name;
  }

  delete(name, params, data) {}
  get(name, params) {
    if (Katrid.Settings.servicesProtocol === 'ws') {
      // Using websocket protocol
      return Katrid.socketio.emit('api', { channel: 'rpc', service: this.name, method: name, data, args: params });
    } else {
      // Using http/https protocol
      const rpcName = Katrid.Settings.server + '/api/rpc/' + this.name + '/' + name + '/';
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
      let rpcName = Katrid.Settings.server + '/api/rpc/' + this.name + '/' + name + '/';
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
    return this.post('search_name', { name });
  }

  createName(name) {
    return this.post('create_name', null, { kwargs: { name } });
  }

  search(data, params) {
    data = { kwargs: data };
    return this.post('search', params, data);
  }

  destroy(id) {
    return this.post('destroy', null, { kwargs: { ids: [id] } });
  }

  getById(id) {
    return this.post('get', null, { kwargs: { id } });
  }

  getDefaults(context) {
    return this.post('get_defaults', null, { kwargs: { context } });
  }

  copy(id) {
    return this.post('copy', null, { args: [id] });
  }

  _prepareFields(view) {
    return (() => {
      const result = [];
      for (let f in view.fields) {
      // Add field display choices object
        const v = view.fields[f];
        if (v.choices) {
          result.push(v.displayChoices = _.object(v.choices));
        } else {
          result.push(undefined);
        }
      }
      return result;
    })();
  }

  fieldChange(methName, values) {
    return this.post(methName, null );
  }

  getViewInfo(data) {
    return this.post('get_view_info', null, { kwargs: data })
    .done(res => {
      return this._prepareFields(res.result);
    });
  }

  loadViews(data) {
    return this.post('load_views', null, { kwargs: data })
    .done(res => {
      return (() => {
        const result = [];
        for (let view in res.result) {
          const obj = res.result[view];
          result.push(this._prepareFields(obj));
        }
        return result;
      })();
    });
  }

  getFieldChoices(field, term) {
    console.log('get field choices', field, term);
    return this.get('get_field_choices', { args: field, q: term });
  }

  doViewAction(data) {
    return this.post('do_view_action', null, { kwargs: data });
  }

  write(data, params) {
    return this.post('write', params, { kwargs: { data } })
    .done(() => Katrid.Dialogs.Alerts.success(Katrid.i18n.gettext('Record saved successfully.'))).fail(function(res) {
      if ((res.status === 500) && res.responseText) {
        return alert(res.responseText);
      } else {
        return Katrid.Dialogs.Alerts.error(Katrid.i18n.gettext('Error saving record changes'));
      }
    });
  }

  groupBy(grouping) {
    return this.post('group_by', null, { kwargs: grouping });
  }

  autoReport() {
    return this.post('auto_report', null, { kwargs: {} });
  }
}


this.Katrid.Services = {
  Service,
  Model
};