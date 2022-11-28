const format = require('pg-format');
const flatCache = require('flat-cache');
const db = require('../../dbPool.js');
const { getChainTableName } = require('./util.js');

// cache time to live
const cacheTtl = 600; // seconds

const cache = flatCache.load('avg-tx-cost');

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

function updateCache(blocks, chainTableName) {
  return new Promise((resolve) => {
    const cachedData = cache.getKey(chainTableName);
    resolve(cachedData);
    // after resolving the promise (returning the cached data)
    // try to read from the DB if the cached data was older than N seconds
    (async () => {
      try {
        const ttl = new Date(); // cache time to live
        ttl.setSeconds(ttl.getSeconds() - cacheTtl);
        // don't do DB query if cached data is newer than TTL
        if (ttl < new Date(cachedData?.time ?? 0)) return;
        const avgTxCost = await dbQueryAvgTxCost(blocks, chainTableName);
        // each time we are able to successfully get the query result
        // store these values + the timestamp in memory
        // cache.set(getCacheId(chainTableName), avgTxCost);
        cache.setKey(chainTableName, avgTxCost);
        // record cache to a JSON file in `node_modules/flat-cache/.cache/` folder
        // so that the cashed values could be recovered after a server shut down
        cache.save(true);
      } catch (error) {
        // if any error occurs, the function simply  doesn't
        // record any new data to the cache
      }
    })();
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
  // returns no data at the first call
  const avgTxCost = await updateCache(blocks, chainTableName);
  return {
    blocks,
    chain,
    ...avgTxCost,
  };
}

module.exports = {
  queryAvgTxCost,
};
