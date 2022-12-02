// Template for creating a new API handler

// 0. Imports
const format = require('pg-format');
const db = require('../../dbPool.js');
const { getChainTableName } = require('../verify-chain.js');

// 1. QS params validation functions
function verifyParam(/* req, defaultValue */) {}

// 2. DB query function
async function queryDb(chain) {
  const queryStr = `

  `;
  const query = format(queryStr, getChainTableName(chain));
  const [queryResult] = (await db.query(query)).rows;
  if (!queryResult?.accounts) throw new Error('DB records not found');
  return queryResult;
}

// 3. `fetch` function returning API data props object
async function fetch({ chain }) {
  const dbResult = await queryDb(chain);
  return {
    chain,
    time: new Date(),
    ...dbResult,
  };
}

// 4. Exports
module.exports = {
  verifyParam,
  fetch,
};
