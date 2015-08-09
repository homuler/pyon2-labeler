'use strict';

import * as util from './canvas-util';
import {Rectangle} from './polygon';

const EDIT_MODE = 'Edit';
const DRAW_MODE = 'Draw';

export class VirtualCanvas {
   settings = {
      grid: true,
      guide: {
         on: true,
         scope: {
            on: true,
            radius: 50,
            scale: 2.0
         }
      },
      aspect: {
         fix: false,
         ratio: {
            x: 1, y: 1
         }
      }
   }
   state = {
      mode: DRAW_MODE,
      dragging: false,
      dragStart: null,
      backgroundImage: null,
      currentFigure: {
         color: {
            r: 230,
            g: 20,
            b: 20,
            a: 1.0
         },
         lineWidth: 2.0,
         startPoint: null,
         currentPoin: null,
         figure: null,
         stretchPoint: null
      },
      surfaceHistory: [],
      figures: []
   }
   constructor(canvasId) {
      this.canvas = document.getElementById(canvasId);
      this.ctx = this.canvas.getContext('2d');
      this.offscreenCanvas = document.createElement('canvas');
      this.offscreenCtx = this.offscreenCanvas.getContext('2d');

      this.offscreenCanvas.width = this.canvas.width;
      this.offscreenCanvas.height = this.canvas.height;
      this.saveDrawingSurface();
      this.drawVirtualSurface();
      this.canvas.addEventListener('mousedown', this.onMouseDown);
      this.canvas.addEventListener('mousemove', this.onMouseMove);
      this.canvas.addEventListener('mouseup', this.onMouseUp);
      this.setBackground('../res/img/test.png');
   }
   onMouseDown = (e) => {
      let point = this.getCurrentPoint(e);
      this.startDrag(e);
      switch (this.state.mode) {
         case EDIT_MODE:
            this.eraseAllFigures();
            this.saveDrawingSurface();
            this.drawAllFigures();
            
            let selectedFig = this.selectFigureToEdit(point);
            console.log(selectedFig);
            if (selectedFig == null) {
               this.state.currentFigure.figure = null;
               this.state.currentFigure.stretchPoint = null;
               break;
            }
            this.state.currentFigure.figure = selectedFig.figure;
            this.state.currentFigure.stretchPoint = selectedFig.stretchPoint;
            this.state.currentFigure.figure.focus(this.offscreenCtx, 
                  this.state.currentFigure.stretchPoint);
            this.drawVirtualSurface(point);
            this.copyOffscreenToMain();
            break;
         default:
            break;
      }
   }
   onMouseMove = (e) => {
      if (this.state.dragging || this.hasVirtualSurface()) {
         this.restoreDrawingSurface();
      }
      let point = this.getCurrentPoint(e);
      switch (this.state.mode) {
         case DRAW_MODE: 
            if (this.state.dragging) {
               this.updateCurrentFigure(point);
               this.drawCurrentFigure();
            }
            break;
         case EDIT_MODE:
            if (this.state.dragging) {
               this.updateFocusedFigure(point, 
                     this.state.currentFigure.figure,
                     this.state.currentFigure.stretchPoint);
               this.drawAllFigures();
               if (this.state.currentFigure.figure) {
                  this.state.currentFigure.figure.focus(this.offscreenCtx,
                  this.state.currentFigure.stretchPoint);
               }
            }
            break;
         default:
            break;
      }
      if (this.hasVirtualSurface()) {
         this.drawVirtualSurface(point);
      }
      if (this.state.dragging || this.hasVirtualSurface()) {
         this.copyOffscreenToMain();
      }
   }
   onMouseUp = (e) => {
      if (this.state.dragging) {
         let point = this.getCurrentPoint(e);
         this.restoreDrawingSurface();
         switch (this.state.mode) {
            case DRAW_MODE:
               this.updateCurrentFigure(point);
               this.drawCurrentFigure();
               this.state.figures.push(Rectangle.fromPoints(
                        this.state.currentFigure.startPoint,
                        this.state.currentFigure.currentPoint,
                        this.getCurrentRGBA(),
                        this.state.currentFigure.lineWidth)
                     );
               break;
            case EDIT_MODE:
               this.updateFocusedFigure(point,
                     this.state.currentFigure.figure,
                     this.state.currentFigure.stretchPoint);
               this.drawAllFigures();
               if (this.state.currentFigure.figure) {
                  this.state.currentFigure.figure.focus(this.offscreenCtx);
               } else {
                  this.focusOnAll();
               }
               break;
            default:
               break;
         }
         this.state.dragging = false;
         this.saveDrawingSurface();
         this.drawVirtualSurface(point);
         this.copyOffscreenToMain();
      }
   }
   copyOffscreenToMain() {
      this.ctx.drawImage(this.offscreenCanvas,
            0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
   }
   getCurrentRGBA() {
      var currentFigure = this.state.currentFigure;
      return 'rgba(' +
         currentFigure.color.r + ', ' +
         currentFigure.color.g + ', ' +
         currentFigure.color.b + ', ' +
         currentFigure.color.a + ')';
   }
   hasVirtualSurface() {
      return this.settings.grid || this.settings.guide.on;
   }
   drawVirtualSurface(loc = null, gridcolor = 'rgba(10, 20, 10, 0.3)') {
      if (this.settings.grid) {
         util.drawGrid(this.offscreenCtx, gridcolor);
      }
      if (this.settings.guide.on && loc !== null) {
         this.drawGuideWires(loc);
      }
   }
   setBackground(imgPath, x1 = 0, y1 = 0, x2 = this.canvas.width, y2 = this.canvas.height) {
      this.restoreDrawingSurface();

      let image = new Image();
      image.onload = (e) => {
         this.state.backgroundImage = image;
         this.offscreenCtx.drawImage(image, x1, y1, x2, y2);
         this.saveDrawingSurface();
         this.drawVirtualSurface();
         this.copyOffscreenToMain();
      };
      image.src = imgPath;
   }
   saveDrawingSurfaceTemp() {
      this.prevDrawingSurface = 
         this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
   }
   saveDrawingSurface() {
      this.state.surfaceHistory.push(
         this.offscreenCtx.getImageData(0, 0, this.canvas.width, this.canvas.height));
   }
   restoreDrawingSurface() {
      var surfaceHistory = this.state.surfaceHistory;
      if (surfaceHistory.length > 0) {
         this.offscreenCtx.putImageData(surfaceHistory[surfaceHistory.length-1],
               0, 0);
      }
   }
   selectFigureToEdit(loc) {
      for(let i in this.state.figures) {
         if(!this.state.figures.hasOwnProperty(i)) {
            continue;
         }
         let fig = this.state.figures[i],
             stretchPoint = fig.findStretchPoint(this.offscreenCtx, loc);
         if (stretchPoint >= 0) {
            return { figure: fig, stretchPoint: stretchPoint };
         }
      }
      return null;
   }
   updateFocusedFigure(loc, figure, stretchPoint) {
      if (figure == null || stretchPoint == null) {
         return;
      }
      figure.transform(loc, stretchPoint);
      figure.focus(this.offscreenCtx, stretchPoint);
      figure.color = this.getCurrentRGBA();
      figure.lineWidth = this.state.currentFigure.lineWidth;
   }
   redoDrawing() {
      if (this.state.surfaceHistory.length > 0) {
         this.offscreenCtx.putImageData(this.state.surfaceHistory.pop(), 0, 0);
         this.drawVirtualSurface();
         this.copyOffscreenToMain();
      }
   }
   getCurrentPoint(e) {
      return util.windowToCanvas(this.canvas, e.clientX, e.clientY);
   }
   drawScope(ctx, loc) {
      var scale = this.settings.guide.scope.scale,
          radius = this.settings.guide.scope.radius;
      this.offscreenCtx.save();
      this.offscreenCtx.strokeStyle = 'black';
      this.offscreenCtx.beginPath();
      this.offscreenCtx.arc(loc.x, loc.y, radius, 0, 2*Math.PI, false);
      this.offscreenCtx.stroke();
      this.offscreenCtx.clip();

      var dirtyRect = {
             x: loc.x - radius * scale,
             y: loc.y - radius * scale,
             width: 2 * radius * scale,
             height: 2 * radius * scale
          },
          pos = {
             x: loc.x - radius,
             y: loc.y - radius,
             width: 2 * radius,
             height: 2 * radius
          };
      this.offscreenCtx.drawImage(this.offscreenCanvas,
            pos.x, pos.y, pos.width, pos.height,
            dirtyRect.x, dirtyRect.y, dirtyRect.width, dirtyRect.height);
      this.offscreenCtx.restore();
   }
   drawGuideWires  = (loc) => {
      util.drawGuideWires(this.offscreenCtx, loc.x, loc.y);
      this.drawScope(this.offscreenCtx, loc);
   }
   startDrag = (e) => {
      var currentFigure = this.state.currentFigure;
      this.state.dragging = true;
      let point = this.getCurrentPoint(e);
      if(this.state.mode === DRAW_MODE) {
         currentFigure.startPoint = point;
      }
   }
   updateCurrentFigure = (loc) => {
      this.state.currentFigure.currentPoint = loc;
   }
   drawCurrentFigure() {
      var currentFigure = this.state.currentFigure,
          aspect = this.settings.aspect;
      let currentPoint = currentFigure.currentPoint,
          startPoint = currentFigure.startPoint;

      if (aspect.fix) {
         util.drawRectWithFixedAspectRatio(this.offscreenCtx, 
               currentPoint, startPoint, 
               aspect.ratio.x, aspect.ratio.y, 
               this.getCurrentRGBA(), 
               currentFigure.lineWidth);
      } else {
          util.drawRect(this.offscreenCtx, currentPoint, startPoint, 
                this.getCurrentRGBA(), currentFigure.lineWidth);
      }
   }
   toggleGrid() {
      this.settings.grid = !this.settings.grid;
      this.restoreDrawingSurface();
      this.drawVirtualSurface();
      this.copyOffscreenToMain();
   }
   eraseAllFigures() {
      this.offscreenCtx.drawImage(this.state.backgroundImage, 
            0, 0, this.canvas.width, this.canvas.height);
   }
   drawAllFigures() {
      for(let i in this.state.figures) {
         let fig = this.state.figures[i];
         console.log(fig);
         fig.draw(this.offscreenCtx);
      }
   }
   redrawAll() {
      this.eraseAllFigures();
      this.drawAllFigures();
   }
   focusOnAll() {
      for(let i in this.state.figures) {
         if (!this.state.figures.hasOwnProperty(i)) {
            continue;
         }
         let fig = this.state.figures[i];
         fig.focus(this.offscreenCtx);
      }
   }
}
