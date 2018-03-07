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

var emaMin = 14;
var emaMid = 50;
var emaMax = 200;

var symbol = "XMRBTC";
var limit = 1000;
var period = "H1";

var vectEma_Min = new gauss.Vector();
var vectEma_Mid = new gauss.Vector();
var vectEma_Max = new gauss.Vector();

//test talib
var vectEma_Min2 = new gauss.Vector();
var vectEma_Mid2 = new gauss.Vector();
var vectEma_Max2 = new gauss.Vector();

var status = 0;
var prev_status = 0;


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
      //console.log(body[0].open); // Print the json response
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
  //  console.log(vectClose);
  //  console.log(calculateEMA(vectClose,10));
  vectEma_Min = calculateEMA(vectClose, emaMin);
  vectEma_Mid = calculateEMA(vectClose, emaMid);
  vectEma_Max = calculateEMA(vectClose, emaMax);

  marketData = {
    open: vectOpen,
    close: vectClose,
    high: vectHigh,
    low: vectLow,
    volume: vectVolume
  };

  //console.log(marketData);

  // var function_desc = talib.explain("EMA");
  // console.dir(function_desc);

  //execute EMA with talib module
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

  //ema_min
  talib.execute({
    name: "EMA",
    startIdx: 0,
    endIdx: marketData.close.length - 1,
    inReal: marketData.close,
    optInTimePeriod: emaMin
  }, function (err, result) {
    if(result)
    {
      vectEma_Min2 = result.result.outReal;
    }
  });

  //ema_mid
  talib.execute({
    name: "EMA",
    startIdx: 0,
    endIdx: marketData.close.length - 1,
    inReal: marketData.close,
    optInTimePeriod: emaMid
  }, function (err, result) {
    if(result)
    {
      vectEma_Mid2 = result.result.outReal;
    }
  });

  //ema_max
  talib.execute({
    name: "EMA",
    startIdx: 0,
    endIdx: marketData.close.length - 1,
    inReal: marketData.close,
    optInTimePeriod: emaMax
}, function (err, result) {
    if(result)
    {
      vectEma_Max2 = result.result.outReal;
    }
});

console.log('Max: ' + vectEma_Max.length + ',' + vectEma_Max2.length);

  //  console.log(vectEma_10);

  var i = 0;
  var j = 0;
  var k = 0;
  var l = 0;

  for (candle in arrayCandles) {
    if (arrayCandles[candle].close != undefined) {
      var num = i + 1;
      // console.log(num + "--------------------------------");
      // console.log("timestamp-->", arrayCandles[candle].timestamp);
      // console.log("open------->",arrayCandles[candle].open);
      // console.log("close------>",arrayCandles[candle].close);
      // console.log("min-------->",arrayCandles[candle].min);
      // console.log("max-------->",arrayCandles[candle].max);
      if (i >= emaMin - 1) {
        //        console.log("ema(10)---->", vectEma_10[j]);
        //        console.log("ema(20)---->", vectEma_20[k]);
        j++;
      }
      if (i >= emaMid - 1) {
        k++;
      }
      if (i >= emaMax - 1) {
        //        console.log("ema(100)--->", vectEma_100[l]);
        l++;
        if (vectEma_Min[j] > vectEma_Mid[k] && vectEma_Min[j] > vectEma_Max[l]) {
          status = 1; //over
        } else if (vectEma_Min[j] < vectEma_Mid[k] && vectEma_Min[j] < vectEma_Max[l]) {
          status = -1; //under
        }
        //console.log(prev_status + "," + status);
        if (prev_status != 0 && prev_status != status) {
          console.log("\n");
          if (status > 0) {
            console.log("ALARM--> Buy at " + arrayCandles[candle].close);
          } else {
            console.log("ALARM--> Sell at " + arrayCandles[candle].close);
          }
          console.log(num + "--------------------------------");
          console.log("timestamp-->", new Date(Date.parse(arrayCandles[candle].timestamp)).toLocaleString('ca-ES', 'europe/Frankfurt'));
          // /console.log("timestamp-->", arrayCandles[candle].timestamp);
          console.log("open------->", arrayCandles[candle].open);
          console.log("close------>", arrayCandles[candle].close);
          console.log("min-------->", arrayCandles[candle].min);
          console.log("max-------->", arrayCandles[candle].max);
          console.log("ema(" + emaMin + ")---->", vectEma_Min[j]);
          console.log("ema(" + emaMid + ")---->", vectEma_Mid[k]);
          console.log("ema(" + emaMax + ")--->", vectEma_Max[l]);
        }

      }
    }
    prev_status = status;
    i++;
  }
};

//Calculate EMA using gauss module
var calculateEMA = function(vect, periods) {
  return vect.ema(periods);
};

getCandles(symbol, limit, period, callbackCandles);
