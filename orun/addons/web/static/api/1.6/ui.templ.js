(function () {
  class BaseTemplate {
    getBreadcrumb(scope, viewType) {
      let html = `<ol class="breadcrumb">`;
      let i = 0;
      for (let h of Katrid.Actions.Action.history) {
        if (i === 0 && h.viewModes.length > 1) html += `<li><a href="javascript:void(0)" ng-click="action.backTo(0, 'list')">${ h.info.display_name }</a></li>`;
        i++;
        if (Katrid.Actions.Action.history.length > i && h.viewType === 'form')
          html += `<li><a href="javascript:void(0)" ng-click="action.backTo(${i-1})">${ h.scope.record.display_name }</a></li>`;
      }
      if (scope.action.viewType === 'form')
          html += "<li>{{ record.display_name }}</li>";
      html += '</ol>';
      return html;
    }

    getSettingsDropdown(viewType) {
      if (viewType === 'form') {
        return `<ul class="dropdown-menu pull-right">
    <li>
      <a href="javascript:void(0);" ng-click="action.showDefaultValueDialog()">${ Katrid.i18n.gettext('Set Default') }</a>
    </li>
  </ul>`;
      }
    }


    getSetDefaultValueDialog() {
      return `\
  <div class="modal fade" id="set-default-value-dialog" tabindex="-1" role="dialog">
    <div class="modal-dialog" role="document">
      <div class="modal-content">
        <div class="modal-header">
          <button type="button" class="close" data-dismiss="modal" aria-label="${ Katrid.i18n.gettext('Close') }"><span aria-hidden="true">&times;</span></button>
          <h4 class="modal-title">${ Katrid.i18n.gettext('Set Default') }</h4>
        </div>
        <div class="modal-body">
          <select class="form-control" id="id-set-default-value">
            <option ng-repeat="field in view.fields">{{ field.caption }} = {{ record[field.name] }}</option>
          </select>
          <div class="radio">
            <label><input type="radio" name="public">${ Katrid.i18n.gettext('Only me') }</label>
          </div>
          <div class="radio">
            <label><input type="radio" name="public">${ Katrid.i18n.gettext('All users') }</label>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-primary">${ Katrid.i18n.gettext('Save') }</button>
          <button type="button" class="btn btn-default" data-dismiss="modal">${ Katrid.i18n.gettext('Cancel') }</button>
        </div>
      </div>
    </div>
  </div>\
  `;
    }

    getViewRenderer(viewType) {
      return this[`render_${viewType}`];
    }

    getViewModesButtons(scope) {
      const act = scope.action;
      const buttons = {
        card: '<button class="btn btn-default" type="button" ng-click="action.setViewType(\'card\')"><i class="fa fa-th-large"></i></button>',
        list: '<button class="btn btn-default" type="button" ng-click="action.setViewType(\'list\')"><i class="fa fa-list"></i></button>',
        form: '<button class="btn btn-default" type="button" ng-click="action.setViewType(\'form\')"><i class="fa fa-edit"></i></button>',
        calendar: '<button class="btn btn-default" type="button" ng-click="action.setViewType(\'calendar\')"><i class="fa fa-calendar"></i></button>',
        chart: '<button class="btn btn-default" type="button" ng-click="action.setViewType(\'chart\')"><i class="fa fa-bar-chart-o"></i></button>'
      };
      return buttons;
    }

    // buttons group include
    getViewButtons(scope) {
      const act = scope.action;
      const buttons = this.getViewModesButtons(scope);
      const r = [];
      for (let vt of Array.from(act.viewModes)) {
        r.push(buttons[vt]);
      }
      return `<div class="btn-group">${r.join('')}</div>`;
    }

    getFilterButtons() {
      return `\
  <div class="btn-group search-view-more-area" ng-show="search.viewMoreButtons">
    <div class="btn-group">
      <button class="btn btn-default dropdown-toggle" data-toggle="dropdown" type="button" aria-expanded="false"><span class="fa fa-filter"></span> ${Katrid.i18n.gettext('Filters')} <span class="caret"></span></button>
      <ul class="dropdown-menu search-view-filter-menu">
      </ul>
    </div>
    <div class="btn-group">
      <button class="btn btn-default dropdown-toggle" data-toggle="dropdown" type="button"><span class="fa fa-bars"></span> ${Katrid.i18n.gettext('Group By')} <span class="caret"></span></button>
      <ul class="dropdown-menu search-view-groups-menu">
      </ul>
    </div>
    <button class="btn btn-default"><span class="fa fa-star"></span> ${Katrid.i18n.gettext('Favorites')} <span class="caret"></span></button>
  </div>\
  `;
    }

    preRender_card(scope, html) {
      const buttons = this.getViewButtons(scope);
      html = $(html);
      let el = html;
      html.children('field').remove();
      for (let field of Array.from(html.find('field'))) {
        field = $(field);
        const name = $(field).attr('name');
        field.replaceWith(`{{ ::record.${name} }}`);
      }
      html = html.html();
      return `<div class="data-form">
  <header class="data-heading panel panel-default">
      <div class=\"panel-body\">
        <div class='row'>
          <div class="col-sm-6">
          <ol class="breadcrumb">
            <li>{{ action.info.display_name }}</li>
          </ol>
          </div>
          <search-view class="col-md-6"/>
          <!--<p class=\"help-block\">{{ action.info.usage }}&nbsp;</p>-->
        </div>
        <div class="row">
        <div class="toolbar">
  <div class="col-sm-6">
          <button class=\"btn btn-primary\" type=\"button\" ng-click=\"action.createNew()\">${Katrid.i18n.gettext('Create')}</button>
          <span ng-show="dataSource.loading" class="badge page-badge-ref">{{dataSource.pageIndex}}</span>
    <div class=\"btn-group\">
      <button type=\"button\" class=\"btn btn-default dropdown-toggle\" data-toggle=\"dropdown\" aria-haspopup=\"true\">
        ${Katrid.i18n.gettext('Action')} <span class=\"caret\"></span></button>
      <ul class=\"dropdown-menu">
        <li><a href='javascript:void(0)' ng-click=\"action.deleteSelection()\"><i class="fa fa-fw fa-trash-o"></i> ${Katrid.i18n.gettext('Delete')}</a></li>
      </ul>
    </div>
  
    <!--button class="btn btn-default" ng-click="dataSource.refresh()"><i class="fa fa-refresh"></i> ${ Katrid.i18n.gettext('Refresh') }</button-->
  
  </div>
  <div class="col-sm-6">
  ${this.getFilterButtons()}
    <div class=\"pull-right\">
              <div class="btn-group pagination-area">
                <span class="paginator">{{dataSource.offset|number}} - {{dataSource.offsetLimit|number}}</span> / <span class="total-pages">{{ dataSource.recordCount|number }}</span>
              </div>
      <div class=\"btn-group\">
        <button class=\"btn btn-default\" type=\"button\" ng-click=\"dataSource.prevPage()\"><i class=\"fa fa-chevron-left\"></i>
        </button>
        <button class=\"btn btn-default\" type=\"button\" ng-click=\"dataSource.nextPage()\"><i class=\"fa fa-chevron-right\"></i>
        </button>
      </div>\n
      ${buttons}
  </div>
  </div>
  </div>
  </div>
      </header>
  </div>
  <div class="content-scroll">
  <div class="content">
  ${this.getCardView(scope, html, el)}
  </div>
  </div>
  </div>
  `;
    }

    getCardView(scope, html, el) {
      scope.defaultGrouping = $(el).data('grouping');
      scope.dataSource.autoLoadGrouping = true;

      if (_.isUndefined(scope.kanbanAddGroupItem)) {
        scope.kanbanHideAddGroupItemDlg = (event) => {
          event.target.closest('#kanban-add-group-item-dlg').remove();
        };

        scope.kanbanShowAddGroupDlg = (event) => {
          angular.element(event.target).scope().kanbanAddGroupDlg = true;
          setTimeout(() => {
            $(event.target).closest('.kanban-add-group').find('input').focus();
          }, 10)
        };

        scope.kanbanAddGroup = (event, name) => {
          let gname = $(event.target).closest('.kanban-add-group').data('group-name');
          let field = scope.view.fields[gname];
          let svc = new Katrid.Services.Model(field.model);
          console.log('the name is', name);
          svc.createName(name)
          .done((res) => {
            console.log(res);
          });
        };

        scope.kanbanAddItem = (event, name) => {
          if (name) {
            let ctx = {};
            let g = $(event.target).closest('.kanban-group');
            ctx['default_' + g.data('group-name')] = g.data('sequence-id');
            scope.model.createName(name, ctx)
            .done((res) => {
              if (res.ok) {
                let id = res.result[0];
                scope.model.getById(id)
                .done((res) => {
                  if (res.ok) {
                    let s = angular.element(event.target).scope();
                    let g = s.group;
                    s.$apply(() => {
                      g.records.push(res.result.data[0]);
                    });
                  }
                })
              }
            });
          }
          scope.kanbanHideAddGroupItemDlg(event);
        };
        scope.kanbanShowAddGroupItemDlg = (event) => {
          const templ = `
          <form id="kanban-add-group-item-dlg" ng-submit="kanbanAddItem($event, kanbanNewName)">
            <div class="form-group">
              <input ng-model="kanbanNewName" ng-init="kanbanNewName = ''" class="form-control" ng-esc="kanbanHideAddGroupItemDlg($event)" placeholder="${Katrid.i18n.gettext('Add')}" ng-blur="kanbanHideAddGroupItemDlg($event)">
            </div>
            <button type="submit" class="btn btn-primary" onmousedown="event.preventDefault();event.stopPropagation();">${Katrid.i18n.gettext('Add')}</button>
            <button class="btn btn-default">${Katrid.i18n.gettext('Cancel')}</button>
          </form>
          `;
          let s = angular.element(event.target).scope();
          let el = Katrid.core.compile(templ)(s);
          el = $(event.target).closest('.kanban-header').append(el);
          el.find('input').focus();
        };
      }

      const itemAttrs = `<div class="btn-group pull-right">
        <button type="button" class="btn dropdown-toggle" data-toggle="dropdown">
          <span class="caret"></span>
        </button>
        <ul class="dropdown-menu">
          <li>
            <a href="#">Move to next level</a>
          </li>
          <li>
            <a href="#">Action 2</a>
          </li>
          <li>
            <a href="#">Action 3</a>
          </li>
        </ul>
      </div>`;

      let s = '<div class="card-view kanban" ng-if="groupings.length" kanban-draggable=".kanban-group" kanban-group>';
      s += `
<div ng-repeat="group in groupings" class="kanban-group sortable-item" data-id="{{group._paramValue}}" data-group-name="{{group._paramName}}">
  <div class="kanban-header margin-bottom-8">
    <div class="pull-right">
      <button class="btn" ng-click="kanbanShowAddGroupItemDlg($event)"><i class="fa fa-plus"></i></button>
    </div>
    <h4 ng-bind="group.__str__"></h4>
    <div class="clearfix"></div>
  </div>
  <div class="kanban-items" kanban-draggable=".kanban-items" kanban-item>
    <div ng-repeat="record in group.records" class="kanban-item sortable-item ui-sortable-handle" ng-click="action.listRowClick($index, record, $event)">
      ${html}
    </div>
  </div>
</div>
<div class="kanban-add-group" title="${Katrid.i18n.gettext('Click here to add new column')}" ng-click="kanbanNewName='';kanbanShowAddGroupDlg($event);" data-group-name="{{groupings[0]._paramName}}">
<div ng-hide="kanbanAddGroupDlg">
  <i class="fa fa-fw fa-chevron-right fa-2x"></i>
  <div class="clearfix"></div>
  <span class="title">${Katrid.i18n.gettext('Add New Column')}</span>
</div>
<form ng-show="kanbanAddGroupDlg" ng-submit="kanbanAddGroup($event, kanbanNewName)">
<div class="form-group">
  <input class="form-control" ng-blur="kanbanAddGroupDlg=false" ng-esc="kanbanAddGroupDlg=false" placeholder="${Katrid.i18n.gettext('Add')}" ng-model="kanbanNewName">
</div>
  <button type="submit" class="btn btn-primary">${Katrid.i18n.gettext('Add')}</button>
  <button type="button" class="btn btn-default">${Katrid.i18n.gettext('Cancel')}</button>
</form>
</div>

</div><div class="card-view kanban" ng-if="!groupings.length">`;
      s += `<div ng-repeat="record in records" class="panel panel-default card-item card-link" ng-click="action.listRowClick($index, record, $event)">
        ${html}
      </div>`;
      s += `\      <div class="card-item card-ghost"></div>
            <div class="card-item card-ghost"></div>
            <div class="card-item card-ghost"></div>
            <div class="card-item card-ghost"></div>
            <div class="card-item card-ghost"></div>
            <div class="card-item card-ghost"></div>
            <div class="card-item card-ghost"></div>
            <div class="card-item card-ghost"></div>
            <div class="card-item card-ghost"></div>
            <div class="card-item card-ghost"></div>
            <div class="card-item card-ghost"></div>
            </div>
            \
      `;
      return s;
    }

    preRender_toolbar(scope, viewType) {
      const buttons = this.getViewButtons(scope);
      let actions = '';
      if (scope.view.view_actions) {
        for (let act of Array.from(scope.view.view_actions)) {
          var confirmation;
          if (act.confirm) {
            confirmation = `, '${act.confirm}'`;
          } else {
            confirmation = ', null';
          }
          if (act.prompt) {
            confirmation += `, '${act.prompt}'`;
          }
          actions += `<li><a href="javascript:void(0)" ng-click="action.doViewAction('${act.name}', record.id${confirmation})">${act.title}</a></li>`;
        }
      }
      return `\
  <div class="data-heading panel panel-default">
      <div class="panel-body">
        <div>
          <a href="javascript:void(0)" title="Add to favorite"><i class="fa star fa-star-o pull-right"></i></a>
          ${ this.getBreadcrumb(scope) }
          <p class="help-block">{{ ::action.info.usage }}</p>
        </div>
        <div class="toolbar">
    <button class="btn btn-primary" type="button" ng-disabled="dataSource.uploading" ng-click="dataSource.saveChanges()" ng-show="dataSource.changing">${Katrid.i18n.gettext('Save')}</button>
    <button class="btn btn-primary" type="button" ng-disabled="dataSource.uploading" ng-click="dataSource.editRecord()" ng-show="!dataSource.changing">${Katrid.i18n.gettext('Edit')}</button>
    <button class="btn btn-default" type="button" ng-disabled="dataSource.uploading" ng-click="dataSource.newRecord()" ng-show="!dataSource.changing">${Katrid.i18n.gettext('Create')}</button>
    <button class="btn btn-default" type="button" ng-click="dataSource.cancelChanges()" ng-show="dataSource.changing">${Katrid.i18n.gettext('Cancel')}</button>
    <div class="btn-group">    
      <div class="btn-group">
        <button id="attachments-button" attachments-button type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown" aria-haspopup="true">
          <span ng-show="!$parent.attachments.length">${ Katrid.i18n.gettext('Attachments') }</span>
          <span ng-show="$parent.attachments.length">{{ sprintf(gettext('%d Attachment(s)'), $parent.attachments.length) }}</span>
          <span class="caret"></span>
        </button>
        <ul class="dropdown-menu attachments-menu">
          <li ng-repeat="attachment in $parent.attachments">
            <a href="{{ ::attachment.download_url }}">{{ ::attachment.name }} <span class="fa fa-trash-o pull-right" title="Delete this attachment" onclick="event.preventDefault();" ng-click="action.deleteAttachment($index);"></span></a>
          </li>
          <li role="separator" class="divider" ng-show="attachments.length"></li>
          <li>
            <a href="javascript:void(0)" onclick="$(this).next().click()">${Katrid.i18n.gettext('Add...')}</a>
            <input type="file" class="input-file-hidden" multiple onchange="Katrid.Services.Attachments.upload(this)">
          </li>
        </ul>
      </div>
      <div class="btn-group">
        <button type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown" aria-haspopup="true">
          ${Katrid.i18n.gettext('Action')} <span class="caret"></span></button>
        <ul class="dropdown-menu dropdown-menu-actions">
          <li><a href='javascript:void(0)' ng-click="action.deleteSelection(true)"><i class="fa fa-fw fa-trash-o"></i> ${Katrid.i18n.gettext('Delete')}</a></li>
          <li><a href='javascript:void(0)' ng-click="action.copy()"><i class=\"fa fa-fw fa-files-o\"></i> ${Katrid.i18n.gettext('Duplicate')}</a></li>
          ${actions}
        </ul>
      </div>
    </div>
    <div class="pull-right">
      <div class="btn-group pagination-area">
          <span ng-show="records.length">
            {{ dataSource.recordIndex }} / {{ records.length }}
          </span>
      </div>
      <div class="btn-group" role="group">
        <button class="btn btn-default" type="button" ng-click="dataSource.prior('form')"><i class="fa fa-chevron-left"></i>
        </button>
        <button class="btn btn-default" type="button" ng-click="dataSource.next('form')"><i class="fa fa-chevron-right"></i>
        </button>
      </div>\n
      ${buttons}
  </div>
  </div>
      </div>
    </div>\
  `;
    }

    preRender_form(scope, html, toolbar) {
      if (toolbar == null) { toolbar = true; }
      if (toolbar) {
        toolbar = this.preRender_toolbar(scope, 'form');
      } else {
        toolbar = '';
      }

      return `\
  <div ng-form="form" class="data-form" ng-class="{'form-data-changing': dataSource.changing, 'form-data-readonly': !dataSource.changing}">
  ${ toolbar }
  <div class="content-scroll"><div class="content">
    <div class="clearfix"></div><header class="content-container-heading"></header><div class="clearfix"></div>  
  <div class="content container">
  <div class="panel panel-default data-panel browsing" ng-class="{ browsing: dataSource.browsing, editing: dataSource.changing }">
  <div class="panel-body"><div class="row">${html}</div></div></div></div></div></div></div>`;
    }

    preRender_list(scope, html) {
      const reports = `\
  <div class="btn-group">
    <button type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown" aria-haspopup="true">
      ${Katrid.i18n.gettext('Print')} <span class="caret"></span></button>
    <ul class=\"dropdown-menu">
      <li><a href='javascript:void(0)' ng-click="action.autoReport()"><i class="fa fa-fw fa-file"></i> ${Katrid.i18n.gettext('Auto Report')}</a></li>
    </ul>
  </div>\
  `;
      const buttons = this.getViewButtons(scope);
      let ret = `<div class="data-heading panel panel-default">
    <div class="panel-body">
      <div class='row'>
        <div class="col-sm-6">
          <ol class="breadcrumb">
            <li>{{ action.info.display_name }}</li>
          </ol>
        </div>
        <search-view class="col-md-6"/>
        <!--<p class=\"help-block\">{{ action.info.usage }}&nbsp;</p>-->
      </div>
      <div class="row">
      <div class="toolbar">
  <div class="col-sm-6">
        <button class=\"btn btn-primary\" type=\"button\" ng-click=\"action.createNew()\">${Katrid.i18n.gettext('Create')}</button>
        <span ng-show="dataSource.loading" class="badge page-badge-ref">{{dataSource.pageIndex}}</span>
  
  ${reports}
  <div class="btn-group" ng-show="action.selectionLength">
    <button type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown" aria-haspopup="true">
      ${Katrid.i18n.gettext('Action')} <span class=\"caret\"></span></button>
    <ul class="dropdown-menu">
      <li><a href='javascript:void(0)' ng-click=\"action.deleteSelection()\"><i class="fa fa-fw fa-trash-o"></i> ${Katrid.i18n.gettext('Delete')}</a></li>
    </ul>
  </div>
  
  <!--button class="btn btn-default" ng-click="dataSource.refresh()"><i class="fa fa-refresh"></i> ${ Katrid.i18n.gettext('Refresh') }</button-->
  
  </div>
  <div class="col-sm-6">
  ${this.getFilterButtons()}
  
  <div class=\"pull-right\">
            <div class="btn-group pagination-area">
              <span class="paginator">{{dataSource.offset|number}} - {{dataSource.offsetLimit|number}}</span> / <span class="total-pages">{{dataSource.recordCount|number}}</span>
            </div>
    <div class=\"btn-group\">
      <button class=\"btn btn-default\" type=\"button\" ng-click=\"dataSource.prevPage()\"><i class=\"fa fa-chevron-left\"></i>
      </button>
      <button class=\"btn btn-default\" type=\"button\" ng-click=\"dataSource.nextPage()\"><i class=\"fa fa-chevron-right\"></i>
      </button>
    </div>\n
    ${buttons}
  </div>
  </div>
  </div>
  </div>
    </div>
  </div>
  <div class="content-scroll">
  <div class="content no-padding">
  <div class="panel-default data-panel">
  <div class=\"panel-body no-padding\">
  <div class=\"dataTables_wrapper form-inline dt-bootstrap no-footer\">${html}</div></div></div></div></div>`;
      return ret;
    }

    static get cssListClass() {
      return 'table table-striped table-bordered table-condensed table-hover display responsive nowrap dataTable no-footer dtr-column';
    }

    renderList(scope, element, attrs, rowClick, parentDataSource, showSelector=true) {
      let ths = '<th ng-show="dataSource.groups.length"></th>';
      let tfoot = false;
      let totals = [];
      let cols = `<td ng-show="dataSource.groups.length" class="group-header">
  <div ng-show="record._group">
  <span class="fa fa-fw fa-caret-right"
    ng-class="{'fa-caret-down': record._group.expanded, 'fa-caret-right': record._group.collapsed}"></span>
    {{::record._group.__str__}} ({{::record._group.count }})</div></td>`;
      if (showSelector) {
        ths += `<th class="list-record-selector"><input type="checkbox" ng-click="action.selectToggle($event.currentTarget)" onclick="$(this).closest('table').find('td.list-record-selector input').prop('checked', $(this).prop('checked'))"></th>`;
        cols += `<td class="list-record-selector" onclick="event.stopPropagation();"><input title="teste" type="checkbox" ng-click="action.selectToggle($event.currentTarget)" onclick="if (!$(this).prop('checked')) $(this).closest('table').find('th.list-record-selector input').prop('checked', false)"></td>`;
      }

      for (let col of Array.from(element.children())) {
        let colHtml = col.outerHTML;
        col = $(col);
        let name = col.attr('name');
        if (!name) {
          cols += `<td>${col.html()}</td>`;
          ths += "<th><span>${col.attr('label')}</span></th>";
          continue;
        }

        let total = col.attr('total');
        if (total) {
          totals.push([name, total]);
          tfoot = true;
        } else totals.push(total);

        name = col.attr('name');
        const fieldInfo = scope.view.fields[name];

        if ((col.attr('visible') === 'False') || (fieldInfo.visible === false))
          continue;

        // if (fieldInfo.choices) {
        //   fieldInfo._listChoices = {};
        //   for (let choice of Array.from(fieldInfo.choices)) {
        //     fieldInfo._listChoices[choice[0]] = choice[1];
        //   }
        // }

        let _widget = fieldInfo.createWidget(col.attr('widget'), scope, col, col);
        _widget.inplaceEditor = Boolean(scope.inline);
        ths += _widget.th(col.attr('label'));

        cols += _widget.td(scope.inline, colHtml, col);
      }
      if (parentDataSource) {
        ths += '<th class="list-column-delete" ng-show="parent.dataSource.changing && !dataSource.readonly">';
        cols += '<td class="list-column-delete" ng-show="parent.dataSource.changing && !dataSource.readonly" ng-click="removeItem($index);$event.stopPropagation();"><i class="fa fa-trash-o"></i></td>';
      }
      if ((rowClick == null)) {
        rowClick = 'action.listRowClick($index, row, $event)';
      }

      if (tfoot)
        tfoot = `<tfoot><tr>${ totals.map(t => (t ? `<td class="text-right"><strong><ng-total field="${ t[0] }" type="${ t[1] }"></ng-total></strong></td>` : '<td class="borderless"></td>')).join('') }</tr></tfoot>`;
      else
        tfoot = '';
      let gridClass = ' grid';
      if (scope.inline)
        gridClass += ' inline-editor';
      return `<table class="${this.constructor.cssListClass}${gridClass}">
  <thead><tr>${ths}</tr></thead>
  <tbody>
  <tr ng-repeat="record in records" ng-click="${rowClick}" ng-class="{'group-header': record._hasGroup, 'form-data-changing': (dataSource.changing && dataSource.recordIndex === $index), 'form-data-readonly': !(dataSource.changing && dataSource.recordIndex === $index)}" ng-form="grid-row-form-{{$index}}" id="grid-row-form-{{$index}}">${cols}</tr>
  </tbody>
  ${ tfoot }
  </table>
  `;
    }

    renderGrid(scope, element, attrs, rowClick) {
      const tbl = this.renderList(scope, element, attrs, rowClick, true, false);
      let buttons;
      if (attrs.inline == 'inline')
        buttons = `<button class="btn btn-xs btn-info" ng-click="addItem()" ng-show="parent.dataSource.changing && !dataSource.changing" type="button">${Katrid.i18n.gettext('Add')}</button><button class="btn btn-xs btn-info" ng-click="addItem()" ng-show="dataSource.changing" type="button">${Katrid.i18n.gettext('Save')}</button><button class="btn btn-xs btn-info" ng-click="cancelChanges()" ng-show="dataSource.changing" type="button">${Katrid.i18n.gettext('Cancel')}</button>`;
      else
        buttons = `<button class="btn btn-xs btn-info" ng-click="addItem()" ng-show="parent.dataSource.changing" type="button">${Katrid.i18n.gettext('Add')}</button>`;
      return `<div style="overflow-x: auto;"><div ng-show="!dataSource.readonly">
  ${buttons}
  </div><div class="row inline-input-dialog" ng-show="dataSource.changing"/>${tbl}</div>`;
    }

    windowDialog(scope) {
      console.log('window dialog', scope);
      return `\
  <div class="modal fade" tabindex="-1" role="dialog">
    <div class="modal-dialog modal-lg" role="document">
      <div class="modal-content">
        <div class="modal-header">
          <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
          <h4 class="modal-title" id="myModalLabel">
          {{dialogTitle}}
          {{action.info.display_name}}</h4>
        </div>
        <div class="modal-body">
    <div class="modal-dialog-body" ng-class="{'form-data-changing': dataSource.changing}"></div>
  <div class="clearfix"></div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-primary" type="button" ng-click="dataSource.saveAndClose()" ng-show="dataSource.changing">${Katrid.i18n.gettext('Save')}</button>
          <button type="button" class="btn btn-default" type="button" data-dismiss="modal" ng-show="dataSource.changing">${Katrid.i18n.gettext('Cancel')}</button>
          <button type="button" class="btn btn-default" type="button" data-dismiss="modal" ng-show="!dataSource.changing">${Katrid.i18n.gettext('Close')}</button>
        </div>
      </div>
    </div>
  </div>\
  `;
    }

    renderReportDialog(scope) {
      return `<div ng-controller="ReportController">
  <form id="report-form" method="get" action="/web/reports/report/">
    <div class="data-heading panel panel-default">
      <div class="panel-body">
      <h2>{{ report.name }}</h3>
      <div class="toolbar">
        <button class="btn btn-primary" type="button" ng-click="report.preview()"><span class="fa fa-print fa-fw"></span> ${ Katrid.i18n.gettext('Preview') }</button>
  
        <div class="btn-group">
          <button class="btn btn-default dropdown-toggle" data-toggle="dropdown" aria-haspopup="true"
                  aria-expanded="false">${ Katrid.i18n.gettext('Export')  } <span class="caret"></span></button>
          <ul class="dropdown-menu">
            <li><a ng-click="Katrid.Reports.Reports.preview()">PDF</a></li>
            <li><a href="javascript:void(0)" ng-click="Katrid.Reports.Reports.export('docx')">Word</a></li>
            <li><a href="javascript:void(0)" ng-click="Katrid.Reports.Reports.export('xlsx')">Excel</a></li>
            <li><a href="javascript:void(0)" ng-click="Katrid.Reports.Reports.export('pptx')">PowerPoint</a></li>
            <li><a href="javascript:void(0)" ng-click="Katrid.Reports.Reports.export('csv')">CSV</a></li>
            <li><a href="javascript:void(0)" ng-click="Katrid.Reports.Reports.export('txt')">${ Katrid.i18n.gettext('Text File') }</a></li>
          </ul>
        </div>
  
        <div class="btn-group">
          <button class="btn btn-default dropdown-toggle" data-toggle="dropdown" aria-haspopup="true"
                  aria-expanded="false">${ Katrid.i18n.gettext('My reports')  } <span class="caret"></span></button>
          <ul class="dropdown-menu">
            <li><a ng-click="Katrid.Reports.Reports.preview()">PDF</a></li>
            <li><a href="javascript:void(0)" ng-click="Katrid.Reports.Reports.export('docx')">Word</a></li>
            <li><a href="javascript:void(0)" ng-click="Katrid.Reports.Reports.export('xlsx')">Excel</a></li>
            <li><a href="javascript:void(0)" ng-click="Katrid.Reports.Reports.export('pptx')">PowerPoint</a></li>
            <li><a href="javascript:void(0)" ng-click="Katrid.Reports.Reports.export('csv')">CSV</a></li>
            <li><a href="javascript:void(0)" ng-click="Katrid.Reports.Reports.export('txt')">${ Katrid.i18n.gettext('Text File') }</a></li>
          </ul>
        </div>
  
      <div class="pull-right btn-group">
        <button class="btn btn-default dropdown-toggle" data-toggle="dropdown" aria-haspopup="true"
                aria-expanded="false"><i class="fa fa-gear fa-fw"></i></button>
        <ul class="dropdown-menu">
          <li><a href="javascript:void(0)" ng-click="report.saveDialog()">${ Katrid.i18n.gettext('Save') }</a></li>
          <li><a href="#">${ Katrid.i18n.gettext('Load') }</a></li>
        </ul>
      </div>
  
      </div>
    </div>
    </div>
    <div class="col-sm-12">
      <table class="col-sm-12" style="margin-top: 20px; display:none;">
        <tr>
          <td colspan="2" style="padding-top: 8px;">
            <label>${ Katrid.i18n.gettext('My reports') }</label>
  
            <select class="form-control" ng-change="action.userReportChanged(action.userReport.id)" ng-model="action.userReport.id">
                <option value=""></option>
                <option ng-repeat="rep in userReports" value="{{ rep.id }}">{{ rep.name }}</option>
            </select>
          </td>
        </tr>
      </table>
    </div>
  <div id="report-params">
  <div id="params-fields" class="col-sm-12 form-group">
    <div class="checkbox"><label><input type="checkbox" ng-model="paramsAdvancedOptions"> ${ Katrid.i18n.gettext('Advanced options') }</label></div>
    <div ng-show="paramsAdvancedOptions">
      <div class="form-group">
        <label>${ Katrid.i18n.gettext('Printable Fields') }</label>
        <input type="hidden" id="report-id-fields"/>
      </div>
      <div class="form-group">
        <label>${ Katrid.i18n.gettext('Totalizing Fields') }</label>
        <input type="hidden" id="report-id-totals"/>
      </div>
    </div>
  </div>
  
  <div id="params-sorting" class="col-sm-12 form-group">
    <label class="control-label">${ Katrid.i18n.gettext('Sorting') }</label>
    <select multiple id="report-id-sorting"></select>
  </div>
  
  <div id="params-grouping" class="col-sm-12 form-group">
    <label class="control-label">${ Katrid.i18n.gettext('Grouping') }</label>
    <select multiple id="report-id-grouping"></select>
  </div>
  
  <div class="clearfix"></div>
  
  </div>
    <hr>
      <table class="col-sm-12">
        <tr>
          <td class="col-sm-4">
            <select class="form-control" ng-model="newParam">
              <option value="">--- ${ Katrid.i18n.gettext('FILTERS') } ---</option>
              <option ng-repeat="field in report.fields" value="{{ field.name }}">{{ field.label }}</option>
            </select>
          </td>
          <td class="col-sm-8">
            <button
                class="btn btn-default" type="button"
                ng-click="report.addParam(newParam)">
              <i class="fa fa-plus fa-fw"></i> ${ Katrid.i18n.gettext('Add Parameter') }
            </button>
          </td>
        </tr>
      </table>
  <div class="clearfix"></div>
  <hr>
  <div id="params-params">
    <div ng-repeat="param in report.params" ng-controller="ReportParamController" class="row form-group">
      <div class="col-sm-12">
      <div class="col-sm-4">
        <label class="control-label">{{param.label}}</label>
        <select ng-model="param.operation" class="form-control" ng-change="param.setOperation(param.operation)">
          <option ng-repeat="op in param.operations" value="{{op.id}}">{{op.text}}</option>
        </select>
      </div>
      <div class="col-sm-8" id="param-widget"></div>
      </div>
    </div>
  </div>
  </form>
  </div>\
  `;
    }

    renderStatusField(fieldName) {
      return `\
  <div class="status-field status-field-sm pull-right">
    <input type="hidden" ng-model="self.${fieldName}"/>
    <div class="steps">
      <a ng-class="{active: $parent.$parent.record.${fieldName} === item[0]}" ng-repeat="item in choices">
        <span ng-bind="item[1]"/>
      </a>
    </div>
  </div>\
  `;
    }
  }


  this.Katrid.UI.Utils = {
    BaseTemplate,
    Templates: new BaseTemplate()
  };

}).call(this);