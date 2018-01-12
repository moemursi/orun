(function () {

  if (!String.prototype.format) {
    String.prototype.format = function(){
      var args = arguments
      return this.replace(/\{\{|\}\}|\{(\d+)\}/g, function (m, i) {
        if (m == "{{") return "{"
        if (m == "}}") return "}"
        return args[i]
      })
    }
  }


  Katrid.$hashId = 0;

  _.mixin({
    hash(obj) {
      if (!obj.$hashId) {
        obj.$hashId = ++Katrid.$hashId;
      }
      return obj.$hashId;
    }
  });

}).call(this);
