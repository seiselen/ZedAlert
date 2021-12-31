
var myGO;

function setup(){
  createCanvas(800,800).parent("viz");

  myGO = new GameObject(vec2(400,400));

}

function draw(){
  background(216,228,240);

  myGO.pointAtMouse();

  myGO.renderAxes();

  drawCanvasBorder();
  drawFPS();
}




//######################################################################
//>>> MISC UTILS (should go into BG's utils.js xor analog WRT this proj)
//######################################################################
// general enough that it should go into BG's utils.js
function drawArrow(x,y,len,ori,color){
  let len2 = len/2; let len6 = len/6;
  noStroke();fill(color);
  push();translate(x,y);rotate(ori.heading());translate(len6,0);
    beginShape();vertex(len2,0);vertex(-len2,-len2);vertex(-len2,len2);endShape(CLOSE);
  pop();
} // Ends Function render