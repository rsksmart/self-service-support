const chainTableNames = {
  rsk_testnet: 'chain_rsk_testnet',
  rsk_mainnet: 'chain_rsk_mainnet',
};

function validateChain(req, defaultValue) {
  const chain = req.query.chian ?? defaultValue;
  if (!chain || !chainTableNames[chain]) {
    throw new Error(`chain '${chain}' is not supported`);
  }
}

function getChainTableName(chain) {
  return chainTableNames[chain];
}

module.exports = {
  validateChain,
  getChainTableName,
};
