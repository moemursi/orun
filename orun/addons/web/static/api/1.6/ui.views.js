(() => {

  class ToolbarComponent extends Katrid.UI.Widgets.Component {
    constructor() {
      super();
      this.scope = false;
      this.restrict = 'E';
      this.replace = true;
      this.transclude = true;
      this.templateUrl = 'view.header';
    }
  }
  Katrid.uiKatrid.directive('toolbar', ToolbarComponent);


  class ClientView {
    constructor(action) {
      this.action = action;
    }

    get template() {
      return Katrid.$templateCache.get(this.templateUrl);
    }
  }


  class BaseView {
    constructor(scope) {
      this.scope = scope;
    }

    render() {
      return Katrid.$templateCache.get(this.templateUrl);
    }
  }

  class ActionView extends BaseView{
    constructor(action, scope, view, content) {
      super(scope);
      this.action = action;
      this.view = view;
      this.templateUrl = 'view.basic';
      this.toolbar = true;
      this.content = content;
    }

    getTemplateContext() {
      return { content: this.content };
    }

    render() {
      return sprintf(Katrid.$templateCache.get(this.templateUrl), this.getTemplateContext());
    }

    renderTo(parent) {
      Katrid.core.setContent(this.render(), this.scope);
    }
  }

  class View extends ActionView {
    getBreadcrumb() {
      let html = `<ol class="breadcrumb">`;
      let i = 0;
      for (let h of Katrid.Actions.actionManager.actions) {
        if (i === 0 && h.viewModes.length > 1)
          html += `<li class="breadcrumb-item"><a href="javascript:void(0)" ng-click="action.backTo(0, 0)">${ h.info.display_name }</a></li>`;
        i++;
        if (Katrid.Actions.actionManager.actions.length > i && h.viewType === 'form')
          html += `<li class="breadcrumb-item"><a href="javascript:void(0)" ng-click="action.backTo(${i-1})">${ h.scope.record.display_name }</a></li>`;
      }
      if (this.constructor.type === 'form')
          html += `<li class="breadcrumb-item">{{ self.display_name }}</li>`;
      return html + '</ol>';
    }

    render() {
      return sprintf(Katrid.$templateCache.get(this.templateUrl), { content: this.content });
    }

    getViewButtons() {
      let btns = Object.entries(View.buttons).map((btn) => this.view.viewModes.includes(btn[0]) ? btn[1] : '').join('');
      if (btns) btns = `<div class="btn-group">${btns}</div>`;
      return btns;
    }

  }


  class FormView extends View {
    constructor(action, scope, view, content) {
      super(action, scope, view, content);
      this.templateUrl = 'view.form';
    }

    render() {
      let el = $(sprintf(Katrid.$templateCache.get(this.templateUrl), {
        content: this.content,
        breadcrumb: this.getBreadcrumb(),
        actions: ''
      }));
      let frm = el.find('form').first().addClass('row');
      // this.buildHeader(frm);
      return el;
    }
  }
  FormView.type = 'form';


  class ListView extends View {
    constructor(action, scope, view, content) {
      super(action, scope, view, content);
      this.templateUrl = 'view.list';
    }

    render() {
      let el = $(super.render());
      let content = $(this.content);
      const showSelector = true;
      let ths = Katrid.$templateCache.get('view.list.th.group');
      let cols = Katrid.$templateCache.get('view.list.td.group');
      if (showSelector) {
        ths += Katrid.$templateCache.get('view.list.th.selector');
        cols += Katrid.$templateCache.get('view.list.td.selector');
      }

      for (let col of content.children()) {
        let colHtml = col.outerHTML;
        col = $(col);
        let name = col.attr('name');
        if (!name) {
          cols += `<td>${col.html()}</td>`;
          ths += `<th><span>${col.attr('caption')}</span></th>`;
          continue;
        }

        const fieldInfo = this.view.fields[name];

        if (!fieldInfo || (col.attr('visible') === 'False') || (fieldInfo.visible === false))
          continue;

        if (fieldInfo.choices) {
          fieldInfo._listChoices = {};
          for (let choice of Array.from(fieldInfo.choices)) {
            fieldInfo._listChoices[choice[0]] = choice[1];
          }
        }

        let _widget = Katrid.UI.Widgets[col.attr('widget') || fieldInfo.type] || Katrid.UI.Widgets.StringField;
        _widget = new _widget(this.scope, {}, fieldInfo, col);
        _widget.inList = true;
        ths += _widget.th();

        cols += _widget.td();
      }

      el.find('#replace-ths').replaceWith(ths);
      el.find('#replace-cols').replaceWith(cols);

      return el.html();
    }
  }
  ListView.type = 'list';

  class CardView extends View {
    constructor(action, scope, view, content) {
      super(action, scope, view, content);
      this.templateUrl = 'view.card';
    }

    render() {
      let content = $(this.content);
      let fieldList = Array.from(content.children('field')).map((el) => $(el).attr('name'));
      content.children('field').remove();
      content.find('field').each((idx, el) => $(el).replaceWith(`{{ ::record.${ $(el).attr('name') } }}`));
      console.log(this.content);
      return sprintf(Katrid.$templateCache.get(this.templateUrl), { content: content.html() });
    }
  }
  CardView.type = 'card';


  class Form {
    constructor() {
      this.restrict = 'E';
      this.scope = false;
    }

    buildHeader(form) {
      let newHeader = form.find('form header').first();
      form.find('form.full-width').closest('.container').removeClass('container').find('.card').first().addClass('full-width no-border');

      // Add form header
      if (newHeader.length) {
        let headerButtons = $('<div class="header-buttons"></div>');
        newHeader.prepend(headerButtons);
        for (let child of newHeader.children()) {
          child = $(child);
          if (!child.attr('class'))
            child.addClass('btn btn-default');
          if (child.prop('tagName') === 'BUTTON')
            headerButtons.append(child);
          if ((child.prop('tagName') === 'BUTTON') && (child.attr('type') === 'object')) {
            child.attr('type', 'button');
            child.attr('button-type', 'object');
            child.attr('ng-click', 'action.formButtonClick($event.target)');
          } else if ((child.prop('tagName') === 'BUTTON') && !child.attr('type')) {
            child.attr('type', 'button');
          }
        }
        newHeader.addClass('content-container-heading');
      }
      let header = form.find('header').first();
      header.replaceWith(newHeader);
      form.find('field[name=status]').prependTo(newHeader);
    }

    link(scope, element) {
      element.find('form.full-width').closest('.container').removeClass('container').find('.card').first().addClass('full-width no-border');
      scope.$parent.formElement = element.find('form').first();
      scope.$parent.form = angular.element(scope.formElement).controller('form');
      console.log(scope);
    }

    template(element, attrs) {
      this.buildHeader(element);
      element.addClass('ng-form');
      return element.html();
    }
  }


  Katrid.uiKatrid.directive('formView', Form);


  Katrid.UI.Views = {
    View,
    BaseView,
    ActionView,
    FormView,
    ListView,
    CardView,
    ClientView,
    searchModes: [ListView.type, CardView.type]
  };

  Katrid.UI.Views[FormView.type] = FormView;
  Katrid.UI.Views[ListView.type] = ListView;
  Katrid.UI.Views[CardView.type] = CardView;

})();
