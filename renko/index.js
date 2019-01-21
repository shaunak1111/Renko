/**
 * Created by AAravindan on 5/3/16.
 */
// var renko = require('../../lib/chart_types/Renko').renko;
// var renko = require('../../dist/index').renko;
let renko = require('technicalindicators').renko;
const tulind = require('tulind');

const period = 14;
let ATR = require('technicalindicators').ATR;
const ATRData = {
    high : [48.70,48.72,48.90,48.87,48.82,49.05,49.20,49.35,49.92,50.19,50.12,49.66,49.88,50.19,50.36,50.57,50.65,50.43,49.63,50.33,50.29,50.17,49.32,48.50,48.32,46.80,47.80,48.39,48.66,48.79],
    low  : [47.79,48.14,48.39,48.37,48.24,48.64,48.94,48.86,49.50,49.87,49.20,48.90,49.43,49.73,49.26,50.09,50.30,49.21,48.98,49.61,49.20,49.43,48.08,47.64,41.55,44.28,47.31,47.20,47.90,47.73],
    close : [48.16,48.61,48.75,48.63,48.74,49.03,49.07,49.32,49.91,50.13,49.53,49.50,49.75,50.03,50.31,50.52,50.41,49.34,49.37,50.23,49.24,49.93,48.43,48.18,46.57,45.41,47.77,47.72,48.62,47.85],
    period : period
  }

const Util = {
    renkoATR : function (data, period) {
        return renko(Object.assign({}, data, {period :period, useATR : true }));
    },

    renkoBrick: function (data, brickSize) {
        return renko(Object.assign({}, data, {brickSize : brickSize, useATR : false }));
    },

    aaron: function(data) {
        tulind.indicators.aaron.indicator([renkoConvert.close, renkoConvert.high],[4],(err, result) => {
            if(err) {
                console.log('aaron error', err);
            } else {
                console.log(result);
            }
        });
    }
}

module.exports = Util;



// describe('Renko (Exponential Moving Average)', function () {
//     it('should calculate renko using the fixed bar', function () {
//         let result = renko(Object.assign({}, data, {brickSize : 0.1, useATR : false }));
//         console.log(result)
//         assert.deepEqual(result, expectedOutput, 'Wrong Results');
//     });

//     it('should be able to get Renko using atr', function () {
//         var result = renko(Object.assign({}, data, {period : 14 , useATR : true }));
//         assert.deepEqual(result, expectedOutput, 'Wrong Results while getting results');
//     });
// })