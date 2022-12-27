const { test, request, wait } = require('./util.js');

const url = '/api/v1/rsk-activity-report/avg-tx-cost';
const chain = 'rsk_mainnet';
const blocks = 100;

/**
 * Success
 */

// first request to the API should return a response body with an empty object {}
// this is because nothing is cached yet
test('Average tx cost. The first request should return {} in res.body', async (assert) => {
  const res = await request.get(url).query({ chain, blocks });
  assert.equal(res.status, 200, 'response status should be 200');
  assert.deepEqual(res.body, {}, 'res.body should be {}');
  assert.end();
});

test('Average tx cost. The second request should return the DB data', async (assert) => {
  // need to wait a few seconds before sending the second request because
  // a remote database query needs some time to be handled and cached
  await wait(2000);
  const res = await request
    .get(url)
    .query({ chain, blocks })
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
    "time": "2022-12-24T20:02:13.722Z",
    "blocks": "100",
    "chain": "rsk_mainnet",
    "avg_tx_cost_rbtc": 0.000007949425969698243,
    "avg_tx_cost_usd": 0.13288735826620565
  }

  I need to verify that:
*/
  // 1. time is a valid date/time
  const time = new Date(res.body.time);
  assert.ok(
    time instanceof Date && !isNaN(time),
    'time should be a valid Date',
  );

  // 2. blocks is the same number as in request
  assert.equal(Number(res.body.blocks), blocks, 'blocks must match');

  // 3. chain matches the chain in request
  assert.equal(res.body.chain, chain, 'chains must match');

  // 4. average RBTC tx price is a number between 0 and 1
  const txCostRbtc = res.body.avg_tx_cost_rbtc;
  assert.ok(
    !isNaN(txCostRbtc) && txCostRbtc > 0 && txCostRbtc < 1,
    'average RBTC tx price should be a number between 0 and 1',
  );

  // 5. average USD tx price is a number between 0 and 1
  const txCostUsd = res.body.avg_tx_cost_usd;
  assert.ok(
    !isNaN(txCostUsd) && txCostUsd > 0 && txCostUsd < 1,
    'average USD tx price should be a number between 0 and 1',
  );

  assert.end();
});

/**
 * Failures
 */
const getErrorMessage = (blocks) =>
  `Number of blocks should be within range 1 to 1000, specified value was: ${blocks}`;

test('Too low "blocks" query parameter', async (assert) => {
  const tooSmallBlocks = 0;
  const res = await request.get(url).query({ chain, blocks: tooSmallBlocks });
  assert.equal(res.status, 400, 'response status should be 400');
  assert.equal(
    res.body.error,
    getErrorMessage(tooSmallBlocks),
    'should send the correct error message',
  );
  assert.end();
});

test('Too high "blocks" query parameter', async (assert) => {
  const tooBigBlocks = 1001;
  const res = await request.get(url).query({ chain, blocks: tooBigBlocks });
  assert.equal(res.status, 400, 'response status should be 400');
  assert.equal(
    res.body.error,
    getErrorMessage(tooBigBlocks),
    'should send the correct error message',
  );
  assert.end();
});
