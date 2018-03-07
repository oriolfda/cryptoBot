// Hitbtc Exchange connection

//const request = require("../../node_modules/request");
const request = require("request");
const gauss = require("gauss");
const talib = require("talib");

var marketData = new gauss.Vector();
var vectClose = new gauss.Vector();
var vectOpen = new gauss.Vector();
var vectLow = new gauss.Vector();
var vectHigh = new gauss.Vector();
var vectVolume = new gauss.Vector();
var traceLevel = "none";

var emaMin = 10;
var emaMid = 25;
var emaMax = 45;

var symbol = "XMRBTC";
var limit = 1000;
var period = "H1";

//vectors & objects for EMA Talib indicators
var vectEma_Min = new gauss.Vector();
var vectEma_Mid = new gauss.Vector();
var vectEma_Max = new gauss.Vector();
var resultEma_Min;
var resultEma_Mid;
var resultEma_Max;

//vectors & objects for Parabolic SAR (SAR) indicator
var resultSAR;

var status = 0;
var prev_status = 0;

//status_SAR values:
//0 - initial | change SAR
//1 - SAR greater than HIGH
//-1 - SAR lower than LOW
var status_SAR = 0;
var prev_status_SAR = 0;

var urlAPI_base = "https://api.hitbtc.com/api/2";
var API_candles = "/public/candles/";

//getCandles
// symbol --> pair to get candles for
// limit  --> number of candles to get
// period --> time between candles
var getCandles = function(symbol, limit, period, callbackCandles) {

  //Defaults values for limit & period
  if (!limit) {
    limit = "100";
  }
  if (!period) {
    period = "M30";
  }

  var urlRequest = urlAPI_base + API_candles +
    symbol +
    "?limit=" + limit +
    "&period=" + period;

  console.log('getCandles; url: ', urlRequest);

  request({
    url: urlRequest,
    json: true,
  }, function(error, response, body) {
    if (!error && response.statusCode === 200) {
      callbackCandles(body);
    }
  })
};

var callbackCandles = function(arrayCandles) {
  console.log("\n");
  console.log("symbol:" + symbol + ", period: " + period);

  for (candle in arrayCandles) {
    if (arrayCandles[candle].close != undefined) {
      vectClose.push(parseFloat(arrayCandles[candle].close));
      vectOpen.push(parseFloat(arrayCandles[candle].open));
      vectLow.push(parseFloat(arrayCandles[candle].min));
      vectHigh.push(parseFloat(arrayCandles[candle].max));
      vectVolume.push(parseFloat(arrayCandles[candle].volume));
    }
  };
  //Use Talib instead of Gauss due to indicators available
  // vectEma_Min = calculateEMA(vectClose, emaMin);
  // vectEma_Mid = calculateEMA(vectClose, emaMid);
  // vectEma_Max = calculateEMA(vectClose, emaMax);

  //marketData object for Talib functions
  marketData = {
    open: vectOpen,
    close: vectClose,
    high: vectHigh,
    low: vectLow,
    volume: vectVolume

    return marketData;
  };
  // var function_desc = talib.explain("SAR");
  // console.dir(function_desc);

  //execute EMA with talib module. Explanation of EMA function
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

  //ema_min indicator
  talib.execute({
    name: "EMA",
    startIdx: 0,
    endIdx: marketData.close.length - 1,
    inReal: marketData.close,
    optInTimePeriod: emaMin
  }, function(err, result) {
    if (result) {
      resultEma_Min = result;
      vectEma_Min = resultEma_Min.result.outReal;
      createAlerts();
    }
  });

  //ema_mid indicator
  talib.execute({
    name: "EMA",
    startIdx: 0,
    endIdx: marketData.close.length - 1,
    inReal: marketData.close,
    optInTimePeriod: emaMid
  }, function(err, result) {
    if (result) {
      resultEma_Mid = result;
      vectEma_Mid = resultEma_Mid.result.outReal;
      createAlerts();
    }
  });

  //ema_max indicator
  talib.execute({
    name: "EMA",
    startIdx: 0,
    endIdx: marketData.close.length - 1,
    inReal: marketData.close,
    optInTimePeriod: emaMax
  }, function(err, result) {
    if (result) {
      resultEma_Max = result;
      vectEma_Max = resultEma_Max.result.outReal;
      createAlerts();
    }
  });

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
  talib.execute({
    name: "SAR",
    startIdx: 0,
    endIdx: marketData.close.length - 1,
    high: marketData.high,
    low: marketData.low,
    inPriceHL: marketData.close,
    optInAcceleration: 0.02,
    optInMaximum: 0.2
  }, function(err, result) {
    if (err) {
      console.log(err);
    } else {
      resultSAR = result;
      createAlerts();
    }
    //  }
  });

  var createAlerts = function() {
    if (vectEma_Min &&
      vectEma_Mid &&
      vectEma_Max &&
      resultSAR) {

      // /console.log(vectEma_Min);
      var i = 0; // arrayCandles
      var j = 0; //vectEma_Min
      var k = 0; //vectEma_Mid
      var l = 0; //vectEma_Max
      var iSAR = 0; //resultSAR
      var firstSAR = true;

      for (candle in arrayCandles) {
        if (arrayCandles[candle].close != undefined) {
          var num = i + 1;
          // console.log(num + "--------------------------------");
          // console.log("timestamp-->", arrayCandles[candle].timestamp);
          // console.log("open------->",arrayCandles[candle].open);
          // console.log("close------>",arrayCandles[candle].close);
          // console.log("min-------->",arrayCandles[candle].min);
          // console.log("max-------->",arrayCandles[candle].max);
          var low_value = arrayCandles[candle].min;
          var high_value = arrayCandles[candle].max;
          var close_value = arrayCandles[candle].close;
          var open_value = arrayCandles[candle].open;
          if (iSAR >=  resultSAR.begIndex)
          {
            var SAR_value = resultSAR.result.outReal[iSAR-1];
            var prev_iSAR = iSAR - 2;
            var prev_SAR_value = resultSAR.result.outReal[prev_iSAR];
          }
          if (traceLevel=="debug")
          {
            console.log("prev_SAR_value: " + prev_SAR_value);
          }

          //first time prev_status_SAR is 0.
          if (resultSAR.begIndex > i) //no values for PSAR, calculate O-C
          {
            if (open_value - close_value < 0) {
              status_SAR = -1;
            }else{
              status_SAR = 1;
            }
            console.log("Firstime: " + status_SAR);
          }else
          {
            if ((parseFloat(prev_SAR_value) <= parseFloat(close_value) &&
              parseFloat(prev_SAR_value) >= parseFloat(open_value)) ||
              (parseFloat(prev_SAR_value) >= parseFloat(close_value) &&
                parseFloat(prev_SAR_value) <= parseFloat(open_value))
            ) {
              status_SAR = status_SAR * -1;
            }

          //   firstSAR = false;
          // }else{
          //   if (parseFloat(prev_SAR_value) < parseFloat(close_value) && prev_status_SAR > 0)
          //   {
          //     status_SAR = -1;
          //   }
          //   if (parseFloat(prev_SAR_value) > parseFloat(close_value) && prev_status_SAR < 0)
          //   {
          //     status_SAR = 1;
          //   }
          // else{ //SAR is touching price. Change.
          //   status_SAR = 0;
          // }
          }

          if (i > resultEma_Min.begIndex) {
            //        console.log("ema(10)---->", vectEma_10[j]);
            //        console.log("ema(20)---->", vectEma_20[k]);
            j++;
          }
          if (i > resultEma_Mid.begIndex) {
            k++;
          }
          if (i >= resultEma_Max.begIndex) {
            //        console.log("ema(100)--->", vectEma_100[l]);
            if (i > resultEma_Max.begIndex) {
              l++;
            }
            if (vectEma_Min[j] > vectEma_Mid[k] && vectEma_Min[j] > vectEma_Max[l]) {
              status = 1; //over
            } else if (vectEma_Min[j] < vectEma_Mid[k] && vectEma_Min[j] < vectEma_Max[l]) {
              status = -1; //under
            }

            if (prev_status_SAR != status_SAR)
            {
              console.log("\n");
              if (prev_status_SAR > status_SAR)
              {
                console.log("SAR ALARM--> Buy at " + close_value);
              }else if (prev_status_SAR < status_SAR)
              {
                console.log("SAR ALARM--> Sell at " + close_value);
              }
              console.log(num + "--------------------------------");
              console.log("timestamp-->", new Date(Date.parse(arrayCandles[candle].timestamp)).toLocaleString('ca-ES', 'europe/Frankfurt'));
              // /console.log("timestamp-->", arrayCandles[candle].timestamp);
              console.log("open------->", open_value);
              console.log("close------>", close_value);
              console.log("min-------->", low_value);
              console.log("max-------->", high_value);
              console.log("ema(" + emaMin + ")---->", vectEma_Min[j]);
              console.log("ema(" + emaMid + ")---->", vectEma_Mid[k]);
              console.log("ema(" + emaMax + ")--->", vectEma_Max[l]);
              console.log("PSAR------->", SAR_value);
              console.log("PSAR status-------->", (status_SAR < 0 ? "Ascending" : status_SAR > 0 ? "Descending" : "Init"));
              console.log("PSAR prev_status--->", (prev_status_SAR < 0 ? "Ascending" : prev_status_SAR > 0 ? "Descending" : "Init"));
            }

            //console.log(prev_status + "," + status);
            if (prev_status != 0 && prev_status != status) {
              console.log("\n");
              if (status > 0) {
                console.log("EMA ALARM--> Buy at " + close_value);
              } else {
                console.log("EMA ALARM--> Sell at " + close_value);
              }
              console.log(num + "--------------------------------");
              console.log("timestamp-->", new Date(Date.parse(arrayCandles[candle].timestamp)).toLocaleString('ca-ES', 'europe/Frankfurt'));
              // /console.log("timestamp-->", arrayCandles[candle].timestamp);
              console.log("open------->", open_value);
              console.log("close------>", close_value);
              console.log("min-------->", low_value);
              console.log("max-------->", high_value);
              console.log("ema(" + emaMin + ")---->", vectEma_Min[j]);
              console.log("ema(" + emaMid + ")---->", vectEma_Mid[k]);
              console.log("ema(" + emaMax + ")--->", vectEma_Max[l]);
              console.log("PSAR------->", SAR_value);
              console.log("PSAR status-------->", (status_SAR < 0 ? "Ascending" : status_SAR > 0 ? "Descending" : "Init"));
              console.log("PSAR prev_status--->", (prev_status_SAR < 0 ? "Ascending" : prev_status_SAR > 0 ? "Descending" : "Init"));

            } else {
              if (traceLevel == "all") {
                console.log(num + "--------------------------------");
                console.log("timestamp-->", new Date(Date.parse(arrayCandles[candle].timestamp)).toLocaleString('ca-ES', 'europe/Frankfurt'));
                // /console.log("timestamp-->", arrayCandles[candle].timestamp);
                console.log("open------->", open_value);
                console.log("close------>", close_value);
                console.log("min-------->", low_value);
                console.log("max-------->", high_value);
                console.log("ema(" + emaMin + ")---->", vectEma_Min[j]);
                console.log("ema(" + emaMid + ")---->", vectEma_Mid[k]);
                console.log("ema(" + emaMax + ")--->", vectEma_Max[l]);
                console.log("PSAR------->", SAR_value);
                console.log("PSAR st---->", status_SAR);
                console.log("PSAR status-------->", (status_SAR < 0 ? "Ascending" : status_SAR > 0 ? "Descending" : "Init"));
                console.log("PSAR prev_status--->", (prev_status_SAR < 0 ? "Ascending" : prev_status_SAR > 0 ? "Descending" : "Init"));
              }
            }

          }else{
            if (traceLevel == "all") {
              console.log(num + "--------------------------------");
              console.log("timestamp-->", new Date(Date.parse(arrayCandles[candle].timestamp)).toLocaleString('ca-ES', 'europe/Frankfurt'));
              // /console.log("timestamp-->", arrayCandles[candle].timestamp);
              console.log("open------->", open_value);
              console.log("close------>", close_value);
              console.log("min-------->", low_value);
              console.log("max-------->", high_value);
              console.log("ema(" + emaMin + ")---->", vectEma_Min[j]);
              console.log("ema(" + emaMid + ")---->", vectEma_Mid[k]);
              console.log("ema(" + emaMax + ")--->", vectEma_Max[l]);
              console.log("PSAR------->", SAR_value);
              console.log("PSAR st---->", status_SAR);
              console.log("PSAR status-------->", (status_SAR < 0 ? "Ascending" : status_SAR > 0 ? "Descending" : "Init"));
              console.log("PSAR prev_status--->", (prev_status_SAR < 0 ? "Ascending" : prev_status_SAR > 0 ? "Descending" : "Init"));
            }
          }

        }
        prev_status = status;
        prev_status_SAR = status_SAR;
        i++;
        iSAR++;
      }
    }
  }; //end createAlerts


}; //end callbackCandles



//Calculate EMA using gauss module
var calculateEMA = function(vect, periods) {
  return vect.ema(periods);
};

getCandles(symbol, limit, period, callbackCandles);

var getMarketData = function(symbolo, limit, period)
{
    return this.getCandles(symbol, limit, period, callbackCandles);
}

module exports = getMarketData;
