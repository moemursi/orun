(() => {

  class Templates {
    static init(templateCache) {
      Katrid.$templateCache = templateCache;

      let oldGet = templateCache.get;

      templateCache.get = function (name) {
        return Templates.prepare(name, oldGet.call(this, name));
      };

      Templates.loadTemplates(templateCache);
    }

    static prepare(name, templ) {
      if (_.isUndefined(templ)) throw Error('Template not found: ' + name);
      if (templ.tagName === 'SCRIPT')
        return templ.innerHTML;
      return templ;
    }

    static compileTemplate(base, templ) {
      let el = $(base);
      templ = $(templ.innerHTML);
      for (let child of Array.from(templ))
        if (child.tagName === 'JQUERY') {
          child = $(child);
          let sel = child.attr('selector');
          let op = child.attr('operation');
          if (sel) sel = $(el).find(sel);
          else sel = el;
          sel[op](child[0].innerHTML);
        }
      return el[0].innerHTML;
    }

    static loadTemplates(templateCache) {
      $.get('/web/client/templates/')
      .done(res => {
        let readTemplates = (el) => {
          if (el.tagName === 'TEMPLATES') Array.from(el.childNodes).map(readTemplates);
          else if (el.tagName === 'SCRIPT') {
            let base = el.getAttribute('extends');
            let id = el.getAttribute('id') || base;
            if (base) {
              el = Templates.compileTemplate(templateCache.get(base), el);
            } else
              id = el.id;
            templateCache.put(id, el);
          }
        };
        let parser = new DOMParser();
        let doc = parser.parseFromString(res, 'text/html');
        readTemplates(doc.firstChild.childNodes[1].firstChild);
      });
    }
  }

  Katrid.UI.Templates = Templates;

})();
