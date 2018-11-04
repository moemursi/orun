(function() {

  class Connection {
    constructor(name) {
      Katrid.Data.connections[name] = this;
      if (!Katrid.Data.connection)
        Katrid.Data.connection = this;
    }
  }

  Katrid.Data = {
    connections: {},
    connection: null,
    defaultConnection: 'default',
  }
})();
