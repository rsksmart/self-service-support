const markdownIt = require('markdown-it');

const filterByParams = require('./util/filter-by-params.js');
const stringSubstitute = require('./util/string-substitute.js');

const rskTokenBridgeFilters = require('./data/rsk-token-bridge-filters.json');
const rskTokenBridgeOptions = require('./data/rsk-token-bridge-options.json');

const markdownItInstance = markdownIt();

function getFilters(params) {
  const {
    fromNetwork,
    walletName,
    txAge,
  } = params;

  // select subset of params that are used in filters,
  // ignore the rest that may be present for use in other functions
  const paramsToFilterBy = {
    fromNetwork,
    walletName,
    txAge,
  };
  return filterByParams(rskTokenBridgeFilters, paramsToFilterBy);
}

function getOptions(params) {
  const filters = getFilters(params);
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

function getOptionsRendered(params) {
  const options = getOptions(params);
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

function getOptionsHtml(options) {
  const html = options
    .map((option) => {
      const { id, question, answer } = option;
      const questionHtml = markdownItInstance.render(question);
      const answerHtml = markdownItInstance.render(answer);
      return `
      <div class="question-and-answer">
        <h3 id="question--${id}" class="question">${questionHtml}</h3>
        <span class="answer">${answerHtml}</span>
      </div>
      `;
    })
    .join('\n\n');
  return html;
}

module.exports = {
  getFilters,
  getOptions,
  getOptionsRendered,
  getOptionsHtml,
};
