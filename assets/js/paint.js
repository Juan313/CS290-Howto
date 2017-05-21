// reference: https://www.youtube.com/watch?v=RNep4_QpIM0&list=PL5UFsTza4wWQRiguVuAuSsnhZK5NIXZEO
var canvas = document.getElementById('canvas');
var context = canvas.getContext('2d');
context.lineWidth = 30;
var down = false;

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
