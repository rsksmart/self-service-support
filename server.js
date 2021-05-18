const express = require('express');

const apiRouter = require('./api-router.js');

const server = express();

server.use('/api/v1', apiRouter);

server.use(express.static(__dirname + '/static'));

module.exports = server;
