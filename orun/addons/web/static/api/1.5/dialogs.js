(function () {

  class Alerts {
    success(msg) {
      return toastr['success'](msg);
    }
  
    warn(msg) {
      return toastr['warning'](msg);
    }
  
    error(msg) {
      return toastr['error'](msg);
    }
  }
  
  
  Katrid.Dialogs =
    {Alerts: new Alerts()};
  
}).call(this);