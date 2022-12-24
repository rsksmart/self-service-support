const { test, request, wait } = require('./util.js');

const url = '/api/v1/rsk-activity-report/monthly-txs';
const chain = 'rsk_mainnet';

/**
 * Success tests
 */

// first request to the API should return a response body with an empty object {}
// this is because nothing is cached yet
test('Monthly txs. The first request should return {} in res.body', async (assert) => {
  const res = await request.get(url).query({ chain });
  assert.equal(res.status, 200, 'response status should be 200');
  assert.deepEqual(res.body, {}, 'res.body should be {}');
  assert.end();
});

test('Monthly txs. The second request should return a DB data', async (assert) => {
  // need to wait a few seconds before sending the second request because
  // a remote database query needs some time to be handled and cached
  await wait(2000);
  const res = await request
    .get(url)
    .query({ chain })
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
      "time": "2022-12-24T19:50:52.427Z",
      "chain": "rsk_mainnet",
      "monthly_txs": "83500"
  }

  I need to verify that:
*/
  // 1. time is a valid date/time
  const time = new Date(res.body.time);
  assert.ok(
    time instanceof Date && !isNaN(time),
    'time should be a valid Date',
  );

  // 2. chain matches the chain in request
  assert.equal(res.body.chain, chain, 'chains must match');

  // 3. monthly transactions is a positive number
  const monthlyTxs = res.body.monthly_txs;
  assert.ok(
    !isNaN(monthlyTxs) && monthlyTxs > 0,
    'monthly txs should be a positive number',
  );

  assert.end();
});
