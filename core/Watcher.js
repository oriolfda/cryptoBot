const util = require("../core/util")
var dirs = util.dirs()
const Exchange = require(dirs.exchanges + "Exchange.js")
const Indicator = require(dirs.indicators + "Indicator.js")

function Watcher(exchange, pair, limit, period){
  Exchange.setExchange(exchange)
  this.exchange = Exchange.getExchange(exchange)
  this.pair = pair
  this.limit = limit
  this.period = period

  //array of indicators and strategies
  this.indicators = new Array()
  this.strategies = new Array()
  this.candles = new Array()
  this.marketData = new Array()

  Watcher.prototype.addIndicator = function(indicator){
    this.indicators.push(indicator)
  }

  Watcher.prototype.addStrategie = function(strategie){
    this.strategies.push(strategie)
  }

  Watcher.prototype.setMarketData = function(marketData){
    this.marketData = marketData
  }

  Watcher.prototype.getMarketData = async function(){
    this.candles = await this.exchange.getCandles(this.pair, this.limit, this.period)
    this.marketData = await this.exchange.getMarketData(this.candles)
  }

  Watcher.prototype.startWatching = async function(){
    await this.getMarketData()
  }

  Watcher.prototype.init = async function(exchange, pair, limit, period){
    Exchange.setExchange(exchange)
    this.exchange = Exchange.getExchange()
    this.pair = pair
    this.limit = limit
    this.period = period
  }

  Watcher.prototype.addIndicator = async function(params){
    let myIndicator = Indicator
    await myIndicator.createIndicator(params)
    this.indicators.push(myIndicator)
  }

}

module.exports = new Watcher();
