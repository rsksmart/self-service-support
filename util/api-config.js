const { verifyChain } = require('./verify-chain.js');
const avgTxCost = require('./activity-report/avg-tx-cost.js');
const allActivity = require('./activity-report/all-activity.js');

const defaultTime = new Date(0);

module.exports = {
  '/api/v1/rsk-activity-report/avg-tx-cost': {
    cacheTtl: 600, // seconds
    queryDb: avgTxCost.queryDb,
    queryStringParams: [
      {
        name: 'chain',
        defaultValue: 'rsk_mainnet',
        verify: verifyChain,
      },
      {
        name: 'blocks',
        defaultValue: '100',
        verify: avgTxCost.verifyBlocks,
      },
    ],
    defaultValues: {
      time: defaultTime,
      vg_tx_cost_rbtc: 0.00000832480954068274,
      avg_tx_cost_usd: 0.14281035946040882,
    },
  },
  '/api/v1/rsk-activity-report/all-activity': {
    cacheTtl: 600,
    queryDb: allActivity.queryDb,
    queryStringParams: [
      {
        name: 'days',
        defaultValue: '20',
        verify: allActivity.verifyDays,
      },
      {
        name: 'chain',
        defaultValue: 'rsk_mainnet',
        verify: verifyChain,
      },
    ],
    defaultValues: {
      time: defaultTime,
      accounts: 1628,
    },
  },
};
