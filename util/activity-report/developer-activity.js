const format = require('pg-format');
const db = require('../../dbPool.js');
const { getChainTableName } = require('./util.js');
const getMovingAverage = require('./moving-average.js');
/* 
generates time periods to query past activities:
[
  [ 2022-07-13T22:00:00.000Z, 2022-07-20T22:00:00.000Z ],
  [ 2022-07-06T22:00:00.000Z, 2022-07-13T22:00:00.000Z ],
] 
*/
function getWindows(apiStartDate, apiEndDate, windowsAmount) {
  const startDate = new Date(apiStartDate);
  const endDate = new Date(apiEndDate);

  if (
    [startDate, endDate].some((date) => !(date instanceof Date && !isNaN(date)))
  )
    throw new Error(`date has unsupported format`);
  if (startDate >= endDate)
    throw new Error('start day should be earlier than end date');
  if (isNaN(windowsAmount) || windowsAmount < 1 || windowsAmount > 20)
    throw new Error(`Illegal moving average 'windows' parameter`);

  const windowLength = endDate - startDate;
  const windows = [];
  for (let i = 0; i < windowsAmount; i += 1) {
    const dateTo = new Date(endDate - windowLength * i);
    const dateFrom = new Date(dateTo - windowLength);
    windows.push([dateFrom, dateTo]);
  }
  return {
    windows,
    windowLength,
  };
}

async function dbQueryDeveloperActivity(intervals, chainTableName) {
  const queryStr = `
  (SELECT
    %s as week,
    COUNT(*) as deployment_tx_count,
    COUNT(DISTINCT t.from) as deployment_account_count
  FROM %I.block_transactions t
  WHERE t.signed_at >= %L::date
  AND t.signed_at <= %L::date
  AND t.to IS NULL)
  `;
  // generate combined query to get dev activity within each time period
  const union = Array(intervals.length)
    .fill(queryStr)
    .join('UNION')
    .concat('ORDER BY week DESC');
  // parameters for query string interpolation
  const formatParams = intervals.flatMap(([dateFrom, dateTo], i) => [
    i + 1,
    chainTableName,
    dateFrom,
    dateTo,
  ]);
  const query = format(union, ...formatParams);
  return db.query(query);
}

async function queryDeveloperActivity(
  startDate,
  endDate,
  chain = 'rsk_testnet',
  windowsAmount = 4,
) {
  const { windows, windowLength } = getWindows(
    startDate,
    endDate,
    windowsAmount,
  );
  const chainTableName = getChainTableName(chain);
  const queryResult = await dbQueryDeveloperActivity(windows, chainTableName);

  if (queryResult.rowCount === 0)
    throw new Error('No transactions matching your request');

  const deployments = queryResult.rows.map(({ deployment_tx_count }) =>
    Number(deployment_tx_count),
  );
  const accounts = queryResult.rows.map(({ deployment_account_count }) =>
    Number(deployment_account_count),
  );

  return {
    chain,
    start_date: windows[0][0],
    end_date: windows[0][1],
    window_length_days: windowLength / 8.64e7, // ms per day
    windows_amount: Number(windowsAmount),
    deployment_tx_count: {
      current: deployments[deployments.length - 1],
      sma: getMovingAverage('simple', deployments),
      ema: getMovingAverage('exponential', deployments),
      wma: getMovingAverage('weighted', deployments),
    },
    deployment_account_count: {
      current: accounts[accounts.length - 1],
      sma: getMovingAverage('simple', accounts),
      ema: getMovingAverage('exponential', accounts),
      wma: getMovingAverage('weighted', accounts),
    },
  };
}

module.exports = {
  queryDeveloperActivity,
};
