// Parabolic SAR indicator (SAR)

// Explanation of talib function
// { name: 'SAR',
//   group: 'Overlap Studies',
//   hint: 'Parabolic SAR',
//   inputs: [ { name: 'inPriceHL', type: 'price', flags: [Object] } ],
//   optInputs:
//    [ { name: 'optInAcceleration',
//        displayName: 'Acceleration Factor',
//        defaultValue: 0.02,
//        hint: 'Acceleration Factor used up to the Maximum value',
//        type: 'real_range' },
//      { name: 'optInMaximum',
//        displayName: 'AF Maximum',
//        defaultValue: 0.2,
//        hint: 'Acceleration Factor Maximum value',
//        type: 'real_range' } ],
//   outputs: [ { '0': 'line', name: 'outReal', type: 'real', flags: {} } ] }

const talib = require("talib-binding");

var calculateSAR = function(marketData, optInAcceleration, optInMaximum)
{
  if (!optInAcceleration){optInAcceleration=0.02};
  if (!optInMaximum){optInMaximum=0.2};

  const sar = talib.SAR(
      marketData.high, /* inHigh */
      marketData.low, /* inLow */
      optInAcceleration, /* optAcceleration_Factor, optional */
      optInMaximum, /* optAF_Maximum, optional */
      0, /* startIdx, optional */
      marketData.high.length -1 /* endIdx, optional */
  )

  let begIndex = marketData.high.length - sar.length;
  let NBElement = sar.length;

  var resultSAR = {
    outReal: sar,
    begIndex: begIndex,
    NBElement: NBElement
  }

  return resultSAR;


  // talib.execute({
  //   name: "SAR",
  //   startIdx: 0,
  //   endIdx: marketData.close.length - 1,
  //   high: marketData.high,
  //   low: marketData.low,
  //   inPriceHL: marketData.close,
  //   optInAcceleration: optInAcceleration,
  //   optInMaximum: optInMaximum
  // }, function(err, result) {
  //   if (result) {
  //     return result;
  //   }
  // });
}

module.exports.calculateSAR = calculateSAR;
