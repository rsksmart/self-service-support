const flatCache = require('flat-cache');
const url = require('url');
const qs = require('querystring');
const apiConfig = require('./api-config.js');

const cache = flatCache.load('rootstock-self-service-support');

function getPath(req) {
  return url.parse(req.originalUrl).pathname;
}

function getApiConfig(req) {
  const path = getPath(req);
  const config = apiConfig.find((conf) => conf.path === path);
  if (!config) throw new Error(`Missing config for the path '${path}'`);
  return config;
}

function getQsParams(req) {
  const { queryStringParams } = getApiConfig(req);
  if (!queryStringParams || !Array.isArray(queryStringParams))
    throw new Error(
      `Query string parameters for '${getPath(req)}' are not defined.`,
    );
  return queryStringParams;
}

function getParamValues(req) {
  return getQsParams(req).reduce(
    (prev, { name, defaultValue }) => ({
      ...prev,
      [name]: req.query[name] ?? defaultValue,
    }),
    {},
  );
}

function getCacheKey(req) {
  // recompose query string
  // this is necessary to prevent cache-busting DOS attacks by adding on
  // additional (unused) query params
  const path = getPath(req);
  const params = qs.stringify(getParamValues(req));
  return `${path}?${params}`;
}

function verifyParams(req) {
  getQsParams(req).forEach(({ verify, defaultValue }) =>
    verify(req, defaultValue),
  );
}

// gets another cached value for the same API endpoint
// or returns default values stored in api-config file
function getDefaultValue(req) {
  const path = getPath(req);
  const key = Object.keys(cache.all()).find((key) => key.startsWith(path));
  return cache.getKey(key);
}

async function updateCache(req) {
  try {
    const cacheData = cache.getKey(getCacheKey(req));
    const { cacheTtl, fetch } = getApiConfig(req);
    const ttl = new Date(); // cache time to live
    ttl.setSeconds(ttl.getSeconds() - cacheTtl);
    if (ttl < new Date(cacheData?.time ?? 0)) return;
    const params = getParamValues(req);
    const dbData = await fetch(params);
    cache.setKey(getCacheKey(req), {
      time: new Date(),
      ...dbData,
    });
  } catch (error) {
    console.log(error);
    // don't write data to the cache
  }
}

// universal cache handling middleware
// returns cached data immediately after receiving a request
// and then then tries to update cache from the DB
async function cacheMiddleware(req, res) {
  try {
    verifyParams(req);
    res.status(200).json({
      ...(cache.getKey(getCacheKey(req)) ?? getDefaultValue(req)),
    });
    await updateCache(req);
  } catch (error) {
    res.status(400).json({
      error: error.message,
    });
  }
}

module.exports = {
  cacheMiddleware,
};
