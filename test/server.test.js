var _ = require('busyman'),
    expect = require('chai').expect,
    http = require('http'),
    Transport = require('freebird-transport');

var fbRpc = require('../index');

var port = process.env.PORT || 5001,
    httpServer = http.createServer(),
    wsServer,
    wsClient;

httpServer.listen(port);

describe('Constructor Check', function () {
    it('createServer() should return a transport instance', function () {
        wsServer = fbRpc.createServer(httpServer);
        expect(wsServer).to.be.instanceof(Transport);
    });
});

describe('Functional Check', function () {
    before(function (done) {
        wsClient = fbRpc.createClient();
        wsClient.start('ws://localhost:' + port, {});
        wsClient.on('open', function () {
            done();
        });
    });

    it('send()', function (done) {
        var sendData = {
            __intf: 'RSP',
            subsys: 'dev',
            seq: 10,
            id: 1,      
            cmd: 'xxx',
            status: 1,          
            data: 'fail'          
        };

        wsServer.send({ clientId: wsClient.__id, data: sendData }, function () {
            wsClient.on(sendData.subsys + '_' + sendData.cmd + ':' + sendData.seq, function (status, data) {
                if (status === sendData.status && data === sendData.data)
                    done();
            });
        });
    });

    it('broadcast()', function () {

    });

    it('message event', function () {

    });
});
