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

test('GET /api/v1/rsk-token-bridge/options with query params', function (t) {
  request(server)
    .get('/api/v1/rsk-token-bridge/options?fromNetwork=rsk&txHash=0x00&walletName=metamask')
    .expect(200)
    .expect('Content-Type', /json/)
    .end(function (err, res) {
      t.error(err, 'Detect query params');
      var bodyActual = res.body;
      var bodyExpected = {
        message: 'ok',
        value: ['rsk', '0x00', 'metamask'],
      };
      t.deepEqual(bodyActual, bodyExpected,
        'Response values expected');
      t.end();
    });
});
