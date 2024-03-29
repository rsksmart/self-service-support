const format = require('pg-format');
const db = require('../../dbPool.js');
const { getChainTableName, validateChain } = require('./validate-chain.js');

function validateDays(req, defaultValue) {
  const days = req.query.days ?? defaultValue;
  if (isNaN(days) || days <= 0) {
    throw new Error(`Number of days '${days}' has unsupported format`);
  }
}

async function queryDb(days, chain) {
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

async function fetch({ days, chain }) {
  const dbResult = await queryDb(days, chain);
  return {
    days,
    chain,
    ...dbResult,
  };
}

module.exports = {
  path: '/api/v1/rsk-activity-report/all-activity',
  cacheTtl: 600,
  fetch,
  queryStringParams: [
    {
      name: 'days',
      defaultValue: '20',
      validate: validateDays,
    },
    {
      name: 'chain',
      defaultValue: 'rsk_mainnet',
      validate: validateChain,
    },
  ],
};
