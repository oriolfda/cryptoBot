const gauss = require("gauss");
const util = require ("../core/util");
var dirs = util.dirs();
const ema = require(dirs.indicators + "ema.js");
const sar = require(dirs.indicators + "sar.js");

//Vectors for EMA values min, mid and max.
var vectEma_Min = new gauss.Vector();
var vectEma_Mid = new gauss.Vector();
var vectEma_Max = new gauss.Vector();

//objects for EMA Talib indicators results
var resultEma_Min;
var resultEma_Mid;
var resultEma_Max;

//object for Parabolic SAR (SAR) indicator results
var resultSAR;

//Variables to set status of trending (1 uptrending, -1 downtrending)
var status = 0;
var prev_status = 0;

//status_SAR values:
// 0 - initial | change SAR
// 1 - SAR greater than HIGH
//-1 - SAR lower than LOW
var status_SAR = 0;
var prev_status_SAR = 0;

//main function watch
var watch = function(marketData, emaMin, emaMid, emaMax){
  console.log("Log-->marketWatcher init");
//  console.log(marketData);

  //calculate EMA at closing prices
  //TODO: let choose price by parameter.
  resultEma_Min = ema.calculateEMA(marketData, emaMin);
  vectEma_Min = resultEma_Min;

  resultEma_Mid = ema.calculateEMA(marketData, emaMid);
  vectEma_Mid = resultEma_Mid.outReal;

  resultEma_Max = ema.calculateEMA(marketData, emaMax);
  vectEma_Max = resultEma_Max.outReal;

  //calculate Parabolic SAR values (SAR)

  resultSAR = sar.calculateSAR(marketData);

}

module.exports.watch = watch;
