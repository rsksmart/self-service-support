const format = require('pg-format');
const db = require('../../dbPool.js');
const { getChainTableName, verifyChain } = require('../verify-chain.js');

function verifyBlocks(req, defaultValue) {
  const blocks = req.query.blocks ?? defaultValue;
  const blocksRange = {
    lower: 1,
    upper: 1000,
  };
  if (!(blocks >= blocksRange.lower && blocks <= blocksRange.upper))
    throw new Error(
      `Number of blocks should be within range ${blocksRange.lower} to ${blocksRange.upper}, specified value was: ${blocks}`,
    );
}

async function queryDb(blocks, chain) {
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
  const tableName = getChainTableName(chain);
  const query = format(queryStr, tableName, blocks, tableName);
  const [avgTxCost] = (await db.query(query)).rows;
  if (!avgTxCost?.avg_tx_cost_usd) throw new Error('DB records not found');
  return avgTxCost;
}

async function fetch({ blocks, chain }) {
  const dbResult = await queryDb(blocks, chain);
  return {
    blocks,
    chain,
    time: new Date(),
    ...dbResult,
  };
}

module.exports = {
  path: '/api/v1/rsk-activity-report/avg-tx-cost',
  cacheTtl: 600, // seconds
  fetch,
  queryStringParams: [
    {
      name: 'chain',
      defaultValue: 'rsk_mainnet',
      verify: verifyChain,
    },
    {
      name: 'blocks',
      defaultValue: '100',
      verify: verifyBlocks,
    },
  ],
};
