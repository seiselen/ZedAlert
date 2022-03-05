/*======================================================================
|>>> Class GridMap                                     [ZED ALERT - MVP]
+-----------------------------------+-----------------------------------
| Author:    Steven Eiselen         | Language:  JavaScript 
| Project:   Zed Alert a.k.a. ZAC   | Library:   P5JS (p5js.org/)
+-----------------------------------+-----------------------------------
| Description: TODO
+-----------------------------------------------------------------------
[AS-YOU-BUILD] Implementation Notes 
  o <coordToTLPt> and <coordToMidPt> : Out-Of-Bounds input NOT HANDLED!
  o <coordToMidPt> : Calls 'coordToTLPt' before adding [cellWide] to its
    {x,y} components. Although this is correct (and technically good OOP
    vis-a-vis preventing duplicate code, it bothers my 'code optimality
    OCD'. Screw the latter, though: KISS and I can always refactor A/A.
  o <coordToPos> : Keeping for now as 'legacy'; but it's also DEPRECATED
    vis-a-vis being renamed <coordToMidPt>. Calling the former will call
    the latter to return the desired info; but not before a console warn
    call which nags at the caller to reference the new name instead!
  o <toggleVizMode> : STUB as GridMap acts as quasi Abstract Class, thus
    doesn't have viz modes, ergo exists only to imply that children do
    (if not implicitly assert) that children classes will implement them
  o <initMap> : STUB as GridMap functions as quasi Abstract Class, thus
    children classes are intented to be [further] implemented; ergo only
    exists to implicitly assert that children classes will implement it.
  o <renderMap> : STUB as GridMap acts as quasi Abstract Class, thus it
    implies that children classes will be implementing this
  o <setValueAt> : does NOT handle invalid vals to KISS, map viz and/or 
    cell val will let you know if there's an issue in-lieu-thereof
  o [mapMode] : Assigned [-1] for the usual reasons aforementioned...
  o WRT StAgE: [Body Unit] SteeringMotor components will now refer to
   [SoundGrid] and [ScentGrid] for their flowfields to follow.
+-----------------------------------------------------------------------
|########## Zed Alert concept and code[base] © Steven Eiselen ##########
+=====================================================================*/
class GridMap {
  constructor(cT,cW,cS){
    this.cellsTall   = cT;
    this.cellsWide   = cW;
    this.cellSize    = cS;
    this.cellHalf    = this.cellSize/2;
    this.cellQuar    = this.cellSize/4;
    this.gridWide    = this.cellsWide*this.cellSize;
    this.gridTall    = this.cellsTall*this.cellSize;    
    this.map         = [];
    this.curMapMode  = -1;
    this.numMapModes = 0;
    this.showGrid    = true;
    this.showCells   = true;
    this.initColorPallete();
  } // Ends Constructor

  initColorPallete(){
    //> Grid-Related Settings
    this.strk_grid  = color(60,128);    
    this.sWgt_grid  = 2; 
    //> Text-Related Settings
    this.fill_text  = color(0);
    this.size_text  = this.cellHalf;
    //> Good 'Ol 'Error Purple'
    this.fill_ERROR = color(255,0,255);
  } // Ends Function initColorPallete

  toggleShowGrid(){
    this.showGrid=!this.showGrid;
  } // Ends Function toggleShowGrid

  toggleShowCells(){
    this.showCells=!this.showCells;
  } // Ends Function toggleShowCells

  initMap(){
    console.warn("THIS IS A STUB METHOD OF [GridMap] - SHOULD NOT BE SEEING THIS! CHECK UR CODE!");
  } // Ends Function initMap

  toggleVizMode(){
    this.curMapMode = (this.curMapMode+1)%this.totMapModes;
  } // Ends Function toggleVizMode


  distBetweenCoords(p,q){
    return this.coordToMidPt(p).dist(this.coordToMidPt(q));
  } // Ends Function distBetweenCoords

  getValueAt(p,q){
    switch(arguments.length){
      case 1 : return (this.cellInBounds(p)) ? this.map[p[0]][p[1]] : undefined;
      case 2 : return (this.cellInBounds(p,q)) ? this.map[p][q] : undefined;
      default: return undefined;
    }
  } // Ends Function getValueAt

  setValueAt(p,q,d){
    switch(arguments.length){
      case 2 : if(this.cellInBounds(p)){this.map[p[0]][p[1]]=q}; return;
      case 3 : if(this.cellInBounds(p,q)){this.map[p][q]=d;}; return;
      default: console.error("Error! Invalid Parms!\n"+arguments); // nice method BTW!
    }
  } // Ends Function setValueAt

  posToCoord(pos){
    return [floor(pos.y/this.cellSize),floor(pos.x/this.cellSize)];
  } // Ends Function posToCoord

  posToMidPt(pos){
    return this.coordToMidPt(this.posToCoord(pos));
  } // Ends Function posToMidPt

  coordToTLPt(p,q){
    switch(arguments.length){
      case 1: return vec2(p[1]*this.cellSize, p[0]*this.cellSize);
      case 2: return vec2(q*this.cellSize, p*this.cellSize);
      default: return undefined;
    }
  } // Ends Function coordToTLPt

  coordToMidPt(p,q){
    switch(arguments.length){
      case 1: return this.coordToTLPt(p[0],p[1]).add(this.cellHalf,this.cellHalf);
      case 2: return this.coordToTLPt(p,q).add(this.cellHalf,this.cellHalf);
      default: return undefined;
    }
  } // Ends Function coordToMidPt

  coordToPos(p,q){
    console.warn("Function 'coordToPos' has been RENAMED 'coordToMidPt' - call this new name instead!");
    return this.coordToMidPt(p,q); // but i'm nice so i'll give the caller the desire info
  } // Ends Function coordToPos

  cellInBounds(p,q){
    switch(arguments.length){
      case 1: return (p[0]>=0 && p[0]<this.cellsTall && p[1]>=0 && p[1]<this.cellsWide);
      case 2: return (p>=0 && p<this.cellsTall && q>=0 && q<this.cellsWide);
      default: return false;
    }
  } // Ends Function cellInBounds

  posInBounds(pos){
    return (pos.x>=0 && pos.y>=0 && pos.x<this.gridWide && pos.y<this.gridTall);
  } // Ends Function posInBounds

  render(){
    this.renderMap();
    this.renderGrid();
  } // Ends Function render

  renderGrid(){
    if(!this.showGrid){return;}
    stroke(this.strk_grid); strokeWeight(this.sWgt_grid);
    for(let h=0; h<=this.cellsTall; h++){line(0,this.cellSize*h,this.gridWide,this.cellSize*h);}
    for(let v=0; v<=this.cellsWide; v++){line(this.cellSize*v,0,this.cellSize*v,this.gridTall);}
  } // Ends Function renderGrid

  renderMap(){
    console.warn("THIS IS A STUB METHOD OF [GridMap] - SHOULD NOT BE SEEING THIS! CHECK UR CODE!");
  } // Ends Function renderMap

} // Ends Class GridMap