const util = require("../core/util")
var dirs = util.dirs()

function Candle(candle){
  this.timestamp = candle.timestamp
  this.open = candle.open
  this.close = candle.close
  this.high = candle.max
  this.low = candle.min
  this.type = (this.open > this.close ? "UP" : "DOWN")
}

module.exports = Candle
