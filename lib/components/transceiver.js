// Goal: We'd like to use any transportation for freebird client/server communication
// 
// String, Buffer -->| RX .receive() .send() TX |--> String, Buffer

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
    // if msg is String

    // if msg is Buffer
    return this._send(msg);
};

Transceiver.prototype.receive = function (msg) {
    // msg is a serialized string
    var self = this,
        jsonMsg;

    if (Buffer.isBuffer(msg))
        msg = msg.toString();

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
