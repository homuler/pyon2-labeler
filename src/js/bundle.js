var w = 35, h = 50;
function writeImage() {
   var canvas = document.getElementById('pict-canvas');
   var ctx = canvas.getContext('2d');

   var img = new Image();
   img.onload = function() {
      ctx.drawImage(img, 0, 0, ctx.canvas.width, ctx.canvas.height);
      ctx.beginPath();
      ctx.strokeStyle = 'rgb(10, 45, 20)';
      ctx.strokeRect(w, h, 100, 100);
      ctx.stroke();
      w += 10;
      h += 10;
   };
   img.src = '../res/img/test.png';
}

function writeRect(w, h) {
   var canvas = document.getElementById('pict-canvas');
   var ctx = canvas.getContext('2d');
   ctx.beginPath();
   ctx.strokeStyle = 'rgb(10, 45, 20)';
   ctx.strokeRect(w, h, 100, 100);
   ctx.stroke();
}
