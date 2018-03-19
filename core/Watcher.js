const util = require("../core/util")
var dirs = util.dirs()
const Exchange = require(dirs.exchanges + "Exchange.js")
const Indicator = require(dirs.indicators + "Indicator.js")
const Strategy = require(dirs.strategies + "Strategy.js")

function Watcher(exchange, pair, limit, period){
  Exchange.setExchange(exchange)
  this.exchange = Exchange.getExchange(exchange)
  this.pair = pair
  this.limit = limit
  this.period = period

  //array of indicators and strategies
  this.indicators = new Array()
  this.strategies = new Array()
  this.arrayCandles = new Array()
  this.marketData = new Array()

  Watcher.prototype.setMarketData = function(marketData){
    this.marketData = marketData
  }

  Watcher.prototype.getMarketData = async function(){
    this.arrayCandles = await this.exchange.getCandles(this.pair, this.limit, this.period)
    this.marketData = new Array()
    this.marketData = await this.exchange.getMarketData(this.arrayCandles)
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
    this.indicators = new Array()
    this.strategies = new Array()
    this.arrayCandles = new Array()
    this.marketData = new Array()    
  }

  Watcher.prototype.addIndicator = async function(params){
    await Indicator.setParams(params)
    let myIndicator = await Indicator.clone()
    //await myIndicator.createIndicator(params)
    this.indicators.push(myIndicator)
  }

  Watcher.prototype.addStrategy = async function(params){
    await Strategy.setParams(params)
    let myStrategy = await Strategy.clone()
    //await myStrategy.createStrategy(params)

    await this.strategies.push(myStrategy)
  }

}

module.exports = new Watcher();
