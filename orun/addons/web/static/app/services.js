/// <reference path="../jquery/jquery.d.ts" />
var Services;
(function (Services) {
    var RemoteService = (function () {
        function RemoteService(name) {
            this.name = name;
            console.log('');
        }
        RemoteService.prototype.__get = function (name, kwargs) {
            $.get('http://localhost:8000/api/rpc/' + this.name + '/' + name + '/', kwargs);
        };
        RemoteService.prototype.__post = function (name, kwargs, data) {
            $.post('http://localhost:8000/api/rpc/' + this.name + '/' + name + '/', kwargs);
        };
        RemoteService.prototype.call = function (name, data) {
            return this.__post('http://localhost:8000/api/rpc/' + this.name + '/' + name + '/', {}, data);
        };
        return RemoteService;
    }());
    Services.RemoteService = RemoteService;
})(Services || (Services = {}));
//# sourceMappingURL=services.js.map