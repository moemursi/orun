<%namespace name="common" file="common.mako"/>
<%namespace name="report" file="report.mako"/>
<%!
  import datetime

  date = datetime.datetime.now()
%>
<html>
  <%block name="head">
    <head>
      <title>teste</title>
      % for ns in list(context.namespaces.values())[::-1]:
        % if hasattr(ns, 'includes'):
          ${ns.includes()}
        % endif
      % endfor
    </head>
  </%block>
<body>
<%block name="header">
<div class="report-title">
  <img id="logo" src="${report.static('/static/fsf/logo.png')}"/>
  <div class="float-right">
    <span class="float-right">${date}</span>
    <br/>
    <h3 class="float-right">Recomendação Técnica</h3>
  </div>
</div>
</%block>

${next.body()}

<%block name="footer">
<footer>
  Fazenda Santa Fé
</footer>
</%block>

</body>
</html>
