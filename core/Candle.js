const util = require("../core/util")
var dirs = util.dirs()

function Candle(candle){
  this.timestamp = candle.timestamp
  this.open = candle.open
  this.close = candle.close
  this.high = candle.high
  this.low = candle.low
}

module.exports = Candle
