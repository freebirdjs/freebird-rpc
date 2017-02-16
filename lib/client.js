/* jshint node: true */
'use strict';

var util = require('util'),
    EventEmitter = require('events').EventEmitter,
    WebSocket = require('ws'),
    _ = require('busyman'),
    RPC = require('freebird-constants').RPC;

var TIMEOUT_RSP_CODE = 8,
    REQ_TIMEOUT_SEC = 10;

function Client (addr, options) {
    var self = this,
        transId = 0;

    if (arguments.length === 1 || _.isNil(options)) 
        options = {};

    if (!_.isString(addr)) throw new Error('addr must ba a string');
    if (!_.isObject(options)) throw new Error('options must ba an object');

    this._wsClient = new WebSocket(addr, options);
    this._connected = false;

    this._wsClient.onopen = function () {
        self._connected = true;
        self.emit('open');
    };

    this._wsClient.onclose = function (event) {
        self._connected = false;
        self.emit('close', event.code, event.reason);
    };

    this._wsClient.onerror = function (event) {
        self.emit('error', event);
    };

    this._wsClient.onmessage = function (event) {
        var msg,
            type,
            evt;

        try {
            msg = JSON.parse(event.data);
        } catch (e) {
            return; //  ignore bad message
        }
        
        if (msg.__intf === 'RSP') {
            evt = msg.subsys + '_' + msg.cmd + ':' + msg.seq;
            self.emit(evt, msg.status, msg.data);
        } else if (msg.__intf === 'IND') {
            var subsys = msg.subsys;

            delete msg.__intf;

            if (subsys === 'net' || subsys === RPC.Subsys.net)
                msg.subsys = 'net';
            else if (subsys === 'dev' || subsys === RPC.Subsys.dev)
                msg.subsys = 'dev';
            else if (subsys === 'gad' || subsys === RPC.Subsys.gad)
                msg.subsys = 'gad';

            self.emit('ind', msg);
        }
    };

    this._nextTransId = function () {
        if (transId > 255)
            transId = 0;
        return transId++;
    };
}

util.inherits(Client, EventEmitter);

Client.prototype.send = function (subsys, cmd, args, callback) {
    var self = this,
        evt,
        reqMsg = {
            __intf: 'REQ',
            subsys: subsys,
            seq: self._nextTransId(),
            id: (args.id) ? args.id : null,
            cmd: cmd, 
            args: args
        },
        timeoutCntl,
        rspListener;

    if (!_.isString(subsys)) throw new TypeError('subsys must ba a string');
    if (!_.isString(cmd)) throw new TypeError('cmd must ba a string');
    if (!_.isPlainObject(args)) throw new TypeError('args must ba an object');
    if (!_.isFunction(callback)) throw new TypeError('callback must ba a function');

    if (!this._connected) {
        setImmediate(callback, new Error('wsClient connection is closed.'));
    } else {
        evt = subsys + '_' + cmd + ':' + reqMsg.seq;

        rspListener = function (status, data) {
            callback(null, { status: status, data: data });
        };

        // [TODO] timeout seconds? how to define a reasonable time
        timeoutCntl = setTimeout(function () {
            self.emit(evt, TIMEOUT_RSP_CODE, {});   // { status: 'timeout', data: {} }
        }, REQ_TIMEOUT_SEC * 1000);

        this.once(evt, rspListener);
        this._wsClient.send(JSON.stringify(reqMsg));
    }
};

module.exports = Client;
