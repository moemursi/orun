(function () {

  let WIDGET_COUNT = 0;

  let DEFAULT_COLS = {
    'BooleanField': 3,
    'DecimalField': 3,
    'DateField': 3,
    'DateTimeField': 3,
    'IntegerField': 3,
    'SmallIntegerField': 3,
    'TimeField': 3,
    'CharField': 3,
    'OneToManyField': 12
  };

  class Field {
    static get tag() {
      return 'input';
    }

    constructor(scope, attrs, field, element) {
      this.attrs = attrs;
      this.scope = scope;
      this.templAttrs = {};
      this.wAttrs = {};
      this.field = field;
      this.element = element;
      this.content = element.html();

      // Check if field depends from another
      if ((field.depends != null) && field.depends.length)
        scope.dataSource.addFieldWatcher(field);

      if (attrs.ngShow)
        this.templAttrs['ng-show'] = attrs.ngShow;

      if (attrs.ngReadonly || field.readonly)
        this.templAttrs['ng-readonly'] = attrs.ngReadonly || field.readonly;

      if (field.attrs)
        for (let k of field.attrs) {
          v = field.attrs[k];
          if (k.startsWith('container') || ((k === 'ng-show') && !attrs.ngShow)) {
            this.templAttrs[k] = v;
          }
        }

      if (attrs.ngFieldChange) {
        this.wAttrs['ng-change'] = attrs.ngFieldChange;
      }

      let cols = attrs.cols;

      if (!cols) {
        if (field.type === 'CharField')
          if (field.max_length && (field.max_length < 30)) cols = 3;
        if (!cols)
          cols = DEFAULT_COLS[field.type] || 6;
      }

      this.cols = cols;
      this.classes = ['form-field'];
    }

    get caption() {
      return this.element.attr('label') || this.field.caption;
    }

    renderTo(templTag, inplaceEditor = false) {
      let templAttrs = [];
      for (let [k, v] of Object.entries(this.templAttrs))
        templAttrs.push(k + '=' + '"' + v + '"');

      if (inplaceEditor)
        return this.template(this.scope, this.element, this.attrs, this.field);

      return `<${templTag} class="${this.field.type} section-field-${this.attrs.name} form-group" ${templAttrs.join('')}>` +
            this.template(this.scope, this.element, this.attrs, this.field) +
            `</${templTag}>`
    }

    get ngModel() {
      return `record.${this.field.name}`;
    }

    get id() {
      if (!this._id)
        this._id = ++WIDGET_COUNT;
      return `katrid-input-${this._id.toString()}`;
    }

    widgetAttrs() {
      let v;
      const r = this.wAttrs;
      if (this.field.required) {
        r['required'] = null;
      }

      r['ng-model'] = this.ngModel;
      if (this.field.attrs) {
        for (let attr of Object.keys(this.field.attrs)) {
          v = this.field.attrs[attr];
          if (!attr.startsWith('container-') && (attr !== 'ng-show') && (attr !== 'ng-readonly')) {
            r[attr] = v;
          }
        }
      }

      for (let attr of Object.keys(this.attrs.$attr)) {
        let attrName = this.attrs.$attr[attr];
        if (!attrName.startsWith('container-') && (attr !== 'ngShow') && (attr !== 'ngReadonly')) {
          v = this.attrs[attr];
          if (attrName.startsWith('field-')) {
            attrName = attrName.substr(6, attrName.length - 6);
          } else if (attrName === 'class')
            this.classes.push(v);
          r[attrName] = v;
        }
      }

      if ((this.attrs.readonly != null) || this.field.readonly)
        r['readonly'] = '';

      if (this.classes)
        r['class'] = this.classes.join(' ');

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
      if (this.placeholder)
        html += ` placeholder="${this.placeholder}" `;

      return html;
    }

    innerHtml() {
      return '';
    }

    labelTemplate() {
      const placeholder = '';
      const label = this.caption;
      if (this.attrs.nolabel === 'placeholder') {
        this.placeholder = label;
        return '';
      } else if (!_.isUndefined(this.attrs.nolabel))
        return '';
      return `<label for="${this.id}" class="form-label">${label}</label>`;
    }

    spanTemplate(scope, el, attrs, field) {
      return `<span class="form-field-readonly">{{ record.${this.attrs.name}.toString() || '--' }}</span>`;
    }

    widgetTemplate() {
      let html = `<${this.constructor.tag} id="${this.id}" name="${this.field.name}" ${this._getWidgetAttrs()}>`;
      const inner = this.innerHtml();
      if (inner)
        html += inner + `</${this.prototype.tag}>`;
      console.log(html);

      return html;
    }

    template() {
      let label = '';
      let span = '';
      if (!this.inplaceEditor) {
        label = this.labelTemplate();
        span = this.spanTemplate();
      }
      return '<div>' +
        label +
        span +
        this.widgetTemplate() +
        '</div>';
    }

    link(scope, el, attrs, $compile, field) {
      // Add watcher for field dependencies
      if (field.depends) {
        return (() => {
          const result = [];
          for (let dep of Array.from(field.depends)) {
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
      let lbl = this.element.attr('label') || `{{view.fields.${this.field.name}.caption}}`;
      return `<th class="${cls}" name="${this.field.name}"><span>${lbl}</span></th>`;
    }

    _gridEditor() {
      return '';
    }

    _td(cls) {
      return `<td class="${cls}">{{ ::row.${this.field.name} }}</td>`;
    }

    td() {
      if (this.content)
        return this.content;
      if (this.field.hasChoices)
        return `<td class="${this.field.type}">{{ ::view.fields.${this.field.name}.displayChoices[row.${this.field.name}] }}${this._gridEditor()}</td>`;
      return this._td(`${this.field.type} field-${this.field.name}`);

      let colHtml = this.element.html();
      let s;
      let fieldInfo = this.field;
      let name = fieldInfo.name;
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
      } else if (fieldInfo.type === 'IntegerField') {
        s = `<td class="${cls}">{{::row.${name}|number}}${editor}</td>`;
      } else if (fieldInfo.type === 'DecimalField') {
        let decimalPlaces = this.element.attr('decimal-places') || 2;
        s = `<td class="${cls}">{{::row.${name}|number:${ decimalPlaces } }}${editor}</td>`;
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


  class InputWidget extends Field {
    static get tag() {
      return 'input';
    }

    constructor() {
      super(...arguments);
      this.classes.push('form-control');
    }

    get type() {
      return 'text';
    }

    widgetTemplate1() {
      let html;
      if (this.constructor.tag.startsWith('input')) {
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

    widgetTemplate() {
      let type = this.type;
      const prependIcon = this.attrs.icon;
      let html = `<${this.constructor.tag} id="${this.id}" type="${this.type}" name="${this.field.name}" ${this._getWidgetAttrs()}>`;
      if (prependIcon)
        return `<label class="prepend-icon"><i class="icon ${prependIcon}"></i>${html}</label>`;

      const inner = this.innerHtml();
      if (inner)
        html += inner + `</${this.constructor.tag}>`;

      return html;
    }
  }


  class StringField extends InputWidget {
    widgetAttrs() {
      const attributes = super.widgetAttrs();
      if (this.field.maxLength)
        attributes['maxlength'] = this.field.maxLength.toString();

      return attributes;
    }
  }

  class NumericField extends InputWidget {
    get type() {
      return 'number';
    }
    spanTemplate() {
      return `<span class="form-field-readonly">{{ (record.${this.field.name}|number) || '--' }}</span>`;
    }
  }

  class IntegerField extends NumericField {
    _td(cls) {
      return `<td class="${cls}">{{::row.${this.field.name}|number}}${this._gridEditor()}</td>`;
    }
  }



  class TimeField extends InputWidget {
    get type() {
      return 'time';
    }
  }


  class SelectionField extends InputWidget {
    static get tag() {
      return 'select';
    }

    spanTemplate() {
      return `<span class="form-field-readonly">{{ view.fields.${this.attrs.name}.displayChoices[record.${this.attrs.name}] || '--' }}</span>`;
    }

    innerHtml() {
      return `<option ng-repeat="choice in view.fields.${this.field.name}.choices" value="{{choice[0]}}">{{choice[1]}}</option>`;
    }
  }


  class ForeignKey extends Field {
    static get tag() {
      return 'input foreignkey';
    }

    spanTemplate() {
      let allowOpen = true;
      if (((this.attrs.allowOpen != null) && (this.attrs.allowOpen === 'false')) || ((this.attrs.allowOpen == null) && this.field.attrs && (this.field.attrs['allow-open'] === false)))
        allowOpen = false;

      if (!allowOpen)
        return `<span class="form-field-readonly">{{ record.${this.field.name}[1] || '--' }}</span>`;

      return `<span class="form-field-readonly"><a href="#/action/${ this.field.model }/view/?id={{ record.${this.field.name}[0] }}" ng-click="action.openObject('${ this.field.model }', record.${this.field.name}[0], $event, '${ this.field.caption }')">{{ record.${this.field.name}[1] }}</a><span ng-if="!record.${this.field.name}[1]">--</span></span>`;
    }

    get type() {
      return 'hidden';
    }

    _td(cls) {
      return `<td><a data-id="{{::row.${this.field.name}[0]}}">{{row.${this.field.name}[1]}}</a>${this._gridEditor()}</td>`;
    }
  }


  class TextField extends StringField {
    static get tag() {
      return 'textarea';
    }
  }


  class FloatField extends TextField {
    static get tag() {
      if (Katrid.Settings.UI.isMobile)
        return 'input';
      return 'input decimal';
    }

    get type() {
      if (Katrid.Settings.UI.isMobile)
        return 'number';
      return 'text';
    }

    spanTemplate() {
      let decimalPlaces = this.attrs.decimalPlaces || 2;
      return `<span class="form-field-readonly">{{ (record.${this.field.name}|number:${ decimalPlaces }) || '--' }}</span>`;
    }

    _td(cls) {
      let filter;
      let decimalPlaces = this.element.attr('decimal-places');
      if (decimalPlaces)
        filter `number:${ decimalPlaces }`;
      else
        filter = `numberFormat:${this.element.attr('max-digits') || 6}`;
      return `<td class="${cls}">{{::row.${this.field.name}|${filter} }}${this._gridEditor()}</td>`;
    }
  }

  class DecimalField extends FloatField {
    spanTemplate() {
      let maxDigits = this.attrs.maxDigits;
      let fmt = 'number';
      if (maxDigits)
        fmt = 'numberFormat';
      else
        maxDigits = this.attrs.decimalPlaces || 2;
      return `<span class="form-field-readonly">{{ (record.${this.field.name}|${ fmt }:${ maxDigits }) || '--' }}</span>`;
    }

    _td(cls) {
      let maxDigits = this.element.attr('max-digits');
      if (maxDigits)
        return `<td class="${cls}">{{::row.${this.field.name}|numberFormat:${ maxDigits } }}${this._gridEditor()}</td>`;
      else {
        maxDigits = 2;
        return `<td class="${cls}">{{::row.${this.field.name}|number:${ maxDigits } }}${this._gridEditor()}</td>`;
      }
    }
  }


  class DateField extends TextField {
    static get tag() {
      return 'input datepicker';
    }

    spanTemplate() {
      return `<span class="form-field-readonly">{{ (record.${this.field.name}|date:'${Katrid.i18n.gettext('yyyy-mm-dd').replace(/[m]/g, 'M')}') || '--' }}</span>`;
    }

    widgetTemplate() {
      return `<div class="input-group date" ng-show="dataSource.changing">${ super.widgetTemplate() }<div class="input-group-append"><button class="btn btn-default" type="button"><span class="fa fa-calendar"></span></button></div></div>`;
    }

    _td(cls) {
      return `<td class="${cls}">{{::row.${this.field.name}|date:'${Katrid.i18n.gettext('yyyy-mm-dd').replace(/[m]/g, 'M')}'}}${this._gridEditor()}</td>`;
    }
  }

  class OneToManyField extends Field {
    static get tag() {
      return 'grid';
    }

    spanTemplate() {
      return '';
    }

    innerHtml() {
      return this.content;
      let html = his.element.html();
      if (html)
        return html;
      return '';
    }

  }


  class ManyToManyField extends Field {
    static get tag() {
      return 'input foreignkey multiple';
    }

    spanTemplate() {
      return `<span class="form-field-readonly">{{ record.${this.field.name}|m2m }}</span>`;
    }

    get type() {
      return 'hidden';
    }
  }


  class BooleanField extends InputWidget {
    spanTemplate() {
      return `<span class="form-field-readonly bool-text">
  {{ (record.${this.field.name} && gettext('yes')) || ((record.${this.field.name} === false) && gettext('no')) || (!record.${this.field.name} && '--') }}
  </span>`;
    }

    get type() {
      return 'checkbox';
    }

    _td(cls) {
      return `<td class="bool-text ${cls}">{{::row.${this.field.name} ? '${Katrid.i18n.gettext('yes')}' : '${Katrid.i18n.gettext('no')}'}}${this._gridEditor()}</td>`;
    }

    widgetTemplate() {
      let html = super.widgetTemplate();
      html = `<label class="checkbox" ng-show="dataSource.changing">${html}`;
      if (this.field.help_text) {
        html += this.field.help_text;
      } else {
        html += this.field.caption;
      }
      html += '<i></i></label>';
      return html;
    }

    labelTemplate() {
      if (this.field.help_text)
        return super.labelTemplate();
      return `<label for="${ this.id }" class="form-label form-label-checkbox"><span>${ this.caption }</span>&nbsp;</label>`;
    }
  }


  class FileField extends InputWidget {
    static get tag() {
      return 'input file-reader';
    }

    get type() {
      return 'file';
    }
  }


  class ImageField extends FileField {
    static get tag() {
      return 'input file-reader accept="image/*"';
    }

    spanTemplate() { return ''; }

    widgetTemplate() {
      let html = super.widgetTemplate();
      let imgSrc = this.attrs.ngEmptyImage || (this.attrs.emptyImage && ("'" + this.attrs.emptyImage + "'")) || "'/static/web/static/assets/img/no-image.png'";
      html = `<div class="image-box image-field">
  <img ng-src="{{ record.${this.field.name} || ${imgSrc} }}" />
    <div class="text-right image-box-buttons">
    <button class="btn btn-default" type="button" title="${Katrid.i18n.gettext('Change')}" onclick="$(this).closest('.image-box').find('input').trigger('click')"><i class="fa fa-pencil"></i></button>
    <button class="btn btn-default" type="button" title="${Katrid.i18n.gettext('Clear')}" ng-click="$set('${this.field.name}', null)"><i class="fa fa-trash"></i></button>
    </div>
      ${html}</div>`;
      return html;
    }
  }


  class PasswordField extends InputWidget {

    get type() {
      return 'password';
    }

    spanTemplate() {
      return "<span class=\"form-field-readonly\">*******************</span>";
    }
  }


  class StatusField extends InputWidget {
    static get tag() {
      return 'input status-field';
    }

    get type() {
      return 'hidden';
    }

  }


  Object.assign(this.Katrid.UI.Widgets,
    {
      Field,
      InputWidget,
      StringField,
      IntegerField,
      SelectionField,
      ForeignKey,
      TextField,
      DecimalField,
      FloatField,
      DateField,
      TimeField,
      BooleanField,
      OneToManyField,
      ManyToManyField,
      FileField,
      PasswordField,
      ImageField,
      StatusField
    }
  );
})();
