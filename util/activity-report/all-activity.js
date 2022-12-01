const format = require('pg-format');
const db = require('../../dbPool.js');
const { getChainTableName } = require('../verify-chain.js');

function verifyDays(days) {
  if (isNaN(days) || days <= 0) {
    throw new Error(`Number of days '${days}' has unsupported format`);
  }
}

async function queryDb({ days, chain }) {
  const queryStr = `
  SELECT COUNT(DISTINCT t.from) AS accounts
  FROM %I.block_transactions t
  WHERE t.signed_at >= NOW() - INTERVAL '%s DAY'
  AND t.signed_at <= NOW()
  `;
  const query = format(queryStr, getChainTableName(chain), days);
  const [queryResult] = (await db.query(query)).rows;
  if (!queryResult?.accounts) throw new Error('DB records not found');
  return queryResult;
}

module.exports = {
  queryDb,
  verifyDays,
};
