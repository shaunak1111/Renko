let profit = 0;
let tradingPrice = 0;
sellOrBuy = "";
let tradeInitiated = false;
const taradedAmount = 5000;

const Gautham = {
  initiate: function(data) {
    const { open, high, low, close, volume } = data;
    function calculateBar(index) {
      // console.log(
      //   "bar",
      //   index,
      //   "close",
      //   close[index],
      //   "open",
      //   open[index],
      //   'diff',
      //   close[index] - open[index]
      // );
      return close[index] - open[index];
    }

    for (let i = 0; i < close.length; i++) {
      // Finish if not sold or bought
      if (
        tradeInitiated &&
        i === close.length - 1
      ) {
        if (sellOrBuy === "sell") {
          buy(close[i], taradedAmount, i, close);
        } else {
          sell(close[i], taradedAmount, i, close);
        }
        break;
      }

      // if prev is green and current is green
      if (
        !tradeInitiated &&
        i > 0 &&
        calculateBar(i) > 0 &&
        calculateBar(i - 1) > 0
      ) {
        buy(open[i], taradedAmount, i, open);
        // prev red and current red
      } else if (
        !tradeInitiated &&
        i > 0 &&
        calculateBar(i) < 0 &&
        calculateBar(i - 1) < 0
      ) {
        sell(open[i], taradedAmount, i, open);
      } else if (
        tradeInitiated &&
        sellOrBuy === "buy" &&
        calculateBar(i) < 0 &&
        calculateBar(i - 1) < 0
      ) {
        sell(open[i], taradedAmount, i, open);
        sell(open[i], taradedAmount, i, open);
      } else if (
        tradeInitiated &&
        sellOrBuy === "sell" &&
        calculateBar(i) > 0 &&
        calculateBar(i - 1) > 0
      ) {
        buy(open[i], taradedAmount, i, open);
        buy(open[i], taradedAmount, i, open);
      } else if (
        tradeInitiated &&
        sellOrBuy === "buy" &&
        calculateBar(i - 1) < 0 &&
        calculateBar(i - 2) < 0
      ) {
        // stop loss
        sell(open[i], taradedAmount, i, open);
      } else if (
        tradeInitiated &&
        sellOrBuy === "sell" &&
        calculateBar(i - 1) > 0 &&
        calculateBar(i - 2) > 0
      ) {
        // stop loss
        buy(open[i], taradedAmount, i, open);
      } else {
        continue;
      }
    }
    console.log("profit", profit);
  }
};
function sell(price, quantity, index, open) {
  let charges = calculateTax(price, quantity, tradeInitiated);
  profit -= charges;
  if (tradeInitiated) {
    let buyingPrice = tradingPrice * quantity;
    let sellingPrice = open[index] * quantity;
    profit += sellingPrice - buyingPrice;
    sellOrBuy = "";
    tradeInitiated = !tradeInitiated;
    return;
  }
  tradingPrice = price;
  tradeInitiated = !tradeInitiated;
  sellOrBuy = "sell";
}

function buy(price, quantity, index, open) {
  let charges = calculateTax(price, quantity, tradeInitiated);
  profit -= charges;
  if (tradeInitiated) {
    // short sell calculation
    let sellingPrice = tradingPrice * quantity;
    let buyingPrice = open[index] * quantity;
    profit += sellingPrice - buyingPrice;
    // reset the initiated trade
    sellOrBuy = "";
    tradeInitiated = !tradeInitiated;
    return;
  }
  tradingPrice = price;
  tradeInitiated = !tradeInitiated;
  sellOrBuy = "buy";
}

// Tax Calculator
function calculateTax(price, quantity, finished) {
  let transactionAmt = price * quantity;
  let zerodhCharge = 20;
  // only on sell side for intraday
  let STT = finished ? (0.025 / 100) * transactionAmt : 0;
  let NSECharges = (0.00325 / 100) * transactionAmt;
  let GST = (18 / 100) * (zerodhCharge  + NSECharges);
  let SEBICharges = 0.0000015 * transactionAmt;
  let stampDuty = (0.003 / 100) * transactionAmt;
  // console.log(
  //   "zerodhaCharge",
  //   zerodhCharge,
  //   "STT",
  //   STT,
  //   "nse",
  //   NSECharges,
  //   "GST",
  //   GST,
  //   "sebi",
  //   SEBICharges,
  //   "stamp",
  //   stampDuty
  // );
  return zerodhCharge + STT + NSECharges + GST + SEBICharges + stampDuty;
}

module.exports = Gautham;
