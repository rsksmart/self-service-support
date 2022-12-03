const { validateParams } = require('./api.js');
const cache = require('./cache.js');

// universal cache handling middleware
// returns cached data immediately after receiving a request
// and then then tries to update cache from the DB
async function cacheMiddleware(req, res) {
  try {
    validateParams(req);
    res.status(200).json({
      ...cache.get(req),
    });
    await cache.update(req);
  } catch (error) {
    res.status(400).json({
      error: error.message,
    });
  }
}

module.exports = {
  cacheMiddleware,
};
