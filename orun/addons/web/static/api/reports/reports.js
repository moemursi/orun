class ReportEngine {
  static load() {
    $('row').addClass('row');
    $('column').addClass('col');
    $('table').addClass('table table-sm');
  }
}

$(document).ready(() => {
  ReportEngine.load();
});
