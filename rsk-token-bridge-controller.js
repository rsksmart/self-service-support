const filterByParams = require('./util/filter-by-params.js');
const stringSubstitute = require('./util/string-substitute.js');

const rskTokenBridgeFilters = require('./data/rsk-token-bridge-filters.json');
const rskTokenBridgeOptions = require('./data/rsk-token-bridge-options.json');
const { render } = require('./server.js');

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

function getOptionsRendered(fromNetwork, txHash, walletName, txAge) {
  const params = {
    fromNetwork,
    txHash,
    walletName,
    txAge,
  };
  const options = getOptions(fromNetwork, txHash, walletName, txAge);
  const substitutions = stringSubstitute.getSubstitutions(params);
  const renderedOptions = options.map((option) => {
    const { question, answer } = option;
    return {
      question: stringSubstitute.substitute(question, substitutions),
      answer: stringSubstitute.substitute(answer, substitutions),
    }
  });
  return renderedOptions;
}

module.exports = {
  getFilters,
  getOptions,
  getOptionsRendered,
};
