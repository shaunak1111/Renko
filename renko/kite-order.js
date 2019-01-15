let profit = 0;
let tradingPrice = 0;
sellOrBuy = "";
let tradeInitiated = false;
const taradedAmount = 4000;
const LTPThreshold = 0.45;
const kiteService = require("./kite.service");
const kite = require("../renko/kite.service");

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
    const { up, down } = superTrend;
    const LTP = tick.last_price;


      // if prev is green and current is green
      if (
        LTP <= up &&
        aroonUp > aroonDown &&
        trima >= LTP
      ) {
        buy(LTP, taradedAmount);
        // prev red and current red
      } else if (
        LTP >= down &&
        aroonDown > aroonUp &&
        LTP <= trima
      ) {
        sell(LTP, taradedAmount);
      }
    console.log("profit", profit);
  }
};

async function sell(price, quantity) {
  // TODO - check response
  let response;
  try {
    response = await kite.KITE.sell(price, quantity);
    console.log("sell", response);
  } catch (err) {
    console.log(err);
  }

  if (!response.error) {
    console.log('sell');
  }
}

async function buy(price, quantity) {
  // Todo -: check here
  let response;
  try {
    response = await kite.KITE.buy(price, quantity);
    console.log("buy", response);
  } catch (err) {
    console.log(err);
  }

  if (!response.error) {
    console.log('bought');
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
