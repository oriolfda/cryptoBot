const util = require("../core/util")
var dirs = util.dirs()
const Indicator = require(dirs.indicators + "Indicator.js")

Function Strategy() {
  this.indicators = new Array()

  Strategy.prototype.addIndicator = async function(name, period){
    let myIndicator = Indicator

    await myIndicator.setInReal(this.marketData.close)
    await myIndicator.createIndicator(name, period)
    this.indicators.push(myIndicator.clone())
  }

}

module.exports = new Strategy()
