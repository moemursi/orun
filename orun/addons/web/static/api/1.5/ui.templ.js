(function () {
  class BaseTemplate {
    getActionTitle(title, click) {
      if (click == null) { click = "action.setViewType()"; }
      return `<h2><a href="javascript:void(0)" ng-click="${ click }">${ title }</a></h2>`;
    }

    getBreadcrumb(scope, viewType) {
      let html;
      if (scope.action.history.length) {
        html = "<ol class=\"breadcrumb\">";
        for (let i = 0; i < scope.action.history.length; i++) {
          const h = scope.action.history[i];
          if ((i === 0) && h.info.display_name) {
            html += `<li>${ this.getActionTitle(h.info.display_name, "action.backTo(-1)") }</li>`;
          }
          html += `<li><a href="javascript:void(0)" ng-click="action.backTo(${ i })">${ h.getCurrentTitle() }</a></li>`;
        }
      } else {
        html = `\
  <ol class="breadcrumb">
    ${ (scope.action.info.display_name && `<li>${ this.getActionTitle(scope.action.info.display_name) }</li>`) || '' }\
  `;
      }

      if (viewType === 'form') {
        html += "<li>${ (dataSource.loadingRecord && Katrid.i18n.gettext('Loading...')) || record.display_name }</li>";
      }
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
            <option ng-repeat="field in view.fields">\${field.caption} = \${record[field.name]}</option>
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

    gridDialog() {
      return `\
  <div class="modal fade" tabindex="-1" role="dialog">
    <div class="modal-dialog modal-lg" role="document">
      <div class="modal-content">
        <div class="modal-header">
          <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
          <h4 class="modal-title" id="myModalLabel">\${field.caption}</h4>
        </div>
        <div class="modal-body">
  <div class="row">
  <!-- view content -->
  </div>
  <div class="clearfix"></div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-primary" type="button" ng-click="save()" ng-show="dataSource.changing">${Katrid.i18n.gettext('Save')}</button>
          <button type="button" class="btn btn-default" type="button" data-dismiss="modal" ng-show="dataSource.changing">${Katrid.i18n.gettext('Cancel')}</button>
          <button type="button" class="btn btn-default" type="button" data-dismiss="modal" ng-show="!dataSource.changing">${Katrid.i18n.gettext('Close')}</button>
        </div>
      </div>
    </div>
  </div>\
  `;
    }

    getFilterButtons() {
      return `\
  <div class="btn-group animated fadeIn search-view-more-area" ng-show="search.viewMoreButtons">
    <div class="btn-group">
      <button class="btn btn-default dropdown-toggle" data-toggle="dropdown" type="button" aria-expanded="false"><span class="fa fa-filter"></span> ${Katrid.i18n.gettext('Filters')} <span class="caret"></span></button>
      <ul class="dropdown-menu animated flipInX search-view-filter-menu">
      </ul>
    </div>
    <div class="btn-group">
      <button class="btn btn-default dropdown-toggle" data-toggle="dropdown" type="button"><span class="fa fa-bars"></span> ${Katrid.i18n.gettext('Group By')} <span class="caret"></span></button>
      <ul class="dropdown-menu animated flipInX search-view-groups-menu">
      </ul>
    </div>
    <button class="btn btn-default"><span class="fa fa-star"></span> ${Katrid.i18n.gettext('Favorites')} <span class="caret"></span></button>
  </div>\
  `;
    }

    preRender_card(scope, html) {
      const buttons = this.getViewButtons(scope);
      html = $(html);
      html.children('field').remove();
      for (let field of Array.from(html.find('field'))) {
        field = $(field);
        const name = $(field).attr('name');
        field.replaceWith(`\${ ::record.${name} }`);
      }
      html = html.html();
      return `\
  <div class="data-heading panel panel-default">
      <div class=\"panel-body\">
        <div class='row'>
          <div class="col-sm-6">
          <h2>
            \${ action.info.display_name }
          </h2>
          </div>
          <search-view class="col-md-6"/>
          <!--<p class=\"help-block\">\${ action.info.usage }&nbsp;</p>-->
        </div>
        <div class="row">
        <div class="toolbar">
  <div class="col-sm-6">
          <button class=\"btn btn-primary\" type=\"button\" ng-click=\"action.createNew()\">${Katrid.i18n.gettext('Create')}</button>
          <span ng-show="dataSource.loading" class="badge page-badge-ref fadeIn animated">\${dataSource.pageIndex}</span>
  
    <div class=\"btn-group\">
      <button type=\"button\" class=\"btn btn-default dropdown-toggle\" data-toggle=\"dropdown\" aria-haspopup=\"true\">
        ${Katrid.i18n.gettext('Action')} <span class=\"caret\"></span></button>
      <ul class=\"dropdown-menu animated flipInX\">
        <li><a href='javascript:void(0)' ng-click=\"action.deleteSelection()\"><i class="fa fa-fw fa-trash"></i> ${Katrid.i18n.gettext('Delete')}</a></li>
      </ul>
    </div>
  
    <button class="btn btn-default" ng-click="dataSource.refresh()"><i class="fa fa-refresh"></i> ${ Katrid.i18n.gettext('Refresh') }</button>
  
  </div>
  <div class="col-sm-6">
  ${this.getFilterButtons()}
    <div class=\"pull-right\">
              <div class="btn-group pagination-area">
                <span class="paginator">\${dataSource.offset|number} - \${dataSource.offsetLimit|number}</span> / <span class="total-pages">\${dataSource.recordCount|number}</span>
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
  <div class="content no-padding">
  <div class="data-panel">
  <div class="card-view animated fadeIn">
    <div ng-repeat="record in records" class="panel panel-default card-item card-link" ng-click="action.listRowClick($index, record, $event)">
      ${html}
    </div>
  
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
    <div class="card-item card-ghost"></div>
  
  </div>
  </div>
  </div>\
  `;
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
      <div class=\"panel-body\">
        <div>
          <a href=\"javascript:void(0)\" title=\"Add to favorite\"><i class=\"fa star fa-star-o pull-right\"></i></a>
          ${ this.getBreadcrumb(scope) }
          <p class=\"help-block\">\${ action.info.usage }</p>
        </div>
        <div class=\"toolbar\">
    <button class=\"btn btn-primary\" type=\"button\" ng-disabled="dataSource.uploading" ng-click=\"dataSource.saveChanges()\" ng-show="dataSource.changing">${Katrid.i18n.gettext('Save')}</button>
    <button class=\"btn btn-primary\" type=\"button\" ng-disabled="dataSource.uploading" ng-click=\"dataSource.editRecord()\" ng-show="!dataSource.changing">${Katrid.i18n.gettext('Edit')}</button>
    <button class=\"btn btn-default\" type=\"button\" ng-disabled="dataSource.uploading" ng-click=\"dataSource.newRecord()\" ng-show="!dataSource.changing">${Katrid.i18n.gettext('Create')}</button>
    <button class=\"btn btn-default\" type=\"button\" ng-click=\"dataSource.cancelChanges()\" ng-show="dataSource.changing">${Katrid.i18n.gettext('Cancel')}</button>
    <div class=\"btn-group\">
      <button type=\"button\" class=\"btn btn-default dropdown-toggle\" data-toggle=\"dropdown\" aria-haspopup=\"true\">
        ${Katrid.i18n.gettext('Action')} <span class=\"caret\"></span></button>
      <ul class=\"dropdown-menu animated flipInX\">
        <li><a href='javascript:void(0)' ng-click=\"action.deleteSelection()\"><i class=\"fa fa-fw fa-trash\"></i> ${Katrid.i18n.gettext('Delete')}</a></li>
        <li><a href='javascript:void(0)' ng-click=\"action.copy()\"><i class=\"fa fa-fw fa-files-o\"></i> ${Katrid.i18n.gettext('Duplicate')}</a></li>
        ${actions}
      </ul>
    </div>
    <div class=\"pull-right\">
      <div class="btn-group pagination-area">
          <span ng-show="records.length">
            \${dataSource.recordIndex} / \${records.length}
          </span>
      </div>
      <div class=\"btn-group\" role=\"group\">
        <button class=\"btn btn-default\" type=\"button\" ng-click=\"dataSource.prior(\'form\')\"><i class=\"fa fa-chevron-left\"></i>
        </button>
        <button class=\"btn btn-default\" type=\"button\" ng-click=\"dataSource.next(\'form\')\"><i class=\"fa fa-chevron-right\"></i>
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
  <div ng-form="form" ng-class="{'form-data-changing': dataSource.changing}">
  ${ toolbar }
  <div class=\"content container animated fadeIn\"><div class="panel panel-default data-panel browsing" ng-class="{ browsing: dataSource.browsing, editing: dataSource.changing }">
  <div class=\"panel-body\"><div class="row">${html}</div></div></div></div></div>`;
    }

    preRender_list(scope, html) {
      const reports = `\
  <div class="btn-group">
    <button type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown" aria-haspopup="true">
      ${Katrid.i18n.gettext('Print')} <span class="caret"></span></button>
    <ul class=\"dropdown-menu animated flipInX\">
      <li><a href='javascript:void(0)' ng-click="action.autoReport()"><i class="fa fa-fw fa-file"></i> ${Katrid.i18n.gettext('Auto Report')}</a></li>
    </ul>
  </div>\
  `;
      const buttons = this.getViewButtons(scope);
      return `<div class=\"data-heading panel panel-default\">
    <div class=\"panel-body\">
      <div class='row'>
        <div class="col-sm-6">
          <h2>\${ action.info.display_name }</h2>
        </div>
        <search-view class="col-md-6"/>
        <!--<p class=\"help-block\">\${ action.info.usage }&nbsp;</p>-->
      </div>
      <div class="row">
      <div class="toolbar">
  <div class="col-sm-6">
        <button class=\"btn btn-primary\" type=\"button\" ng-click=\"action.createNew()\">${Katrid.i18n.gettext('Create')}</button>
        <span ng-show="dataSource.loading" class="badge page-badge-ref fadeIn animated">\${dataSource.pageIndex}</span>
  
  ${reports}
  <div class="btn-group">
    <button type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown" aria-haspopup="true">
      ${Katrid.i18n.gettext('Action')} <span class=\"caret\"></span></button>
    <ul class="dropdown-menu animated flipInX">
      <li><a href='javascript:void(0)' ng-click=\"action.deleteSelection()\"><i class="fa fa-fw fa-trash"></i> ${Katrid.i18n.gettext('Delete')}</a></li>
    </ul>
  </div>
  
  <button class="btn btn-default" ng-click="dataSource.refresh()"><i class="fa fa-refresh"></i> ${ Katrid.i18n.gettext('Refresh') }</button>
  
  </div>
  <div class="col-sm-6">
  ${this.getFilterButtons()}
  
  <div class=\"pull-right\">
            <div class="btn-group pagination-area">
              <span class="paginator">\${dataSource.offset|number} - \${dataSource.offsetLimit|number}</span> / <span class="total-pages">\${dataSource.recordCount|number}</span>
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
  </div><div class=\"content no-padding\">
  <div class=\"panel panel-default data-panel\">
  <div class=\"panel-body no-padding\">
  <div class=\"dataTables_wrapper form-inline dt-bootstrap no-footer\">${html}</div></div></div></div>`;
    }

    static get cssListClass() {
      return 'table table-striped table-bordered table-condensed table-hover display responsive nowrap dataTable no-footer dtr-column';
    }

    renderList(scope, element, attrs, rowClick, parentDataSource) {
      let ths = '<th ng-show="dataSource.groups.length"></th>';
      let cols = `<td ng-show="dataSource.groups.length" class="group-header">
  <div ng-show="row._group">
  <span class="fa fa-fw fa-caret-right"
    ng-class="{'fa-caret-down': row._group.expanded, 'fa-caret-right': row._group.collapsed}"></span>
    \${::row._group.__str__} (\${::row._group.count})</div></td>`;

      for (let col of Array.from(element.children())) {
        col = $(col);
        let name = col.attr('name');
        if (!name) {
          cols += `<td>${col.html()}</td>`;
          ths += "<th><span>${col.attr('caption')}</span></th>";
          continue;
        }

        if (col.attr('visible') === 'False') {
          continue;
        }


        name = col.attr('name');
        const fieldInfo = scope.view.fields[name];

        if (fieldInfo.choices) {
          fieldInfo._listChoices = {};
          for (let choice of Array.from(fieldInfo.choices)) {
            fieldInfo._listChoices[choice[0]] = choice[1];
          }
        }

        let cls = `${fieldInfo.type} list-column`;
        ths += `<th class="${cls}" name="${name}"><span>\${::view.fields.${name}.caption}</span></th>`;
        cls = `${fieldInfo.type} field-${name}`;

        const colHtml = col.html();

        if (colHtml) {
          cols += `<td><a data-id="\${::row.${name}[0]}">${colHtml}</a></td>`;
        } else if (fieldInfo.type === 'ForeignKey') {
          cols += `<td><a data-id="\${::row.${name}[0]}">\${row.${name}[1]}</a></td>`;
        } else if  (fieldInfo._listChoices) {
          cols += `<td class="${cls}">\${::view.fields.${name}._listChoices[row.${name}]}</td>`;
        } else if (fieldInfo.type === 'BooleanField') {
          cols += `<td class="bool-text ${cls}">\${::row.${name} ? '${Katrid.i18n.gettext('yes')}' : '${Katrid.i18n.gettext('no')}'}</td>`;
        } else if (fieldInfo.type === 'DecimalField') {
          cols += `<td class="${cls}">\${::row.${name}|number:2}</td>`;
        } else if (fieldInfo.type === 'DateField') {
          cols += `<td class="${cls}">\${::row.${name}|date:'${Katrid.i18n.gettext('yyyy-mm-dd').replace(/[m]/g, 'M')}'}</td>`;
        } else if (fieldInfo.type === 'DateTimeField') {
          cols += `<td class="${cls}">\${::row.${name}|date:'${Katrid.i18n.gettext('yyyy-mm-dd').replace(/[m]/g, 'M')}'}</td>`;
        } else {
          cols += `<td>\${::row.${name}}</td>`;
        }
      }
      if (parentDataSource) {
        ths += "<th class=\"list-column-delete\" ng-show=\"parent.dataSource.changing\">";
        cols += "<td class=\"list-column-delete\" ng-show=\"parent.dataSource.changing\" ng-click=\"removeItem($index);$event.stopPropagation();\"><i class=\"fa fa-trash\"></i></td>";
      }
      if ((rowClick == null)) {
        rowClick = 'action.listRowClick($index, row, $event)';
      }
      const s = `<table ng-hide="dataSource.loading" class="${this.constructor.cssListClass}">
  <thead><tr>${ths}</tr></thead>
  <tbody>
  <tr ng-repeat="row in records" ng-click="${rowClick}" ng-class="{'group-header': row._hasGroup}">${cols}</tr>
  </tbody>
  </table>
  <div ng-show="dataSource.loading" class="col-sm-12 margin-bottom-16 margin-top-16">${Katrid.i18n.gettext('Loading...')}</div>\
  `;
      return s;
    }

    renderGrid(scope, element, attrs, rowClick) {
      const tbl = this.renderList(scope, element, attrs, rowClick, true);
      return `<div><div ng-show="!dataSource.readonly">
  <button class="btn btn-xs btn-info" ng-click="addItem()" ng-show="parent.dataSource.changing && !dataSource.changing" type="button">${Katrid.i18n.gettext('Add')}</button>
  <button class="btn btn-xs btn-info" ng-click="addItem()" ng-show="dataSource.changing" type="button">${Katrid.i18n.gettext('Save')}</button>
  <button class="btn btn-xs btn-info" ng-click="cancelChanges()" ng-show="dataSource.changing" type="button">${Katrid.i18n.gettext('Cancel')}</button>
  </div><div class="row inline-input-dialog" ng-show="dataSource.changing"/>${tbl}</div>`;
    }

    windowDialog(scope) {
      return `\
  <div class="modal fade" tabindex="-1" role="dialog">
    <div class="modal-dialog modal-lg" role="document">
      <div class="modal-content">
        <div class="modal-header">
          <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
          <h4 class="modal-title" id="myModalLabel">
          \${dialogTitle}
          \${action.info.display_name}</h4>
        </div>
        <div class="modal-body">
  <div class="row">
    <div class="modal-dialog-body"></div>
  </div>
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
      <h2>\${ report.name }</h3>
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
                <option ng-repeat="rep in userReports" value="\${ rep.id }">\${ rep.name }</option>
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
              <option ng-repeat="field in report.fields" value="\${ field.name }">\${ field.label }</option>
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
        <label class="control-label">\${param.label}</label>
        <select ng-model="param.operation" class="form-control" ng-change="param.setOperation(param.operation)">
          <option ng-repeat="op in param.operations" value="\${op.id}">\${op.text}</option>
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
    <input type="hidden" ng-model="record.${fieldName}"/>
    <ul class="steps">
      <li ng-class="{active: $parent.$parent.record.${fieldName} === item[0]}" ng-repeat="item in choices">
        \${ item[1] }
        <span class="arrow"></span>
      </li>
    </ul>
  </div>\
  `;
    }
  }


  this.Katrid.UI.Utils = {
    BaseTemplate,
    Templates: new BaseTemplate()
  };

}).call(this);