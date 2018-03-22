(function() {

  class Alerts {
    success(msg) {
      return toastr['success'](msg);
    }
  }

  Katrid.Dialogs.Alerts = Alerts;

})();
