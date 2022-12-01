const flatCache = require('flat-cache');
const endpointParams = require('./endpointParams.js');

const cache = flatCache.load('rootstock-self-service-support');

function getCacheKey(req) {
  return (req.baseUrl + req.path).replace(/^\/|\/$/g, '');
}

function getParamValues(req) {
  const { queryStringParams } = endpointParams[getCacheKey(req)];
  return queryStringParams.reduce(
    (prev, { name }) => ({
      ...prev,
      [name]: req.query[name],
    }),
    {},
  );
}

function verifyParams(req) {
  const { queryStringParams } = endpointParams[getCacheKey(req)];
  // verify each parameter and return object containing all param names and their values
  queryStringParams.forEach(({ name, verify }) => verify(req.query[name]));
}

function readCache(req) {
  return cache.getKey(getCacheKey(req))?.[req.query.chain];
}

async function updateCache(req) {
  try {
    const { chain } = req.query;
    const cacheKey = getCacheKey(req);
    const { cacheTtl, queryDb } = endpointParams[cacheKey];
    const ttl = new Date(); // cache time to live
    ttl.setSeconds(ttl.getSeconds() - cacheTtl);
    const cacheData = cache.getKey(getCacheKey(req));
    // don't do DB query if cached data is newer than TTL
    if (ttl < new Date(cacheData?.[chain]?.time ?? 0)) return;
    const params = getParamValues(req);
    const dbData = await queryDb(params);
    // each time we are able to successfully get the query result
    // store these values + the timestamp in memory
    cache.setKey(cacheKey, {
      ...cacheData,
      [chain]: {
        time: new Date(),
        ...dbData,
      },
    });
  } catch (error) {
    // don't write data to the cache
  }
}

module.exports = {
  readCache,
  updateCache,
  verifyParams,
  getParamValues,
  getCacheKey,
};
