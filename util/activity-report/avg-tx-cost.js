const format = require('pg-format');
const db = require('../../dbPool.js');
const { getChainTableName, validateChain } = require('./validate-chain.js');

function validateBlocks(req, defaultValue) {
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
    1. get the last available RBTC / USD rate
    2. get the last %s blocks
    3. get average gas fees in both RBTC and USD
  */
  const queryStr = `
    WITH rbtc_rate AS (
      SELECT tp.price_in_usd  
	    FROM reports.token_prices tp
		  WHERE tp.chain_id = 30 
	    AND tp.coingecko_token_id = 'rootstock'
	    ORDER BY tp.dt desc
	    LIMIT 1
    ), last_blocks AS (
      SELECT b.id, r.price_in_usd
      FROM %I.blocks b
      CROSS JOIN rbtc_rate r
      ORDER BY b.height DESC
      LIMIT %s
    )
    SELECT 
    AVG(t.fees_paid / 10^18) AS avg_tx_cost_rbtc,
    AVG(t.fees_paid / 10^18 * lb.price_in_usd) AS avg_tx_cost_usd
    FROM %I.block_transactions t
    INNER JOIN last_blocks lb
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
      validate: validateChain,
    },
    {
      name: 'blocks',
      defaultValue: '100',
      validate: validateBlocks,
    },
  ],
};
