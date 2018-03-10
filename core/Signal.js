const util = require("../core/util")
var dirs = util.dirs()

function Signal(from){
  this.type = null
  this.from = from
  this.candle = null

  Signal.prototype.setType = function(type){
    this.type = type
  }

  Signal.prototype.getType = function(){
    return this.type
  }

  Signal.prototype.setCandle = function(candle){
    this.candle = candle
  }

  Signal.prototype.getCandle = function(){
    return this.candle
  }

}

module.exports = Signal
