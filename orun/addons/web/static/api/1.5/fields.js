(function () {

  let widgetCount = 0;


  class Field {
    static initClass() {
      this.prototype.tag = 'div';
    }
    static fromField(field, widget) {
      let cols;
      if (!widget) {
        const tp = field.type;
        if (field.name === 'status') {
          widget = 'StatusField';
        } else if (tp === 'ForeignKey') {
          widget = tp;
        } else if (field.choices) {
          widget = 'SelectField';
        } else if (tp === 'TextField') {
          widget = 'TextareaField';
        } else if (tp === 'BooleanField') {
          widget = 'CheckBox';
          cols = 3;
        } else if (tp === 'DecimalField') {
          widget = 'DecimalField';
          cols = 3;
        } else if (tp === 'DateField') {
          widget = 'DateField';
          cols = 3;
        } else if (tp === 'DateTimeField') {
          widget = 'DateField';
          cols = 3;
        } else if (tp === 'IntegerField') {
          widget = 'IntegerField';
          cols = 3;
        } else if (tp === 'SmallIntegerField') {
          widget = 'IntegerField';
          cols = 3;
        } else if (tp === 'TimeField') {
          widget = 'TimeField';
          cols = 3;
        } else if (tp === 'CharField') {
          widget = 'TextField';
          if (field.max_length && (field.max_length < 30)) cols = 3;
        } else if (tp === 'OneToManyField') {
          widget = tp;
          cols = 12;
        } else if (tp === 'ManyToManyField') {
          widget = tp;
        } else if (tp === 'FileField') {
          widget = tp;
        } else if (tp === 'ImageField') {
          widget = tp;
        } else {
          widget = 'TextField';
        }
      }
      return Katrid.UI.Widgets[widget];
    }
    constructor(scope, attrs, field, element) {
      this.attrs = attrs;
      this.scope = scope;
      this.templAttrs = {};
      this.wAttrs = {};
      this.field = field;
      this.element = element;

      // Check if field depends from another
      if ((field.depends != null) && field.depends.length) {
        scope.action.addNotifyField(field);
      }

      if (attrs.ngShow) {
        this.templAttrs['ng-show'] = attrs.ngShow;
      }
      if (attrs.ngReadonly || field.readonly) {
        this.templAttrs['ng-readonly'] = attrs.ngReadonly || field.readonly;
      }
      if (field.attrs) {
        for (let k in field.attrs) {
          v = field.attrs[k];
          if (k.startsWith('container') || ((k === 'ng-show') && !attrs.ngShow)) {
            this.templAttrs[k] = v;
          }
        }
      }

      if (attrs.ngFieldChange) {
        this.wAttrs['ng-change'] = attrs.ngFieldChange;
      }

      let cols = attrs.cols;

      if (!cols) {
        const tp = field.type;
        if (tp === 'BooleanField') {
          cols = 3;
        } else if (tp === 'DecimalField') {
          cols = 3;
        } else if (tp === 'DateField') {
          cols = 3;
        } else if (tp === 'DateTimeField') {
          cols = 3;
        } else if (tp === 'IntegerField') {
          cols = 3;
        } else if (tp === 'SmallIntegerField') {
          cols = 3;
        } else if (tp === 'TimeField') {
          cols = 3;
        } else if (tp === 'CharField') {
          if (field.max_length && (field.max_length < 30)) cols = 3;
        } else if (tp === 'OneToManyField') {
          cols = 12;
        }
      }

      if (!cols) cols = 6;
      this.cols = cols;

      this.classes = ['form-field'];
    }

    renderTo(templTag, inplaceEditor = false) {
      let templAttrs = [];
      for (var [k, v] of Object.entries(this.templAttrs)) {
        templAttrs.push(k + '=' + '"' + v + '"');
      }
      if (inplaceEditor) return this.template(this.scope, this.element, this.attrs, this.field);
      return `<${templTag} class="section-field-${this.attrs.name} form-group" ${templAttrs.join('')}>` +
            this.template(this.scope, this.element, this.attrs, this.field) +
            `</${templTag}>`
    }

    ngModel(attrs) {
      return `record.${attrs.name}`;
    }

    getId(id) {
      return `katrid-input-${id.toString()}`;
    }

    widgetAttrs(scope, el, attrs, field) {
      let attr, v;
      const r = this.wAttrs;
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
      return `<span class="form-field-readonly">{{ record.${attrs.name}.toString() || '--' }}</span>`;
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
      let label = '';
      let span = '';
      if (!this.inplaceEditor) {
        label = this.labelTemplate(scope, el, attrs, field);
        span = this.spanTemplate(scope, el, attrs, field);
      }
      const html = '<div>' +
        label +
        span +
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

    th() {
      let cls = `${this.field.type} list-column`;
      return `<th class="${cls}" name="${name}"><span>{{::view.fields.${this.field.name}.caption}}</span></th>`;
    }

    td(gridEditor = null, html = null) {
      let colHtml = this.element.html();
      let s;
      let fieldInfo = this.field;
      let name = fieldInfo.name;
      let cls = `${fieldInfo.type} field-${name}`;
      let editor = '';
      if ((gridEditor === 'tabular') && html) editor = html;
      if (colHtml) {
        s = `<td><a data-id="{{::row.${name}[0]}}">${colHtml}</a>${editor}</td>`;
      } else if (fieldInfo.type === 'ForeignKey') {
        s = `<td><a data-id="{{::row.${name}[0]}}">{{row.${name}[1]}}</a>${editor}</td>`;
      } else if  (fieldInfo._listChoices) {
        s = `<td class="${cls}">{{::view.fields.${name}._listChoices[row.${name}]}}${editor}</td>`;
      } else if (fieldInfo.type === 'BooleanField') {
        s = `<td class="bool-text ${cls}">{{::row.${name} ? '${Katrid.i18n.gettext('yes')}' : '${Katrid.i18n.gettext('no')}'}}${editor}</td>`;
      } else if (fieldInfo.type === 'DecimalField') {
        s = `<td class="${cls}">{{::row.${name}|number:2}}${editor}</td>`;
      } else if (fieldInfo.type === 'DateField') {
        s = `<td class="${cls}">{{::row.${name}|date:'${Katrid.i18n.gettext('yyyy-mm-dd').replace(/[m]/g, 'M')}'}}${editor}</td>`;
      } else if (fieldInfo.type === 'DateTimeField') {
        s = `<td class="${cls}">{{::row.${name}|date:'${Katrid.i18n.gettext('yyyy-mm-dd').replace(/[m]/g, 'M')}'}}${editor}</td>`;
      } else {
        s = `<td>{{ ::row.${name} }}</td>`;
      }
      return s;
    }
  }
  Field.initClass();


  class InputWidget extends Field {
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


  class IntegerField extends InputWidget {
    widgetTemplate(scope, el, attrs, field, type) {
      return super.widgetTemplate(scope, el, attrs, field, 'number');
    }
  }


  class TimeField extends InputWidget {
    widgetTemplate(scope, el, attrs, field, type) {
      return super.widgetTemplate(scope, el, attrs, field, 'time');
    }
  }


  class SelectField extends InputWidget {
    static initClass() {
      this.prototype.tag = 'select';
    }

    spanTemplate(scope, el, attrs, field) {
      return `<span class="form-field-readonly">{{ view.fields.${attrs.name}.displayChoices[record.${attrs.name}] || '--' }}</span>`;
    }

    innerHtml(scope, el, attrs, field) {
      return `<option ng-repeat="choice in view.fields.${attrs.name}.choices" value="{{choice[0]}}">{{choice[1]}}</option>`;
    }
  }
  SelectField.initClass();


  class ForeignKey extends Field {
    static initClass() {
      this.prototype.tag = 'input foreignkey';
    }

    spanTemplate(scope, el, attrs, field) {
      let allowOpen = true;
      if (((attrs.allowOpen != null) && (attrs.allowOpen === 'false')) || ((attrs.allowOpen == null) && field.attrs && (field.attrs['allow-open'] === false))) {
        allowOpen = false;
      }
      if (!allowOpen) {
        return `<span class="form-field-readonly">{{ record.${attrs.name}[1] || '--' }}</span>`;
      } else {
        return `<span class="form-field-readonly"><a href="#/action/${ field.model }/view/?id={{ record.${attrs.name}[0] }}" ng-click="action.openObject('${ field.model }', record.${attrs.name}[0], $event, '${ field.caption }')">{{ record.${attrs.name}[1] }}</a><span ng-if="!record.${attrs.name}[1]">--</span></span>`;
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
      return `<span class="form-field-readonly">{{ (record.${attrs.name}|number:2) || '--' }}</span>`;
    }
  }
  DecimalField.initClass();


  class DateField extends TextField {
    static initClass() {
      this.prototype.tag = 'input datepicker';
    }

    spanTemplate(scope, el, attrs, field) {
      return `<span class="form-field-readonly">{{ (record.${attrs.name}|date:'${Katrid.i18n.gettext('yyyy-mm-dd').replace(/[m]/g, 'M')}') || '--' }}</span>`;
    }

    widgetTemplate(scope, el, attrs, field, type) {
      const html = super.widgetTemplate(scope, el, attrs, field, type);
      return `<div class="input-group date" ng-show="dataSource.changing">${html}<div class="input-group-append"><button class="btn btn-default" type="button"><span class="fa fa-calendar"></span></button></div></div>`;
    }
  }
  DateField.initClass();

  class OneToManyField extends Field {
    static initClass() {
      this.prototype.tag = 'grid';
    }

    spanTemplate(scope, el, attrs, field) {
      return '';
    }

    innerHtml(scope, el, attrs, field) {
      let html = el.html();
      if (html) return html;
      return '';
    }

    template(scope, el, attrs, field) {
      const html = super.template(scope, el, attrs, field, 'grid');
      return html;
    }
  }
  OneToManyField.initClass();


  class ManyToManyField extends Field {
    static initClass() {
      this.prototype.tag = 'input foreignkey multiple';
    }

    spanTemplate(scope, el, attrs, field) {
      return `<span class="form-field-readonly">{{ record.${attrs.name}|m2m }}</span>`;
    }

    template(scope, el, attrs, field) {
      return super.template(scope, el, attrs, field, 'hidden');
    }
  }
  ManyToManyField.initClass();


  class CheckBox extends InputWidget {
    spanTemplate(scope, el, attrs, field) {
      return `<span class="form-field-readonly bool-text">
  {{ (record.${attrs.name} && Katrid.i18n.gettext('yes')) || ((record.${attrs.name} === false) && Katrid.i18n.gettext('no')) || (!record.${attrs.name} && '--') }}
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
      let imgSrc = attrs.ngEmptyImage || (attrs.emptyImage && ("'" + attrs.emptyImage + "'")) || "'/static/web/static/assets/img/no-image.png'";
      html = `<div class="image-box image-field">
  <img ng-src="{{ record.${field.name} || ${imgSrc} }}" />
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


  Object.assign(this.Katrid.UI.Widgets,
    {
      Field,
      InputWidget,
      TextField,
      IntegerField,
      SelectField,
      ForeignKey,
      TextareaField,
      DecimalField,
      DateField,
      TimeField,
      CheckBox,
      OneToManyField,
      ManyToManyField,
      FileField,
      PasswordField,
      ImageField,
      StatusField
    }
  );
}).call(this);
