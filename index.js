const renko = require('./renko');
const hist = require('./renko/Ticks.service');
const Gautham = require('./renko/Dummy');
const fs = require('fs');

const axios = require('axios');
// const kite =  require('./renko/kite.service');
const kite =  require('./common/kite-service');

// const data = hist.getAlphaVantageData().then((data) => {
//     // console.log(data.data['Time Series (1min)']);

//     // --------- File stats here ------------
//     // let fileData = fs.readFileSync('../trade/algo_trading/renko/data.json');
//     // let content = JSON.parse(fileData);

//     // ---------------File ends here -----------------

//     let revData = Array.prototype.reverse.apply(data.data['Time Series (1min)']);

//     // --------- File stats here ------------
//     // revData = content['Time Series (1min)'];
//     // ---------------File ends here -----------------

//     let renkoDataFormat = hist.processAlphavantageData(revData);

//     // renkoDataFormat.close = renkoDataFormat.close.slice(0,3);
//     // renkoDataFormat.open = renkoDataFormat.open.slice(0,3);
//     // renkoDataFormat.volume = renkoDataFormat.volume.slice(0,3);
//     // renkoDataFormat.high = renkoDataFormat.high.slice(0,3);
//     // renkoDataFormat.low = renkoDataFormat.low.slice(0,3);

//     let renkoConvert = renko.renkoBrick(renkoDataFormat, 0.20);

//     console.log('renko',renkoConvert);

//     Gautham.initiate(renkoConvert);
//     // renko.printATR(renkoData);
//     // renko.printRenko(renkoData, 0.5, true);
// });

kite.KITE.generateTicks();

// (async () => {
//   try {
//     let url = `https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=NSE:SBIN&interval=1min&outputsize=compact&apikey=WGVGWXN6LCM013NN`;
//     let res = await axios.get(url)
//     console.log(res)
//   }catch (e) {
//     console.log(e)
//   }
//   console.log(45)
// })();

// kite.getInstruments();