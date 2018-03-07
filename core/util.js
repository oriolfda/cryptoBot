const hitbtc = require("../exchanges/hitbtc/Hitbtc.js");
const gauss = require("gauss");
const talib = require("talib");

//var marketData = new gauss.Vector();

var util = {
  getMarketData: async function(exchange, symbol, limit, period)
  {
    console.log("Log-->util.getMarketData(), exchange: " + exchange);
    switch (exchange){
      case "hitbtc":
        var arrayCandles = await hitbtc.getCandles(symbol, limit, period);
        var marketData = await hitbtc.getMarketData(arrayCandles);
        return marketData;
      break;
    }
  },
  dirs: function() {
    var ROOT = __dirname + '/../';

    return {
      bot: ROOT,
      core: ROOT + 'core/',
      exchanges: ROOT + 'exchanges/',
      indicators: ROOT + 'indicators/',
    }
  },

  callbackMarketData: function(err, result)
  {
    console.log("Log-->util.callbackMarketData. " + result);
    if (result)
    {
      return result;
    }
  }
}

module.exports = util;
