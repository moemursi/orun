/// <reference path="./services.ts"/>

namespace orm {
    export class Model extends Services.RemoteService {
        public save() {
            this.__post('write', {}, {});
        }

        public search(where, limit=100) {
            this.__get('search', where);
        }
    }
}
