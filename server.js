const { join } = require('path');
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const apiRouter = require('./api-router.js');
const qrcodeRouter = require('./qrcode-router.js');

const server = express();

let corsOptions;
const permissiveCors = process.env.PERMISSIVE_CORS;
if (permissiveCors) {
  corsOptions = {
    origin: true,
    optionsSuccessStatus: 200,
  };
} else {
  corsOptions = {
    origin: ['https://rsk.co', /\.rsk\.co$/],
    optionsSuccessStatus: 200,
  };
}

server.use(cors(corsOptions));

if (process.env.NODE_ENV != 'production') {
  server.use(morgan('dev'));
}
server.get('/api/status', (req, res) => {
  res.send({
    ok: Date.now(),
  });
});

server.use('/api/v1', apiRouter);
// qr-code generator
// server.use('/qrcode', qrcodeRouter);
server.use('/qrcode', express.static(join(__dirname, 'qrcode')));

// server.use(express.static(join(__dirname, 'qrcode')));
// server.use(express.static(join(__dirname, 'static')));

module.exports = server;
