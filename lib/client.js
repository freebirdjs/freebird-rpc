/* jshint node: true */
'use strict';

var util = require('util'),
    EventEmitter = require('events').EventEmitter,
    WebSocket = require('ws'),
    _ = require('busyman');

var TIMEOUT_RSP_CODE = 8,
	REQ_TIMEOUT_SEC = 10;

function WsClient () {
    var self = this,
    	transId = 0;

    this._wsClient = null;
    this._connected = false;

    this._nextTransId = function () {
        if (transId > 255)
            transId = 0;
        return transId++;
    };
}

util.inherits(WsClient, EventEmitter);

WsClient.prototype.isRunning = function () {
    return !_.isNull(this._wsClient);
};

WsClient.prototype.start = function (addr, options) {
    var self = this,
        startSuccess = false;

    if (this.isRunning()) return startSuccess;
    if (arguments.length === 1) options = {};

    if (!_.isString(addr)) throw new Error('addr must ba a string');
    if (!_.isObject(options)) throw new Error('options must ba an object');

    this._wsClient = new WebSocket(addr, options);

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
            type = msg.type;
            delete msg.__intf;
            delete msg.type;
            self.emit(type, msg);
        }
    };

    startSuccess = true;
    return startSuccess;
};

WsClient.prototype.stop = function () {
    var stopSuccess = false;

    if (!this.isRunning()) return stopSuccess;

    this._wsClient.terminate();

    this._wsClient.onopen = function () {};
    this._wsClient.onclose = function () {};
    this._wsClient.onmessage = function () {};
    this._wsClient.onerror = function () {};

    this._wsClient = null;
    this._auth = false;
    this._connected = false;
    this.emit('close', 100, 'User closed.');

    stopSuccess = true;
    return stopSuccess;
};

WsClient.prototype.send = function (subsys, cmd, args, callback) {
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
        errMsg,
        timeoutCntl,
        rspListener;

    if (!_.isString(subsys)) throw new Error('subsys must ba a string');
    if (!_.isString(cmd)) throw new Error('cmd must ba a string');
    if (!_.isObject(args)) throw new Error('args must ba an object');
    if (!_.isFunction(callback)) throw new Error('callback must ba a function');

    if (!this.isRunning()) 
        errMsg = 'wsClient is not running.';
    else if (!this._connected) 
        errMsg = 'wsClient connection is closed.';

    if (errMsg) {
    	setImmediate(callback, new Error(errMsg));
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

module.exports = WsClient;
