const test = require('tape');

const filterByParams = require('./filter-by-params.js');

test('filterByParams simple match', function (t) {
  const filters = [
    {
      foo: 1,
      bar: 'asdf',
      baz: false,
      value: '#1',
    },
    {
      foo: 1,
      bar: 'asdf',
      baz: true,
      value: '#2',
    },
    {
      foo: 1,
      bar: 'ghjk',
      baz: false,
      value: '#3',
    },
    {
      foo: 2,
      bar: 'asdf',
      baz: false,
      value: '#4',
    },
  ];
  const params = {
    foo: 1,
    bar: 'asdf',
    baz: false,
  }
  const resultActual = filterByParams(filters, params);
  const resultExpected = [filters[0]]; // only the first one is returned
  t.deepEquals(resultActual, resultExpected, 'filter results match');
  t.end();
});

test('filterByParams wildcard match', function (t) {
  const filters = [
    {
      foo: '*',
      bar: 'asdf',
      baz: false,
      value: '#1',
    },
    {
      foo: 1,
      bar: '*',
      baz: false,
      value: '#2',
    },
    {
      foo: 1,
      bar: 'asdf',
      baz: '*',
      value: '#3',
    },
    {
      foo: '*',
      bar: '*',
      baz: '*',
      value: '#4',
    },
  ];
  const params = {
    foo: 1,
    bar: 'asdf',
    baz: false,
  }
  const resultActual = filterByParams(filters, params);
  const resultExpected = [...filters]; // all should be returned
  t.deepEquals(resultActual, resultExpected, 'filter results match');
  t.end();
});

test('filterByParams number min/ max range', function (t) {
  const filters = [
    {
      myNumber: { gt: 10, lt: 100 },
      value: '#1',
    },
    {
      myNumber: { gte: 10, lte: 100 },
      value: '#2',
    },
    {
      myNumber: { gt: 50 },
      value: '#3',
    },
    {
      myNumber: { lt: 50 },
      value: '#4',
    },
  ];
  const params = {
    myNumber: 100,
  }
  const resultActual = filterByParams(filters, params);
  const resultExpected = [filters[1], filters[2]]; // 2nd and 3rd be returned
  t.deepEquals(resultActual, resultExpected, 'filter results match');
  t.end();
});

test('filterByParams throw on unsupported', function (t) {
  const filters = [
    {
      myString: 'something',
      value: '#1',
    },
    {
      myString: { gte: 'foo', lt: 'bar' },
      value: '#2',
    },
  ];
  const params = {
    myString: 'foo',
  }

  try {
    filterByParams(filters, params);
    t.fail('expected to throw when invalid filter specified');
  } catch (ex) {
    t.match(
      ex.message,
      /^Param 'myString' type string in filter #1 for object filter not implemented.$/,
      'error message when tx does not exist',
    );
  }
  t.end();
});
