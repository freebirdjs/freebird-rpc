// Goal: We'd like to use any transportation for freebird client/server communication
// 
// String, Buffer -->| RX .receive() .send() TX |--> String, Buffer

// Need Stream Implementation??

var util = require('util'),
    EventEmitter = require('events');

function Transceiver(name) {
    EventEmitter.call(this);
    this.name = name;

    this._send = function (msg, callback) {
        throw new Error('Template method _send should be provided by implementor');
    };
}

util.inherits(Transceiver, EventEmitter);

Transceiver.prototype.send = function (msg, callback) {
    return this._send(msg, callback);
};

Transceiver.prototype.receive = function (msg, callback) {
    // msg is a serialized string
    var self = this;

    if (typeof msg === 'string') {
        try {
            jsonMsg = JSON.parse(msg);
            setImmediate(function () {
                self.emit('message', jsonMsg);
            });
        } catch (e) {
            setImmediate(function () {
                self.emit('error', e);
            });
        }
    } else {
        setImmediate(function () {
            self.emit('error', new TypeError('Received message is not a string'));
        });
    }
};

module.exports = Transceiver;

var Transceiver = requrie('./components/transceiver.js');

function createTransceiver(name, spec) {
    // spec should be an object
    // spec._send() should be implemented
    return new Transceiver(name);
}

module.exports = {
    createServer: function (name, spec) {

    },
    createClient: function (name, spec) {

    }
};

module.exports = {
    createServer: createTransceiver,
    createClient: createTransceiver
};


module.exports = require('./lib/rpc.js');
