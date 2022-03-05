var Config = {cellsWide:64, cellsTall:48, cellSize:16,}
var mouseMode = "path";

var myMap;
var pathFind, pathFindUI;
var mapEdit, mapEditUI;

function setup(){
  createCanvas(1024,768).parent("pane_viz");
  myMap      = new TileMap(Config.cellsTall,Config.cellsWide,Config.cellSize);
  pathFind   = new PathFinder(myMap, null); // null because no SP within this project [yet?...]
  mapEdit    = new MapEditor(myMap);
  pathFindUI = new PathFinderUI(pathFind,"#pathOptions",Config.cellSize);
  mapEditUI  = new MapEditUI(mapEdit,"#paintOptions");
  // WARNING: ALL DEPENDENCIES MUST BE INIT'D BEFORE CALLING THIS!
  initUI();
}

function draw(){
  //>>> UI CALLS
  onMouseDown();
  //>>> UPDATE CALLS
  updateLabels();
  //>>> RENDER CALLS
  background(255);
  renderUIUX();
  drawCanvasBorder();
}

function keyPressed(){
  key = key.toLowerCase();
  if(key=='g'){onToggleShowGrid();}
}

function mousePressed(){
  if(mouseInCanvas()&&mouseButton==LEFT){
    switch(mouseMode){
      case "path"  : pathFindUI.onMousePressed(mousePtToVec()); return;
      case "paint" : mapEditUI.onMousePressed(); return;
    }
  }
} // Ends Function mousePressed

function mouseReleased(){
  pathFindUI.onMouseReleased();
} // Ends Function mouseReleased

function mouseDragged(){
  if(mouseInCanvas()&&mouseButton==LEFT&&mouseMode=="path"){pathFindUI.onMouseDragged(mousePtToVec());}
} // Ends Function mouseDragged

function onMouseDown(){
  if(mouseInCanvas()&&mouseIsPressed&&mouseButton==LEFT&&mouseMode=="paint"){mapEditUI.onMouseDown();}
} // Ends Function onMouseDown

function mouseWheel(event){
  mapEditUI.onMouseWheel(event);
} // Ends Function mouseWheel



/*======================================================================
|>>> DOM UI (INIT THEREOF AND HANDLERS THERETO)
+=====================================================================*/
var labl_curFPS, labl_mousePos, labl_mouseCell, cBox_showGrid;

function initUI(){
  labl_curFPS = select("#labl_curFPS");
  labl_mousePos = select("#labl_mousePos");
  labl_mouseCell = select("#labl_mouseCell");
  cBox_showGrid = select("#cBox_showGrid");
  cBox_showGrid.elt.checked = myMap.showGrid;
  cBox_showGrid.changed(()=>{myMap.toggleShowGrid(); cBox_showGrid.elt.checked=myMap.showGrid;});
  onMouseIntrctModeChanged({value:this.mouseMode});
  updateLabels();
}

function updateLabels(){
  labl_curFPS.html(round(frameRate(),2));
  labl_mousePos.html((mouseInCanvas()) ? "("+round(mouseX)+","+round(mouseY)+")" : "N/A");
  labl_mouseCell.html((mouseInCanvas()) ? "["+myMap.posToCoord(mousePtToVec())+"]" : "N/A");
  pathFindUI.updateLabels();
  mapEditUI.updateLabels();
}

function onMouseIntrctModeChanged(newItem){
  mouseMode = newItem.value;
  switch(mouseMode){
    case "path" : select("#paintOptions").elt.hidden=true; select("#modePaint").elt.disabled=false; select("#pathOptions").elt.hidden=false; select("#modePath").elt.disabled=true; return;
    case "paint" : select("#paintOptions").elt.hidden=false; select("#modePaint").elt.disabled=true; select("#pathOptions").elt.hidden=true; select("#modePath").elt.disabled=false; return;
  }
}

function renderUIUX(){
  myMap.renderMap();
  switch(mouseMode){
    case 'paint': mapEdit.renderCursor(); myMap.renderGrid(); pathFindUI.renderPathInfo(); break;
    case 'path' : myMap.renderGrid(); pathFindUI.renderPathInfo(); pathFindUI.renderCursor(); break;
  }  
}