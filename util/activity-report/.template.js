// Template for creating a new API handler

// 0. Imports
const format = require('pg-format');
const db = require('../../dbPool.js');
const { validateChain, getChainTableName } = require('./validate-chain.js');

// 1. QS params validation functions
function validateParam(req, defaultValue) {
  const param = req.query.days ?? defaultValue;
  if (!param) {
    throw new Error(`QR parameter '${param}' has unsupported format`);
  }
}

// 2. DB query function
async function queryDb(chain) {
  const queryStr = `

  `;
  const query = format(queryStr, getChainTableName(chain));
  const [queryResult] = (await db.query(query)).rows;
  if (!queryResult?.db_entry) throw new Error('DB records not found');
  return queryResult;
}

// 3. `fetch` function returning API data props object
async function fetch({ chain, param }) {
  const dbResult = await queryDb(chain);
  return {
    chain,
    param,
    ...dbResult,
  };
}

// 4. Export API description
module.exports = {
  path: '/api/v1/rsk-activity-report/endpoint-name',
  cacheTtl: 600,
  fetch,
  queryStringParams: [
    {
      name: 'param',
      defaultValue: '0',
      validate: validateParam,
    },
    {
      name: 'chain',
      defaultValue: 'rsk_mainnet',
      validate: validateChain,
    },
  ],
};
