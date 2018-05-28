(function() {

  class Field {
    constructor(info) {
      this._info = info;
      this.displayChoices = _.object(info.choices);
    }

    static fromInfo(info) {
      let cls = Katrid.Data.Fields[info.type] || StringField;
      return new cls(info);
    }

    static fromArray(fields) {
      let r = {};
      Object.keys(fields).map(k => r[k] = this.fromInfo(fields[k]));
      return r;
    }

    get onChange() {
      return this._info.onchange;
    }

    get hasChoices() {
      return this._info.choices && this._info.choices.length > 0;
    }

    get choices() {
      return this._info.choices;
    }

    get name() {
      return this._info.name;
    }

    get model() {
      return this._info.model;
    }

    get caption() {
      return this._info.caption;
    }

    get readonly() {
      return this._info.readonly;
    }

    get maxLength() {
      return this._info.max_length;
    }

    get type() {
      return this._info.type;
    }

    toJson(val) {
      return val;
    }

    createWidget(widget, scope, attrs, element) {
      if (!widget) {
        // special fields case
        if (this.name === 'status')
          widget = 'StatusField';
        else if (this.hasChoices)
          widget = 'SelectionField';
      }
      let cls = Katrid.UI.Widgets[widget || this.type] || Katrid.UI.Widgets.StringField;
      return new cls(scope, attrs, this, element);
    }

    validate() {

    }
  }

  class StringField extends Field {
  }

  class DateField extends Field {
    toJson(val) {
      return val;
    }
  }

  class DateTimeField extends DateField {

  }

  class NumericField extends Field {
    toJson(val) {
      if (val && _.isString(val))
        return parseFloat(val);
      return val;
    }
  }

  class IntegerField extends Field {
    toJson(val) {
      if (val && _.isString(val))
        return parseInt(val);
      return val;
    }
  }

  class FloatField extends NumericField {
  }

  class DecimalField extends NumericField {
  }

  class ForeignKey extends Field {
    toJson(val) {
      if (_.isArray(val))
        return val[0];
      return val;
    }
  }

  class OneToManyField extends Field {
    get field() {
      return this._info.field;
    }
  }

  class ManyToManyField extends ForeignKey {
    toJson(val) {
      if (_.isArray(val))
        return val.map(obj => _.isArray(obj) ? obj[0] : obj);
      return val;
    }
  }

  Katrid.Data.Fields = {
    Field,
    StringField,
    IntegerField,
    FloatField,
    DecimalField,
    DateTimeField,
    ForeignKey,
    OneToManyField,
    ManyToManyField,
    DateField
  }


})();