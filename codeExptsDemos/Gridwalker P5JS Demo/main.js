/*### TTD/NAT ITEMS FOR NEXT-SESSION (AM 10/8/21 ?) ###
  > Try the 'dampen velocity whenever moving to final cell on waypoint' idea (vis-a-vis TD-P5JS?)
  > Implement Multiple Agents (I think one of the ZAC Processing3 builds figured out basic/partial collision support?)
*/

//>>> Canvas/Map GLOBAL Configs
var worldWide = 1024;
var worldTall = 768;
var cellSize  = 32;
var cellSizeH = cellSize/2;
var cellsTall = worldTall/cellSize;
var cellsWide = worldWide/cellSize;

var showOCSet = true;

//>>> Data Structure Declarations
var gridMap;
var pathfind;
var agents = [];
var bldgs  = [];
var selAgent = null;

// Current Interaction Mode and Sub-Mode
var mouseMode = "agent";
var paintOption = "dirt";
var agentOption = "sel";

function setup() {
  createCanvas(worldWide,worldTall).parent(select("#pane_viz"));
  document.oncontextmenu = function(){return false;} // handles right click issue
  gridMap  = new GWMap(cellsTall,cellsWide,cellSize);
  pathfind = new GWPathfinder(gridMap);

  loadMapAgtConfig(map_04,agt_04);

  //agents.push(new GWAgent(11,1,gridMap));
  //agents.push(new GWAgent(20,28,gridMap));
  //bldgs.push(new Building(3,7,[3,4],gridMap));

  initUI();
}

function loadMapAgtConfig(map_cf,agt_cf){
  gridMap.loadMap(map_cf);
  agt_cf.forEach((rc)=>agents.push(new GWAgent(rc[0],rc[1],gridMap)));
}


function draw() {
  //>>> UI CALLS
  onMouseDown();

  //>>> UPDATE CALLS
  updateLabels();
  agents.forEach((a)=>a.update());
 
  //>>> RENDER CALLS 
  gridMap.render();
  if(showOCSet){pathfind.displayBothSets()};  
  agents.forEach((a)=>a.render());
  bldgs.forEach((b)=>b.render());

  drawMouseCoordCursor();
  drawCanvasBorder();
}


function drawMouseCoordCursor(){
  if(!mouseInCanvas()){return;}
  let sinRand = map(sin(((frameCount%30)/30)*PI),-1,1,127,255);
  noCursor();
  push(); 
    translate(floor(mouseX/cellSize)*cellSize, floor(mouseY/cellSize)*cellSize);
    switch(mouseMode){
      case "paint": stroke(0,255,0,sinRand); strokeWeight(2); switch(paintOption){
        case "dirt": fill(144,84,12); break; 
        case "road": fill(120,120,120); break; 
        case "sand": fill(255,216,144); break; 
        case "watr": fill(60,120,180); break; 
        default: fill(255,0,255);
      } rect(0,0,cellSize,cellSize); break;// Ends Switch | [paintOption]
      case "agent": noFill(); strokeWeight(2); switch(agentOption){
        case "sel": stroke(60,60,255,sinRand); line(cellSizeH,cellSize*.25,cellSizeH,-cellSize*.25); line(cellSizeH,cellSize*.75,cellSizeH,cellSize*1.25); line(-cellSize*.25,cellSizeH,cellSize*.25,cellSizeH); line(cellSize*.75,cellSizeH,cellSize*1.25,cellSizeH); break;
        case "add": stroke(60,255,60,sinRand); line(cellSizeH,0,cellSizeH,cellSize); line(0,cellSizeH,cellSize,cellSizeH); break;
        case "rem": stroke(255,60,60,sinRand); line(0,0,cellSize,cellSize); line(0,cellSize,cellSize,0); break;
      } rect(0,0,cellSize,cellSize); break;// Ends Switch | [agentOption]
      case "bldg": Building.renderBldgShape(vec2()); noFill(); stroke(60,255,60,sinRand); strokeWeight(4); rect(0,0,cellSize*3,cellSize*4);  
      break;
      // Ends | [bldgOption]
    } // Ends Switch | [mouseMode]
  pop();
} // Ends Function drawCursor


function mousePressed(){
  if(!mouseInCanvas()){return;}
      let mapCell = gridMap.cellViaPos(mousePtToVec());


  if(mouseMode=="agent"){
    if(mouseButton=='left'){switch(agentOption){
      case 'sel': onSelectAgent(); return;
      case 'add': /*onAddAgent();*/ return;
      case 'rem': /*onRemAgent();*/ return;
    }}
    if(selAgent&&mouseButton=='right'){
      let agtCell = gridMap.cellViaPos(selAgent.pos);
      selAgent.givePath(pathfind.findPath(agtCell,mapCell));
      return;
    }
  }

  // needs a TON more handling, but okay for basic agent obstacle re-route testing
  if(mouseMode=="bldg" && mouseButton=='left'){
    if(gridMap.canBuildBldg(mapCell[0],mapCell[1],3,4)){
      bldgs.push(new Building(mapCell[0],mapCell[1],[3,4],gridMap));
    }
  }

}


function onMouseDown(){
  if(mouseInCanvas()&&mouseIsPressed&&mouseButton==LEFT&&mouseMode=="paint"){
    gridMap.setValueAt(gridMap.cellViaPos(mousePtToVec()),CellType[paintOption]);
  }
} // Ends Function onMouseDown


var toggleSpitMapDefAsP = true;
function keyPressed(){
  if(toggleSpitMapDefAsP && key == 's'){createP(gridMap.mapToString("<br>"));}
  toggleSpitMapDefAsP = false;
}



// using linear search until/unless I implement spatial partitioning
function onSelectAgent(){
  let mapCell = gridMap.cellViaPos(mousePtToVec());
  let result  = agents.filter((a)=>a.inSameCellAsMe(mapCell));
  // in all cases => de-select currently selected agent (A/A)
  if(selAgent){selAgent.isSelected=false;selAgent=null;}
  // at least 1 agent @ mouse cell => select (via global and agent rep)
  if(result.length>0){result[0].isSelected=true; selAgent = result[0];}
}
