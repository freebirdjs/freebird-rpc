# freebird-rpc
A RPC interface used for freebird web client and server to communicate with each other through WebSocket.

[![NPM](https://nodei.co/npm/freebird-rpc.png?downloads=true)](https://nodei.co/npm/freebird-rpc/)  

[![Travis branch](https://img.shields.io/travis/freebirdjs/freebird-rpc/master.svg?maxAge=2592000)](https://travis-ci.org/freebirdjs/freebird-rpc)
[![npm](https://img.shields.io/npm/v/freebird-rpc.svg?maxAge=2592000)](https://www.npmjs.com/package/freebird-rpc)
[![npm](https://img.shields.io/npm/l/freebird-rpc.svg?maxAge=2592000)](https://www.npmjs.com/package/freebird-rpc)

<br />

## Documentation 

Please visit the [Wiki](https://github.com/freebirdjs/freebird-rpc/wiki).

<br />

## Overview  

This module is a transportation with WebSocket protocol, which is used by the RPC interface of freebird framework. It provides methods to create RPC client and RPC server for real-time remote communications. The RPC server should be registered to freebird framework to be able to transmit freebird messages to RPC client (e.g., the web browser). And the RPC client is provided for webapp to be able to communicate with freebird.  

See [Overview](https://github.com/freebirdjs/freebird-rpc/wiki#Overview) on the Wiki for details. 

<br/>

## Installation  

> $ npm install freebird-rpc --save  

<br/>

## Usage  

See [Usage](https://github.com/freebirdjs/freebird-rpc/wiki#Usage) on the Wiki for details.  

<br/>

## License

Licensed under [MIT](https://github.com/freebirdjs/freebird-rpc/blob/master/LICENSE).  