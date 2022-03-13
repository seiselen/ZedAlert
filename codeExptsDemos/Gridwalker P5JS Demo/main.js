//>>> Canvas/Map GLOBAL Configs
var worldWide = 1024;
var worldTall = 768;
var cellSize  = 32;
var cellSizeH = cellSize/2;
var cellsTall = worldTall/cellSize;
var cellsWide = worldWide/cellSize;
//>>> Data Structure Declarations
var tileMap;
var spMap;
var pathFind;
var uiManager;
var agents = [];
var bldgs  = [];

function setup(){
  createCanvas(worldWide,worldTall).parent(select("#pane_viz"));
  document.oncontextmenu = ()=>{return !mouseInCanvas()}; // FINALLY REALIZED DESIRED BEHAVIOR!
  spMap     = new GridSPMap(cellsTall,cellsWide,cellSize);
  tileMap   = new TileMap(cellsTall,cellsWide,cellSize);
  pathFind  = new GWPathfinder(tileMap,spMap);
  uiManager = new GWDemoUIManager();
  uiManager.loadMapAgtConfig(map_24x32_04 ,agt_24x32_04);
} // Ends P5JS Function setup

//> ASSUME ORDER COUNTS, ESP. RENDER CALLS, I.E. IT'S [VERY] MUCH INTENDED
function draw(){
  //>>> UI CALLS
  if(mouseInCanvas()&&mouseIsPressed){uiManager.onMouseDown(mouseButton);}
  //>>> UPDATE CALLS
  uiManager.updateLabels();
  agents.forEach((a)=>a.update());
  //>>> RENDER CALLS
  background(240,240,255);
  tileMap.renderMap();
  uiManager.drawCursor();
  spMap.renderMap();
  tileMap.renderGrid(); // doesn't matter who renders it
  uiManager.renderPathFindInfo();
  agents.forEach((a)=>a.render());
  bldgs.forEach((b)=>b.render());
  drawCanvasBorder();
} // Ends P5JS Function draw

function mousePressed(){
  if(mouseInCanvas()){uiManager.onMousePressed(mouseButton);}
} // Ends P5JS UI Function mousePressed

function keyPressed(){
  uiManager.onKeyPressed(key);
} // Ends P5JS UI Function keyPressed




//####################################################################
//>>> QAD BUILDING OBJ DEF
//####################################################################
class GWBldg{
  constructor(r,c,d,m){
    this.pos   = createVector(c*cellSize,r*cellSize);
    this.dim   = createVector(d[0]*cellSize, d[1]*cellSize);
    this.cells = this.dimToCells(r,c,d[0],d[1]);
    this.spMap = m;
    this.spMap.postBuilding(this); // let SPMap know that I exist
  }
  dimToCells(ri,ci,w,t){let ret=[]; for(let r=0; r<t; r++){for(let c=0; c<w; c++){ret.push([ri+r,ci+c]);}} return ret;}
  render(){push(); translate(this.pos.x,this.pos.y); stroke(0); /*[Walls (s.t. order:{left,back,right,front})]=>*/ strokeWeight(1); fill(0,144,144); quad(0,0,16,8,16,80,0,96); quad(0,0,96,0,80,8,16,8); quad(80,8,96,0,96,96,80,80); quad(16,80,80,80,96,96,0,96); /*[Garage Door]=>*/ fill(180); strokeWeight(1); rect(32,80,32,16); line(32,84,64,84); line(32,88,64,88); line(32,92,64,92); /*[Roof]=>*/ fill(60); strokeWeight(2); rect(16,8,64,72); /*['Bib']=>'*/ fill(120,120,120); noStroke(); rect(0,96,96,16); quad(0,112,96,112,64,128,32,128); pop();}
} // Ends Class GWBldg

