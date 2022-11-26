const format = require('pg-format');
const NodeCache = require('node-cache');
const db = require('../../dbPool.js');
const { getChainTableName } = require('./util.js');

// cache time to live
const shortStorageTtl = 600; // seconds
const databaseDelayLimit = 3; // seconds

const cache = new NodeCache();
/* 
  I use 2 types of cache storages:
  - short term storage (ttl is specified at the file top)
  - long term storage (unlimited time)
 */
const getShortStorageId = (chain) => `avg-tx-cost-short-storage-${chain}`;
const getLongStorageId = (chain) => `avg-tx-cost-long-storage-${chain}`;

async function dbQueryAvgTxCost(blocks, chainTableName) {
  /* 
    PosgreSQL query:
    1. get the last %s blocks
    2. populate blocks with current RBTC/USD rates
    3. get average gas fees in both RBTC and USD
  */
  const queryStr = `
    WITH last_blocks AS (
      SELECT b.id, b.signed_at
      FROM %I.blocks b
      ORDER BY b.height DESC
      LIMIT %s
    ), last_blocks_with_usd_rates AS (
      SELECT lb.id, tp.price_in_usd 
      FROM reports.token_prices tp
      INNER JOIN last_blocks lb
      ON DATE_TRUNC('day', tp.dt) = DATE_TRUNC('day', lb.signed_at)
      WHERE tp.chain_id = 30 
      AND tp.coingecko_token_id = 'rootstock'
    )
    SELECT 
    AVG(t.fees_paid / 10^18) AS avg_tx_cost_rbtc,
    AVG(t.fees_paid / 10^18 * lb.price_in_usd) AS avg_tx_cost_usd
    FROM %I.block_transactions t
    INNER JOIN last_blocks_with_usd_rates lb
    ON t.block_id = lb.id
    WHERE t.fees_paid != 0  
  `;
  const query = format(queryStr, chainTableName, blocks, chainTableName);
  const [avgTxCost] = (await db.query(query)).rows;
  if (!avgTxCost?.avg_tx_cost_usd) throw new Error('DB records not found');
  return {
    time: new Date(),
    ...avgTxCost,
  };
}

function getFromDbOrLongStorage(blocks, chainTableName) {
  return new Promise((resolve) => {
    const getCached = () =>
      resolve(cache.get(getLongStorageId(chainTableName)));
    // try to get db response before the deadline
    (async () => {
      try {
        const avgTxCost = await dbQueryAvgTxCost(blocks, chainTableName);
        // each time we are able to successfully get the query result
        // store these values + the timestamp in memory
        cache.set(getLongStorageId(chainTableName), avgTxCost);
        resolve(avgTxCost);
      } catch (error) {
        // each time we are unsuccessful in making the query (e.g. DB went down)
        // retrieve the values plus timestamp from the long storage
        getCached();
      }
    })();
    // if waiting longer than deadline, read from the long storage
    setTimeout(getCached, databaseDelayLimit * 1000);
  });
}

function verifyParams(blocks) {
  const blocksRange = {
    lower: 1,
    upper: 1000,
  };
  if (!(blocks >= blocksRange.lower && blocks <= blocksRange.upper))
    throw new Error(
      `Number of blocks should be within range ${blocksRange.lower} to ${blocksRange.upper}, specified value was: ${blocks}`,
    );
}

async function queryAvgTxCost({ blocks = 100, chain = 'rsk_mainnet' }) {
  verifyParams(blocks);
  const chainTableName = getChainTableName(chain);
  // Try to read from short term storage.
  // Less than 10 minutes after last DB query
  // --> return cached value, no query performed
  let avgTxCost = cache.get(getShortStorageId(chainTableName));
  // When the short term storage ttl is expired:
  // 10 minutes or longer --> perform the query, and return new value
  if (!avgTxCost) {
    // read from either DB or long storage (whichever available)
    avgTxCost = await getFromDbOrLongStorage(blocks, chainTableName);
    // write received data to short storage
    cache.set(getShortStorageId(chainTableName), avgTxCost, shortStorageTtl);
  }
  return {
    blocks,
    chain,
    ...avgTxCost,
  };
}

module.exports = {
  queryAvgTxCost,
};
