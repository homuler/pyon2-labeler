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
            r: 230,
            g: 20,
            b: 20,
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
      this.saveDrawingSurface();
      this.drawVirtualSurface();
      this.canvas.addEventListener('mousedown', this.onMouseDown);
      this.canvas.addEventListener('mousemove', this.onMouseMove);
      this.canvas.addEventListener('mouseup', this.onMouseUp);
      this.setBackground('../res/img/test.png');
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
            console.log(this.state.currentFigure.figure);
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
               break;
            case EDIT_MODE:
               this.updateFocusedFigure(point,
                     this.state.currentFigure.figure,
                     this.state.currentFigure.stretchPoint);
               this.drawAllFigures();
               if (this.state.currentFigure.figure) {
                  this.state.currentFigure.figure.focus(this.offscreenCtx);
                  if (this.state.currentFigure.stretchPoint == 9) {
                     this.state.currentFigure.figure.drawLabel(
                           this.offscreenCtx, true);
                  }
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
      return util.rgbaToString(this.settings.stroke.color);
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
            // change current color to the focused figure's color.
            this.actions.changeFigureColor(fig.color);
            this.actions.changeLineWidth({ lineWidth: fig.lineWidth });
            this.actions.changeLabel({ label: fig.label });
            this.state.currentFigure.figure = fig;
            this.state.currentFigure.stretchPoint = stretchPoint;
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
      this.offscreenCtx.drawImage(this.state.backgroundImage, 
            0, 0, this.canvas.width, this.canvas.height);
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
