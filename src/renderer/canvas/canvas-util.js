'use strict';

export function rgbaToString(rgba) {
   return 'rgba(' +
         rgba.r + ',' +
         rgba.g + ',' +
         rgba.b + ',' +
         rgba.a + ')';
}

export function loadImage(ctx, imgPath, callback) {
   let image = new Image();

   image.onload = () => { 
      ctx.drawImage(image, 0, 0, ctx.canvas.width, ctx.canvas.height);
      console.log(image);
      if (callback) {
         callback(); 
      }
   };
   image.src = imgPath;
}

export function drawGrid(ctx, color, stepx = 20, stepy = 20) {
   ctx.save();
   ctx.strokeStyle = color;
   ctx.lineWidth = 0.5;
   for(let i = 0.5; i < ctx.canvas.width; i += stepx) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, ctx.canvas.height);
      ctx.stroke();
   }
   for(let i = 0.5; i < ctx.canvas.height; i += stepy) {
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(ctx.canvas.width, i);
      ctx.stroke();
   }
   ctx.restore();
}

export function windowToCanvas(canvas, x, y) {
   let box = canvas.getBoundingClientRect();
   return {
      x: (x - box.left) * (canvas.width / box.width),
      y: (y - box.top) * (canvas.height / box.height)
   };
}

export function drawLine(ctx, x1, y1, x2, y2) {
   ctx.beginPath();
   ctx.moveTo(x1, y1);
   ctx.lineTo(x2, y2);
   ctx.stroke();
}

export function drawGuideWires(ctx, x, y, color = 'rgba(0, 40, 190, 0.5)') {
   ctx.save();
   ctx.strokeStyle = color;
   ctx.lineWidth = 2;

   drawLine(ctx, x, 0, x, ctx.canvas.height);
   drawLine(ctx, 0, y, ctx.canvas.width, y);
   ctx.restore();
}

export function drawRect(ctx, p1, p2, color = 'rgba(255, 255, 255, 1.0)', lineWidth = 1.0) {
   ctx.save();
   ctx.strokeStyle = color;
   ctx.lineWidth = lineWidth;

   let left = Math.min(p1.x, p2.x),
       top = Math.min(p1.y, p2.y),
       width = Math.abs(p1.x - p2.x),
       height = Math.abs(p1.y - p2.y);
   ctx.strokeRect(left, top, width, height);
   ctx.restore();
}

export function drawRectWithFixedAspectRatio(ctx, p1, p2, rx = 1, ry = 1, color = 'rgba(255, 255, 255, 1.0)', lineWidth = 1.0) {
   ctx.save();
   ctx.strokeStyle = color;
   ctx.lineWidth = lineWidth;

   let left = Math.min(p1.x, p2.x),
       top = Math.min(p1.y, p2.y),
       width = Math.abs(p1.x - p2.x),
       height = width * ry / rx;
   ctx.strokeRect(left, top, width, height);
   ctx.restore();
}
