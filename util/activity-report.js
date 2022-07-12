const db = require('../dbPool.js');
const format = require('pg-format');
const tokens = require('../data/tokens.json');

function validateParams(days) {
  if (isNaN(days) || days <= 0)
    throw new Error(`Number of days '${days}' has unsupported format`);
}

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

async function queryAllActivity(days) {
  validateParams(days);
  const dbResult = await dbQueryAllActivity(days);
  return {
    accounts: dbResult,
  };
}

module.exports = {
  queryAllActivity,
};
