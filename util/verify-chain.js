const { chainTableNames } = require('./constants.js');

function verifyChain(chain) {
  if (!chain || !chainTableNames[chain]) {
    throw new Error(`chain '${chain}' is not supported`);
  }
}
module.exports = {
  verifyChain,
};
