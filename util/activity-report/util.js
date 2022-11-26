const chainTableNames = {
  rsk_testnet: 'chain_rsk_testnet',
  rsk_mainnet: 'chain_rsk_mainnet',
};

function getChainTableName(chain) {
  if (!chain || !chainTableNames[chain]) {
    throw new Error(`chain '${chain}' is not supported`);
  }
  return chainTableNames[chain];
}

module.exports = {
  getChainTableName,
};