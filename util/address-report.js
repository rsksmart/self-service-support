const db = require('../dbPool.js');
const format = require('pg-format');
const tokens = require('../data/tokens.json');

async function getQueryResult(query) {
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

function formatTopic(address = '0x000...') {
  return `\\x000000000000000000000000${address.substring(2)}`;
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

async function getRbtcTxsNumber(address, months) {
  const queryStr = `
  SELECT COUNT(*)
  FROM chain_rsk_mainnet.block_transactions t
  WHERE t.signed_at >= NOW() - INTERVAL '%s MONTH'
  AND t.signed_at <= NOW()
  AND t.value > 0
  AND t.from = %L
  `;
  const query = format(queryStr, months, formatAddress(address));
  return getQueryResult(query);
}

async function getTokenTxNumber(tokenNames = [], address, months = 6) {
  const queryStr = `
  SELECT COUNT(*)
  FROM chain_rsk_mainnet.block_transactions t
  WHERE t.signed_at >= NOW() - INTERVAL '%s MONTH'
  AND t.signed_at <= NOW()
  AND t.from = %L
  AND (${Array(tokenNames.length).fill('t.to = %L').join(' OR ')})
  `;
  const query = format(
    queryStr,
    months,
    formatAddress(address),
    ...tokenNames.map((name) => formatAddress(getTokenAddress(name))),
  );
  return getQueryResult(query);
}

async function getRnsTldTxNumber(address = '') {
  const transferEventTopic =
    '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef';
  const queryStr = `
  SELECT COUNT(*)
  FROM chain_rsk_mainnet.block_log_events e
  -- an event was emitted by RNS TLD s/c
  WHERE e.sender = %L
  -- and the event parameters include:
  -- 1. transfer event topic hash
  -- 2. investigated address
  AND e.topics @> array[%L::bytea, %L::bytea]
  `;
  const query = format(
    queryStr,
    formatAddress(getTokenAddress('rns_tld')),
    formatAddress(transferEventTopic),
    formatTopic(address),
  );
  return getQueryResult(query);
}

async function getAddressReport(address, months = 6) {
  validateParams(address, months);
  const propNames = [
    'rbtc_transfers',
    'rif_txs',
    'rns_txs',
    'moc_txs',
    'rdoc_txs',
    'sovryn_txs',
    'tropycus_txs',
  ];
  return createObject(
    await Promise.all([
      getRbtcTxsNumber(address, months),
      getTokenTxNumber(['rif'], address, months),
      getRnsTldTxNumber(address),
      getTokenTxNumber(['moc', 'doc', 'bitp'], address, months),
      getTokenTxNumber(['rdoc', 'rifpro'], address, months),
      getTokenTxNumber(['sov', 'xusd'], address, months),
      getTokenTxNumber(['ksat', 'krbtc', 'kdoc', 'kxusd'], address, months),
    ]),
    propNames,
  );
}

module.exports = getAddressReport;
