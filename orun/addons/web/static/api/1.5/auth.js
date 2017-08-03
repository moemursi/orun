(function () {

  const SESSION_USER_KEY = '_katridUser';
  
  class Auth {
    static initClass() {
      this.prototype.user = null;
    }
    constructor() {
      this.user = JSON.parse(window.sessionStorage.getItem(SESSION_USER_KEY));
      if ((this.user == null)) {
        this.user = {'is_authenticated': false};
      }
    }
  
    login(username, password) {
      const rpcName = Katrid.Settings.server + '/api/auth/login/';
      return $.ajax({
        method: 'POST',
        url: rpcName,
        data: JSON.stringify({'username': username, 'password': password}),
        contentType: "application/json; charset=utf-8",
        dataType: 'json'}).success(function(res) {
        console.log(res);
        return window.sessionStorage.setItem(SESSION_USER_KEY, JSON.stringify(res.result));
      });
    }
  
    loginRequired(path, urls, next) {
      if ((Array.from(urls).includes(path) && this.user.is_authenticated) || (!Array.from(urls).includes(path))) {
        return true;
      } else {
        return false;
      }
    }
  
    isAuthenticated() {
      const rpcName = Katrid.Settings.server + '/api/auth/login/';
      return $.get(rpcName);
    }
  }
  Auth.initClass();
  
  
  Katrid.Auth = new Auth();
  
});