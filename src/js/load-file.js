var pictBox = document.getElementById('pict-box');

pictBox.ondragover = function() {
   return false;
};

pictBox.ondragleave = function() {
   return false;
};

pictBox.ondrop = function(e) {
   e.preventDefault();
   var file = e.dataTransfer.files[0];
   console.log('File you dragged here is', file.path);
   return false;
};

