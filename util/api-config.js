const { verifyChain } = require('./verify-chain.js');
const avgTxCost = require('./activity-report/avg-tx-cost.js');
const allActivity = require('./activity-report/all-activity.js');
const devActivity = require('./activity-report/developer-activity.js');

module.exports = {
  '/api/v1/rsk-activity-report/avg-tx-cost': {
    cacheTtl: 600, // seconds
    fetch: avgTxCost.fetch,
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
  },
  '/api/v1/rsk-activity-report/all-activity': {
    cacheTtl: 600,
    fetch: allActivity.fetch,
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
  },
  '/api/v1/rsk-activity-report/developer-activity': {
    cacheTtl: 600,
    fetch: devActivity.fetch,
    queryStringParams: [
      {
        name: 'start-date',
        verify: devActivity.verifyStartDate,
      },
      {
        name: 'end-date',
        verify: devActivity.verifyEndDate,
      },
      {
        name: 'chain',
        defaultValue: 'rsk_testnet',
        verify: verifyChain,
      },
      {
        name: 'windows',
        defaultValue: 4,
        verify: devActivity.verifyWindows,
      },
    ],
  },
};
