//######################################################################
//>>> GLOBAL VARIABLES ([CONFIG] VALUES) AND DATA STRUCTURE DECLARATIONS
//######################################################################

//>>> Config Values (Note: I might eventually use a 'Config' Dict as with Spatial Partition Demo)
var soundDecayFac = 0.95;
var soundAddVal   = 80;
var scentDecayFac = 0.98;
var scentAddVal   = 20; // will eventually be specific to the unit, but KISS

//>>> Data Structure Declarations
var myGO;


//>>> New Architecture for Grid Map Types
var MapDims = {cTall:24, cWide:32, cSize:32};

var tileMap;
var spMap;
var scentMap;
var soundMap;
var allMaps;


function setup(){
  createCanvas(1024,768).parent("viz");

  //myGO = new GameObject(vec2(400,400));
}

function draw(){
  //>>> UI/UX CALLS
  //>>> UPDATE CALLS
  //>>> RENDER CALLS
  background(12,12,60);
  //myGO.pointAtMouse();
  //myGO.renderAxes();
  if(mouseInCanvas()){drawFPS()};
  drawCanvasBorder();  
}