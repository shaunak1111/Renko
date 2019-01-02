const renko = require("./index");
const processingEngine = require("./kite-order");

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
    db = await MongoClient.connect(
      mlabURL,
      { useNewUrlParser: true }
    ).then(client => client.db());
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

async function processTicks(ticks, OHLC) {
    // Mongo
  // get previous data from mlab
//   if (renkoFormat.close.length === 0) {
//     let data = mongoConnect;
//     if (data[0].close > 0) {
//         renkoFormat = mongoConnect();
//     }
//   }
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
  buildRenkoWithFixedBricks: function(ticks, OHLC, brickSize) {
    processTicks(ticks, OHLC);
    console.log("renko data before format", renkoFormat);
    let renkoConvert = renko.renkoBrick(renkoFormat, brickSize);
    console.log(".................renko...................", renkoConvert);
    // TODO enable here
    processingEngine.initiate(renkoConvert, ticks, brickSize);
  }
};

module.exports = Ticks;
