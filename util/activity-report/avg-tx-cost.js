const format = require('pg-format');
const db = require('../../dbPool.js');
const { getChainTableName } = require('./util.js');

async function queryAvgTxCost({ blocks = 100, chain = 'rsk_mainnet' }) {
  if (!(blocks > 0 && blocks <= 1000))
    throw new Error(`Illegal number of blocks: ${blocks}`);
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
  const chainTableName = getChainTableName(chain);
  const query = format(queryStr, chainTableName, blocks, chainTableName);
  const [avgCosts] = (await db.query(query)).rows;
  // setting default values in case Covalent DB shuts down
  const defaultTxCost = {
    usd: 0.08150987210454078,
    rbtc: 0.000004918220924135874,
  };
  return {
    blocks,
    chain,
    avg_tx_cost: {
      usd: avgCosts?.avg_tx_cost_usd || defaultTxCost.usd,
      rbtc: avgCosts?.avg_tx_cost_rbtc || defaultTxCost.rbtc,
    },
  };
}

module.exports = {
  queryAvgTxCost,
};
