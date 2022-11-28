function round(number = 0.0) {
  return Number(number.toFixed(2));
}
/**
 * Calculates the moving average indicator for the `data` array last element.

https://www.investopedia.com/ask/answers/071414/whats-difference-between-moving-average-and-weighted-moving-average.asp

getMovingAverage('simple', [0.1, 0.2, 0.3, 0.4])
calculation: (0.1 + 0.2 + 0.3 + 0.4) / 4
output: 0.25

getMovingAverage('weighted', [0.1, 0.2, 0.3, 0.4])
calculation: (0.1 * 1 + 0.2 * 2 + 0.3 * 3 + 0.4 * 4) / (1 + 2 + 3 + 4)
output: 0.3

getMovingAverage('exponential', [1, 2, 3, 4])
calculation: see description below
output: 0.28

 * @param {'simple' | 'weighted' | 'exponential'} type moving agerage type
 * @param {[number]} data array of instantaneous measurements
 * @returns {number}
 */
function getMovingAverage(type = 'simple', data = []) {
  let reducer;
  switch (type) {
    /* 
    The weighted average is calculated by multiplying the given price by its associated weighting and totaling the values.
    */
    case 'weighted':
      // sum of the data array indices
      const sum = (data.length * (data.length + 1)) / 2;
      reducer = (partialSum, currValue, index) =>
        partialSum + (currValue * (index + 1)) / sum;
      break;
    /* 
    Calculating an EMA involves three steps. The first step is to determine the SMA for the period, which is the first data point in the EMA formula. Then, a multiplier is calculated by taking 2 divided by the number of periods plus 1. The final step is to take the closing price minus the prior day EMA times the multiplier plus the prior day EMA.
    */
    case 'exponential':
      const multiplier = 2 / (data.length + 1);
      const prevPeriod = data.slice(0, -1);
      const sma = getMovingAverage('simple', prevPeriod);
      const [closingValue] = data.slice(-1);
      return round(closingValue * multiplier + sma * (1 - multiplier));
    /* 
    For a simple moving average, the formula is the sum of the data points over a given period divided by the number of periods.
    */
    case 'simple':
    default:
      reducer = (partialSum, currentValue) =>
        partialSum + currentValue / data.length;
  }
  return round(data.reduce(reducer, 0));
}

module.exports = getMovingAverage;
