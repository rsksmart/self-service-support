const avgTxCost = require('./activity-report/avg-tx-cost.js');
const allActivity = require('./activity-report/all-activity.js');
const devActivity = require('./activity-report/developer-activity.js');
const monthlyTxs = require('./activity-report/monthly-txs.js');

module.exports = {
  ...avgTxCost,
  ...allActivity,
  ...devActivity,
  ...monthlyTxs,
};
