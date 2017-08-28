(function () {

  class Comments {
    constructor(scope) {
      this.scope = scope;
      this.model = this.scope.$parent.model;

      this.scope.$parent.$watch('recordId', key => {
        this.scope.loading = Katrid.i18n.gettext('Loading...');
        return setTimeout(() => {
          this.masterChanged(key);
          return this.scope.$apply(() => {
            return this.scope.loading = null;
          });
        }
        , 1000);
      });

      this.items = [];
    }

    masterChanged(key) {
      if (key) {
        const svc = new Katrid.Services.Model('mail.message');
        return svc.post('get_messages', null, { args: [this.scope.$parent.record.messages] })
        .done(res => {
          return this.scope.$apply(() => {
            return this.items = res.result.data;
          });
        });
      }
    }

    postMessage(msg) {
      return this.model.post('post_message', null, { args: [[this.scope.$parent.recordId]], kwargs: { content: msg, content_subtype: 'html', format: true } })
      .done(res => {
        const msgs = res.result;
        this.scope.message = '';
        return this.scope.$apply(() => {
          return this.items = msgs.concat(this.items);
        });
      });
    }
  }


  Katrid.uiKatrid.directive('comments', () =>
    ({
      restrict: 'E',
      scope: {},
      replace: true,
      link(scope, element, attrs) {
        const form = $(element).closest('div[ng-form=form]').find('.content-scroll>.content');
        return form.append(element);
      },

      template() {
        return `\
  <div class="content">
      <div class="container comments">
        <mail-comments/>
      </div>
  </div>\
  `;
      }
    })
  );

  Katrid.uiKatrid.directive('mailComments', () =>
    ({
      restrict: 'E',
      replace: true,
      link(scope, element, attrs) {
        scope.comments = new Comments(scope);
        return scope.showEditor = function() {
          $('#mail-editor').show();
          $('#mail-msgEditor').focus();
          return true;
        };
      },

      template() {
        return `\
  <div>
          <h3>${Katrid.i18n.gettext('Comments')}</h3>
          <div class="form-group">
          <button class="btn btn-default" ng-click="showEditor();">${Katrid.i18n.gettext('New message')}</button>
          <button class="btn">${Katrid.i18n.gettext('Log an internal note')}</button>
          </div>
          <div id="mail-editor" style="display: none;">
            <div class="form-group">
              <textarea id="mail-msgEditor" class="form-control" ng-model="message"></textarea>
            </div>
            <div class="from-group">
              <button class="btn btn-primary" ng-click="comments.postMessage(message)">${Katrid.i18n.gettext('Send')}</button>
            </div>
          </div>
  
          <hr>
  
          <div ng-show="loading">\${loading}</div>
          <div class="comment media col-sm-12" ng-repeat="comment in comments.items">
            <div class="media-left">
              <img src="/static/web/static/assets/img/avatar.png" class="avatar img-circle">
            </div>
            <div class="media-body">
              <strong>\${ comment.author[1] }</strong> - <span title="\${comment.date_time|moment:'LLLL'}"> \${comment.date_time|moment}</span>
              <div class="clearfix"></div>
              <div>
                \${comment.content}
              </div>
            </div>
          </div>
    </div>\
  `;
      }
    })
  );


  class MailFollowers {}


  class MailComments extends Katrid.UI.Widgets.Widget {
    static initClass() {
      this.prototype.tag = 'mail-comments';
    }

    spanTemplate(scope, el, attrs, field) {
      return '';
    }
  }
  MailComments.initClass();


  Katrid.UI.Widgets.MailComments = MailComments;

}).call(this);
