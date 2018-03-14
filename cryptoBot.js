// Main bot script
const util = require(__dirname + "/core/util");
var dirs = util.dirs()
//const marketWatcher = require(dirs.core + "marketWatcher");
const Watcher = require(dirs.core + "Watcher.js")
const asyncHandler = require('express-async-handler')
const ejs = require('ejs')

var express = require('express');
var app = express();
var path = require('path');

var bodyParser = require('body-parser');
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies
app.use(express.static(path.join(__dirname, 'views')))
app.set('view engine', 'ejs');

app.get('/', function(req, res) {
  //res.send('Hello World');
  res.sendFile(path.join(dirs.ui + '/index.html'));
})

app.post('/createStrategy', asyncHandler(async (req, res ) => {
  let emaMin = req.body.EMA_min
  let emaMid = req.body.EMA_mid
  let emaMax = req.body.EMA_max
  await Watcher.init(req.body.exchange, req.body.pair, req.body.limit, req.body.period)
  await Watcher.startWatching()
  var params = {
    name: "TripleEMA_SAR",
    EMAMin: emaMin,
    EMAMid: emaMid,
    EMAMax: emaMax,
    marketData: Watcher.marketData,
    arrayCandles: Watcher.arrayCandles
  }

  await Watcher.addStrategy(params)
//  console.log(Watcher);
//res.sendFile(path.join(dirs.ui + '/market.html'))
  res.render('marketCanvas', {watcher: Watcher})
//  console.log(Watcher.arrayCandles);
// /  res.send(Watcher.strategies[0].signals);
}))

  var server = app.listen(8081, function() {
  var host = server.address().address
  var port = server.address().port
  console.log("CryptoBot listening at http://%s:%s", host, port)
})


//generate marketData for hitbtc
async function main() {
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
  for (let i = 0; i < Watcher.indicators.length; i++) {
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

//main()

//marketData.then(console.log("Log-->main bot. Then." + marketData));
