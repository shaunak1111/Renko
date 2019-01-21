const renko = require("./renko");
const hist = require("./renko/Ticks.service");
const Gautham = require("./renko/Dummy");
const fs = require("fs");
const axios = require("axios");
// const kite =  require('./renko/kite.service');
const kite = require("./common/kite-service");

//--------------server constants----------------------
const http = require("http");
const PORT = 8080;
const HttpDispatcher = require("httpdispatcher");
const dispatcher = new HttpDispatcher();

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

//     let renkoConvert = renko.renkoBrick(renkoDataFormat, 0.20);

//     console.log('renko',renkoConvert);

//     Gautham.initiate(renkoConvert);
//     // renko.printATR(renkoData);
//     // renko.printRenko(renkoData, 0.5, true);
// });

//------------------------server code-----------------------------------
// We need a function which handles requests and send response
function handleRequest(request, response) {
  try {
    // log the request on console
    console.log(request.url);
    // Dispatch
    dispatcher.dispatch(request, response);
  } catch (err) {
    console.log(err);
  }
}

// Create a server
const myFirstServer = http.createServer(handleRequest);

//A sample GET request
dispatcher.onGet("/", function(req, res) {
  kite.KITE.generateTicks();
  res.end("kite services called");
});

// Start the server !
myFirstServer.listen(PORT, function() {
  // Callback triggered when server is successfully listening. Hurray!
  console.log("Server listening on: http://localhost:%s", PORT);
});

//--------------------server code ends  here----------------------------

// kite.KITE.generateTicks();

// kite.getInstruments();


process.on("unhandledRejection", function(reason, p) {
    //call handler here
    console.log("processhandler", reason, p);
});
