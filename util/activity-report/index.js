const { queryAllActivity } = require('./all-activity.js');
const { queryDeveloperActivity } = require('./developer-activity.js');
const { queryAvgTxCost } = require('./avg-tx-cost.js');

module.exports = {
  queryAllActivity,
  queryDeveloperActivity,
  queryAvgTxCost,
};
