const renko = require("./index");
const processingEngine = require("./kite-order");
const tulind = require("tulind");
const kite = require("../common/kite-service");
const alphaVantage = require("../common/alphavantage-data");
const indicators = require("../common/Indicators");

const axios = require("axios");
//-------------------mongo db starts here------------------------
const MongoClient = require("mongodb").MongoClient;
const mongodbHost = "@ds143754.mlab.com";
const mongodbPort = 43754;
const mongodbName = "renko";
const mongoUserName = "shaunak1111";
const password = "gautham123";
const mlabURL = `mongodb://${mongoUserName}:${password}${mongodbHost}:${mongodbPort}/${mongodbName}`;

let db;

async function mongoConnect() {
  try {
    db = await MongoClient.connect(mlabURL, { useNewUrlParser: true }).then(
      client => client.db()
    );
    let collection = await db.collection("renko_bar");
    return (data = await collection.find({}).toArray());
  } catch (err) {
    return err;
  }
}

//----------------------- mongo db ends here----------------------------

let renkoFormat = {
  close: [],
  open: [],
  timestamp: [],
  volume: [],
  high: [],
  low: [],
  period: 14
};

async function saveData(obj) {
  let collection = await db.collection("renko_bar");
  return collection.insertOne(obj, (err, res));
}

function getPrevDayHistoricalData(instrument) {
  //-------------- uncomment after this for kite historical data---------------
  // let prevDate = new Date();
  // prevDate.setDate(prevDate.getDate() - 1);
  // let kc = kite.KITE.getkite();
  //  let data = await kc.getHistoricalData(instrument,'minute', prevDate, new Date());
  // data.candles.foreach((items) => {
  //   renkoFormat.timestamp.push(new Date(items[0]).getTime());
  //   renkoFormat.open.push(items[1]);
  //   renkoFormat.high.push(items[2]);
  //   renkoFormat.low.push(items[3]);
  //   renkoFormat.close.push(items[4]);
  //   renkoFormat.volume.push(items[5]);
  // });
  //------------- uncomment ends here ---------------------------
}

function calculateSuperTrend(high, low, close, multiplier) {
  const ATR = require("technicalindicators").ATR;
  const input = {
    high: high,
    low: low,
    close: close,
    period: 10
  };
  let calculatedATR = ATR.calculate(input);
  calculatedATR = calculatedATR[calculatedATR.length - 1];
  console.log("atr", calculatedATR);

  // calculation of last high prices
  let lastHigh = high[high.length - 1];
  let lastClose = close[close.length - 1];
  let lastLow = low[low.length - 1];

  // supertrend calculation starts
  supertrend = {
    upperBandBasic: 0,
    lowerBandBasic: 0,
    upperBand: 0,
    lowerBand: 0,
    supertrend: 0
  };
  lastSupertrend = {
    upperBandBasic: 0,
    lowerBandBasic: 0,
    upperBand: 0,
    lowerBand: 0,
    supertrend: 0
  };
  let lastCandleClose = 0;
  supertrend.upperBandBasic =
    (lastHigh + lastLow) / 2 + multiplier * calculatedATR;
  supertrend.lowerBandBasic =
    (lastHigh + lastLow) / 2 - multiplier * calculatedATR;

  if (
    supertrend.upperBandBasic < lastSupertrend.upperBand ||
    lastCandleClose > lastSupertrend.upperBand
  )
    supertrend.upperBand = supertrend.upperBandBasic;
  else {
    supertrend.upperBand = lastSupertrend.upperBand;
  }

  if (
    supertrend.lowerBandBasic > lastSupertrend.lowerBand ||
    lastCandleClose < lastSupertrend.lowerBand
  )
    supertrend.lowerBand = supertrend.lowerBandBasic;
  else {
    supertrend.lowerBand = lastSupertrend.lowerBand;
  }

  if (
    lastSupertrend.supertrend == lastSupertrend.upperBand &&
    lastClose <= supertrend.upperBand
  )
    supertrend.supertrend = supertrend.upperBand;
  else if (
    lastSupertrend.supertrend == lastSupertrend.upperBand &&
    lastClose >= supertrend.upperBand
  )
    supertrend.supertrend = supertrend.lowerBand;
  else if (
    lastSupertrend.supertrend == lastSupertrend.lowerBand &&
    lastClose >= supertrend.lowerBand
  )
    supertrend.supertrend = supertrend.lowerBand;
  else if (
    lastSupertrend.supertrend == lastSupertrend.lowerBand &&
    lastClose <= supertrend.lowerBand
  ) {
    supertrend.supertrend = supertrend.upperBand;
  } else {
    supertrend.supertrend = 0;
  }

  return supertrend.supertrend;
}
async function processTicks(ticks, OHLC, prevData = undefined) {
  // Mongo
  // get previous data from mlab
  //   if (renkoFormat.close.length === 0) {
  //     let data = mongoConnect;
  //     if (data[0].close > 0) {
  //         renkoFormat = mongoConnect();
  //     }
  //   }

  // new data has not been genereated genereate previous day data
  if (prevData && renkoFormat.close.length === 0) {
    renkoFormat = alphaVantage.processAlphavantageData(prevData);
  }

  renkoFormat.close.push(OHLC.close);
  renkoFormat.open.push(OHLC.open);
  renkoFormat.high.push(OHLC.high);
  renkoFormat.low.push(OHLC.low);
  renkoFormat.volume.push(ticks.volume);
  renkoFormat.timestamp.push(ticks.timestamp.getTime());

  // Mongo
  // let saveData = await saveData(renkoFormat);
}

const Ticks = {
  buildRenkoWithFixedBricks: async function(ticks, OHLC, brickSize) {
    try {
      if (renkoFormat.close.length === 0) {
        let data = await alphaVantage.getAlphaVantageData("NSE:SBIN", "1min");
        processTicks(
          ticks,
          OHLC,
          Array.prototype.reverse.apply(data.data["Time Series (1min)"])
        );
      } else {
        processTicks(ticks, OHLC, undefined);
      }
    } catch (e) {
      console.log("alphavantage error");
    }

    console.log("renko data before format", renkoFormat);
    let renkoConvert = renko.renkoBrick(renkoFormat, brickSize);
    let renkoLen = renkoConvert.close.length;

    //-------------------Trima-------------------------------
    let period = 10;
    let trima = await tulind.indicators.trima.indicator(
      [renkoConvert.close],
      [period]
    );
    trima = trima[0][trima[0].length - 1];

    let trimaManual = indicators.triangularMovingAverage(
      renkoConvert.close,
      10
    );
    console.log("trima-manual-------", trimaManual);
    //-----------------Trima ends------------------------

    let aroonBarData = 15;
    let aroon = await tulind.indicators.aroon.indicator(
      [renkoConvert.high, renkoConvert.low],
      [5]
    );
    console.log("aroon", aroon);
    let aroonDown = aroon[0][aroon[0].length - 1];
    let aroonUp = aroon[1][aroon[1].length - 1];
    let superTrend = calculateSuperTrend(
      renkoConvert.high,
      renkoConvert.low,
      renkoConvert.close,
      3
    );
    // console.log("...................renko...................", renkoConvert);
    console.log(
      "trima-manual",
      trimaManual,
      "--trima---",
      trima,
      "aroon up",
      aroonUp,
      "aroon down",
      aroonDown,
      "super trend",
      superTrend
    );
    processingEngine.initiate(
      renkoConvert,
      ticks,
      brickSize,
      trimaManual,
      aroonUp,
      aroonDown,
      superTrend
    );
  }
};

module.exports = Ticks;
