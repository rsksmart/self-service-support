const express = require('express');
const { join } = require('path');

const router = express.Router();

const staticDir = join(__dirname, 'static');

// qr-code generator
const qrCodeDir = join(staticDir, 'qrcode');
router.use(express.static(qrCodeDir));
router.get('/qrcode', (req, res) => {
  res.sendFile(join(qrCodeDir, 'index.html'));
});

// rsk token bridge
const tokenBridgeDir = join(staticDir, 'rsk-token-bridge');
router.use('/rsk-token-bridge', express.static(tokenBridgeDir));

module.exports = router;
