const test = require('tape');

const stringSubstitute = require('./string-substitute.js');

test('stringSubstitute.getSubstitutions', function (t) {
  const params = {
    foo: 'bar',
    xyz: '123',
  };
  const actualResult = stringSubstitute.getSubstitutions(params);
  const expectedResult = [
    ['${foo}', 'bar'],
    ['${xyz}', '123'],
  ];
  t.deepEquals(actualResult, expectedResult, 'substitutions list built');
  t.end();
});

test('stringSubstitute.substitute', function (t) {
  const substitutions = [
    ['${foo}', 'bar'],
    ['${xyz}', '123'],
  ];
  const inputs = [
    'foo is ${foo}, not ${xyz}',
    'xyz is ${xyz}',
  ];
  const actualResult = inputs.map(
    (input) => (stringSubstitute.substitute(input, substitutions)),
  );
  const expectedResult = [
    'foo is bar, not 123',
    'xyz is 123',
  ];
  t.deepEquals(actualResult, expectedResult, 'string values replaced');
  t.end();
});
