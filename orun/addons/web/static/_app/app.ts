/// <reference path="./orm.ts" />

let obj = new orm.Model('sys.model');
obj.save();
obj.search({name: 'model'});
