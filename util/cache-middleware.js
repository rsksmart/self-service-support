const flatCache = require('flat-cache');
const apiConfig = require('./api-config.js');
const url = require('url');
const qs = require('querystring');

const cache = flatCache.load('rootstock-self-service-support');

function getPath(req) {
  return url.parse(req.originalUrl).pathname;
}

function getApiConfig(req) {
  const path = getPath(req);
  const config = apiConfig[path];
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
    (prev, { name }) => ({
      ...prev,
      [name]: req.query[name],
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
  // verify each parameter and return object containing all param names and their values
  getQsParams(req).forEach(({ name, verify }) => {
    verify(req.query[name]);
  });
}

function readCache(req) {
  const { defaultValues } = getApiConfig(req);
  return cache.getKey(getCacheKey(req)) ?? defaultValues;
}

async function updateCache(req) {
  try {
    const cacheData = readCache(req);
    const { cacheTtl, queryDb } = getApiConfig(req);
    const ttl = new Date(); // cache time to live
    ttl.setSeconds(ttl.getSeconds() - cacheTtl);
    if (ttl < new Date(cacheData?.time ?? 0)) return;
    const params = getParamValues(req);
    const dbData = await queryDb(params);
    cache.setKey(getCacheKey(req), {
      time: new Date(),
      ...dbData,
    });
    console.log(cache.all());
  } catch (error) {
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
      ...getParamValues(req),
      ...readCache(req),
    });
  } catch (error) {
    res.status(400).json({
      error: error.message,
    });
  }
  await updateCache(req);
}

module.exports = {
  cacheMiddleware,
};
