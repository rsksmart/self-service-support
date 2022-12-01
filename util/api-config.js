const { verifyChain } = require('./verify-chain.js');
const avgTxCost = require('./activity-report/avg-tx-cost.js');

module.exports = {
  '/api/v1/rsk-activity-report/avg-tx-cost': {
    cacheTtl: 600, // seconds
    queryDb: avgTxCost.queryDb,
    queryStringParams: [
      {
        name: 'chain',
        verify: verifyChain,
      },
      {
        name: 'blocks',
        verify: avgTxCost.verifyBlocks,
      },
    ],
    defaultValues: {
      time: new Date(0),
      vg_tx_cost_rbtc: 0.00000832480954068274,
      avg_tx_cost_usd: 0.14281035946040882,
    },
  },
};
