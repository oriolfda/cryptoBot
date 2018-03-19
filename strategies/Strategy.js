const util = require("../core/util")
var dirs = util.dirs()
const Signal = require(dirs.core + "Signal.js")

function Strategy() {
  this.signals = new Array()
  this.params = null
  this.indicators = new Array()

  Strategy.prototype.createStrategy = async function(params) {
    let myStrategy = require(dirs.strategies + params.name + ".js")
    this.name = params.name
    this.params = params
    await myStrategy.init(params)
    let executedStrategy = await myStrategy.execute(params)
    this. indicators = executedStrategy.indicators
    this.signals = executedStrategy.signals
    //this.id = Indicator.createID(params)
  }

  Strategy.prototype.clone = async function() {
    let cloneStrategy = new Strategy()
    await cloneStrategy.createStrategy(this.params)
    return cloneStrategy
  }

  Strategy.prototype.setParams = function(params){
    this.params = params
  }

}

module.exports = new Strategy()
