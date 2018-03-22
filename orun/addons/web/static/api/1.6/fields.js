(function() {

  class Field {
    constructor(info) {
      this.info = info;
    }

    static fromInfo(info) {
      let cls = Katrid.Data.Fields[info.type] || StringField;
      return new cls(info);
    }

    get hasChoices() {
      return this.info.choices && this.info.choices.length > 0;
    }

    get choices() {
      if (!this._choices) {
        this._choices = {};
        for (let choice of this.info.choices)
          this._choices[choice[0]] = choice[1];
      }

    }

    get name() {
      return this.info.name;
    }

    get caption() {
      return this.info.caption;
    }

    get readonly() {
      return this.info.readonly;
    }

    get type() {
      return this.info.type;
    }

    toJson(val) {
      return val;
    }

    createWidget(widget, scope, attrs, field, element) {
      if (!widget) {
        // special fields case
        if (this.name === 'status')
          widget = 'StatusField';
        else if (this.hasChoices)
          widget = 'SelectionField';
      }
      let cls = Katrid.UI.Widgets[widget || this.type] || Katrid.UI.Widgets.StringField;
      return new cls(scope, attrs, field, element);
    }

    validate() {

    }
  }

  class StringField extends Field {
    get maxLength() {
      return this.info.maxLength;
    }
  }

  class DateField extends Field {
    toJson(val) {
      return val;
    }
  }

  class DateTimeField extends DateField {

  }

  class NumericField extends Field {

  }

  class IntegerField extends Field {

  }

  Katrid.Data.Fields = {
    Field,
    StringField,
    DateTimeField,
    DateField
  }


})();