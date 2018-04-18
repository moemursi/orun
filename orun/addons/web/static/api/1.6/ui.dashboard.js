(function() {

  class DashboardView extends Katrid.UI.Views.ActionView {
    constructor(scope) {
      super(scope);
      this.templateUrl = 'view.dashboard';
    }

    getTemplateContext() {
      let ctx = super.getTemplateContext();
      ctx.dashboard = this.scope.action.info.id;
      return ctx;
    }
  }

  class DashboardComponent extends Katrid.UI.Widgets.Component {
    constructor($compile) {
      super();
      this.$compile = $compile;
      this.restrict = 'E';
      this.scope = false;
    }

    link(scope, el, attrs, controller) {
      let dashboardId = attrs.dashboardId;
      let model = new Katrid.Services.Model('ir.dashboard.settings');
      model.search({ dashboard_id: dashboardId })
      .done(res => {
        if (res.data) {
          let content = res.data[0].content;
          content = this.$compile(content)(scope);
          el.append(content);
        }
      });
    }
  }

  class Chart extends Katrid.UI.Widgets.Component {
    constructor() {
      super();
      this.replace = true;
      this.template = '<div></div>';
    }

    link(scope, el, attrs) {
      Katrid.Services.Query.read(attrs.queryId)
      .done(res => {
        c3.generate({
          bindto: el[0],
          data: {
            type: 'donut',
            columns: res.data
          }
        });
      });
    }
  }

  class Query extends Katrid.UI.Widgets.Component {
    constructor() {
      super();
      this.scope = false;
    }
    link(scope, el, attrs) {
      if (!attrs.name)
        throw Error('Query name attribute is required!');
      Katrid.Services.Query.read(attrs.id)
      .done(res => {
        let data = res.data.map((row) => (_.object(res.fields, row)));
        scope.$apply(() => scope[attrs.name] = data);
      });
      el.remove();
    }
  }

  Katrid.Actions.ClientAction.register('dashboard', DashboardView);

  Katrid.uiKatrid.directive('dashboard', DashboardComponent);
  Katrid.uiKatrid.directive('chart', Chart);
  Katrid.uiKatrid.directive('query', Query);

})();
