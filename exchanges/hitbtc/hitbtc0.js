// Hitbtc Exchange connection

//const request = require("../../node_modules/request");
const request = require("async-request");
const gauss = require("gauss");
const talib = require("talib");

// /var marketData = new gauss.Vector();
var vectClose = new gauss.Vector();
var vectOpen = new gauss.Vector();
var vectLow = new gauss.Vector();
var vectHigh = new gauss.Vector();
var vectVolume = new gauss.Vector();

var urlAPI_base = "https://api.hitbtc.com/api/2";
var API_candles = "/public/candles/";

var returnMarket = function(arrayCandles)
{
  for (candle in arrayCandles) {
  if (arrayCandles[candle].close != undefined) {
      vectClose.push(parseFloat(arrayCandles[candle].close));
      vectOpen.push(parseFloat(arrayCandles[candle].open));
      vectLow.push(parseFloat(arrayCandles[candle].min));
      vectHigh.push(parseFloat(arrayCandles[candle].max));
      vectVolume.push(parseFloat(arrayCandles[candle].volume));
   }
  };

  //marketData object for Talib functions
  marketData = {
    open: vectOpen,
    close: vectClose,
    high: vectHigh,
    low: vectLow,
    volume: vectVolume
  };
  return marketData;
}

var responseHitbtc = function(error, response, body,) {
  if (!error && response.statusCode === 200) {
    console.log("Log-->response 200");
    //callbackCandles(body);
    return body;

  } else {
    console.log("Log-->hitbtc. Error");
    console.log(error);
  }
}

//getCandles
// symbol --> pair to get candles for
// limit  --> number of candles to get
var getCandles = async function(symbol, limit, period, callbackCandles) {
  //Defaults values for limit & period
  if (!limit) {
    limit = "100";
  }
  if (!period) {
    period = "M30";
  }

  var urlRequest = urlAPI_base + API_candles + symbol +
    "?limit=" + limit +
    "&period=" + period;

  console.log("Log-->hitbtc.getCandles; url: ", urlRequest);

//  request = request.defaults({headers: {json: 'true'}});
//  request.defaults();
  //var response =  await request(urlRequest, {headers: {'Content-Type': 'json'}});
  var response =  await request(urlRequest);
  //return response.body;
  return JSON.parse(response.body);

//

  // request({
  //   url: urlRequest,
  //   json: true,
  // }, await function(error, response, body) {
  //   if (!error && response.statusCode === 200) {
  //     console.log("Log-->response 200");
  //     //callbackCandles(body);
  //     return body;
  //
  //   } else {
  //     console.log("Log-->hitbtc. Error");
  //     console.log(error);
  //   }
  // })
};

var getMarketData = async function(symbol, limit, period) {
  console.log("Log-->hitbtc.getMarketData(), symbol: " + symbol +
    ", limit: " + limit + ", period: " + period);
  var arrayCandles = await getCandles(symbol, limit, period);
  //return marketData;
  //callbackMarketData(marketData);
}

//getCandles(symbol, limit, period, callbackCandles);

//getMarketData(symbol, limit, period);

module.exports.getMarketData = returnMarket;
module.exports.getCandles = getCandles;
