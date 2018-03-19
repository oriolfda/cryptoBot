/*
 * Copyright (C) 2012 David Geary. This code is from the book
 * Core HTML5 Canvas, published by Prentice-Hall in 2012.
 *
 * License:
 *
 * Permission is hereby granted, free of charge, to any person
 * obtaining a copy of this software and associated documentation files
 * (the "Software"), to deal in the Software without restriction,
 * including without limitation the rights to use, copy, modify, merge,
 * publish, distribute, sublicense, and/or sell copies of the Software,
 * and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * The Software may not be used to create training material of any sort,
 * including courses, books, instructional videos, presentations, etc.
 * without the express written consent of David Geary.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 * OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
 * HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 * WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
 * OTHER DEALINGS IN THE SOFTWARE.
 */

var Watcher;

function setWatcher(watcher) {
  this.Watcher = watcher
}
var previousX
var canvas = document.getElementById('marketCanvas'),
  context = canvas.getContext('2d'),
  canvasY = document.getElementById("scaleY"),
  canvasX = document.getElementById("scaleX"),
  contextY = canvasY.getContext('2d'),
  // contextX = canvasX.getContext('2d'),
  drawingSurfaceImageData, //Guidewires
  divScaleX = document.getElementById("scaleX")

GRID_COLOR = 'gray',
  GRID_STEPX = 100,
  GRID_STEPY = 50,

  AXIS_MARGIN = 0,
  AXIS_ORIGIN = {
    x: AXIS_MARGIN,
    y: canvas.height - AXIS_MARGIN
  },
  AXIS_ORIGIN_X = {
    x: AXIS_MARGIN,
    y: canvasX.height - AXIS_MARGIN
  },
  AXIS_ORIGIN_Y = {
    x: AXIS_MARGIN,
    y: canvasY.height - AXIS_MARGIN
  },

  AXIS_TOP = AXIS_MARGIN,
  AXIS_RIGHT = canvas.width - AXIS_MARGIN,

  HORIZONTAL_TICK_SPACING = 20,
  VERTICAL_TICK_SPACING = 50,

  AXIS_WIDTH = AXIS_RIGHT - AXIS_ORIGIN.x,
  AXIS_HEIGHT = AXIS_ORIGIN.y - AXIS_TOP,

  NUM_VERTICAL_TICKS = parseInt(AXIS_HEIGHT / VERTICAL_TICK_SPACING),
  NUM_HORIZONTAL_TICKS = parseInt(AXIS_WIDTH / HORIZONTAL_TICK_SPACING),

  TICK_WIDTH = 10,
  TICKS_LINEWIDTH = 0.5,
  TICKS_COLOR = 'white',

  AXIS_LINEWIDTH = 1.0,
  AXIS_COLOR = 'white';

var candleIdx = 0
var candlesToShow = new Array()
var totalEMA = 0 //for indicators colors
var EMA_COLOR = new Array("#C80D32", "#A6E1F7", "#B65BDE", "#D9F83F"),
    SAR_COLOR = "white"
var lastPoint = null
var maxValue
var minValue

// Functions..........................................................

document.onkeydown = function(e) {
  if (e.ctrlKey || e.metaKey || e.altKey)
    return;

  if (e.keyCode === 39) { // rights
    e.preventDefault();
    moveRight();
  } else if (e.keyCode === 37) { // left
    e.preventDefault();
    moveLeft();
  }
  if (e.keyCode === 107) { // +
    e.preventDefault();
    HORIZONTAL_TICK_SPACING += 5
    NUM_HORIZONTAL_TICKS = parseInt(AXIS_WIDTH / HORIZONTAL_TICK_SPACING)
    candlesToShow = getCandles(candleIdx)
    drawCandles(candlesToShow)
  }
  let changed = false
  if (e.keyCode === 109) { // -
    e.preventDefault();
    if (HORIZONTAL_TICK_SPACING > 10) {
      HORIZONTAL_TICK_SPACING -= 5
      changed = true
    } else if (HORIZONTAL_TICK_SPACING > 2) {
      HORIZONTAL_TICK_SPACING -= 1
      changed = true
    }
    if (changed) {
      NUM_HORIZONTAL_TICKS = parseInt(AXIS_WIDTH / HORIZONTAL_TICK_SPACING)
      candlesToShow = getCandles(candleIdx)
      drawCandles(candlesToShow)
    }

  }

  saveDrawingSurface();
}

function MyTimestamp() {
  MyTimestamp.prototype.getDate = function(timestamp) {
    return new Date(Date.parse(timestamp))
  }
}

function Candle(candle) {
  this.timestamp = new MyTimestamp().getDate(candle.timestamp)
  this.open = candle.open
  this.close = candle.close
  this.high = candle.high || candle.max
  this.low = candle.low || candle.min
  // if (candle.open > candle.close){
  //   this.type ="UP"
  // }else{
  //   this.type = "DOWN"
  // }
  this.type = (parseFloat(candle.open) > parseFloat(candle.close) ? "DOWN" : parseFloat(candle.open) < parseFloat(candle.close) ? "UP" : "NEUTRAL")
  if (this.type == "UP") {
    this.Top = this.close
    this.Bottom = this.open
  } else {
    this.Top = this.open
    this.Bottom = this.close
  }
}

function drawCandles(candles) {
  var marketDataHigh = Watcher.marketData.high.slice(candleIdx, candleIdx + candles.length)
  var marketDataLow = Watcher.marketData.low.slice(candleIdx, candleIdx + candles.length)
  var marketDataTimes = Watcher.marketData.timestamp.slice(candleIdx, candleIdx + candles.length)

var maxValueIndicators = 0,
    minValueIndicators = 9999999999999

for (let i = 0; i < Watcher.strategies[0].indicators.length; i++){
  let begIndex = Watcher.strategies[0].indicators[i].result.begIndex
  let begin = (candleIdx >= begIndex ? candleIdx - begIndex : 0)
  let outRealShowed = Watcher.strategies[0].indicators[i].result.outReal.slice(begin, begin + candlesToShow.length)
  maxValueIndicators = Math.max(maxValueIndicators, Math.max(...outRealShowed))
  minValueIndicators = Math.min(minValueIndicators, Math.min(...outRealShowed))
}

//Get max value from indicators so they can be showed properly
  // for (let i = 0; i <= candlesToShow.length; i++) {
  //   if (candleIdx < begIndex) {
  //     if (i >= begIndex) {
  //       value = indicator.result.outReal[candleIdx + i - begIndex]
  //     }
  //   } else {
  //     value = indicator.result.outReal[candleIdx + i - begIndex]
  //   }


  var scaleY = 10000
  maxValue = Math.max(...marketDataHigh, maxValueIndicators)
  minValue = Math.min(...marketDataLow, minValueIndicators)
  //  alert(maxValue)
  maxValue = maxValue + (maxValue * 20 / scaleY)
  //  alert(maxValue)
  mimValue = minValue - (minValue * 20 / scaleY)
  // alert(maxValue + "," + minValue)
  var dif = maxValue - minValue
  var stepY = dif / (NUM_VERTICAL_TICKS + 1)
  context.clearRect(AXIS_ORIGIN.x, AXIS_ORIGIN.y, context.canvas.width, context.canvas.height)
  contextY.clearRect(AXIS_ORIGIN_Y.x + 5, AXIS_TOP, canvasY.width - 5, canvasY.height)
  drawGrid()
  //drawAxes()


  scaleY = NUM_VERTICAL_TICKS / stepY

  for (let i = 1; i <= candles.length; i++) {
    //((valor - min) * 100) / (max - min)
    var candle = new Candle(candles[i - 1])

    //alert("canvasH: " + canvas.height + ", candle.Top: " + candle.Top + ", maxValue: " + maxValue + ", minValue: " + minValue + ", dif: " + dif)
    let candleTop = canvas.height - (canvas.height * (((parseFloat(candle.Top) - minValue) * 100) / dif) / 100)
    let candleBottom = canvas.height - (canvas.height * (((parseFloat(candle.Bottom) - minValue) * 100) / dif) / 100)
    let candleHigh = canvas.height - (canvas.height * (((parseFloat(candle.high) - minValue) * 100) / dif) / 100)
    let candleLow = canvas.height - (canvas.height * (((parseFloat(candle.low) - minValue) * 100) / dif) / 100)
    let candleH = candleBottom - candleTop
    let candleW = HORIZONTAL_TICK_SPACING * 0.8
    //alert(candleTop + ", " + candleH)
    //return
    let candleLeft = ((AXIS_ORIGIN_X.x + i) * HORIZONTAL_TICK_SPACING) - (HORIZONTAL_TICK_SPACING / 2 * 0.8)
    // context.beginPath()
    if (candle.type == "UP") {
      context.strokeStyle = "#ccff99"
      context.fillStyle = "#DAF7A6"
    } else if (candle.type == "DOWN") {
      context.strokeStyle = "red"
      context.fillStyle = "#ff4d4d"
    } else if (candle.type == "NEUTRAL") {
      context.strokeStyle = "white"
      context.fillStyle = "gray"
    }


    context.fillRect(
      candleLeft, //top left X
      candleTop, //top left Y
      candleW, //width
      candleH //height
    )

    context.beginPath()
    context.strokeStyle = "white"
    context.moveTo(candleLeft + candleW / 2, candleTop)
    context.lineTo(candleLeft + candleW / 2, candleHigh)
    context.stroke()
    context.moveTo(candleLeft + candleW / 2, candleBottom)
    context.lineTo(candleLeft + candleW / 2, candleLow)
    context.stroke()
  }



  var value = maxValue
  for (let i = 0; i <= canvas.height; i++) {
    contextY.fillStyle = "gray";
    contextY.font = "bold 10px Arial";
//    value = value - stepY
    let placeY = (i == 0 ? 10 : (i * VERTICAL_TICK_SPACING))// - (VERTICAL_TICK_SPACING / 2)
    let factor = placeY / canvas.height * 100
    let price = parseFloat(maxValue  - ((maxValue - minValue) / 100) * factor).toFixed(6)
    contextY.fillText(price, AXIS_ORIGIN_Y.x + 5, placeY);

  }

  //draw indicators
  if (Watcher.indicators) {

  }

  totalEMA = 0

  if (Watcher.strategies[0].indicators) {
    for (indicator in Watcher.strategies[0].indicators) {
      drawIndicator(Watcher.strategies[0].indicators[indicator], maxValue, minValue)
    }
  }


  drawAxes()

  //remove previous times
  while (divScaleX.lastChild) {
    divScaleX.removeChild(divScaleX.lastChild);
  }

  for (let i = 1; i <= NUM_HORIZONTAL_TICKS; i++) {
    var value = marketDataTimes[i - 1]
    var date = new MyTimestamp().getDate(value)
    var year = date.getFullYear()
    var month = date.getMonth()
    var day = date.getDay()
    var hour = date.getHours()
    var minute = date.getMinutes()
    var seconds = date.getSeconds()

    // contextX.fillStyle = "gray";
    // contextX.font = "bold 10px Arial";
    // contextX.fillText(hour + ":" + minute, (i * HORIZONTAL_TICK_SPACING) - (HORIZONTAL_TICK_SPACING / 2), AXIS_TOP + 20);
    let divTime = document.createElement("div")
    divTime.id = "divTime" + i
    divTime.className = "timeX"
    divTime.style.width = HORIZONTAL_TICK_SPACING
    //  divTime.style.left = (i * HORIZONTAL_TICK_SPACING) - (divTime.style.width / 2)
    divTime.style.top = AXIS_TOP + 5
    let txtTime = document.createTextNode(hour + ":" + minute)
    divTime.appendChild(txtTime)
    //contextX.fillText(hour + ":" + minute, (i * HORIZONTAL_TICK_SPACING) - (HORIZONTAL_TICK_SPACING / 2), AXIS_TOP + 20);
    divScaleX.appendChild(divTime)
  }

}


function drawIndicator(indicator, maxValue, minValue) {
  var type = indicator.name
  var begIndex = indicator.result.begIndex
  let value = undefined

  switch (type) {
    case "EMA":
      //if indicator.begIndex
      lastPoint = undefined
      for (let i = 0; i <= candlesToShow.length; i++) {
        if (candleIdx < begIndex) {
          if (i >= begIndex) {
            value = indicator.result.outReal[candleIdx + i - begIndex]
          }
        } else {
          value = indicator.result.outReal[candleIdx + i - begIndex]
        }

        if (typeof value !== 'undefined') {
          let valueX = ((AXIS_ORIGIN_X.x + i) * HORIZONTAL_TICK_SPACING) - (HORIZONTAL_TICK_SPACING / 2 * 0.1)
          let valueY = canvas.height - (canvas.height * (((parseFloat(value) - minValue) * 100) / (maxValue - minValue) / 100))
          context.save()
          context.beginPath()
          context.moveTo(valueX, valueY)

          context.fillStyle = EMA_COLOR[totalEMA]
          context.fillRect(valueX, valueY, HORIZONTAL_TICK_SPACING * 0.1, HORIZONTAL_TICK_SPACING * 0.1)
          context.restore()
          if (typeof lastPoint !== 'undefined'){
            context.save()
            context.beginPath()
            context.strokeStyle = EMA_COLOR[totalEMA]
            context.lineWidth = 1.5;
            context.moveTo(lastPoint.x, lastPoint.y)
            context.lineTo(valueX, valueY)
            context.stroke()
            context.restore()
          }
          lastPoint = {x: valueX, y: valueY}
          //context.stroke()

        }
      }
      totalEMA++
      break
    case "SAR":

      break
  }

}

function getCandles(index) {

  return Watcher.arrayCandles.slice(index, (index + NUM_HORIZONTAL_TICKS - 1))
}

function moveRight() {
  if ((candleIdx + NUM_HORIZONTAL_TICKS - 1) < Watcher.arrayCandles.length) {
    candleIdx += NUM_HORIZONTAL_TICKS - 1
    candlesToShow = getCandles(candleIdx)
    drawCandles(candlesToShow)
  }
}

function moveLeft() {
  if ((candleIdx - NUM_HORIZONTAL_TICKS - 1) >= NUM_HORIZONTAL_TICKS - 1) {
    candleIdx -= NUM_HORIZONTAL_TICKS - 1
    // } else if ((candleIdx - NUM_HORIZONTAL_TICKS - 1) >= 0) {
    //   candleIdx = 0
  } else {
    candleIdx = 0
  }
  candlesToShow = getCandles(candleIdx)
  drawCandles(candlesToShow)
}

function drawGrid() {
  context.save()
  context.fillStyle = 'black';
  context.fillRect(0, 0, context.canvas.width, context.canvas.height);

  context.lineWidth = 0.1;
  context.setLineDash([5]);
  context.strokeStyle = GRID_COLOR;

  for (var i = GRID_STEPX; i < context.canvas.width; i += GRID_STEPX) {
    context.beginPath();
    context.moveTo(i, 0);
    context.lineTo(i, context.canvas.height);
    context.stroke();
  }

  // for (var i = context.canvas.height; i >= AXIS_TOP; i -= GRID_STEPY) {
  //   context.beginPath();
  //   context.moveTo(0, i);
  //   context.lineTo(context.canvas.width, i);
  //   context.stroke();
  // }

  for (var i = 0; i <= context.canvas.height; i += GRID_STEPY) {
    context.beginPath();
    context.moveTo(0, i);
    context.lineTo(context.canvas.width, i);
    context.stroke();
  }


  context.restore();
}

function drawAxes() {
  context.save()
  // contextX.save()
  contextY.save()
  context.strokeStyle = AXIS_COLOR;
  context.lineWidth = AXIS_LINEWIDTH;
  // contextX.strokeStyle = AXIS_COLOR;
  // contextX.lineWidth = AXIS_LINEWIDTH;
  contextY.strokeStyle = AXIS_COLOR;
  contextY.lineWidth = AXIS_LINEWIDTH;

  drawHorizontalAxis();
  drawVerticalAxis();

  // contextX.lineWidth = 0.5;
  // contextX.lineWidth = TICKS_LINEWIDTH;
  // contextX.strokeStyle = TICKS_COLOR;
  contextY.lineWidth = 0.5;
  contextY.lineWidth = TICKS_LINEWIDTH;
  contextY.strokeStyle = TICKS_COLOR;


  drawVerticalAxisTicks();
  drawHorizontalAxisTicks();

  context.restore();
  // contextX.restore();
  contextY.restore();
}

function drawHorizontalAxis() {
  context.beginPath();
  // context.moveTo(AXIS_ORIGIN_X.x, AXIS_TOP + 5);
  // context.lineTo(AXIS_RIGHT + 5, AXIS_TOP + 5)

  context.moveTo(AXIS_ORIGIN_X.x, AXIS_HEIGHT);
  context.lineTo(AXIS_RIGHT + 5, AXIS_HEIGHT)
  context.stroke();
}

function drawVerticalAxis() {
  context.beginPath();
  context.moveTo(AXIS_WIDTH, AXIS_ORIGIN_Y.y);
  context.lineTo(AXIS_WIDTH, AXIS_TOP);
  context.stroke();

  // contextY.beginPath();
  // contextY.moveTo(AXIS_ORIGIN_Y.x + 5, AXIS_ORIGIN_Y.y);
  // contextY.lineTo(AXIS_ORIGIN_Y.x + 5, AXIS_TOP);
  // contextY.stroke();
}

// function drawVerticalAxis() {
//    context.beginPath();
//    //context.moveTo(AXIS_ORIGIN.x, AXIS_ORIGIN.y);
//    context.moveTo(canvasY.width - AXIS_MARGIN, AXIS_ORIGIN.y);
//    //context.lineTo(AXIS_ORIGIN.x, AXIS_TOP);
//    context.lineTo(canvas.width - AXIS_MARGIN, AXIS_TOP);
//    context.stroke();
// }

function drawVerticalAxisTicks() {
  var deltaX;

  for (var i = 0; i <= NUM_VERTICAL_TICKS; ++i) {
    context.beginPath();

    if (i % 5 === 0) deltaX = TICK_WIDTH;
    else deltaX = TICK_WIDTH / 2;

    //      context.moveTo(AXIS_ORIGIN.x - deltaX,
     context.moveTo(AXIS_WIDTH - deltaX,
       AXIS_TOP + (i * VERTICAL_TICK_SPACING));
//    context.moveTo(AXIS_WIDTH - deltaX,
//      AXIS_ORIGIN.y - i * VERTICAL_TICK_SPACING);

    //      context.lineTo(AXIS_ORIGIN.x + deltaX,
    context.lineTo(AXIS_WIDTH + deltaX,
      AXIS_TOP + (i * VERTICAL_TICK_SPACING));

    context.stroke();
  }
}

function drawHorizontalAxisTicks() {
  var deltaY;

  for (var i = 1; i < NUM_HORIZONTAL_TICKS; ++i) {
    context.beginPath();

    if (i % 5 === 0) deltaY = TICK_WIDTH;
    else deltaY = TICK_WIDTH / 2;

    // context.moveTo(AXIS_ORIGIN_X.x + i * HORIZONTAL_TICK_SPACING,
    // AXIS_TOP - deltaY);
    context.moveTo(AXIS_ORIGIN_X.x + i * HORIZONTAL_TICK_SPACING,
      AXIS_HEIGHT - deltaY);

    context.lineTo(AXIS_ORIGIN_X.x + i * HORIZONTAL_TICK_SPACING,
      AXIS_HEIGHT + deltaY);

    context.stroke();
  }
}

// Guidewires.........................................................

// Save and restore drawing surface...................................

function saveDrawingSurface() {
  drawingSurfaceImageData = context.getImageData(0, 0,
    canvas.width,
    canvas.height);
}

function restoreDrawingSurface() {
  context.putImageData(drawingSurfaceImageData, 0, 0);
}


function windowToCanvas(x, y) {
  var bbox = canvas.getBoundingClientRect();
  return {
    x: x - bbox.left * (canvas.width / bbox.width),
    y: y - bbox.top * (canvas.height / bbox.height)
  };
}

function drawHorizontalLine(y) {
  context.beginPath();
  context.moveTo(0, y + 0.5);
  context.lineTo(context.canvas.width, y + 0.5);
  context.stroke();
}

function drawVerticalLine(x) {
  context.save()
  context.beginPath();
  context.fillStyle = "rgba(230,230,230,0.2)"
  context.fillRect(
    Math.round(x / HORIZONTAL_TICK_SPACING) * HORIZONTAL_TICK_SPACING - ((HORIZONTAL_TICK_SPACING / 2) * 0.8),
    0,
    (HORIZONTAL_TICK_SPACING) * 0.8,
    canvas.height
  )
  //context.moveTo(x+0.5,0);
  //context.lineTo(x+0.5,context.canvas.height);
  context.stroke();
  context.restore()
  let candle = new Candle(candlesToShow[(Math.round(x / HORIZONTAL_TICK_SPACING)) - 1])
  showOHLC(candle)
}

function drawGuidewires(x, y) {
  context.save();
  //context.strokeStyle = 'rgba(0,0,230,0.4)';
  context.strokeStyle = 'rgba(230,230,230,0.4)';
  context.lineWidth = 0.5;
  drawVerticalLine(x);
  drawHorizontalLine(y);
  context.restore();
}

canvas.onmousemove = function(e) {
  var loc;
  e.preventDefault(); // prevent selections

  loc = windowToCanvas(e.clientX, e.clientY);

  //updateRubberband(loc);

  restoreDrawingSurface();
  drawGuidewires(loc.x, loc.y);
  drawPrice(loc.y);

  //saveDrawingSurface();

};

function drawPrice(h){
  var mainDiv = document.getElementById("main")
  var previousDiv = document.getElementById("divPrice")
  if (previousDiv){
    mainDiv.removeChild(previousDiv)
  }
  var divPrice = document.createElement("div")
  divPrice.id = "divPrice"
  divPrice.className = "divPrice"

  divPrice.style.height = "20px"
  divPrice.style.top = h + parseInt(canvas.offsetTop) - (parseInt(divPrice.style.height)/2)
  divPrice.style.left = parseInt(mainDiv.style.width) - 60

  let factor = h / canvas.height * 100
  let price = parseFloat(maxValue  - ((maxValue - minValue) / 100) * factor).toFixed(6)
  var txtPrice = document.createTextNode(price)
  divPrice.appendChild(txtPrice)
  mainDiv.appendChild(divPrice)

}

//Main Info Area
function showInfo() {
  var divPair = document.createElement("div")
  var infoDiv = document.getElementById("infoDiv")
  var infoSpan = document.createElement("span")
  var txtPair = document.createTextNode(Watcher.pair)
  infoSpan.appendChild(txtPair)
  divPair.appendChild(infoSpan)
  divPair.className = "pair"
  infoDiv.appendChild(divPair)
}

function showOHLC(myCandle) {
  var infoDiv = document.getElementById("infoDiv")
  var divOLHC = document.createElement("div")
  var previousChild = document.getElementById("ohlc")
  if (previousChild) {
    infoDiv.removeChild(previousChild)
  }

  divOLHC.id = "ohlc"
  divOLHC.className = "infoOLHC"
  //openSpan.id = "ohlc"
  var txtTime = document.createTextNode("Timestamp: " + myCandle.timestamp)
  var txtOpen = document.createTextNode("Open: " + myCandle.open)
  var txtClose = document.createTextNode("Close: " + myCandle.close)
  var txtHigh = document.createTextNode("High: " + myCandle.high)
  var txtLow = document.createTextNode("Low: " + myCandle.low)
  var openSpan = document.createElement("span")
  var openSpanT = document.createElement("span")
  openSpanT.appendChild(txtTime)
  divOLHC.appendChild(openSpanT)
  openSpan.appendChild(txtOpen)
  divOLHC.appendChild(openSpan)
  var openSpan2 = document.createElement("span")
  openSpan2.appendChild(txtClose)
  divOLHC.appendChild(openSpan2)
  var openSpan3 = document.createElement("span")
  openSpan3.appendChild(txtHigh)
  divOLHC.appendChild(openSpan3)
  var openSpan4 = document.createElement("span")
  openSpan4.appendChild(txtLow)
  divOLHC.appendChild(openSpan4)

  infoDiv.appendChild(divOLHC)
}
