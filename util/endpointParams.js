const { chainTableNames } = require('./constants.js');
const { dbQueryAvgTxCost } = require('./activity-report/index.js');

function verifyChain(chain) {
  if (!chain || !chainTableNames[chain]) {
    throw new Error(`chain '${chain}' is not supported`);
  }
}

module.exports = {
  'api/v1/rsk-activity-report/avg-tx-cost': {
    cacheTtl: 600, // seconds
    queryDb: dbQueryAvgTxCost,
    queryStringParams: [
      {
        name: 'chain',
        verify: verifyChain,
      },
      {
        name: 'blocks',
        verify: (blocks) => {
          const blocksRange = {
            lower: 1,
            upper: 1000,
          };
          if (!(blocks >= blocksRange.lower && blocks <= blocksRange.upper))
            throw new Error(
              `Number of blocks should be within range ${blocksRange.lower} to ${blocksRange.upper}, specified value was: ${blocks}`,
            );
        },
      },
    ],
  },
};
