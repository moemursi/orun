<%namespace name="common" file="common.mako"/>
<%namespace name="report" file="report.mako"/>
<%!
  import datetime
  from orun import g

  date = datetime.datetime.now()
  company = g.user.user_company
%>
<html>
  <%block name="head">
    <head>
      <title>teste</title>
      <meta charset="UTF-8">
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
  <img id="logo" src="${company.base64_logo}"/>
  <div class="float-right">
    % if company.report_header:
    <small class="float-right">
      ${company.report_header}
    </small>
    <br/>
    % endif
    <span class="float-right">${date}</span>
    <br/>
    <h3 class="float-right">Recomendação Técnica</h3>
  </div>
</div>
</%block>

${next.body()}

<%block name="footer">
<footer>
  ${(company.report_footer or str(company)) | linebreaks}
</footer>
</%block>

</body>
</html>
