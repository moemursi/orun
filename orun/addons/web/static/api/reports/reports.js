
class Page {
  constructor(page) {
    this.page = page;
    this.footer = page.find('footer:first').first();
    this.header = page.find('header:first').first();
  }

  newPage(report) {
    let page = $('<page></page>');
    report.preparedDoc.append(page);
    report.pageCount++;
    report.pageNo++;
    this.height = page.height();
    console.log('height', page);
    if (this.header.length) {
      let header = this.header.clone();
      page.append(header);
      this.height -= header.outerHeight(true);
    }
    let footer = this.footer.clone();
    page.append(footer);
    this.height -= footer.outerHeight(true);
    return page;
  }

  prepare(report) {
    report.pageCount = 0;
    report.pageNo = 0;
    let page = this.newPage(report);
    let ct = 0;
    for (let child of this.page.find('.band')) {
      child = $(child);
      page.append(child);
      let h = child.outerHeight(true);
      if (ct && this.height < h) {
        console.log('new page');
        page = this.newPage(report);
        ct = 0;
      }
      this.height -= h;
      if (ct === 0)
        page.append(child);
      ct += 1;
    }
  }
}


class Report {
  constructor(doc) {
    this.doc = $(doc);
    let pages = this.doc.find('page');
    if (pages.length)
      for (let p of pages)
        this.pages = [new Page(p)];
    else
      this.pages = [new Page(this.doc)];
  }

  prepare() {
    this.preparedDoc = $('<report></report>');
    $('body').append(this.preparedDoc);
    for (let p of this.pages)
      p.prepare(this);
  }

  load(pageH, rep, header) {
    $('row').addClass('row');
    $('column').addClass('col');
    $('table').addClass('table table-sm');
    $('tr.auto-size').addClass('d-flex');
    $('tr.auto-size>td').addClass('col');
    $('tr.auto-size>th').addClass('col');

    let y = 0;
    rep.find('.band').each(function(idx, el) {
      let band = $(el);
      let h = $(el).outerHeight();
      if (y > pageH) {
        y = 0;
        band.addClass('page-break').css('margin-top', header.toString());
      }
      y += h;
    })
  }
}

$(document).ready(() => {
  // let h = document.offsetHeight;
  // let html = $('report').html();
  // for (let i=0;i<100;i++)
  //   document.body.html = '';
  // ReportEngine.load(h);
});

loadReport = function(height, html) {
  let el = $('body').html('');
  let report = new Report(html);
  report.prepare();
  return;
  html = $(html);
  let h = el.find('footer').outerHeight();
  let header = el.find('header');
  h += header.outerHeight();
  report.load(height - h, html, header.outerHeight());
};

