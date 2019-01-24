// api secret rzgyg4edlvcurw4vp83jl5io9b610x94
// api key dysoztj41hntm1ma

// https://kite.trade/connect/login?v=3&api_key=dysoztj41hntm1ma

// DG0619

// EC2 gauthaminbangalore@gmail.com
// iitIIT1!

// access_token =

const API_SECRET = "rzgyg4edlvcurw4vp83jl5io9b610x94";
const API_KEY = "dysoztj41hnta";
const REQ_TOKEN = "Z05UejaH6gAvoBvl1PsKeebmRptLiZzl";
let access_token = "JX9Lneaza6JZJRqeI9yz3YBaBOWXxqyb";

const KiteConnect = require("kiteconnect").KiteConnect;

let KiteTicker = require("kiteconnect").KiteTicker;
let ticker;

const processTicks = require("../renko/process-ticks");

let kc = new KiteConnect({
  api_key: API_KEY,
  access_token: access_token
});

let interval;
let previousTime;
let OHLC = {};

function accessTokenGenerator() {
  return kc.generateSession(REQ_TOKEN, API_SECRET);
}

const KITE = {
  generateTicks: async () => {
    if (access_token === '') {
      try {
        let token = await accessTokenGenerator();
        access_token = token.access_token;
        console.log("acess token", access_token);
        return;
      } catch (err) {
        console.log("err", err);
        return err;
      }
    }

  try {
    kc = new KiteConnect({
      api_key: API_KEY,
      access_token: access_token
    });
    
    ticker = new KiteTicker({
      api_key: API_KEY,
      access_token: access_token
    });
  } catch (e) {
    console.log('kite error', e);
  }

    ticker.connect();
    ticker.on("connect", subscribe);
    ticker.on("ticks", onTicks);
    ticker.autoReconnect(true, 300, 20);
    console.log('connected', ticker.connected());
    ticker.on("reconnecting", function(reconnect_interval, reconnections) {
      console.log(
        "Reconnecting: attempt - ",
        reconnections,
        " innterval - ",
        reconnect_interval
      );
    });
    ticker.on("noreconnect", function() {
      console.log("noreconnect");
    });
    ticker.on('error', (error) => {
      console.log('error', error);
    })
  },
  getInstruments: function() {
    kc.getInstruments(["NSE"]).then(res => {
      console.log("insruments", res);
    });
  },
  buy: function(price, quantity, symbol, type) {
    return kc.placeOrder("regular", {
      exchange: "NSE",
      tradingsymbol: symbol,
      transaction_type: "BUY",
      quantity: quantity,
      product: "MIS",
      order_type: type,
      validity: "DAY",
      price: price
    });
  },
  sell: (price, quantity, symbol, type) => {
    return kc.placeOrder("regular", {
      exchange: "NSE",
      tradingsymbol: symbol,
      transaction_type: "SELL",
      quantity: quantity,
      product: "MIS",
      order_type: type,
      validity: "DAY",
      price: price
    });
  },
  getkite: () => kc
};

function saveDataToMLab() {}

function generateOHLC(ticks) {
  if (ticks.last_price > OHLC.high) {
    OHLC.high = ticks.last_price;
  } else if (ticks.last_price < OHLC.low) {
    OHLC.low = ticks.last_price;
  }
}

async function onTicks(ticks) {
  if (previousTime === undefined) {
    previousTime = ticks[0].last_trade_time;
    OHLC.open = ticks[0].last_price;
    OHLC.low = ticks[0].last_price;
    OHLC.high = ticks[0].last_price;
  } else {
    generateOHLC(ticks[0]);
  }
  let diff = Math.abs(ticks[0].last_trade_time - previousTime);

  // dividing by 1000 * 60 gives the minute difference
  if (diff / (1000 * 60) >= 1) {
    OHLC.close = ticks[0].last_price;
    console.log("ticks", ticks[0]);
    processTicks.buildRenkoWithFixedBricks(ticks[0], OHLC, 0.50);
    previousTime = ticks[0].last_trade_time;
    // the current close is the next open for the OHLC
    OHLC.open = ticks[0].last_price;
  }
}

function subscribe() {
  var items = [779521];
  ticker.subscribe(items);
  ticker.setMode(ticker.modeFull, items);
}

module.exports.KITE = KITE;
