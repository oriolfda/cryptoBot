// Exponential Moving Average indicator (EMA).

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

const talib = require("talib-binding")
//import * as talib from 'talib-binding';

function EMA() {

  //TA_EMA(startIdx, endIdx, inReal, optTime_Period, &outBegIdx, &outNBElement, outReal);
  EMA.prototype.calculate = async function(params) {
    const ema = await talib.EMA(
      params.inReal,
      parseInt(params.period),
      talib.MATypes.EMA,
    )

  //  let begIndex = parseInt(params.period) - 1
    let NBElement = ema.length
    var resultEMA = {
      outReal: ema.slice(),
      begIndex: parseInt(params.period) - 1,
      NBElement: NBElement,
      period: parseInt(params.period)
    }
    //console.log("period: " + params.period + ", result\n" + resultEMA.outReal);
    return resultEMA
  }

  EMA.prototype.createID = function(params){
    return params.name + "_" + params.period
  }

}

module.exports = new EMA()
