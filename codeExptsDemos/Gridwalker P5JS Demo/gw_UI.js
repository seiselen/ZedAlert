/*======================================================================
|>>> Class GWDemoUIManager
+-----------------------------------------------------------------------
| Description:  Manages UI/UX specific to this project, 'Nuff Said (sans
|               the global var dependencies listed immediately below).
| Dependencies: As follows, and as exhaustive as possible (i.e. stuff is
|               still coming in/out of this class, and will likely do so
|               some more when I merge with ZAC Map/MapEdit classes)
|                > {'cellsWide', 'cellsTall', 'cellSize', 'cellSizeH'}
|                  i.e. global config vals for [grid]world space.
|                > 'agents' = Array of {ZAC} [GridWalker] objects.
|                > 'bldgs' = Array of [GWBldg] objects.
|                > 'tileMap' = A {ZAC} [TileMap] object.
|                > 'spMap' = A {ZAC} [SPMap] object
|                > 'pathFind' = Instance of a [GWPathfinder] object,
|                  which will eventually be replaced with its unified
|                  ZAC analog [ZACPathfinder] of which will likely keep
|                  the same name (but not necessarily the same function
|                  names, so do double-check!)
|                > TileType object (imported via index.html)
+=====================================================================*/
class GWDemoUIManager{
  constructor(){
    //> State Variable Inits
    this.selAgent  = null;
    this.curMode   = "agent";
    this.paintOpt  = "DIRT";
    this.agentOpt  = "sel";
    this.showOCSet = true;
    //> Init/Loader Calls
    this.initUI();
  }

  initUI(){
    //> Additional State Var Inits
    this.labl_curFPS     = select("#labl_curFPS");
    this.labl_mousePos   = select("#labl_mousePos");
    this.labl_mouseCell  = select("#labl_mouseCell");
    this.cBox_showOCSets = select("#cBox_showOCSets");
    this.cBox_showGrid   = select("#cBox_showGrid");
    this.cBox_showSPMap  = select("#cBox_showSPMap");
    this.mseOpts         = document.getElementsByName('mse');
    this.agtOpts         = document.getElementsByName('agt');
    this.pntOpts         = document.getElementsByName('pnt');

    //> Synch checkboxes with at-init vals of corresponding vars
    this.cBox_showOCSets.elt.checked = this.showOCSet;
    this.cBox_showOCSets.changed(()=>{this.showOCSet = this.cBox_showOCSets.checked()});
    
    spMap.showGrid = false; // will be using tile_map to render grid, so unflag for sp_map
    this.cBox_showGrid.elt.checked = tileMap.showGrid;
    this.cBox_showGrid.changed(()=>{tileMap.showGrid = this.cBox_showGrid.checked()});

    this.cBox_showSPMap.elt.checked = spMap.showCells;
    this.cBox_showSPMap.changed(()=>{spMap.showCells = this.cBox_showSPMap.checked()});  

    // synch (set) agent and paint radio buttons to that specified in main.js
    this.agtOpts.forEach((item)=>{if(item.value.substring(4)==this.agentOpt){item.checked=true;}});
    this.pntOpts.forEach((item)=>{if(item.value.substring(4)==this.paintOpt){item.checked=true;}});

    // [SOLUTION] synch DOM UI tile radio button backgrounds to that of tile colors (finally figured out how to do this!)
    let temp = "";
    this.pntOpts.forEach((item)=>{if(item.value.substring(4)==this.paintOpt){item.checked=true;} temp = TileType.valToColArr(item.value); item.parentNode.style.background = "rgb("+temp[0]+", "+temp[1]+", "+temp[2]+")";});

    // set mouse mode as specified in main.js; then disable counterparts' options
    this.mseOpts.forEach((item)=>{if(item.value==this.curMode){item.checked=true;}});
    this.onMouseModeChanged({value: this.curMode});
    this.updateLabels();
  } // Ends Function initUI


  //====================================================================
  //>>> UI HANDLERS
  //====================================================================
  onMouseModeChanged(newItem){
    this.curMode = newItem.value;
    switch(newItem.value){
      case "agent" : this.pntOpts.forEach((p)=>p.disabled=true);  this.agtOpts.forEach((a)=>a.disabled=false); return;
      case "paint" : this.pntOpts.forEach((p)=>p.disabled=false); this.agtOpts.forEach((a)=>a.disabled=true); return;
      case "bldg"  : this.pntOpts.forEach((p)=>p.disabled=true);  this.agtOpts.forEach((a)=>a.disabled=true); return;
    }
  }

  onRadOptChanged(newItem){
    switch(newItem.name){
      case "agt" : this.agentOpt=newItem.value; return;
      case "pnt" : this.paintOpt=newItem.value; return;
    }
  }

  // mButton==[0] => it was never yet clicked, which should be impossible iff this is called from p5js mouse handler
  onMousePressed(mButton){
    let id = this.curMode[0]+mButton[0]; // {ar,al,br,bl,pr,pl}
    switch(id){
      case 'ar' : this.doAgtPathTask(); return;
      case 'al' : this.doAgtOptTask(); return;
      case 'bl' : this.doBldgOptTask(); return;
    }
  }

  onMouseDown(mButton){
    if(mButton==LEFT&&this.curMode=="paint"){this.doMapPaintTask();}
  }

  onKeyPressed(k){
    if(k=='s'){select("#ghettoMapText").html(tileMap.mapToString("<br>"));}
  }

  //====================================================================
  //>>> UI AND OTHER ACTIONS
  //====================================================================
  getMouseCoord(){return tileMap.posToCoord(mousePtToVec());}
  doAgtOptTask(){switch(this.agentOpt){case 'sel': this.selectAgent(this.getMouseCoord()); return; case 'add': this.createAgent(this.getMouseCoord()); return; case 'rem': this.removeAgent(this.getMouseCoord()); return;}}
  doAgtPathTask(){if(this.selAgent){this.selAgent.givePath(pathFind.findPath(tileMap.posToCoord(this.selAgent.pos),this.getMouseCoord()));}}
  doBldgOptTask(){this.createBldg(this.getMouseCoord());}
  doMapPaintTask(){tileMap.setValueAt(this.getMouseCoord(),TileType[this.paintOpt]);}  

  // dimension FIXED to [3x4] for now, will (obviously) be procedural in the future
  createBldg(coord){
    // MUST check that ALL containing cells are [VACANT] BEFORE instantiating! 
    if(tileMap.canBuildBldg(coord[0],coord[1],3,4)&&spMap.canBuildBldg(coord[0],coord[1],3,4)){bldgs.push(new GWBldg(coord[0],coord[1],[3,4],spMap));}
    else{console.error("Error! Unable to create building at coord ["+coord+"].");}   
  } // Ends Function createBldg

  // using linear search until/unless I implement spatial partitioning
  selectAgent(coord){
    let result = agents.filter((a)=>a.inSameCellAsMe(coord));
    // in all cases => de-select currently selected agent (A/A)
    if(this.selAgent){this.selAgent.isSelected=false;this.selAgent=null;}
    // at least 1 agent @ mouse cell => select (via global and agent rep)
    if(result.length>0){result[0].isSelected=true; this.selAgent = result[0];}
  } // Ends Function selectAgent

  createAgent(coord){
    // MUST check that desired cell to spawn agent is [VACANT] BEFORE instantiating!
    if(spMap.isCellVacant(coord)){
      agents.push(new GridWalker(coord[0],coord[1],cellSize/2,spMap).setToUsingSP()); 
      agents[agents.length-1].ID = agents.length;
      return;
    }
    console.error("Error! Unable to create agent at coord ["+coord+"].");
  } // Ends Function createAgent

  // stub right now, but trivial implementation once [SPMap] is set up with this project
  removeAgent(coord){
    // should only be one agent per cell (gridwalker) for awhile until implementing body-units
    /*let result = agents.filter((a)=>a.inSameCellAsMe(coord));*/
    // NEXT, HAVE AGENT CALL MAP'S <removePos> FUNCTION WITH PROPER PARM INPUT
    // THEN, CAN REMOVE AGENT FROM <agents> AND OTHER STUFF (OR FUTURE OBJ POOL RECYCLE WLOG)
    return true; // TEMP so it does something i.e. REMOVE once this is implemented
  } // Ends Function removeAgent

  loadMapAgtConfig(mapCfg,agtCfg){
    tileMap.loadMap(mapCfg);
    agtCfg.forEach((rc)=>this.createAgent(rc));
  } // Ends Function loadMapAgtConfig

  updateLabels(){
    this.labl_curFPS.html(round(frameRate(),2));
    this.labl_mousePos.html((mouseInCanvas()) ? "("+round(mouseX)+","+round(mouseY)+")" : "N/A");
    this.labl_mouseCell.html((mouseInCanvas()) ? "["+tileMap.posToCoord(mousePtToVec())+"]" : "N/A");
  } // Ends Function updateLabels

  drawCursor(){
    if(!mouseInCanvas()){return;}
    let sRand = map(sin(((frameCount%30)/30)*PI),-1,1,127,255);
    let mCell = this.getMouseCoord();
    noCursor();
    push(); 
      translate(mCell[1]*cellSize, mCell[0]*cellSize);
      switch(this.curMode){
        case "paint": stroke(0,255,0,sRand); strokeWeight(2); fill(TileType.valToColArr(this.paintOpt)); rect(0,0,cellSize,cellSize); break;
        case "agent": noFill(); strokeWeight(3); switch(this.agentOpt){
        case "sel": stroke(60,60,255,sRand); ellipse(cellSizeH,cellSizeH,cellSize,cellSize); break; case "add": stroke(60,255,60,sRand); line(cellSizeH,0,cellSizeH,cellSize); line(0,cellSizeH,cellSize,cellSizeH); rect(0,0,cellSize,cellSize); break; case "rem": stroke(255,60,60,sRand); line(0,0,cellSize,cellSize); line(0,cellSize,cellSize,0); rect(0,0,cellSize,cellSize); break;} break;
        case "bldg": noFill(); strokeWeight(4); {spMap.canBuildBldg(mCell[0],mCell[1],3,4) ? stroke(60,255,60,sRand) : stroke(255,60,0,sRand)}; rect(0,0,cellSize*3,cellSize*4); break;
      }
    pop();
  } // Ends Function drawCursor


  renderPathFindInfo(){if(this.showOCSet){this.displayBothSets()};}

  displayBothSets(){ellipseMode(CENTER);this.showOpenSet();this.showClosedSet();this.drawPath();}
  showClosedSet(){for(let i=0; i<pathFind.closedSet.length; i++){pathFind.closedSet[i].render(color(255,120,0));}}
  showOpenSet(){for(let i=0; i<pathFind.openSet.length; i++){pathFind.openSet[i].render(color(0,255,0));}}
  drawPath(){
      if(pathFind.lastPath.length>0){
        noFill();stroke(0,180,255,96);strokeWeight(cellSize/2);
        beginShape();for(let i=0; i<pathFind.lastPath.length; i++){vertex(pathFind.lastPath[i].x,pathFind.lastPath[i].y);}endShape();
        stroke(255);strokeWeight(1);textSize(12);
        for(let i=0; i<pathFind.lastPath.length; i++){text(i,pathFind.lastPath[i].x,pathFind.lastPath[i].y);}
      }
  }



} // Ends Class GWDemoUIManager












