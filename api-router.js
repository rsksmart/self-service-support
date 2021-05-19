const express = require('express');

const router = express.Router();

router.use(function (req, res, next) {
  console.log(Date.now());
  next();
});

router.get('/:product/options', async (req, res) => {
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
  let queryErrors = [];
  if (typeof fromNetwork !== 'string' ||
    ['rsk', 'ethereum'].indexOf(fromNetwork) < 0) {
    queryErrors.push('invalid fromNetwork: ' + fromNetwork);
  }
  if (typeof txHash !== 'string' ||
    !txHash.startsWith('0x')) {
    queryErrors.push('invalid txHash: '+ txHash);
  }
  if (typeof walletName !== 'string' ||
    ['metamask', 'nifty', 'liquality'].indexOf(walletName) < 0) {
    queryErrors.push('invalid walletName: ' + walletName);
  }
  if (queryErrors.length > 0) {
    res.status(400).json({
      error: 'invalid inputs',
      value: queryErrors,
    });
    return;
  }
  res.status(200).json({
    message: 'ok',
    value: [fromNetwork, txHash, walletName],
  });
});

module.exports = router;
