
var labl_curFPS, labl_mousePos, labl_mouseCell;
var cBox_showOCSets, cBox_showGrid, cBox_showSPMap;
var mseOpts, agtOpts, pntOpts;


function initUI(){
  labl_curFPS = select("#labl_curFPS");
  labl_mousePos = select("#labl_mousePos");
  labl_mouseCell = select("#labl_mouseCell");

  cBox_showOCSets = select("#cBox_showOCSets");
  cBox_showOCSets.elt.checked = showOCSet;
  cBox_showOCSets.changed(()=>{showOCSet = cBox_showOCSets.checked()});

  cBox_showGrid = select("#cBox_showGrid");
  cBox_showGrid.elt.checked = gridMap.showGrid;
  cBox_showGrid.changed(()=>{gridMap.showGrid = cBox_showGrid.checked()});

  cBox_showSPMap = select("#cBox_showSPMap");
  cBox_showSPMap.elt.checked = gridMap.showSPMap;
  cBox_showSPMap.changed(()=>{gridMap.showSPMap = cBox_showSPMap.checked()});  

  mseOpts = document.getElementsByName('mseMode');
  agtOpts = document.getElementsByName('agtMode');
  pntOpts = document.getElementsByName('pntMode');

  // synch (set) agent and paint radio buttons to that specified in main.js
  agtOpts.forEach((item)=>{if(item.value.substring(4)==agentOption){item.checked=true;}});
  pntOpts.forEach((item)=>{if(item.value.substring(4)==paintOption){item.checked=true;}});

  // set mouse mode as specified in main.js; then disable counterparts' options
  mseOpts.forEach((item)=>{if(item.value==mouseMode){item.checked=true; onMouseIntrctModeChanged(item);}});
  updateLabels();
}

function updateLabels(){
  labl_curFPS.html(round(frameRate(),2));
  labl_mousePos.html((mouseInCanvas()) ? "("+round(mouseX)+","+round(mouseY)+")" : "N/A");
  labl_mouseCell.html((mouseInCanvas()) ? "["+gridMap.cellViaPos(mousePtToVec())+"]" : "N/A");
}

function onMouseIntrctModeChanged(newItem){
  mouseMode = newItem.value;
  switch(mouseMode){
    case "agent" : 
      pntOpts.forEach((pItm)=>pItm.disabled=true); 
      agtOpts.forEach((aItm)=>aItm.disabled=false); 
      return;
    case "paint" : 
      pntOpts.forEach((pItm)=>pItm.disabled=false); 
      agtOpts.forEach((aItm)=>aItm.disabled=true); 
      return;
  }
}

function onSelOrPntOptionChanged(newItem){
  let pref = newItem.value.substring(0,3);
  let suff = newItem.value.substring(4);
  switch(pref){
    case "agt" : agentOption = suff; return;
    case "pnt" : paintOption = suff; return;
  }
}

function onSearchAlgoOptionChanged(newItem){
  console.log(newItem.value);
}