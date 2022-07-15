const db = require('../dbPool.js');
const format = require('pg-format');
const tokens = require('../data/tokens.json');

const chainTableNames = {
  'rsk_testnet': 'chain_rsk_testnet',
  'rsk_mainnet': 'chain_rsk_mainnet',
};

function getChainTableName(chain) {
  if (!chain || !chainTableNames[chain]) {
    throw new Error(`chain '${chain}' is not supported`);
  }
  return chainTableNames[chain];
}

async function getQueryResult(query) {
  const queryResult = await db.query(query);
  if (queryResult.rowCount === 0) return 0;
  return Number(queryResult.rows[0].count);
}

async function dbQueryAllActivity(days, chainTableName) {
  const queryStr = `
  SELECT COUNT(DISTINCT t.from)
  FROM %I.block_transactions t
  WHERE t.signed_at >= NOW() - INTERVAL '%s DAY'
  AND t.signed_at <= NOW()
  `;
  const query = format(
    queryStr,
    chainTableName,
    days,
  );
  return getQueryResult(query);
}

async function dbQueryDeveloperActivity(startDate, endDate, chainTableName) {
  const queryStr = `
  SELECT
    COUNT(*) as deployment_tx_count,
    COUNT(DISTINCT t.from) as deployment_account_count
  FROM %I.block_transactions t
  WHERE t.signed_at >= %L
  AND t.signed_at <= %L
  AND t.to IS NULL
  `;
  const query = format(
    queryStr,
    chainTableName,
    startDate,
    endDate,
  );
  const queryResult = await db.query(query);
  if (queryResult.rowCount === 0) {
    return {
      deployment_tx_count: 0,
      deployment_account_count: 0,
    };
  }
  return {
    deployment_tx_count:
      parseInt(queryResult.rows[0].deployment_tx_count),
    deployment_account_count:
      parseInt(queryResult.rows[0].deployment_account_count),
  };
}

async function queryAllActivity(
  days,
  chain = 'rsk_mainnet',
) {
  if (isNaN(days) || days <= 0) {
    throw new Error(`Number of days '${days}' has unsupported format`);
  }
  if (!chain || !chainTableNames[chain]) {
    throw new Error(`chain '${chain}' is not supported`);
  }
  const chainTableName = getChainTableName(chain);
  const dbResult = await dbQueryAllActivity(days, chainTableName);
  return {
    accounts: dbResult,
  };
}

async function queryDeveloperActivity(
  startDate,
  endDate,
  chain = 'rsk_mainnet',
) {
  if (!startDate) {
    throw new Error(`startDate '${startDate}' has unsupported format`);
  }
  if (!endDate) {
    throw new Error(`endDate '${endDate}' has unsupported format`);
  }
  const chainTableName = getChainTableName(chain);
  const queryResult = await dbQueryDeveloperActivity(
    startDate, endDate, chainTableName);
  return queryResult;
}

module.exports = {
  queryAllActivity,
  queryDeveloperActivity,
};
