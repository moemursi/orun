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

  class BaseView {
    constructor(scope) {
      this.scope = scope;
    }

    render() {
      return sprintf(Katrid.$templateCache.get(this.templateUrl));
    }
  }

  class ActionView extends BaseView{
    constructor(scope, content) {
      super(scope);
      this.templateUrl = 'view.basic';
      this.toolbar = true;
      this.action = scope.action;
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
      for (let h of Katrid.Actions.Action.history) {
        if (i === 0 && h.viewModes.length > 1)
          html += `<li class="breadcrumb-item"><a href="javascript:void(0)" ng-click="action.backTo(0, 0)">${ h.info.display_name }</a></li>`;
        i++;
        if (Katrid.Actions.Action.history.length > i && h.viewType === 'form')
          html += `<li class="breadcrumb-item"><a href="javascript:void(0)" ng-click="action.backTo(${i-1})">${ h.scope.record.display_name }</a></li>`;
      }
      if (this.scope.action.viewType === 'form')
          html += `<li class="breadcrumb-item">{{ record.display_name }}</li>`;
      return html + '</ol>';
    }

    render() {
      return sprintf(Katrid.$templateCache.get(this.templateUrl), { content: this.content });
    }

    getViewButtons() {
      let btns = Object.entries(View.buttons).map((btn) => this.scope.action.viewModes.includes(btn[0]) ? btn[1] : '').join('');
      if (btns) btns = `<div class="btn-group">${btns}</div>`;
      return btns;
    }

  }


  class FormView extends View {
    constructor(scope, content) {
      super(scope, content);
      this.templateUrl = 'view.form';
    }

    render() {
      let el = $(sprintf(Katrid.$templateCache.get(this.templateUrl), {
        content: this.content,
        breadcrumb: this.getBreadcrumb(),
        actions: ''
      }));
      el.find('form').first().addClass('row');
      return el;
    }
  }
  FormView.type = 'form';


  class ListView extends View {
    constructor(scope, content) {
      super(scope, content);
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

        const fieldInfo = this.scope.view.fields[name];

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
        // _widget.inplaceEditor = false;
        ths += _widget.th();

        cols += _widget.td(false, colHtml);
      }

      el.find('#replace-ths').replaceWith(ths);
      el.find('#replace-cols').replaceWith(cols);

      return el.html();
    }
  }
  ListView.type = 'list';

  class CardView extends View {
    constructor(scope, content) {
      super(scope, content);
      this.templateUrl = 'view.card';
    }

    render() {
      let content = $(this.content);
      let fieldList = Array.from(content.children('field')).map((el) => $(el).attr('name'));
      content.children('field').remove();
      content.find('field').each((idx, el) => $(el).replaceWith(`{{ ::record.${ $(el).attr('name') } }}`));
      return sprintf(Katrid.$templateCache.get(this.templateUrl), { content: content.html() });
    }
  }
  CardView.type = 'card';


  Katrid.UI.Views = {
    View,
    BaseView,
    ActionView,
    FormView,
    ListView,
    CardView,
    searchModes: [ListView.type, CardView.type]
  };

  Katrid.UI.Views[FormView.type] = FormView;
  Katrid.UI.Views[ListView.type] = ListView;
  Katrid.UI.Views[CardView.type] = CardView;

})();
