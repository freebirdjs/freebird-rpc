var Transceiver = requrie('./components/transceiver.js');

function createTransceiver(spec) {
    // spec should be an object
    // spec._send() should be implemented
}

var rpc = {
    createServer: function (name, spec) {

    },
    createClient: function (name, spec) {

    }
};

module.exports = {
    createServer: createTransceiver,
    createClient: createTransceiver
};
