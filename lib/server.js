/* jshint node: true */
'use strict';

var WebsocketServer = require('ws').Server,
    Transport = require('freebird-transport'),
    _ = require('busyman');

function Server (httpServer) {
    var self = this,
        id = 0;

    this._wsServer = new WebsocketServer({ server: httpServer });
    this._transp = new Transport();
    this._wsClients = [];

    /***********************************************************************/
    /*** WebSocket event handlers                                        ***/
    /***********************************************************************/
    this._wsServer.on('connection', function (wsClient) {
        self._initClient(wsClient); 
    });

    this._wsServer.on('error', function (err) {
        // [TODO]
        console.log('WsServer error: ' + err);
    });

    /***********************************************************************/
    /*** Transportation APIs implement                                   ***/
    /***********************************************************************/
    this._transp._server = this;
    this._transp._send = function (msg, callback) {
        // msg: { clientId, data }
        var wsClient = _.find(self._wsClients, function (c) {
            return c.client.__id === msg.clientId;
        });

        msg.data = isJsonString(msg.data) ? msg.data : JSON.stringify(msg.data);

        if (!wsClient) {
            return setImmediate(callback, new Error('wsClient of clientId: ' + msg.clientId + ' not found.'));
        } else {
            wsClient.client.send(msg.data);
            return setImmediate(callback, null, Buffer.byteLength(msg.data));
        }
    };

    this._transp._broadcast = function (msg, callback) {
        // msg: { data }
        var sendBytes = 0;

        msg.data = isJsonString(msg.data) ? msg.data : JSON.stringify(msg.data);

        _.forEach(self._wsClients, function (wsClient) {
            sendBytes += Buffer.byteLength(msg.data);
            wsClient.client.send(msg.data);
        });

        return setImmediate(callback, null, sendBytes);
    };

    this._idGenerator = function () {
        id += 1;
        return 'client' + id;
    };
}

/***********************************************************************/
/*** Protected Methods                                               ***/
/***********************************************************************/
Server.prototype._registerClient = function (wsClient, listeners) {
    var isThere = this._wsClients.find(function (c) {
            return c.client === wsClient;
        });

    if (!isThere) {
        wsClient.__id = this._idGenerator();

        this._wsClients.push({
            client: wsClient,
            listeners: listeners
        });
    }

    return isThere ? false : true;
};

Server.prototype._unregisterClient = function (wsClient) {
    var removed,
        removedClient;

    removed = _.remove(this._wsClients, function (c) {
        return c.client === wsClient;
    });

    if (removed.length) {
        removedClient = removed[0];
        _.forEach(removedClient.listeners, function (lsn, evt) {
            if (_.isFunction(lsn))
                removedClient.client.removeListener(evt, lsn);
        });
    }

    return removed.length ? true : false;   // unregSuccess
};

Server.prototype._initClient = function (wsClient) {
    var self = this,
        regSuccess = false,
        clientLsns = {
            error: null,
            close: null,
            message: null
        };

    wsClient._auth = false; // tag for authentication checked

    clientLsns.error = function (err) {
        // [TODO]
        console.log('wsClient error: ' + err.message);
    };

    clientLsns.close = function () {
        console.log('client is closed');
        self._unregisterClient(wsClient);   // remove client and it listeners
    };

    clientLsns.message = function (msg) {
        self._transp.receive({ clientId: wsClient.__id, data: msg }); //JSON.parse(msg)
    };

    regSuccess = this._registerClient(wsClient, clientLsns);

    if (regSuccess) {
        // attach listeners
        _.forEach(clientLsns, function (lsn, evt) {
            if (_.isFunction(lsn))
                wsClient.on(evt, lsn);
        });
    }
};

/***********************************************************************/
/*** Private Methods                                                 ***/
/***********************************************************************/
function isJsonString (str) {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
}

module.exports = Server;