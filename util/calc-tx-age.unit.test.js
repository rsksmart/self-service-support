const test = require('tape');

const calcTxAge = require('./calc-tx-age.js');

test('calcTxAge with valid txHash', async function (t) {
  const value = await calcTxAge(
    'rsk-testnet',
    '0xf1ebb8076ad289fbaef4406bb0488be0c5605a58cfa2a6d11540b1f9b0d7ef98',
  );
  t.ok(value > 282937,
    'This transaction is at least 282937 blocks old');
  t.end();
});

test('calcTxAge with invalid txHash', async function (t) {
  try {
    await await calcTxAge(
      'rsk-testnet',
      '0x000000006ad289fbaef4406bb0488be0c5605a58cfa2a6d11540b1f9b0d7ef98',
    );
    t.fail('exepcted to throw when tx does not exist');
  } catch (ex) {
    t.match(
      ex.message,
      /^Error: Transaction does not exist or hash is invalid: 0x000000006ad289fbaef4406bb0488be0c5605a58cfa2a6d11540b1f9b0d7ef98$/,
      'error message when tx does not exist',
    );
  };
  t.end();
});

