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
  }

  class Action {
    static initClass() {
      this.actionType = null;
    }
    constructor(info, scope, location) {
      Katrid.Actions.actionManager.addAction(this);
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
      if (this._currentPath !==  this._unregisterHook && (Katrid.Actions.actionManager.length > 1))
        this._unregisterHook();

      // restore to query view
      let action = Katrid.Actions.actionManager[index];
      if ((index === 0) && (viewType === 0))
        return action.restore(action.searchViewType || action.viewModes[0]);
      else if ((index === 0) && (viewType === 'form'))
        return action.restore('form');

      Katrid.Actions.actionManager.action = action;

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


  class WindowAction extends Action {
    static initClass() {
      this.actionType = 'ir.action.window';
    }
    constructor(info, scope, location) {
      super(info, scope, location);
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
      if (Katrid.Actions.actionManager.length > 1) {
        console.log(this.info);
        params['actionId'] = this.info.id;
        this.$state.go('actionView', params);
        // this.location.path(url);
        // this.location.search(params);
      } else {
        this.setViewType(viewType);
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
      Katrid.Dialogs.WaitDialog.show();
      this.setViewType('form');
      setTimeout(() => {
        this.dataSource.insert();
      }, 10);
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
        this.setViewType('list');
        this.dataSource.refresh();
      }
    }

    copy() {
      this.setViewType('form');
      this.dataSource.copy(this.scope.record.id);
      return false;
    }

    async routeUpdate(search) {
      const viewType = this.viewType;
      let oldViewType = this._currentViewType;

      if (viewType != null) {
        if ((this.scope.records == null)) {
          this.scope.records = [];
        }
        if (this.viewType !== oldViewType) {
          console.log('change route', viewType);
          this.dataSource.pageIndex = null;
          this.dataSource.record = {};
          this.viewType = viewType;
          // let r = await this.execute();
          this._currentViewType = this.viewType;
          this.setViewType(viewType, search);
          //if (r !== true)
          //  return this.routeUpdate(this.location.$$search);
        }

        if (Katrid.UI.Views.searchModes.includes(this.viewType) && (search.page !== this.dataSource.pageIndex)) {
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
          this.location.search('limit', this.info.limit);
        }


      } else {
        // this.setViewType(this.viewType);
      }

      this._currentParams[this.viewType] = jQuery.extend({}, search);
      this._currentPath = this.location.$$path;

      if (search.title)
        this.info.display_name = search.title;

    }

    _setViewType(viewType) {
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
          let viewCls = Katrid.UI.Views[k];
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
      if (value === this._viewType)
        return;
      if (!this._viewType)
        this.searchViewType = this.viewModes[0];
      this.view = this.views[value];
      this._viewType = value;
    }

    setViewType(type, search) {
      this.viewType = type;
      if (!search)
        search = { view_type: type };
      this.location.search(search);
    }

    set view(value) {
      this._view = value;
      if (this.scope)
        this.scope.view = value;
    }

    get view() {
      return this._view;
    }

    get template() {
      if (!this._template)
        this.apply();
      return this._template;
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
      if (res.ok && res.result.type) {
        const act = new (Katrid.Actions[res.result.type])(res.result, this.scope, this.scope.location);
        act.execute();
      }
    };

    doBindingAction(evt) {
      this.selection;
      Katrid.Services.Actions.load($(evt.currentTarget).data('id'))
      .then(action => {

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
          this.dataSource.expandGroup(index, row);
        } else {
          this.dataSource.collapseGroup(index, row);
        }
      } else {
        this.dataSource.recordIndex = index;
        this.setViewType('form', search);
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
        if (this.dataSource.id)
          return [this.dataSource.id];
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


  class ReportAction extends Action {
    static initClass() {
      this.actionType = 'ir.action.report';
    }

    static async dispatchBindingAction(parent, action) {
      let format = localStorage.katridReportViewer || 'pdf';
      let sel = parent.selection;
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

    execute() {
      console.log(this.info, ClientAction.registry);
      let tag = ClientAction.registry[this.info.tag];
      if (tag.prototype instanceof Katrid.UI.Views.ClientView) {
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


  this.Katrid.Actions = {
    Action,
    WindowAction,
    ReportAction,
    ViewAction,
    UrlAction,
    ClientAction,
    ActionManager,
    actionManager: new ActionManager()
  };

  this.Katrid.Actions[WindowAction.actionType] = WindowAction;
  this.Katrid.Actions[ReportAction.actionType] = ReportAction;
  this.Katrid.Actions[ViewAction.actionType] = ViewAction;
  this.Katrid.Actions[UrlAction.actionType] = UrlAction;
  this.Katrid.Actions[ClientAction.actionType] = ClientAction;

})();
