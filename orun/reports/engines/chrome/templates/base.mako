<%namespace name="common" file="common.mako"/>
<%namespace name="report" file="report.mako" inheritable="True"/>
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
      <%block name="styles"></%block>
    </head>
  </%block>
<body>
<%block name="header">
<row class="report-title">
  <column>
  <img id="logo" src="${company.base64_logo}"/>
  <div class="float-right text-right">
    % if company.report_header:
    <small class="float-right">
      ${company.report_header | linebreaks}
    </small>
    <br/>
    % endif
    <span class="float-right">${date}</span>
    <br/>
    <h2 class="float-right">
      <%block name="report_title">Report</%block>
    </h2>
  </div>
  </column>
</row>
</%block>

${next.body()}

<%block name="footer">
<footer>
##   ${(company.report_footer or str(company)) | linebreaks}
</footer>
</%block>

</body>
</html>

<%def name="table()">
  ${xml.render_table(caller.body())}
</%def>
