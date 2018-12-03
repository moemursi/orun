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
      let el = $(
        Katrid.$templateCache.get(this.templateUrl)
        .replace('<!-- replace-content -->', this.content)
        .replace('<!-- replace-breadcrumbs -->', this.getBreadcrumb())
      );
      let frm = el.find('form').first().addClass('row');
      // this.buildHeader(frm);
      return el;
    }
  }
  FormView.type = 'form';


  class Form {
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
      return Katrid.app.getTemplate(templName)
      .replace('<!-- replace-header -->', header)
      .replace('<!-- replace-content -->', $el.html())
      .replace('<!-- replace-actions -->', '')
      .replace('<!-- replace-breadcrumbs -->', this.getBreadcrumb());
    }

    link($scope, $el) {
      $el.addClass('ng-form');
      let form = $el.find('form').addClass('row').attr('novalidate', 'novalidate');
      $scope.$parent.formElement = $el.find('form').first();
      $scope.$parent.form = angular.element($scope.formElement).controller('form');

      let copySvc = new Katrid.Services.Model('ir.copy.to');

      copySvc.rpc('get_copy_to_choices', [$scope.$parent.model.name])
      .then(function(res) {
        if (res)
          $scope.copyToOpts = res;
      })

//       $el.on('contextmenu', function(e) {
//   var top = e.pageY - 10;
//   var left = e.pageX - 90;
//   $("#context-menu").css({
//     display: "block",
//     top: top,
//     left: left
//   }).addClass("show");
//   return false; //blocks default Webbrowser right click menu
// }).on("click", function() {
//   $("#context-menu").removeClass("show").hide();
// });
//
// $("#context-menu a").on("click", function() {
//   $(this).parent().removeClass("show").hide();
// });

    }
  }

  Katrid.ui.uiKatrid
  .directive('formView', Form)

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

