(() => {

  let compileButtons = (container) => {
    return container.find('button').each((idx, btn) => {
      btn = $(btn);
      let type = btn.attr('type');

      if (!btn.attr('type') || (btn.attr('type') === 'object'))
        btn.attr('type', 'button');
      if (type === 'object') {
        btn.attr('button-object', btn.attr('name'));
        btn.attr('ng-click', `action.formButtonClick(record.id, '${ btn.attr('name') }', $event.target);$event.stopPropagation();`);
      } else if (type === 'tag') {
        btn.attr('button-tag', btn.attr('name'));
        btn.attr('onclick', `Katrid.Actions.ClientAction.tagButtonClick($(this))`);
      }
      if (!btn.attr('class'))
        btn.addClass('btn btn-outline-secondary');
    });
  };

  class ToolbarComponent extends Katrid.ui.Widgets.Component {
    constructor() {
      super();
      this.scope = false;
      this.restrict = 'E';
      this.replace = true;
      this.transclude = true;
      this.templateUrl = 'view.header';
    }
  }
  Katrid.ui.uiKatrid.directive('toolbar', ToolbarComponent);


  class ClientView {
    constructor(action) {
      this.action = action;
    }

    get template() {
      return Katrid.app.getTemplate(this.templateUrl);
    }

    render() {
      return $(this.template);
    }
  }


  class BaseView {
    constructor(scope) {
      this.scope = scope;
    }

    render() {
      return Katrid.app.getTemplate(this.templateUrl);
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
      return sprintf(Katrid.app.getTemplate(this.templateUrl), this.getTemplateContext());
    }

    renderTo(parent) {
      Katrid.core.setContent(this.render(), this.scope);
    }
  }

  class View extends ActionView {
    getBreadcrumb() {
      let html = `<ol class="breadcrumb">`;
      let i = 0;
      for (let h of Katrid.app.actionManager) {
        if (i === 0 && h.viewModes.length > 1)
          html += `<li class="breadcrumb-item"><a href="#" ng-click="action.backTo(0, 0)">${ h.info.display_name }</a></li>`;
        i++;
        if (Katrid.Actions.actionManager.length > i && h.viewType === 'form')
          html += `<li class="breadcrumb-item"><a href="#" ng-click="action.backTo(${i-1}, 'form')">${ h.scope.record.display_name }</a></li>`;
      }
      if (this.constructor.type === 'form')
        html += `<li class="breadcrumb-item">{{ self.display_name }}</li>`;
      return html + '</ol>';
    }

    render() {
      return sprintf(Katrid.app.$templateCache.get(this.templateUrl), { content: this.content });
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
        newHeader.find('button')
        .each((idx, btn) => headerButtons.append(btn));
      } else
        newHeader = $('<header></header>');
      newHeader.addClass('content-container-heading');
      let header = form.find('header').first();
      header.replaceWith(newHeader);
      form.find('field[name=status]').prependTo(newHeader);
    }

    link(scope, element) {
      element.find('form.full-width').closest('.container').removeClass('container').find('.card').first().addClass('full-width no-border');
      scope.$parent.formElement = element.find('form').first();
      scope.$parent.form = angular.element(scope.formElement).controller('form');
    }

    template(element, attrs) {
      compileButtons(element);
      this.buildHeader(element);
      element.addClass('ng-form');
      return element.html();
    }
  }


  class NewForm {
    constructor() {
      this.replace = true;
      this.scope = false;
    }

    getBreadcrumb() {
      let html = `<ol class="breadcrumb">`;
      let i = 0;
      for (let h of Katrid.app.actionManager) {
        if (i === 0 && h.viewModes.length > 1)
          html += `<li class="breadcrumb-item"><a href="#" ng-click="action.backTo(0, 0);$event.preventDefault();">${ h.info.display_name }</a></li>`;
        i++;
        if (Katrid.app.actionManager.length > i && h.viewType === 'form')
          html += `<li class="breadcrumb-item"><a href="#" ng-click="action.backTo(${i-1}, 'form');$event.preventDefault();">${ h.scope.record.display_name }</a></li>`;
      }
      html += `<li class="breadcrumb-item">{{ self.display_name }}</li>`;
      return html + '</ol>';
    }

    template($el) {
      compileButtons($el);
      let headerEl = $el.find('header').first();
      let header = '';
      if (headerEl.length) {
        let statusField = headerEl.find('field[name=status]').attr('status-field', 'status-field');
        header = headerEl.html();
        headerEl.remove();
      }
      $el.find('field').each((idx, el) => {
        el = $(el);
        if (!el.attr('status-field') && !el.parents('field').length)
          el.attr('form-field', 'form-field');
      });
      let templName = 'view.form';
      if ($el.attr('form-dialog'))
        templName = 'view.form.dialog';
      return sprintf(Katrid.app.getTemplate(templName), {
        content: $el.html(), breadcrumb: this.getBreadcrumb(), actions: '',
        header: header,
      });
    }

    link($scope, $el) {
      $el.addClass('ng-form');
      $el.find('form').addClass('row').attr('novalidate', 'novalidate');
      $scope.$parent.formElement = $el.find('form').first();
      $scope.$parent.form = angular.element($scope.formElement).controller('form');
    }
  }

  Katrid.ui.uiKatrid
  .directive('formView', NewForm)

  .directive('listView', () => ({
    replace: true,
    template($el) {
      $el.find('list').attr('list-options', '{"rowSelector": true}').attr('ng-row-click', 'action.listRowClick($index, record, $event)');
      return sprintf(Katrid.app.getTemplate('view.list'), { content: $el.html() });
    },
  }))

  .directive('card', () => ({
    replace: true,
    template($el) {
      $el.children('field').remove();
      $el.find('field').each((idx, el) => $(el).replaceWith(`{{ ::record.${ $(el).attr('name') } }}`));
      return sprintf(Katrid.app.getTemplate('view.card'), { content: $el.html() });
    }
  }));


  Katrid.ui.Views = {
    View,
    BaseView,
    ActionView,
    FormView,
    ClientView,
    searchModes: ['list', 'card']
  };

  Katrid.ui.Views[FormView.type] = FormView;

})();

