(function() {

  class DashboardView extends Katrid.UI.Views.ClientView {
    get templateUrl() {
      return 'view.dashboard';
    }
  }

  class DashboardComponent extends Katrid.UI.Widgets.Component {
    constructor($compile) {
      super();
      this.$compile = $compile;
      this.restrict = 'E';
      this.scope = false;
    }

    async link(scope, el, attrs, controller) {
      let dashboardId = attrs.dashboardId;
      let model = new Katrid.Services.Model('ir.dashboard.settings');
      let res = await model.search({ dashboard_id: dashboardId });
      if (res.data) {
        let content = res.data[0].content;
        content = this.$compile(content)(scope);
        el.append(content);
      }
    }
  }

  class Chart extends Katrid.UI.Widgets.Component {
    constructor() {
      super();
      this.replace = true;
      this.template = '<div></div>';
    }

    async link(scope, el, attrs) {
      let res, chart;

      let observe = async () => {
        if (_.isUndefined(attrs.url))
          res = await Katrid.Services.Query.read(attrs.queryId);
        else
          res = await $.ajax({
            url: attrs.url,
            type: 'get',
          });

        if (chart)
          chart.destroy();

        chart = c3.generate({
          bindto: el[0],
          data: {
            type: 'donut',
            columns: res.data
          }
        });
      };

      observe();
      attrs.$observe('url', observe);

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
      let r;
      if (_.isUndefined(attrs.url))
        r = Katrid.Services.Query.read(attrs.id);
      else
        r = $.get(attrs.url);
      r.then(res => {
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
