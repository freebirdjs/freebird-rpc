# freebird-rpc
A RPC interface used for freebird REQ/RSP/IND message transmission  

## Table of Contents  

1. [Overview](#Overview)  
2. [Installation](#Installation)  
3. [Usage](#Usage)  
4. [APIs and Events](#APIs)  

<a name="Overview"></a>  
## 1. Overview  

This module is a transportation with WebSocket protocol, which is used to be RPC interface of freebird framework. It provide methods to create RPC client and RPC server for real-time remote communication. RPC server can be registered to freebird framework, so it can transmit the message of freebird to RPC client. And the RPC client is provide for front-end webapp developers, giva a chance to them to communicate with freebird.  

<br/>

<a name="Installation"></a>  
## 2. Installation  

> $ npm install freebird-rpc --save  

<br/>

<a name="Usage"></a>  
## 3. Usage  

**freebird-rpc** exports its functionalities as a object, which contains two methods, createServer() and createClient().  

* Create a RPC server  

```js
var fbRpc = require('freebird-rpc'),
    http = require('http');

var httpServer = http.createServer();
httpServer.listen(3000);

var rpcServer = fbRpc.createServer(httpServer);
```

* Create a RPC client

```js
var fbRpc = require('freebird-rpc');

var rpcClient = fbRpc.createClient('ws://192.168.1.108:3000');
```

<br/>

<a name="APIs"></a>  
## 4. APIs and Events  

<a name="API_server"></a>  
### .createServer(httpServer)  

Create the RPC server with a WebSocket server.  

**Arguments:**  

1. `httpServer` (_Object_): A Node.js HTTP server.  

**Returns:**  

- (*Object*): `rpcServer`  

**Example:**  

```js
var http = require('http'),
    fbRpc = require('freebird-rpc');

var httpServer,
    rpcServer;

httpServer = http.createServer().listen(3000);
rpcServer = fbRpc.createServer(httpServer);
```

<a name="API_client"></a>  
<br/>
*************************************************
### .createClient(addr[, options])  

Create the RPC client with a WebSocket client.  

**Arguments:**  

1. `addr` (_String_): host address  
2. `options` (_Object_): An object to set up the websocket client. Please refer to [ws.md](https://github.com/websockets/ws/blob/master/doc/ws.md#new-wswebsocketaddress-protocols-options) to see more detail about options.  

**Returns:**  

- (*Objects*): `rpcClient`  

**Example:**  

```js
var rpcClient = fbRpc.createClient('ws://192.168.1.108:3000');
```

<br/>
*************************************************

## Server Class  

`fbRpc.createServer()` returns an instance of this class. The instance, which is denoted as `rpcServer` in this document, and cotains a WebSocket server to do real-time bidirectional with WebSocket client.  

<a name="API_send"></a>
<br />  
*************************************************
### .send(msg, callback)  

Send the message to Websocket client.  

**Arguments:**  

1. `msg` (_Object_): `msg` must contains `clientId` and `data` properties. `clientId` is used to identify the client you want to send message to, and `data` is the message to transmit out which must be a string or a buffer.  
2. `callback` (_Function_): `function (err, bytes) { ... }`. Get called after message send off. The argument `bytes` tells how many bytes were sent.  

**Returns:**  

- (_None_)  

**Example:**  

```js
var sendMsg = {
    clientId: 'client01',
    data: {
        __intf: 'RSP',
        subsys: 'net',
        seq: 5,
        id: null,
        cmd: 'getAllDevIds',
        status: 0,
        data: { ids: [ 1, 2, 3, 8, 12 ] }
    }
};

rpcServer.send(sendMsg, function (err, bytes) {
    if (err)
        console.log(err);
    else
        console.log(bytes + ' bytes were sent');
});
```

<a name="API_broadcast"></a>
<br />  
*************************************************
### .broadcast(msg, callback)  

Broadcast the message to all WebSocket clients.  

**Arguments:**  

1. `msg` (_Object_): `msg` must contains `data` property. `data` is the message to transmit out which must be a string or a buffer.  
2. `callback` (_Function_): `function (err, bytes) { ... }`. Get called after message send off. The argument `bytes` tells how many bytes were sent.  

**Returns:**  

- (_None_)  

**Example:**  

```js
var broadcastMsg = {
    data: {
        __intf: 'IND',
        subsys: 'net',
        type: 'started',
        id: null,
        data: { netcore: 'freebird-netcore-ble' }
    }
};

rpcServer.broadcast(broadcastMsg, function (err, bytes) {
    if (err)
        console.log(err);
    else
        console.log(bytes + ' bytes were sent');
});
```

<a name="EVT_msg"></a>  
<br />  
*************************************************  
### .on('message', function (msg) {})  

The user can listen to the `'message'` event to receive the message.  

**Arguments of the listener**  

1. `msg` (_Object_): `msg` must contains `clientId` and `data` properties. `clientId` is used to identify the client who send the message, and `data` is the received message of a string or a buffer.  

**Example:**  

```js
rpcServer.on('message', function (msg) {
    console.log(msg.data.toString());
});
```

<br/>
*************************************************

## Client Class  

`fbRpc.createClient()` returns an instance of this class. The instance, which is denoted as `rpcClient` in this document, and cotains a WebSocket client to do real-time bidirectional with WebSocket server.

<a name="API_send"></a>  
<br />   
*************************************************
### .send(subsys, cmd, args, callback)  

Send the message to Websocket server.  

**Arguments:**  

1. `subSys` (_String_): Only 3 types accepted. They are 'net', 'dev', and 'gad' to denote which subsystem is this message going to.  
2. `cmd` (_String_): Command Identifier corresponding to the API name. It can be found in the Command Name field of the [Request Data Model](https://github.com/simenkid/freebird-web-client-server-spec/blob/master/spec.md#RequestData).  
3. `args` (_Object_): A value-object that contains command arguments. Please see section [Request Data Model](https://github.com/simenkid/freebird-web-client-server-spec/blob/master/spec.md#RequestData) to learn more about the args data object.  
4. `callback` (_Function_): `function (err, result) {}`. Get called when server respond to client with the results of the client asking for.  
    * `'err'` (_Error_): Error object.  
    * `'result'` (_Object_): result is an object of `{ status, data }`. `status` is corresponding to [RSP Status Code](https://github.com/simenkid/freebird-web-client-server-spec/blob/master/spec.md#4-rsp-status-code). `data` is a response data object, you can refer to [Response Data Model](https://github.com/simenkid/freebird-web-client-server-spec/blob/master/spec.md#response-1) to see more detail.  

**Returns:**  

- (_None_)  

**Example:**  

```js
rpcClient.send('net', 'getAllDevIds', {ncName: 'freebird-netcore-ble'}, function(err, result) {
    if (err) {
        console.log(err);
    } else {
        console.log(result);

        // result equal to 
        // {
        //     status: 0,
        //     data: {
        //         ids: [1, 5, 8, 15, 27]
        //     }
        // }
    }    
});
```

<a name="EVT_open"></a>  
<br />  
*************************************************
### .on('open', function () {})  

Emitted when the connection is open and ready to communicate.  

**Arguments of the listener**  

- (_None_)  

**Example:**  

```js  
rpcClient.on('open', function () {
    // You can communicate to RPC server
});
```  

<a name="EVT_close"></a>  
<br />   
*************************************************  
### .on('close', function (code, reason) {})  

Emitted when the connection is closed.  

**Arguments of the listener**  

1. `code` (_Number_): `code` is a numeric value indicating the status code explaining why the connection has been closed.  
2. `reason` (_String_): `reason` is a human-readable string explaining why the connection has been closed.  

**Example:**  

```js  
rpcClient.on('close', function (code, reason) {
    console.log('Connection is closed because the reason: ' + reason);
});
```  

<a name="EVT_ind"></a>  
<br />  
*************************************************  
### .on('ind', function (msg) {})  

Emitted when receiving an indication from websocket server side.  

**Arguments of the listener**  

1. `msg` (_Object_): It is a message object with properties `'subsys'`, `'type'`, `'id'` and `'data'`  
    * `subsys` (_String_): They are 'net', 'dev', and 'gad' to denote which subsystem is this indication coming from.  
    * `type` (_String_): Indication types. Please see section [Indication types](https://github.com/simenkid/freebird-web-client-server-spec/blob/master/spec.md#IndTypes) for details.  
    * `id` (_Number_): Id of the sender. id is meaningless if `subsys === 'net'`. id is **device id** if `subsys === 'dev'`. id is **gadget id** if `subsys === 'gad'`  
    * `data` (_Object_): Data along with the indication. Please see section [Indication Data Model](https://github.com/simenkid/freebird-web-client-server-spec/blob/master/spec.md#IndicationData) to learn more about the indication data format.  

**Example:**  

```js  
rpcClient.on('ind', function (msg) {
    console.log(msg);
});
```  

