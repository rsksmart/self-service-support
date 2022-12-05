const format = require('pg-format');
const db = require('../../dbPool.js');
const { getChainTableName, validateChain } = require('./validate-chain.js');

async function queryDb(chain) {
  const queryStr = `
    SELECT COUNT(*) AS monthly_txs
    FROM %I.block_transactions t
    WHERE t.signed_at 
    BETWEEN DATE_TRUNC('month', NOW()) - INTERVAL '1 month' 
    AND DATE_TRUNC('month', NOW())
    AND t.fees_paid != 0
  `;
  const query = format(queryStr, getChainTableName(chain));
  const [queryResult] = (await db.query(query)).rows;
  if (!queryResult?.monthly_txs) throw new Error('DB records not found');
  return queryResult;
}

async function fetch({ chain }) {
  const dbResult = await queryDb(chain);
  return {
    chain,
    time: new Date(),
    ...dbResult,
  };
}

module.exports = {
  path: '/api/v1/rsk-activity-report/monthly-txs',
  cacheTtl: 3600, // 1 hour
  fetch,
  queryStringParams: [
    {
      name: 'chain',
      defaultValue: 'rsk_mainnet',
      validate: validateChain,
    },
  ],
};
