var WsServer = require('./lib/server'),
    WsClient = require('./lib/client');

module.exports = {
    createServer: function (server) {
        return (new WsServer(server))._transp;
    },
    createClient: function () {
        return (new WsClient());
    }
};
