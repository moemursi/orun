/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS208: Avoid top-level this
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const uiKatrid = angular.module('ui-katrid', []);


class View extends Katrid.Services.Model {
  constructor() {
    super('ui.view');
  }

  fromModel(model) {
    return this.post('from_model', null, {model});
  }
}

this.Katrid.UI = {
  View,
  keyCode: {
    BACKSPACE: 8,
    COMMA: 188,
    DELETE: 46,
    DOWN: 40,
    END: 35,
    ENTER: 13,
    ESCAPE: 27,
    HOME: 36,
    LEFT: 37,
    PAGE_DOWN: 34,
    PAGE_UP: 33,
    PERIOD: 190,
    RIGHT: 39,
    SPACE: 32,
    TAB: 9,
    UP: 38
  }
};
  

this.Katrid.uiKatrid = uiKatrid;
