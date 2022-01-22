/*======================================================================
|>>> SPECIFIC TO LAUNCHING, CLEARING, AND RENDERING PATHFIND DATA
+=====================================================================*/
var pathTokens = {
  init(){
    this.start = createDragObject("start",6,4);
    this.goal  = createDragObject("goal",6,25);
    this.vals  = [this.start, this.goal];
    this.getOtherToken = function(t_obj){return (t_obj.token=="start") ? pathTokens.goal : pathTokens.start;},
    this.getCoord = function(t_tag){switch(t_tag){case 'start': return pathTokens.start.coord; case 'goal': return pathTokens.goal.coord;} return '';},
    this.render = function(){pathTokens.vals.forEach(tok => tok.render());}
  }
};

function launchPathUIUX(){curPath=pathFind.findPath(pathTokens.getCoord('start'),pathTokens.getCoord('goal')); curCSet=pathFind.getClosedSet(); curOSet = pathFind.getOpenSet();}
function clearPathUIUX(){curPath=null; curCSet=null; curOSet=null; pathFind.resetState();}

function renderPath(){
  if(!curPath || !showPath){return;}
  stroke(60); fill(255);
  push(); translate(Config.pthPtDiam,Config.pthPtDiam);
  for (let i=0; i<curPath.length; i++){ellipse(curPath[i][1]*Config.cellSize, curPath[i][0]*Config.cellSize, Config.pthPtDiam, Config.pthPtDiam);}
  pop();
} // Ends Function renderPath

function renderPath2(){
  if(!(curPath && curPath.length>0) || !showPath){return;}
  noFill();stroke(0,180,255,96);strokeWeight(Config.cellSize/2);textAlign(CENTER,CENTER);
  push(); translate(Config.pthPtDiam,Config.pthPtDiam);
  beginShape();for(let i=0; i<curPath.length; i++){vertex(curPath[i][1]*Config.cellSize, curPath[i][0]*Config.cellSize);}endShape();
  fill(255);stroke(0);strokeWeight(0.5);textSize(12);
  for(let i=0; i<curPath.length; i++){text(i+1,curPath[i][1]*Config.cellSize, curPath[i][0]*Config.cellSize);}
  pop();
} // Ends Function renderPath2

function renderClosedSet(){
  if(!curCSet || !showCSet){return;}
  stroke(60);fill(255,255,0); // (216, 120, 0)
  push(); translate(Config.pthPtDiam,Config.pthPtDiam);
  for (let i=0; i<curCSet.length; i++){ellipse(curCSet[i][1]*Config.cellSize, curCSet[i][0]*Config.cellSize, Config.pthPtDiam, Config.pthPtDiam);}
  pop();
} // Ends Function renderClosedSet

function renderOpenSet(){
  if(!curOSet || !showOSet){return;}
  stroke(60);fill(0,255,0);
  push(); translate(Config.pthPtDiam,Config.pthPtDiam);
  for (let i=0; i<curOSet.length; i++){ellipse(curOSet[i][1]*Config.cellSize, curOSet[i][0]*Config.cellSize, Config.pthPtDiam, Config.pthPtDiam);}
  pop();
} // Ends Function renderOpenSet

/*======================================================================
|>>> SPECIFIC TO IN-CANVAS UI (P5JS UI HANDLERS WHICH REMAIN IN main.js)
+=====================================================================*/
function drawPathModeCursor(){
  if(!mouseInCanvas()){return;}
  let cSize = Config.cellSize;
  stroke(0); noFill();
  push(); 
  translate(mouseX-cSize*0.5, mouseY-cSize*0.5);
  line(cSize*0.5,cSize*.25,cSize*0.5,-cSize*.25);
  line(cSize*0.5,cSize*.75,cSize*0.5,cSize*1.25);
  line(-cSize*.25,cSize*0.5,cSize*.25,cSize*0.5);
  line(cSize*.75,cSize*0.5,cSize*1.25,cSize*0.5);
  rect(0,0,cSize,cSize);
  pop();
} // Ends Function drawPathModeCursor

/*======================================================================
|>>> DOM UI (INIT THEREOF AND HANDLERS THERETO)
+=====================================================================*/
var labl_curFPS, labl_mousePos, labl_mouseCell, labl_tokenS, labl_tokenG, labl_pathCost, labl_pathHops;
var cBox_showOSet, cBox_showCSet, cBox_showGrid, cBox_showPath, cBox_floodFillTile, pathOpts, pntOpts;

function initUI(){
  labl_curFPS = select("#labl_curFPS");
  labl_mousePos = select("#labl_mousePos");
  labl_mouseCell = select("#labl_mouseCell");
  labl_tokenS = select("#labl_tokenS");
  labl_tokenG = select("#labl_tokenG");
  labl_pathCost = select("#labl_pathCost");
  labl_pathHops = select("#labl_pathHops");

  cBox_showPath = select("#cBox_showPath");
  cBox_showPath.elt.checked = showPath;
  cBox_showPath.changed(()=>{showPath = cBox_showPath.checked()});

  cBox_showOSet = select("#cBox_showOSet");
  cBox_showOSet.elt.checked = showOSet;
  cBox_showOSet.changed(()=>{showOSet = cBox_showOSet.checked()});

  cBox_showCSet = select("#cBox_showCSet");
  cBox_showCSet.elt.checked = showCSet;
  cBox_showCSet.changed(()=>{showCSet = cBox_showCSet.checked()});

  cBox_showGrid = select("#cBox_showGrid");
  cBox_showGrid.elt.checked = myMap.showGrid;
  cBox_showGrid.changed(()=>{onToggleShowGrid()});

  cBox_floodFillTile = select("#floodFillToggle");
  cBox_floodFillTile.elt.checked = mapEdit.paintFill;
  cBox_floodFillTile.changed(()=>{mapEdit.paintFill = cBox_floodFillTile.checked()});  

  // synch (make checked) path algo radio option to that specified in pathFind object (should be A* i.e. 'AST')
  pathOpts = document.getElementsByName('pathOpt');  
  let curAlgoKey = '';  
  Object.keys(PathAlgo).forEach(k=>{if(PathAlgo[k]==pathFind.curAlgo){curAlgoKey=k;}})
  pathOpts.forEach(o=>{if (o.value==curAlgoKey){o.checked=true;}})

  // synch (set checked) cell tile paint radio option to that specified in main.js
  pntOpts = document.getElementsByName('pntOpt');
  pntOpts.forEach((item)=>{if(item.value==mapEdit.paintType){item.checked=true;}});

  onMouseIntrctModeChanged({value:mouseMode});
  updateLabels();


}

function updateLabels(){
  labl_curFPS.html(round(frameRate(),2));
  labl_mousePos.html((mouseInCanvas()) ? "("+round(mouseX)+","+round(mouseY)+")" : "N/A");
  labl_mouseCell.html((mouseInCanvas()) ? "["+myMap.posToCoord(mousePtToVec())+"]" : "N/A");
  labl_tokenS.html(pathTokens.start.coord);
  labl_tokenG.html(pathTokens.goal.coord);
  labl_pathCost.html(pathFind.curCost); // TEMP - TODO will be replaced with something like "pathFind.pathCost" else some getter thereto/equiv
  labl_pathHops.html( (curPath) ? curPath.length :  "N/A"); // TEMP - TODO will be replaced with something like "pathFind.pathHops" else some getter thereto/equiv
}

function onToggleShowGrid(){
  myMap.toggleShowGrid();
  cBox_showGrid.elt.checked = myMap.showGrid;

}

function onMouseIntrctModeChanged(newItem){
  mouseMode = newItem.value;
  switch(mouseMode){
    case "path" :
      select("#paintOptions").elt.hidden=true; select("#modePaint").elt.disabled = false;
      select("#pathOptions").elt.hidden=false; select("#modePath").elt.disabled = true;
      return;
    case "paint" : 
      select("#paintOptions").elt.hidden=false; select("#modePaint").elt.disabled = true;
      select("#pathOptions").elt.hidden=true; select("#modePath").elt.disabled = false;  
      return;
  }
}


function onSaveMapDialogue(){
  (confirm("Save Current Map Info To <p> Below Canvas?")) ? select("#mapInfoOutGhettoStyle").html(myMap.mapToString()) :
  (confirm("Delete Existing Map Info In <p> Below Canvas?")) ? select("#mapInfoOutGhettoStyle").html("") : '' ;
}

function onLoadMapDialogue(){
  if (confirm("Load An Existing Map ? (Via Text Input Of Name)")){
    let name = prompt("Enter Map Name/ID (As Assigned In 'MapDefs' Object)","???");
    let mapDef = MapDefs[name]; 
    if(mapDef){myMap.loadMap(mapDef); alert("Map Should Load On Pressing [OK]")} else{alert("Cannot Find Map");}
  }
}




function onTilePaintOptionChanged(newItem){mapEdit.setPaintType(TileType[newItem.value]);}
function onSearchAlgoModeChanged(value){pathFind.setAlgo(value);}
function onPathFindButtonPressed(value){switch(value){case 'launch' : launchPathUIUX(); return; case 'clear' : clearPathUIUX(); return;}}