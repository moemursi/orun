(function () {

  let widgetCount = 0;


  class Widget {
    static initClass() {
      this.prototype.tag = 'div';
    }
    constructor() {
      this.classes = ['form-field'];
    }

    ngModel(attrs) {
      return `record.${attrs.name}`;
    }

    getId(id) {
      return `katrid-input-${id.toString()}`;
    }

    widgetAttrs(scope, el, attrs, field) {
      let attr, v;
      const r = {};
      if (field.required) {
        r['required'] = null;
      }
      r['ng-model'] = this.ngModel(attrs);
      if (field.attrs) {
        for (attr in field.attrs) {
          v = field.attrs[attr];
          if (!attr.startsWith('container-') && (attr !== 'ng-show') && (attr !== 'ng-readonly')) {
            r[attr] = v;
          }
        }
      }

      for (attr in attrs.$attr) {
        let attrName = attrs.$attr[attr];
        if (!attrName.startsWith('container-') && (attr !== 'ngShow') && (attr !== 'ngReadonly')) {
          v = attrs[attr];
          if (attrName.startsWith('field-')) {
            attrName = attrName.substr(6, attrName.length - 6);
          } else if (attrName === 'class')
            this.classes.push(v);
          r[attrName] = v;
        }
      }
      if ((attrs.readonly != null) || field.readonly) {
        r['readonly'] = '';
      }
      if (this.classes) {
        r['class'] = this.classes.join(' ');
      }
      return r;
    }

    _getWidgetAttrs(scope, el, attrs, field) {
      let html = '';
      const attributes = this.widgetAttrs(scope, el, attrs, field);
      for (let att in attributes) {
        const v = attributes[att];
        html += ` ${att}`;
        if (v || (v === false)) {
          if (_.isString(v) && (v.indexOf('"') > -1)) {
            html += `='${v}'`;
          } else {
            html += `="${v}"`;
          }
        }
      }
      if (this.placeholder) {
        html += ` placeholder=\"${this.placeholder}\" `;
      }
      return html;
    }

    innerHtml(scope, el, attrs, field) {
      return '';
    }

    labelTemplate(scope, el, attrs, field) {
      const placeholder = '';
      const label = field.caption;
      if (attrs.nolabel === 'placeholder') {
        this.placeholder = field.caption;
        return '';
      } else if (!_.isUndefined(attrs.nolabel)) {
        return '';
      }
      return `<label for="${attrs._id}" class="form-label">${label}</label>`;
    }

    spanTemplate(scope, el, attrs, field) {
      return `<span class="form-field-readonly">\${ record.${attrs.name}.toString() || '--' }</span>`;
    }

    widgetTemplate(scope, el, attrs, field, type) {
      let html;
      if (this.tag.startsWith('input')) {
        html = `<${this.tag} id="${attrs._id}" type="${type}" name="${attrs.name}" ${this._getWidgetAttrs(scope, el, attrs, field)}>`;
      } else {
        html = `<${this.tag} id="${attrs._id}" name="${attrs.name}" ${this._getWidgetAttrs(scope, el, attrs, field)}>`;
      }
      const inner = this.innerHtml(scope, el, attrs, field);
      if (inner) {
        html += inner + `</${this.tag}>`;
      }
      return html;
    }

    template(scope, el, attrs, field, type) {
      if (type == null) { type = 'text'; }
      widgetCount++;
      const id = this.getId(widgetCount);
      attrs._id = id;
      const html = '<div>' +
        this.labelTemplate(scope, el, attrs, field) +
        this.spanTemplate(scope, el, attrs, field) +
        this.widgetTemplate(scope, el, attrs, field, type) +
        '</div>';
      return html;
    }

    link(scope, el, attrs, $compile, field) {
      // Add watcher for field dependencies
      if (field.depends) {
        return (() => {
          const result = [];
          for (var dep of Array.from(field.depends)) {
            if (!Array.from(scope.dataSource.fieldChangeWatchers).includes(dep)) {
              scope.dataSource.fieldChangeWatchers.push(dep);
              result.push(scope.$watch(`record.${dep}`, function(newValue, oldValue) {
                // Ignore if dataSource is not in changing state
                if ((newValue !== oldValue) && scope.dataSource.changing) {
                  return scope.model.onFieldChange(dep, scope.record)
                  .done(scope.dataSource.onFieldChange);
                }
              }));
            }
          }
          return result;
        })();
      }
    }
  }
  Widget.initClass();


  class InputWidget extends Widget {
    static initClass() {
      this.prototype.tag = 'input';
    }
    constructor() {
      super(...arguments);
      this.classes.push('form-control');
    }

    widgetTemplate(scope, el, attrs, field, type) {
      if (type == null) { type = 'text'; }
      const prependIcon = attrs.icon;
      const html = super.widgetTemplate(scope, el, attrs, field, type);
      if (prependIcon) {
        return `<label class="prepend-icon"><i class="icon ${prependIcon}"></i>${html}</label>`;
      }
      return html;
    }
  }
  InputWidget.initClass();


  class TextField extends InputWidget {
    widgetAttrs(scope, el, attrs, field) {
      const attributes = super.widgetAttrs(scope, el, attrs, field);
      if (field.max_length) {
        attributes['maxlength'] = field.max_length.toString();
      }
      return attributes;
    }
  }


  class SelectField extends InputWidget {
    static initClass() {
      this.prototype.tag = 'select';
    }

    spanTemplate(scope, el, attrs, field) {
      return `<span class="form-field-readonly">\${ view.fields.${attrs.name}.displayChoices[record.${attrs.name}] || '--' }</span>`;
    }

    innerHtml(scope, el, attrs, field) {
      return `<option ng-repeat="choice in view.fields.${attrs.name}.choices" value="\${choice[0]}">\${choice[1]}</option>`;
    }
  }
  SelectField.initClass();


  class ForeignKey extends Widget {
    static initClass() {
      this.prototype.tag = 'input foreignkey';
    }

    spanTemplate(scope, el, attrs, field) {
      let allowOpen = true;
      if (((attrs.allowOpen != null) && (attrs.allowOpen === 'false')) || ((attrs.allowOpen == null) && field.attrs && (field.attrs['allow-open'] === false))) {
        allowOpen = false;
      }
      if (!allowOpen) {
        return `<span class="form-field-readonly">\${ record.${attrs.name}[1] || '--' }</span>`;
      } else {
        return `<span class="form-field-readonly"><a href="#/action/${ field.model }/view/?id=\${ record.${attrs.name}[0] }&title=${ field.caption }" ng-click="action.openObject('${ field.model }', record.${attrs.name}[0], $event, '${ field.caption }')">\${ record.${attrs.name}[1] }</a><span ng-if="!record.${attrs.name}[1]">--</span></span>`;
      }
    }

    template(scope, el, attrs, field) {
      return super.template(scope, el, attrs, field, 'hidden');
    }
  }
  ForeignKey.initClass();


  class TextareaField extends TextField {
    static initClass() {
      this.prototype.tag = 'textarea';
    }
  }

  TextareaField.initClass();


  class DecimalField extends TextField {
    static initClass() {
      if (Katrid.Settings.UI.isMobile) this.prototype.tag = 'input';
      else this.prototype.tag = 'input decimal';
    }

    template(scope, el, attrs, field) {
      if (Katrid.Settings.UI.isMobile) return super.template(scope, el, attrs, field, 'number');
      else return super.template(scope, el, attrs, field, 'text');
    }

    spanTemplate(scope, el, attrs, field) {
      return `<span class="form-field-readonly">\${ (record.${attrs.name}|number:2) || '--' }</span>`;
    }
  }
  DecimalField.initClass();


  class DateField extends TextField {
    static initClass() {
      this.prototype.tag = 'input datepicker';
    }

    spanTemplate(scope, el, attrs, field) {
      return `<span class="form-field-readonly">\${ (record.${attrs.name}|date:'${Katrid.i18n.gettext('yyyy-mm-dd').replace(/[m]/g, 'M')}') || '--' }</span>`;
    }

    widgetTemplate(scope, el, attrs, field, type) {
      const html = super.widgetTemplate(scope, el, attrs, field, type);
      return `<div class="input-group date" ng-show="dataSource.changing">${html}<div class="input-group-addon"><span class="glyphicon glyphicon-th"></span></div></div>`;
    }
  }
  DateField.initClass();


  class OneToManyField extends Widget {
    static initClass() {
      this.prototype.tag = 'grid';
    }

    spanTemplate(scope, el, attrs, field) {
      return '';
    }

    template(scope, el, attrs, field) {
      const html = super.template(scope, el, attrs, field, 'grid');
      return html;
    }
  }
  OneToManyField.initClass();


  class ManyToManyField extends Widget {
    static initClass() {
      this.prototype.tag = 'input foreignkey multiple';
    }

    spanTemplate(scope, el, attrs, field) {
      return `<span class="form-field-readonly">\${ record.${attrs.name}|m2m }</span>`;
    }

    template(scope, el, attrs, field) {
      return super.template(scope, el, attrs, field, 'hidden');
    }
  }
  ManyToManyField.initClass();


  class CheckBox extends InputWidget {
    spanTemplate(scope, el, attrs, field) {
      return `<span class="form-field-readonly bool-text">
  \${ (record.${attrs.name} && Katrid.i18n.gettext('yes')) || ((record.${attrs.name} === false) && Katrid.i18n.gettext('no')) || (!record.${attrs.name} && '--') }
  </span>`;
    }

    widgetTemplate(scope, el, attrs, field) {
      let html = super.widgetTemplate(scope, el, attrs, field, 'checkbox');
      html = `<label class="checkbox" ng-show="dataSource.changing">${html}`;
      if (field.help_text) {
        html += field.help_text;
      } else {
        html += field.caption;
      }
      html += '<i></i></label>';
      return html;
    }

    labelTemplate(scope, el, attrs, field) {
      if (field.help_text) {
        return super.labelTemplate(scope, el, attrs, field);
      }
      return `<label for="${attrs._id}" class="form-label form-label-checkbox"><span>${field.caption}</span>&nbsp;</label>`;
    }
  }


  class FileField extends InputWidget {
    static initClass() {
      this.prototype.tag = 'input file-reader';
    }

    template(scope, el, attrs, field, type) {
      if (type == null) { type = 'file'; }
      return super.template(scope, el, attrs, field, type);
    }
  }
  FileField.initClass();


  class ImageField extends FileField {
    static initClass() {
      this.prototype.tag = 'input file-reader accept="image/*"';
    }

    template(scope, el, attrs, field, type) {
      if (type == null) { type = 'file'; }
      return super.template(scope, el, attrs, field, type);
    }

    spanTemplate() { return ''; }

    widgetTemplate(scope, el, attrs, field, type) {
      let html = super.widgetTemplate(scope, el, attrs, field, type);
      html = `<div class="image-box image-field">
  <img ng-src="\${record.${field.name} || '/static/web/static/assets/img/avatar.png'}" />
    <div class="text-right image-box-buttons">
    <button class="btn btn-default" type="button" title="${Katrid.i18n.gettext('Change')}" onclick="$(this).closest('.image-box').find('input').trigger('click')"><i class="fa fa-pencil"></i></button>
    <button class="btn btn-default" type="button" title="${Katrid.i18n.gettext('Clear')}" ng-click="$set('${field.name}', null)"><i class="fa fa-trash"></i></button>
    </div>
      ${html}</div>`;
      return html;
    }
  }
  ImageField.initClass();


  class PasswordField extends InputWidget {
    template(scope, el, attrs, field, type) {
      if (type == null) { type = 'password'; }
      return super.template(scope, el, attrs, field, type);
    }

    spanTemplate(scope, el, attrs, field) {
      return "<span class=\"form-field-readonly\">*******************</span>";
    }
  }


  class StatusField extends InputWidget {
    static initClass() {
      this.prototype.tag = 'input status-field';
    }

    template(scope, el, attrs, field) {
      return super.template(scope, el, attrs, field, 'hidden');
    }
  }
  StatusField.initClass();


  this.Katrid.UI.Widgets = {
    Widget,
    InputWidget,
    TextField,
    SelectField,
    ForeignKey,
    TextareaField,
    DecimalField,
    DateField,
    CheckBox,
    OneToManyField,
    ManyToManyField,
    FileField,
    PasswordField,
    ImageField,
    StatusField
  };
}).call(this);
