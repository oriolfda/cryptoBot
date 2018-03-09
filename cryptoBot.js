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
//
  console.log(Watcher.indicators[0]);
//  console.log(Watcher.marketData)


}

main()

//marketData.then(console.log("Log-->main bot. Then." + marketData));
