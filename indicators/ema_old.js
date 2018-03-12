// Exponential Moving Average indicator (EMA)

// Explanation of talib function
// { name: 'EMA',
//   group: 'Overlap Studies',
//   hint: 'Exponential Moving Average',
//   inputs: [ { name: 'inReal', type: 'real' } ],
//   optInputs:
//    [ { name: 'optInTimePeriod',
//        displayName: 'Time Period',
//        defaultValue: 30,
//        hint: 'Number of period',
//        type: 'integer_range' } ],
//   outputs: [ { '0': 'line', name: 'outReal', type: 'real', flags: {} } ] }

// const talib = require("talib");
//
// var calculateEMA = async function(marketData, period)
// {
//   await talib.execute({
//     name: "EMA",
//     startIdx: 0,
//     endIdx: marketData.close.length - 1,
//     inReal: marketData.close,
//     optInTimePeriod: period
//   }, await function(err, result) {
//     if (result) {
//       console.log(result);
//       return result;
//     }
//   });
// }

const talib = require("talib-binding");
//import * as talib from 'talib-binding';

//TA_EMA(startIdx, endIdx, inReal, optTime_Period, &outBegIdx, &outNBElement, outReal);
var calculateEMA = function(marketData, period)
{
  const ema = talib.EMA(
    marketData.close,
    period,
    talib.MATypes.EMA,
  );
  let begIndex = period -1;
  let NBElement = ema.length;

  var resultEMA = {
    outReal: ema,
    begIndex: begIndex,
    NBElement: NBElement
  }
  //console.log("period: " + period + ", result\n" + resultEMA.outReal);
  return resultEMA;
}


module.exports.calculateEMA =  calculateEMA;
