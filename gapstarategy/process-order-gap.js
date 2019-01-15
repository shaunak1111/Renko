const kite = require('../common/kite-service');
const kc = kite.KITE.getkite();
const slippage = 0.1;
const quantity = 5000;
SLThreshold = 0.9;

let nifty100LowVolatile =   [
                                {name:'NSE:ITC', number: 424961},
                                {name:'NSE:ONGC', number: 633601}
                            ];
let buyOrSell = '';

async function processOrder(tick, instrument) {
    const LTP = tick.last_traded_price;
    let orderSuccess = false;
    let instrumentData;
    let res;
    function buySell(buySell) {
        let orderSuccess;
        try {
            if (buySell === 'buy') {
                orderSuccess = await kite.KITE.buy(LTP, tradedData, instrument.tradingsymbol, 'MARKET');
            } else {
                orderSuccess = await kite.KITE.sell(LTP, tradedData, instrument.tradingsymbol, 'MARKET');
            }

            if (!orderSuccess.error) {
                if (buySell === 'buy') {
                    // global variable to buy ir sell
                    buyOrSell = 'buy';
                } else {
                    buyOrSell = 'sell';
                }
            }
        } catch (e) {
            console.log('buy or sell error', error);
            return;
        }
    }
    try {
        instrumentData = await getPrevDayData(instrument)[0];
    } catch (e) {
        console.log(e);
        return;
    }

    // Gap up opening or ltp below previous high with a slipage 
    if (LTP > instrumentData[0].high
        || LTP - (slippage * instrumentData[0].high) > instrumentData[0].high) {
        buySell('buy');
    // Gap down strategy or LTP above previous low with a slipage
    } else if (LTP < instrumentData[0].low
        || LTP + (slippage * instrumentData[0].low) < instrumentData[0].low) {
        buySell('sell');
    }
}

function stopLoss (stock, tick, tradedData) {
    const LTP = tick.last_traded_price;
    const lastTradedLTP = tradedData.last_traded_price;
    let SL = SLThreshold * lastTradedLTP;
    if (LTP <= lastTradedLTP - SL && sellOrBuy === 'buy') {
        sell(LTP, quantity, tradedData.tradingsymbol, 'MARKET')
    } else if (LTP >= lastTradedLTP + SL && sellOrBuy === 'sell') {
        buy(LTP, quantity, tradedData.tradingsymbol, 'MARKET');
    }
}

async function sell(price, quantity, symbol, type) {
    // TODO - check response
    let response;
    try {
      response = await kite.KITE.sell(price, quantity, symbol, type);
      console.log('sell', response);
    } catch (err){
      console.log(err);
    }
  
    if (!response.error) {
          sellOrBuy = "buy";
          
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
    }
  }


function getPrevDayData(instrument) {
    let prevDate = new Date();    
    prevDate.setDate(prevDate.getDate() - 1);
    prevDate = new Date();
    return kc.getHistoricalData(instrument,'day', prevDate, new Date());
}

processOrder.prototype.gapScreener = function(prevDayData) {
    nifty100LowVolatile.forEach((item, index) => {

    })
}
