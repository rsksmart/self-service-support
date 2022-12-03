const url = require('url');
const routes = require('./cached-routes.js');

function getPath(req) {
  return url.parse(req.originalUrl).pathname;
}

function getConfig(req) {
  const path = getPath(req);
  const config = routes.find((conf) => conf.path === path);
  if (!config) throw new Error(`Missing config for the path '${path}'`);
  return config;
}

function getQsParams(req) {
  const { queryStringParams } = getConfig(req);
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

function validateParams(req) {
  getQsParams(req).forEach(({ validate, defaultValue }) =>
    validate(req, defaultValue),
  );
}

module.exports = {
  getPath,
  getConfig,
  getParamValues,
  validateParams,
};
