/// <reference path="./services.ts"/>
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var orm;
(function (orm) {
    var Model = (function (_super) {
        __extends(Model, _super);
        function Model() {
            _super.apply(this, arguments);
        }
        Model.prototype.save = function () {
            this.__post('write', {}, {});
        };
        Model.prototype.search = function (where, limit) {
            if (limit === void 0) { limit = 100; }
            this.__get('search', where);
        };
        return Model;
    }(Services.RemoteService));
    orm.Model = Model;
})(orm || (orm = {}));
//# sourceMappingURL=orm.js.map