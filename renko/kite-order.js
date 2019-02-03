let profit = 0;
let tradingPrice = 0;
sellOrBuy = "";
let tradeInitiated = false;
const taradedAmount = 1;
const LTPThreshold = 0.45;
const aroonThreshold = 50;
const kite = require("../common/kite-service");

const Gautham = {
  initiate: async function(
    data,
    tick,
    bricksize,
    trima,
    aroonUp,
    aroonDown,
    superTrend
  ) {
    const { open, high, low, close, volume } = data;
    const LTP = tick.last_price;

    for (let i = close.length - 1; i < close.length && i >= 0; i++) {
      // if prev is green and current is green
      if (
        close.length > 0 &&
        !tradeInitiated &&
        calculateBar(i) > 0 &&
        trima < LTP
      ) {
        buy(LTP, taradedAmount);
        // prev red and current red
      } else if (
        close.length > 0 &&
        !tradeInitiated &&
        calculateBar(i) < 0 &&
        trima > LTP
      ) {
        sell(LTP, taradedAmount);
      } else if (
        tradeInitiated &&
        sellOrBuy === "buy" &&
        calculateBar(i) < 0 &&
        i === close.length - 1 &&
        trima >= LTP
      ) {
        sell(LTP, taradedAmount);
        sell(LTP, taradedAmount);
      }
      // sell when triple exponential 14 day tema <  9 day tema
      else if (
        tradeInitiated &&
        sellOrBuy === "sell" &&
        calculateBar(i) > 0 &&
        // calculateBar(i - 1) > 0 &&
        i === close.length - 1 &&
        trima <= LTP
      ) {
        buy(LTP, taradedAmount);
        buy(LTP, taradedAmount);
      }
    }
    console.log("profit", profit);
  }
};

async function sell(price, quantity) {
  // TODO - check response
  let response;
  try {
    response = await kite.KITE.sell(price, quantity, "SBIN", "LIMIT");
  } catch (err) {
    console.log(err);
  }

  if (response.status !== "error") {
    tradeInitiated = !tradeInitiated;
    sellOrBuy = "sell";
    console.log("sell order success");
  }
}

async function buy(price, quantity) {
  // Todo -: check here
  let response;
  try {
    response = await kite.KITE.buy(price, quantity, "SBIN", "LIMIT");
  } catch (err) {
    console.log(err);
  }

  if (response.status !== "error") {
    tradeInitiated = !tradeInitiated;
    sellOrBuy = "buy";
    console.log("buy order success");
  }
}

// Tax Calculator
function calculateTax(price, quantity, finished) {
  let transactionAmt = price * quantity;
  let zerodhCharge = 20;
  // only on sell side for intraday
  let STT = finished ? (0.025 / 100) * transactionAmt : 0;
  let NSECharges = (0.00325 / 100) * transactionAmt;
  let GST = (18 / 100) * (zerodhCharge + NSECharges);
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
