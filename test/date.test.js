const test = require('tape');

// date as an instance of Date() class
const dateObj = new Date();
// date as the total number of millisends
const dateMs = Date.now();

test('total milliseconds are equal', (t) => {
  t.strictEqual(dateObj.getTime(), dateMs);
  t.end();
});

test('Date() is able to subtract time units (seconds) as expected', (t) => {
  const bigNumberOfSeconds = 999999;

  dateObj.setSeconds(dateObj.getSeconds() - bigNumberOfSeconds);

  const bigNumberOfMs = bigNumberOfSeconds * 1000;
  const newDateMs = dateMs - bigNumberOfMs;

  t.strictEqual(dateObj.getTime(), newDateMs);
  t.end();
});
