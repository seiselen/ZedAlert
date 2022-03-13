class PathFinderUI{
  constructor(pFind,eltLink,cellSize){
    this.pathFind  = pFind;
    this.cSize     = cellSize;
    this.ptDiam    = 8;
    this.sourceTok = new DragObject("source",6,4 ).bindPathFindUI(this);
    this.destinTok = new DragObject("destin",31,53).bindPathFindUI(this);  
    // UI 'Interface' State/Functions for Pathfinder System Demonstrator
    this.curPath   = null;  // current generated path (as output from pathFind.findPath(...))
    this.curCSet   = null;  // current Open Set (as copy of that in pathFind object)
    this.curOSet   = null;  // current Closed Set (as copy of that in pathFind object)
    this.showPath  = true;  // display Path? (A/A)
    this.showCSet  = false; // display Open Set? (A/A)
    this.showOSet  = false; // display Closed Set? (A/A)
    // TEMP Debug Stuff (i.e. not intended for user-side UI/UX)
    this.drawPCell = false;
    this.curPCell  = 0;
    // Init Calls
    this.initUISubPanel(eltLink);
  }

  // Sets up ENTIRE Path-Find Sub-Panel. Simply give it the ID of a <div>
  initUISubPanel(eltLink){
    let tabPathFindInfo = createElement("table").class("tab_subP").parent(eltLink);
    createElement("tr").parent(tabPathFindInfo).child(createElement("td","PathFind Info").class("lab_head2").style("background","rgb(0, 60, 216)").attribute("colspan","2"));
    createElement("tr").parent(tabPathFindInfo).child(createElement("td","Start Cell Coord").class("lab_desc")).child(createElement("td").class("lab_cVal").id("labl_tokenS"));
    createElement("tr").parent(tabPathFindInfo).child(createElement("td","Goal Cell Coord").class("lab_desc")).child(createElement("td").class("lab_cVal").id("labl_tokenG"));
    createElement("tr").parent(tabPathFindInfo).child(createElement("td","Total Path Cost").class("lab_desc")).child(createElement("td").class("lab_cVal").id("labl_pathCost"));
    createElement("tr").parent(tabPathFindInfo).child(createElement("td","Total Path Hops").class("lab_desc")).child(createElement("td").class("lab_cVal").id("labl_pathHops"));

    let tabPathFindOpts = createElement("table").class("tab_subP").parent(eltLink);
    createElement("tr").parent(tabPathFindOpts).child(createElement("td","PathFind Options").class("lab_head2").style("background","rgb(0, 60, 216)").attribute("colspan","2"));
    createElement("tr").parent(tabPathFindOpts).child(createElement("td","Show Path Cells").class("lab_desc")).child(createElement("td").class("lab_cBox").child(createElement("input").attribute("type","checkbox").id("cBox_showPath").attribute("onkeydown","event.preventDefault()")));
    createElement("tr").parent(tabPathFindOpts).child(createElement("td","Show Open Set").class("lab_desc")).child(createElement("td").class("lab_cBox").child(createElement("input").attribute("type","checkbox").id("cBox_showOSet").attribute("onkeydown","event.preventDefault()")));
    createElement("tr").parent(tabPathFindOpts).child(createElement("td","Show Closed Set").class("lab_desc")).child(createElement("td").class("lab_cBox").child(createElement("input").attribute("type","checkbox").id("cBox_showCSet").attribute("onkeydown","event.preventDefault()")));
    createElement("tr").parent(tabPathFindOpts).child(createElement("td").style("text-align","center").style("font-weight","bold").attribute("colspan","2").child(createSpan("Pathfinding Algorithm")).child(createElement("br")).child(createElement("select").id("pathOpt").style("font-size","1em").style("margin-top","4px").style("padding-top","4px").style("padding-bottom","4px").style("color","white").style("background","#181818FF").attribute("onchange","pathFindUI.onSearchAlgoModeChanged(this.value);").child(createElement("option","Breadth-First Search").attribute("value","BFS")).child(createElement("option","Greedy Best-First Search").attribute("value","GBF")).child(createElement("option","Uniform Cost Search").attribute("value","UCS")).child(createElement("option","A* (A-Star) Search").attribute("value","AST"))));
    createElement("tr").parent(tabPathFindOpts).child(createElement("td").class("lab_desc").id("but_pLaunch").style("text-align","center").style("padding-top","8px").attribute("colspan","2").child(createElement("button","LAUNCH PATH").class("inp_but").attribute("name","pathOpt").attribute("onclick","pathFindUI.onPathFindButtonPressed(this.value);").attribute("value","pthL")));
    createElement("tr").parent(tabPathFindOpts).child(createElement("td").class("lab_desc").id("but_pClear").style("text-align","center").style("padding-top","8px").attribute("colspan","2").child(createElement("button","CLEAR PATH").class("inp_but").attribute("name","pathOpt").attribute("onclick","pathFindUI.onPathFindButtonPressed(this.value);").attribute("value","pthC")));
  
    this.labl_tokSCell = select("#labl_tokenS");
    this.labl_tokGCell = select("#labl_tokenG");
    this.labl_pathCost = select("#labl_pathCost");
    this.labl_pathHops = select("#labl_pathHops");

    this.cBox_showPath = select("#cBox_showPath");
    this.cBox_showPath.elt.checked = this.showPath;
    this.cBox_showPath.changed(()=>{this.showPath = this.cBox_showPath.checked()});

    this.cBox_showOSet = select("#cBox_showOSet");
    this.cBox_showOSet.elt.checked = this.showOSet;
    this.cBox_showOSet.changed(()=>{this.showOSet = this.cBox_showOSet.checked()});

    this.cBox_showCSet = select("#cBox_showCSet");
    this.cBox_showCSet.elt.checked = this.showCSet;
    this.cBox_showCSet.changed(()=>{this.showCSet = this.cBox_showCSet.checked()});

    // synch path algo radio option to that specified in pathFind object (should be A* i.e. 'AST')
    select('#pathOpt').selected(PathFinder.Algo.keyViaVal(this.pathFind.curAlgo));

    return this; // for function chaining i.e. @ constructor
  } // Ends Function initPathFindSubPanel

  updateLabels(){
    this.labl_tokSCell.html("["+this.sourceTok.coord+"]");
    this.labl_tokGCell.html("["+this.destinTok.coord+"]");
    this.labl_pathCost.html(this.pathFind.totCost);
    this.labl_pathHops.html((this.curPath) ? this.curPath.length : "N/A");    
  } // Ends Function updateLabels

  pathAction(act){
    switch(act){case 'pthL' : this.launchPath(); return; case 'pthC' : this.clearPath(); return;}
  } // Ends Function pathAction

  launchPath(){
    this.curPath = pathFind.findPath(this.sourceTok.coord,this.destinTok.coord); this.curCSet = pathFind.getClosedSet(); this.curOSet = pathFind.getOpenSet();
  } // Ends Function launchPath

  clearPath(){
    this.curPath=null; this.curCSet=null; this.curOSet=null; pathFind.resetState();
  } // Ends Function clearPath

  onMousePressed(mPt){
    this.sourceTok.onMousePressed(mPt); this.destinTok.onMousePressed(mPt);
  } // Ends Function onMousePressed

  onMouseDragged(mPt){
    this.sourceTok.onMouseDragged(mPt); this.destinTok.onMouseDragged(mPt);
  } // Ends Function onMouseDragged

  onMouseReleased(){
    this.sourceTok.onMouseReleased(); this.destinTok.onMouseReleased();
  } // Ends Function onMouseReleased

  onSearchAlgoModeChanged(value){
    pathFind.setAlgo(value);
  } // Ends Function onSearchAlgoModeChanged

  onPathFindButtonPressed(action){
    pathFindUI.pathAction(action);
  }

  // Exists to assert RENDER CALL order for path-related stuff
  renderPathInfo(){
    rectMode(CENTER);
    this.renderClosedSet();
    this.renderOpenSet(); 
    this.renderPath2(); 
    this.renderTokens();
    rectMode(CORNER);
  } // Ends Function renderPathInfo

  renderPath(){
    if(!this.curPath || !this.showPath){return;}
    stroke(60); fill(255);
    push(); translate(this.ptDiam,this.ptDiam);
    for (let i=0; i<this.curPath.length; i++){ellipse(this.curPath[i][1]*this.cSize, this.curPath[i][0]*this.cSize, this.ptDiam, this.ptDiam);}
    pop();
  } // Ends Function renderPath

  renderPath2(){
    if(!(this.curPath && this.curPath.length>0) || !this.showPath){return;}
    noFill();stroke(0,180,255,96);strokeWeight(this.cSize/2);textAlign(CENTER,CENTER);
    push(); translate(this.ptDiam,this.ptDiam);
    beginShape();for(let i=0; i<this.curPath.length; i++){vertex(this.curPath[i][1]*this.cSize, this.curPath[i][0]*this.cSize);}endShape();
    fill(255);stroke(0);strokeWeight(0.5);textSize(12);
    for(let i=0; i<this.curPath.length; i++){text(i+1,this.curPath[i][1]*this.cSize, this.curPath[i][0]*this.cSize);}
    pop();
  } // Ends Function renderPath2

  renderClosedSet(){
    if(!this.curCSet || !this.showCSet){return;}
    stroke(60);fill(255,255,0); // (216, 120, 0)
    push(); translate(this.ptDiam,this.ptDiam);
    for (let i=0; i<this.curCSet.length; i++){rect(this.curCSet[i][1]*this.cSize, this.curCSet[i][0]*this.cSize, this.ptDiam, this.ptDiam);}
    pop();
  } // Ends Function renderClosedSet

  renderOpenSet(){
    if(!this.curOSet || !this.showOSet){return;}
    stroke(60);fill(0,255,32);
    push(); translate(this.ptDiam,this.ptDiam);
    for (let i=0; i<this.curOSet.length; i++){rect(this.curOSet[i][1]*this.cSize, this.curOSet[i][0]*this.cSize, this.ptDiam, this.ptDiam);}
    pop();
  } // Ends Function renderOpenSet

  renderTokens(){
    this.sourceTok.render(); this.destinTok.render();
  } // Ends Function renderTokens

  renderCursor(){
    if(!mouseInCanvas()){return;}
    stroke(0); noFill();
    push(); 
    translate(mouseX-this.cSize*0.5, mouseY-this.cSize*0.5);
    line(this.cSize*0.5,  this.cSize*.25, this.cSize*0.5, -this.cSize*.25);
    line(this.cSize*0.5,  this.cSize*.75, this.cSize*0.5,  this.cSize*1.25);
    line(-this.cSize*.25, this.cSize*0.5, this.cSize*.25,  this.cSize*0.5);
    line(this.cSize*.75,  this.cSize*0.5, this.cSize*1.25, this.cSize*0.5);
    rect(0,0,this.cSize,this.cSize);
    pop();
  } // Ends Function renderCursor

} // Ends Class PathFinderUI

class DragObject{
  constructor(t,r,c){
    this.token    = t; // s.t {'source' XOR 'destin'}
    this.coord    = [r,c];
    this.pos      = myMap.coordToMidPt(r,c);
    this.diam     = Config.cellSize;
    this.rad      = this.diam/2; 
    this.selected = false; 
    this.mouseOff = null; 
    this.initGFXVals();
  }
  initGFXVals(){this.fill_tokS=color(0,120,216); this.fill_tokG=color(216,0,0); this.fill_ERRR=color(255,0,255); this.strk_reg=color(60); this.strk_sel=color(255); this.sWgt_circ=2;}
  bindPathFindUI(pfui){this.PFUI=pfui; return this;}
  otherTokenCoord(){switch(this.token){case "source": return this.PFUI.destinTok.coord; case "destin": return this.PFUI.sourceTok.coord; default: return [-1,-1];}}  
  onMousePressed(mousePt){if(p5.Vector.dist(mousePt,this.pos) <= this.rad){this.selected = true; this.mouseOff = p5.Vector.sub(this.pos,mousePt); return this;} return null;}
  onMouseDragged(mousePt){if(this.selected){this.pos.set(p5.Vector.add(this.mouseOff,mousePt));}}
  onMouseReleased(mousePt){if(!this.selected){return;} this.selected = false; this.snapToCell(this.pos); let newCoord = myMap.posToCoord(this.pos); if (newCoord == null || arr2Equals(newCoord, this.otherTokenCoord())){this.snapToPrevMRC(); return;} this.coord = newCoord;}  
  snapToPrevMRC(){this.snapToCell(myMap.coordToMidPt(this.coord));}
  snapToCell(newPos){if(newPos==null){return;} this.pos.set(myMap.posToMidPt(newPos));}
  render(){(this.selected) ? stroke(this.strk_sel) : stroke(this.strk_reg); strokeWeight(this.sWgt_circ); switch(this.token){case "source": fill(this.fill_tokS); break; case "destin": fill(this.fill_tokG); break; default: fill(this.fill_ERRR);} ellipse(this.pos.x,this.pos.y,this.diam,this.diam); }
} // Ends Class DragObject