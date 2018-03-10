const util = require("../core/util")
var dirs = util.dirs()
const Indicator = require(dirs.indicators + "Indicator.js")
const Signal = require(dirs.core + "Signal.js")
const gauss = require("gauss");
const Candle = require(dirs.core + "Candle.js")

var traceLevel = "all"

function TripleEMA_SAR() {
  this.signals = new Array()
  this.EMA_min = null
  this.EMA_mid = null
  this.EMA_max = null
  //vectors & objects for EMA Talib indicators
  this.vectEma_Min = new gauss.Vector();
  this.vectEma_Mid = new gauss.Vector();
  this.vectEma_Max = new gauss.Vector();
  this.marketData = null
  this.arrayCandles = null

  TripleEMA_SAR.prototype.init = async function(initParams) {
    this.arrayCandles = initParams.arrayCandles
    this.marketData = initParams.marketData
    let params = {
      name: "EMA",
      inReal: this.marketData.close,
      period: initParams.EMAMin
    }

    let myIndicator = Indicator

    //EMA min indicator
    await myIndicator.createIndicator(params)
    this.EMA_min = myIndicator.result

    //EMA mid indicator
    params.period = initParams.EMAMid
    await myIndicator.createIndicator(params)
    this.EMA_mid = myIndicator.result

    //EMA max indicator
    params.period = initParams.EMAMax
    await myIndicator.createIndicator(params)
    this.EMA_max = myIndicator.result

    //SAR indicator
    let params_SAR = {
      name: "SAR",
      inHigh: this.marketData.high,
      inLow: this.marketData.low
    }

    await myIndicator.createIndicator(params_SAR)
    this.resultSAR = myIndicator.result

    this.vectEma_Min = this.EMA_min.outReal
    this.vectEma_Mid = this.EMA_mid.outReal
    this.vectEma_Max = this.EMA_max.outReal

  }



  TripleEMA_SAR.prototype.execute = function() {
    let i = 0; // arrayCandles
    let j = 0; //vectEma_Min
    let k = 0; //vectEma_Mid
    let l = 0; //vectEma_Max
    var iSAR = 0; //resultSAR
    let firstSAR = true;

    var status = 0;
    var prev_status = 0;
// /    console.log(this.resultSAR);
    //status_SAR values:
    //0 - initial | change SAR
    //1 - SAR greater than HIGH
    //-1 - SAR lower than LOW
    var status_SAR = 0;
    var prev_status_SAR = 0;

    if (this.vectEma_Min &&
      this.vectEma_Mid &&
      this.vectEma_Max &&
      this.resultSAR) {
      //init copy
      for (candle in this.arrayCandles) {
        //create Candle Object
        var myCandle = new Candle({
          timestamp: this.arrayCandles[candle].timestamp,
          open: this.arrayCandles[candle].open,
          close: this.arrayCandles[candle].close,
          high: this.arrayCandles[candle].high,
          low: this.arrayCandles[candle].low
        })

        if (this.arrayCandles[candle].close != undefined) {
          let num = i + 1;
          // console.log(num + "--------------------------------");
          // console.log("timestamp-->", arrayCandles[candle].timestamp);
          // console.log("open------->",arrayCandles[candle].open);
          // console.log("close------>",arrayCandles[candle].close);
          // console.log("min-------->",arrayCandles[candle].min);
          // console.log("max-------->",arrayCandles[candle].max);
          let low_value = this.arrayCandles[candle].min;
          let high_value = this.arrayCandles[candle].max;
          let close_value = this.arrayCandles[candle].close;
          let open_value = this.arrayCandles[candle].open;
          if (iSAR >= this.resultSAR.begIndex) {
            var SAR_value = this.resultSAR.outReal[iSAR - 1];
            var prev_iSAR = iSAR - 2;
            var prev_SAR_value = this.resultSAR.outReal[prev_iSAR];
          }
          if (traceLevel == "debug") {
            console.log("prev_SAR_value: " + prev_SAR_value);
          }

          //first time prev_status_SAR is 0.
          if (this.resultSAR.begIndex > i) //no values for PSAR, calculate O-C
          {
            if (open_value - close_value < 0) {
              status_SAR = -1;
            } else {
              status_SAR = 1;
            }
          } else {
            if ((parseFloat(prev_SAR_value) <= parseFloat(close_value) &&
                parseFloat(prev_SAR_value) >= parseFloat(open_value)) ||
              (parseFloat(prev_SAR_value) >= parseFloat(close_value) &&
                parseFloat(prev_SAR_value) <= parseFloat(open_value))
            ) {
              status_SAR = status_SAR * -1;
            }
          }

          if (i > this.EMA_min.begIndex) {
            //        console.log("ema(10)---->", vectEma_10[j]);
            //        console.log("ema(20)---->", vectEma_20[k]);
            j++;
          }
          if (i > this.EMA_mid.begIndex) {
            k++;
          }
          if (i >= this.EMA_max.begIndex) {
            //        console.log("ema(100)--->", vectEma_100[l]);
            if (i > this.EMA_max.begIndex) {
              l++;
            }
            if (this.vectEma_Min[j] > this.vectEma_Mid[k] && this.vectEma_Min[j] > this.vectEma_Max[l]) {
              status = 1; //over
            } else if (this.vectEma_Min[j] < this.vectEma_Mid[k] && this.vectEma_Min[j] < this.vectEma_Max[l]) {
              status = -1; //under
            }

            if (prev_status_SAR != status_SAR) {
              let mySignal = new Signal("SAR")

              if (prev_status_SAR > status_SAR) {
                mySignal.setType("BUY")
                //console.log("SAR ALARM--> Buy at " + close_value);
              } else if (prev_status_SAR < status_SAR) {
                mySignal.setType("SELL")
                //console.log("SAR ALARM--> Sell at " + close_value);
              }
              mySignal.setCandle(myCandle)
              this.signals.push(mySignal)
              mySignal = null;
              //console.log(num + "--------------------------------");
              // console.log("timestamp-->", new Date(Date.parse(this.arrayCandles[candle].timestamp)).toLocaleString('ca-ES', 'europe/Frankfurt'));
              // // /console.log("timestamp-->", arrayCandles[candle].timestamp);
              // console.log("open------->", open_value);
              // console.log("close------>", close_value);
              // console.log("min-------->", low_value);
              // console.log("max-------->", high_value);
              // console.log("ema(" + this.EMA_min.period + ")---->", this.vectEma_Min[j]);
              // console.log("ema(" + this.EMA_mid.period + ")---->", this.vectEma_Mid[k]);
              // console.log("ema(" + this.EMA_max.period + ")--->", this.vectEma_Max[l]);
              // console.log("PSAR------->", SAR_value);
              // console.log("PSAR status-------->", (status_SAR < 0 ? "Ascending" : status_SAR > 0 ? "Descending" : "Init"));
              // console.log("PSAR prev_status--->", (prev_status_SAR < 0 ? "Ascending" : prev_status_SAR > 0 ? "Descending" : "Init"));
            }

            //console.log(prev_status + "," + status);
            if (prev_status != 0 && prev_status != status) {
              mySignal = new Signal("EMA")
              if (status > 0) {
                mySignal.setType("BUY")
                //console.log("EMA ALARM--> Buy at " + close_value);
              } else {
                mySignal.setType("SELL")
                //console.log("EMA ALARM--> Sell at " + close_value);
              }
              mySignal.setCandle(myCandle)
              this.signals.push(mySignal)
              mySignal = null;

              // console.log(num + "--------------------------------");
              // console.log("timestamp-->", new Date(Date.parse(this.arrayCandles[candle].timestamp)).toLocaleString('ca-ES', 'europe/Frankfurt'));
              // // /console.log("timestamp-->", arrayCandles[candle].timestamp);
              // console.log("open------->", open_value);
              // console.log("close------>", close_value);
              // console.log("min-------->", low_value);
              // console.log("max-------->", high_value);
              // console.log("ema(" + this.EMA_min.period + ")---->", this.vectEma_Min[j]);
              // console.log("ema(" + this.EMA_mid.period + ")---->", this.vectEma_Mid[k]);
              // console.log("ema(" + this.EMA_max.period + ")--->", this.vectEma_Max[l]);
              // console.log("PSAR------->", SAR_value);
              // console.log("PSAR status-------->", (status_SAR < 0 ? "Ascending" : status_SAR > 0 ? "Descending" : "Init"));
              // console.log("PSAR prev_status--->", (prev_status_SAR < 0 ? "Ascending" : prev_status_SAR > 0 ? "Descending" : "Init"));

            } else {
              if (traceLevel == "all") {
                // console.log(num + "--------------------------------");
                // console.log("timestamp-->", new Date(Date.parse(this.arrayCandles[candle].timestamp)).toLocaleString('ca-ES', 'europe/Frankfurt'));
                // // /console.log("timestamp-->", arrayCandles[candle].timestamp);
                // console.log("open------->", open_value);
                // console.log("close------>", close_value);
                // console.log("min-------->", low_value);
                // console.log("max-------->", high_value);
                // console.log("ema(" + this.EMA_min.period + ")---->", this.vectEma_Min[j]);
                // console.log("ema(" + this.EMA_mid.period + ")---->", this.vectEma_Mid[k]);
                // console.log("ema(" + this.EMA_max.period + ")--->", this.vectEma_Max[l]);
                // console.log("PSAR------->", SAR_value);
                // console.log("PSAR st---->", status_SAR);
                // console.log("PSAR status-------->", (status_SAR < 0 ? "Ascending" : status_SAR > 0 ? "Descending" : "Init"));
                // console.log("PSAR prev_status--->", (prev_status_SAR < 0 ? "Ascending" : prev_status_SAR > 0 ? "Descending" : "Init"));
              }
            }

          } else {
            if (traceLevel == "all") {
              // console.log(num + "--------------------------------");
              // console.log("timestamp-->", new Date(Date.parse(this.arrayCandles[candle].timestamp)).toLocaleString('ca-ES', 'europe/Frankfurt'));
              // // /console.log("timestamp-->", arrayCandles[candle].timestamp);
              // console.log("open------->", open_value);
              // console.log("close------>", close_value);
              // console.log("min-------->", low_value);
              // console.log("max-------->", high_value);
              // console.log("ema(" + this.EMA_min.period + ")---->", this.vectEma_Min[j]);
              // console.log("ema(" + this.EMA_mid.period + ")---->", this.vectEma_Mid[k]);
              // console.log("ema(" + this.EMA_max.period + ")--->", this.vectEma_Max[l]);
              // console.log("PSAR------->", SAR_value);
              // console.log("PSAR st---->", status_SAR);
              // console.log("PSAR status-------->", (status_SAR < 0 ? "Ascending" : status_SAR > 0 ? "Descending" : "Init"));
              // console.log("PSAR prev_status--->", (prev_status_SAR < 0 ? "Ascending" : prev_status_SAR > 0 ? "Descending" : "Init"));
            }
          }

        }
        prev_status = status;
        prev_status_SAR = status_SAR;
        i++;
        iSAR++;
      }
    //end copy
  } else {
    console.log("Not enough info from indicators")
  }
  // /console.log(this.signals);

  return this.signals
}

}

module.exports = new TripleEMA_SAR()
