//######################################################################
//>>> GLOBAL VARIABLES ([CONFIG] VALUES) AND DATA STRUCTURE DECLARATIONS
//######################################################################

//>>> Config Values (Note: I might eventually use a 'Config' Dict as with Spatial Partition Demo)
var soundDecayFac = 0.95;
var soundAddVal   = 80;
var scentDecayFac = 0.98;
var scentAddVal   = 20; // will eventually be specific to the unit, but KISS

//>>> Data Structure Declarations

var myMap;
var myGO;

function setup(){
  createCanvas(1024,768).parent("viz");

  myGO = new GameObject(vec2(400,400));

  myMap = new GameMap(24,32,32);
  myMap.initTileMap();
  myMap.loadMap(map_01);

}

function draw(){
  background(12,12,60);

  //myGO.pointAtMouse();
  //myGO.renderAxes();

  myMap.render();

  drawCanvasBorder();
  if(mouseInCanvas()){drawFPS()};
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