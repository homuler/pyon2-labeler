'use strict';

import * as util from './canvas-util';

export class VirtualCanvas {
   constructor(canvasId, grid = true, guidewire = true) {
      this.canvas = document.getElementById(canvasId);
      this.ctx = this.canvas.getContext('2d');
      this.grid = grid;
      this.guidewire = guidewire;
      this.dragging = false;
      this.aspectFix = false;
      this.aspectRatio = { x: 1, y: 1 };
      this.dragStart = { x : -1, y : -1 };
      this.figures = [];
      this.currentFigure = {
         type: 'rect',
         color: {
            r: 230,
            g: 20,
            b: 30,
            a: 1.0
         },
         lineWidth: 2.0,
         startPoint: null,
         currentPoint: null
      };
      this.autoSavedSurface = [];

      this.saveDrawingSurface();
      this.drawVirtualSurface();
      this.canvas.addEventListener('mousedown', this.startDrag);
      this.canvas.addEventListener('mousemove', (e) => {
         if (this.dragging || this.guidewire) {
            if (this.prevDrawingSurface) {
               this.restoreDrawingSurfaceTemp();
            }
         }
         if (this.dragging) {
            this.drawRubberbandShape(e);
         }
         if (this.guidewire) {
            this.drawGuideWires(e);
         }
      });
      this.canvas.addEventListener('mouseup', (e) => {
         this.restoreDrawingSurface();
         this.drawRubberbandShape(e, false);
         this.dragging = false;
         this.saveDrawingSurface();
         this.drawVirtualSurface();
      });
      this.drawImage('../res/img/test.png');
   }
   getCurrentRGBA() {
      return 'rgba(' +
         this.currentFigure.color.r + ', ' +
         this.currentFigure.color.g + ', ' +
         this.currentFigure.color.b + ', ' +
         this.currentFigure.color.a + ')';
   }
   drawVirtualSurface(gridcolor = 'rgba(10, 20, 10, 0.3)') {
      if (this.grid) {
         this.drawGrid(gridcolor);
      }
      this.saveDrawingSurfaceTemp();
   }
   drawGrid(color) {
      util.drawGrid(this.ctx, color);
   }
   drawImage(imgPath, x1 = 0, y1 = 0, x2 = this.canvas.width, y2 = this.canvas.height) {
      this.saveDrawingSurfaceTemp();

      let image = new Image();
      image.onload = () => {
         this.ctx.drawImage(image, x1, y1, x2, y2);
         this.saveDrawingSurface();
         this.drawVirtualSurface();
      };
      image.src = imgPath;
   }
   saveDrawingSurfaceTemp() {
      this.prevDrawingSurface = 
         this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
   }
   saveDrawingSurface() {
      this.autoSavedSurface.push(
         this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height));
   }
   restoreDrawingSurfaceTemp() {
      if (this.prevDrawingSurface) {
         this.ctx.putImageData(this.prevDrawingSurface, 0, 0);
      }
   }
   restoreDrawingSurface() {
      if (this.autoSavedSurface.length > 0) {
         this.ctx.putImageData(this.autoSavedSurface[this.autoSavedSurface.length-1], 0, 0);
      }
   }
   redoDrawing() {
      if (this.autoSavedSurface.length > 0) {
         this.ctx.putImageData(this.autoSavedSurface.pop(), 0, 0);
      }
   }
   getCurrentPoint(e) {
      return util.windowToCanvas(this.canvas, e.clientX, e.clientY);
   }
   drawGuideWires  = (e) => {
      let point = this.getCurrentPoint(e);
      util.drawGuideWires(this.ctx, point.x, point.y);
   }
   startDrag = (e) => {
      this.dragging = true;
      this.currentFigure.type = 'rect';
      this.currentFigure.startPoint = this.getCurrentPoint(e);
   }
   drawRubberbandShape = (e, temporary = true) => {
      this.currentFigure.currentPoint = this.getCurrentPoint(e);
      let currentPoint = this.currentFigure.currentPoint,
          startPoint = this.currentFigure.startPoint;

      switch (this.currentFigure.type) {
         case 'rect': 
            if (this.aspectFix) {
               util.drawRectWithFixedAspectRatio(this.ctx, 
                  currentPoint, startPoint, 
                  this.aspectRatio.x, this.aspectRatio.y, 
                  this.getCurrentRGBA(), 
                  this.currentFigure.lineWidth);
            } else {
               util.drawRect(this.ctx, currentPoint, startPoint, 
                  this.getCurrentRGBA(), this.currentFigure.lineWidth);
            }
            break;
         default: 
            break;
      }
   }
   toggleGrid() {
      if (this.grid) {
         this.grid = false;
         this.restoreDrawingSurface();
         this.saveDrawingSurfaceTemp();
      } else {
         this.grid = true;
         this.restoreDrawingSurfaceTemp();
         this.drawVirtualSurface();
      }
   }
}
