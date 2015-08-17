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
      },
      stroke: {
         color: {
            h: 0,
            s: 100,
            l: 50,
            a: 1.0
         },
         lineWidth: 2.0
      }
   }
   state = {
      mode: DRAW_MODE,
      dragging: false,
      dragStart: null,
      backgroundImage: null,
      currentFigure: {
         figure: null,
         stretchPoint: null
      },
      surfaceHistory: [],
      figures: []
   }
   constructor(canvas, actions) {
      this.canvas = canvas;
      this.actions = actions;
      this.ctx = this.canvas.getContext('2d');
      this.offscreenCanvas = document.createElement('canvas');
      this.offscreenCtx = this.offscreenCanvas.getContext('2d');

      this.offscreenCanvas.width = this.canvas.width;
      this.offscreenCanvas.height = this.canvas.height;
      this.showDefaultDisplay();
      this.saveDrawingSurface();
      this.drawVirtualSurface();
      this.copyOffscreenToMain();
   }
   reset() {
      this.state.figures = [];
      this.state.surfaceHistory = [];
      this.offscreenCtx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this.showDefaultDisplay();
      this.saveDrawingSurface();
      this.drawVirtualSurface();
      this.copyOffscreenToMain();
   }
   onMouseDown = (e) => {
      let point = this.getCurrentPoint(e);
      this.state.dragging = true;
      switch (this.state.mode) {
         case DRAW_MODE:
            var currentFigure = this.state.currentFigure;
            currentFigure.figure = new Rectangle(
                  point.x, point.y, 0, 0,
                  this.settings.stroke.color,
                  this.settings.stroke.lineWidth);
            break;

         case EDIT_MODE:
            this.eraseAllFigures();
            this.saveDrawingSurface();
            this.drawAllFigures();
            
            this.selectFigureToEdit(point);
            if (this.state.currentFigure.figure) {
               this.state.currentFigure.figure.focus(this.offscreenCtx,
                     this.state.currentFigure.stretchPoint);
            }
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
               
               let rect = this.state.currentFigure.figure;
               if (rect.height > 0 && rect.width > 0) {
                  this.state.figures.push(rect);
               }
               this.state.currentFigure.figure = 
                  new Rectangle(0, 0, 0, 0, 
                        rect.color, rect.lineWidth);
               break;
            case EDIT_MODE:
               this.updateFocusedFigure(point,
                     this.state.currentFigure.figure,
                     this.state.currentFigure.stretchPoint);
               this.drawAllFigures();
               console.log(this.state.currentFigure.figure);
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

   onDrop = (e) => {
      e.preventDefault();
      console.log(e.dataTransfer.files[0]);
   }

   showDefaultDisplay() {
      this.offscreenCtx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this.offscreenCtx.save();
      this.offscreenCtx.textAlign = 'center';
      this.offscreenCtx.textBaseline = 'middle';
      this.offscreenCtx.font = '5em palatino';
      this.offscreenCtx.fillText('Drop a file here!', 
            this.canvas.width/2, this.canvas.height/2);
      this.offscreenCtx.restore();
   }

   deleteCurrentFigure() {
      if (this.state.mode === EDIT_MODE && this.state.currentFigure.figure) {
         for (let idx in this.state.figures) {
            if (this.state.figures.hasOwnProperty(idx)) {
               let fig = this.state.figures[idx];
               if (fig === this.state.currentFigure.figure) {
                  this.state.figures.splice(idx, 1);
                  break;
               }
            }
         }
         this.redrawAll();
         this.saveDrawingSurface();
         if (this.hasVirtualSurface()) {
            this.drawVirtualSurface();
         }
         this.copyOffscreenToMain();
      }
      this.state.currentFigure.figure = null;
   }

   copyOffscreenToMain() {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this.ctx.drawImage(this.offscreenCanvas,
            0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
   }
   getRealFigureSize() {
      if (this.state.currentFigure.figure === null) {
         return null;
      }
      var rawSize = this.state.backgroundImage ?
         { 
            width: this.state.backgroundImage.width,
            height: this.state.backgroundImage.height
         } :
         {
            width: this.canvas.width,
            height: this.canvas.height
         };

      var ratio = {
         w: rawSize.width / this.canvas.width,
         h: rawSize.height / this.canvas.height
      };
      return {
         left: this.state.currentFigure.figure.left * ratio.w,
         top: this.state.currentFigure.figure.top * ratio.h,
         width: this.state.currentFigure.figure.width * ratio.w,
         height: this.state.currentFigure.figure.height * ratio.h
      };
   }
   getCurrentHSLA() {
      return util.hslaToString(this.settings.stroke.color);
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
   clearFigures() {
      this.state.figures = [];
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
      } else {
         this.offscreenCtx.clearRect(0, 0, this.offscreenCanvas.width, this.offscreenCanvas.height);
         this.showDefaultDisplay();
         this.saveDrawingSurface();
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
            // change current color to the focused figure's color.
            this.state.currentFigure.figure = fig;
            this.state.currentFigure.stretchPoint = stretchPoint;
            this.settings.stroke.color = fig.color;
            this.settings.stroke.lineWidth = fig.lineWidth;
            return;
         }
      }
      this.state.currentFigure.figure = null;
      this.state.currentFigure.stretchPoint = null;
   }
   updateFocusedFigure(loc, figure, stretchPoint) {
      if (figure == null || stretchPoint == null) {
         return;
      }
      figure.transform(loc, stretchPoint, 
            this.settings.aspect.fix ? this.settings.aspect.ratio : null);
      figure.focus(this.offscreenCtx, stretchPoint);
      figure.color = this.settings.stroke.color;
      figure.lineWidth = this.settings.stroke.lineWidth;
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
   updateCurrentFigure = (loc) => {
      var figure = this.state.currentFigure.figure,
          aspect = this.settings.aspect;
      if (aspect.fix) {
         figure.transform(loc, 8, aspect.ratio);
      } else {
         figure.transform(loc, 8);
      }
   }
   drawCurrentFigure() {
      var figure = this.state.currentFigure.figure;
      figure.draw(this.offscreenCtx);
   }
   toggleGrid() {
      this.settings.grid = !this.settings.grid;
      this.restoreDrawingSurface();
      this.drawVirtualSurface();
      this.copyOffscreenToMain();
   }
   eraseAllFigures() {
      if (this.state.backgroundImage) {
         this.offscreenCtx.drawImage(this.state.backgroundImage, 
             0, 0, this.canvas.width, this.canvas.height);
        
      } else {
         this.offscreenCtx.clearRect(0, 0, this.canvas.width, this.canvas.height);
         this.showDefaultDisplay();
      }
   }
   drawAllFigures() {
      for(let i in this.state.figures) {
         let fig = this.state.figures[i];
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
