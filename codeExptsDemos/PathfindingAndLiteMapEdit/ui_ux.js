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