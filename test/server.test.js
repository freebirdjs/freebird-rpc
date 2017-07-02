var _ = require('busyman'),
    expect = require('chai').expect,
    http = require('http'),
    Transport = require('freebird-transport'),
    WebsocketServer = require('ws').Server;

var fbRpc = require('../index');

var port = process.env.PORT || 5002,
    httpServer = http.createServer(),
    transp,
    server,
    client1,
    client2;

httpServer.listen(port);

describe('Constructor Check', function () {
    it('createServer() should return a transport instance', function () {
        transp = fbRpc.createServer(httpServer);
        server = transp._server;
        expect(transp).to.be.instanceof(Transport);
    });

    it('Server class', function () {
        expect(server._wsServer).to.be.instanceof(WebsocketServer);
        expect(server._transp).to.be.equal(transp);
        expect(server._wsClients).to.be.deep.equal([]);
    });
});

describe('Functional Check', function () {
    before(function (done) {
        var connNum = 0;

        client1 = fbRpc.createClient('ws://localhost:' + port, {});
        client2 = fbRpc.createClient('ws://localhost:' + port, {});
        client1.on('open', function () {
            connNum += 1;
            if (connNum === 2) done();
        });
        client2.on('open', function () {
            connNum += 1;
            if (connNum === 2) done();
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

        transp.send({ clientId: 'client1', data: sendData }, function (err, sendBytes) {
            if (err) return;

            client1.on(sendData.subsys + '_' + sendData.cmd + ':' + sendData.seq, function (status, data) {
                if (status === sendData.status && data === sendData.data)
                    done();
            });
        });
    });

    it('broadcast()', function (done) {
        var indData = {
                __intf: 'IND',
                subsys: 'dev',
                type: 'devIncoming',
                id: 3,             
                data: 'success'          
            },
            receiveData = {
                subsys: 'dev',
                type: 'devIncoming',
                id: 3,             
                data: 'success'
            },
            receiveNum = 0;

        transp.broadcast({ data: indData }, function (err, sendBytes) {
            if (err) return;

            client1.on('ind', function (data) {
                if (_.isEqual(data, receiveData))
                    receiveNum += 1;

                if (receiveNum === 2) done();
            });

            client2.on('ind', function (data) {
                if (_.isEqual(data, receiveData))
                    receiveNum += 1;

                if (receiveNum === 2) done();
            });
        });
    });

    it('message event', function (done) {
        var receiveData = {
                __intf: 'REQ',
                subsys: 'net',
                seq: 0,
                id: null,
                cmd: 'getAllDevIds', 
                args: {}
            },
            receiveMsg = {
                clientId: 'client1',
                data: receiveData
            };

        client1.send('net', 'getAllDevIds', {}, function () {});
        transp.on('message', function (msg) {
            msg.data = JSON.parse(msg.data);

            if (_.isEqual(msg, receiveMsg))
                done();
        });
    });
});
