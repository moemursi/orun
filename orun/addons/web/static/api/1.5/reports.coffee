
_counter = 0


class Reports
  @currentReport = {}
  @currentUserReport = {}

  @getUserParams = ->
    params =
      data: []
      file: $('#id-report-file').val()
    $('[data-param]').each ->
      scope = angular.element(this).scope()
      param = scope.param
      pt = $(this).data('param')
      param.name = pt.name
      param.type = pt.type
      params.data.push(param)

    fields = $('#report-id-fields').val()
    params['fields'] = fields

    totals = $('#report-id-totals').val()
    params['totals'] = totals

    sorting = $('#report-id-sorting').val()
    params['sorting'] = sorting

    grouping = $('#report-id-grouping').val()
    params['grouping'] = grouping

    params


  @preview = (format) ->
    params = @getUserParams()
    params['format'] = format

    $.ajax
      type: 'POST'
      url: $('#report-form').attr('action')
      contentType: "application/json; charset=utf-8",
      dataType: 'json'
      data: JSON.stringify params
    .then (res) ->
      if res.open
        window.open res.open
    false

  @export = (format) ->
    @preview(format)

  @saveDialog = ->
    params = @getUserParams()
    name = window.prompt(Katrid.i18n.gettext('Report name'), Katrid.Reports.Reports.currentUserReport.name)
    if name
      Katrid.Reports.Reports.currentUserReport.name = name
      $.ajax
        type: 'POST'
        url: $('#report-form').attr('action') + '?save=' + name
        contentType: "application/json; charset=utf-8",
        dataType: 'json'
        data: JSON.stringify params
    false

  @get = (repName) ->


class Report
  constructor: (@info, @scope) ->
    Katrid.Reports.Reports.currentReport = @
    @name = @info.name
    @id = ++_counter
    @values = {}
    @params = []
    @groupables = []
    @sortables = []
    @totals = []
    @load()


  load: ->
    # Create params
    for p in @info.fields
      if p.groupable
        @groupables.push(p)
      if p.sortable
        @sortables.push(p)
      if p.total
        @totals.push(p)
      if p.param?
        p = new Param(p, @)
        @params.push(p)

  addParam: (paramName) ->
    for p in @info.fields
      if p.name is paramName
        p = new Param(p, @)
        @params.push(p)
        $(p.render(@elParams))
        break

  getValues: ->


  export: (format='pdf') ->
    @preview(format)

  preview: ->
    console.log('Report preview')

  renderFields: ->
    el = $('<div></div>')
    flds = ("""<option value="#{p.name}">#{p.label}</option>""" for p in @info.fields).join('')
    aggs = ("""<option value="#{p.name}">#{p.label}</option>""" for p in @info.fields when p.total).join('')
    el = $('#report-params')
    sel = el.find('#report-id-fields')
    sel.append($(flds))
    .select2()
    .select2("container").find("ul.select2-choices").sortable
        containment: 'parent'
        start: -> sel.select2("onSortStart")
        update: -> sel.select2("onSortEnd")
    if Katrid.Reports.Reports.currentUserReport.params and Katrid.Reports.Reports.currentUserReport.params.fields
      console.log(Katrid.Reports.Reports.currentUserReport.params.fields)
      sel.select2('val', Katrid.Reports.Reports.currentUserReport.params.fields)
    sel = el.find('#report-id-totals')
    sel.append(aggs)
    .select2()
    .select2("container").find("ul.select2-choices").sortable
        containment: 'parent'
        start: -> sel.select2("onSortStart")
        update: -> sel.select2("onSortEnd")
    return el

  renderParams: (container) ->
    el = $('<div></div>')
    @elParams = el
    loaded = {}

    userParams = Katrid.Reports.Reports.currentUserReport.params
    if userParams and userParams.data
      for p in userParams.data
        loaded[p.name] = true
        @addParam(p.name, p.value)

    for p in @params
      if p.static and not loaded[p.name]
        $(p.render(el))
    container.find('#params-params').append(el)

  renderGrouping: (container) ->
    opts = ("""<option value="#{p.name}">#{p.label}</option>""" for p in @groupables).join('')
    el = container.find("#params-grouping")
    sel = el.find('select').select2()
    sel.append(opts)
    .select2("container").find("ul.select2-choices").sortable
        containment: 'parent'
        start: -> sel.select2("onSortStart")
        update: -> sel.select2("onSortEnd")

  renderSorting: (container) ->
    opts = ("""<option value="#{p.name}">#{p.label}</option>""" for p in @sortables when p.sortable).join('')
    el = container.find("#params-sorting")
    sel = el.find('select').select2()
    sel.append(opts)
    .select2("container").find("ul.select2-choices").sortable
        containment: 'parent'
        start: -> sel.select2("onSortStart")
        update: -> sel.select2("onSortEnd")

  render: (container) ->
    el = @renderFields()
    if @sortables.length
      el = @renderSorting(container)
    else
      container.find("#params-sorting").hide()

    if @groupables.length
      el = @renderGrouping(container)
    else
      container.find("#params-grouping").hide()

    el = @renderParams(container)


class Params
  @Operations =
    equals: 'equals'
    in: 'in'
    contains: 'contains'
    startsWith: 'startsWith'
    endsWith: 'endsWith'
    greaterThan: 'greaterThan'
    lessThan: 'lessThan'
    between: 'between'

  @Labels =
#    equals: Katrid.i18n.gettext 'Equals'
#    in: Katrid.i18n.gettext 'Selection'
#    contains: Katrid.i18n.gettext 'Contains'
#    startsWith: Katrid.i18n.gettext 'Starts with'
#    endsWith: Katrid.i18n.gettext 'Ends with'
#    greaterThan: Katrid.i18n.gettext 'Greater then'
#    lessThan: Katrid.i18n.gettext 'Less than'
#    between: Katrid.i18n.gettext 'Between'
    equals: Katrid.i18n.gettext 'É igual'
    in: Katrid.i18n.gettext 'Seleção'
    contains: Katrid.i18n.gettext 'Contendo'
    startsWith: Katrid.i18n.gettext 'Começando com'
    endsWith: Katrid.i18n.gettext 'Terminando com'
    greaterThan: Katrid.i18n.gettext 'Maior que'
    lessThan: Katrid.i18n.gettext 'Menor que'
    between: Katrid.i18n.gettext 'Entre'

  @DefaultOperations =
    str: @Operations.equals
    int: @Operations.equals
    datetime: @Operations.between
    float: @Operations.between
    decimal: @Operations.between
    sqlchoices: @Operations.equals

  @TypeOperations =
    str: [@Operations.equals, @Operations.in, @Operations.contains, @Operations.startsWith, @Operations.endsWith]
    int: [@Operations.equals, @Operations.in, @Operations.greaterThan, @Operations.lessThan, @Operations.between]
    float: [@Operations.equals, @Operations.in, @Operations.greaterThan, @Operations.lessThan, @Operations.between]
    decimal: [@Operations.equals, @Operations.in, @Operations.greaterThan, @Operations.lessThan, @Operations.between]
    datetime: [@Operations.equals, @Operations.in, @Operations.greaterThan, @Operations.lessThan, @Operations.between]
    sqlchoices: [@Operations.equals, @Operations.in]

  @Widgets =
    str: (param) ->
      """<div class="col-sm-8"><label class="control-label">&nbsp;</label><input id="rep-param-id-#{param.id}" ng-model="param.value1" type="text" class="form-control"></div>"""

    int: (param) ->
      if param.operation is 'between'
        """<div class="col-sm-4"><label class="control-label">&nbsp;</label><input id="rep-param-id-#{param.id}" ng-model="param.value1" type="text" class="form-control"></div>
<div class="col-sm-4"><label class="control-label">&nbsp;</label><input id="rep-param-id-#{param.id}-2" ng-model="param.value2" type="text" class="form-control"></div>
"""
      else
        """<div class="col-sm-4"><label class="control-label">&nbsp;</label><input id="rep-param-id-#{param.id}" type="number" ng-model="param.value1" class="form-control"></div>"""

    decimal: (param) ->
      if param.operation is 'between'
        """<div class="col-sm-4"><label class="control-label">&nbsp;</label><input id="rep-param-id-#{param.id}" ng-model="param.value1" type="text" class="form-control"></div>
<div class="col-sm-4"><label class="control-label">&nbsp;</label><input id="rep-param-id-#{param.id}-2" ng-model="param.value2" type="text" class="form-control"></div>
"""
      else
        """<div class="col-sm-4"><label class="control-label">&nbsp;</label><input id="rep-param-id-#{param.id}" type="number" ng-model="param.value1" class="form-control"></div>"""

    datetime: (param) ->
      if param.operation is 'between'
        """<div class="col-sm-4"><label class="control-label">&nbsp;</label>
<div class="input-group date"><input id="rep-param-id-#{param.id}" datepicker ng-model="param.value1" class="form-control">
<div class="input-group-addon"><span class="glyphicon glyphicon-th"></span></div>
</div></div>
<div class="col-sm-4"><label class="control-label">&nbsp;</label>
<div class="input-group date"><input id="rep-param-id-#{param.id}-2" datepicker ng-model="param.value2" class="form-control">
<div class="input-group-addon"><span class="glyphicon glyphicon-th"></span></div>
</div>
</div>
"""
      else
        """<div class="col-sm-4"><label class="control-label">&nbsp;</label>
<div class="input-group date"><input id="rep-param-id-#{param.id}" datepicker ng-model="param.value1" class="form-control">
<div class="input-group-addon"><span class="glyphicon glyphicon-th"></span></div>
</div>
</div>"""

    sqlchoices: (param) ->
      """<div class="col-sm-8"><label class="control-label">&nbsp;</label><input id="rep-param-id-#{param.id}" report-file="#{param.params.info.file}" ajax-choices="/api/reports/choices/" sql-choices="#{param.name}" ng-model="param.value1"></div>"""


class Param
  constructor: (@info, @params) ->
    @name = @info.name
    @label = @info.label
    @static = @info.param is 'static'
    @type = @info.type or 'str'
    if @info.sql_choices
      @type = 'sqlchoices'
    @defaultOperation = @info.default_operation or Params.DefaultOperations[@type]
    @operation = @defaultOperation
    @operations = @info.operations or Params.TypeOperations[@type]
    @exclude = @info.exclude
    @id = ++_counter

  defaultValue: ->
    null

  change: ->
    ops = @el.find("#param-op-#{@id}")
    op = ops.val()
    @operation = op
    @createControls(@el.scope())

  createControls: (scope) ->
    el = @el.find("#param-widget-#{@id}")
    el.empty()
    widget = Params.Widgets[@type](@)
    widget = @params.scope.compile(widget)(scope)
    el.append(widget)

  getOperations: ->
    operations = Params.TypeOperations[@type]
    opts = ''
    for op in operations
      label = Params.Labels[op]
      opts += """<option value="#{op}">#{label}</option>"""
    opts

  operationTemplate: ->
    opts = @getOperations()
    """<div class="col-sm-4"><label class="control-label">#{@label}</label><select id="param-op-#{@id}" ng-model="param.operation" ng-init="param.operation='#{@defaultOperation}'" class="form-control" onchange="$('#param-#{@id}').data('param').change();$('#rep-param-id-#{@id}')[0].focus()">
#{opts}
</select></div>"""

  template: ->
    operation = @operationTemplate()
    """<div id="param-#{@id}" class="row form-group" data-param="#{@name}" ng-controller="ParamController"><div class="col-sm-12">#{operation}<div id="param-widget-#{@id}"></div></div></div>"""

  render: (container) ->
    @el = @params.scope.compile(@template())(@params.scope)
    @el.data('param', @)
    console.log(@el.scope())
    @createControls(@el.scope())
    container.append(@el)


Katrid.uiKatrid.controller 'ParamController', ($scope, $element, $compile) ->
  $scope.param = {}


@Katrid.Reports =
  Reports: Reports
  Report: Report
  Param: Param
