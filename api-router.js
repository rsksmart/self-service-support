const express = require('express');

const calcTxInfo = require('./util/calc-tx-info.js');
const rskTokenBridgeController = require('./rsk-token-bridge-controller.js');
const getAddressReport = require('./util/address-report.js');
const rskActivityReport = require('./util/activity-report.js');

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

const allowedWalletNames = ['metamask', 'nifty', 'liquality'];

router.get('/:product/options', async (req, res) => {
  const productName = req.params.product;
  if (productName !== 'rsk-token-bridge') {
    res.status(400).json({
      endPointVersion: 1,
      error: 'unsupported product',
      value: [productName],
    });
    return;
  }
  const { fromNetwork, txHash, walletName } = req.query;
  let queryErrors = [];
  if (
    typeof fromNetwork !== 'string' ||
    allowedFromNetworks.indexOf(fromNetwork) < 0
  ) {
    queryErrors.push('invalid fromNetwork: ' + fromNetwork);
  }
  if (typeof txHash !== 'string' || !txHash.startsWith('0x')) {
    queryErrors.push('invalid txHash: ' + txHash);
  }
  if (
    typeof walletName !== 'string' ||
    allowedWalletNames.indexOf(walletName) < 0
  ) {
    queryErrors.push('invalid walletName: ' + walletName);
  }
  if (queryErrors.length > 0) {
    res.status(400).json({
      endPointVersion: 1,
      error: 'invalid inputs',
      value: queryErrors,
    });
    return;
  }
  let txInfo;
  try {
    txInfo = await calcTxInfo(fromNetwork, txHash);
  } catch (ex) {
    console.error(ex);
    res.status(400).json({
      endPointVersion: 1,
      error: 'unable to calculate tx info',
      value: [ex.message],
    });
    return;
  }
  const txFrom = txInfo.tx.from;
  const txAge = txInfo.meta.txAge;

  // now we have the necessary information:
  // transaction age, the from network, and the wallet used
  // we can use this to filter the set of support responses relevant to them
  const params = {
    fromNetwork,
    txHash,
    walletName,
    txAge,
    txFrom,
  };
  const options = rskTokenBridgeController.getOptionsRendered(params);

  res.format({
    html: function () {
      const htmlForOptions = rskTokenBridgeController.getOptionsHtml(options);
      res.status(200).send(htmlForOptions);
    },
    default: function () {
      res.status(200).json({
        endPointVersion: 1,
        message: 'ok',
        properties: params,
        options,
      });
    },
  });
});

router.get('/rsk-address-report/protocol-usage', async (req, res) => {
  try {
    const { address, months } = req.query;
    const addressReport = await getAddressReport(address, months);
    res.status(200).json({
      endPointVersion: 4,
      ...addressReport
    });
  } catch (error) {
    res.status(400).json({
      endPointVersion: 4,
      error: error.message,
    });
  }
});

router.get('/rsk-activity-report/all-activity', async (req, res) => {
  try {
    const { days, chain } = req.query;
    const allActivityReport = await rskActivityReport
      .queryAllActivity(days, chain);
    res.status(200).json({
      endPointVersion: 2,
      ...allActivityReport
    });
  } catch (error) {
    res.status(400).json({
      endPointVersion: 2,
      error: error.message,
    });
  }
});

router.get('/rsk-activity-report/developer-activity', async (req, res) => {
  try {
    const { startDate, endDate, chain } = req.query;
    const allActivityReport = await rskActivityReport
      .queryDeveloperActivity(startDate, endDate, chain);
    res.status(200).json({
      endPointVersion: 2,
      ...allActivityReport
    });
  } catch (error) {
    res.status(400).json({
      endPointVersion: 2,
      error: error.message,
    });
  }
});

module.exports = router;
