const test = require('tape');
const request = require('supertest');

const server = require('./server.js');

test('GET /api/v1/bogus-product-name/options', function (t) {
  request(server)
    .get('/api/v1/bogus-product-name/options')
    .expect(400)
    .expect('Content-Type', /json/)
    .end(function (err, res) {
      t.error(err, 'Detected unsupported product');
      var bodyActual = res.body;
      var bodyExpected = {
        error: 'unsupported product',
        value: ['bogus-product-name'],
      };
      t.deepEqual(bodyActual, bodyExpected,
        'Error message expected');
      t.end();
    });
});

test('GET /api/v1/rsk-token-bridge/options with invalid query params', function (t) {
  request(server)
    .get('/api/v1/rsk-token-bridge/options?fromNetwork=another+chain&txHash=12345&walletName=beep+boop')
    .expect(400)
    .expect('Content-Type', /json/)
    .end(function (err, res) {
      t.error(err, 'Detect query params');
      var bodyActual = res.body;
      var bodyExpected = {
        error: 'invalid inputs',
        value: [
          'invalid fromNetwork: another chain',
          'invalid txHash: 12345',
          'invalid walletName: beep boop',
        ],
      };
      t.deepEqual(bodyActual, bodyExpected,
        'Response values expected');
      t.end();
    });
});

test('GET /api/v1/rsk-token-bridge/options with valid query params', function (t) {
  request(server)
    .get('/api/v1/rsk-token-bridge/options?fromNetwork=rsk-testnet&txHash=0xf1ebb8076ad289fbaef4406bb0488be0c5605a58cfa2a6d11540b1f9b0d7ef98&walletName=metamask')
    .expect(200)
    .expect('Content-Type', /json/)
    .end(function (err, res) {
      t.error(err, 'Detect query params');
      var bodyActual = res.body;
      var bodyExpected = {
        message: 'ok',
        value: ['rsk-testnet', '0xf1ebb8076ad289fbaef4406bb0488be0c5605a58cfa2a6d11540b1f9b0d7ef98', 'metamask'],
      };
      t.equal(bodyActual.message, bodyExpected.message);
      t.deepEqual(bodyActual.value.slice(0, 3), bodyExpected.value.slice(0, 3));
      t.ok(typeof bodyActual.value[3] === 'number');
      t.end();
    });
});

test('GET /api/v1/rsk-token-bridge/options with valid query params', function (t) {
  request(server)
    .get('/api/v1/rsk-token-bridge/options?fromNetwork=rsk-mainnet&txHash=0x573c70270258ce99acfc2baaa306fcdc88b1e50c3144d26a8ab74a2f21ea442a&walletName=nifty')
    .expect(200)
    .expect('Content-Type', /json/)
    .end(function (err, res) {
      t.error(err, 'Detect query params');
      var bodyActual = res.body;
      var bodyExpected = {
        message: 'ok',
        value: ['rsk-mainnet', '0x573c70270258ce99acfc2baaa306fcdc88b1e50c3144d26a8ab74a2f21ea442a', 'nifty'],
      };
      t.equal(bodyActual.message, bodyExpected.message);
      t.deepEqual(bodyActual.value.slice(0, 3), bodyExpected.value.slice(0, 3));
      t.ok(typeof bodyActual.value[3] === 'number');
      t.equal(bodyActual.options.length, 5, 'contains a number of options in the result');
      t.end();
    });
});
