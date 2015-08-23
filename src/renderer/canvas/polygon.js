'use strict';

import * as util from './canvas-util';

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

  static jsonToFigure(json) {
    let rect = new Rectangle(json.boundingBox.xmin,
            json.boundingBox.ymin,
            json.boundingBox.xmax - json.boundingBox.xmin,
            json.boundingBox.ymax - json.boundingBox.ymin,
            json.color,
            json.lineWidth);
    rect.label = json.label || null;
    return rect;
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

    let xs = this.enumFocusX(),
        ys = this.enumFocusY();
    for (let i in ys) {
      for (let j in xs) {
        let x = xs[j], y = ys[i];
        if (stretchPoint < 0 || stretchPoint == i * xs.length + (+j)) {
          ctx.beginPath();
          ctx.arc(x, y, this.focusRadius, 0, 2 * Math.PI, false);
          ctx.stroke();
        }
      }
    }
    ctx.restore();
    this.drawLabel(ctx);
  }
  findStretchPoint(ctx, loc) {
    let xs = this.enumFocusX(),
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
    let rect = this.getLabelRect(ctx);
    ctx.beginPath();
    ctx.rect(rect.left, rect.top, rect.width, rect.height);
    if (ctx.isPointInPath(loc.x, loc.y)) {
      return 9;
    }
    return -1;
  }
  transform(loc, idx, aspect = null) {
    if (idx < 0 || idx > 8) {
      return;
    }
    let n = Math.floor(idx / 3),
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

    if (aspect !== null) {
      this.fixAspect(aspect);
    }
  }
  fixAspect(aspect) {
    if (aspect.x < aspect.y) {
      this.height = this.width * aspect.y / aspect.x;
    } else {
      this.width = this.height * aspect.x / aspect.y;
    }
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
      ctx.strokeStyle = util.hslaToString(this.color);
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
  getLabelRect(ctx) {
    return {
      left: this.left + this.focusRadius + 5,
      top: this.top - 30,
      width: Math.min(this.width - this.focusRadius - 5, 
              50 + ctx.measureText(this.label || 'label').width),
      height: 30
    };
  }
  drawLabel(ctx, edit = false) {
    ctx.save();
    ctx.beginPath();
    ctx.font = '20px Palatino';

    let rect = this.getLabelRect(ctx);
    ctx.fillStyle = util.hslaToString(this.color);
    ctx.fillRect(rect.left, rect.top, rect.width, rect.height);
    ctx.fillStyle = 'white';
    if (edit) {
      ctx.fillStyle = 'white';
      ctx.fillRect(rect.left+25, rect.top, rect.width-50, rect.height);
    }
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'center';
    ctx.strokeText(this.label || 'label', rect.left + rect.width/2, rect.top + 15);
    ctx.restore();
  }
}
