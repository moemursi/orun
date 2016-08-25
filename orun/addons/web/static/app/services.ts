/// <reference path="../jquery/jquery.d.ts" />

namespace Services {
    export class RemoteService {
        constructor(public name:string) {
            console.log('');
        }

        protected __get(name, kwargs) {
            $.get('http://localhost:8000/api/rpc/' + this.name + '/' + name + '/', kwargs);
        }

        protected __post(name, kwargs, data) {
            $.post('http://localhost:8000/api/rpc/' + this.name + '/' + name + '/', kwargs)
        }

        public call(name, data) {
            return this.__post('http://localhost:8000/api/rpc/' + this.name + '/' + name + '/', {}, data);
        }
    }
}
