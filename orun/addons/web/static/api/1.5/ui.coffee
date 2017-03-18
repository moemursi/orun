uiKatrid = angular.module('ui-katrid', [])


class View extends Katrid.Services.Model
  constructor: ->
    super 'ui.view'

  fromModel: (model) ->
    @post('from_model', null, {model: model})

@Katrid.UI =
  View: View

@Katrid.uiKatrid = uiKatrid
