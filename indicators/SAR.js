// Parabolic SAR indicator (SAR).

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
var total_SAR = 0

function SAR() {

  SAR.prototype.calculate = async function(params){
    if (!params.optInAcceleration) {
      params.optInAcceleration = 0.02
    }
    if (!params.optInMaximum) {
      params.optInMaximum = 0.2
    }
    let endIdx = (params.inHigh ? params.inHigh.length -1 : 0)
    const sar = await talib.SAR(
      params.inHigh, /* inHigh */
      params.inLow, /* inLow */
      params.optInAcceleration, /* optAcceleration_Factor, optional */
      params.optInMaximum, /* optAF_Maximum, optional */
      0, /* startIdx, optional */
      endIdx /* endIdx, optional */
    )

    let begIndex = (params.inHigh ? params.inHigh.length - sar.length : 0)
    let NBElement = sar.length;

    var resultSAR = {
      outReal: sar.slice(),
      begIndex: begIndex,
      NBElement: NBElement
    }

    total_SAR++
    // /console.log("SAR: " + total_SAR + ": " + resultSAR.begIndex)
    return resultSAR
  }

  SAR.prototype.createID = function(params){
    return params.name + "_" + total_SAR
  }

}

module.exports = new SAR()
