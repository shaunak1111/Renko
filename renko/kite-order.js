let profit = 0;
let tradingPrice = 0;
sellOrBuy = "";
let tradeInitiated = false;
const taradedAmount = 1;
const LTPThreshold = 0.45;
const kiteService = require('./kite.service');
const kite = require('../renko/kite.service');

const Gautham = {
  initiate: async function(data, tick, bricksize) {
    const { open, high, low, close, volume } = data;
    const LTP = tick.last_price;
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

    function nextRenkoCreation(LTP, closePrice) {
      if (LTP > closePrice || LTP < closePrice) {
        return true;
      }
    }

    for (let i = close.length - 1; i < close.length && i >= 0; i++) {
      // if prev is green and current is green
      if (
        close.length > 0 &&
        !tradeInitiated &&
        calculateBar(i) > 0 &&
        LTP >= (LTPThreshold * bricksize) + close[i]
        //&& calculateBar(i - 1) > 0
      ) {
        buy(LTP, taradedAmount, i, open);
        // prev red and current red
      } else if (
        close.length > 0 &&
        !tradeInitiated &&
        calculateBar(i) < 0
        && LTP <= close[i] - (LTPThreshold * bricksize)
        // && calculateBar(i - 1) < 0
      ) {
        sell(LTP, taradedAmount, i, open);
      } else if (
        tradeInitiated &&
        sellOrBuy === "buy" &&
        calculateBar(i) < 0 &&
        // calculateBar(i - 1) < 0 &&
        i === close.length - 1 &&
        // calculate the bricksize open[0]
        LTP <= close[i] - (LTPThreshold * bricksize)
      ) {
        sell(LTP, taradedAmount, i, open);
        sell(LTP, taradedAmount, i, open);
      }
      // sell when triple exponential 14 day tema <  9 day tema 
      else if (
        tradeInitiated &&
        sellOrBuy === "sell" &&
        calculateBar(i) > 0 &&
        // calculateBar(i - 1) > 0 &&
        i === close.length - 1 &&
        tick.last_price >= close[i] + (LTPThreshold * bricksize)
      ) {
        buy(LTP, taradedAmount, i, open);
        buy(LTP, taradedAmount, i, open);
      }
    //   else if ( // TODO check the renko formation on calculate Bar
    //     tradeInitiated &&
    //     sellOrBuy === "buy" &&
    //     calculateBar(i - 1) < 0 &&
    //     calculateBar(i - 2) < 0
    //   ) {
    //     // stop loss todo
    //     // sell(open[i], taradedAmount, i, open); // commented so that sample code to remeber
    //     sell(tick.last_price, taradedAmount, i, open);
    //   }
    //   else if (
    //     tradeInitiated && // TODO i -2 here
    //     sellOrBuy === "sell" &&
    //     calculateBar(i - 1) > 0 &&
    //     calculateBar(i - 2) > 0
    //   ) {
    //     // stop loss
    //     buy(tick.last_price, taradedAmount, i, open);
    //   } 
    //   else {
    //     continue;
    //   }
    }
    console.log("profit", profit);
  }
};

async function sell(price, quantity, index, open) {
  // TODO - check response
  let response;
  try {
    response = await kite.KITE.sell(price, quantity);
    console.log('sell', response);
  } catch (err){
    console.log(err);
  }

  if (!response.error) {
    if (tradeInitiated) {
        sellOrBuy = "";
    } else {
        sellOrBuy = "sell";
    }
    tradeInitiated = !tradeInitiated;
  }
}

async function buy(price, quantity, index, open) {
  // Todo -: check here
  let response;
  try {
    response = await kite.KITE.buy(price, quantity);
    console.log('buy', response);
  } catch (err){
    console.log(err);
  }

  if (!response.error) {
    if (tradeInitiated) {
      // reset the initiated trade
      sellOrBuy = "";
    } else {
        sellOrBuy = "buy";
    }
    tradeInitiated = !tradeInitiated;
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
