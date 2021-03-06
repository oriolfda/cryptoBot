// Main bot script
const util = require(__dirname + "/core/util");
var dirs = util.dirs()
//const marketWatcher = require(dirs.core + "marketWatcher");
const Watcher = require(dirs.core + "Watcher.js")

//generate marketData for hitbtc
async function main()
{
//  var marketData = await util.getMarketData("hitbtc", "ETHBTC", 1000, "H1");
//  await marketWatcher.watch(marketData, 10, 20, 45);
  await Watcher.init("hitbtc", "ETHBTC", 1000, "H1")
  await Watcher.startWatching()
  //await Watcher.addIndicator("EMA",14)
  var params = {
    name: "EMA",
    period: 14,
    inReal: Watcher.marketData.close
  }
  await Watcher.addIndicator(params)

  var params = {
    name: "SAR",
    inHight: Watcher.marketData.high,
    inLow: Watcher.marketData.low
  }
  await Watcher.addIndicator(params)
  //console.log(Watcher.indicators[0]);
//
  for (let i=0; i< Watcher.indicators.length; i++){
//    console.log(Watcher.indicators[i]);
  }

  var params = {
    name: "TripleEMA_SAR",
    EMAMin: 14,
    EMAMid: 20,
    EMAMax: 45,
    marketData: Watcher.marketData,
    arrayCandles: Watcher.arrayCandles
  }
  await Watcher.addStrategy(params)
  console.log(Watcher.strategies[0].signals);

//  console.log(Watcher.marketData)


}

main()

//marketData.then(console.log("Log-->main bot. Then." + marketData));
