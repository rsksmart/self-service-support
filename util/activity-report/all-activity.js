const format = require('pg-format');
const db = require('../../dbPool.js');
const { getChainTableName } = require('./util.js');

async function dbQueryAllActivity(days, chainTableName) {
  const queryStr = `
  SELECT COUNT(DISTINCT t.from)
  FROM %I.block_transactions t
  WHERE t.signed_at >= NOW() - INTERVAL '%s DAY'
  AND t.signed_at <= NOW()
  `;
  const query = format(queryStr, chainTableName, days);
  const queryResult = await db.query(query);
  if (queryResult.rowCount === 0) return 0;
  return Number(queryResult.rows[0].count);
}

async function queryAllActivity(days, chain = 'rsk_mainnet') {
  if (isNaN(days) || days <= 0) {
    throw new Error(`Number of days '${days}' has unsupported format`);
  }
  const chainTableName = getChainTableName(chain);
  const dbResult = await dbQueryAllActivity(days, chainTableName);
  return {
    accounts: dbResult,
  };
}

module.exports = {
  queryAllActivity,
};
