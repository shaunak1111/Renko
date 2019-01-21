// alphavantage api key WGVGWXN6LCM013NN
// NSE:SBI
//

const axios = require("axios");
const mtz = require("moment-timezone");
const moment = require("moment");

const getHistData = {
  getAlphaVantageData: async function (symbol, timeInterval) {
    let url = `https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=${symbol}&interval=${timeInterval}&outputsize=full&apikey=WGVGWXN6LCM013NN`
    return await axios.get(url);
  },
  processAlphavantageData: data => {
    //    let date = moment('2018-12-17 04:59:00');
    //    console.log(date.tz('America/Toronto').toDate());

    function ISTdateFormatter(dateStamp) {
      let ISTDate = moment.tz(dateStamp, "America/Toronto").tz("Asia/Kolkata");
      return new Date(ISTDate.toString()).getTime();
    }

    let renkoFormat = {
      close: [],
      open: [],
      timestamp: [],
      volume: [],
      high: [],
      low: [],
      period: 14
    };
    let dateArr = Object.keys(data).reverse();
    dateArr.forEach(dateObj => {
      renkoFormat.open.push(parseFloat(data[dateObj]["1. open"]));
      renkoFormat.high.push(parseFloat(data[dateObj]["2. high"]));
      renkoFormat.low.push(parseFloat(data[dateObj]["3. low"]));
      renkoFormat.close.push(parseFloat(data[dateObj]["4. close"]));
      renkoFormat.volume.push(parseFloat(data[dateObj]["5. volume"]));
      renkoFormat.timestamp.push(ISTdateFormatter(dateObj));
    });
    return renkoFormat;
  }
};

module.exports = getHistData;
