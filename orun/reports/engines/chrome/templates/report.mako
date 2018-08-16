<%!
  from orun import app
%>
<%def name="static(uri)">file://${app.static_reverse(uri)}</%def>
