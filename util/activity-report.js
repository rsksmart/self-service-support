const db = require('../dbPool.js');
const format = require('pg-format');
const tokens = require('../data/tokens.json');

async function getQueryResult(query) {
  const queryResult = await db.query(query);
  if (queryResult.rowCount === 0) return 0;
  return Number(queryResult.rows[0].count);
}

async function dbQueryAllActivity(days = 30) {
  const queryStr = `
  SELECT COUNT(DISTINCT t.from)
  FROM chain_rsk_mainnet.block_transactions t
  WHERE t.signed_at >= NOW() - INTERVAL '%s DAY'
  AND t.signed_at <= NOW()
  `;
  const query = format(
    queryStr,
    days,
  );
  return getQueryResult(query);
}

async function dbQueryDeveloperActivity(startDate, endDate, chainTableName) {
  const queryStr = `
  SELECT
    COUNT(*) as deployment_tx_count,
    COUNT(DISTINCT t.from) as deployment_account_count
  FROM ${chainTableName}.block_transactions t
  WHERE t.signed_at >= %L
  AND t.signed_at <= %L
  AND t.to IS NULL
  `;
  const query = format(
    queryStr,
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

async function queryAllActivity(days) {
  if (isNaN(days) || days <= 0)
    throw new Error(`Number of days '${days}' has unsupported format`);
  const dbResult = await dbQueryAllActivity(days);
  return {
    accounts: dbResult,
  };
}

const chainTableNames = {
  'rsk_testnet': 'chain_rsk_testnet',
  'rsk_mainnet': 'chain_rsk_mainnet',
};

async function queryDeveloperActivity(
  startDate,
  endDate,
  chain = 'rsk_testnet',
) {
  console.log(startDate, endDate, chain);
  if (!startDate) {
    throw new Error(`startDate '${startDate}' has unsupported format`);
  }
  if (!endDate) {
    throw new Error(`endDate '${endDate}' has unsupported format`);
  }
  if (!chain || !chainTableNames[chain]) {
    throw new Error(`chain '${chain}' is not supported`);
  }
  const queryResult = await dbQueryDeveloperActivity(
    startDate, endDate, chainTableNames[chain]);
  return queryResult;
}

module.exports = {
  queryAllActivity,
  queryDeveloperActivity,
};
