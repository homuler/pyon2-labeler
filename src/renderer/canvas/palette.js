'use strict';

import * as util from './canvas-util.js';

export class CanvasPalette {
   constructor(canvas, color) {
      this.canvas = canvas;
      this.ctx = this.canvas.getContext('2d');
      this.r = (Math.min(this.canvas.height, this.canvas.width) - 10) / 2;
      this.selected = {
         point: null,
         color: color
      };
      this.drawHSLCircle();
      this.saveDrawingSurface();
   }

   getSelectedColor() {
      return this.selected.color;
   }

   saveDrawingSurface() {
      this.prevSurface = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height)
   }

   restoreDrawingSurface() {
      this.ctx.putImageData(this.prevSurface, 0, 0);
   }

   drawHSLCircle(lightness = 50, alpha = 1.0) {
      var hw = this.canvas.width/2,
          hh = this.canvas.height/2;
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this.ctx.save();
      this.ctx.translate(hw, hh);

      for (let i = -hw; i <= hw; ++i) {
         for (let j = -hh; j <= hh; ++j) {
            if (this.r * this.r < i * i + j * j) {
               continue;
            }
            let h = (Math.floor(Math.atan2(i, j) / Math.PI / 2 * 360) + 360 + 270) % 360,
                d = Math.sqrt(i*i + j*j),
                s = Math.floor(100 * d / this.r);
            
            this.ctx.beginPath();
            this.ctx.fillStyle = 'hsla(' + h + ',' + s + '%,' + lightness + '%,' + alpha + ')';
            this.ctx.fillRect(i, j, 1, 1);
         }
      }
      this.ctx.restore();
   }

   hslaToLoc(hsla) {
      var hw = this.canvas.width / 2,
          hh = this.canvas.height / 2;
      return {
         x: hw + hsla.s / 100 * this.r * Math.cos(hsla.h / 180 * Math.PI),
         y: hh - hsla.s / 100 * this.r * Math.sin(hsla.h / 180 * Math.PI)
      };
   }

   locToHSLA(loc) {
      var hw = this.canvas.width / 2,
          hh = this.canvas.height / 2,
          h = (Math.floor(Math.atan2(loc.x - hw, loc.y - hh) / Math.PI / 2 * 360) + 360 + 270) % 360,
          d = Math.sqrt((loc.x - hw) * (loc.x - hw) + (loc.y - hh) * (loc.y - hh)),
          s = Math.floor(100 * d / this.r);
      return {
         h: h,
         s: s,
         l: this.selected.color.l,
         a: this.selected.color.a
      }
   }

   selectColor(e) {
      this.selected.point = util.windowToCanvas(this.canvas, e.clientX, e.clientY);
      this.selected.color = this.locToHSLA(this.selected.point);
   }

   drawSelectPoint() {
      var loc = this.selected.point;
      if (loc === null) {
         return;
      }
      this.restoreDrawingSurface();
      this.ctx.save();
      this.ctx.beginPath();
      this.ctx.arc(this.canvas.width/2, this.canvas.height/2, this.r, 0, 2 * Math.PI);
      this.ctx.clip();
      this.ctx.strokeStyle = 'white';
      this.ctx.lineWidth = 3.0;

      this.ctx.beginPath();
      this.ctx.strokeRect(loc.x - 10, loc.y - 10, 20, 20);
      this.ctx.restore();
   }

   drawSelectColorPoint(color) {
      this.selected.point = this.hslaToLoc(color);
      this.selected.color = color;
      this.drawSelectPoint();
   }
}
