const test = require('tape');

const calcTxInfo = require('./calc-tx-info.js');

test('calcTxInfo with valid txHash', async function (t) {
  const actualResult = await calcTxInfo(
    'rsk-testnet',
    '0xf1ebb8076ad289fbaef4406bb0488be0c5605a58cfa2a6d11540b1f9b0d7ef98',
  );
  t.equal(actualResult.tx.from, '0xd761cc1ceb991631d431f6dde54f07828f2e61d2',
    'tx from match');
  t.ok(actualResult.meta.txAge > 282937,
    'This transaction is at least 282937 blocks old');
  t.end();
});

test('calcTxInfo with invalid txHash', async function (t) {
  try {
    await await calcTxInfo(
      'rsk-testnet',
      '0x000000006ad289fbaef4406bb0488be0c5605a58cfa2a6d11540b1f9b0d7ef98',
    );
    t.fail('exepcted to throw when tx does not exist');
  } catch (ex) {
    t.match(
      ex.message,
      /^Transaction does not exist or hash is invalid: 0x000000006ad289fbaef4406bb0488be0c5605a58cfa2a6d11540b1f9b0d7ef98$/,
      'error message when tx does not exist',
    );
  };
  t.end();
});

