'use strict';

export class Rectangle {
   constructor(left, top, width, height, color = null, lineWidth = null) {
      this.left = left;
      this.top = top;
      this.width = width;
      this.height = height;
      this.color = color;
      this.lineWidth = lineWidth;
      this.focusRadius = 10;
      this.label = null;
   }
   static fromPoints(p1, p2, color = null, lineWidth = null) {
      let top = Math.min(p1.y, p2.y),
          left = Math.min(p1.x, p2.x),
          height = Math.abs(p1.y - p2.y),
          width = Math.abs(p1.x - p2.x);
      return new Rectangle(left, top, width, height, color, lineWidth);
   }
   createPath(ctx) {
      ctx.beginPath();
      ctx.rect(this.left, this.top, this.width, this.height);
   }
   move(offsetX, offsetY) {
      this.left += +offsetX;
      this.top += +offsetY;
   }
   enumFocusX() {
      return [this.left, this.left + this.width/2, this.left + this.width];
   }
   enumFocusY() {
      return [this.top, this.top + this.height/2, this.top + this.height];
   }
   focus(ctx, stretchPoint = -1) {
      ctx.save();
      ctx.strokeStyle = 'rgba(50, 100, 230, 0.9)';
      ctx.lineWidth = 1.0;

      var xs = this.enumFocusX(),
          ys = this.enumFocusY();
      for (let i in ys) {
         for (let j in xs) {
            let x = xs[j], y = ys[i];
            console.log(stretchPoint, i * xs.length + (+j));
            if (stretchPoint < 0 || stretchPoint == i * xs.length + (+j)) {
               ctx.beginPath();
               ctx.arc(x, y, this.focusRadius, 0, 2 * Math.PI, false);
               ctx.stroke();
            }
         }
      }
      ctx.restore();
   }
   findStretchPoint(ctx, loc) {
      var xs = this.enumFocusX(),
          ys = this.enumFocusY();
      for (let i in ys) {
         for (let j in xs) {
            let x = xs[j], y = ys[i];
            ctx.beginPath();
            ctx.arc(x, y, this.focusRadius, 0, 2 * Math.PI, false);
            if (ctx.isPointInPath(loc.x, loc.y)) {
               return i * ys.length + (+j);
            }
         }
      }
      return -1;
   }
   transform(loc, idx) {
      var n = Math.floor(idx / 3),
          r = idx % 3;
      if (n == 0) {
         this.stretchVertical(loc, false);
      } else if(n == 2) {
         this.stretchVertical(loc, true);
      }

      if (r == 0) {
         this.stretchHorizontal(loc, false);
      } else if (r == 2) {
         this.stretchHorizontal(loc, true);
      }

      if (n == 1 && r == 1) {
         this.move(
               loc.x - this.left - this.width/2, 
               loc.y - this.top - this.height/2);
      }

      if (this.width < 0) {
         this.left += this.width;
         this.width = -this.width;
      }
      if (this.height < 0) {
         this.top += this.height;
         this.height = -this.height;
      }

   }
   fixAspect() {

   }
   stretchHorizontal(loc, fixLeft = true) {
      if (fixLeft) {
         this.width = loc.x - this.left;
      } else {
         this.width -= loc.x - this.left;
         this.left = loc.x;
      }
   }
   stretchVertical(loc, fixTop = true) {
      if (fixTop) {
         this.height = loc.y - this.top;
      } else {
         this.height -= loc.y - this.top;
         this.top = loc.y;
      }
   }
   draw(ctx) {
      ctx.save();
      if (this.color !== null) {
         ctx.strokeStyle = this.color;
      }
      if (this.lineWidth !== null) {
         ctx.lineWidth = this.lineWidth;
      }
      ctx.strokeRect(this.left, this.top, this.width, this.height);
      ctx.restore();
   }
   drawWithOffset(ctx, offset) {
      this.move(offset.x, offset.y);
      this.draw(ctx);
      this.move(-offset.x, -offset.y);
   }
}
