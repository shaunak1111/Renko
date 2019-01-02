const Gautham = {
    initiate: renkoTradeInitiated(),
    Dump:  DumpIfTradeInitiated()
}

    let tradeInitiated = false;

    let renkoDetails = {
        previousRenkos: [],
        sellOrBuy: ''
    }
    
    function DumpIfTradeInitiated(data) {
        const { open, high, low, close, volume } = data;
        let currentIndex = 0, prevIndex = 1,thirdIndex = 2, fourthIndex = 3, fifthIndex = 4, sixthIndex = 5;
        let currentRenkoBar = renkoDetails.previousRenkos[currentIndex].open -  renkoDetails.previousRenkos[currentIndex].close;
        let prevRenkoBar = renkoDetails.previousRenkos[prevIndex].open - renkoDetails.previousRenkos[currentIndex].close;
        if (tradeInitiated && currentRenkoBar > 0 && prevRenkoBar > 0 && renkoDetails.sellOrBuy === 'sell') {
            buy();
        } else {
            sell();
        }
    }

    function renkoTradeInitiated(data, brickSize) {
        const { open, high, low, close, volume } = data;
        let currentIndex = 0, prevIndex = 1,thirdIndex = 2, fourthIndex = 3, fifthIndex = 4, sixthIndex = 5;
        let currentRenkoBar =  open[currentIndex] - close[currentIndex];
        let prevRenkoBar = open[prevIndex] - close[prevIndex];
        let ThirdPrevBar = open[thirdIndex] - close[thirdIndex];
        let fourthPrevRenkoBar = open[fourthIndex] - close[fourthIndex];
        let fifthPrevRenkoBar = open[fifthIndex] - close[fifthIndex];
        let sixthPrevRenkoBar = open[sixthIndex] - close[sixthIndex];

        let currentRenkoObj = {
            open: open[currentIndex],
            close: close[currentIndex]
        }

        let prevRenkoObj = {
            open: open[prevIndex],
            close: close[prevIndex]
        }

        let thirdPrevObj = {
            open: open[thirdIndex],
            close: close[thirdIndex]
        }

        let fourthPrevObj = {
            open: open[fourthIndex],
            close: close[fourthIndex]
        }

        let fifthPrevObj = {
            open : open[fifthIndex],
            close: close[fifthIndex]
        }

        // means a red candle
        if (ThirdPrevBar > 0 && prevRenkoBar > 0 && currentRenkoBar > 0 && fourthPrevRenkoBar < 0 && fifthPrevRenkoBar < 0) {
            // short sell from zerodha
            shortSell();
            Array.prototype.push.apply(renkoDetails.previousRenkos,
                [currentRenkoObj, prevRenkoObj, thirdPrevObj, fourthPrevObj, fifthPrevObj]);
        } else if (ThirdPrevBar < 0 && prevRenkoBar < 0 && currentRenkoBar < 0 && fourthPrevRenkoBar > 0 && fifthPrevRenkoBar > 0) {
            // means a green candle
            // buy on zerodha
            buy();
            Array.prototype.push.apply(renkoDetails.previousRenkos,
                [currentRenkoObj, prevRenkoObj, thirdPrevObj, fourthPrevObj, fifthPrevObj]);
        } else if (!tradeInitiated && fifthPrevRenkoBar > 0 && fourthPrevRenkoBar < 0 && ThirdPrevBar < 0 && prevRenkoBar && currentRenkoBar < 0) {
            shortSell();
            Array.prototype.push.apply(renkoDetails.previousRenkos,
                [currentRenkoObj, prevRenkoObj, thirdPrevObj, fourthPrevObj, fifthPrevObj]);
        } else if (!tradeInitiated && fifthPrevRenkoBar < 0 && fourthPrevRenkoBar > 0 && ThirdPrevBar > 0 && prevRenkoBar && currentRenkoBar > 0) {
            buy();
            Array.prototype.push.apply(renkoDetails.previousRenkos,
                [currentRenkoObj, prevRenkoObj, thirdPrevObj, fourthPrevObj, fifthPrevObj]);
        }
    }

    function shortSell() {
        renkoDetails.previousRenkos = [];
        renkoDetails.sellOrBuy = 'sell';
        tradeInitiated = !tradeInitiated;
    }
    
    function buy() {
        renkoDetails.previousRenkos = [];
        renkoDetails.sellOrBuy = 'buy';
        tradeInitiated = !tradeInitiated;
    }

    // Tax Calculator
    function calculateTax(price, quantity, finished) {
        let transactionAmt = price * quantity;
        let zerodhCharge = 20;
        // only on sell side for intraday
        let STT = (finished) ? (0.025 / 100 * transactionAmt) / 2 : 0;
        let NSECharges =  0.00325 / 100 * transactionAmt;
        let GST = 18/100 * (zerodhCharge + NSECharges);
        let SEBICharges = (finished) ? 0.0000015 * transactionAmt : 0;
        return zerodhCharge + STT + NSECharges + GST + SEBICharges;
    }


module.exports.Gautham = Gautham;
