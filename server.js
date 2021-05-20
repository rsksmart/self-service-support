require('dotenv').config();

const express = require('express');
const cors = require('cors');

const apiRouter = require('./api-router.js');

const server = express();

var corsOptions = {
  origin: [
    'https://rsk.co',
    /\.rsk\.co$/,
  ],
  optionsSuccessStatus: 200,
}

server.use(cors(corsOptions));

server.get('/api/status', (req, res) => {
  res.send({
    ok: Date.now(),
  });
});

server.use('/api/v1', apiRouter);

server.use(express.static(__dirname + '/static'));

module.exports = server;
