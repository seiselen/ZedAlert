/*######################################################################
|>>> [PathFindAndFollowDemo] (P5JS Demo Project)
+-----------------------------------------------------------------------
| Overview: AKA 'Tank RTS Steering Agent', this was the first successful
|           implementation of the Pathfinder utility with a 'Gridwalker'
|           Quasi-SA which traversed paths given to it. This project is
|           being preserved until its ZAC counterpart is both completed
|           and well-tested. Especially as there is some stuff here that
|           I want to implement within ZAC (see 'Implementation Notes').
+-----------------------------------------------------------------------
| Implementation Notes:
|  > The DOM GUI interface for this is one of the nicer, 'crisper' ones
|    I've developed! Thus this project will most likely be permanently 
|    archived within the ZAC repo.
+#####################################################################*/
var worldWide = 1200;
var worldTall = 800;
var cellSize  = 20;
var cellsTall = worldTall/cellSize;
var cellsWide = worldWide/cellSize;

var gridMap;
var agent;
var pathFind;

var showMouseCoords = false;
var curMouseOption  = "TILE";
var curPaintOption  = "DIRT";
var paintOptionSel  = null;

// QAD extensions to ZAC Pathfind for some UI support as I don't want to import/install 'PathFindUI'
var curOSet     = [];
var curCSet     = [];
var curPath     = [];
var showCurPath = false; 
var showCurOSet = false; 
var showCurCSet = false;

function setup(){
  createCanvas(worldWide,worldTall).parent("viz");
  gridMap   = new TileMap(cellsTall,cellsWide,cellSize);
  pathFind  = new PathFinder(gridMap,null);
  agent     = new GridWalker(11,11,cellSize,gridMap);
  initUI(); 
} // Ends Function setup

function draw(){
  //>>> UI CALLS
  mousePaint();
  //>>> UPDATE CALLS
  updateUI();
  agent.update();
  //>>> RENDER CALLS
  background(0,60,255);
  gridMap.render();
  renderPFInfo();
  agent.render();
  drawCanvasBorder();
} // Ends Function draw

function keyPressed(){if(key=='R'){gridMap.setAllCellsToTile(TileType.DIRT);}}

function mousePressed(){
  if(mouseIsPressed&&mouseButton==LEFT&&mouseInCanvas()){
    var mouseCoord = gridMap.posToCoord(mousePtToVec());
    if(!gridMap.cellInBounds(mouseCoord) || curMouseOption!="AGENT"){return;}
    curPath = pathFind.constructPathAsMidPts(pathFind.findPath(gridMap.posToCoord(agent.pos),mouseCoord));
    curCSet = pathFind.getClosedSet();
    curOSet = pathFind.getOpenSet();
    agent.givePath(curPath);  
  }
}

function mousePaint(){
  if (mouseIsPressed && mouseButton==LEFT && mouseInCanvas() && curMouseOption=='TILE'){
    let mouseCoord = gridMap.posToCoord(mousePtToVec());
    if(!gridMap.cellInBounds(mouseCoord[0],mouseCoord[1])){return;}
    gridMap.setValueAt(mouseCoord[0],mouseCoord[1],TileType[curPaintOption]);
  }
}

function onTilePaintOptionChanged(val){curMouseOption=val.value;}
function onDisplayOptionChanged(input){let val=input.checked; switch(input.id){case "DISP_GRID" : gridMap.showGrid=val; return; case "DISP_PATH" : showCurPath=val; return; case "DISP_OSET" : showCurOSet=val; return; case "DISP_CSET" : showCurCSet=val; return;}}
function initUI(){
  document.getElementsByName('pntOpt').forEach(o=>{if (o.value==curMouseOption){o.checked=true;}});
  paintOptionSel = createSelect().parent("cbox_tile");
  paintOptionSel.option('DIRT');
  paintOptionSel.option('WATER');
  paintOptionSel.selected('DIRT');
  paintOptionSel.changed(()=>{curPaintOption=paintOptionSel.value()});
  select("#DISP_GRID").checked(gridMap.showGrid);
  select("#DISP_PATH").checked(pathFind.showCurPath);
  select("#DISP_OSET").checked(pathFind.showCurOset);
  select("#DISP_CSET").checked(pathFind.showCurCset);
}

function updateUI(){select("#TBOX_POS").html((mouseInCanvas()) ? "("+round(mouseX)+","+round(mouseY)+")" : "N/A"); select("#TBOX_COORD").html((mouseInCanvas()) ? "["+gridMap.posToCoord(mousePtToVec())+"]" : "N/A");}


function renderPFInfo(){ellipseMode(CENTER); if(showCurCSet){renderCSet();} if(showCurOSet){renderOSet();} if(showCurPath){renderPath();}}
function renderPath(){if(curPath.length<=0){return;} noFill();stroke(0,216,216,64);strokeWeight(cellSize/2); beginShape(); for(let i=0; i<curPath.length; i++){vertex(curPath[i].x,curPath[i].y);} endShape(); fill(0,255,0); stroke(0,255,0); strokeWeight(0.5); textSize(12); for(let i=0; i<curPath.length; i++){text(i,curPath[i].x,curPath[i].y);}}
function renderCSet(){strokeWeight(1); stroke(0); fill(255,120,0);for(let i=0; i<curCSet.length; i++){drawSetEllipse(curCSet[i]);}}
function renderOSet(){strokeWeight(1); stroke(0); fill(0,255,0); for(let i=0; i<curOSet.length; i++){drawSetEllipse(curOSet[i]);}}
function drawSetEllipse(coord){let pos=gridMap.coordToMidPt(coord);ellipse(pos.x,pos.y,cellSize/2,cellSize/2);}