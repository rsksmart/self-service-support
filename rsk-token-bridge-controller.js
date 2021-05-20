const filterByParams = require('./util/filter-by-params.js');
const rskTokenBridgeFilters = require('./data/rsk-token-bridge-filters.json');
const rskTokenBridgeOptions = require('./data/rsk-token-bridge-options.json');

function getFilters(fromNetwork, txHash, walletName, txAge) {
  const params = {
    fromNetwork,
    walletName,
    txAge,
  };
  return filterByParams(rskTokenBridgeFilters, params);
}

function getOptions(fromNetwork, txHash, walletName, txAge) {
  const filters = getFilters(fromNetwork, txHash, walletName, txAge);
  const optionIds = new Set();
  filters.forEach((filter) => {
    filter.options.forEach((filterOption) => {
      optionIds.add(filterOption);
    });
  });
  const options = [...optionIds.values()].map((optionId) => {
    return rskTokenBridgeOptions[optionId];
  }).filter((option) => {
    return !!option;
  });
  return options;
}

module.exports = {
  getFilters,
  getOptions,
};
