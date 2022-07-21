const db = require('../dbPool.js');
const format = require('pg-format');
const tokens = require('../data/tokens.json');

const chainTableNames = {
  'rsk_testnet': 'chain_rsk_testnet',
  'rsk_mainnet': 'chain_rsk_mainnet',
};

function getChainTableName(chain) {
  if (!chain || !chainTableNames[chain]) {
    throw new Error(`chain '${chain}' is not supported`);
  }
  return chainTableNames[chain];
}

async function getQueryResult(query) {
  const queryResult = await db.query(query);
  if (queryResult.rowCount === 0) return 0;
  return Number(queryResult.rows[0].count);
}

async function dbQueryAllActivity(days, chainTableName) {
  const queryStr = `
  SELECT COUNT(DISTINCT t.from)
  FROM %I.block_transactions t
  WHERE t.signed_at >= NOW() - INTERVAL '%s DAY'
  AND t.signed_at <= NOW()
  `;
  const query = format(
    queryStr,
    chainTableName,
    days,
  );
  return getQueryResult(query);
}

async function dbQueryDeveloperActivity(startDate, endDate, chainTableName) {
  const queryStr = `
  SELECT
    COUNT(*) as deployment_tx_count,
    COUNT(DISTINCT t.from) as deployment_account_count
  FROM %I.block_transactions t
  WHERE t.signed_at >= %L
  AND t.signed_at <= %L
  AND t.to IS NULL
  `;
  const query = format(
    queryStr,
    chainTableName,
    startDate,
    endDate,
  );
  const queryResult = await db.query(query);
  if (queryResult.rowCount === 0) {
    return {
      deployment_tx_count: 0,
      deployment_account_count: 0,
    };
  }
  return {
    deployment_tx_count:
      parseInt(queryResult.rows[0].deployment_tx_count),
    deployment_account_count:
      parseInt(queryResult.rows[0].deployment_account_count),
  };
}

async function queryAllActivity(
  days,
  chain = 'rsk_mainnet',
) {
  if (isNaN(days) || days <= 0) {
    throw new Error(`Number of days '${days}' has unsupported format`);
  }
  if (!chain || !chainTableNames[chain]) {
    throw new Error(`chain '${chain}' is not supported`);
  }
  const chainTableName = getChainTableName(chain);
  const dbResult = await dbQueryAllActivity(days, chainTableName);
  return {
    accounts: dbResult,
  };
}

async function queryDeveloperActivity(
  startDate,
  endDate,
  chain = 'rsk_mainnet',
) {
  if (!startDate) {
    throw new Error(`startDate '${startDate}' has unsupported format`);
  }
  if (!endDate) {
    throw new Error(`endDate '${endDate}' has unsupported format`);
  }
  const chainTableName = getChainTableName(chain);
  const queryResult = await dbQueryDeveloperActivity(
    startDate, endDate, chainTableName);
  return queryResult;
}

/* 
generates time periods to query past activities:
[
  [ 2022-07-13T22:00:00.000Z, 2022-07-20T22:00:00.000Z ],
  [ 2022-07-06T22:00:00.000Z, 2022-07-13T22:00:00.000Z ],
] 
*/
function getPeriods(
  startDate = new Date(),
  interval = 7, // days
  periods = 4, 
) {
  const dates = [];
  for (let i = 0; i < periods; i++) {
    const dateTo = new Date(startDate);
    dateTo.setDate(dateTo.getDate() - i * interval);
    dateTo.setHours(0);
    dateTo.setMinutes(0);
    dateTo.setSeconds(0);
    dateTo.setMilliseconds(0);
    const dateFrom = new Date(dateTo);
    dateFrom.setDate(dateFrom.getDate() - interval);
    dates.push([dateFrom, dateTo]);
  }
  return dates;
}

function weightedMovingAverage(data = []) {
  // sum of the data array indices
  const sum = [...data.keys()].reduce((p, c) => p + c + 1, 0);
  const reducer = (p, c, i) => p + (c * (i + 1) / sum);
  return Number(data.reduce(reducer, 0).toFixed(2));
}

async function dbQueryDeveloperActivityWma(periods, chainTableName) {
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
  const union = Array(periods.length)
    .fill(queryStr)
    .join('UNION')
    .concat('ORDER BY week DESC');
  // parameters for query string interpolation
  const formatParams = periods.flatMap(([dateFrom, dateTo], i) => 
    ([i + 1, chainTableName, dateFrom, dateTo]));
  const query = format(union, ...formatParams);
  const queryResult = await db.query(query);
  if (queryResult.rowCount === 0) {
    return {
      deployment_tx_count: 0,
      deployment_account_count: 0,
    };
  }
  // calculate weighted Moving Averages from the received data sets
  return {
    deployment_tx_count: weightedMovingAverage(queryResult.rows.map(({ deployment_tx_count }) => deployment_tx_count)),
    deployment_account_count: weightedMovingAverage(queryResult.rows.map(({ deployment_account_count }) => deployment_account_count)),
  };
}

async function queryDeveloperActivityWma(
  apiDate,
  chain = 'rsk_testnet',
) {
  const queryDate = apiDate ? new Date(apiDate) : new Date();
  // if was unable to create a valid date instance
  if (!(queryDate instanceof Date && !isNaN(queryDate)))
    throw new Error(`date '${apiDate}' has unsupported format`);
  const periods = getPeriods(queryDate, 7, 4);
  const chainTableName = getChainTableName(chain);
  return dbQueryDeveloperActivityWma(periods, chainTableName);
}

module.exports = {
  queryAllActivity,
  queryDeveloperActivity,
  queryDeveloperActivityWma,
};
