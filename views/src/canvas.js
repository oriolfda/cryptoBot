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

function setWatcher(watcher){
  this.Watcher = watcher

}

var canvas = document.getElementById('marketCanvas'),
    context = canvas.getContext('2d'),
    canvasY = document.getElementById("scaleY"),
    canvasX = document.getElementById("scaleX"),
    contextY = canvasY.getContext('2d'),
    contextX = canvasX.getContext('2d'),


    AXIS_MARGIN = 0,
    AXIS_ORIGIN = { x: AXIS_MARGIN, y: canvas.height-AXIS_MARGIN },
    AXIS_ORIGIN_X = { x: AXIS_MARGIN, y: canvasX.height-AXIS_MARGIN },
    AXIS_ORIGIN_Y = { x: AXIS_MARGIN, y: canvasY.height-AXIS_MARGIN },

    AXIS_TOP   = AXIS_MARGIN,
    AXIS_RIGHT = canvas.width-AXIS_MARGIN,

    HORIZONTAL_TICK_SPACING = 20,
    VERTICAL_TICK_SPACING = 10,

    AXIS_WIDTH  = AXIS_RIGHT - AXIS_ORIGIN.x,
    AXIS_HEIGHT = AXIS_ORIGIN.y - AXIS_TOP,

    NUM_VERTICAL_TICKS   = AXIS_HEIGHT / VERTICAL_TICK_SPACING,
    NUM_HORIZONTAL_TICKS = AXIS_WIDTH  / HORIZONTAL_TICK_SPACING,

    TICK_WIDTH = 10,
    TICKS_LINEWIDTH = 0.5,
    TICKS_COLOR = 'navy',

    AXIS_LINEWIDTH = 1.0,
    AXIS_COLOR = 'white';

// Functions..........................................................

function drawGrid(color, stepx, stepy) {
   context.save()
   contextX.save()
   contextY.save()
   context.fillStyle = 'black';
   context.fillRect(0, 0, context.canvas.width, context.canvas.height);

   context.lineWidth = 0.1;
   context.setLineDash([5]);
   context.strokeStyle = color;
   contextX.strokeStyle = color;
   contextY.strokeStyle = color;

   for (var i = stepx + 0.5; i < context.canvas.width; i += stepx) {
     context.beginPath();
     context.moveTo(i, 0);
     context.lineTo(i, context.canvas.height);
     context.stroke();
   }

   for (var i = stepy + 0.5; i < context.canvas.height; i += stepy) {
     context.beginPath();
     context.moveTo(0, i);
     context.lineTo(context.canvas.width, i);
     context.stroke();
   }

   context.restore();
   contextX.restore();
   contextY.restore();
}

function drawAxes() {
   context.save();
   contextX.save()
   contextY.save()
   context.strokeStyle = AXIS_COLOR;
   context.lineWidth = AXIS_LINEWIDTH;
   contextX.strokeStyle = AXIS_COLOR;
   contextX.lineWidth = AXIS_LINEWIDTH;
   contextY.strokeStyle = AXIS_COLOR;
   contextY.lineWidth = AXIS_LINEWIDTH;

   drawHorizontalAxis();
   drawVerticalAxis();

   context.lineWidth = 0.5;
   context.lineWidth = TICKS_LINEWIDTH;
   context.strokeStyle = TICKS_COLOR;

   drawVerticalAxisTicks();
   drawHorizontalAxisTicks();

   context.restore();
   contextX.restore();
   contextY.restore();
}

function drawHorizontalAxis() {
   contextX.beginPath();
   contextX.moveTo(AXIS_ORIGIN_X.x, AXIS_TOP+5);
   contextX.lineTo(AXIS_RIGHT+5, AXIS_TOP+5)
   contextX.stroke();
}

function drawVerticalAxis() {

   contextY.beginPath();
   contextY.moveTo(AXIS_ORIGIN_Y.x+5, AXIS_ORIGIN_Y.y);
   contextY.lineTo(AXIS_ORIGIN_Y.x+5, AXIS_TOP);
   contextY.stroke();
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

   for (var i=1; i < NUM_VERTICAL_TICKS; ++i) {
      contextY.beginPath();

      if (i % 5 === 0) deltaX = TICK_WIDTH;
      else             deltaX = TICK_WIDTH/2;

//      context.moveTo(AXIS_ORIGIN.x - deltaX,
        contextY.moveTo(AXIS_ORIGIN_Y.x - AXIS_MARGIN - deltaX,
                     AXIS_ORIGIN_Y.y - i * VERTICAL_TICK_SPACING);

//      context.lineTo(AXIS_ORIGIN.x + deltaX,
        contextY.lineTo(AXIS_ORIGIN_Y.x - AXIS_MARGIN + deltaX,
                     AXIS_ORIGIN_Y.y - i * VERTICAL_TICK_SPACING);

      contextY.stroke();
   }
}

function drawHorizontalAxisTicks() {
   var deltaY;

   for (var i=1; i < NUM_HORIZONTAL_TICKS; ++i) {
      contextX.beginPath();

      if (i % 5 === 0) deltaY = TICK_WIDTH;
      else             deltaY = TICK_WIDTH/2;

      contextX.moveTo(AXIS_ORIGIN_X.x + i * HORIZONTAL_TICK_SPACING,
                     AXIS_TOP - deltaY);

      contextX.lineTo(AXIS_ORIGIN_X.x + i * HORIZONTAL_TICK_SPACING,
                     AXIS_TOP + deltaY);

      contextX.stroke();
   }
}

// Initialization................................................
