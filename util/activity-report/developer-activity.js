const format = require('pg-format');
const db = require('../../dbPool.js');
const { getChainTableName, verifyChain } = require('../verify-chain.js');
const getMovingAverage = require('./moving-average.js');

function verifyStartDate(req) {
  const startDate = new Date(req.query['start-date']);
  if (!(startDate instanceof Date && !isNaN(startDate)))
    throw new Error(`Start date is missing or has unsupported format`);
}

function verifyEndDate(req) {
  const endDate = new Date(req.query['end-date']);
  if (!(endDate instanceof Date && !isNaN(endDate)))
    throw new Error(`End date is missing or has unsupported format`);
}

function verifyWindows(req, defaultValue) {
  // at this moment start and end datea are already verified
  const startDate = new Date(req.query['start-date']);
  const endDate = new Date(req.query['end-date']);
  if (startDate >= endDate)
    throw new Error('start day should be earlier than end date');
  const windows = req.query.windows ?? defaultValue;
  if (isNaN(windows) || windows < 1 || windows > 20)
    throw new Error(
      `'${windows}' is illegal moving average 'windows' parameter`,
    );
}

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
  const windowLength = endDate - startDate;
  const windows = [];
  for (let i = 0; i < windowsAmount; i += 1) {
    const dateTo = new Date(endDate - windowLength * i);
    const dateFrom = new Date(dateTo - windowLength);
    windows.push([dateFrom, dateTo]);
  }
  return windows;
}

async function dbQueryDeveloperActivity(intervals, chain) {
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
    getChainTableName(chain),
    dateFrom,
    dateTo,
  ]);
  const query = format(union, ...formatParams);
  const queryResult = db.query(query);
  if (queryResult.rowCount === 0)
    throw new Error('No transactions matching your request');
  return queryResult;
}

async function fetch({
  'start-date': startDate,
  'end-date': endDate,
  windows: windowsAmount,
  chain,
}) {
  const windows = getWindows(startDate, endDate, windowsAmount);

  const queryResult = await dbQueryDeveloperActivity(windows, chain);

  const deployments = queryResult.rows.map(({ deployment_tx_count }) =>
    Number(deployment_tx_count),
  );
  const accounts = queryResult.rows.map(({ deployment_account_count }) =>
    Number(deployment_account_count),
  );

  return {
    start_date: startDate,
    end_date: endDate,
    windows: windowsAmount,
    chain,
    time: new Date(),
    deployment_tx_count: {
      current: deployments[deployments.length - 1],
      sma: getMovingAverage('simple', deployments),
      wma: getMovingAverage('weighted', deployments),
    },
    deployment_account_count: {
      current: accounts[accounts.length - 1],
      sma: getMovingAverage('simple', accounts),
      wma: getMovingAverage('weighted', accounts),
    },
  };
}

module.exports = {
  '/api/v1/rsk-activity-report/developer-activity': {
    cacheTtl: 600,
    fetch,
    queryStringParams: [
      {
        name: 'start-date',
        verify: verifyStartDate,
      },
      {
        name: 'end-date',
        verify: verifyEndDate,
      },
      {
        name: 'chain',
        defaultValue: 'rsk_testnet',
        verify: verifyChain,
      },
      {
        name: 'windows',
        defaultValue: 4,
        verify: verifyWindows,
      },
    ],
  },
};
