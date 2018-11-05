(function() {

  class Field {
    constructor(info) {
      this.visible = true;
      this._info = info;
      this.caption = this._info.caption;

      if (this._info.visible === false)
        this.visible = false;
      this.readonly = this._info.readonly;
      if (!this.readonly)
        this.readonly = false;

      this.displayChoices = _.object(info.choices);
      this.template = {
        list: 'view.list.field.pug',
        form: 'view.form.field.pug',
      };

      if (info._listChoices)
        console.log(info._listChoices);
      if (info.template)
        this.template = Object.assign(this.template, info.template);

      this.emptyText = '--';
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

    assign(el) {
      this.$el = el;
      this.caption = el.attr('label') || this.caption;
      let readonly = el.attr('ng-readonly');
      if (!_.isUndefined(readonly))
        this.readonly = readonly;

    }

    get cols() {
      return '6';
    }

    fromJSON(value, dataSource) {
      dataSource.record[this.name] = value;
    }

    get validAttributes() {
       return ['name', 'nolabel'];
    }

    getAttributes(attrs) {
      let res = {};
      let validAttrs = this.validAttributes;
      for (let [k, v] of Object.entries(attrs.$attr))
        if (validAttrs.includes(v)) {
          res[v] = attrs[k];
          if (res[v] === '')
            res[v] = v;
        }
      if (this.readonly)
        res['ng-readonly'] = this.readonly;
      res['ng-model'] = 'record.' + this.name;
      return res;
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

    get maxLength() {
      return this._info.max_length;
    }

    get type() {
      return this._info.type;
    }

    get paramTemplate() {
      return 'view.param.String';
    }

    format(value) {
      return value.toString();
    }

    toJSON(val) {
      return val;
    }

    createWidget(widget, scope, attrs, element) {
      if (!widget) {
        // special fields case
        if (this.hasChoices)
          widget = 'SelectionField';
      }
      let cls = Katrid.ui.Widgets[widget || this.type] || Katrid.ui.Widgets.StringField;
      return new cls(scope, attrs, this, element);
    }

    validate() {

    }

    get defaultCondition() {
      return '=';
    }

    isControlVisible(condition) {
      switch (condition) {
        case 'is null':
          return false;
        case 'is not null':
          return false;
      }
      return true;
    }

  }

  class StringField extends Field {
  }

  class BooleanField extends Field {
    get paramTemplate() {
      return 'view.param.Boolean';
    }
  }

  class DateField extends Field {
    constructor() {
      super(...arguments);
      this.template.form = 'view.form.date-field.pug';
      this.template.list = 'view.list.date-field.pug';
    }
    toJSON(val) {
      return val;
    }

    get cols() {
      return 3;
    }

    get paramTemplate() {
      return 'view.param.Date';
    }

    format(value) {
      if (_.isString(value))
        return moment(value).format(Katrid.i18n.gettext('yyyy-mm-dd').toUpperCase());
      return '';
    }

    getAttributes(attrs) {
      let res = super.getAttributes(attrs);
      res['type'] = 'date';
      return res;
    }
  }

  class DateTimeField extends DateField {
    get paramTemplate() {
      return 'view.param.DateTime';
    }

    getAttributes(attrs) {
      let res = super.getAttributes(attrs);
      res['type'] = 'datetime-local';
      return res;
    }
  }

  class NumericField extends Field {
    constructor() {
      super(...arguments);
      if (Katrid.ui.isMobile)
        this.template.form = 'view.form.numpad-field.pug';
      else
        this.template.form = 'view.form.numeric-field.pug';
      this.template.list = 'view.list.numeric-field.pug';
    }

    toJSON(val) {
      if (val && _.isString(val))
        return parseFloat(val);
      return val;
    }
  }

  class IntegerField extends Field {
    toJSON(val) {
      if (val && _.isString(val))
        return parseInt(val);
      return val;
    }

    get paramTemplate() {
      return 'view.param.Integer';
    }
  }

  class FloatField extends NumericField {
  }

  class DecimalField extends NumericField {
  }

  class ForeignKey extends Field {
    constructor() {
      super(...arguments);
      Object.assign(this.template, {
        list: 'view.list.foreignkey.pug',
        form: 'view.form.foreignkey.pug',
      });
    }

    toJSON(val) {
      if (_.isArray(val))
        return val[0];
      return val;
    }

    get validAttributes() {
      return super.validAttributes.concat(['domain']);
    }

    getDomain(el) {
      return $(el).attr('domain') || this._info.domain;
    }
  }

  class OneToManyField extends Field {
    constructor() {
      super(...arguments);
      this.template.form = 'view.form.grid.pug';
    }
    get field() {
      return this._info.field;
    }

    get cols() {
      return 12;
    }

    get validAttributes() {
      return super.validAttributes.concat(['inline-editor']);
    }

    fromJSON(val, dataSource) {
      if (val && val instanceof Array) {
        val.map((obj) => {
          if (obj.action === 'CREATE') {
            let child = dataSource.childByName(this.name);
            child.scope.addRecord(obj.values);
          }
        });
      }
    }
  }

  class ManyToManyField extends ForeignKey {
    toJSON(val) {
      if (_.isArray(val))
        return val.map(obj => _.isArray(obj) ? obj[0] : obj);
      else if (_.isString(val))
        val = val.split(',');
      return val;
    }
  }

  class TextField extends StringField {
    constructor(info) {
      super(...arguments);
      if (!info.template || (info.template && !info.template.form))
        this.template.form = 'view.form.text-field.pug';
    }
  }

  class ImageField extends Field {
    constructor(info) {
      if (!info.template)
        info.template = {};
      if (!info.template.form)
        info.template.form = 'view.form.image-field.pug';
      super(...arguments);
      this.noImageUrl = '/static/web/assets/img/no-image.png';
    }

    getAttributes(attrs) {
      let res = super.getAttributes(attrs);
      res.ngSrc = attrs.ngEmptyImage || (attrs.emptyImage && (`'${attrs.emptyImage}`)) || `'${this.noImageUrl}'`;
      res.ngSrc = `{{ ${res['ng-model']} || ${res.ngSrc} }}`;
      return res;
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
    TextField,
    DateField,
    BooleanField,
    ImageField,
  }


})();

