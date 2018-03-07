const util = require("../core/util")

var dirs = util.dirs()

function Indicator() {
  this.id = null
  this.name = null
  this.result = null //array of results of prices for the created indicator
  this.params = null

  Indicator.prototype.createIndicator = function(params){
    const indicator = require(dirs.indicators + params.name + ".js")
    this.name = params.name
    this.params = params
    this.result = indicator.calculate(params)
    this.id = indicator.createID(params)
  }

}

module.exports = new Indicator()
