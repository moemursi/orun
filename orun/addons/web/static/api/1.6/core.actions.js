(function () {


  class ActionManager {
    static initClass() {
    }

    constructor() {
      this.actions = [];
      this.mainAction = null;
    }

    addAction(action) {
      if (!this.mainAction)
        this.mainAction = action;
      this.actions.push(action);
    }

    removeAction(action) {
      this.actions.splice(this.actions.indexOf(action), this.actions.length);
    }

    get action() {
      return this.actions[this.actions.length-1];
    }
    set action(v) {
      this.actions.splice(this.actions.indexOf(action) + 1, this.actions.length);
    }

    clear() {
      this.actions = [];
      this.mainAction = null;
    }

    get path() {
      return this.action.path;
    }
  }

  class Action {
    static initClass() {
      this.history = [];
      this.actionType = null;
    }
    constructor(info, scope, location) {
      Katrid.Actions.actionManager.addAction(this);
      this.info = info;
      this.scope = scope;
      this.location = location;
      this.currentUrl = {
        path: this.location.$$path,
        params: this.location.$$search
      };
    }

    getContext() {
      let ctx;
      if (_.isString(this.info.context))
        ctx = JSON.parse(this.info.context);
      if (!ctx)
        ctx = {};
      ctx['params'] = this.location.$$search;
      return ctx;
    }

    doAction(act) {
      let type = act.type || act.action_type;
      return Katrid.Actions[type].dispatchAction(this, act);
    }

    openObject(service, id, evt) {
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
      if ((index === 0) && (Action.history.length === 1) && (viewType === 0 || Katrid.UI.Views.searchModes.includes(viewType)))
        return this.restore(viewType);

      let h, location;
      if (index === -1) {
        h = Action.history[0];
        if (h.backUrl) location = h.backUrl;
        else location = h.currentUrl;
      } else {
        h = Action.history[index];
        location = h.currentUrl;
        Action.history.splice(index + 1);
      }
      const { path } = location;
      const params = location.search;
      if (viewType) params['view_type'] = viewType;
      h.info.__cached = true;
      return this.location.path(path, true, h.info).search(params);
    }
    execute() {}
    getCurrentTitle() {
      return this.info.display_name;
    }
    search() {
      if (!this.isDialog) {
        console.log(arguments);
        return this.location.search.apply(null, arguments);
      }
    }
  }
  Action.initClass();


  class WindowAction extends Action {
    static initClass() {
      this.actionType = 'ir.action.window';
    }
    constructor(info, scope, location) {
      super(info, scope, location);
      this.notifyFields = [];
      this.viewMode = info.view_mode;
      this.viewModes = this.viewMode.split(',');
      this.viewType = null;
      this.selectionLength = 0;
      this._cachedViews = {};
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
      if (viewType === 0 && this.lastViewType) viewType = this.lastViewType;
      this.setViewType(viewType);
    }

    registerFieldNotify(field) {
      // Add field to notification list
      if (this.notifyFields.indexOf(field.name) === -1) {
        this.scope.$watch(`record.${field.name}`, () => console.log('field changed', field));
        return this.notifyFields.push(fields);
      }
    }

    getCurrentTitle() {
      if (this.viewType === 'form') {
        return this.scope.record.display_name;
      }
      return super.getCurrentTitle();
    }

    createNew() {
      Katrid.Dialogs.WaitDialog.show();
      this.setViewType('form');
      setTimeout(() => {
        this.scope.dataSource.insert();
      }, 10);
    }

    deleteSelection() {
      let sel = this.selection;
      if (
        ((sel.length === 1) && confirm(Katrid.i18n.gettext('Confirm delete record?'))) ||
        ((sel.length > 1) && confirm(Katrid.i18n.gettext('Confirm delete records?')))
      ) {
        this.scope.model.destroy(sel);
        const i = this.scope.records.indexOf(this.scope.record);
        this.setViewType('list');
        this.scope.dataSource.refresh();
      }
    }

    copy() {
      this.setViewType('form');
      this.scope.dataSource.copy(this.scope.record.id);
      return false;
    }

    routeUpdate(search) {
      const viewType = search.view_type;

      if (viewType != null) {
        if ((this.scope.records == null)) {
          this.scope.records = [];
        }
        if (this.viewType !== viewType) {
          this.scope.dataSource.pageIndex = null;
          this.scope.record = Katrid.Data.createRecord({}, this.scope);
          this.viewType = viewType;
          let r = this.execute();
          if (_.isObject(r))
            return r.done(() => this.routeUpdate(this.location.$$search));
        }

        if (!this.scope.view) return;

        if (Katrid.UI.Views.searchModes.includes(search.view_type) && (search.page !== this.scope.dataSource.pageIndex)) {
          const filter = this.searchParams || {};
          const fields = Object.keys(this.scope.view.fields);
          this.scope.dataSource.pageIndex = parseInt(search.page);
          this.scope.dataSource.limit = parseInt(search.limit || this.info.limit);
          this.scope.dataSource.search(filter, search.page || 1, fields);
        } else if (search.id && (((this.scope.record != null) && (this.scope.record.id !== search.id)) || (this.scope.record == null))) {
          this.scope.record = null;
          this.scope.dataSource.get(search.id);
        }

        if (search.page == null) {
          this.location.search('page', 1);
          this.location.search('limit', this.info.limit);
        }


      } else {
        this.setViewType(this.viewModes[0]);
      }
      this.currentUrl = {
        url: this.location.$$url,
        path: this.location.$$path,
        search: this.location.$$search
      };
      if (search.title) this.info.display_name = search.title;
    }

    setViewType(viewType) {
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

    apply() {
      // this.render(this.scope, this.scope.view.content, this.viewType);
      let viewCls = Katrid.UI.Views[this.viewType];
      let view = new viewCls(this.scope, this.scope.view.content);
      let cache;// TODO cache
      if (!cache) cache = this._cachedViews[this.viewType] = view.render();
      Katrid.core.setContent(cache, this.scope);
      if (Katrid.UI.Views.searchModes.includes(this.viewType)) this.lastViewType = this.viewType;
      // return this.routeUpdate(this.location.$$search);
    }

    execute() {
      if (this.views != null) {
        this.scope.view = this.views[this.viewType];
        this.apply();
        return true;
      } else {
        return this.scope.model.loadViews({
          views: this.info.views,
          action: this.info.id,
          toolbar: true
        })
        .done(res => {
          this.fields = res.fields;
          const views = res.views;
          this.views = views;
          let viewType = this.viewType;
          this.scope.$apply(() => {
            this.scope.views = views;
            this.scope.view = views[viewType];
            this.apply();
          });
        });
      }
    }


    render(scope, html, viewType) {
      if (!this.isDialog) {
        html = Katrid.UI.Utils.Templates[`preRender_${viewType}`](scope, html);
      }
      return Katrid.core.setContent(html, this.scope);
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
      return this.scope.dataSource.search(params);
    }

    applyGroups(groups) {
      return this.scope.dataSource.groupBy(groups[0]);
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
        return scope.model.doViewAction({ action_name: viewAction, target, prompt: promptValue })
        .done(function(res) {
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

    doBindingAction(evt) {
      this.selection;
      Katrid.Services.Actions.load($(evt.currentTarget).data('id'))
      .done(action => {

        if (action.action_type === 'ir.action.report')
          ReportAction.dispatchBindingAction(this, action);

      });
    }

    listRowClick(index, row, evt) {
      const search = {
        view_type: 'form',
        id: row.id
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
          this.scope.dataSource.expandGroup(index, row);
        } else {
          this.scope.dataSource.collapseGroup(index, row);
        }
      } else {
        this.scope.dataSource.recordIndex = index;
        this.location.search(search);
      }
    }

    autoReport() {
      return this.scope.model.autoReport()
      .done(function(res) {
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


  class ReportAction extends Action {
    static initClass() {
      this.actionType = 'ir.action.report';
    }

    static dispatchBindingAction(parent, action) {
      let format = localStorage.katridReportViewer || 'pdf';
      let sel = parent.selection;
      if (sel)
        sel = sel.join(',');
      let params = { data: [{ name: 'id', value: sel }] };
      const svc = new Katrid.Services.Model('ir.action.report');
      return svc.post('export_report', { args: [action.id], kwargs: { format, params } })
      .done(res => {
        if (res.open)
          return window.open(res.open);
      });
    }

    constructor(info, scope, location) {
      super(info, scope, location);
      this.userReport = {};
    }

    userReportChanged(report) {
      return this.location.search({
        user_report: report});
    }

    routeUpdate(search) {
      this.userReport.id = search.user_report;
      if (this.userReport.id) {
        const svc = new Katrid.Services.Model('ir.action.report');
        svc.post('load_user_report', { kwargs: { user_report: this.userReport.id } })
        .done(res => {
          this.userReport.params = res.result;
          return Katrid.core.setContent(this.info.content, this.scope);
        });
      } else {
        Katrid.core.setContent(Katrid.Reports.Reports.renderDialog(this), this.scope);
      }
    }
  }
  ReportAction.initClass();


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


  class ClientAction extends Action {
    static initClass() {
      this.actionType = 'ir.action.client';
      this.registry = {};
      this.register('refresh', 'tag_refresh');
    }

    static register(tag, obj) {
      this.registry[tag] = obj;
    }

    static dispatchAction(parent, act) {
      // get action
      let action = this.registry[act.tag];
      if (action.prototype instanceof Katrid.UI.Views.ActionView) {
        action = new action(parent.scope);
        action.renderTo(parent);
      }
      else console.log('is a function');
    }

    constructor(info, scope, location) {
      super(info, scope, location);
      this.info = info;
      this.scope = scope;
      this.location = location;
    }
    tag_refresh() {
      this.scope.dataSource.refresh();
    }

    execute() {
      let tag = ClientAction.registry[this.info.tag];
      if (tag.prototype instanceof Katrid.UI.Views.ActionView) {
        tag = new tag(this.scope);
        tag.renderTo();
      } else if (_.isString(tag)) this[tag].apply(this);
    }

    routeUpdate(location) {
      this.execute();
    }
  }
  ClientAction.initClass();


  this.Katrid.Actions = {
    Action,
    WindowAction,
    ReportAction,
    ViewAction,
    UrlAction,
    ClientAction
  };

  this.Katrid.Actions.ActionManager = ActionManager;
  this.Katrid.Actions.actionManager = new ActionManager();
  this.Katrid.Actions[WindowAction.actionType] = WindowAction;
  this.Katrid.Actions[ReportAction.actionType] = ReportAction;
  this.Katrid.Actions[ViewAction.actionType] = ViewAction;
  this.Katrid.Actions[UrlAction.actionType] = UrlAction;
  this.Katrid.Actions[ClientAction.actionType] = ClientAction;

})();
