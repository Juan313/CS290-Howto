// reference: https://www.youtube.com/watch?v=RNep4_QpIM0&list=PL5UFsTza4wWQRiguVuAuSsnhZK5NIXZEO
var canvas = document.getElementById('canvas');
var context = canvas.getContext('2d');
context.lineWidth = 25;
var down = false;
var data;
var csvOriginal =[];

canvas.addEventListener('mousemove',draw);
canvas.addEventListener('mousedown',function(){
  down = true;
  context.beginPath();
  context.moveTo(xPos,yPos);
  canvas.addEventListener("mousemove",draw);

});

canvas.addEventListener('mouseup',function() {down = false;});

function draw(e){
  var pos = getMousePos(canvas,e);
  xPos = pos.x;
  yPos = pos.y;
  if (down == true){
    context.lineTo(xPos,yPos);
    context.stroke();
  }
  var imageData = context.getImageData(0,0,canvas.width,canvas.height);
  data = imageData.data;
  csvOriginal =[];
  for (var i=0; i<data.length; i+=4){
    if(data[i+3]>0){
      csvOriginal.push(1);
    }
    else {
      csvOriginal.push(0);
    }
  };

}
// reference: http://stackoverflow.com/questions/17130395/real-mouse-position-in-canvas
function getMousePos(canvas, evt) {
    var rect = canvas.getBoundingClientRect();
    return {
      x: evt.clientX - rect.left,
      y: evt.clientY - rect.top
    };
}

function clearCanvas(){
  context.clearRect(0,0,canvas.width,canvas.height);
}


function processData(imgData){
  var maxVal=0;
  for (var i=0; i<imgData.length; i+=4){
    if (imgData[i]>maxVal){
      maxVal = imgData[i];
    }
  }
  console.log(maxVal);
}

function predict(){
  var length = csvOriginal.reduce(function (a, b) {
            return a + b;
            }, 0);
  if (length===0) {
    return;
  } else {
    var csv = compress(csvOriginal);
    makeApiCall(csv);
  }

}

function compress(original){
  var left=canvas.width-1,right=0,top=canvas.height-1,bottom=0;
  var width,height;
  var rowIndex,columnIndex;
  var size;
  for (var i=0; i<original.length; i+=1){
    rowIndex = parseInt(i/canvas.width);
    columnIndex = i%canvas.width;
    if (original[i]>0){
      if (rowIndex<top) {
        top = rowIndex;
      }
      if (rowIndex>bottom) {
        bottom = rowIndex;
      }
      if (columnIndex<left) {
        left = columnIndex;
      }
      if (columnIndex>right) {
        right = columnIndex;
      }
    }
  }
  width = right - left;
  height = bottom - top;
  size = Math.max(width,height);

  var midWidth = parseInt((right+left)/2);
  var midHeight = parseInt((bottom + top)/2);
  size = 2* parseInt(size/2);
  console.log("width = ",width, " height = ", height, "size = ",size);
  var newLeft = midWidth - (size/2);
  var newRight = midWidth + (size/2);
  var newTop = midHeight - (size/2);
  var newBottom = midHeight +(size/2);
  console.log("newleft = ",newLeft, " newRight = ", newRight, "newTop = ",newTop, "newBottom = ",newBottom);
  var csv_zoom_in =[];
  for (var j=0; j<original.length; j+=1){
    rowIndex = parseInt(j/canvas.width);
    columnIndex = j%canvas.width;
    if (rowIndex>= newTop && rowIndex< newBottom && columnIndex < newRight && columnIndex >= newLeft){
      //console.log("rowIndex = ",rowIndex, " columnIndex = ",columnIndex);
      csv_zoom_in.push(original[j]);
    }
  }
  console.log(csv_zoom_in);
  csvInstance=averageFilter(csv_zoom_in,size);
  /*
   experiment
  */
  var canvas2 = document.createElement("canvas"),
      ctx = canvas2.getContext("2d"),
      img = [];
      canvas2.setAttribute("id", "canvas2");
  for (var k=0; k<csvInstance.length; k+=1){
    if(csvInstance[k]===1){
      img.push(0);
      img.push(0);
      img.push(0);
      img.push(255);
    } else {
      img.push(0);
      img.push(0);
      img.push(0);
      img.push(0);
    }
  }

  // Get a pointer to the current location in the image.
  var palette = ctx.getImageData(0,0,16,16); //x,y,w,h
  // Wrap your array as a Uint8ClampedArray
  palette.data.set(new Uint8ClampedArray(img)); // assuming values 0..255, RGBA, pre-mult.
  // Repost the data.
  ctx.putImageData(palette,0,0);
  var element = document.getElementsByTagName("body")[0];
  element.appendChild(canvas2);
  /*
   experiment
  */

  return csvInstance;
}

function averageFilter(array,size){
  var width = size;
  var height = size;
  var result=[];
  var thumbwidth = 16;
  var thumbheight = 16;
  var xscale = (thumbwidth+0.0) / width;
  var yscale = (thumbheight+0.0) / height;
  var threshold = 0.55 / (xscale * yscale);
  var yend = 0.0;
  for (var f = 0; f < thumbheight; f+=1) // y on output
  {
    var ystart = yend;
    yend = (f + 1) / yscale;
    if (yend >= height) {yend = height - 0.000001;}
    var xend = 0.0;
    for (var g = 0; g < thumbwidth; g+=1) // x on output
    {
        var xstart = xend;
        xend = (g + 1) / xscale;
        if (xend >= width) {xend = width - 0.000001;}
        var sum = 0.0;
        for (var y = parseInt(ystart); y <= parseInt(yend); y+=1)
        {
            var yportion = 1.0;
            if (y == parseInt(ystart)) {yportion -= ystart - y;}
            if (y == parseInt(yend)) {yportion -= y+1 - yend;}
            for (var x = parseInt(xstart); x <= parseInt(xend); x+=1)
            {
                var xportion = 1.0;
                if (x == parseInt(xstart)) {xportion -= xstart - x;}
                if (x == parseInt(xend)) {xportion -= x+1 - xend;}
                sum += array[x+y*width] * yportion * xportion;
            }
        }
        //result[f][g] = (sum > threshold) ? 1 : 0;
        if (sum>threshold) {
          result[g+f*thumbwidth] = 1;
        } else {
          result[g+f*thumbwidth] = 0;
        }
    }
}
  console.log(result);
  return result;
}
