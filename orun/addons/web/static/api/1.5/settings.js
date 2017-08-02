
class Application {
  static initClass() {
    this.prototype.auth = {
      user: {},
      isAuthenticated: false,
      logout(next) {
        return console.log(next);
      }
    };
  }
  constructor(title) {
    this.title = title;
  }
}
Application.initClass();


Katrid.Application = Application;
