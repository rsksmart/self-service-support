const test = require('tape');
const request = require('supertest');

const server = require('../server.js');

test('GET /api/v1/bogus-product-name/options', function (t) {
  request(server)
    .get('/api/v1/bogus-product-name/options')
    .set({ Accept: 'application/json' })
    .expect(400)
    .expect('Content-Type', /json/)
    .end(function (err, res) {
      t.error(err, 'Detected unsupported product');
      var bodyActual = res.body;
      var bodyExpected = {
        error: 'unsupported product',
        value: ['bogus-product-name'],
      };
      t.deepEqual(bodyActual, bodyExpected, 'Error message expected');
      t.end();
    });
});

test('GET /api/v1/rsk-token-bridge/options with invalid query params', function (t) {
  request(server)
    .get(
      '/api/v1/rsk-token-bridge/options?fromNetwork=another+chain&txHash=12345&walletName=beep+boop',
    )
    .set({ Accept: 'application/json' })
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
      t.deepEqual(bodyActual, bodyExpected, 'Response values expected');
      t.end();
    });
});

test.skip('GET /api/v1/rsk-token-bridge/options with valid query params (rsk-testnet)', function (t) {
  request(server)
    .get(
      '/api/v1/rsk-token-bridge/options?fromNetwork=rsk-testnet&txHash=0xf1ebb8076ad289fbaef4406bb0488be0c5605a58cfa2a6d11540b1f9b0d7ef98&walletName=metamask',
    )
    .set({ Accept: 'application/json' })
    .expect(200)
    .expect('Content-Type', /json/)
    .end(function (err, res) {
      t.error(err, 'Detect query params');
      const bodyActual = res.body;
      const txAgeActual = bodyActual.properties && bodyActual.properties.txAge;
      bodyActual.properties && delete bodyActual.properties.txAge;
      const optionsActual = bodyActual.options;
      delete bodyActual.options;
      const bodyExpected = {
        message: 'ok',
        properties: {
          fromNetwork: 'rsk-testnet',
          txHash:
            '0xf1ebb8076ad289fbaef4406bb0488be0c5605a58cfa2a6d11540b1f9b0d7ef98',
          walletName: 'metamask',
        },
      };
      t.deepEqual(bodyActual, bodyExpected, 'response match');
      t.ok(typeof txAgeActual === 'number', 'txAge present');
      t.equal(optionsActual.length, 6, 'contains expected number of options');
      t.end();
    });
});

test('GET /api/v1/rsk-token-bridge/options with valid query params (rsk-mainnet)', function (t) {
  request(server)
    .get(
      '/api/v1/rsk-token-bridge/options?fromNetwork=rsk-mainnet&txHash=0x573c70270258ce99acfc2baaa306fcdc88b1e50c3144d26a8ab74a2f21ea442a&walletName=nifty',
    )
    .set({ Accept: 'application/json' })
    .expect(200)
    .expect('Content-Type', /json/)
    .end(function (err, res) {
      t.error(err, 'Detect query params');
      const bodyActual = res.body;
      const txAgeActual = bodyActual.properties && bodyActual.properties.txAge;
      bodyActual.properties && delete bodyActual.properties.txAge;
      const optionsActual = bodyActual.options;
      delete bodyActual.options;
      const bodyExpected = {
        message: 'ok',
        properties: {
          fromNetwork: 'rsk-mainnet',
          txHash:
            '0x573c70270258ce99acfc2baaa306fcdc88b1e50c3144d26a8ab74a2f21ea442a',
          walletName: 'nifty',
          txFrom: '0x0000000000000000000000000000000000000000',
        },
      };
      t.deepEqual(bodyActual, bodyExpected, 'response match');
      t.ok(typeof txAgeActual === 'number', 'txAge present');
      t.equal(optionsActual.length, 8, 'contains expected number of options');
      t.end();
    });
});

test('GET /api/v1/rsk-token-bridge/options with valid query params (ethereum-mainnet)', function (t) {
  request(server)
    .get(
      '/api/v1/rsk-token-bridge/options?fromNetwork=ethereum-mainnet&txHash=0x3985fe2ad509a4588501494a715957506f401364112bd55090529686aa538962&walletName=metamask',
    )
    .set({ Accept: 'application/json' })
    .expect(200)
    .expect('Content-Type', /json/)
    .end(function (err, res) {
      t.error(err, 'Detect query params');
      const bodyActual = res.body;
      const txAgeActual = bodyActual.properties && bodyActual.properties.txAge;
      bodyActual.properties && delete bodyActual.properties.txAge;
      const optionsActual = bodyActual.options;
      delete bodyActual.options;
      const bodyExpected = {
        message: 'ok',
        properties: {
          fromNetwork: 'ethereum-mainnet',
          txHash:
            '0x3985fe2ad509a4588501494a715957506f401364112bd55090529686aa538962',
          txFrom: '0x22cb463a75b3cb26fccd82684449117eda89fba0',
          walletName: 'metamask',
        },
      };
      t.deepEqual(bodyActual, bodyExpected, 'response match');
      t.ok(typeof txAgeActual === 'number', 'txAge present');
      t.equal(optionsActual.length, 8, 'contains expected number of options');
      t.end();
    });
});
