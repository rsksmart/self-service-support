const test = require('tape');
const supertest = require('supertest');
const server = require('../../../server.js');

const request = supertest(server);

function wait(ms) {
  return new Promise((res) => {
    setTimeout(() => res(), ms);
  });
}

module.exports = {
  test,
  request,
  wait,
};
