const flatCache = require('flat-cache');
const apiConfig = require('./api-config.js');

const cache = flatCache.load('rootstock-self-service-support');

function getCacheKey(req) {
  return (req.baseUrl + req.path).replace(/^\/|\/$/g, '');
}

function getParamValues(req) {
  const { queryStringParams } = apiConfig[getCacheKey(req)];
  return queryStringParams.reduce(
    (prev, { name }) => ({
      ...prev,
      [name]: req.query[name],
    }),
    {},
  );
}

function verifyParams(req) {
  const { queryStringParams } = apiConfig[getCacheKey(req)];
  // verify each parameter and return object containing all param names and their values
  queryStringParams.forEach(({ name, verify }) => {
    verify(req.query[name]);
  });
}

function readCache(req) {
  return cache.getKey(getCacheKey(req))?.[req.query.chain];
}

async function updateCache(req) {
  try {
    const { chain } = req.query;
    const cacheKey = getCacheKey(req);
    const { cacheTtl, queryDb } = apiConfig[cacheKey];
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
