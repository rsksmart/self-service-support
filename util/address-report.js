const db = require('../dbPool.js');
const format = require('pg-format');
const tokens = require('../data/tokens.json');

async function queryDb(queryString, address, months) {
  // pg-format correctly interpolates dates as well
  const query = format(queryString, address, months);
  const queryResult = await db.query(query);
  if (queryResult.rowCount === 0) return 0;
  return Number(queryResult.rows[0].count);
}

// extracts token address by the name from the JSON file
function getTokenAddress(name = 'tokenName') {
  if (!(name in tokens))
    throw new Error(
      `Token name '${name}' can not be found in 'data/tokens.json'`,
    );
  return tokens[name];
}

function formatAddress(address = '0x000...') {
  return `\\${address.substring(1)}`;
}

async function getRbtcTxsNumber(address, months) {
  /* const queryString = ``;
  return queryDb(queryString, address, months); */
  return '%';
}

async function getRifTxsNumber(address, months) {
  const queryStr = `
  SELECT COUNT(*)
  FROM chain_rsk_mainnet.block_transactions t
  WHERE t.signed_at >= NOW() - INTERVAL '%s MONTH'
  AND t.signed_at <= NOW()
  AND t.from = %L
  AND t.to = %L
  `;
  const query = format(
    queryStr,
    months,
    formatAddress(address),
    formatAddress(getTokenAddress('rif')),
  );
  const queryResult = await db.query(query);
  if (queryResult.rowCount === 0) return 0;
  return Number(queryResult.rows[0].count);
}

async function getMocTxsNumber(address, months) {
  return '!';
}

async function getRocTxsNumber(address, months) {
  return '@';
}

async function getSovrynTxsNumber(address, months) {
  return '#';
}

async function getTropykusTxsNumber(address, months) {
  return '&';
}

async function checkForRnsDomain(address) {
  return '0';
}

// assembles an object from values and props arrays
function createObject(values = [], propNames = []) {
  if (values.length !== propNames.length)
    throw new Error(
      `createObject(): property and value number of an object should equal`,
    );
  return values.reduce(
    (object, currentValue, index) => ({
      ...object,
      [propNames[index]]: currentValue,
    }),
    {},
  );
}

function validateParams(address, months) {
  if (!address)
    throw new Error(
      `parameter 'address' should be specified in the query string`,
    );
  if (isNaN(months) || months <= 0)
    throw new Error(`Number of months '${months}' has unsupported format`);
}

async function getAddressReport(address, months = 6) {
  validateParams(address, months);
  const propNames = [
    'rbtc_transfers',
    'rif_transfers',
    'rns_domain',
    'moc_txs',
    'roc_txs',
    'sovryn_txs',
    'tropycus_txs',
  ];
  return createObject(
    await Promise.all([
      getRbtcTxsNumber(address, months),
      getRifTxsNumber(address, months),
      checkForRnsDomain(address),
      getMocTxsNumber(address, months),
      getRocTxsNumber(address, months),
      getSovrynTxsNumber(address, months),
      getTropykusTxsNumber(address, months),
    ]),
    propNames,
  );
}

module.exports = getAddressReport;
