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
