const util = require("../core/util")
var dirs = util.dirs()
const hitbtc = require(dirs.exchanges + "hitbtc/Hitbtc.js")

function Exchange(exchange) {

  switch (exchange) {
    case "hitbtc":
      this.exchange = hitbtc
      break
  }

  Exchange.prototype.getExchange = function() {
    return this.exchange
  }

  Exchange.prototype.setExchange = function(exchange) {
    switch (exchange) {
      case "hitbtc":
        this.exchange = hitbtc
        break
    }
  }
}

module.exports = new Exchange()
