const flatCache = require('flat-cache');
const qs = require('querystring');
const { getConfig, getParamValues, getPath } = require('./api.js');

const cache = flatCache.load('rootstock-self-service-support');

function getKey(req) {
  // recompose query string
  // this is necessary to prevent cache-busting DOS attacks by adding on
  // additional (unused) query params
  const path = getPath(req);
  const params = qs.stringify(getParamValues(req));
  return `${path}?${params}`;
}

// gets another cached value for the same API endpoint
// or returns default values stored in api-config file
function getDefaultValues(req) {
  const path = getPath(req);
  const key = Object.keys(cache.all()).find((key) => key.startsWith(path));
  return cache.getKey(key);
}

function get(req) {
  return cache.getKey(getKey(req)) ?? getDefaultValues(req);
}

async function update(req) {
  try {
    const cacheData = cache.getKey(getKey(req));
    const { cacheTtl, fetch } = getConfig(req);
    const ttl = new Date(); // cache time to live
    ttl.setSeconds(ttl.getSeconds() - cacheTtl);
    if (ttl < new Date(cacheData?.time ?? 0)) return;
    const params = getParamValues(req);
    const dbData = await fetch(params);
    cache.setKey(getKey(req), {
      time: new Date(),
      ...dbData,
    });
  } catch (error) {
    console.log(error);
    // don't write data to the cache
  }
}

module.exports = {
  get,
  update,
};
