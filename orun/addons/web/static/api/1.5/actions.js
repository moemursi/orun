(function () {

  class Action {
    static initClass() {
      this.prototype.actionType = null;
    }
    constructor(info, scope, location) {
      this.info = info;
      this.scope = scope;
      this.location = location;
      this.currentUrl = {
        path: this.location.$$path,
        params: this.location.$$search
      };
      this.history = [];
      if (this.info._currentAction) {
        this.history.push(this.info._currentAction);
      }
    }

    openObject(service, id, evt, title) {
      evt.preventDefault();
      evt.stopPropagation();
      if (evt.ctrlKey) {
        window.open(evt.target.href);
        return false;
      }
      const url = `action/${ service }/view/`;
      this.location.path(url, this).search({
        view_type: 'form',
        id,
        title
      });
      return false;
    }

    apply() {}
    backTo(index) {
      let h, location;
      if (index === -1) {
        h = this.history[0];
        if (h.backUrl) {
          location = h.backUrl;
        } else {
          location = h.currentUrl;
        }
      } else {
        h = this.history[index];
        location = h.currentUrl;
      }
      const { path } = location;
      const params = location.search;
      return this.location.path(path, false, h)
      .search(params);
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
      this.actionType = 'sys.action.window';
    }
    constructor(info, scope, location) {
      super(info, scope, location);
      this.notifyFields = [];
      this.viewMode = info.view_mode;
      this.viewModes = this.viewMode.split(',');
      this.viewType = null;
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
      this.setViewType('form');
      return this.scope.dataSource.newRecord();
    }

    deleteSelection() {
      if (confirm(Katrid.i18n.gettext('Confirm delete record?'))) {
        this.scope.model.destroy(this.scope.record.id);
        const i = this.scope.records.indexOf(this.scope.record);
        if (i) {
          this.scope.dataSource.search({});
        }
        return this.setViewType('list');
      }
    }

    copy() {
      this.setViewType('form');
      this.scope.dataSource.copy(this.scope.record.id);
      return false;
    }

    routeUpdate(search) {
      const viewType = search.view_type;

      // Emulate back to results page
      if (this.viewType && (this.viewType !== 'form') && (viewType === 'form')) {
        // Store main view type
        this.backUrl = this.currentUrl;
      }

      if (search.view_type != null) {
        if ((this.scope.records == null)) {
          this.scope.records = [];
        }
        if (this.viewType !== search.view_type) {
          this.scope.dataSource.pageIndex = null;
          this.scope.record = Katrid.Data.createRecord({}, this.scope);
          this.viewType = search.view_type;
          this.execute();
          return;
        }

        if (['list', 'card'].includes(search.view_type) && !search.page) {
          this.location.search('page', 1);
          this.location.search('limit', this.info.limit);
        } else {

          const filter = {};
          if (search.q != null) {
            filter.q = search.q;
          }

          const fields = _.keys(this.scope.view.fields);

          console.log(filter);
          if (['list', 'card'].includes(search.view_type) && (search.page !== this.scope.dataSource.pageIndex)) {
            this.scope.dataSource.pageIndex = parseInt(search.page);
            this.scope.dataSource.limit = parseInt(search.limit);
            this.scope.dataSource.search(filter, search.page, fields);
          } else if (['list', 'card'].includes(search.view_type) && (search.q != null)) {
            this.scope.dataSource.search(filter, search.page, fields);
          }

          if (search.id && (((this.scope.record != null) && (this.scope.record.id !== search.id)) || (this.scope.record == null))) {
            this.scope.record = null;
            this.scope.dataSource.get(search.id);
          }
        }
      } else {
        this.setViewType(this.viewModes[0]);
      }
      this.currentUrl = {
        url: this.location.$$url,
        path: this.location.$$path,
        search: this.location.$$search
      };
      if (search.title) {
        this.info.display_name = search.title;
      }
    }

    setViewType(viewType) {
      if ((this.viewType === 'form') && !viewType && this.backUrl) {
        return this.location.path(this.backUrl.path, false, this).search(this.backUrl.search);
      } else {
        const search = this.location.$$search;
        if (viewType !== 'form') {
          delete search.id;
        }
        search.view_type = viewType;
        return this.location.search(search);
      }
    }

    apply() {
      this.render(this.scope, this.scope.view.content, this.viewType);
      return this.routeUpdate(this.location.$$search);
    }

    execute() {
      if (this.views != null) {
        this.scope.view = this.views[this.viewType];
        this.apply();
      } else {
        const r = this.scope.model.loadViews({
          views: this.info.views,
          action: this.info.id
        });
        r.done(res => {
          const views = res.result;
          this.views = views;
          return this.scope.$apply(() => {
            this.scope.views = views;
            this.scope.view = views[this.viewType];
            return this.apply();
          });
        });
      }

      if (this.viewType !== 'list') {
        return this.scope.dataSource.groupBy();
      }
    }


    render(scope, html, viewType) {
      if (!this.isDialog) {
        html = Katrid.UI.Utils.Templates[`preRender_${viewType}`](scope, html);
      }
      return scope.setContent(html);
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
      //data = @_prepareParams(params)
      let p = {};
      if (this.info.domain) {
        p = $.parseJSON(this.info.domain);
      }
      for (let k in p) {
        const v = p[k];
        const arg = {};
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
        this.scope.dataSource.setRecordIndex(index);
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
      const modal = $(this.scope.compile(html)(this.scope)).modal();
      modal.on('hidden.bs.modal', function() {
        $(this).data('bs.modal', null);
        return $(this).remove();
      });
    }
  }
  WindowAction.initClass();


  class ReportAction extends Action {
    static initClass() {
      this.actionType = 'sys.action.report';
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
        const svc = new Katrid.Services.Model('sys.action.report');
        svc.post('load_user_report', null, { kwargs: { user_report: this.userReport.id } })
        .done(res => {
          this.userReport.params = res.result;
          return this.scope.setContent(this.info.content);
        });
      } else {
        this.scope.setContent(Katrid.Reports.Reports.renderDialog(this));
      }
    }
  }
  ReportAction.initClass();


  class ViewAction extends Action {
    static initClass() {
      this.actionType = 'sys.action.view';
    }
    routeUpdate(search) {
      return this.scope.setContent(this.info.content);
    }
  }
  ViewAction.initClass();


  class UrlAction extends Action {
    static initClass() {
      this.actionType = 'sys.action.url';
    }

    constructor(info, scope, location) {
      super(info, scope, location);
      window.location.href = info.url;
    }
  }
  UrlAction.initClass();


  class ClientAction extends Action {
    static initClass() {
      this.actionType = 'sys.action.client';
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
      if (this.info.tag) {
        this[`tag_${this.info.tag}`]();
      }
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

  this.Katrid.Actions[WindowAction.actionType] = WindowAction;
  this.Katrid.Actions[ReportAction.actionType] = ReportAction;
  this.Katrid.Actions[ViewAction.actionType] = ViewAction;
  this.Katrid.Actions[UrlAction.actionType] = UrlAction;
  this.Katrid.Actions[ClientAction.actionType] = ClientAction;

}).call(this);
