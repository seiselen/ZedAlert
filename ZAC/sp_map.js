/*======================================================================
|>>> Class GridSPMap (Grid Spatial Partition Map)      [ZED ALERT - MVP]
+-----------------------------------+-----------------------------------
| Author:    Steven Eiselen         | Language:  JavaScript 
| Project:   Zed Alert a.k.a. ZAC   | Library:   P5JS (p5js.org/)
+-----------------------------------+-----------------------------------
| Description: TODO
+-----------------------------------------------------------------------
[AS-YOU-BUILD] Implementation Notes
  o Map Modes: 
      [0] : nothing i.e. hide it
      [1] : population count       (as-used-with SPDemo)
      [2] : population heatmap     (as-used-with SPDemo)
      [3] : binary vacant/occupied (as-used-with 'GridwalkerP5JS') 
+-----------------------------------------------------------------------
|########## Zed Alert concept and code[base] © Steven Eiselen ##########
+=====================================================================*/
class GridSPMap extends GridMap{
  constructor(cT,cW,cS){
    super(cT,cW,cS);
    this.curMapMode  = 3;
    this.totMapModes = 4;
    this.newCoords   = []; // cache variable used by 'updatePos' function group
    this.curCellPop  = -1  // cache variable used by 'renderHeatMap' and 'renderCellPop'
    this.initColorPallete();
    this.initMap();
  } // Ends Constructor

  initColorPallete(){
    super.initColorPallete();
    //> For Binary VAC/OCC Mode
    this.fill_SP_occ = color(216,168,240,128); 
    this.fill_SP_vac = color(0,0);
    //> For Population Heatmap Mode
    this.fill_HM_min = color(156,204,228); // ;color(222,235,247);
    this.fill_HM_max = color(12,48,108); // ;color(33,113,181);
    //> For Population Count Mode
    this.fill_CP     = color(216);
    this.txtSize_CP  = 12;
    this.txtColor_CP = color(0);
    this.sWgt_CP     = 1.25;
  } // Ends Function initColorPallete

  initMap(){
    for (let r=0; r<this.cellsTall; r++) {
      this.map[r]=[];
      for (let c=0; c<this.cellsWide; c++) {
        this.map[r].push(new Map());
      }
    }
  } // Ends Function initSPMap

  /*--------------------------------------------------------------------
  |>>> Function updatePos
  +---------------------------------------------------------------------
  | Description: 'Gateway' via which all agents utilizing the SP system 
  |              both update it via their current position, and receive
  |              either an updated cell coord else null (which implies
  |              that they remain within their current map cell).
  | TODO:        Choose one of the following definitions at some point
  +-------------------------------------------------------------------*/
  updatePos(obj){
    //return this.updatePos1(obj);
    return this.updatePos2(obj);
  } // Ends Function updatePos

  updatePos1(obj){
    //> Compute cell coords based on current position
    let newCoords = this.posToCoord(obj.pos);
    //> Inside same cell as last update => Do nothing but return null
    if(obj.curCoord != null && obj.curCoord[0]==newCoords[0] && obj.curCoord[1]==newCoords[1] ){return null;}
    //> Agent is in new cell => Complete updatePos operation based on current SP mode
    if(obj.curCoord != null){this.map[obj.curCoord[0]][obj.curCoord[1]].delete(obj.ID);}
    this.map[newCoords[0]][newCoords[1]].set(obj.ID,obj);
    //> Return new coords as 'handshake' of successful update
    return newCoords;
  } // Ends Function updatePos1

  updatePos2(obj){
    //>>> Compute cell coords based on current position
    let newCoords = this.posToCoord(obj.pos);
    //>>> Agent has a curent coordinate
    if(obj.curCoord){
      //>>> In same cell as last update => immediately return null (agent responsible to understand + handle this)
      if(obj.curCoord[0]==newCoords[0]&&obj.curCoord[1]==newCoords[1]){return null;}
      //>>> Agent now in different cell => Update SP Map accordingly
      this.map[obj.curCoord[0]][obj.curCoord[1]].delete(obj.ID);
    }
    this.map[newCoords[0]][newCoords[1]].set(obj.ID,obj);
    return newCoords;
  } // Ends Function updatePos2



  /*--------------------------------------------------------------------
  |>>> Function removePos 
  +---------------------------------------------------------------------
  | Description: Called for an object in one of two situations to ensure
  |              accurate/correct state of the SP map:
  |                (1) Whenever it is killed, destroyed, else otherwise
  |                    inactive; especially as its ID and/or certainly
  |                    reference may be 'reincarnated' into a new life
  |                    as something else via object pooling; xor
  |                (2) Whenever a body unit enters a vehicle or building
  |                    (i.e. guard tower/bunker), as they're effectively
  |                    within space of the vehicle/structure, whose SP
  |                    we don't care about in the way we do the world.
  +-------------------------------------------------------------------*/
  removePos(obj){
    // handling this just in case curCoord is null or somehow different than this
    let obj_posCoord = this.posToCoord(obj.pos);
    // Delete entry from 'jic' and 'cur' coords (if N/A, call simply outputs 'false', so no worries!)
    if(obj.curCoord){this.map[obj.curCoord[0]][obj.curCoord[1]].delete(obj.ID);}
    if(obj_posCoord){this.map[newCoords[0]][newCoords[1]].delete(obj.ID);}
  } // Ends Function removePos


  /*--------------------------------------------------------------------
  |>>> Function postBuilding | pullBuilding
  |---------------------------------------------------------------------
  | Description: How buildings and other [STATIC] objects let the SP Map
  |              know they exist. Different from the analogous function
  |              called by [MOBILE] objects (i.e. 'updatePos') for three
  |              reasons: (1) this only needs to be called ONCE by the
  |              object, (2) buildings more than [1x1] cells must report
  |              all cells containing them, and (3) nothing needs to be
  |              returned to the caller (same for mobile units, but that
  |              is another refactor for another day!) Buildings should
  |              call this function's counterpart (i.e. 'pullBuilding')
  |              when they're about to be removed from the game world;
  |              as to clear their entr[y/ies] from the SP Map.
  | Input Note:  This function assumes that whoever is calling it has an
  |              array named 'cells' of which contains 2-tuple [row,col]
  |              coordinate pairs for every cell containing the object;
  |              and that these pairs contain VALID cell coordinates.
  | DEFICIENCY:  NOT UPDATED TO USE THE MAP JS OBJECT! TODO: REFACTOR!
  +-------------------------------------------------------------------*/
  postBuilding(obj){obj.cells.forEach((cell)=>this.sparMap[cell[0]][cell[1]]=obj);}
  pullBuilding(obj){obj.cells.forEach((cell)=>this.sparMap[cell[0]][cell[1]]=null);}


  /*--------------------------------------------------------------------
  |>>> Function isCellVacant 
  +---------------------------------------------------------------------
  | Overview: Queries if the map cell specified via the input coords is
  |           vacant; i.e. it currently has no entities reporting their
  |           location as within the cell's bounds WRT the time the call
  |           is made. This consequently yields the following two notes:
  |
  |           (1) An output of 'true' does NOT GUARANTEE that the input
  |               map cell is absolutely vacant - because it cannot! It
  |               can ONLY guarantee such WRT the information known to
  |               the SPMap i.e. via agents/objects reporting themselves
  |               thereto. Ergo: it could be the case that 'rogue' stuff
  |               should report itself to the SPMap, but [incorrectly] 
  |               doesn't. Such cases will be 'invisible' accordingly.
  +-------------------------------------------------------------------*/
  isCellVacant(p,q){ 
    switch(arguments.length){
      case 1: return this.cellInBounds(p) && (this.map[p[0]][p[1]].size==0);
      case 2: return this.cellInBounds(p,q) && (this.map[p][q].size==0);
    }
  } // Ends Function isCellVacant

  /*--------------------------------------------------------------------
  |>>> Function isCellOccupied 
  +---------------------------------------------------------------------
  | Overview: Self-evidently the negation of <isCellVacant>, 'Nuff Said.
  +---------------------------------------------------------------------
  |> Implementation Notes / TO-DOs:
  |   o Double-check that this works WRT to one-parm input. I am 99.999%
  |     confident that the parm vals will be (p=[r,c], q=undefined) and
  |     such will be passed to <isCellVacant> and be handled correctly;
  |     but when it comes to JavaScript: you never really know...
  +-------------------------------------------------------------------*/
  isCellOccupied(p,q){
    switch(arguments.length){
      case 1: return this.cellInBounds(p) && (this.map[p[0]][p[1]].size!=0);
      case 2: return this.cellInBounds(p,q) && (this.map[p][q].size!=0);
    }
  } // Ends Function isCellOccupied


  // Naive i.e. finds via searching top-left to bottom-right
  findVacantCell(){
    for (let r=0; r<this.cellsTall; r++) {
      for (let c=0; c<this.cellsWide; c++) {
        if(this.isCellVacant(r,c)){return [r,c];}
      }
    }
    return null;
  } // Ends Function findVacantCell

  /*--------------------------------------------------------------------
  |>>> Function canBuildBldg
  +---------------------------------------------------------------------
  | Description: [QAD] Given TL row/col and cells wide/tall, are all of
  |              the cells encompassing this region [VACANT]? That is:
  |              s.t. a building of size [WxT] cells can be placed atop
  |              each such cell, since they're unoccupied by anything?
  | Note:        TileMap has a function of the same name which performs
  |              'the other half' of the greater query, i.e. determines
  |              if any of the cells are of type [WATER].
  +-------------------------------------------------------------------*/
  canBuildBldg(ri,ci,w,t){
    for(let r=0; r<t; r++){
      for(let c=0; c<w; c++){
        if(this.isCellOccupied(ri+r,ci+c)){return false;}
      }    
    }
    return true;
  } // Ends Function canBuildBldg


  /*--------------------------------------------------------------------
  |>>> Function getObjsAtCell
  +---------------------------------------------------------------------
  | Description: Gets ANYTHING posting itself to the SPMap (i.e. WRT ZAC
  |              includes 'body units', vehicles, buildings, etc.)        
  +-------------------------------------------------------------------*/
  getObjsAtCell(cell){
    if(this.isValidCell(cell)){return Array.from(this.map[cell[0]][cell[1]].values());}
    return [];
  } // Ends Function getObjsAtCell

  /*--------------------------------------------------------------------
  |>>> Function getObjsInCells
  +---------------------------------------------------------------------
  | Description: Calls <getObjsAtCell> for a list of cell coords; which
  |              typically encompass the Moore Neighborhood of a query
  |              or some [small constant] Chebyshev distance thereof.  
  +-------------------------------------------------------------------*/
  getObjsInCells(list){
    let units = [];
    for (let i=0; i<list.length; i++){units = units.concat(this.getObjsAtCell(list[i]));} 
    return units;
  } // Ends Function getObjsInCells


  /*--------------------------------------------------------------------
  |>>> Function Group {getUnitsInCells, getUnitsAtCell, getBldgsInCells,
  |                    getBldgAtCell}
  +---------------------------------------------------------------------
  | Description: Variants to <getObjsAtCell> and/or <getObjsInCells> of
  |              which gather specific types of objects. These are STUBS
  |              for now, as no IMMEDIATE need to implement and I still
  |              need to install/write [a bunch of] other stuff first...
  +-------------------------------------------------------------------*/
  getUnitsInCells(cellList){return null;}
  getUnitsAtCell(cell)     {return null;}
  getBldgsInCells(cellList){return null;}
  getBldgAtCell(cell)      {return null;}


  renderMap(){
    // now that's fucking cool! JS makes bool act like {false:0, true:0} for this expr!
    switch(this.curMapMode*this.showCells){
      case 1: this.renderCellPop(); return;
      case 2: this.renderHeatMap(); return;
      case 3: this.renderOccVacMap(); return;
    }
  }

  //> i.e. Map Viz Mode [0]
  renderCellPop(){
    fill(this.txtColor_CP); stroke(this.txtColor_CP); strokeWeight(this.sWgt_CP); textAlign(CENTER,CENTER); textSize(this.txtSize_CP);
    for(let r=0; r<this.cellsTall; r++){
      for(let c=0; c<this.cellsWide; c++){
        text(this.map[r][c].size, (c*this.cellSize)+this.cellHalf, (r*this.cellSize)+this.cellHalf);

      }
    } 
  } // Ends Function renderCellPop

  //> i.e. Map Viz Mode [1]
  renderHeatMap(){
    noStroke();
    for(let r=0; r<this.cellsTall; r++){
      for(let c=0; c<this.cellsWide; c++){
        fill(lerpColor(this.fill_HM_min,this.fill_HM_max,this.map[r][c].size/5.0));
        rect(c*this.cellSize,r*this.cellSize,this.cellSize,this.cellSize);
      }
    }
  } // Ends Function renderHeatMap

  //> i.e. Map Viz Mode [2]
  renderOccVacMap(){
    noStroke();
    for(let r=0; r<this.cellsTall; r++){
      for(let c=0; c<this.cellsWide; c++){
        switch(this.map[r][c].size==0){
          case true : fill(this.fill_SP_vac); break;
          default   : fill(this.fill_SP_occ); break;
        }
        rect(c*this.cellSize,r*this.cellSize,this.cellSize,this.cellSize);
      }
    }
  } // Ends Function renderOccVacMap

} // Ends Class GridSPMap