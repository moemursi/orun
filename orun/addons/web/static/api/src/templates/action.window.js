function pug_attr(t,e,n,f){return!1!==e&&null!=e&&(e||"class"!==t&&"style"!==t)?!0===e?" "+(f?t:t+'="'+t+'"'):("function"==typeof e.toJSON&&(e=e.toJSON()),"string"==typeof e||(e=JSON.stringify(e),n||-1===e.indexOf('"'))?(n&&(e=pug_escape(e))," "+t+'="'+e+'"'):" "+t+"='"+e.replace(/'/g,"&#39;")+"'"):""}
function pug_escape(e){var a=""+e,t=pug_match_html.exec(a);if(!t)return e;var r,c,n,s="";for(r=t.index,c=0;r<a.length;r++){switch(a.charCodeAt(r)){case 34:n="&quot;";break;case 38:n="&amp;";break;case 60:n="&lt;";break;case 62:n="&gt;";break;default:continue}c!==r&&(s+=a.substring(c,r)),c=r+1,s+=n}return c!==r?s+a.substring(c,r):s}
var pug_match_html=/["&<>]/;function template(locals) {var pug_html = "", pug_mixins = {}, pug_interp;;var locals_for_with = (locals || {});(function (viewCondition, viewTag, views) {// iterate views
;(function(){
  var $$obj = views;
  if ('number' == typeof $$obj.length) {
      for (var pug_index0 = 0, $$l = $$obj.length; pug_index0 < $$l; pug_index0++) {
        var view = $$obj[pug_index0];
viewTag = `${view.type}-view`
viewCondition = `action.viewType === '${view.type}'`
pug_html = pug_html + "\u003C" + (viewTag) + (" class=\"action-view\""+pug_attr("ng-if", viewCondition, true, false)) + "\u003E" + (null == (pug_interp = view.content) ? "" : pug_interp) + "\u003C\u002F" + (viewTag) + "\u003E";
      }
  } else {
    var $$l = 0;
    for (var pug_index0 in $$obj) {
      $$l++;
      var view = $$obj[pug_index0];
viewTag = `${view.type}-view`
viewCondition = `action.viewType === '${view.type}'`
pug_html = pug_html + "\u003C" + (viewTag) + (" class=\"action-view\""+pug_attr("ng-if", viewCondition, true, false)) + "\u003E" + (null == (pug_interp = view.content) ? "" : pug_interp) + "\u003C\u002F" + (viewTag) + "\u003E";
    }
  }
}).call(this);
}.call(this,"viewCondition" in locals_for_with?locals_for_with.viewCondition:typeof viewCondition!=="undefined"?viewCondition:undefined,"viewTag" in locals_for_with?locals_for_with.viewTag:typeof viewTag!=="undefined"?viewTag:undefined,"views" in locals_for_with?locals_for_with.views:typeof views!=="undefined"?views:undefined));;return pug_html;}