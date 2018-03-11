const util = require("../core/util")
var dirs = util.dirs()
const Hitbtc = require(dirs.exchanges + "hitbtc/Hitbtc.js")

function Exchange(exchange) {

  switch (exchange) {
    case "Hitbtc":
      this.exchange = Hitbtc
      break
  }

  Exchange.prototype.getExchange = function() {
    return this.exchange
  }

  Exchange.prototype.setExchange = function(exchange) {
    switch (exchange) {
      case "Hitbtc":
        this.exchange = Hitbtc
        break
    }
  }
}

module.exports = new Exchange()
