Katrid.ui.registerTemplate('ir.action.report.pug', (function() {
  function pug_rethrow(n,e,r,t){if(!(n instanceof Error))throw n;if(!("undefined"==typeof window&&e||t))throw n.message+=" on line "+r,n;try{t=t||require("fs").readFileSync(e,"utf8")}catch(e){pug_rethrow(n,null,r)}var i=3,a=t.split("\n"),o=Math.max(r-i,0),h=Math.min(a.length,r+i),i=a.slice(o,h).map(function(n,e){var t=e+o+1;return(t==r?"  > ":"    ")+t+"| "+n}).join("\n");throw n.path=e,n.message=(e||"Pug")+":"+r+"\n"+i+"\n\n"+n.message,n}function template(locals) {var pug_html = "", pug_mixins = {}, pug_interp;var pug_debug_filename, pug_debug_line;try {} catch (err) {pug_rethrow(err, pug_debug_filename, pug_debug_line);};return pug_html;}
  return template;
})());

Katrid.ui.registerTemplate('ir.action.window.pug', (function() {
  function pug_attr(t,e,n,f){return!1!==e&&null!=e&&(e||"class"!==t&&"style"!==t)?!0===e?" "+(f?t:t+'="'+t+'"'):("function"==typeof e.toJSON&&(e=e.toJSON()),"string"==typeof e||(e=JSON.stringify(e),n||-1===e.indexOf('"'))?(n&&(e=pug_escape(e))," "+t+'="'+e+'"'):" "+t+"='"+e.replace(/'/g,"&#39;")+"'"):""}
function pug_escape(e){var a=""+e,t=pug_match_html.exec(a);if(!t)return e;var r,c,n,s="";for(r=t.index,c=0;r<a.length;r++){switch(a.charCodeAt(r)){case 34:n="&quot;";break;case 38:n="&amp;";break;case 60:n="&lt;";break;case 62:n="&gt;";break;default:continue}c!==r&&(s+=a.substring(c,r)),c=r+1,s+=n}return c!==r?s+a.substring(c,r):s}
var pug_match_html=/["&<>]/;
function pug_rethrow(n,e,r,t){if(!(n instanceof Error))throw n;if(!("undefined"==typeof window&&e||t))throw n.message+=" on line "+r,n;try{t=t||require("fs").readFileSync(e,"utf8")}catch(e){pug_rethrow(n,null,r)}var i=3,a=t.split("\n"),o=Math.max(r-i,0),h=Math.min(a.length,r+i),i=a.slice(o,h).map(function(n,e){var t=e+o+1;return(t==r?"  > ":"    ")+t+"| "+n}).join("\n");throw n.path=e,n.message=(e||"Pug")+":"+r+"\n"+i+"\n\n"+n.message,n}function template(locals) {var pug_html = "", pug_mixins = {}, pug_interp;var pug_debug_filename, pug_debug_line;try {;var locals_for_with = (locals || {});(function (viewCondition, viewTag, views) {;pug_debug_line = 1;pug_debug_filename = "src\u002Ftemplates\u002Fir.action.window.pug";
// iterate views
;(function(){
  var $$obj = views;
  if ('number' == typeof $$obj.length) {
      for (var pug_index0 = 0, $$l = $$obj.length; pug_index0 < $$l; pug_index0++) {
        var view = $$obj[pug_index0];
;pug_debug_line = 2;pug_debug_filename = "src\u002Ftemplates\u002Fir.action.window.pug";
viewTag = `${view.type}-view`
;pug_debug_line = 3;pug_debug_filename = "src\u002Ftemplates\u002Fir.action.window.pug";
viewCondition = `action.viewType === '${view.type}'`
;pug_debug_line = 4;pug_debug_filename = "src\u002Ftemplates\u002Fir.action.window.pug";
pug_html = pug_html + "\u003C" + (viewTag) + (" class=\"action-view\""+pug_attr("ng-if", viewCondition, true, false)) + "\u003E";
;pug_debug_line = 4;pug_debug_filename = "src\u002Ftemplates\u002Fir.action.window.pug";
pug_html = pug_html + (null == (pug_interp = view.content) ? "" : pug_interp) + "\u003C\u002F" + (viewTag) + "\u003E";
      }
  } else {
    var $$l = 0;
    for (var pug_index0 in $$obj) {
      $$l++;
      var view = $$obj[pug_index0];
;pug_debug_line = 2;pug_debug_filename = "src\u002Ftemplates\u002Fir.action.window.pug";
viewTag = `${view.type}-view`
;pug_debug_line = 3;pug_debug_filename = "src\u002Ftemplates\u002Fir.action.window.pug";
viewCondition = `action.viewType === '${view.type}'`
;pug_debug_line = 4;pug_debug_filename = "src\u002Ftemplates\u002Fir.action.window.pug";
pug_html = pug_html + "\u003C" + (viewTag) + (" class=\"action-view\""+pug_attr("ng-if", viewCondition, true, false)) + "\u003E";
;pug_debug_line = 4;pug_debug_filename = "src\u002Ftemplates\u002Fir.action.window.pug";
pug_html = pug_html + (null == (pug_interp = view.content) ? "" : pug_interp) + "\u003C\u002F" + (viewTag) + "\u003E";
    }
  }
}).call(this);
}.call(this,"viewCondition" in locals_for_with?locals_for_with.viewCondition:typeof viewCondition!=="undefined"?viewCondition:undefined,"viewTag" in locals_for_with?locals_for_with.viewTag:typeof viewTag!=="undefined"?viewTag:undefined,"views" in locals_for_with?locals_for_with.views:typeof views!=="undefined"?views:undefined));} catch (err) {pug_rethrow(err, pug_debug_filename, pug_debug_line);};return pug_html;}
  return template;
})());

Katrid.ui.registerTemplate('ui.numpad.pug', (function() {
  function pug_rethrow(n,e,r,t){if(!(n instanceof Error))throw n;if(!("undefined"==typeof window&&e||t))throw n.message+=" on line "+r,n;try{t=t||require("fs").readFileSync(e,"utf8")}catch(e){pug_rethrow(n,null,r)}var i=3,a=t.split("\n"),o=Math.max(r-i,0),h=Math.min(a.length,r+i),i=a.slice(o,h).map(function(n,e){var t=e+o+1;return(t==r?"  > ":"    ")+t+"| "+n}).join("\n");throw n.path=e,n.message=(e||"Pug")+":"+r+"\n"+i+"\n\n"+n.message,n}function template(locals) {var pug_html = "", pug_mixins = {}, pug_interp;var pug_debug_filename, pug_debug_line;try {;pug_debug_line = 1;pug_debug_filename = "src\u002Ftemplates\u002Fui.numpad.pug";
pug_html = pug_html + "\u003Cdiv class=\"modal\" role=\"dialog\"\u003E";
;pug_debug_line = 2;pug_debug_filename = "src\u002Ftemplates\u002Fui.numpad.pug";
pug_html = pug_html + "\u003Cdiv class=\"modal-dialog\" role=\"document\"\u003E";
;pug_debug_line = 3;pug_debug_filename = "src\u002Ftemplates\u002Fui.numpad.pug";
pug_html = pug_html + "\u003Cdiv class=\"modal-content\"\u003E";
;pug_debug_line = 4;pug_debug_filename = "src\u002Ftemplates\u002Fui.numpad.pug";
pug_html = pug_html + "\u003Cdiv class=\"modal-body numpad\"\u003E";
;pug_debug_line = 5;pug_debug_filename = "src\u002Ftemplates\u002Fui.numpad.pug";
pug_html = pug_html + "\u003Cdiv class=\"row\"\u003E";
;pug_debug_line = 6;pug_debug_filename = "src\u002Ftemplates\u002Fui.numpad.pug";
pug_html = pug_html + "\u003Cdiv class=\"col-12 numpad-display\"\u003E";
;pug_debug_line = 7;pug_debug_filename = "src\u002Ftemplates\u002Fui.numpad.pug";
pug_html = pug_html + "{{ val|number:2 }}\u003C\u002Fdiv\u003E\u003C\u002Fdiv\u003E";
;pug_debug_line = 8;pug_debug_filename = "src\u002Ftemplates\u002Fui.numpad.pug";
pug_html = pug_html + "\u003Cdiv class=\"row\"\u003E";
;pug_debug_line = 9;pug_debug_filename = "src\u002Ftemplates\u002Fui.numpad.pug";
pug_html = pug_html + "\u003Ctable\u003E";
;pug_debug_line = 10;pug_debug_filename = "src\u002Ftemplates\u002Fui.numpad.pug";
pug_html = pug_html + "\u003Ctr\u003E";
;pug_debug_line = 11;pug_debug_filename = "src\u002Ftemplates\u002Fui.numpad.pug";
pug_html = pug_html + "\u003Ctd\u003E";
;pug_debug_line = 12;pug_debug_filename = "src\u002Ftemplates\u002Fui.numpad.pug";
pug_html = pug_html + "\u003Cbutton class=\"btn btn-lg btn-block btn-num\" ng-click=\"buttonClick('1')\"\u003E";
;pug_debug_line = 12;pug_debug_filename = "src\u002Ftemplates\u002Fui.numpad.pug";
pug_html = pug_html + "1\u003C\u002Fbutton\u003E\u003C\u002Ftd\u003E";
;pug_debug_line = 13;pug_debug_filename = "src\u002Ftemplates\u002Fui.numpad.pug";
pug_html = pug_html + "\u003Ctd\u003E";
;pug_debug_line = 14;pug_debug_filename = "src\u002Ftemplates\u002Fui.numpad.pug";
pug_html = pug_html + "\u003Cbutton class=\"btn btn-lg btn-block btn-num\" ng-click=\"buttonClick('2')\"\u003E";
;pug_debug_line = 14;pug_debug_filename = "src\u002Ftemplates\u002Fui.numpad.pug";
pug_html = pug_html + "2\u003C\u002Fbutton\u003E\u003C\u002Ftd\u003E";
;pug_debug_line = 15;pug_debug_filename = "src\u002Ftemplates\u002Fui.numpad.pug";
pug_html = pug_html + "\u003Ctd\u003E";
;pug_debug_line = 16;pug_debug_filename = "src\u002Ftemplates\u002Fui.numpad.pug";
pug_html = pug_html + "\u003Cbutton class=\"btn btn-lg btn-block btn-num\" ng-click=\"buttonClick('3')\"\u003E";
;pug_debug_line = 16;pug_debug_filename = "src\u002Ftemplates\u002Fui.numpad.pug";
pug_html = pug_html + "3\u003C\u002Fbutton\u003E\u003C\u002Ftd\u003E";
;pug_debug_line = 17;pug_debug_filename = "src\u002Ftemplates\u002Fui.numpad.pug";
pug_html = pug_html + "\u003Ctd\u003E";
;pug_debug_line = 18;pug_debug_filename = "src\u002Ftemplates\u002Fui.numpad.pug";
pug_html = pug_html + "\u003Cbutton class=\"btn btn-lg btn-block\" ng-click=\"buttonClick('bs')\"\u003E";
;pug_debug_line = 19;pug_debug_filename = "src\u002Ftemplates\u002Fui.numpad.pug";
pug_html = pug_html + "\u003C\u003C\u002Fbutton\u003E\u003C\u002Ftd\u003E\u003C\u002Ftr\u003E";
;pug_debug_line = 22;pug_debug_filename = "src\u002Ftemplates\u002Fui.numpad.pug";
pug_html = pug_html + "\u003Ctr\u003E";
;pug_debug_line = 23;pug_debug_filename = "src\u002Ftemplates\u002Fui.numpad.pug";
pug_html = pug_html + "\u003Ctd\u003E";
;pug_debug_line = 24;pug_debug_filename = "src\u002Ftemplates\u002Fui.numpad.pug";
pug_html = pug_html + "\u003Cbutton class=\"btn btn-lg btn-block btn-num\" ng-click=\"buttonClick('4')\"\u003E";
;pug_debug_line = 24;pug_debug_filename = "src\u002Ftemplates\u002Fui.numpad.pug";
pug_html = pug_html + "4\u003C\u002Fbutton\u003E\u003C\u002Ftd\u003E";
;pug_debug_line = 25;pug_debug_filename = "src\u002Ftemplates\u002Fui.numpad.pug";
pug_html = pug_html + "\u003Ctd\u003E";
;pug_debug_line = 26;pug_debug_filename = "src\u002Ftemplates\u002Fui.numpad.pug";
pug_html = pug_html + "\u003Cbutton class=\"btn btn-lg btn-block btn-num\" ng-click=\"buttonClick('5')\"\u003E";
;pug_debug_line = 26;pug_debug_filename = "src\u002Ftemplates\u002Fui.numpad.pug";
pug_html = pug_html + "5\u003C\u002Fbutton\u003E\u003C\u002Ftd\u003E";
;pug_debug_line = 27;pug_debug_filename = "src\u002Ftemplates\u002Fui.numpad.pug";
pug_html = pug_html + "\u003Ctd\u003E";
;pug_debug_line = 28;pug_debug_filename = "src\u002Ftemplates\u002Fui.numpad.pug";
pug_html = pug_html + "\u003Cbutton class=\"btn btn-lg btn-block btn-num\" ng-click=\"buttonClick('6')\"\u003E";
;pug_debug_line = 28;pug_debug_filename = "src\u002Ftemplates\u002Fui.numpad.pug";
pug_html = pug_html + "6\u003C\u002Fbutton\u003E\u003C\u002Ftd\u003E";
;pug_debug_line = 29;pug_debug_filename = "src\u002Ftemplates\u002Fui.numpad.pug";
pug_html = pug_html + "\u003Ctd\u003E";
;pug_debug_line = 30;pug_debug_filename = "src\u002Ftemplates\u002Fui.numpad.pug";
pug_html = pug_html + "\u003Cbutton class=\"btn btn-lg btn-block\" ng-click=\"done()\"\u003E";
;pug_debug_line = 30;pug_debug_filename = "src\u002Ftemplates\u002Fui.numpad.pug";
pug_html = pug_html + "OK\u003C\u002Fbutton\u003E\u003C\u002Ftd\u003E\u003C\u002Ftr\u003E";
;pug_debug_line = 32;pug_debug_filename = "src\u002Ftemplates\u002Fui.numpad.pug";
pug_html = pug_html + "\u003Ctr\u003E";
;pug_debug_line = 33;pug_debug_filename = "src\u002Ftemplates\u002Fui.numpad.pug";
pug_html = pug_html + "\u003Ctd\u003E";
;pug_debug_line = 34;pug_debug_filename = "src\u002Ftemplates\u002Fui.numpad.pug";
pug_html = pug_html + "\u003Cbutton class=\"btn btn-lg btn-block btn-num\" ng-click=\"buttonClick('7')\"\u003E";
;pug_debug_line = 34;pug_debug_filename = "src\u002Ftemplates\u002Fui.numpad.pug";
pug_html = pug_html + "7\u003C\u002Fbutton\u003E\u003C\u002Ftd\u003E";
;pug_debug_line = 35;pug_debug_filename = "src\u002Ftemplates\u002Fui.numpad.pug";
pug_html = pug_html + "\u003Ctd\u003E";
;pug_debug_line = 36;pug_debug_filename = "src\u002Ftemplates\u002Fui.numpad.pug";
pug_html = pug_html + "\u003Cbutton class=\"btn btn-lg btn-block btn-num\" ng-click=\"buttonClick('8')\"\u003E";
;pug_debug_line = 36;pug_debug_filename = "src\u002Ftemplates\u002Fui.numpad.pug";
pug_html = pug_html + "8\u003C\u002Fbutton\u003E\u003C\u002Ftd\u003E";
;pug_debug_line = 37;pug_debug_filename = "src\u002Ftemplates\u002Fui.numpad.pug";
pug_html = pug_html + "\u003Ctd\u003E";
;pug_debug_line = 38;pug_debug_filename = "src\u002Ftemplates\u002Fui.numpad.pug";
pug_html = pug_html + "\u003Cbutton class=\"btn btn-lg btn-block btn-num\" ng-click=\"buttonClick('9')\"\u003E";
;pug_debug_line = 38;pug_debug_filename = "src\u002Ftemplates\u002Fui.numpad.pug";
pug_html = pug_html + "9\u003C\u002Fbutton\u003E\u003C\u002Ftd\u003E";
;pug_debug_line = 39;pug_debug_filename = "src\u002Ftemplates\u002Fui.numpad.pug";
pug_html = pug_html + "\u003Ctd\u003E";
;pug_debug_line = 40;pug_debug_filename = "src\u002Ftemplates\u002Fui.numpad.pug";
pug_html = pug_html + "\u003Cbutton class=\"btn btn-block\" ng-click=\"cancel()\"\u003E";
;pug_debug_line = 40;pug_debug_filename = "src\u002Ftemplates\u002Fui.numpad.pug";
pug_html = pug_html + "Cancelar\u003C\u002Fbutton\u003E\u003C\u002Ftd\u003E\u003C\u002Ftr\u003E";
;pug_debug_line = 42;pug_debug_filename = "src\u002Ftemplates\u002Fui.numpad.pug";
pug_html = pug_html + "\u003Ctr\u003E";
;pug_debug_line = 43;pug_debug_filename = "src\u002Ftemplates\u002Fui.numpad.pug";
pug_html = pug_html + "\u003Ctd\u003E\u003C\u002Ftd\u003E";
;pug_debug_line = 45;pug_debug_filename = "src\u002Ftemplates\u002Fui.numpad.pug";
pug_html = pug_html + "\u003Ctd\u003E";
;pug_debug_line = 46;pug_debug_filename = "src\u002Ftemplates\u002Fui.numpad.pug";
pug_html = pug_html + "\u003Cbutton class=\"btn btn-lg btn-block btn-num\" ng-click=\"buttonClick('0')\"\u003E";
;pug_debug_line = 46;pug_debug_filename = "src\u002Ftemplates\u002Fui.numpad.pug";
pug_html = pug_html + "0\u003C\u002Fbutton\u003E\u003C\u002Ftd\u003E";
;pug_debug_line = 47;pug_debug_filename = "src\u002Ftemplates\u002Fui.numpad.pug";
pug_html = pug_html + "\u003Ctd\u003E\u003C\u002Ftd\u003E";
;pug_debug_line = 49;pug_debug_filename = "src\u002Ftemplates\u002Fui.numpad.pug";
pug_html = pug_html + "\u003Ctd\u003E\u003C\u002Ftd\u003E\u003C\u002Ftr\u003E\u003C\u002Ftable\u003E\u003C\u002Fdiv\u003E\u003C\u002Fdiv\u003E\u003C\u002Fdiv\u003E\u003C\u002Fdiv\u003E\u003C\u002Fdiv\u003E";} catch (err) {pug_rethrow(err, pug_debug_filename, pug_debug_line);};return pug_html;}
  return template;
})());

Katrid.ui.registerTemplate('view.form.boolean-field.pug', (function() {
  function pug_attr(t,e,n,f){return!1!==e&&null!=e&&(e||"class"!==t&&"style"!==t)?!0===e?" "+(f?t:t+'="'+t+'"'):("function"==typeof e.toJSON&&(e=e.toJSON()),"string"==typeof e||(e=JSON.stringify(e),n||-1===e.indexOf('"'))?(n&&(e=pug_escape(e))," "+t+'="'+e+'"'):" "+t+"='"+e.replace(/'/g,"&#39;")+"'"):""}
function pug_attrs(t,r){var a="";for(var s in t)if(pug_has_own_property.call(t,s)){var u=t[s];if("class"===s){u=pug_classes(u),a=pug_attr(s,u,!1,r)+a;continue}"style"===s&&(u=pug_style(u)),a+=pug_attr(s,u,!1,r)}return a}
function pug_classes(s,r){return Array.isArray(s)?pug_classes_array(s,r):s&&"object"==typeof s?pug_classes_object(s):s||""}
function pug_classes_array(r,a){for(var s,e="",u="",c=Array.isArray(a),g=0;g<r.length;g++)(s=pug_classes(r[g]))&&(c&&a[g]&&(s=pug_escape(s)),e=e+u+s,u=" ");return e}
function pug_classes_object(r){var a="",n="";for(var o in r)o&&r[o]&&pug_has_own_property.call(r,o)&&(a=a+n+o,n=" ");return a}
function pug_escape(e){var a=""+e,t=pug_match_html.exec(a);if(!t)return e;var r,c,n,s="";for(r=t.index,c=0;r<a.length;r++){switch(a.charCodeAt(r)){case 34:n="&quot;";break;case 38:n="&amp;";break;case 60:n="&lt;";break;case 62:n="&gt;";break;default:continue}c!==r&&(s+=a.substring(c,r)),c=r+1,s+=n}return c!==r?s+a.substring(c,r):s}
var pug_has_own_property=Object.prototype.hasOwnProperty;
var pug_match_html=/["&<>]/;
function pug_merge(e,r){if(1===arguments.length){for(var t=e[0],g=1;g<e.length;g++)t=pug_merge(t,e[g]);return t}for(var l in r)if("class"===l){var n=e[l]||[];e[l]=(Array.isArray(n)?n:[n]).concat(r[l]||[])}else if("style"===l){var n=pug_style(e[l]);n=n&&";"!==n[n.length-1]?n+";":n;var a=pug_style(r[l]);a=a&&";"!==a[a.length-1]?a+";":a,e[l]=n+a}else e[l]=r[l];return e}
function pug_rethrow(n,e,r,t){if(!(n instanceof Error))throw n;if(!("undefined"==typeof window&&e||t))throw n.message+=" on line "+r,n;try{t=t||require("fs").readFileSync(e,"utf8")}catch(e){pug_rethrow(n,null,r)}var i=3,a=t.split("\n"),o=Math.max(r-i,0),h=Math.min(a.length,r+i),i=a.slice(o,h).map(function(n,e){var t=e+o+1;return(t==r?"  > ":"    ")+t+"| "+n}).join("\n");throw n.path=e,n.message=(e||"Pug")+":"+r+"\n"+i+"\n\n"+n.message,n}
function pug_style(r){if(!r)return"";if("object"==typeof r){var t="";for(var e in r)pug_has_own_property.call(r,e)&&(t=t+e+":"+r[e]+";");return t}return r+""}function template(locals) {var pug_html = "", pug_mixins = {}, pug_interp;var pug_debug_filename, pug_debug_line;try {;var locals_for_with = (locals || {});(function (Katrid, attrs, field, fieldAttributes, name, sectionAttrs) {;pug_debug_line = 1;pug_debug_filename = "src\u002Ftemplates\u002Fview.form.field.pug";
;pug_debug_line = 2;pug_debug_filename = "src\u002Ftemplates\u002Fview.form.field.pug";
var cssClass = 'StringField'
;pug_debug_line = 3;pug_debug_filename = "src\u002Ftemplates\u002Fview.form.field.pug";
var spanClass = 'form-field-readonly'
;pug_debug_line = 4;pug_debug_filename = "src\u002Ftemplates\u002Fview.form.field.pug";
var labelClass = 'form-label'
;pug_debug_line = 5;pug_debug_filename = "src\u002Ftemplates\u002Fview.form.field.pug";
if (fieldAttributes.inlineEditor) {
;pug_debug_line = 6;pug_debug_filename = "src\u002Ftemplates\u002Fview.form.field.pug";
var spanClass = 'grid-field-readonly'
}
else {
;pug_debug_line = 8;pug_debug_filename = "src\u002Ftemplates\u002Fview.form.field.pug";
var cols = 'col-md-' + (field.cols || '6')
;pug_debug_line = 9;pug_debug_filename = "src\u002Ftemplates\u002Fview.form.field.pug";
var formGroup = 'form-group'
}
;pug_debug_line = 10;pug_debug_filename = "src\u002Ftemplates\u002Fview.form.field.pug";
if (attrs.nolabel === 'placeholder') {
;pug_debug_line = 11;pug_debug_filename = "src\u002Ftemplates\u002Fview.form.field.pug";
attrs.placeholder = field.caption
}
;pug_debug_line = 4;pug_debug_filename = "src\u002Ftemplates\u002Fview.form.boolean-field.pug";
var cssClass = 'BooleanField'
;pug_debug_line = 5;pug_debug_filename = "src\u002Ftemplates\u002Fview.form.boolean-field.pug";
var labelClass = 'form-label form-label-checkbox'
;pug_debug_line = 6;pug_debug_filename = "src\u002Ftemplates\u002Fview.form.boolean-field.pug";
var spanClass = 'form-field-readonly bool-text'
;pug_debug_line = 12;pug_debug_filename = "src\u002Ftemplates\u002Fview.form.field.pug";
pug_html = pug_html + "\u003Csection" + (pug_attrs(pug_merge([{"class": pug_classes([[formGroup, cols, cssClass]], [true])},sectionAttrs]), false)) + "\u003E";
;pug_debug_line = 13;pug_debug_filename = "src\u002Ftemplates\u002Fview.form.field.pug";
;pug_debug_line = 12;pug_debug_filename = "src\u002Ftemplates\u002Fview.form.boolean-field.pug";
if (!attrs.nolabel && !fieldAttributes.inlineEditor) {
;pug_debug_line = 13;pug_debug_filename = "src\u002Ftemplates\u002Fview.form.boolean-field.pug";
pug_html = pug_html + "\u003Clabel" + (pug_attr("class", pug_classes([labelClass], [true]), false, false)) + "\u003E";
;pug_debug_line = 14;pug_debug_filename = "src\u002Ftemplates\u002Fview.form.boolean-field.pug";
pug_html = pug_html + "\u003Cspan\u003E";
;pug_debug_line = 14;pug_debug_filename = "src\u002Ftemplates\u002Fview.form.boolean-field.pug";
pug_html = pug_html + (pug_escape(null == (pug_interp = field.caption) ? "" : pug_interp)) + "\u003C\u002Fspan\u003E";
;pug_debug_line = 15;pug_debug_filename = "src\u002Ftemplates\u002Fview.form.boolean-field.pug";
pug_html = pug_html + "&nbsp;\u003C\u002Flabel\u003E";
}
;pug_debug_line = 17;pug_debug_filename = "src\u002Ftemplates\u002Fview.form.field.pug";
;pug_debug_line = 18;pug_debug_filename = "src\u002Ftemplates\u002Fview.form.field.pug";
pug_html = pug_html + "\u003Cspan" + (pug_attr("class", pug_classes([spanClass], [true]), false, false)) + "\u003E";
;pug_debug_line = 19;pug_debug_filename = "src\u002Ftemplates\u002Fview.form.field.pug";
;pug_debug_line = 9;pug_debug_filename = "src\u002Ftemplates\u002Fview.form.boolean-field.pug";
pug_html = pug_html + "{{ record.";
;pug_debug_line = 9;pug_debug_filename = "src\u002Ftemplates\u002Fview.form.boolean-field.pug";
pug_html = pug_html + (pug_escape(null == (pug_interp = name) ? "" : pug_interp));
;pug_debug_line = 9;pug_debug_filename = "src\u002Ftemplates\u002Fview.form.boolean-field.pug";
pug_html = pug_html + " ? '";
;pug_debug_line = 9;pug_debug_filename = "src\u002Ftemplates\u002Fview.form.boolean-field.pug";
pug_html = pug_html + (pug_escape(null == (pug_interp = Katrid.i18n.gettext('yes')) ? "" : pug_interp));
;pug_debug_line = 9;pug_debug_filename = "src\u002Ftemplates\u002Fview.form.boolean-field.pug";
pug_html = pug_html + "' : '";
;pug_debug_line = 9;pug_debug_filename = "src\u002Ftemplates\u002Fview.form.boolean-field.pug";
pug_html = pug_html + (pug_escape(null == (pug_interp = Katrid.i18n.gettext('no')) ? "" : pug_interp));
;pug_debug_line = 9;pug_debug_filename = "src\u002Ftemplates\u002Fview.form.boolean-field.pug";
pug_html = pug_html + "' }}\u003C\u002Fspan\u003E";
;pug_debug_line = 22;pug_debug_filename = "src\u002Ftemplates\u002Fview.form.field.pug";
;pug_debug_line = 18;pug_debug_filename = "src\u002Ftemplates\u002Fview.form.boolean-field.pug";
pug_html = pug_html + "\u003Clabel class=\"checkbox\" ng-show=\"dataSource.changing\"\u003E";
;pug_debug_line = 19;pug_debug_filename = "src\u002Ftemplates\u002Fview.form.boolean-field.pug";
pug_html = pug_html + "\u003Cinput" + (pug_attrs(pug_merge([{"class": "form-field form-control","type": "checkbox"},attrs]), false)) + "\u002F\u003E";
;pug_debug_line = 20;pug_debug_filename = "src\u002Ftemplates\u002Fview.form.boolean-field.pug";
if (field.helpText) {
;pug_debug_line = 21;pug_debug_filename = "src\u002Ftemplates\u002Fview.form.boolean-field.pug";
pug_html = pug_html + (pug_escape(null == (pug_interp = field.helpText) ? "" : pug_interp));
}
else {
;pug_debug_line = 23;pug_debug_filename = "src\u002Ftemplates\u002Fview.form.boolean-field.pug";
pug_html = pug_html + (pug_escape(null == (pug_interp = field.caption) ? "" : pug_interp));
}
;pug_debug_line = 24;pug_debug_filename = "src\u002Ftemplates\u002Fview.form.boolean-field.pug";
pug_html = pug_html + "\u003Ci\u003E\u003C\u002Fi\u003E\u003C\u002Flabel\u003E\u003C\u002Fsection\u003E";}.call(this,"Katrid" in locals_for_with?locals_for_with.Katrid:typeof Katrid!=="undefined"?Katrid:undefined,"attrs" in locals_for_with?locals_for_with.attrs:typeof attrs!=="undefined"?attrs:undefined,"field" in locals_for_with?locals_for_with.field:typeof field!=="undefined"?field:undefined,"fieldAttributes" in locals_for_with?locals_for_with.fieldAttributes:typeof fieldAttributes!=="undefined"?fieldAttributes:undefined,"name" in locals_for_with?locals_for_with.name:typeof name!=="undefined"?name:undefined,"sectionAttrs" in locals_for_with?locals_for_with.sectionAttrs:typeof sectionAttrs!=="undefined"?sectionAttrs:undefined));} catch (err) {pug_rethrow(err, pug_debug_filename, pug_debug_line);};return pug_html;}
  return template;
})());

Katrid.ui.registerTemplate('view.form.code-editor.pug', (function() {
  function pug_attr(t,e,n,f){return!1!==e&&null!=e&&(e||"class"!==t&&"style"!==t)?!0===e?" "+(f?t:t+'="'+t+'"'):("function"==typeof e.toJSON&&(e=e.toJSON()),"string"==typeof e||(e=JSON.stringify(e),n||-1===e.indexOf('"'))?(n&&(e=pug_escape(e))," "+t+'="'+e+'"'):" "+t+"='"+e.replace(/'/g,"&#39;")+"'"):""}
function pug_attrs(t,r){var a="";for(var s in t)if(pug_has_own_property.call(t,s)){var u=t[s];if("class"===s){u=pug_classes(u),a=pug_attr(s,u,!1,r)+a;continue}"style"===s&&(u=pug_style(u)),a+=pug_attr(s,u,!1,r)}return a}
function pug_classes(s,r){return Array.isArray(s)?pug_classes_array(s,r):s&&"object"==typeof s?pug_classes_object(s):s||""}
function pug_classes_array(r,a){for(var s,e="",u="",c=Array.isArray(a),g=0;g<r.length;g++)(s=pug_classes(r[g]))&&(c&&a[g]&&(s=pug_escape(s)),e=e+u+s,u=" ");return e}
function pug_classes_object(r){var a="",n="";for(var o in r)o&&r[o]&&pug_has_own_property.call(r,o)&&(a=a+n+o,n=" ");return a}
function pug_escape(e){var a=""+e,t=pug_match_html.exec(a);if(!t)return e;var r,c,n,s="";for(r=t.index,c=0;r<a.length;r++){switch(a.charCodeAt(r)){case 34:n="&quot;";break;case 38:n="&amp;";break;case 60:n="&lt;";break;case 62:n="&gt;";break;default:continue}c!==r&&(s+=a.substring(c,r)),c=r+1,s+=n}return c!==r?s+a.substring(c,r):s}
var pug_has_own_property=Object.prototype.hasOwnProperty;
var pug_match_html=/["&<>]/;
function pug_merge(e,r){if(1===arguments.length){for(var t=e[0],g=1;g<e.length;g++)t=pug_merge(t,e[g]);return t}for(var l in r)if("class"===l){var n=e[l]||[];e[l]=(Array.isArray(n)?n:[n]).concat(r[l]||[])}else if("style"===l){var n=pug_style(e[l]);n=n&&";"!==n[n.length-1]?n+";":n;var a=pug_style(r[l]);a=a&&";"!==a[a.length-1]?a+";":a,e[l]=n+a}else e[l]=r[l];return e}
function pug_rethrow(n,e,r,t){if(!(n instanceof Error))throw n;if(!("undefined"==typeof window&&e||t))throw n.message+=" on line "+r,n;try{t=t||require("fs").readFileSync(e,"utf8")}catch(e){pug_rethrow(n,null,r)}var i=3,a=t.split("\n"),o=Math.max(r-i,0),h=Math.min(a.length,r+i),i=a.slice(o,h).map(function(n,e){var t=e+o+1;return(t==r?"  > ":"    ")+t+"| "+n}).join("\n");throw n.path=e,n.message=(e||"Pug")+":"+r+"\n"+i+"\n\n"+n.message,n}
function pug_style(r){if(!r)return"";if("object"==typeof r){var t="";for(var e in r)pug_has_own_property.call(r,e)&&(t=t+e+":"+r[e]+";");return t}return r+""}function template(locals) {var pug_html = "", pug_mixins = {}, pug_interp;var pug_debug_filename, pug_debug_line;try {;var locals_for_with = (locals || {});(function (attrs, field, fieldAttributes, name, sectionAttrs) {;pug_debug_line = 1;pug_debug_filename = "src\u002Ftemplates\u002Fview.form.field.pug";
;pug_debug_line = 2;pug_debug_filename = "src\u002Ftemplates\u002Fview.form.field.pug";
var cssClass = 'StringField'
;pug_debug_line = 3;pug_debug_filename = "src\u002Ftemplates\u002Fview.form.field.pug";
var spanClass = 'form-field-readonly'
;pug_debug_line = 4;pug_debug_filename = "src\u002Ftemplates\u002Fview.form.field.pug";
var labelClass = 'form-label'
;pug_debug_line = 5;pug_debug_filename = "src\u002Ftemplates\u002Fview.form.field.pug";
if (fieldAttributes.inlineEditor) {
;pug_debug_line = 6;pug_debug_filename = "src\u002Ftemplates\u002Fview.form.field.pug";
var spanClass = 'grid-field-readonly'
}
else {
;pug_debug_line = 8;pug_debug_filename = "src\u002Ftemplates\u002Fview.form.field.pug";
var cols = 'col-md-' + (field.cols || '6')
;pug_debug_line = 9;pug_debug_filename = "src\u002Ftemplates\u002Fview.form.field.pug";
var formGroup = 'form-group'
}
;pug_debug_line = 10;pug_debug_filename = "src\u002Ftemplates\u002Fview.form.field.pug";
if (attrs.nolabel === 'placeholder') {
;pug_debug_line = 11;pug_debug_filename = "src\u002Ftemplates\u002Fview.form.field.pug";
attrs.placeholder = field.caption
}
;pug_debug_line = 4;pug_debug_filename = "src\u002Ftemplates\u002Fview.form.code-editor.pug";
var cssClass = 'TextField'
;pug_debug_line = 12;pug_debug_filename = "src\u002Ftemplates\u002Fview.form.field.pug";
pug_html = pug_html + "\u003Csection" + (pug_attrs(pug_merge([{"class": pug_classes([[formGroup, cols, cssClass]], [true])},sectionAttrs]), false)) + "\u003E";
;pug_debug_line = 13;pug_debug_filename = "src\u002Ftemplates\u002Fview.form.field.pug";
;pug_debug_line = 14;pug_debug_filename = "src\u002Ftemplates\u002Fview.form.field.pug";
if (!attrs.nolabel && !fieldAttributes.inlineEditor) {
;pug_debug_line = 15;pug_debug_filename = "src\u002Ftemplates\u002Fview.form.field.pug";
pug_html = pug_html + "\u003Clabel" + (pug_attr("class", pug_classes([labelClass], [true]), false, false)) + "\u003E";
;pug_debug_line = 15;pug_debug_filename = "src\u002Ftemplates\u002Fview.form.field.pug";
pug_html = pug_html + (pug_escape(null == (pug_interp = field.caption) ? "" : pug_interp)) + "\u003C\u002Flabel\u003E";
}
;pug_debug_line = 17;pug_debug_filename = "src\u002Ftemplates\u002Fview.form.field.pug";
;pug_debug_line = 18;pug_debug_filename = "src\u002Ftemplates\u002Fview.form.field.pug";
pug_html = pug_html + "\u003Cspan" + (pug_attr("class", pug_classes([spanClass], [true]), false, false)) + "\u003E";
;pug_debug_line = 19;pug_debug_filename = "src\u002Ftemplates\u002Fview.form.field.pug";
;pug_debug_line = 20;pug_debug_filename = "src\u002Ftemplates\u002Fview.form.field.pug";
pug_html = pug_html + "{{ record.";
;pug_debug_line = 20;pug_debug_filename = "src\u002Ftemplates\u002Fview.form.field.pug";
pug_html = pug_html + (pug_escape(null == (pug_interp = name) ? "" : pug_interp));
;pug_debug_line = 20;pug_debug_filename = "src\u002Ftemplates\u002Fview.form.field.pug";
pug_html = pug_html + "||'";
;pug_debug_line = 20;pug_debug_filename = "src\u002Ftemplates\u002Fview.form.field.pug";
pug_html = pug_html + (pug_escape(null == (pug_interp = field.emptyText) ? "" : pug_interp));
;pug_debug_line = 20;pug_debug_filename = "src\u002Ftemplates\u002Fview.form.field.pug";
pug_html = pug_html + "' }}\u003C\u002Fspan\u003E";
;pug_debug_line = 22;pug_debug_filename = "src\u002Ftemplates\u002Fview.form.field.pug";
;pug_debug_line = 7;pug_debug_filename = "src\u002Ftemplates\u002Fview.form.code-editor.pug";
pug_html = pug_html + "\u003Cdiv" + (pug_attrs(pug_merge([{"class": "form-field","code-editor": pug_escape(true),"code-editor-options": pug_escape(fieldAttributes.codeEditorOptions)},attrs]), false)) + "\u003E\u003C\u002Fdiv\u003E\u003C\u002Fsection\u003E";}.call(this,"attrs" in locals_for_with?locals_for_with.attrs:typeof attrs!=="undefined"?attrs:undefined,"field" in locals_for_with?locals_for_with.field:typeof field!=="undefined"?field:undefined,"fieldAttributes" in locals_for_with?locals_for_with.fieldAttributes:typeof fieldAttributes!=="undefined"?fieldAttributes:undefined,"name" in locals_for_with?locals_for_with.name:typeof name!=="undefined"?name:undefined,"sectionAttrs" in locals_for_with?locals_for_with.sectionAttrs:typeof sectionAttrs!=="undefined"?sectionAttrs:undefined));} catch (err) {pug_rethrow(err, pug_debug_filename, pug_debug_line);};return pug_html;}
  return template;
})());

Katrid.ui.registerTemplate('view.form.date-field.pug', (function() {
  function pug_attr(t,e,n,f){return!1!==e&&null!=e&&(e||"class"!==t&&"style"!==t)?!0===e?" "+(f?t:t+'="'+t+'"'):("function"==typeof e.toJSON&&(e=e.toJSON()),"string"==typeof e||(e=JSON.stringify(e),n||-1===e.indexOf('"'))?(n&&(e=pug_escape(e))," "+t+'="'+e+'"'):" "+t+"='"+e.replace(/'/g,"&#39;")+"'"):""}
function pug_attrs(t,r){var a="";for(var s in t)if(pug_has_own_property.call(t,s)){var u=t[s];if("class"===s){u=pug_classes(u),a=pug_attr(s,u,!1,r)+a;continue}"style"===s&&(u=pug_style(u)),a+=pug_attr(s,u,!1,r)}return a}
function pug_classes(s,r){return Array.isArray(s)?pug_classes_array(s,r):s&&"object"==typeof s?pug_classes_object(s):s||""}
function pug_classes_array(r,a){for(var s,e="",u="",c=Array.isArray(a),g=0;g<r.length;g++)(s=pug_classes(r[g]))&&(c&&a[g]&&(s=pug_escape(s)),e=e+u+s,u=" ");return e}
function pug_classes_object(r){var a="",n="";for(var o in r)o&&r[o]&&pug_has_own_property.call(r,o)&&(a=a+n+o,n=" ");return a}
function pug_escape(e){var a=""+e,t=pug_match_html.exec(a);if(!t)return e;var r,c,n,s="";for(r=t.index,c=0;r<a.length;r++){switch(a.charCodeAt(r)){case 34:n="&quot;";break;case 38:n="&amp;";break;case 60:n="&lt;";break;case 62:n="&gt;";break;default:continue}c!==r&&(s+=a.substring(c,r)),c=r+1,s+=n}return c!==r?s+a.substring(c,r):s}
var pug_has_own_property=Object.prototype.hasOwnProperty;
var pug_match_html=/["&<>]/;
function pug_merge(e,r){if(1===arguments.length){for(var t=e[0],g=1;g<e.length;g++)t=pug_merge(t,e[g]);return t}for(var l in r)if("class"===l){var n=e[l]||[];e[l]=(Array.isArray(n)?n:[n]).concat(r[l]||[])}else if("style"===l){var n=pug_style(e[l]);n=n&&";"!==n[n.length-1]?n+";":n;var a=pug_style(r[l]);a=a&&";"!==a[a.length-1]?a+";":a,e[l]=n+a}else e[l]=r[l];return e}
function pug_rethrow(n,e,r,t){if(!(n instanceof Error))throw n;if(!("undefined"==typeof window&&e||t))throw n.message+=" on line "+r,n;try{t=t||require("fs").readFileSync(e,"utf8")}catch(e){pug_rethrow(n,null,r)}var i=3,a=t.split("\n"),o=Math.max(r-i,0),h=Math.min(a.length,r+i),i=a.slice(o,h).map(function(n,e){var t=e+o+1;return(t==r?"  > ":"    ")+t+"| "+n}).join("\n");throw n.path=e,n.message=(e||"Pug")+":"+r+"\n"+i+"\n\n"+n.message,n}
function pug_style(r){if(!r)return"";if("object"==typeof r){var t="";for(var e in r)pug_has_own_property.call(r,e)&&(t=t+e+":"+r[e]+";");return t}return r+""}function template(locals) {var pug_html = "", pug_mixins = {}, pug_interp;var pug_debug_filename, pug_debug_line;try {;var locals_for_with = (locals || {});(function (_, attrs, field, fieldAttributes, name, sectionAttrs) {;pug_debug_line = 1;pug_debug_filename = "src\u002Ftemplates\u002Fview.form.field.pug";
;pug_debug_line = 2;pug_debug_filename = "src\u002Ftemplates\u002Fview.form.field.pug";
var cssClass = 'StringField'
;pug_debug_line = 3;pug_debug_filename = "src\u002Ftemplates\u002Fview.form.field.pug";
var spanClass = 'form-field-readonly'
;pug_debug_line = 4;pug_debug_filename = "src\u002Ftemplates\u002Fview.form.field.pug";
var labelClass = 'form-label'
;pug_debug_line = 5;pug_debug_filename = "src\u002Ftemplates\u002Fview.form.field.pug";
if (fieldAttributes.inlineEditor) {
;pug_debug_line = 6;pug_debug_filename = "src\u002Ftemplates\u002Fview.form.field.pug";
var spanClass = 'grid-field-readonly'
}
else {
;pug_debug_line = 8;pug_debug_filename = "src\u002Ftemplates\u002Fview.form.field.pug";
var cols = 'col-md-' + (field.cols || '6')
;pug_debug_line = 9;pug_debug_filename = "src\u002Ftemplates\u002Fview.form.field.pug";
var formGroup = 'form-group'
}
;pug_debug_line = 10;pug_debug_filename = "src\u002Ftemplates\u002Fview.form.field.pug";
if (attrs.nolabel === 'placeholder') {
;pug_debug_line = 11;pug_debug_filename = "src\u002Ftemplates\u002Fview.form.field.pug";
attrs.placeholder = field.caption
}
;pug_debug_line = 4;pug_debug_filename = "src\u002Ftemplates\u002Fview.form.date-field.pug";
var cssClass = 'DateField'
;pug_debug_line = 12;pug_debug_filename = "src\u002Ftemplates\u002Fview.form.field.pug";
pug_html = pug_html + "\u003Csection" + (pug_attrs(pug_merge([{"class": pug_classes([[formGroup, cols, cssClass]], [true])},sectionAttrs]), false)) + "\u003E";
;pug_debug_line = 13;pug_debug_filename = "src\u002Ftemplates\u002Fview.form.field.pug";
;pug_debug_line = 14;pug_debug_filename = "src\u002Ftemplates\u002Fview.form.field.pug";
if (!attrs.nolabel && !fieldAttributes.inlineEditor) {
;pug_debug_line = 15;pug_debug_filename = "src\u002Ftemplates\u002Fview.form.field.pug";
pug_html = pug_html + "\u003Clabel" + (pug_attr("class", pug_classes([labelClass], [true]), false, false)) + "\u003E";
;pug_debug_line = 15;pug_debug_filename = "src\u002Ftemplates\u002Fview.form.field.pug";
pug_html = pug_html + (pug_escape(null == (pug_interp = field.caption) ? "" : pug_interp)) + "\u003C\u002Flabel\u003E";
}
;pug_debug_line = 17;pug_debug_filename = "src\u002Ftemplates\u002Fview.form.field.pug";
;pug_debug_line = 18;pug_debug_filename = "src\u002Ftemplates\u002Fview.form.field.pug";
pug_html = pug_html + "\u003Cspan" + (pug_attr("class", pug_classes([spanClass], [true]), false, false)) + "\u003E";
;pug_debug_line = 19;pug_debug_filename = "src\u002Ftemplates\u002Fview.form.field.pug";
;pug_debug_line = 7;pug_debug_filename = "src\u002Ftemplates\u002Fview.form.date-field.pug";
pug_html = pug_html + "{{ (record.";
;pug_debug_line = 7;pug_debug_filename = "src\u002Ftemplates\u002Fview.form.date-field.pug";
pug_html = pug_html + (pug_escape(null == (pug_interp = name) ? "" : pug_interp));
;pug_debug_line = 7;pug_debug_filename = "src\u002Ftemplates\u002Fview.form.date-field.pug";
pug_html = pug_html + "|date:'";
;pug_debug_line = 7;pug_debug_filename = "src\u002Ftemplates\u002Fview.form.date-field.pug";
pug_html = pug_html + (pug_escape(null == (pug_interp = _.gettext('yyyy-mm-dd').replace(/[m]/g, 'M')) ? "" : pug_interp));
;pug_debug_line = 7;pug_debug_filename = "src\u002Ftemplates\u002Fview.form.date-field.pug";
pug_html = pug_html + "') || '";
;pug_debug_line = 7;pug_debug_filename = "src\u002Ftemplates\u002Fview.form.date-field.pug";
pug_html = pug_html + (pug_escape(null == (pug_interp = field.emptyText) ? "" : pug_interp));
;pug_debug_line = 7;pug_debug_filename = "src\u002Ftemplates\u002Fview.form.date-field.pug";
pug_html = pug_html + "' }}\u003C\u002Fspan\u003E";
;pug_debug_line = 22;pug_debug_filename = "src\u002Ftemplates\u002Fview.form.field.pug";
;pug_debug_line = 10;pug_debug_filename = "src\u002Ftemplates\u002Fview.form.date-field.pug";
pug_html = pug_html + "\u003Cinput" + (pug_attrs(pug_merge([{"class": "form-field form-control","date-input": pug_escape(true)},attrs]), false)) + "\u002F\u003E\u003C\u002Fsection\u003E";}.call(this,"_" in locals_for_with?locals_for_with._:typeof _!=="undefined"?_:undefined,"attrs" in locals_for_with?locals_for_with.attrs:typeof attrs!=="undefined"?attrs:undefined,"field" in locals_for_with?locals_for_with.field:typeof field!=="undefined"?field:undefined,"fieldAttributes" in locals_for_with?locals_for_with.fieldAttributes:typeof fieldAttributes!=="undefined"?fieldAttributes:undefined,"name" in locals_for_with?locals_for_with.name:typeof name!=="undefined"?name:undefined,"sectionAttrs" in locals_for_with?locals_for_with.sectionAttrs:typeof sectionAttrs!=="undefined"?sectionAttrs:undefined));} catch (err) {pug_rethrow(err, pug_debug_filename, pug_debug_line);};return pug_html;}
  return template;
})());

Katrid.ui.registerTemplate('view.form.field.pug', (function() {
  function pug_attr(t,e,n,f){return!1!==e&&null!=e&&(e||"class"!==t&&"style"!==t)?!0===e?" "+(f?t:t+'="'+t+'"'):("function"==typeof e.toJSON&&(e=e.toJSON()),"string"==typeof e||(e=JSON.stringify(e),n||-1===e.indexOf('"'))?(n&&(e=pug_escape(e))," "+t+'="'+e+'"'):" "+t+"='"+e.replace(/'/g,"&#39;")+"'"):""}
function pug_attrs(t,r){var a="";for(var s in t)if(pug_has_own_property.call(t,s)){var u=t[s];if("class"===s){u=pug_classes(u),a=pug_attr(s,u,!1,r)+a;continue}"style"===s&&(u=pug_style(u)),a+=pug_attr(s,u,!1,r)}return a}
function pug_classes(s,r){return Array.isArray(s)?pug_classes_array(s,r):s&&"object"==typeof s?pug_classes_object(s):s||""}
function pug_classes_array(r,a){for(var s,e="",u="",c=Array.isArray(a),g=0;g<r.length;g++)(s=pug_classes(r[g]))&&(c&&a[g]&&(s=pug_escape(s)),e=e+u+s,u=" ");return e}
function pug_classes_object(r){var a="",n="";for(var o in r)o&&r[o]&&pug_has_own_property.call(r,o)&&(a=a+n+o,n=" ");return a}
function pug_escape(e){var a=""+e,t=pug_match_html.exec(a);if(!t)return e;var r,c,n,s="";for(r=t.index,c=0;r<a.length;r++){switch(a.charCodeAt(r)){case 34:n="&quot;";break;case 38:n="&amp;";break;case 60:n="&lt;";break;case 62:n="&gt;";break;default:continue}c!==r&&(s+=a.substring(c,r)),c=r+1,s+=n}return c!==r?s+a.substring(c,r):s}
var pug_has_own_property=Object.prototype.hasOwnProperty;
var pug_match_html=/["&<>]/;
function pug_merge(e,r){if(1===arguments.length){for(var t=e[0],g=1;g<e.length;g++)t=pug_merge(t,e[g]);return t}for(var l in r)if("class"===l){var n=e[l]||[];e[l]=(Array.isArray(n)?n:[n]).concat(r[l]||[])}else if("style"===l){var n=pug_style(e[l]);n=n&&";"!==n[n.length-1]?n+";":n;var a=pug_style(r[l]);a=a&&";"!==a[a.length-1]?a+";":a,e[l]=n+a}else e[l]=r[l];return e}
function pug_rethrow(n,e,r,t){if(!(n instanceof Error))throw n;if(!("undefined"==typeof window&&e||t))throw n.message+=" on line "+r,n;try{t=t||require("fs").readFileSync(e,"utf8")}catch(e){pug_rethrow(n,null,r)}var i=3,a=t.split("\n"),o=Math.max(r-i,0),h=Math.min(a.length,r+i),i=a.slice(o,h).map(function(n,e){var t=e+o+1;return(t==r?"  > ":"    ")+t+"| "+n}).join("\n");throw n.path=e,n.message=(e||"Pug")+":"+r+"\n"+i+"\n\n"+n.message,n}
function pug_style(r){if(!r)return"";if("object"==typeof r){var t="";for(var e in r)pug_has_own_property.call(r,e)&&(t=t+e+":"+r[e]+";");return t}return r+""}function template(locals) {var pug_html = "", pug_mixins = {}, pug_interp;var pug_debug_filename, pug_debug_line;try {;var locals_for_with = (locals || {});(function (attrs, field, fieldAttributes, name, sectionAttrs) {;pug_debug_line = 1;pug_debug_filename = "src\u002Ftemplates\u002Fview.form.field.pug";
;pug_debug_line = 2;pug_debug_filename = "src\u002Ftemplates\u002Fview.form.field.pug";
var cssClass = 'StringField'
;pug_debug_line = 3;pug_debug_filename = "src\u002Ftemplates\u002Fview.form.field.pug";
var spanClass = 'form-field-readonly'
;pug_debug_line = 4;pug_debug_filename = "src\u002Ftemplates\u002Fview.form.field.pug";
var labelClass = 'form-label'
;pug_debug_line = 5;pug_debug_filename = "src\u002Ftemplates\u002Fview.form.field.pug";
if (fieldAttributes.inlineEditor) {
;pug_debug_line = 6;pug_debug_filename = "src\u002Ftemplates\u002Fview.form.field.pug";
var spanClass = 'grid-field-readonly'
}
else {
;pug_debug_line = 8;pug_debug_filename = "src\u002Ftemplates\u002Fview.form.field.pug";
var cols = 'col-md-' + (field.cols || '6')
;pug_debug_line = 9;pug_debug_filename = "src\u002Ftemplates\u002Fview.form.field.pug";
var formGroup = 'form-group'
}
;pug_debug_line = 10;pug_debug_filename = "src\u002Ftemplates\u002Fview.form.field.pug";
if (attrs.nolabel === 'placeholder') {
;pug_debug_line = 11;pug_debug_filename = "src\u002Ftemplates\u002Fview.form.field.pug";
attrs.placeholder = field.caption
}
;pug_debug_line = 12;pug_debug_filename = "src\u002Ftemplates\u002Fview.form.field.pug";
pug_html = pug_html + "\u003Csection" + (pug_attrs(pug_merge([{"class": pug_classes([[formGroup, cols, cssClass]], [true])},sectionAttrs]), false)) + "\u003E";
;pug_debug_line = 13;pug_debug_filename = "src\u002Ftemplates\u002Fview.form.field.pug";
;pug_debug_line = 14;pug_debug_filename = "src\u002Ftemplates\u002Fview.form.field.pug";
if (!attrs.nolabel && !fieldAttributes.inlineEditor) {
;pug_debug_line = 15;pug_debug_filename = "src\u002Ftemplates\u002Fview.form.field.pug";
pug_html = pug_html + "\u003Clabel" + (pug_attr("class", pug_classes([labelClass], [true]), false, false)) + "\u003E";
;pug_debug_line = 15;pug_debug_filename = "src\u002Ftemplates\u002Fview.form.field.pug";
pug_html = pug_html + (pug_escape(null == (pug_interp = field.caption) ? "" : pug_interp)) + "\u003C\u002Flabel\u003E";
}
;pug_debug_line = 17;pug_debug_filename = "src\u002Ftemplates\u002Fview.form.field.pug";
;pug_debug_line = 18;pug_debug_filename = "src\u002Ftemplates\u002Fview.form.field.pug";
pug_html = pug_html + "\u003Cspan" + (pug_attr("class", pug_classes([spanClass], [true]), false, false)) + "\u003E";
;pug_debug_line = 19;pug_debug_filename = "src\u002Ftemplates\u002Fview.form.field.pug";
;pug_debug_line = 20;pug_debug_filename = "src\u002Ftemplates\u002Fview.form.field.pug";
pug_html = pug_html + "{{ record.";
;pug_debug_line = 20;pug_debug_filename = "src\u002Ftemplates\u002Fview.form.field.pug";
pug_html = pug_html + (pug_escape(null == (pug_interp = name) ? "" : pug_interp));
;pug_debug_line = 20;pug_debug_filename = "src\u002Ftemplates\u002Fview.form.field.pug";
pug_html = pug_html + "||'";
;pug_debug_line = 20;pug_debug_filename = "src\u002Ftemplates\u002Fview.form.field.pug";
pug_html = pug_html + (pug_escape(null == (pug_interp = field.emptyText) ? "" : pug_interp));
;pug_debug_line = 20;pug_debug_filename = "src\u002Ftemplates\u002Fview.form.field.pug";
pug_html = pug_html + "' }}\u003C\u002Fspan\u003E";
;pug_debug_line = 22;pug_debug_filename = "src\u002Ftemplates\u002Fview.form.field.pug";
;pug_debug_line = 23;pug_debug_filename = "src\u002Ftemplates\u002Fview.form.field.pug";
pug_html = pug_html + "\u003Cinput" + (pug_attrs(pug_merge([{"class": "form-field form-control"},attrs]), false)) + "\u002F\u003E\u003C\u002Fsection\u003E";}.call(this,"attrs" in locals_for_with?locals_for_with.attrs:typeof attrs!=="undefined"?attrs:undefined,"field" in locals_for_with?locals_for_with.field:typeof field!=="undefined"?field:undefined,"fieldAttributes" in locals_for_with?locals_for_with.fieldAttributes:typeof fieldAttributes!=="undefined"?fieldAttributes:undefined,"name" in locals_for_with?locals_for_with.name:typeof name!=="undefined"?name:undefined,"sectionAttrs" in locals_for_with?locals_for_with.sectionAttrs:typeof sectionAttrs!=="undefined"?sectionAttrs:undefined));} catch (err) {pug_rethrow(err, pug_debug_filename, pug_debug_line);};return pug_html;}
  return template;
})());

Katrid.ui.registerTemplate('view.form.foreignkey.pug', (function() {
  function pug_attr(t,e,n,f){return!1!==e&&null!=e&&(e||"class"!==t&&"style"!==t)?!0===e?" "+(f?t:t+'="'+t+'"'):("function"==typeof e.toJSON&&(e=e.toJSON()),"string"==typeof e||(e=JSON.stringify(e),n||-1===e.indexOf('"'))?(n&&(e=pug_escape(e))," "+t+'="'+e+'"'):" "+t+"='"+e.replace(/'/g,"&#39;")+"'"):""}
function pug_attrs(t,r){var a="";for(var s in t)if(pug_has_own_property.call(t,s)){var u=t[s];if("class"===s){u=pug_classes(u),a=pug_attr(s,u,!1,r)+a;continue}"style"===s&&(u=pug_style(u)),a+=pug_attr(s,u,!1,r)}return a}
function pug_classes(s,r){return Array.isArray(s)?pug_classes_array(s,r):s&&"object"==typeof s?pug_classes_object(s):s||""}
function pug_classes_array(r,a){for(var s,e="",u="",c=Array.isArray(a),g=0;g<r.length;g++)(s=pug_classes(r[g]))&&(c&&a[g]&&(s=pug_escape(s)),e=e+u+s,u=" ");return e}
function pug_classes_object(r){var a="",n="";for(var o in r)o&&r[o]&&pug_has_own_property.call(r,o)&&(a=a+n+o,n=" ");return a}
function pug_escape(e){var a=""+e,t=pug_match_html.exec(a);if(!t)return e;var r,c,n,s="";for(r=t.index,c=0;r<a.length;r++){switch(a.charCodeAt(r)){case 34:n="&quot;";break;case 38:n="&amp;";break;case 60:n="&lt;";break;case 62:n="&gt;";break;default:continue}c!==r&&(s+=a.substring(c,r)),c=r+1,s+=n}return c!==r?s+a.substring(c,r):s}
var pug_has_own_property=Object.prototype.hasOwnProperty;
var pug_match_html=/["&<>]/;
function pug_merge(e,r){if(1===arguments.length){for(var t=e[0],g=1;g<e.length;g++)t=pug_merge(t,e[g]);return t}for(var l in r)if("class"===l){var n=e[l]||[];e[l]=(Array.isArray(n)?n:[n]).concat(r[l]||[])}else if("style"===l){var n=pug_style(e[l]);n=n&&";"!==n[n.length-1]?n+";":n;var a=pug_style(r[l]);a=a&&";"!==a[a.length-1]?a+";":a,e[l]=n+a}else e[l]=r[l];return e}
function pug_rethrow(n,e,r,t){if(!(n instanceof Error))throw n;if(!("undefined"==typeof window&&e||t))throw n.message+=" on line "+r,n;try{t=t||require("fs").readFileSync(e,"utf8")}catch(e){pug_rethrow(n,null,r)}var i=3,a=t.split("\n"),o=Math.max(r-i,0),h=Math.min(a.length,r+i),i=a.slice(o,h).map(function(n,e){var t=e+o+1;return(t==r?"  > ":"    ")+t+"| "+n}).join("\n");throw n.path=e,n.message=(e||"Pug")+":"+r+"\n"+i+"\n\n"+n.message,n}
function pug_style(r){if(!r)return"";if("object"==typeof r){var t="";for(var e in r)pug_has_own_property.call(r,e)&&(t=t+e+":"+r[e]+";");return t}return r+""}function template(locals) {var pug_html = "", pug_mixins = {}, pug_interp;var pug_debug_filename, pug_debug_line;try {;var locals_for_with = (locals || {});(function (attrs, field, fieldAttributes, name, sectionAttrs) {;pug_debug_line = 1;pug_debug_filename = "src\u002Ftemplates\u002Fview.form.field.pug";
;pug_debug_line = 2;pug_debug_filename = "src\u002Ftemplates\u002Fview.form.field.pug";
var cssClass = 'StringField'
;pug_debug_line = 3;pug_debug_filename = "src\u002Ftemplates\u002Fview.form.field.pug";
var spanClass = 'form-field-readonly'
;pug_debug_line = 4;pug_debug_filename = "src\u002Ftemplates\u002Fview.form.field.pug";
var labelClass = 'form-label'
;pug_debug_line = 5;pug_debug_filename = "src\u002Ftemplates\u002Fview.form.field.pug";
if (fieldAttributes.inlineEditor) {
;pug_debug_line = 6;pug_debug_filename = "src\u002Ftemplates\u002Fview.form.field.pug";
var spanClass = 'grid-field-readonly'
}
else {
;pug_debug_line = 8;pug_debug_filename = "src\u002Ftemplates\u002Fview.form.field.pug";
var cols = 'col-md-' + (field.cols || '6')
;pug_debug_line = 9;pug_debug_filename = "src\u002Ftemplates\u002Fview.form.field.pug";
var formGroup = 'form-group'
}
;pug_debug_line = 10;pug_debug_filename = "src\u002Ftemplates\u002Fview.form.field.pug";
if (attrs.nolabel === 'placeholder') {
;pug_debug_line = 11;pug_debug_filename = "src\u002Ftemplates\u002Fview.form.field.pug";
attrs.placeholder = field.caption
}
;pug_debug_line = 4;pug_debug_filename = "src\u002Ftemplates\u002Fview.form.foreignkey.pug";
var cssClass = 'ForeignKey'
;pug_debug_line = 12;pug_debug_filename = "src\u002Ftemplates\u002Fview.form.field.pug";
pug_html = pug_html + "\u003Csection" + (pug_attrs(pug_merge([{"class": pug_classes([[formGroup, cols, cssClass]], [true])},sectionAttrs]), false)) + "\u003E";
;pug_debug_line = 13;pug_debug_filename = "src\u002Ftemplates\u002Fview.form.field.pug";
;pug_debug_line = 14;pug_debug_filename = "src\u002Ftemplates\u002Fview.form.field.pug";
if (!attrs.nolabel && !fieldAttributes.inlineEditor) {
;pug_debug_line = 15;pug_debug_filename = "src\u002Ftemplates\u002Fview.form.field.pug";
pug_html = pug_html + "\u003Clabel" + (pug_attr("class", pug_classes([labelClass], [true]), false, false)) + "\u003E";
;pug_debug_line = 15;pug_debug_filename = "src\u002Ftemplates\u002Fview.form.field.pug";
pug_html = pug_html + (pug_escape(null == (pug_interp = field.caption) ? "" : pug_interp)) + "\u003C\u002Flabel\u003E";
}
;pug_debug_line = 17;pug_debug_filename = "src\u002Ftemplates\u002Fview.form.field.pug";
;pug_debug_line = 18;pug_debug_filename = "src\u002Ftemplates\u002Fview.form.field.pug";
pug_html = pug_html + "\u003Cspan" + (pug_attr("class", pug_classes([spanClass], [true]), false, false)) + "\u003E";
;pug_debug_line = 19;pug_debug_filename = "src\u002Ftemplates\u002Fview.form.field.pug";
;pug_debug_line = 7;pug_debug_filename = "src\u002Ftemplates\u002Fview.form.foreignkey.pug";
pug_html = pug_html + "{{ record.";
;pug_debug_line = 7;pug_debug_filename = "src\u002Ftemplates\u002Fview.form.foreignkey.pug";
pug_html = pug_html + (pug_escape(null == (pug_interp = name) ? "" : pug_interp));
;pug_debug_line = 7;pug_debug_filename = "src\u002Ftemplates\u002Fview.form.foreignkey.pug";
pug_html = pug_html + "[1]||'";
;pug_debug_line = 7;pug_debug_filename = "src\u002Ftemplates\u002Fview.form.foreignkey.pug";
pug_html = pug_html + (pug_escape(null == (pug_interp = field.emptyText) ? "" : pug_interp));
;pug_debug_line = 7;pug_debug_filename = "src\u002Ftemplates\u002Fview.form.foreignkey.pug";
pug_html = pug_html + "' }}\u003C\u002Fspan\u003E";
;pug_debug_line = 22;pug_debug_filename = "src\u002Ftemplates\u002Fview.form.field.pug";
;pug_debug_line = 10;pug_debug_filename = "src\u002Ftemplates\u002Fview.form.foreignkey.pug";
pug_html = pug_html + "\u003Cinput" + (pug_attrs(pug_merge([{"foreignkey": pug_escape(true)},attrs]), false)) + "\u002F\u003E\u003C\u002Fsection\u003E";}.call(this,"attrs" in locals_for_with?locals_for_with.attrs:typeof attrs!=="undefined"?attrs:undefined,"field" in locals_for_with?locals_for_with.field:typeof field!=="undefined"?field:undefined,"fieldAttributes" in locals_for_with?locals_for_with.fieldAttributes:typeof fieldAttributes!=="undefined"?fieldAttributes:undefined,"name" in locals_for_with?locals_for_with.name:typeof name!=="undefined"?name:undefined,"sectionAttrs" in locals_for_with?locals_for_with.sectionAttrs:typeof sectionAttrs!=="undefined"?sectionAttrs:undefined));} catch (err) {pug_rethrow(err, pug_debug_filename, pug_debug_line);};return pug_html;}
  return template;
})());

Katrid.ui.registerTemplate('view.form.grid.pug', (function() {
  function pug_attr(t,e,n,f){return!1!==e&&null!=e&&(e||"class"!==t&&"style"!==t)?!0===e?" "+(f?t:t+'="'+t+'"'):("function"==typeof e.toJSON&&(e=e.toJSON()),"string"==typeof e||(e=JSON.stringify(e),n||-1===e.indexOf('"'))?(n&&(e=pug_escape(e))," "+t+'="'+e+'"'):" "+t+"='"+e.replace(/'/g,"&#39;")+"'"):""}
function pug_attrs(t,r){var a="";for(var s in t)if(pug_has_own_property.call(t,s)){var u=t[s];if("class"===s){u=pug_classes(u),a=pug_attr(s,u,!1,r)+a;continue}"style"===s&&(u=pug_style(u)),a+=pug_attr(s,u,!1,r)}return a}
function pug_classes(s,r){return Array.isArray(s)?pug_classes_array(s,r):s&&"object"==typeof s?pug_classes_object(s):s||""}
function pug_classes_array(r,a){for(var s,e="",u="",c=Array.isArray(a),g=0;g<r.length;g++)(s=pug_classes(r[g]))&&(c&&a[g]&&(s=pug_escape(s)),e=e+u+s,u=" ");return e}
function pug_classes_object(r){var a="",n="";for(var o in r)o&&r[o]&&pug_has_own_property.call(r,o)&&(a=a+n+o,n=" ");return a}
function pug_escape(e){var a=""+e,t=pug_match_html.exec(a);if(!t)return e;var r,c,n,s="";for(r=t.index,c=0;r<a.length;r++){switch(a.charCodeAt(r)){case 34:n="&quot;";break;case 38:n="&amp;";break;case 60:n="&lt;";break;case 62:n="&gt;";break;default:continue}c!==r&&(s+=a.substring(c,r)),c=r+1,s+=n}return c!==r?s+a.substring(c,r):s}
var pug_has_own_property=Object.prototype.hasOwnProperty;
var pug_match_html=/["&<>]/;
function pug_merge(e,r){if(1===arguments.length){for(var t=e[0],g=1;g<e.length;g++)t=pug_merge(t,e[g]);return t}for(var l in r)if("class"===l){var n=e[l]||[];e[l]=(Array.isArray(n)?n:[n]).concat(r[l]||[])}else if("style"===l){var n=pug_style(e[l]);n=n&&";"!==n[n.length-1]?n+";":n;var a=pug_style(r[l]);a=a&&";"!==a[a.length-1]?a+";":a,e[l]=n+a}else e[l]=r[l];return e}
function pug_rethrow(n,e,r,t){if(!(n instanceof Error))throw n;if(!("undefined"==typeof window&&e||t))throw n.message+=" on line "+r,n;try{t=t||require("fs").readFileSync(e,"utf8")}catch(e){pug_rethrow(n,null,r)}var i=3,a=t.split("\n"),o=Math.max(r-i,0),h=Math.min(a.length,r+i),i=a.slice(o,h).map(function(n,e){var t=e+o+1;return(t==r?"  > ":"    ")+t+"| "+n}).join("\n");throw n.path=e,n.message=(e||"Pug")+":"+r+"\n"+i+"\n\n"+n.message,n}
function pug_style(r){if(!r)return"";if("object"==typeof r){var t="";for(var e in r)pug_has_own_property.call(r,e)&&(t=t+e+":"+r[e]+";");return t}return r+""}function template(locals) {var pug_html = "", pug_mixins = {}, pug_interp;var pug_debug_filename, pug_debug_line;try {;var locals_for_with = (locals || {});(function (attrs, content, field, fieldAttributes, sectionAttrs) {;pug_debug_line = 1;pug_debug_filename = "src\u002Ftemplates\u002Fview.form.field.pug";
;pug_debug_line = 2;pug_debug_filename = "src\u002Ftemplates\u002Fview.form.field.pug";
var cssClass = 'StringField'
;pug_debug_line = 3;pug_debug_filename = "src\u002Ftemplates\u002Fview.form.field.pug";
var spanClass = 'form-field-readonly'
;pug_debug_line = 4;pug_debug_filename = "src\u002Ftemplates\u002Fview.form.field.pug";
var labelClass = 'form-label'
;pug_debug_line = 5;pug_debug_filename = "src\u002Ftemplates\u002Fview.form.field.pug";
if (fieldAttributes.inlineEditor) {
;pug_debug_line = 6;pug_debug_filename = "src\u002Ftemplates\u002Fview.form.field.pug";
var spanClass = 'grid-field-readonly'
}
else {
;pug_debug_line = 8;pug_debug_filename = "src\u002Ftemplates\u002Fview.form.field.pug";
var cols = 'col-md-' + (field.cols || '6')
;pug_debug_line = 9;pug_debug_filename = "src\u002Ftemplates\u002Fview.form.field.pug";
var formGroup = 'form-group'
}
;pug_debug_line = 10;pug_debug_filename = "src\u002Ftemplates\u002Fview.form.field.pug";
if (attrs.nolabel === 'placeholder') {
;pug_debug_line = 11;pug_debug_filename = "src\u002Ftemplates\u002Fview.form.field.pug";
attrs.placeholder = field.caption
}
;pug_debug_line = 12;pug_debug_filename = "src\u002Ftemplates\u002Fview.form.field.pug";
pug_html = pug_html + "\u003Csection" + (pug_attrs(pug_merge([{"class": pug_classes([[formGroup, cols, cssClass]], [true])},sectionAttrs]), false)) + "\u003E";
;pug_debug_line = 13;pug_debug_filename = "src\u002Ftemplates\u002Fview.form.field.pug";
;pug_debug_line = 14;pug_debug_filename = "src\u002Ftemplates\u002Fview.form.field.pug";
if (!attrs.nolabel && !fieldAttributes.inlineEditor) {
;pug_debug_line = 15;pug_debug_filename = "src\u002Ftemplates\u002Fview.form.field.pug";
pug_html = pug_html + "\u003Clabel" + (pug_attr("class", pug_classes([labelClass], [true]), false, false)) + "\u003E";
;pug_debug_line = 15;pug_debug_filename = "src\u002Ftemplates\u002Fview.form.field.pug";
pug_html = pug_html + (pug_escape(null == (pug_interp = field.caption) ? "" : pug_interp)) + "\u003C\u002Flabel\u003E";
}
;pug_debug_line = 17;pug_debug_filename = "src\u002Ftemplates\u002Fview.form.field.pug";
;pug_debug_line = 22;pug_debug_filename = "src\u002Ftemplates\u002Fview.form.field.pug";
;pug_debug_line = 6;pug_debug_filename = "src\u002Ftemplates\u002Fview.form.grid.pug";
pug_html = pug_html + "\u003Cgrid" + (pug_attrs(attrs, false)) + "\u003E";
;pug_debug_line = 6;pug_debug_filename = "src\u002Ftemplates\u002Fview.form.grid.pug";
pug_html = pug_html + (null == (pug_interp = content) ? "" : pug_interp) + "\u003C\u002Fgrid\u003E\u003C\u002Fsection\u003E";}.call(this,"attrs" in locals_for_with?locals_for_with.attrs:typeof attrs!=="undefined"?attrs:undefined,"content" in locals_for_with?locals_for_with.content:typeof content!=="undefined"?content:undefined,"field" in locals_for_with?locals_for_with.field:typeof field!=="undefined"?field:undefined,"fieldAttributes" in locals_for_with?locals_for_with.fieldAttributes:typeof fieldAttributes!=="undefined"?fieldAttributes:undefined,"sectionAttrs" in locals_for_with?locals_for_with.sectionAttrs:typeof sectionAttrs!=="undefined"?sectionAttrs:undefined));} catch (err) {pug_rethrow(err, pug_debug_filename, pug_debug_line);};return pug_html;}
  return template;
})());

Katrid.ui.registerTemplate('view.form.grid.toolbar.pug', (function() {
  function pug_escape(e){var a=""+e,t=pug_match_html.exec(a);if(!t)return e;var r,c,n,s="";for(r=t.index,c=0;r<a.length;r++){switch(a.charCodeAt(r)){case 34:n="&quot;";break;case 38:n="&amp;";break;case 60:n="&lt;";break;case 62:n="&gt;";break;default:continue}c!==r&&(s+=a.substring(c,r)),c=r+1,s+=n}return c!==r?s+a.substring(c,r):s}
var pug_match_html=/["&<>]/;
function pug_rethrow(n,e,r,t){if(!(n instanceof Error))throw n;if(!("undefined"==typeof window&&e||t))throw n.message+=" on line "+r,n;try{t=t||require("fs").readFileSync(e,"utf8")}catch(e){pug_rethrow(n,null,r)}var i=3,a=t.split("\n"),o=Math.max(r-i,0),h=Math.min(a.length,r+i),i=a.slice(o,h).map(function(n,e){var t=e+o+1;return(t==r?"  > ":"    ")+t+"| "+n}).join("\n");throw n.path=e,n.message=(e||"Pug")+":"+r+"\n"+i+"\n\n"+n.message,n}function template(locals) {var pug_html = "", pug_mixins = {}, pug_interp;var pug_debug_filename, pug_debug_line;try {;var locals_for_with = (locals || {});(function (_) {;pug_debug_line = 1;pug_debug_filename = "src\u002Ftemplates\u002Fview.form.grid.toolbar.pug";
pug_html = pug_html + "\u003Cdiv class=\"grid-toolbar\" ng-show=\"parent.dataSource.changing\"\u003E";
;pug_debug_line = 2;pug_debug_filename = "src\u002Ftemplates\u002Fview.form.grid.toolbar.pug";
;pug_debug_line = 3;pug_debug_filename = "src\u002Ftemplates\u002Fview.form.grid.toolbar.pug";
pug_html = pug_html + "\u003Cbutton class=\"btn btn-xs btn-default\" ng-click=\"addItem()\"\u003E";
;pug_debug_line = 3;pug_debug_filename = "src\u002Ftemplates\u002Fview.form.grid.toolbar.pug";
pug_html = pug_html + (pug_escape(null == (pug_interp = _.gettext('Add')) ? "" : pug_interp)) + "\u003C\u002Fbutton\u003E\u003C\u002Fdiv\u003E";}.call(this,"_" in locals_for_with?locals_for_with._:typeof _!=="undefined"?_:undefined));} catch (err) {pug_rethrow(err, pug_debug_filename, pug_debug_line);};return pug_html;}
  return template;
})());

Katrid.ui.registerTemplate('view.form.image-field.pug', (function() {
  function pug_attr(t,e,n,f){return!1!==e&&null!=e&&(e||"class"!==t&&"style"!==t)?!0===e?" "+(f?t:t+'="'+t+'"'):("function"==typeof e.toJSON&&(e=e.toJSON()),"string"==typeof e||(e=JSON.stringify(e),n||-1===e.indexOf('"'))?(n&&(e=pug_escape(e))," "+t+'="'+e+'"'):" "+t+"='"+e.replace(/'/g,"&#39;")+"'"):""}
function pug_attrs(t,r){var a="";for(var s in t)if(pug_has_own_property.call(t,s)){var u=t[s];if("class"===s){u=pug_classes(u),a=pug_attr(s,u,!1,r)+a;continue}"style"===s&&(u=pug_style(u)),a+=pug_attr(s,u,!1,r)}return a}
function pug_classes(s,r){return Array.isArray(s)?pug_classes_array(s,r):s&&"object"==typeof s?pug_classes_object(s):s||""}
function pug_classes_array(r,a){for(var s,e="",u="",c=Array.isArray(a),g=0;g<r.length;g++)(s=pug_classes(r[g]))&&(c&&a[g]&&(s=pug_escape(s)),e=e+u+s,u=" ");return e}
function pug_classes_object(r){var a="",n="";for(var o in r)o&&r[o]&&pug_has_own_property.call(r,o)&&(a=a+n+o,n=" ");return a}
function pug_escape(e){var a=""+e,t=pug_match_html.exec(a);if(!t)return e;var r,c,n,s="";for(r=t.index,c=0;r<a.length;r++){switch(a.charCodeAt(r)){case 34:n="&quot;";break;case 38:n="&amp;";break;case 60:n="&lt;";break;case 62:n="&gt;";break;default:continue}c!==r&&(s+=a.substring(c,r)),c=r+1,s+=n}return c!==r?s+a.substring(c,r):s}
var pug_has_own_property=Object.prototype.hasOwnProperty;
var pug_match_html=/["&<>]/;
function pug_merge(e,r){if(1===arguments.length){for(var t=e[0],g=1;g<e.length;g++)t=pug_merge(t,e[g]);return t}for(var l in r)if("class"===l){var n=e[l]||[];e[l]=(Array.isArray(n)?n:[n]).concat(r[l]||[])}else if("style"===l){var n=pug_style(e[l]);n=n&&";"!==n[n.length-1]?n+";":n;var a=pug_style(r[l]);a=a&&";"!==a[a.length-1]?a+";":a,e[l]=n+a}else e[l]=r[l];return e}
function pug_rethrow(n,e,r,t){if(!(n instanceof Error))throw n;if(!("undefined"==typeof window&&e||t))throw n.message+=" on line "+r,n;try{t=t||require("fs").readFileSync(e,"utf8")}catch(e){pug_rethrow(n,null,r)}var i=3,a=t.split("\n"),o=Math.max(r-i,0),h=Math.min(a.length,r+i),i=a.slice(o,h).map(function(n,e){var t=e+o+1;return(t==r?"  > ":"    ")+t+"| "+n}).join("\n");throw n.path=e,n.message=(e||"Pug")+":"+r+"\n"+i+"\n\n"+n.message,n}
function pug_style(r){if(!r)return"";if("object"==typeof r){var t="";for(var e in r)pug_has_own_property.call(r,e)&&(t=t+e+":"+r[e]+";");return t}return r+""}function template(locals) {var pug_html = "", pug_mixins = {}, pug_interp;var pug_debug_filename, pug_debug_line;try {;var locals_for_with = (locals || {});(function (Katrid, attrs, field, fieldAttributes, sectionAttrs) {;pug_debug_line = 1;pug_debug_filename = "src\u002Ftemplates\u002Fview.form.field.pug";
;pug_debug_line = 2;pug_debug_filename = "src\u002Ftemplates\u002Fview.form.field.pug";
var cssClass = 'StringField'
;pug_debug_line = 3;pug_debug_filename = "src\u002Ftemplates\u002Fview.form.field.pug";
var spanClass = 'form-field-readonly'
;pug_debug_line = 4;pug_debug_filename = "src\u002Ftemplates\u002Fview.form.field.pug";
var labelClass = 'form-label'
;pug_debug_line = 5;pug_debug_filename = "src\u002Ftemplates\u002Fview.form.field.pug";
if (fieldAttributes.inlineEditor) {
;pug_debug_line = 6;pug_debug_filename = "src\u002Ftemplates\u002Fview.form.field.pug";
var spanClass = 'grid-field-readonly'
}
else {
;pug_debug_line = 8;pug_debug_filename = "src\u002Ftemplates\u002Fview.form.field.pug";
var cols = 'col-md-' + (field.cols || '6')
;pug_debug_line = 9;pug_debug_filename = "src\u002Ftemplates\u002Fview.form.field.pug";
var formGroup = 'form-group'
}
;pug_debug_line = 10;pug_debug_filename = "src\u002Ftemplates\u002Fview.form.field.pug";
if (attrs.nolabel === 'placeholder') {
;pug_debug_line = 11;pug_debug_filename = "src\u002Ftemplates\u002Fview.form.field.pug";
attrs.placeholder = field.caption
}
;pug_debug_line = 12;pug_debug_filename = "src\u002Ftemplates\u002Fview.form.field.pug";
pug_html = pug_html + "\u003Csection" + (pug_attrs(pug_merge([{"class": pug_classes([[formGroup, cols, cssClass]], [true])},sectionAttrs]), false)) + "\u003E";
;pug_debug_line = 13;pug_debug_filename = "src\u002Ftemplates\u002Fview.form.field.pug";
;pug_debug_line = 14;pug_debug_filename = "src\u002Ftemplates\u002Fview.form.field.pug";
if (!attrs.nolabel && !fieldAttributes.inlineEditor) {
;pug_debug_line = 15;pug_debug_filename = "src\u002Ftemplates\u002Fview.form.field.pug";
pug_html = pug_html + "\u003Clabel" + (pug_attr("class", pug_classes([labelClass], [true]), false, false)) + "\u003E";
;pug_debug_line = 15;pug_debug_filename = "src\u002Ftemplates\u002Fview.form.field.pug";
pug_html = pug_html + (pug_escape(null == (pug_interp = field.caption) ? "" : pug_interp)) + "\u003C\u002Flabel\u003E";
}
;pug_debug_line = 17;pug_debug_filename = "src\u002Ftemplates\u002Fview.form.field.pug";
;pug_debug_line = 22;pug_debug_filename = "src\u002Ftemplates\u002Fview.form.field.pug";
;pug_debug_line = 6;pug_debug_filename = "src\u002Ftemplates\u002Fview.form.image-field.pug";
pug_html = pug_html + "\u003Cdiv class=\"image-box image-field\"\u003E";
;pug_debug_line = 7;pug_debug_filename = "src\u002Ftemplates\u002Fview.form.image-field.pug";
pug_html = pug_html + "\u003Cimg" + (pug_attr("ng-src", attrs.ngSrc, true, false)) + "\u002F\u003E";
;pug_debug_line = 8;pug_debug_filename = "src\u002Ftemplates\u002Fview.form.image-field.pug";
pug_html = pug_html + "\u003Cdiv class=\"text-right image-box-buttons\"\u003E";
;pug_debug_line = 9;pug_debug_filename = "src\u002Ftemplates\u002Fview.form.image-field.pug";
pug_html = pug_html + "\u003Cbutton" + (" class=\"btn btn-default\""+" type=\"button\""+pug_attr("title", Katrid.i18n.gettext('Change'), true, false)+" onclick=\"$(this).closest('.image-box').find('input').trigger('click')\"") + "\u003E";
;pug_debug_line = 10;pug_debug_filename = "src\u002Ftemplates\u002Fview.form.image-field.pug";
pug_html = pug_html + "\u003Ci class=\"fa fa-pencil\"\u003E\u003C\u002Fi\u003E\u003C\u002Fbutton\u003E";
;pug_debug_line = 11;pug_debug_filename = "src\u002Ftemplates\u002Fview.form.image-field.pug";
pug_html = pug_html + "\u003Cbutton" + (" class=\"btn btn-default\""+" type=\"button\""+pug_attr("title", Katrid.i18n.gettext('Clear'), true, false)+pug_attr("ng-click", "$set(" + attrs.name + ", null)", true, false)) + "\u003E";
;pug_debug_line = 12;pug_debug_filename = "src\u002Ftemplates\u002Fview.form.image-field.pug";
pug_html = pug_html + "\u003Ci class=\"fa fa-trash\"\u003E\u003C\u002Fi\u003E\u003C\u002Fbutton\u003E\u003C\u002Fdiv\u003E";
;pug_debug_line = 13;pug_debug_filename = "src\u002Ftemplates\u002Fview.form.image-field.pug";
pug_html = pug_html + "\u003Cinput" + (" type=\"file\""+pug_attr("file-reader", true, true, false)+" accept=\"image\u002F*\""+pug_attr("ng-model", attrs['ng-model'], true, false)) + "\u002F\u003E\u003C\u002Fdiv\u003E\u003C\u002Fsection\u003E";}.call(this,"Katrid" in locals_for_with?locals_for_with.Katrid:typeof Katrid!=="undefined"?Katrid:undefined,"attrs" in locals_for_with?locals_for_with.attrs:typeof attrs!=="undefined"?attrs:undefined,"field" in locals_for_with?locals_for_with.field:typeof field!=="undefined"?field:undefined,"fieldAttributes" in locals_for_with?locals_for_with.fieldAttributes:typeof fieldAttributes!=="undefined"?fieldAttributes:undefined,"sectionAttrs" in locals_for_with?locals_for_with.sectionAttrs:typeof sectionAttrs!=="undefined"?sectionAttrs:undefined));} catch (err) {pug_rethrow(err, pug_debug_filename, pug_debug_line);};return pug_html;}
  return template;
})());

Katrid.ui.registerTemplate('view.form.numeric-field.pug', (function() {
  function pug_attr(t,e,n,f){return!1!==e&&null!=e&&(e||"class"!==t&&"style"!==t)?!0===e?" "+(f?t:t+'="'+t+'"'):("function"==typeof e.toJSON&&(e=e.toJSON()),"string"==typeof e||(e=JSON.stringify(e),n||-1===e.indexOf('"'))?(n&&(e=pug_escape(e))," "+t+'="'+e+'"'):" "+t+"='"+e.replace(/'/g,"&#39;")+"'"):""}
function pug_attrs(t,r){var a="";for(var s in t)if(pug_has_own_property.call(t,s)){var u=t[s];if("class"===s){u=pug_classes(u),a=pug_attr(s,u,!1,r)+a;continue}"style"===s&&(u=pug_style(u)),a+=pug_attr(s,u,!1,r)}return a}
function pug_classes(s,r){return Array.isArray(s)?pug_classes_array(s,r):s&&"object"==typeof s?pug_classes_object(s):s||""}
function pug_classes_array(r,a){for(var s,e="",u="",c=Array.isArray(a),g=0;g<r.length;g++)(s=pug_classes(r[g]))&&(c&&a[g]&&(s=pug_escape(s)),e=e+u+s,u=" ");return e}
function pug_classes_object(r){var a="",n="";for(var o in r)o&&r[o]&&pug_has_own_property.call(r,o)&&(a=a+n+o,n=" ");return a}
function pug_escape(e){var a=""+e,t=pug_match_html.exec(a);if(!t)return e;var r,c,n,s="";for(r=t.index,c=0;r<a.length;r++){switch(a.charCodeAt(r)){case 34:n="&quot;";break;case 38:n="&amp;";break;case 60:n="&lt;";break;case 62:n="&gt;";break;default:continue}c!==r&&(s+=a.substring(c,r)),c=r+1,s+=n}return c!==r?s+a.substring(c,r):s}
var pug_has_own_property=Object.prototype.hasOwnProperty;
var pug_match_html=/["&<>]/;
function pug_merge(e,r){if(1===arguments.length){for(var t=e[0],g=1;g<e.length;g++)t=pug_merge(t,e[g]);return t}for(var l in r)if("class"===l){var n=e[l]||[];e[l]=(Array.isArray(n)?n:[n]).concat(r[l]||[])}else if("style"===l){var n=pug_style(e[l]);n=n&&";"!==n[n.length-1]?n+";":n;var a=pug_style(r[l]);a=a&&";"!==a[a.length-1]?a+";":a,e[l]=n+a}else e[l]=r[l];return e}
function pug_rethrow(n,e,r,t){if(!(n instanceof Error))throw n;if(!("undefined"==typeof window&&e||t))throw n.message+=" on line "+r,n;try{t=t||require("fs").readFileSync(e,"utf8")}catch(e){pug_rethrow(n,null,r)}var i=3,a=t.split("\n"),o=Math.max(r-i,0),h=Math.min(a.length,r+i),i=a.slice(o,h).map(function(n,e){var t=e+o+1;return(t==r?"  > ":"    ")+t+"| "+n}).join("\n");throw n.path=e,n.message=(e||"Pug")+":"+r+"\n"+i+"\n\n"+n.message,n}
function pug_style(r){if(!r)return"";if("object"==typeof r){var t="";for(var e in r)pug_has_own_property.call(r,e)&&(t=t+e+":"+r[e]+";");return t}return r+""}function template(locals) {var pug_html = "", pug_mixins = {}, pug_interp;var pug_debug_filename, pug_debug_line;try {;var locals_for_with = (locals || {});(function (attrs, field, fieldAttributes, name, sectionAttrs) {;pug_debug_line = 1;pug_debug_filename = "src\u002Ftemplates\u002Fview.form.field.pug";
;pug_debug_line = 2;pug_debug_filename = "src\u002Ftemplates\u002Fview.form.field.pug";
var cssClass = 'StringField'
;pug_debug_line = 3;pug_debug_filename = "src\u002Ftemplates\u002Fview.form.field.pug";
var spanClass = 'form-field-readonly'
;pug_debug_line = 4;pug_debug_filename = "src\u002Ftemplates\u002Fview.form.field.pug";
var labelClass = 'form-label'
;pug_debug_line = 5;pug_debug_filename = "src\u002Ftemplates\u002Fview.form.field.pug";
if (fieldAttributes.inlineEditor) {
;pug_debug_line = 6;pug_debug_filename = "src\u002Ftemplates\u002Fview.form.field.pug";
var spanClass = 'grid-field-readonly'
}
else {
;pug_debug_line = 8;pug_debug_filename = "src\u002Ftemplates\u002Fview.form.field.pug";
var cols = 'col-md-' + (field.cols || '6')
;pug_debug_line = 9;pug_debug_filename = "src\u002Ftemplates\u002Fview.form.field.pug";
var formGroup = 'form-group'
}
;pug_debug_line = 10;pug_debug_filename = "src\u002Ftemplates\u002Fview.form.field.pug";
if (attrs.nolabel === 'placeholder') {
;pug_debug_line = 11;pug_debug_filename = "src\u002Ftemplates\u002Fview.form.field.pug";
attrs.placeholder = field.caption
}
;pug_debug_line = 4;pug_debug_filename = "src\u002Ftemplates\u002Fview.form.numeric-field.pug";
var cssClass = 'DecimalField'
;pug_debug_line = 12;pug_debug_filename = "src\u002Ftemplates\u002Fview.form.field.pug";
pug_html = pug_html + "\u003Csection" + (pug_attrs(pug_merge([{"class": pug_classes([[formGroup, cols, cssClass]], [true])},sectionAttrs]), false)) + "\u003E";
;pug_debug_line = 13;pug_debug_filename = "src\u002Ftemplates\u002Fview.form.field.pug";
;pug_debug_line = 14;pug_debug_filename = "src\u002Ftemplates\u002Fview.form.field.pug";
if (!attrs.nolabel && !fieldAttributes.inlineEditor) {
;pug_debug_line = 15;pug_debug_filename = "src\u002Ftemplates\u002Fview.form.field.pug";
pug_html = pug_html + "\u003Clabel" + (pug_attr("class", pug_classes([labelClass], [true]), false, false)) + "\u003E";
;pug_debug_line = 15;pug_debug_filename = "src\u002Ftemplates\u002Fview.form.field.pug";
pug_html = pug_html + (pug_escape(null == (pug_interp = field.caption) ? "" : pug_interp)) + "\u003C\u002Flabel\u003E";
}
;pug_debug_line = 17;pug_debug_filename = "src\u002Ftemplates\u002Fview.form.field.pug";
;pug_debug_line = 18;pug_debug_filename = "src\u002Ftemplates\u002Fview.form.field.pug";
pug_html = pug_html + "\u003Cspan" + (pug_attr("class", pug_classes([spanClass], [true]), false, false)) + "\u003E";
;pug_debug_line = 19;pug_debug_filename = "src\u002Ftemplates\u002Fview.form.field.pug";
;pug_debug_line = 7;pug_debug_filename = "src\u002Ftemplates\u002Fview.form.numeric-field.pug";
pug_html = pug_html + "{{ (record.";
;pug_debug_line = 7;pug_debug_filename = "src\u002Ftemplates\u002Fview.form.numeric-field.pug";
pug_html = pug_html + (pug_escape(null == (pug_interp = name) ? "" : pug_interp));
;pug_debug_line = 7;pug_debug_filename = "src\u002Ftemplates\u002Fview.form.numeric-field.pug";
pug_html = pug_html + "|number:2) || '";
;pug_debug_line = 7;pug_debug_filename = "src\u002Ftemplates\u002Fview.form.numeric-field.pug";
pug_html = pug_html + (pug_escape(null == (pug_interp = field.emptyText) ? "" : pug_interp));
;pug_debug_line = 7;pug_debug_filename = "src\u002Ftemplates\u002Fview.form.numeric-field.pug";
pug_html = pug_html + "' }}\u003C\u002Fspan\u003E";
;pug_debug_line = 22;pug_debug_filename = "src\u002Ftemplates\u002Fview.form.field.pug";
;pug_debug_line = 10;pug_debug_filename = "src\u002Ftemplates\u002Fview.form.numeric-field.pug";
pug_html = pug_html + "\u003Cinput" + (pug_attrs(pug_merge([{"class": "form-field form-control","decimal": pug_escape(true)},attrs]), false)) + "\u002F\u003E\u003C\u002Fsection\u003E";}.call(this,"attrs" in locals_for_with?locals_for_with.attrs:typeof attrs!=="undefined"?attrs:undefined,"field" in locals_for_with?locals_for_with.field:typeof field!=="undefined"?field:undefined,"fieldAttributes" in locals_for_with?locals_for_with.fieldAttributes:typeof fieldAttributes!=="undefined"?fieldAttributes:undefined,"name" in locals_for_with?locals_for_with.name:typeof name!=="undefined"?name:undefined,"sectionAttrs" in locals_for_with?locals_for_with.sectionAttrs:typeof sectionAttrs!=="undefined"?sectionAttrs:undefined));} catch (err) {pug_rethrow(err, pug_debug_filename, pug_debug_line);};return pug_html;}
  return template;
})());

Katrid.ui.registerTemplate('view.form.numpad-field.pug', (function() {
  function pug_attr(t,e,n,f){return!1!==e&&null!=e&&(e||"class"!==t&&"style"!==t)?!0===e?" "+(f?t:t+'="'+t+'"'):("function"==typeof e.toJSON&&(e=e.toJSON()),"string"==typeof e||(e=JSON.stringify(e),n||-1===e.indexOf('"'))?(n&&(e=pug_escape(e))," "+t+'="'+e+'"'):" "+t+"='"+e.replace(/'/g,"&#39;")+"'"):""}
function pug_attrs(t,r){var a="";for(var s in t)if(pug_has_own_property.call(t,s)){var u=t[s];if("class"===s){u=pug_classes(u),a=pug_attr(s,u,!1,r)+a;continue}"style"===s&&(u=pug_style(u)),a+=pug_attr(s,u,!1,r)}return a}
function pug_classes(s,r){return Array.isArray(s)?pug_classes_array(s,r):s&&"object"==typeof s?pug_classes_object(s):s||""}
function pug_classes_array(r,a){for(var s,e="",u="",c=Array.isArray(a),g=0;g<r.length;g++)(s=pug_classes(r[g]))&&(c&&a[g]&&(s=pug_escape(s)),e=e+u+s,u=" ");return e}
function pug_classes_object(r){var a="",n="";for(var o in r)o&&r[o]&&pug_has_own_property.call(r,o)&&(a=a+n+o,n=" ");return a}
function pug_escape(e){var a=""+e,t=pug_match_html.exec(a);if(!t)return e;var r,c,n,s="";for(r=t.index,c=0;r<a.length;r++){switch(a.charCodeAt(r)){case 34:n="&quot;";break;case 38:n="&amp;";break;case 60:n="&lt;";break;case 62:n="&gt;";break;default:continue}c!==r&&(s+=a.substring(c,r)),c=r+1,s+=n}return c!==r?s+a.substring(c,r):s}
var pug_has_own_property=Object.prototype.hasOwnProperty;
var pug_match_html=/["&<>]/;
function pug_merge(e,r){if(1===arguments.length){for(var t=e[0],g=1;g<e.length;g++)t=pug_merge(t,e[g]);return t}for(var l in r)if("class"===l){var n=e[l]||[];e[l]=(Array.isArray(n)?n:[n]).concat(r[l]||[])}else if("style"===l){var n=pug_style(e[l]);n=n&&";"!==n[n.length-1]?n+";":n;var a=pug_style(r[l]);a=a&&";"!==a[a.length-1]?a+";":a,e[l]=n+a}else e[l]=r[l];return e}
function pug_rethrow(n,e,r,t){if(!(n instanceof Error))throw n;if(!("undefined"==typeof window&&e||t))throw n.message+=" on line "+r,n;try{t=t||require("fs").readFileSync(e,"utf8")}catch(e){pug_rethrow(n,null,r)}var i=3,a=t.split("\n"),o=Math.max(r-i,0),h=Math.min(a.length,r+i),i=a.slice(o,h).map(function(n,e){var t=e+o+1;return(t==r?"  > ":"    ")+t+"| "+n}).join("\n");throw n.path=e,n.message=(e||"Pug")+":"+r+"\n"+i+"\n\n"+n.message,n}
function pug_style(r){if(!r)return"";if("object"==typeof r){var t="";for(var e in r)pug_has_own_property.call(r,e)&&(t=t+e+":"+r[e]+";");return t}return r+""}function template(locals) {var pug_html = "", pug_mixins = {}, pug_interp;var pug_debug_filename, pug_debug_line;try {;var locals_for_with = (locals || {});(function (attrs, field, fieldAttributes, name, sectionAttrs) {;pug_debug_line = 1;pug_debug_filename = "src\u002Ftemplates\u002Fview.form.field.pug";
;pug_debug_line = 2;pug_debug_filename = "src\u002Ftemplates\u002Fview.form.field.pug";
var cssClass = 'StringField'
;pug_debug_line = 3;pug_debug_filename = "src\u002Ftemplates\u002Fview.form.field.pug";
var spanClass = 'form-field-readonly'
;pug_debug_line = 4;pug_debug_filename = "src\u002Ftemplates\u002Fview.form.field.pug";
var labelClass = 'form-label'
;pug_debug_line = 5;pug_debug_filename = "src\u002Ftemplates\u002Fview.form.field.pug";
if (fieldAttributes.inlineEditor) {
;pug_debug_line = 6;pug_debug_filename = "src\u002Ftemplates\u002Fview.form.field.pug";
var spanClass = 'grid-field-readonly'
}
else {
;pug_debug_line = 8;pug_debug_filename = "src\u002Ftemplates\u002Fview.form.field.pug";
var cols = 'col-md-' + (field.cols || '6')
;pug_debug_line = 9;pug_debug_filename = "src\u002Ftemplates\u002Fview.form.field.pug";
var formGroup = 'form-group'
}
;pug_debug_line = 10;pug_debug_filename = "src\u002Ftemplates\u002Fview.form.field.pug";
if (attrs.nolabel === 'placeholder') {
;pug_debug_line = 11;pug_debug_filename = "src\u002Ftemplates\u002Fview.form.field.pug";
attrs.placeholder = field.caption
}
;pug_debug_line = 4;pug_debug_filename = "src\u002Ftemplates\u002Fview.form.numeric-field.pug";
var cssClass = 'DecimalField'
;pug_debug_line = 12;pug_debug_filename = "src\u002Ftemplates\u002Fview.form.field.pug";
pug_html = pug_html + "\u003Csection" + (pug_attrs(pug_merge([{"class": pug_classes([[formGroup, cols, cssClass]], [true])},sectionAttrs]), false)) + "\u003E";
;pug_debug_line = 13;pug_debug_filename = "src\u002Ftemplates\u002Fview.form.field.pug";
;pug_debug_line = 14;pug_debug_filename = "src\u002Ftemplates\u002Fview.form.field.pug";
if (!attrs.nolabel && !fieldAttributes.inlineEditor) {
;pug_debug_line = 15;pug_debug_filename = "src\u002Ftemplates\u002Fview.form.field.pug";
pug_html = pug_html + "\u003Clabel" + (pug_attr("class", pug_classes([labelClass], [true]), false, false)) + "\u003E";
;pug_debug_line = 15;pug_debug_filename = "src\u002Ftemplates\u002Fview.form.field.pug";
pug_html = pug_html + (pug_escape(null == (pug_interp = field.caption) ? "" : pug_interp)) + "\u003C\u002Flabel\u003E";
}
;pug_debug_line = 17;pug_debug_filename = "src\u002Ftemplates\u002Fview.form.field.pug";
;pug_debug_line = 18;pug_debug_filename = "src\u002Ftemplates\u002Fview.form.field.pug";
pug_html = pug_html + "\u003Cspan" + (pug_attr("class", pug_classes([spanClass], [true]), false, false)) + "\u003E";
;pug_debug_line = 19;pug_debug_filename = "src\u002Ftemplates\u002Fview.form.field.pug";
;pug_debug_line = 7;pug_debug_filename = "src\u002Ftemplates\u002Fview.form.numeric-field.pug";
pug_html = pug_html + "{{ (record.";
;pug_debug_line = 7;pug_debug_filename = "src\u002Ftemplates\u002Fview.form.numeric-field.pug";
pug_html = pug_html + (pug_escape(null == (pug_interp = name) ? "" : pug_interp));
;pug_debug_line = 7;pug_debug_filename = "src\u002Ftemplates\u002Fview.form.numeric-field.pug";
pug_html = pug_html + "|number:2) || '";
;pug_debug_line = 7;pug_debug_filename = "src\u002Ftemplates\u002Fview.form.numeric-field.pug";
pug_html = pug_html + (pug_escape(null == (pug_interp = field.emptyText) ? "" : pug_interp));
;pug_debug_line = 7;pug_debug_filename = "src\u002Ftemplates\u002Fview.form.numeric-field.pug";
pug_html = pug_html + "' }}\u003C\u002Fspan\u003E";
;pug_debug_line = 22;pug_debug_filename = "src\u002Ftemplates\u002Fview.form.field.pug";
;pug_debug_line = 4;pug_debug_filename = "src\u002Ftemplates\u002Fview.form.numpad-field.pug";
pug_html = pug_html + "\u003Cinput" + (pug_attrs(pug_merge([{"class": "form-field form-control","decimal": pug_escape(true),"numpad-input": pug_escape(true)},attrs]), false)) + "\u002F\u003E\u003C\u002Fsection\u003E";}.call(this,"attrs" in locals_for_with?locals_for_with.attrs:typeof attrs!=="undefined"?attrs:undefined,"field" in locals_for_with?locals_for_with.field:typeof field!=="undefined"?field:undefined,"fieldAttributes" in locals_for_with?locals_for_with.fieldAttributes:typeof fieldAttributes!=="undefined"?fieldAttributes:undefined,"name" in locals_for_with?locals_for_with.name:typeof name!=="undefined"?name:undefined,"sectionAttrs" in locals_for_with?locals_for_with.sectionAttrs:typeof sectionAttrs!=="undefined"?sectionAttrs:undefined));} catch (err) {pug_rethrow(err, pug_debug_filename, pug_debug_line);};return pug_html;}
  return template;
})());

Katrid.ui.registerTemplate('view.form.selection-field.pug', (function() {
  function pug_attr(t,e,n,f){return!1!==e&&null!=e&&(e||"class"!==t&&"style"!==t)?!0===e?" "+(f?t:t+'="'+t+'"'):("function"==typeof e.toJSON&&(e=e.toJSON()),"string"==typeof e||(e=JSON.stringify(e),n||-1===e.indexOf('"'))?(n&&(e=pug_escape(e))," "+t+'="'+e+'"'):" "+t+"='"+e.replace(/'/g,"&#39;")+"'"):""}
function pug_attrs(t,r){var a="";for(var s in t)if(pug_has_own_property.call(t,s)){var u=t[s];if("class"===s){u=pug_classes(u),a=pug_attr(s,u,!1,r)+a;continue}"style"===s&&(u=pug_style(u)),a+=pug_attr(s,u,!1,r)}return a}
function pug_classes(s,r){return Array.isArray(s)?pug_classes_array(s,r):s&&"object"==typeof s?pug_classes_object(s):s||""}
function pug_classes_array(r,a){for(var s,e="",u="",c=Array.isArray(a),g=0;g<r.length;g++)(s=pug_classes(r[g]))&&(c&&a[g]&&(s=pug_escape(s)),e=e+u+s,u=" ");return e}
function pug_classes_object(r){var a="",n="";for(var o in r)o&&r[o]&&pug_has_own_property.call(r,o)&&(a=a+n+o,n=" ");return a}
function pug_escape(e){var a=""+e,t=pug_match_html.exec(a);if(!t)return e;var r,c,n,s="";for(r=t.index,c=0;r<a.length;r++){switch(a.charCodeAt(r)){case 34:n="&quot;";break;case 38:n="&amp;";break;case 60:n="&lt;";break;case 62:n="&gt;";break;default:continue}c!==r&&(s+=a.substring(c,r)),c=r+1,s+=n}return c!==r?s+a.substring(c,r):s}
var pug_has_own_property=Object.prototype.hasOwnProperty;
var pug_match_html=/["&<>]/;
function pug_merge(e,r){if(1===arguments.length){for(var t=e[0],g=1;g<e.length;g++)t=pug_merge(t,e[g]);return t}for(var l in r)if("class"===l){var n=e[l]||[];e[l]=(Array.isArray(n)?n:[n]).concat(r[l]||[])}else if("style"===l){var n=pug_style(e[l]);n=n&&";"!==n[n.length-1]?n+";":n;var a=pug_style(r[l]);a=a&&";"!==a[a.length-1]?a+";":a,e[l]=n+a}else e[l]=r[l];return e}
function pug_rethrow(n,e,r,t){if(!(n instanceof Error))throw n;if(!("undefined"==typeof window&&e||t))throw n.message+=" on line "+r,n;try{t=t||require("fs").readFileSync(e,"utf8")}catch(e){pug_rethrow(n,null,r)}var i=3,a=t.split("\n"),o=Math.max(r-i,0),h=Math.min(a.length,r+i),i=a.slice(o,h).map(function(n,e){var t=e+o+1;return(t==r?"  > ":"    ")+t+"| "+n}).join("\n");throw n.path=e,n.message=(e||"Pug")+":"+r+"\n"+i+"\n\n"+n.message,n}
function pug_style(r){if(!r)return"";if("object"==typeof r){var t="";for(var e in r)pug_has_own_property.call(r,e)&&(t=t+e+":"+r[e]+";");return t}return r+""}function template(locals) {var pug_html = "", pug_mixins = {}, pug_interp;var pug_debug_filename, pug_debug_line;try {;var locals_for_with = (locals || {});(function (attrs, field, fieldAttributes, name, sectionAttrs) {;pug_debug_line = 1;pug_debug_filename = "src\u002Ftemplates\u002Fview.form.field.pug";
;pug_debug_line = 2;pug_debug_filename = "src\u002Ftemplates\u002Fview.form.field.pug";
var cssClass = 'StringField'
;pug_debug_line = 3;pug_debug_filename = "src\u002Ftemplates\u002Fview.form.field.pug";
var spanClass = 'form-field-readonly'
;pug_debug_line = 4;pug_debug_filename = "src\u002Ftemplates\u002Fview.form.field.pug";
var labelClass = 'form-label'
;pug_debug_line = 5;pug_debug_filename = "src\u002Ftemplates\u002Fview.form.field.pug";
if (fieldAttributes.inlineEditor) {
;pug_debug_line = 6;pug_debug_filename = "src\u002Ftemplates\u002Fview.form.field.pug";
var spanClass = 'grid-field-readonly'
}
else {
;pug_debug_line = 8;pug_debug_filename = "src\u002Ftemplates\u002Fview.form.field.pug";
var cols = 'col-md-' + (field.cols || '6')
;pug_debug_line = 9;pug_debug_filename = "src\u002Ftemplates\u002Fview.form.field.pug";
var formGroup = 'form-group'
}
;pug_debug_line = 10;pug_debug_filename = "src\u002Ftemplates\u002Fview.form.field.pug";
if (attrs.nolabel === 'placeholder') {
;pug_debug_line = 11;pug_debug_filename = "src\u002Ftemplates\u002Fview.form.field.pug";
attrs.placeholder = field.caption
}
;pug_debug_line = 4;pug_debug_filename = "src\u002Ftemplates\u002Fview.form.selection-field.pug";
var choicesAttr = 'choice in view.fields.' + field.name + '.choices'
;pug_debug_line = 12;pug_debug_filename = "src\u002Ftemplates\u002Fview.form.field.pug";
pug_html = pug_html + "\u003Csection" + (pug_attrs(pug_merge([{"class": pug_classes([[formGroup, cols, cssClass]], [true])},sectionAttrs]), false)) + "\u003E";
;pug_debug_line = 13;pug_debug_filename = "src\u002Ftemplates\u002Fview.form.field.pug";
;pug_debug_line = 14;pug_debug_filename = "src\u002Ftemplates\u002Fview.form.field.pug";
if (!attrs.nolabel && !fieldAttributes.inlineEditor) {
;pug_debug_line = 15;pug_debug_filename = "src\u002Ftemplates\u002Fview.form.field.pug";
pug_html = pug_html + "\u003Clabel" + (pug_attr("class", pug_classes([labelClass], [true]), false, false)) + "\u003E";
;pug_debug_line = 15;pug_debug_filename = "src\u002Ftemplates\u002Fview.form.field.pug";
pug_html = pug_html + (pug_escape(null == (pug_interp = field.caption) ? "" : pug_interp)) + "\u003C\u002Flabel\u003E";
}
;pug_debug_line = 17;pug_debug_filename = "src\u002Ftemplates\u002Fview.form.field.pug";
;pug_debug_line = 18;pug_debug_filename = "src\u002Ftemplates\u002Fview.form.field.pug";
pug_html = pug_html + "\u003Cspan" + (pug_attr("class", pug_classes([spanClass], [true]), false, false)) + "\u003E";
;pug_debug_line = 19;pug_debug_filename = "src\u002Ftemplates\u002Fview.form.field.pug";
;pug_debug_line = 20;pug_debug_filename = "src\u002Ftemplates\u002Fview.form.field.pug";
pug_html = pug_html + "{{ record.";
;pug_debug_line = 20;pug_debug_filename = "src\u002Ftemplates\u002Fview.form.field.pug";
pug_html = pug_html + (pug_escape(null == (pug_interp = name) ? "" : pug_interp));
;pug_debug_line = 20;pug_debug_filename = "src\u002Ftemplates\u002Fview.form.field.pug";
pug_html = pug_html + "||'";
;pug_debug_line = 20;pug_debug_filename = "src\u002Ftemplates\u002Fview.form.field.pug";
pug_html = pug_html + (pug_escape(null == (pug_interp = field.emptyText) ? "" : pug_interp));
;pug_debug_line = 20;pug_debug_filename = "src\u002Ftemplates\u002Fview.form.field.pug";
pug_html = pug_html + "' }}\u003C\u002Fspan\u003E";
;pug_debug_line = 22;pug_debug_filename = "src\u002Ftemplates\u002Fview.form.field.pug";
;pug_debug_line = 6;pug_debug_filename = "src\u002Ftemplates\u002Fview.form.selection-field.pug";
pug_html = pug_html + "\u003Cselect" + (pug_attrs(pug_merge([{"class": "form-field form-control"},attrs]), false)) + "\u003E";
;pug_debug_line = 7;pug_debug_filename = "src\u002Ftemplates\u002Fview.form.selection-field.pug";
pug_html = pug_html + "\u003Coption" + (pug_attr("ng-repeat", choicesAttr, true, false)+" value=\"{{choice[0]}}\"") + "\u003E";
;pug_debug_line = 8;pug_debug_filename = "src\u002Ftemplates\u002Fview.form.selection-field.pug";
pug_html = pug_html + "{{choice[1]}}\u003C\u002Foption\u003E\u003C\u002Fselect\u003E\u003C\u002Fsection\u003E";}.call(this,"attrs" in locals_for_with?locals_for_with.attrs:typeof attrs!=="undefined"?attrs:undefined,"field" in locals_for_with?locals_for_with.field:typeof field!=="undefined"?field:undefined,"fieldAttributes" in locals_for_with?locals_for_with.fieldAttributes:typeof fieldAttributes!=="undefined"?fieldAttributes:undefined,"name" in locals_for_with?locals_for_with.name:typeof name!=="undefined"?name:undefined,"sectionAttrs" in locals_for_with?locals_for_with.sectionAttrs:typeof sectionAttrs!=="undefined"?sectionAttrs:undefined));} catch (err) {pug_rethrow(err, pug_debug_filename, pug_debug_line);};return pug_html;}
  return template;
})());

Katrid.ui.registerTemplate('view.form.text-field.pug', (function() {
  function pug_attr(t,e,n,f){return!1!==e&&null!=e&&(e||"class"!==t&&"style"!==t)?!0===e?" "+(f?t:t+'="'+t+'"'):("function"==typeof e.toJSON&&(e=e.toJSON()),"string"==typeof e||(e=JSON.stringify(e),n||-1===e.indexOf('"'))?(n&&(e=pug_escape(e))," "+t+'="'+e+'"'):" "+t+"='"+e.replace(/'/g,"&#39;")+"'"):""}
function pug_attrs(t,r){var a="";for(var s in t)if(pug_has_own_property.call(t,s)){var u=t[s];if("class"===s){u=pug_classes(u),a=pug_attr(s,u,!1,r)+a;continue}"style"===s&&(u=pug_style(u)),a+=pug_attr(s,u,!1,r)}return a}
function pug_classes(s,r){return Array.isArray(s)?pug_classes_array(s,r):s&&"object"==typeof s?pug_classes_object(s):s||""}
function pug_classes_array(r,a){for(var s,e="",u="",c=Array.isArray(a),g=0;g<r.length;g++)(s=pug_classes(r[g]))&&(c&&a[g]&&(s=pug_escape(s)),e=e+u+s,u=" ");return e}
function pug_classes_object(r){var a="",n="";for(var o in r)o&&r[o]&&pug_has_own_property.call(r,o)&&(a=a+n+o,n=" ");return a}
function pug_escape(e){var a=""+e,t=pug_match_html.exec(a);if(!t)return e;var r,c,n,s="";for(r=t.index,c=0;r<a.length;r++){switch(a.charCodeAt(r)){case 34:n="&quot;";break;case 38:n="&amp;";break;case 60:n="&lt;";break;case 62:n="&gt;";break;default:continue}c!==r&&(s+=a.substring(c,r)),c=r+1,s+=n}return c!==r?s+a.substring(c,r):s}
var pug_has_own_property=Object.prototype.hasOwnProperty;
var pug_match_html=/["&<>]/;
function pug_merge(e,r){if(1===arguments.length){for(var t=e[0],g=1;g<e.length;g++)t=pug_merge(t,e[g]);return t}for(var l in r)if("class"===l){var n=e[l]||[];e[l]=(Array.isArray(n)?n:[n]).concat(r[l]||[])}else if("style"===l){var n=pug_style(e[l]);n=n&&";"!==n[n.length-1]?n+";":n;var a=pug_style(r[l]);a=a&&";"!==a[a.length-1]?a+";":a,e[l]=n+a}else e[l]=r[l];return e}
function pug_rethrow(n,e,r,t){if(!(n instanceof Error))throw n;if(!("undefined"==typeof window&&e||t))throw n.message+=" on line "+r,n;try{t=t||require("fs").readFileSync(e,"utf8")}catch(e){pug_rethrow(n,null,r)}var i=3,a=t.split("\n"),o=Math.max(r-i,0),h=Math.min(a.length,r+i),i=a.slice(o,h).map(function(n,e){var t=e+o+1;return(t==r?"  > ":"    ")+t+"| "+n}).join("\n");throw n.path=e,n.message=(e||"Pug")+":"+r+"\n"+i+"\n\n"+n.message,n}
function pug_style(r){if(!r)return"";if("object"==typeof r){var t="";for(var e in r)pug_has_own_property.call(r,e)&&(t=t+e+":"+r[e]+";");return t}return r+""}function template(locals) {var pug_html = "", pug_mixins = {}, pug_interp;var pug_debug_filename, pug_debug_line;try {;var locals_for_with = (locals || {});(function (attrs, field, fieldAttributes, name, sectionAttrs) {;pug_debug_line = 1;pug_debug_filename = "src\u002Ftemplates\u002Fview.form.field.pug";
;pug_debug_line = 2;pug_debug_filename = "src\u002Ftemplates\u002Fview.form.field.pug";
var cssClass = 'StringField'
;pug_debug_line = 3;pug_debug_filename = "src\u002Ftemplates\u002Fview.form.field.pug";
var spanClass = 'form-field-readonly'
;pug_debug_line = 4;pug_debug_filename = "src\u002Ftemplates\u002Fview.form.field.pug";
var labelClass = 'form-label'
;pug_debug_line = 5;pug_debug_filename = "src\u002Ftemplates\u002Fview.form.field.pug";
if (fieldAttributes.inlineEditor) {
;pug_debug_line = 6;pug_debug_filename = "src\u002Ftemplates\u002Fview.form.field.pug";
var spanClass = 'grid-field-readonly'
}
else {
;pug_debug_line = 8;pug_debug_filename = "src\u002Ftemplates\u002Fview.form.field.pug";
var cols = 'col-md-' + (field.cols || '6')
;pug_debug_line = 9;pug_debug_filename = "src\u002Ftemplates\u002Fview.form.field.pug";
var formGroup = 'form-group'
}
;pug_debug_line = 10;pug_debug_filename = "src\u002Ftemplates\u002Fview.form.field.pug";
if (attrs.nolabel === 'placeholder') {
;pug_debug_line = 11;pug_debug_filename = "src\u002Ftemplates\u002Fview.form.field.pug";
attrs.placeholder = field.caption
}
;pug_debug_line = 4;pug_debug_filename = "src\u002Ftemplates\u002Fview.form.text-field.pug";
var cssClass = 'TextField'
;pug_debug_line = 12;pug_debug_filename = "src\u002Ftemplates\u002Fview.form.field.pug";
pug_html = pug_html + "\u003Csection" + (pug_attrs(pug_merge([{"class": pug_classes([[formGroup, cols, cssClass]], [true])},sectionAttrs]), false)) + "\u003E";
;pug_debug_line = 13;pug_debug_filename = "src\u002Ftemplates\u002Fview.form.field.pug";
;pug_debug_line = 14;pug_debug_filename = "src\u002Ftemplates\u002Fview.form.field.pug";
if (!attrs.nolabel && !fieldAttributes.inlineEditor) {
;pug_debug_line = 15;pug_debug_filename = "src\u002Ftemplates\u002Fview.form.field.pug";
pug_html = pug_html + "\u003Clabel" + (pug_attr("class", pug_classes([labelClass], [true]), false, false)) + "\u003E";
;pug_debug_line = 15;pug_debug_filename = "src\u002Ftemplates\u002Fview.form.field.pug";
pug_html = pug_html + (pug_escape(null == (pug_interp = field.caption) ? "" : pug_interp)) + "\u003C\u002Flabel\u003E";
}
;pug_debug_line = 17;pug_debug_filename = "src\u002Ftemplates\u002Fview.form.field.pug";
;pug_debug_line = 18;pug_debug_filename = "src\u002Ftemplates\u002Fview.form.field.pug";
pug_html = pug_html + "\u003Cspan" + (pug_attr("class", pug_classes([spanClass], [true]), false, false)) + "\u003E";
;pug_debug_line = 19;pug_debug_filename = "src\u002Ftemplates\u002Fview.form.field.pug";
;pug_debug_line = 20;pug_debug_filename = "src\u002Ftemplates\u002Fview.form.field.pug";
pug_html = pug_html + "{{ record.";
;pug_debug_line = 20;pug_debug_filename = "src\u002Ftemplates\u002Fview.form.field.pug";
pug_html = pug_html + (pug_escape(null == (pug_interp = name) ? "" : pug_interp));
;pug_debug_line = 20;pug_debug_filename = "src\u002Ftemplates\u002Fview.form.field.pug";
pug_html = pug_html + "||'";
;pug_debug_line = 20;pug_debug_filename = "src\u002Ftemplates\u002Fview.form.field.pug";
pug_html = pug_html + (pug_escape(null == (pug_interp = field.emptyText) ? "" : pug_interp));
;pug_debug_line = 20;pug_debug_filename = "src\u002Ftemplates\u002Fview.form.field.pug";
pug_html = pug_html + "' }}\u003C\u002Fspan\u003E";
;pug_debug_line = 22;pug_debug_filename = "src\u002Ftemplates\u002Fview.form.field.pug";
;pug_debug_line = 7;pug_debug_filename = "src\u002Ftemplates\u002Fview.form.text-field.pug";
pug_html = pug_html + "\u003Ctextarea" + (pug_attrs(pug_merge([{"class": "form-field form-control"},attrs]), false)) + "\u003E\u003C\u002Ftextarea\u003E\u003C\u002Fsection\u003E";}.call(this,"attrs" in locals_for_with?locals_for_with.attrs:typeof attrs!=="undefined"?attrs:undefined,"field" in locals_for_with?locals_for_with.field:typeof field!=="undefined"?field:undefined,"fieldAttributes" in locals_for_with?locals_for_with.fieldAttributes:typeof fieldAttributes!=="undefined"?fieldAttributes:undefined,"name" in locals_for_with?locals_for_with.name:typeof name!=="undefined"?name:undefined,"sectionAttrs" in locals_for_with?locals_for_with.sectionAttrs:typeof sectionAttrs!=="undefined"?sectionAttrs:undefined));} catch (err) {pug_rethrow(err, pug_debug_filename, pug_debug_line);};return pug_html;}
  return template;
})());

Katrid.ui.registerTemplate('view.list.date-field.pug', (function() {
  function pug_escape(e){var a=""+e,t=pug_match_html.exec(a);if(!t)return e;var r,c,n,s="";for(r=t.index,c=0;r<a.length;r++){switch(a.charCodeAt(r)){case 34:n="&quot;";break;case 38:n="&amp;";break;case 60:n="&lt;";break;case 62:n="&gt;";break;default:continue}c!==r&&(s+=a.substring(c,r)),c=r+1,s+=n}return c!==r?s+a.substring(c,r):s}
var pug_match_html=/["&<>]/;
function pug_rethrow(n,e,r,t){if(!(n instanceof Error))throw n;if(!("undefined"==typeof window&&e||t))throw n.message+=" on line "+r,n;try{t=t||require("fs").readFileSync(e,"utf8")}catch(e){pug_rethrow(n,null,r)}var i=3,a=t.split("\n"),o=Math.max(r-i,0),h=Math.min(a.length,r+i),i=a.slice(o,h).map(function(n,e){var t=e+o+1;return(t==r?"  > ":"    ")+t+"| "+n}).join("\n");throw n.path=e,n.message=(e||"Pug")+":"+r+"\n"+i+"\n\n"+n.message,n}function template(locals) {var pug_html = "", pug_mixins = {}, pug_interp;var pug_debug_filename, pug_debug_line;try {;var locals_for_with = (locals || {});(function (_, field, name) {;pug_debug_line = 1;pug_debug_filename = "src\u002Ftemplates\u002Fview.list.date-field.pug";
;pug_debug_line = 2;pug_debug_filename = "src\u002Ftemplates\u002Fview.list.date-field.pug";
pug_html = pug_html + "\u003Cth class=\"DateField\"\u003E";
;pug_debug_line = 2;pug_debug_filename = "src\u002Ftemplates\u002Fview.list.date-field.pug";
pug_html = pug_html + "\u003Cspan\u003E";
;pug_debug_line = 2;pug_debug_filename = "src\u002Ftemplates\u002Fview.list.date-field.pug";
pug_html = pug_html + (pug_escape(null == (pug_interp = field.caption) ? "" : pug_interp)) + "\u003C\u002Fspan\u003E\u003C\u002Fth\u003E";
;pug_debug_line = 3;pug_debug_filename = "src\u002Ftemplates\u002Fview.list.date-field.pug";
;pug_debug_line = 4;pug_debug_filename = "src\u002Ftemplates\u002Fview.list.date-field.pug";
pug_html = pug_html + "\u003Ctd class=\"DateField\"\u003E";
;pug_debug_line = 4;pug_debug_filename = "src\u002Ftemplates\u002Fview.list.date-field.pug";
pug_html = pug_html + "\u003Cspan\u003E";
;pug_debug_line = 5;pug_debug_filename = "src\u002Ftemplates\u002Fview.list.date-field.pug";
pug_html = pug_html + "{{ (record.";
;pug_debug_line = 5;pug_debug_filename = "src\u002Ftemplates\u002Fview.list.date-field.pug";
pug_html = pug_html + (pug_escape(null == (pug_interp = name) ? "" : pug_interp));
;pug_debug_line = 5;pug_debug_filename = "src\u002Ftemplates\u002Fview.list.date-field.pug";
pug_html = pug_html + "|date:'";
;pug_debug_line = 5;pug_debug_filename = "src\u002Ftemplates\u002Fview.list.date-field.pug";
pug_html = pug_html + (pug_escape(null == (pug_interp = _.gettext('yyyy-mm-dd').replace(/[m]/g, 'M')) ? "" : pug_interp));
;pug_debug_line = 5;pug_debug_filename = "src\u002Ftemplates\u002Fview.list.date-field.pug";
pug_html = pug_html + "') || '";
;pug_debug_line = 5;pug_debug_filename = "src\u002Ftemplates\u002Fview.list.date-field.pug";
pug_html = pug_html + (pug_escape(null == (pug_interp = field.emptyText) ? "" : pug_interp));
;pug_debug_line = 5;pug_debug_filename = "src\u002Ftemplates\u002Fview.list.date-field.pug";
pug_html = pug_html + "' }}";
;pug_debug_line = 6;pug_debug_filename = "src\u002Ftemplates\u002Fview.list.date-field.pug";
pug_html = pug_html + "\u003Cdiv\u003E\u003C\u002Fdiv\u003E\u003C\u002Fspan\u003E\u003C\u002Ftd\u003E";}.call(this,"_" in locals_for_with?locals_for_with._:typeof _!=="undefined"?_:undefined,"field" in locals_for_with?locals_for_with.field:typeof field!=="undefined"?field:undefined,"name" in locals_for_with?locals_for_with.name:typeof name!=="undefined"?name:undefined));} catch (err) {pug_rethrow(err, pug_debug_filename, pug_debug_line);};return pug_html;}
  return template;
})());

Katrid.ui.registerTemplate('view.list.field.pug', (function() {
  function pug_attr(t,e,n,f){return!1!==e&&null!=e&&(e||"class"!==t&&"style"!==t)?!0===e?" "+(f?t:t+'="'+t+'"'):("function"==typeof e.toJSON&&(e=e.toJSON()),"string"==typeof e||(e=JSON.stringify(e),n||-1===e.indexOf('"'))?(n&&(e=pug_escape(e))," "+t+'="'+e+'"'):" "+t+"='"+e.replace(/'/g,"&#39;")+"'"):""}
function pug_classes(s,r){return Array.isArray(s)?pug_classes_array(s,r):s&&"object"==typeof s?pug_classes_object(s):s||""}
function pug_classes_array(r,a){for(var s,e="",u="",c=Array.isArray(a),g=0;g<r.length;g++)(s=pug_classes(r[g]))&&(c&&a[g]&&(s=pug_escape(s)),e=e+u+s,u=" ");return e}
function pug_classes_object(r){var a="",n="";for(var o in r)o&&r[o]&&pug_has_own_property.call(r,o)&&(a=a+n+o,n=" ");return a}
function pug_escape(e){var a=""+e,t=pug_match_html.exec(a);if(!t)return e;var r,c,n,s="";for(r=t.index,c=0;r<a.length;r++){switch(a.charCodeAt(r)){case 34:n="&quot;";break;case 38:n="&amp;";break;case 60:n="&lt;";break;case 62:n="&gt;";break;default:continue}c!==r&&(s+=a.substring(c,r)),c=r+1,s+=n}return c!==r?s+a.substring(c,r):s}
var pug_has_own_property=Object.prototype.hasOwnProperty;
var pug_match_html=/["&<>]/;
function pug_rethrow(n,e,r,t){if(!(n instanceof Error))throw n;if(!("undefined"==typeof window&&e||t))throw n.message+=" on line "+r,n;try{t=t||require("fs").readFileSync(e,"utf8")}catch(e){pug_rethrow(n,null,r)}var i=3,a=t.split("\n"),o=Math.max(r-i,0),h=Math.min(a.length,r+i),i=a.slice(o,h).map(function(n,e){var t=e+o+1;return(t==r?"  > ":"    ")+t+"| "+n}).join("\n");throw n.path=e,n.message=(e||"Pug")+":"+r+"\n"+i+"\n\n"+n.message,n}function template(locals) {var pug_html = "", pug_mixins = {}, pug_interp;var pug_debug_filename, pug_debug_line;try {;var locals_for_with = (locals || {});(function (field, inplaceEditor, name) {;pug_debug_line = 1;pug_debug_filename = "src\u002Ftemplates\u002Fview.list.field.pug";
;pug_debug_line = 2;pug_debug_filename = "src\u002Ftemplates\u002Fview.list.field.pug";
var cssClass = 'StringField'
;pug_debug_line = 3;pug_debug_filename = "src\u002Ftemplates\u002Fview.list.field.pug";
;pug_debug_line = 4;pug_debug_filename = "src\u002Ftemplates\u002Fview.list.field.pug";
pug_html = pug_html + "\u003Cth" + (pug_attr("class", pug_classes([cssClass], [true]), false, false)) + "\u003E";
;pug_debug_line = 4;pug_debug_filename = "src\u002Ftemplates\u002Fview.list.field.pug";
pug_html = pug_html + "\u003Cspan\u003E";
;pug_debug_line = 4;pug_debug_filename = "src\u002Ftemplates\u002Fview.list.field.pug";
pug_html = pug_html + (pug_escape(null == (pug_interp = field.caption) ? "" : pug_interp)) + "\u003C\u002Fspan\u003E\u003C\u002Fth\u003E";
;pug_debug_line = 5;pug_debug_filename = "src\u002Ftemplates\u002Fview.list.field.pug";
;pug_debug_line = 6;pug_debug_filename = "src\u002Ftemplates\u002Fview.list.field.pug";
pug_html = pug_html + "\u003Ctd" + (pug_attr("class", pug_classes([cssClass], [true]), false, false)) + "\u003E";
;pug_debug_line = 7;pug_debug_filename = "src\u002Ftemplates\u002Fview.list.field.pug";
if (inplaceEditor) {
;pug_debug_line = 8;pug_debug_filename = "src\u002Ftemplates\u002Fview.list.field.pug";
;pug_debug_line = 9;pug_debug_filename = "src\u002Ftemplates\u002Fview.list.field.pug";
pug_html = pug_html + "\u003Cdiv\u003E";
;pug_debug_line = 10;pug_debug_filename = "src\u002Ftemplates\u002Fview.list.field.pug";
pug_html = pug_html + (null == (pug_interp = inplaceEditor) ? "" : pug_interp) + "\u003C\u002Fdiv\u003E";
}
else {
;pug_debug_line = 12;pug_debug_filename = "src\u002Ftemplates\u002Fview.list.field.pug";
;pug_debug_line = 13;pug_debug_filename = "src\u002Ftemplates\u002Fview.list.field.pug";
pug_html = pug_html + "\u003Cspan\u003E";
;pug_debug_line = 13;pug_debug_filename = "src\u002Ftemplates\u002Fview.list.field.pug";
pug_html = pug_html + "{{ record.";
;pug_debug_line = 13;pug_debug_filename = "src\u002Ftemplates\u002Fview.list.field.pug";
pug_html = pug_html + (pug_escape(null == (pug_interp = name) ? "" : pug_interp));
;pug_debug_line = 13;pug_debug_filename = "src\u002Ftemplates\u002Fview.list.field.pug";
pug_html = pug_html + " }}\u003C\u002Fspan\u003E";
}
pug_html = pug_html + "\u003C\u002Ftd\u003E";}.call(this,"field" in locals_for_with?locals_for_with.field:typeof field!=="undefined"?field:undefined,"inplaceEditor" in locals_for_with?locals_for_with.inplaceEditor:typeof inplaceEditor!=="undefined"?inplaceEditor:undefined,"name" in locals_for_with?locals_for_with.name:typeof name!=="undefined"?name:undefined));} catch (err) {pug_rethrow(err, pug_debug_filename, pug_debug_line);};return pug_html;}
  return template;
})());

Katrid.ui.registerTemplate('view.list.foreignkey.pug', (function() {
  function pug_attr(t,e,n,f){return!1!==e&&null!=e&&(e||"class"!==t&&"style"!==t)?!0===e?" "+(f?t:t+'="'+t+'"'):("function"==typeof e.toJSON&&(e=e.toJSON()),"string"==typeof e||(e=JSON.stringify(e),n||-1===e.indexOf('"'))?(n&&(e=pug_escape(e))," "+t+'="'+e+'"'):" "+t+"='"+e.replace(/'/g,"&#39;")+"'"):""}
function pug_classes(s,r){return Array.isArray(s)?pug_classes_array(s,r):s&&"object"==typeof s?pug_classes_object(s):s||""}
function pug_classes_array(r,a){for(var s,e="",u="",c=Array.isArray(a),g=0;g<r.length;g++)(s=pug_classes(r[g]))&&(c&&a[g]&&(s=pug_escape(s)),e=e+u+s,u=" ");return e}
function pug_classes_object(r){var a="",n="";for(var o in r)o&&r[o]&&pug_has_own_property.call(r,o)&&(a=a+n+o,n=" ");return a}
function pug_escape(e){var a=""+e,t=pug_match_html.exec(a);if(!t)return e;var r,c,n,s="";for(r=t.index,c=0;r<a.length;r++){switch(a.charCodeAt(r)){case 34:n="&quot;";break;case 38:n="&amp;";break;case 60:n="&lt;";break;case 62:n="&gt;";break;default:continue}c!==r&&(s+=a.substring(c,r)),c=r+1,s+=n}return c!==r?s+a.substring(c,r):s}
var pug_has_own_property=Object.prototype.hasOwnProperty;
var pug_match_html=/["&<>]/;
function pug_rethrow(n,e,r,t){if(!(n instanceof Error))throw n;if(!("undefined"==typeof window&&e||t))throw n.message+=" on line "+r,n;try{t=t||require("fs").readFileSync(e,"utf8")}catch(e){pug_rethrow(n,null,r)}var i=3,a=t.split("\n"),o=Math.max(r-i,0),h=Math.min(a.length,r+i),i=a.slice(o,h).map(function(n,e){var t=e+o+1;return(t==r?"  > ":"    ")+t+"| "+n}).join("\n");throw n.path=e,n.message=(e||"Pug")+":"+r+"\n"+i+"\n\n"+n.message,n}function template(locals) {var pug_html = "", pug_mixins = {}, pug_interp;var pug_debug_filename, pug_debug_line;try {;var locals_for_with = (locals || {});(function (field, inplaceEditor, name) {;pug_debug_line = 1;pug_debug_filename = "src\u002Ftemplates\u002Fview.list.field.pug";
;pug_debug_line = 4;pug_debug_filename = "src\u002Ftemplates\u002Fview.list.foreignkey.pug";
var cssClass = 'ForeignKey'
;pug_debug_line = 3;pug_debug_filename = "src\u002Ftemplates\u002Fview.list.field.pug";
;pug_debug_line = 4;pug_debug_filename = "src\u002Ftemplates\u002Fview.list.field.pug";
pug_html = pug_html + "\u003Cth" + (pug_attr("class", pug_classes([cssClass], [true]), false, false)) + "\u003E";
;pug_debug_line = 4;pug_debug_filename = "src\u002Ftemplates\u002Fview.list.field.pug";
pug_html = pug_html + "\u003Cspan\u003E";
;pug_debug_line = 4;pug_debug_filename = "src\u002Ftemplates\u002Fview.list.field.pug";
pug_html = pug_html + (pug_escape(null == (pug_interp = field.caption) ? "" : pug_interp)) + "\u003C\u002Fspan\u003E\u003C\u002Fth\u003E";
;pug_debug_line = 5;pug_debug_filename = "src\u002Ftemplates\u002Fview.list.field.pug";
;pug_debug_line = 6;pug_debug_filename = "src\u002Ftemplates\u002Fview.list.field.pug";
pug_html = pug_html + "\u003Ctd" + (pug_attr("class", pug_classes([cssClass], [true]), false, false)) + "\u003E";
;pug_debug_line = 7;pug_debug_filename = "src\u002Ftemplates\u002Fview.list.field.pug";
if (inplaceEditor) {
;pug_debug_line = 8;pug_debug_filename = "src\u002Ftemplates\u002Fview.list.field.pug";
;pug_debug_line = 9;pug_debug_filename = "src\u002Ftemplates\u002Fview.list.field.pug";
pug_html = pug_html + "\u003Cdiv\u003E";
;pug_debug_line = 10;pug_debug_filename = "src\u002Ftemplates\u002Fview.list.field.pug";
pug_html = pug_html + (null == (pug_interp = inplaceEditor) ? "" : pug_interp) + "\u003C\u002Fdiv\u003E";
}
else {
;pug_debug_line = 12;pug_debug_filename = "src\u002Ftemplates\u002Fview.list.field.pug";
;pug_debug_line = 6;pug_debug_filename = "src\u002Ftemplates\u002Fview.list.foreignkey.pug";
pug_html = pug_html + "\u003Cspan\u003E";
;pug_debug_line = 7;pug_debug_filename = "src\u002Ftemplates\u002Fview.list.foreignkey.pug";
pug_html = pug_html + "{{record.";
;pug_debug_line = 7;pug_debug_filename = "src\u002Ftemplates\u002Fview.list.foreignkey.pug";
pug_html = pug_html + (pug_escape(null == (pug_interp = name) ? "" : pug_interp));
;pug_debug_line = 7;pug_debug_filename = "src\u002Ftemplates\u002Fview.list.foreignkey.pug";
pug_html = pug_html + "[1]}}\u003C\u002Fspan\u003E";
}
pug_html = pug_html + "\u003C\u002Ftd\u003E";}.call(this,"field" in locals_for_with?locals_for_with.field:typeof field!=="undefined"?field:undefined,"inplaceEditor" in locals_for_with?locals_for_with.inplaceEditor:typeof inplaceEditor!=="undefined"?inplaceEditor:undefined,"name" in locals_for_with?locals_for_with.name:typeof name!=="undefined"?name:undefined));} catch (err) {pug_rethrow(err, pug_debug_filename, pug_debug_line);};return pug_html;}
  return template;
})());

Katrid.ui.registerTemplate('view.list.numeric-field.pug', (function() {
  function pug_attr(t,e,n,f){return!1!==e&&null!=e&&(e||"class"!==t&&"style"!==t)?!0===e?" "+(f?t:t+'="'+t+'"'):("function"==typeof e.toJSON&&(e=e.toJSON()),"string"==typeof e||(e=JSON.stringify(e),n||-1===e.indexOf('"'))?(n&&(e=pug_escape(e))," "+t+'="'+e+'"'):" "+t+"='"+e.replace(/'/g,"&#39;")+"'"):""}
function pug_classes(s,r){return Array.isArray(s)?pug_classes_array(s,r):s&&"object"==typeof s?pug_classes_object(s):s||""}
function pug_classes_array(r,a){for(var s,e="",u="",c=Array.isArray(a),g=0;g<r.length;g++)(s=pug_classes(r[g]))&&(c&&a[g]&&(s=pug_escape(s)),e=e+u+s,u=" ");return e}
function pug_classes_object(r){var a="",n="";for(var o in r)o&&r[o]&&pug_has_own_property.call(r,o)&&(a=a+n+o,n=" ");return a}
function pug_escape(e){var a=""+e,t=pug_match_html.exec(a);if(!t)return e;var r,c,n,s="";for(r=t.index,c=0;r<a.length;r++){switch(a.charCodeAt(r)){case 34:n="&quot;";break;case 38:n="&amp;";break;case 60:n="&lt;";break;case 62:n="&gt;";break;default:continue}c!==r&&(s+=a.substring(c,r)),c=r+1,s+=n}return c!==r?s+a.substring(c,r):s}
var pug_has_own_property=Object.prototype.hasOwnProperty;
var pug_match_html=/["&<>]/;
function pug_rethrow(n,e,r,t){if(!(n instanceof Error))throw n;if(!("undefined"==typeof window&&e||t))throw n.message+=" on line "+r,n;try{t=t||require("fs").readFileSync(e,"utf8")}catch(e){pug_rethrow(n,null,r)}var i=3,a=t.split("\n"),o=Math.max(r-i,0),h=Math.min(a.length,r+i),i=a.slice(o,h).map(function(n,e){var t=e+o+1;return(t==r?"  > ":"    ")+t+"| "+n}).join("\n");throw n.path=e,n.message=(e||"Pug")+":"+r+"\n"+i+"\n\n"+n.message,n}function template(locals) {var pug_html = "", pug_mixins = {}, pug_interp;var pug_debug_filename, pug_debug_line;try {;var locals_for_with = (locals || {});(function (field, inplaceEditor, name) {;pug_debug_line = 1;pug_debug_filename = "src\u002Ftemplates\u002Fview.list.field.pug";
;pug_debug_line = 4;pug_debug_filename = "src\u002Ftemplates\u002Fview.list.numeric-field.pug";
var cssClass = 'DecimalField'
;pug_debug_line = 3;pug_debug_filename = "src\u002Ftemplates\u002Fview.list.field.pug";
;pug_debug_line = 4;pug_debug_filename = "src\u002Ftemplates\u002Fview.list.field.pug";
pug_html = pug_html + "\u003Cth" + (pug_attr("class", pug_classes([cssClass], [true]), false, false)) + "\u003E";
;pug_debug_line = 4;pug_debug_filename = "src\u002Ftemplates\u002Fview.list.field.pug";
pug_html = pug_html + "\u003Cspan\u003E";
;pug_debug_line = 4;pug_debug_filename = "src\u002Ftemplates\u002Fview.list.field.pug";
pug_html = pug_html + (pug_escape(null == (pug_interp = field.caption) ? "" : pug_interp)) + "\u003C\u002Fspan\u003E\u003C\u002Fth\u003E";
;pug_debug_line = 5;pug_debug_filename = "src\u002Ftemplates\u002Fview.list.field.pug";
;pug_debug_line = 6;pug_debug_filename = "src\u002Ftemplates\u002Fview.list.field.pug";
pug_html = pug_html + "\u003Ctd" + (pug_attr("class", pug_classes([cssClass], [true]), false, false)) + "\u003E";
;pug_debug_line = 7;pug_debug_filename = "src\u002Ftemplates\u002Fview.list.field.pug";
if (inplaceEditor) {
;pug_debug_line = 8;pug_debug_filename = "src\u002Ftemplates\u002Fview.list.field.pug";
;pug_debug_line = 9;pug_debug_filename = "src\u002Ftemplates\u002Fview.list.field.pug";
pug_html = pug_html + "\u003Cdiv\u003E";
;pug_debug_line = 10;pug_debug_filename = "src\u002Ftemplates\u002Fview.list.field.pug";
pug_html = pug_html + (null == (pug_interp = inplaceEditor) ? "" : pug_interp) + "\u003C\u002Fdiv\u003E";
}
else {
;pug_debug_line = 12;pug_debug_filename = "src\u002Ftemplates\u002Fview.list.field.pug";
;pug_debug_line = 6;pug_debug_filename = "src\u002Ftemplates\u002Fview.list.numeric-field.pug";
pug_html = pug_html + "\u003Cspan\u003E";
;pug_debug_line = 7;pug_debug_filename = "src\u002Ftemplates\u002Fview.list.numeric-field.pug";
pug_html = pug_html + "{{ (record.";
;pug_debug_line = 7;pug_debug_filename = "src\u002Ftemplates\u002Fview.list.numeric-field.pug";
pug_html = pug_html + (pug_escape(null == (pug_interp = name) ? "" : pug_interp));
;pug_debug_line = 7;pug_debug_filename = "src\u002Ftemplates\u002Fview.list.numeric-field.pug";
pug_html = pug_html + "|number:2) || '";
;pug_debug_line = 7;pug_debug_filename = "src\u002Ftemplates\u002Fview.list.numeric-field.pug";
pug_html = pug_html + (pug_escape(null == (pug_interp = field.emptyText) ? "" : pug_interp));
;pug_debug_line = 7;pug_debug_filename = "src\u002Ftemplates\u002Fview.list.numeric-field.pug";
pug_html = pug_html + "' }}\u003C\u002Fspan\u003E";
}
pug_html = pug_html + "\u003C\u002Ftd\u003E";}.call(this,"field" in locals_for_with?locals_for_with.field:typeof field!=="undefined"?field:undefined,"inplaceEditor" in locals_for_with?locals_for_with.inplaceEditor:typeof inplaceEditor!=="undefined"?inplaceEditor:undefined,"name" in locals_for_with?locals_for_with.name:typeof name!=="undefined"?name:undefined));} catch (err) {pug_rethrow(err, pug_debug_filename, pug_debug_line);};return pug_html;}
  return template;
})());

Katrid.ui.registerTemplate('view.list.selection-field.pug', (function() {
  function pug_attr(t,e,n,f){return!1!==e&&null!=e&&(e||"class"!==t&&"style"!==t)?!0===e?" "+(f?t:t+'="'+t+'"'):("function"==typeof e.toJSON&&(e=e.toJSON()),"string"==typeof e||(e=JSON.stringify(e),n||-1===e.indexOf('"'))?(n&&(e=pug_escape(e))," "+t+'="'+e+'"'):" "+t+"='"+e.replace(/'/g,"&#39;")+"'"):""}
function pug_classes(s,r){return Array.isArray(s)?pug_classes_array(s,r):s&&"object"==typeof s?pug_classes_object(s):s||""}
function pug_classes_array(r,a){for(var s,e="",u="",c=Array.isArray(a),g=0;g<r.length;g++)(s=pug_classes(r[g]))&&(c&&a[g]&&(s=pug_escape(s)),e=e+u+s,u=" ");return e}
function pug_classes_object(r){var a="",n="";for(var o in r)o&&r[o]&&pug_has_own_property.call(r,o)&&(a=a+n+o,n=" ");return a}
function pug_escape(e){var a=""+e,t=pug_match_html.exec(a);if(!t)return e;var r,c,n,s="";for(r=t.index,c=0;r<a.length;r++){switch(a.charCodeAt(r)){case 34:n="&quot;";break;case 38:n="&amp;";break;case 60:n="&lt;";break;case 62:n="&gt;";break;default:continue}c!==r&&(s+=a.substring(c,r)),c=r+1,s+=n}return c!==r?s+a.substring(c,r):s}
var pug_has_own_property=Object.prototype.hasOwnProperty;
var pug_match_html=/["&<>]/;
function pug_rethrow(n,e,r,t){if(!(n instanceof Error))throw n;if(!("undefined"==typeof window&&e||t))throw n.message+=" on line "+r,n;try{t=t||require("fs").readFileSync(e,"utf8")}catch(e){pug_rethrow(n,null,r)}var i=3,a=t.split("\n"),o=Math.max(r-i,0),h=Math.min(a.length,r+i),i=a.slice(o,h).map(function(n,e){var t=e+o+1;return(t==r?"  > ":"    ")+t+"| "+n}).join("\n");throw n.path=e,n.message=(e||"Pug")+":"+r+"\n"+i+"\n\n"+n.message,n}function template(locals) {var pug_html = "", pug_mixins = {}, pug_interp;var pug_debug_filename, pug_debug_line;try {;var locals_for_with = (locals || {});(function (field, inplaceEditor, name) {;pug_debug_line = 1;pug_debug_filename = "src\u002Ftemplates\u002Fview.list.selection-field.pug";
;pug_debug_line = 2;pug_debug_filename = "src\u002Ftemplates\u002Fview.list.selection-field.pug";
var cssClass = 'StringField'
;pug_debug_line = 3;pug_debug_filename = "src\u002Ftemplates\u002Fview.list.selection-field.pug";
;pug_debug_line = 4;pug_debug_filename = "src\u002Ftemplates\u002Fview.list.selection-field.pug";
pug_html = pug_html + "\u003Cth" + (pug_attr("class", pug_classes([cssClass], [true]), false, false)) + "\u003E";
;pug_debug_line = 4;pug_debug_filename = "src\u002Ftemplates\u002Fview.list.selection-field.pug";
pug_html = pug_html + "\u003Cspan\u003E";
;pug_debug_line = 4;pug_debug_filename = "src\u002Ftemplates\u002Fview.list.selection-field.pug";
pug_html = pug_html + (pug_escape(null == (pug_interp = field.caption) ? "" : pug_interp)) + "\u003C\u002Fspan\u003E\u003C\u002Fth\u003E";
;pug_debug_line = 5;pug_debug_filename = "src\u002Ftemplates\u002Fview.list.selection-field.pug";
;pug_debug_line = 6;pug_debug_filename = "src\u002Ftemplates\u002Fview.list.selection-field.pug";
pug_html = pug_html + "\u003Ctd" + (pug_attr("class", pug_classes([cssClass], [true]), false, false)) + "\u003E";
;pug_debug_line = 7;pug_debug_filename = "src\u002Ftemplates\u002Fview.list.selection-field.pug";
if (inplaceEditor) {
;pug_debug_line = 8;pug_debug_filename = "src\u002Ftemplates\u002Fview.list.selection-field.pug";
;pug_debug_line = 9;pug_debug_filename = "src\u002Ftemplates\u002Fview.list.selection-field.pug";
pug_html = pug_html + "\u003Cdiv\u003E";
;pug_debug_line = 10;pug_debug_filename = "src\u002Ftemplates\u002Fview.list.selection-field.pug";
pug_html = pug_html + (null == (pug_interp = inplaceEditor) ? "" : pug_interp) + "\u003C\u002Fdiv\u003E";
}
else {
;pug_debug_line = 12;pug_debug_filename = "src\u002Ftemplates\u002Fview.list.selection-field.pug";
;pug_debug_line = 13;pug_debug_filename = "src\u002Ftemplates\u002Fview.list.selection-field.pug";
pug_html = pug_html + "\u003Cspan\u003E";
;pug_debug_line = 13;pug_debug_filename = "src\u002Ftemplates\u002Fview.list.selection-field.pug";
pug_html = pug_html + "{{ record.";
;pug_debug_line = 13;pug_debug_filename = "src\u002Ftemplates\u002Fview.list.selection-field.pug";
pug_html = pug_html + (pug_escape(null == (pug_interp = name) ? "" : pug_interp));
;pug_debug_line = 13;pug_debug_filename = "src\u002Ftemplates\u002Fview.list.selection-field.pug";
pug_html = pug_html + " }}\u003C\u002Fspan\u003E";
}
pug_html = pug_html + "\u003C\u002Ftd\u003E";}.call(this,"field" in locals_for_with?locals_for_with.field:typeof field!=="undefined"?field:undefined,"inplaceEditor" in locals_for_with?locals_for_with.inplaceEditor:typeof inplaceEditor!=="undefined"?inplaceEditor:undefined,"name" in locals_for_with?locals_for_with.name:typeof name!=="undefined"?name:undefined));} catch (err) {pug_rethrow(err, pug_debug_filename, pug_debug_line);};return pug_html;}
  return template;
})());

Katrid.ui.registerTemplate('view.list.table.delete.pug', (function() {
  function pug_rethrow(n,e,r,t){if(!(n instanceof Error))throw n;if(!("undefined"==typeof window&&e||t))throw n.message+=" on line "+r,n;try{t=t||require("fs").readFileSync(e,"utf8")}catch(e){pug_rethrow(n,null,r)}var i=3,a=t.split("\n"),o=Math.max(r-i,0),h=Math.min(a.length,r+i),i=a.slice(o,h).map(function(n,e){var t=e+o+1;return(t==r?"  > ":"    ")+t+"| "+n}).join("\n");throw n.path=e,n.message=(e||"Pug")+":"+r+"\n"+i+"\n\n"+n.message,n}function template(locals) {var pug_html = "", pug_mixins = {}, pug_interp;var pug_debug_filename, pug_debug_line;try {;pug_debug_line = 1;pug_debug_filename = "src\u002Ftemplates\u002Fview.list.table.delete.pug";
pug_html = pug_html + "\u003Cth class=\"list-column-delete\" ng-show=\"parent.dataSource.changing &amp;&amp; !dataSource.readonly\"\u003E\u003C\u002Fth\u003E";
;pug_debug_line = 2;pug_debug_filename = "src\u002Ftemplates\u002Fview.list.table.delete.pug";
pug_html = pug_html + "\u003Ctd class=\"list-column-delete\" ng-show=\"parent.dataSource.changing &amp;&amp; !dataSource.readonly\" ng-click=\"removeItem($index);$event.stopPropagation();\"\u003E";
;pug_debug_line = 3;pug_debug_filename = "src\u002Ftemplates\u002Fview.list.table.delete.pug";
pug_html = pug_html + "\u003Ci class=\"fa fa-trash-o\"\u003E\u003C\u002Fi\u003E\u003C\u002Ftd\u003E";} catch (err) {pug_rethrow(err, pug_debug_filename, pug_debug_line);};return pug_html;}
  return template;
})());

Katrid.ui.registerTemplate('view.list.table.pug', (function() {
  function pug_attr(t,e,n,f){return!1!==e&&null!=e&&(e||"class"!==t&&"style"!==t)?!0===e?" "+(f?t:t+'="'+t+'"'):("function"==typeof e.toJSON&&(e=e.toJSON()),"string"==typeof e||(e=JSON.stringify(e),n||-1===e.indexOf('"'))?(n&&(e=pug_escape(e))," "+t+'="'+e+'"'):" "+t+"='"+e.replace(/'/g,"&#39;")+"'"):""}
function pug_escape(e){var a=""+e,t=pug_match_html.exec(a);if(!t)return e;var r,c,n,s="";for(r=t.index,c=0;r<a.length;r++){switch(a.charCodeAt(r)){case 34:n="&quot;";break;case 38:n="&amp;";break;case 60:n="&lt;";break;case 62:n="&gt;";break;default:continue}c!==r&&(s+=a.substring(c,r)),c=r+1,s+=n}return c!==r?s+a.substring(c,r):s}
var pug_match_html=/["&<>]/;
function pug_rethrow(n,e,r,t){if(!(n instanceof Error))throw n;if(!("undefined"==typeof window&&e||t))throw n.message+=" on line "+r,n;try{t=t||require("fs").readFileSync(e,"utf8")}catch(e){pug_rethrow(n,null,r)}var i=3,a=t.split("\n"),o=Math.max(r-i,0),h=Math.min(a.length,r+i),i=a.slice(o,h).map(function(n,e){var t=e+o+1;return(t==r?"  > ":"    ")+t+"| "+n}).join("\n");throw n.path=e,n.message=(e||"Pug")+":"+r+"\n"+i+"\n\n"+n.message,n}function template(locals) {var pug_html = "", pug_mixins = {}, pug_interp;var pug_debug_filename, pug_debug_line;try {;var locals_for_with = (locals || {});(function (options, rowClick) {;pug_debug_line = 1;pug_debug_filename = "src\u002Ftemplates\u002Fview.list.table.pug";
pug_html = pug_html + "\u003Ctable class=\"table table-hover dataTable\"\u003E";
;pug_debug_line = 2;pug_debug_filename = "src\u002Ftemplates\u002Fview.list.table.pug";
pug_html = pug_html + "\u003Cthead\u003E";
;pug_debug_line = 3;pug_debug_filename = "src\u002Ftemplates\u002Fview.list.table.pug";
pug_html = pug_html + "\u003Ctr\u003E";
;pug_debug_line = 4;pug_debug_filename = "src\u002Ftemplates\u002Fview.list.table.pug";
if (options.rowSelector) {
;pug_debug_line = 5;pug_debug_filename = "src\u002Ftemplates\u002Fview.list.table.pug";
pug_html = pug_html + "\u003Cth class=\"list-record-selector\"\u003E";
;pug_debug_line = 5;pug_debug_filename = "src\u002Ftemplates\u002Fview.list.table.pug";
pug_html = pug_html + "\u003Cinput type=\"checkbox\" ng-click=\"action.selectToggle($event.currentTarget)\" onclick=\"$(this).closest('table').find('td.list-record-selector input').prop('checked', $(this).prop('checked'))\"\u002F\u003E\u003C\u002Fth\u003E";
}
pug_html = pug_html + "\u003C\u002Ftr\u003E\u003C\u002Fthead\u003E";
;pug_debug_line = 6;pug_debug_filename = "src\u002Ftemplates\u002Fview.list.table.pug";
pug_html = pug_html + "\u003Ctbody\u003E";
;pug_debug_line = 7;pug_debug_filename = "src\u002Ftemplates\u002Fview.list.table.pug";
pug_html = pug_html + "\u003Ctr" + (" ng-repeat=\"record in records\""+pug_attr("ng-click", rowClick, true, false)) + "\u003E";
;pug_debug_line = 8;pug_debug_filename = "src\u002Ftemplates\u002Fview.list.table.pug";
if (options.rowSelector) {
;pug_debug_line = 9;pug_debug_filename = "src\u002Ftemplates\u002Fview.list.table.pug";
pug_html = pug_html + "\u003Ctd class=\"list-record-selector\" onclick=\"event.stopPropagation();\"\u003E";
;pug_debug_line = 10;pug_debug_filename = "src\u002Ftemplates\u002Fview.list.table.pug";
pug_html = pug_html + "\u003Cinput type=\"checkbox\" ng-click=\"action.selectToggle($event.currentTarget)\" onclick=\"if (!$(this).prop('checked')) $(this).closest('table').find('th.list-record-selector input').prop('checked', false)\"\u002F\u003E\u003C\u002Ftd\u003E";
}
pug_html = pug_html + "\u003C\u002Ftr\u003E\u003C\u002Ftbody\u003E";
;pug_debug_line = 12;pug_debug_filename = "src\u002Ftemplates\u002Fview.list.table.pug";
pug_html = pug_html + "\u003Ctfoot\u003E";
;pug_debug_line = 13;pug_debug_filename = "src\u002Ftemplates\u002Fview.list.table.pug";
pug_html = pug_html + "\u003Ctr\u003E\u003C\u002Ftr\u003E\u003C\u002Ftfoot\u003E\u003C\u002Ftable\u003E";}.call(this,"options" in locals_for_with?locals_for_with.options:typeof options!=="undefined"?options:undefined,"rowClick" in locals_for_with?locals_for_with.rowClick:typeof rowClick!=="undefined"?rowClick:undefined));} catch (err) {pug_rethrow(err, pug_debug_filename, pug_debug_line);};return pug_html;}
  return template;
})());

Katrid.ui.registerTemplate('view.list.table.total.pug', (function() {
  function pug_attr(t,e,n,f){return!1!==e&&null!=e&&(e||"class"!==t&&"style"!==t)?!0===e?" "+(f?t:t+'="'+t+'"'):("function"==typeof e.toJSON&&(e=e.toJSON()),"string"==typeof e||(e=JSON.stringify(e),n||-1===e.indexOf('"'))?(n&&(e=pug_escape(e))," "+t+'="'+e+'"'):" "+t+"='"+e.replace(/'/g,"&#39;")+"'"):""}
function pug_escape(e){var a=""+e,t=pug_match_html.exec(a);if(!t)return e;var r,c,n,s="";for(r=t.index,c=0;r<a.length;r++){switch(a.charCodeAt(r)){case 34:n="&quot;";break;case 38:n="&amp;";break;case 60:n="&lt;";break;case 62:n="&gt;";break;default:continue}c!==r&&(s+=a.substring(c,r)),c=r+1,s+=n}return c!==r?s+a.substring(c,r):s}
var pug_match_html=/["&<>]/;
function pug_rethrow(n,e,r,t){if(!(n instanceof Error))throw n;if(!("undefined"==typeof window&&e||t))throw n.message+=" on line "+r,n;try{t=t||require("fs").readFileSync(e,"utf8")}catch(e){pug_rethrow(n,null,r)}var i=3,a=t.split("\n"),o=Math.max(r-i,0),h=Math.min(a.length,r+i),i=a.slice(o,h).map(function(n,e){var t=e+o+1;return(t==r?"  > ":"    ")+t+"| "+n}).join("\n");throw n.path=e,n.message=(e||"Pug")+":"+r+"\n"+i+"\n\n"+n.message,n}function template(locals) {var pug_html = "", pug_mixins = {}, pug_interp;var pug_debug_filename, pug_debug_line;try {;var locals_for_with = (locals || {});(function (field, total) {;pug_debug_line = 1;pug_debug_filename = "src\u002Ftemplates\u002Fview.list.table.total.pug";
if (field) {
;pug_debug_line = 2;pug_debug_filename = "src\u002Ftemplates\u002Fview.list.table.total.pug";
pug_html = pug_html + "\u003Ctd class=\"text-right font-weight-bold\"\u003E";
;pug_debug_line = 3;pug_debug_filename = "src\u002Ftemplates\u002Fview.list.table.total.pug";
pug_html = pug_html + "\u003Cng-total" + (pug_attr("field", field.name, true, false)+pug_attr("expr", total.total, true, false)) + "\u003E\u003C\u002Fng-total\u003E\u003C\u002Ftd\u003E";
}
else {
;pug_debug_line = 5;pug_debug_filename = "src\u002Ftemplates\u002Fview.list.table.total.pug";
pug_html = pug_html + "\u003Ctd class=\"borderless\"\u003E\u003C\u002Ftd\u003E";
}}.call(this,"field" in locals_for_with?locals_for_with.field:typeof field!=="undefined"?field:undefined,"total" in locals_for_with?locals_for_with.total:typeof total!=="undefined"?total:undefined));} catch (err) {pug_rethrow(err, pug_debug_filename, pug_debug_line);};return pug_html;}
  return template;
})());
