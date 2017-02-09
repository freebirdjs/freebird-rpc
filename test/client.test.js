var _ = require('busyman'),
    expect = require('chai').expect,
    http = require('http'),
    WebSocket = require('ws');

var fbRpc = require('../index');

var port = process.env.PORT || 5001,
    httpServer = http.createServer(),
    transp,
    server,
    client;

httpServer.listen(port);
transp = fbRpc.createServer(httpServer);
server = transp._server;

describe('Constructor Check', function () {
    before(function (done) {
        client = fbRpc.createClient('ws://localhost:' + port, {});
        client.on('open', function () {
            done();
        });
    });

    it('should has all correct members after new', function () {
        expect(client._wsClient).to.be.instanceof(WebSocket);
        expect(client._connected).to.be.true;
        expect(client._nextTransId).to.be.a('function');
    });
});

describe('Signature Check', function () {
    it('send(subsys, cmd, args, callback)', function () {
        expect(function () { client.send('xxx', 'xxx', {}, function () {}); }).not.to.throw();

        expect(function () { client.send({}, 'xxx', {}, function () {}); }).to.throw(TypeError);
        expect(function () { client.send([], 'xxx', {}, function () {}); }).to.throw(TypeError);
        expect(function () { client.send(123, 'xxx', {}, function () {}); }).to.throw(TypeError);
        expect(function () { client.send(true, 'xxx', {}, function () {}); }).to.throw(TypeError);
        expect(function () { client.send(undefined, 'xxx', {}, function () {}); }).to.throw(TypeError);
        expect(function () { client.send('xxx', {}, {}, function () {}); }).to.throw(TypeError);
        expect(function () { client.send('xxx', [], {}, function () {}); }).to.throw(TypeError);
        expect(function () { client.send('xxx', 123, {}, function () {}); }).to.throw(TypeError);
        expect(function () { client.send('xxx', true, {}, function () {}); }).to.throw(TypeError);
        expect(function () { client.send('xxx', undefined, {}, function () {}); }).to.throw(TypeError);
        expect(function () { client.send('xxx', 'xxx', [], function () {}); }).to.throw(TypeError);
        expect(function () { client.send('xxx', 'xxx', 123, function () {}); }).to.throw(TypeError);
        expect(function () { client.send('xxx', 'xxx', true, function () {}); }).to.throw(TypeError);
        expect(function () { client.send('xxx', 'xxx', undefined, function () {}); }).to.throw(TypeError);
        expect(function () { client.send('xxx', 'xxx', 'xxx', function () {}); }).to.throw(TypeError);
        expect(function () { client.send('xxx', 'xxx', {}, {}); }).to.throw(TypeError);
        expect(function () { client.send('xxx', 'xxx', {}, []); }).to.throw(TypeError);
        expect(function () { client.send('xxx', 'xxx', {}, 123); }).to.throw(TypeError);
        expect(function () { client.send('xxx', 'xxx', {}, true); }).to.throw(TypeError);
        expect(function () { client.send('xxx', 'xxx', {}, undefined); }).to.throw(TypeError);
        expect(function () { client.send('xxx', 'xxx', {}, 'xxx'); }).to.throw(TypeError);
    });
});

describe('Functional Check', function () {
    it('send()', function (done) {
        var receiveData = {
            __intf: 'REQ',
            subsys: 'dev',
            id: null,
            cmd: 'write', 
            args: { value: 'kitchen' }
        };

        client.send('dev', 'write', { value: 'kitchen' }, function () {});
        transp.on('message', function (msg) {
            msg.data = JSON.parse(msg.data);
            delete msg.data.seq;

            if (_.isEqual(msg.data, receiveData))
                done();
        });
    });

    it('ind event', function (done) {
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
            };

        transp.broadcast({ data: indData }, function (err, bytes) {
            if (err) return;

            client.on('ind', function (data) {
                if (_.isEqual(data, receiveData))
                    done();
            });
        });
    });

    it('close event', function (done) {
        client._wsClient.terminate();
        client.on('close', function () {
            expect(client._connected).to.be.false;
            done();
        });
    });
});