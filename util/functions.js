const endpointParams = require('./endpointParams.js');

function getParamValues(req) {
  const { queryStringParams } = endpointParams[req.cacheKey];
  return queryStringParams.reduce(
    (prev, { name }) => ({
      ...prev,
      [name]: req.query[name],
    }),
    {},
  );
}

function verifyParams(req) {
  const { queryStringParams } = endpointParams[req.cacheKey];
  // verify each parameter and return object containing all param names and their values
  queryStringParams.forEach(({ name, verify }) => verify(req.query[name]));
}

async function updateCache(req) {
  const { chain } = req.query;
  const { cache, cacheKey } = req;
  const { cacheTtl, queryDb } = endpointParams[cacheKey];
  const cacheData = cache.getKey(cacheKey);
  const ttl = new Date(); // cache time to live
  ttl.setSeconds(ttl.getSeconds() - cacheTtl);
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
}

module.exports = {
  updateCache,
  verifyParams,
  getParamValues,
};
