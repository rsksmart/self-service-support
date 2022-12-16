const express = require('express');
const { join } = require('path');

const router = express.Router();

const staticDir = join(__dirname, 'static');

const maxAge = '1d';

// qr-code generator
const qrCodeDir = join(staticDir, 'qrcode');
router.use(express.static(qrCodeDir, { maxAge }));
router.get('/qrcode', (req, res) => {
  res.sendFile('index.html', {
    root: qrCodeDir,
    maxAge,
  });
});

// rsk token bridge
const tokenBridgeDir = join(staticDir, 'rsk-token-bridge');
router.use('/rsk-token-bridge', express.static(tokenBridgeDir, { maxAge }));

module.exports = router;
