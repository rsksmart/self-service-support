const express = require('express');

const calcTxAge = require('./util/calc-tx-age.js');

const router = express.Router();

router.use(function (req, res, next) {
  console.log(Date.now());
  next();
});

const allowedFromNetworks = [
  'rsk-mainnet',
  'rsk-testnet',
  'ethereum-mainnet',
  'ethereum-kovan',
];

const allowedWalletNames = [
  'metamask',
  'nifty',
  'liquality',
];

router.get('/:product/options', async (req, res) => {
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
    allowedFromNetworks.indexOf(fromNetwork) < 0) {
    queryErrors.push('invalid fromNetwork: ' + fromNetwork);
  }
  if (typeof txHash !== 'string' ||
    !txHash.startsWith('0x')) {
    queryErrors.push('invalid txHash: '+ txHash);
  }
  if (typeof walletName !== 'string' ||
    allowedWalletNames.indexOf(walletName) < 0) {
    queryErrors.push('invalid walletName: ' + walletName);
  }
  if (queryErrors.length > 0) {
    res.status(400).json({
      error: 'invalid inputs',
      value: queryErrors,
    });
    return;
  }
  let txAge = 0;
  try {
    txAge = await calcTxAge(fromNetwork, txHash);
  } catch (ex) {
    res.status(400).json({
      error: 'unable to calculate tx age',
      value: [ex.message],
    });
    return;
  }
  res.status(200).json({
    message: 'ok',
    value: [fromNetwork, txHash, walletName, txAge],
  });
});

module.exports = router;