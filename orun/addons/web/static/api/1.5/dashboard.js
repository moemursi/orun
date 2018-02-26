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
        if (res.ok) {
          let content = res.result.data[0].content;
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
      $.get('/api/rpc/ir.query/read/?id=' + attrs.queryId).done((res) => {
        c3.generate({
          bindto: el[0],
          data: {
            type: 'donut',
            columns: res.result.data
          }
        });
      });
    }
  }

  Katrid.Actions.ClientAction.register('dashboard', DashboardView);

  Katrid.uiKatrid.directive('dashboard', DashboardComponent);
  Katrid.uiKatrid.directive('chart', Chart);

})();
