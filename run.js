#!/usr/bin/env node

const server = require('./server.js');

const port = process.env.PORT || 11375;

server.listen(port);
