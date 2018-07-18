(function() {

  let conditionsLabels = {
    '=': Katrid.i18n.gettext('Is equal'),
    '!=': Katrid.i18n.gettext('Is different'),
    '>': Katrid.i18n.gettext('Greater-than'),
    '<': Katrid.i18n.gettext('Less-than'),
  };

  let conditionSuffix = {
    '=': '',
    '!=': '__isnot',
    'like': '__icontains',
    'not like': '__not_icontains',
    '>': '__gt',
    '>=': '__gte',
    '<': '__lt',
    '<=': '__lte',
    'in': '__in',
    'not in': '__not_in',
  };

  class SearchMenu {
    show() {
      this.element.show();
      return this.searchView.first();
    }

    close() {
      this.element.hide();
      this.reset();
    }

    async expand(item) {
      let res = await this.searchView.scope.model.getFieldChoices(item.ref.name, this.searchView.scope.search.text);
      console.log(res);
      return res.items.map((obj) => this.searchView.loadItem(item.item, obj, item));
    }

    collapse(item) {
      for (let i of Array.from(item.children)) {
        i.destroy();
      }
      return item.children = [];
    }

    reset() {
      for (let i of this.searchView.items)
        if (i.children) {
          this.collapse(i);
          i.reset();
        }
    }

    select(evt, item) {
      if (this.options.select) {
        if (item.parentItem) {
          item.parentItem.value = item.value;
          item = item.parentItem;
        }
        item.searchString = this.input.val();
        this.options.select(evt, item);
        return this.input.val('');
      }
    }
  }


  class SearchQuery {
    constructor(searchView) {
      this.searchView = searchView;
      this.items = [];
      this.groups = [];
    }

    add(item) {
      if (this.items.includes(item)) {
        item.facet.addValue(item);
        item.facet.refresh();
      } else {
        this.items.push(item);
        this.searchView.renderFacets();
      }
      if (item instanceof SearchGroup)
        this.groups.push(item);
      this.searchView.change();
    }

    loadItem(item) {
      this.items.push(item);
      if (item instanceof SearchGroup)
        this.groups.push(item);
    }

    remove(item) {
      this.items.splice(this.items.indexOf(item), 1);
      if (item instanceof SearchGroup) {
        this.groups.splice(this.groups.indexOf(item), 1);
      }
      this.searchView.change();
    }

    getParams() {
      let r = [];
      for (let i of this.items)
        r = r.concat(i.getParamValues());
      return r;
    }
  }


  class FacetView {
    constructor(item) {
      this.item = item;
      this.values = [];
      this.teste = 'teste';
    }

    init(item, values) {
      this.item = item;
      if (values)
        this.values = values;
      else
        this.values = [{searchString: this.item.getDisplayValue(), value: this.item.value}];
    }

    addValue(value) {
      return this.values.push(value);
    }

    get caption() {
      return this.item.caption;
    }

    clear() {
      this.values = [];
    }

    get templateValue() {
      const sep = ` <span class="facet-values-separator">${Katrid.i18n.gettext('or')}</span> `;
      return (Array.from(this.values).map((s) => s instanceof SearchObject ? s.display : s)).join(sep);
    }

  //   template() {
  //     const s = `<span class="facet-label">${this.item.getFacetLabel()}</span>`;
  //     return `<div class="facet-view">
  // ${s}
  // <span class="facet-value">${this.templateValue()}</span>
  // <span class="fa fa-sm fa-remove facet-remove"></span>
  // </div>`;
  //   }

    link(searchView) {
      const html = $(this.template());
      this.item.facet = this;
      this.element = html;
      const rm = html.find('.facet-remove');
      rm.click(evt => searchView.onRemoveItem(evt, this.item));
      return html;
    }

    refresh() {
      return this.element.find('.facet-value').html(this.templateValue());
    }

    load(searchView) {
      searchView.query.loadItem(this.item);
      this.render(searchView);
    }

    destroy() {
      this.item.clear();
    }

    getParamValues() {
      const r = [];
      for (let v of this.values) {
        r.push(this.item.getParamValue(v));
      }
      if (r.length > 1)
        return [{'OR': r}];
      return r;
    }
  }


  class _SearchItem {
    constructor(name, item, parent, ref, menu) {
      this.name = name;
      this.item = item;
      this.parent = parent;
      this.ref = ref;
      this.menu = menu;
      this.label = this.item.attr('label') || (this.ref && this.ref['caption']) || this.name;
    }

    templateLabel() {
      return sprintf(Katrid.i18n.gettext(`Search <i>%(caption)s</i> by: <strong>%(text)s</strong>`), {
        caption: this.label,
        text: '{{search.text}}'
      });
    }

    template() {
      let s = '';
      if (this.expandable)
        s = `<a class="expandable" href="#"></a>`;
      if (this.value)
        s = `<a class="search-menu-item indent" href="#">${this.value[1]}</a>`;
      else
        s += `<a href="#" class="search-menu-item">${this.templateLabel()}</a>`;
      return `<li>${s}</li>`;
    }

    link(action, $compile, parent) {
      const html = $compile(this.template())(action);
      if (parent != null) {
        html.insertAfter(parent.element);
        parent.children.push(this);
        this.parentItem = parent;
      } else
        html.appendTo(this.parent);

      this.element = html;

      this.itemEl = html.find('.search-menu-item')
      .click(evt => evt.preventDefault())
      .mousedown(evt => {
        return this.select(evt);
      })
      .mouseover(function(evt) {
        const el = html.parent().find('>li.active');
        if (el !== html) {
          el.removeClass('active');
          return html.addClass('active');
        }
      });

      this.element.data('searchItem', this);

      this.expand = html.find('.expandable').on('mousedown', evt => {
        this.expanded = !this.expanded;
        evt.stopPropagation();
        evt.preventDefault();
        $(evt.target).toggleClass('expandable expanded');
        if (this.expanded) {
          return this.searchView.menu.expand(this);
        } else {
          return this.searchView.menu.collapse(this);
        }
      }).click(evt => evt.preventDefault());
      return false;
    }

    select(evt) {
      if (evt) {
        evt.stopPropagation();
        evt.preventDefault();
      }
      this.menu.select(evt, this);
      return this.menu.close();
    }

    getFacetLabel() {
      return this.label;
    }

    getDisplayValue() {
      if (this.value) {
        return this.value[1];
      }
      return this.searchString;
    }

    getValue() {
      return this.facet.values.map(s => s.value || s.searchString);
    }

    getParamValue(name, value) {
      const r = {};
      if ($.isArray(value)) {
        r[name] = value[0];
      } else {
        r[name + '__icontains'] = value;
      }
      return r;
    }

    getParamValues() {
      const r = [];
      for (let v of Array.from(this.getValue())) {
        r.push(this.getParamValue(this.name, v));
      }
      if (r.length > 1) {
        return [{'OR': r}];
      }
      return r;
    }

    destroy() {
      return this.element.remove();
    }

    remove() {
      this.searchView.removeItem(this);
    }

    reset() {
      this.expanded = false;
      this.expand.removeClass('expanded');
      return this.expand.addClass('expandable');
    }

    onSelect() {
      // do nothing
    }

    onRemove() {
      this.facet.element.remove();
      delete this.facet;
    }
  }


  class _SearchFilter extends _SearchItem {
    constructor(name, item, parent, ref, menu) {
      super(name, item, parent, ref, menu);
      this.domain = JSON.parse(item.attr('domain').replace(/'/g, '"'));
    }
    link(scope, $compile, parent) {
      const ul = this.searchView.toolbar.find('.search-view-filter-menu');
      let el = $(`<a class="dropdown-item" href="javascript:void(0)">${this.label}</a>`);
      this._toggleMenuEl = el;
      let me = this;
      el.click(function(evt) {
        evt.preventDefault();
        let e = $(this);
        if (me.facet) me.remove();
        else me.select();
      });
      return ul.append(el);
    }

    select(el) {
      super.select(null);
    }

    getFacetLabel() {
      return '<span class="fa fa-filter"></span>';
    }

    getDisplayValue() {
      return this.label;
    }

    onSelect() {
      this._toggleMenuEl.addClass('selected');
    }

    onRemove() {
      this._toggleMenuEl.removeClass('selected');
      super.onRemove();
    }

    getParamValue() {
      return this.domain;
    }

  }


  class SearchGroup extends _SearchItem {
    constructor(name, item, parent, ref, menu) {
      super(name, item, parent, ref, menu);
      const ctx = item.attr('context');
      if (typeof ctx === 'string') {
        this.context = JSON.parse(ctx);
      } else {
        this.context =
          {grouping: [name]};
      }
    }

    getFacetLabel() {
      return '<span class="fa fa-bars"></span>';
    }

    templateLabel() {
      return Katrid.i18n.gettext('Group by:') + ' ' + this.label;
    }

    getDisplayValue() {
      return this.label;
    }
  }


  class SearchView1 extends Katrid.UI.Widgets.Widget {
    constructor(scope) {
      super(scope);
      this.action = scope.action;
      scope.search = {};
      this.inputKeyDown = this.inputKeyDown.bind(this);
      this.onSelectItem = this.onSelectItem.bind(this);
      this.onRemoveItem = this.onRemoveItem.bind(this);
      this.scope = scope;
      this.query = new SearchQuery(this);
      this.items = [];
      this.filters = [];
      this.action.searchView = this;
    }

    inputKeyDown(ev) {
      switch (ev.keyCode) {
        case Katrid.UI.Keyboard.keyCode.DOWN:
          this.move(1);
          ev.preventDefault();
          break;
        case Katrid.UI.Keyboard.keyCode.UP:
          this.move(-1);
          ev.preventDefault();
          break;
        case Katrid.UI.Keyboard.keyCode.ENTER:
          this.selectItem(ev, this.element.find('.search-view-menu > li.active'));
          break;
      }
    }

    move(distance) {
      const fw = distance > 0;
      distance = Math.abs(distance);
      while (distance !== 0) {
        distance--;
        let el = this.element.find('.search-view-menu > li.active');
        if (el.length) {
          el.removeClass('active');
          if (fw) {
            el = el.next();
          } else {
            el = el.prev();
          }
          el.addClass('active');
        } else {
          if (fw) {
            el = this.element.find('.search-view-menu > li').first();
          } else {
            el = this.element.find('.search-view-menu > li').last();
          }
          el.addClass('active');
        }
      }
    }

    selectItem(ev, el) {
      el.data('searchItem').select(ev);
    }

    link(scope, el, attrs, controller, $compile) {
      let html = el;
      html.addClass(attrs.class);

      this.$compile = $compile;
      this.view = scope.views.search;
      this.viewContent = $(this.view.content);
      this.element = html;
      this.toolbar = this.element.closest('.data-heading').find('.toolbar').first();
      this.searchView = html.find('.search-view');
      this.searchView.find('.search-view-input').keydown(this.inputKeyDown);

      let btnViewMore = html.find('.search-view-more');
      btnViewMore.click(evt => {
        Katrid.localSettings.searchMenuVisible = !Katrid.localSettings.searchMenuVisible;
        this.scope.$apply(() => this.scope.search.viewMoreButtons = Katrid.localSettings.searchMenuVisible);
      });
      this.menu = this.createMenu(scope, html.find('.search-dropdown-menu.search-view-menu'), html);
      this.menu.searchView = this;
      this.menu.link();

      // input key control events
      this.menu.input.on('keydown', function(evt) {});

      this.scope.search.viewMoreButtons = Katrid.localSettings.searchMenuVisible;

      // wait for view loaded
      for (let item of Array.from(this.viewContent.children()))
        this.loadItem($(item));

    }

    loadItem(item, value, parent, cls) {
      console.log('load item', item, value);
      const tag = item.prop('tagName');
      if (cls == null) {
        if (tag === 'FIELD') {
          cls = SearchField;
        } else if (tag === 'FILTER') {
          cls = SearchFilter;
        } else if (tag === 'GROUP') {
          for (let grouping of Array.from(item.children())) {
            this.loadItem($(grouping), null, null, SearchGroup);
          }
          return;
        }
      }

      const name = item.attr('name');
      item = new cls(name, item, this.menu.element, this.view.fields[name], this.menu);
      item.id = this.items.length;
      item.searchView = this;
      if (value) {
        item.expandable = false;
        item.value = value;
      }
      item.link(this.scope, this.$compile, parent);

      this.items.push(item);
    }

    dump() {
      return this.query.items;
    }

    load(items) {
      for (let i of items)
        (new FacetView(this.items[i.id], i.facet.values)).load(this);
    }

    renderFacets() {
      for (let item of this.query.items)
        if (!item.facet)
          (new FacetView(item)).render(this);
    }

    first() {
      this.element.find('.search-view-menu > li.active').removeClass('active');
      return this.element.find('.search-view-menu > li').first().addClass('active');
    }

    onSelectItem(evt, obj) {
      return this.query.add(obj);
    }

    onRemoveItem(evt, obj) {
      return this.query.remove(obj);
    }

    removeItem(obj) {
      this.query.remove(obj);
    }

    change() {
      if (this.query.groups.length || (this.scope.dataSource.groups && this.scope.dataSource.groups.length)) {
        this.scope.action.applyGroups(this.query.groups);
      }
      if (this.query.groups.length === 0) {
        return this.scope.action.setSearchParams(this.query.getParams());
      }
    }
  }

  class SearchItem {
    constructor(view, name, el) {
      this.view = view;
      this.name = name;
      this.el = el;
    }

    getDisplayValue() {
      if (this.value) {
        return this.value[1];
      }
      return this.searchString;
    }

    getParamValue(name, value) {
      const r = {};
      if (_.isArray(value)) {
        r[name] = value[0];
      } else {
        r[name + '__icontains'] = value;
      }
      return r;
    }

    _doChange() {
      this.view.update();
    }
  }

  class SearchFilter extends SearchItem {
    constructor(view, name, label, domain, group, el) {
      super(view, name, el);
      this.group = group;
      this.label = label;
      if (_.isString(domain))
        domain = JSON.parse(domain.replace(/'/g, '"'));
      this.domain = domain;
      this._selected = false;
    }

    static fromItem(view, el, group) {
      return new SearchFilter(view, el.attr('name'), el.attr('label'), el.attr('domain'), group, el);
    }

    toString() {
      return this.label;
    }

    toggle() {
      this.selected = !this.selected;
    }

    get selected() {
      return this._selected;
    }

    set selected(value) {
      this._selected = value;
      if (value)
        this.group.addValue(this);
      else
        this.group.removeValue(this);
      this._doChange();
    }

    getDisplayValue() {
      return this.label;
    }

    get facet() {
      return this.group.facet;
    }

    getParamValue() {
      return this.domain;
    }

    get value() {
      return this.domain;
    }
  }

  class SearchFilterGroup extends Array {
    constructor(view) {
      super();
      this.view = view;
      this._selection = [];
      this._facet = new FacetView(this);
    }

    static fromItem(view, el) {
      let group = new SearchFilterGroup(view);
      group.push(SearchFilter.fromItem(view, el, group));
      return group;
    }

    static fromGroup(view, el) {
      let group = new SearchFilterGroup(view);
      for (let child of el.children())
        group.push(SearchFilter.fromItem(view, $(child), group));
      return group;
    }

    addValue(item) {
      this._selection.push(item);
      console.log(item.value);
      this._facet.values = this._selection.map(item => (new SearchObject(item.toString(), item.value)));
      this._refresh();
    }

    removeValue(item) {
      this._selection.splice(this._selection.indexOf(item), 1);
      this._facet.values = this._selection.map(item => ({ searchString: item.getDisplayValue(), value: item.value }));
      this._refresh();
    }

    selectAll() {
      for (let item of this)
        this.addValue(item);
      this.view.update();
    }

    get caption() {
      return '<span class="fa fa-filter"></span>';
    }

    _refresh() {
      if (this._selection.length) {
        if (this.view.facets.indexOf(this._facet) === -1)
          this.view.facets.push(this._facet);
      } else if (this.view.facets.indexOf(this._facet) > -1)
        this.view.facets.splice(this.view.facets.indexOf(this._facet), 1);
      console.log(this.view.facets);
    }

    getParamValue(v) {
      return v.value;
    }

    clear() {
      this._selection = [];
    }

  }

  class SearchObject {
    constructor(display, value) {
      this.display = display;
      this.value = value;
    }
  }

  class SearchField extends SearchItem {
    constructor(view, name, el, field) {
      super(view, name, el);
      this.field = field;
      this._expanded = false;
      if (field.type === 'ForeignKey') {
        this.expandable = true;
        this.children = [];
      } else {
        this.expandable = false;
      }
    }

    get expanded() {
      return this._expanded;
    }

    set expanded(value) {
      this._expanded = value;
      if (value)
        this._loadChildren();
      else
        this.children = [];
    }

    _loadChildren() {
      this.loading = true;
      this.view.scope.model.getFieldChoices(this.name, this.view.text)
      .then(res => this.children = res.items)
      .finally(() => this.view.scope.$apply(() => this.loading = false));
    }

    get facet() {
      if (!this._facet)
        this._facet = new FacetView(this);
      return this._facet;
    }

    getDisplayValue() {
      return this.value;
    }

    getParamValue(value) {
      const r = {};
      let name = this.name;
      if (_.isArray(value)) {
        r[name] = value[0];
      } else if (value instanceof SearchObject) {
        return value.value;
      } else {
        r[name + '__icontains'] = value;
      }
      return r;
    }

    get caption() {
      return this.field.caption;
    }

    get value() {
      if (this._value)
        return this._value[1];
      return this.view.text;
    }

    select() {
      this.facet.addValue(this.value);
      this.view.addFacet(this.facet);
      this.view.close();
      this.view.update();
    }

    selectItem(item) {
      let domain = {};
      domain[this.field.name] = item[0];
      this.facet.addValue(new SearchObject(item[1], domain));
      this.view.addFacet(this.facet);
      this.view.close();
      this.view.update();
    }

    static fromField(view, el) {
      let field = view.view.fields[el.attr('name')];
      return new SearchField(view, field.name, el, field);
    }

    get template() {
      return _.sprintf(Katrid.i18n.gettext(`Search <i>%(caption)s</i> by: <strong>%(text)s</strong>`), {
        caption: this.field.caption,
        text: this.view.text,
      });
    }
  }

  class CustomFilterItem extends SearchFilter {
    constructor(view, field, condition, value, group) {
      super(view, field.name, field.caption, null, group);
      console.log('group', group);
      this.field = field;
      this.condition = condition;
      this._value = value;
      this._selected = true;
    }

    toString() {
      let s = this.field.format(this._value);
      return this.field.caption + ' ' + conditionsLabels[this.condition].toLowerCase() + ' "' + s + '"';
    }

    get value() {
      let r = {};
      r[this.field.name + conditionSuffix[this.condition]] = this._value;
      return r;
    }

  }

  Katrid.uiKatrid.controller('CustomFilterController', function ($scope, $element, $filter) {
    $scope.tempFilter = null;
    $scope.customFilter = [];

    $scope.fieldChange = function (field) {
      $scope.field = field;
      $scope.condition = field.defaultCondition;
      $scope.conditionChange($scope.condition);
    };

    $scope.conditionChange = (condition) => {
      $scope.controlVisible = $scope.field.isControlVisible(condition);
    };

    $scope.valueChange = (value) => {
      $scope.searchValue = value;
    };

    $scope.addCondition = (field, condition, value) => {
      if (!$scope.tempFilter)
        $scope.tempFilter = new SearchFilterGroup($scope.$parent.search);
      $scope.tempFilter.push(new CustomFilterItem($scope.$parent.search, field, condition, value, $scope.tempFilter));
      $scope.field = null;
      $scope.condition = null;
      $scope.controlVisible = false;
      $scope.searchValue = undefined;
    };

    $scope.applyFilter = () => {
      if ($scope.searchValue)
        $scope.addCondition($scope.field, $scope.condition, $scope.searchValue);
      $scope.customFilter.push($scope.tempFilter);
      $scope.tempFilter.selectAll();
      $scope.tempFilter = null;
      $scope.customSearchExpanded = false;
    };
  })

  .directive('customFilter', () => (
    {
      restrict: 'A',
      scope: {
        action: '=',
      },
    }
  ));

  class SearchView {
    constructor(scope, element, view) {
      this.scope = scope;
      this.element = element;
      this.query = new SearchQuery(this);
      this.viewMoreButtons = false;
      this.items = [];
      this.fields = [];
      this.filterGroups = [];
      this.groups = [];
      this.facets = [];
      this.input = element.find('.search-view-input');
      this.view = view;
      this.el = $(view.content);
      this.menu = element.find('.search-dropdown-menu.search-view-menu');
      // let menu = this.createMenu(scope, element.find('.search-dropdown-menu.search-view-menu'), element);

      for (let child of this.el.children()) {
        child = $(child);
        let tag = child.prop('tagName');
        let obj;
        if (tag === 'FILTER') {
          obj = SearchFilterGroup.fromItem(this, child);
          this.filterGroups.push(obj);
        }
        else if (tag === 'FILTER-GROUP') {
          obj = SearchFilterGroup.fromGroup(this, child);
          this.filterGroups.push(obj);
        }
        else if (tag === 'FIELD') {
          obj = SearchField.fromField(this, child);
          this.fields.push(obj);
          continue;
        }
        this.append(obj);
      }

      this.input
      .on('input', evt => {
        if (this.input.val().length) {
          return this.show(evt);
        } else {
          return this.close(evt);
        }
      })
      .on('keydown', evt => {
        switch (evt.which) {
          case Katrid.UI.Keyboard.keyCode.DOWN:
            this.move(1);
            evt.preventDefault();
            break;
          case Katrid.UI.Keyboard.keyCode.UP:
            this.move(-1);
            evt.preventDefault();
            break;
          case Katrid.UI.Keyboard.keyCode.ENTER:
            this.scope.$apply(() => angular.element(this.menu.find('a.search-menu-item.active')).scope().item.select(evt));
            break;
          case $.ui.keyCode.BACKSPACE:
            if (this.input.val() === '') {
              this.scope.$apply(() => this.facets.splice(this.facets.length-1, 1).map(facet => facet.clear()));
              this.update();
              // const item = this.query.items[this.searchView.query.items.length-1];
            }
            break;
        }
      })
      .on('blur', evt => {
        this.input.val('');
        return this.close();
      });
    }

    append(item) {
      this.items.push(item);
    }

    addFacet(facet) {
      if (!this.facets.includes(facet))
        this.facets.push(facet);
    }

    first() {
      this.menu.find('a.search-menu-item.active').removeClass('active');
      this.menu.find('a.search-menu-item').first().addClass('active');
    }

    remove(index) {
      let facet = this.facets[index];
      facet.destroy();
      this.facets.splice(index, 1);
    }

    getParams() {
      let r = [];
      for (let i of this.facets)
        r = r.concat(i.getParamValues());
      return r;
    }

    move(distance) {
      const fw = distance > 0;
      distance = Math.abs(distance);
      while (distance !== 0) {
        distance--;
        let el = this.element.find('.search-view-menu > li.active');
        if (el.length) {
          el.removeClass('active');
          if (fw) {
            el = el.next();
          } else {
            el = el.prev();
          }
          el.addClass('active');
        } else {
          if (fw) {
            el = this.element.find('.search-view-menu > li').first();
          } else {
            el = this.element.find('.search-view-menu > li').last();
          }
          el.addClass('active');
        }
      }
    }

    update() {
      this.scope.action.setSearchParams(this.getParams());
    }

    show() {
      this.menu.show();
      this.first();
    }

    close() {
      this.menu.hide();
      this.reset();
      this.input.val('');
    }

    reset() {
      for (let i of this.fields)
        if (i && i.children && i.children.length)
          i.expanded = false;
    }
  }

  class SearchViewComponent {
    constructor() {
      this.retrict = 'E';
      this.templateUrl = 'view.search';
      this.replace = true;
      this.scope = false;
    }
  }

  class SearchViewArea {
    constructor() {
      this.restrict = 'A';
      this.scope = false;
    }

    link(scope, el, attrs) {
      let view = scope.action.views.search;
      scope.search = new SearchView(scope, el, view);
    }
  }

  Katrid.uiKatrid.controller('SearchMenuController', function($scope) {

  });

  Katrid.uiKatrid.directive('searchView', SearchViewComponent);
  Katrid.uiKatrid.directive('searchViewArea', SearchViewArea);

  Katrid.UI.Views.SearchView = SearchView;
  Katrid.UI.Views.SearchViewComponent = SearchViewComponent;
  Katrid.UI.Views.SearchMenu = SearchMenu;

})();
