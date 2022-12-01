const { verifyChain } = require('./verify-chain-qs-param.js');
const avgTxCost = require('./activity-report/avg-tx-cost.js');

module.exports = {
  'api/v1/rsk-activity-report/avg-tx-cost': {
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
  },
};
