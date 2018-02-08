(function () {

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
