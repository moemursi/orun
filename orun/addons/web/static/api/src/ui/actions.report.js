(function() {

  class ReportAction extends Katrid.Actions.Action {
    static initClass() {
      this.actionType = 'ir.action.report';
    }

    static async dispatchBindingAction(parent, action) {
      let format = localStorage.katridReportViewer || 'pdf';
      let sel = parent.selection;
      console.log('selection ', sel);
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
      this.templateUrl = 'view.report';
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

  Katrid.Actions.ReportAction = ReportAction;
  Katrid.Actions[ReportAction.actionType] = ReportAction;

})();
