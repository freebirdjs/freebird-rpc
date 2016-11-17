var Rpc = require('freebird-rpc');

var server = Rpc.createServer('example', {
    _send: function (msg) {

    }
});

server.on('message');
