const { resolve } = require('path');
const express = require('express');

const router = express.Router();

router.get('/', (req, res) => {
  res.json({ message: 'hello' });
  // res.sendFile(resolve(__dirname, 'qrcode', 'index.html'));
});

module.exports = router;
