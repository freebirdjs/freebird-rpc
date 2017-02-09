var Server = require('./lib/server'),
    Client = require('./lib/client');

module.exports = {
    createServer: function (httpServer) {
        return (new Server(httpServer))._transp;
    },
    createClient: function (addr, options) {
        return (new Client(addr, options));
    }
};
