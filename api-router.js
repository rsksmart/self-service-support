const express = require('express');

const router = express.Router();

router.use(function (req, res, next) {
  console.log(Date.now());
  next();
});

router.get('/:product/options', function (req, res) {
  console.log('Inside route');
  const productName = req.params.product;
  if (productName !== 'rsk-token-bridge') {
    res.status(400).json({
      error: 'unsupported product',
      value: [productName],
    });
    return;
  }
  const {
    fromNetwork,
    txHash,
    walletName,
  } = req.query;
  res.status(200).json({
    message: 'ok',
    value: [fromNetwork, txHash, walletName],
  });
});

module.exports = router;
