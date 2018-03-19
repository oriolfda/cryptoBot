const util = require("../core/util")

var dirs = util.dirs()

function Indicator() {
  this.id = null
  this.name = null
  this.result = null //array of results of prices for the created indicator
  this.params = null

  Indicator.prototype.createIndicator = async function(params){
    let indicator = require(dirs.indicators + params.name + ".js")
    this.name = params.name
    this.params = params
    this.result = await indicator.calculate(params)
    this.id = await indicator.createID(params)
  }

  Indicator.prototype.clone = function(){
    let cloneIndicator = new Indicator()
    cloneIndicator.createIndicator(this.params)
    return cloneIndicator
  }

  Indicator.prototype.setParams = function(params){
    this.name = params.name
    this.params = params
  }

}

module.exports = new Indicator()
