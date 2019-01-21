const SMA = require("technicalindicators").SMA;

const Indicators = {
  triangularMovingAverage: (values, period) => {
    let sumOfSMA = 0;
    for (let i = 1; i <= period; i++) {
      sumOfSMA += SMA.calculate({ period: i, values: values });
    }

    return sumOfSMA / period;
  },
  aroon: (high, low, period) => {
    let highestHigh;
    let lowestLow;
    let highIndex;
    let lowIndex;

    high.forEach((high,low,index) => {
        if (!highestHigh || high > highestHigh) {
            highestHigh = high;
            highIndex = period - index;
        }

        if (!lowestLow || low[index] < lowestLow) {
            lowestLow = low[index];
            lowIndex = periods - index - 1;
        }
    });
    return {

    }
  },
  superTrend : (high, low, close, multiplier) => {
    const ATR = require("technicalindicators").ATR;
    const input = {
      high: high,
      low: low,
      close: close,
      period: 7
    };
    let calculatedATR = ATR.calculate(input);
    calculatedATR = calculatedATR[calculatedATR.length - 1];
  }
};

module.exports = Indicators;
