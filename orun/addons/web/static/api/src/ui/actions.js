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
