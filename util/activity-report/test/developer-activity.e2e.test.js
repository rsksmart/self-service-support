const { test, request, wait } = require('./util.js');

const url = '/api/v1/rsk-activity-report/developer-activity';
const chain = 'rsk_testnet';
const startDate = new Date('2022-07-13');
const endDate = new Date('2022-07-20');
const windows = 4;

/**
 * Success
 */

// first request to the API should return a response body with an empty object {}
// this is because nothing is cached yet
test('Developer Activity. The first request should return {} in res.body', async (assert) => {
  const res = await request
    .get(url)
    .query({
      chain,
      'start-date': startDate.toISOString(),
      'end-date': endDate.toISOString(),
      windows,
    })
    .set('Accept', 'application/json');
  assert.equal(res.status, 200, 'response status should be 200');
  assert.deepEqual(res.body, {}, 'res.body should be {}');
  assert.end();
});

test('Developer Activity. The second request should contain the data', async (assert) => {
  // need to wait a few seconds before sending the second request because
  // a remote database query needs some time to be handled and cached
  await wait(2000);
  const res = await request
    .get(url)
    .query({
      chain,
      'start-date': startDate.toISOString(),
      'end-date': endDate.toISOString(),
      windows,
    })
    .set('Accept', 'application/json');
  assert.equal(res.status, 200, 'response status should be 200');
  assert.equal(
    res.type,
    'application/json',
    'should have a correct content type',
  );
  /* 
  Expecting the response to be similar to this:
  {
      "time": "2022-12-25T13:35:54.404Z",
      "start_date": "2022.07.13",
      "end_date": "2022.07.20",
      "windows": 4,
      "chain": "rsk_testnet",
      "deployment_tx_count": {
          "current": 315,
          "sma": 447,
          "wma": 326.2
      },
      "deployment_account_count": {
          "current": 31,
          "sma": 29,
          "wma": 29.4
      }
  }
*/
  // 1. time is a valid date/time
  const time = new Date(res.body.time);
  assert.ok(
    time instanceof Date && !isNaN(time),
    'time should be a valid Date',
  );

  // 2. Start date is OK
  const resStartDate = new Date(res.body.start_date);
  assert.deepEqual(
    resStartDate,
    startDate,
    'Req and res start dates should match',
  );

  // 3. End date is OK
  const resEndDate = new Date(res.body.end_date);
  assert.deepEqual(resEndDate, endDate, 'Req and res end dates should match');

  // 4. Windows is OK
  assert.equal(Number(res.body.windows), windows, 'Windows should match');

  // 5. Chain matches the chain in request
  assert.equal(res.body.chain, chain, 'chains must match');

  /* 
  6. Deployment transactions statistics
  The result is known for the given dates and can be compared
  */
  const deploymentTxStats = {
    current: 315,
    sma: 447,
    wma: 326.2,
  };
  assert.deepEqual(
    res.body.deployment_tx_count,
    deploymentTxStats,
    'Deployment txs data should be correct',
  );

  /* 
  7. Deployers statistics 
  The result is known for the given dates and can be compared
  */
  const deployersStats = {
    current: 31,
    sma: 29,
    wma: 29.4,
  };
  assert.deepEqual(
    res.body.deployment_account_count,
    deployersStats,
    'Deployers data should be correct',
  );
  assert.end();
});
