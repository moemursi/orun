<%!
  from orun import app
  from orun.reports.engines.chrome import xml
%>
<%def name="static(uri)">file://${app.static_reverse(uri)}</%def>

