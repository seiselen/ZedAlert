/*======================================================================
|>>> Class GameMap                                     [ZED ALERT - MVP]
+-----------------------------------+-----------------------------------
| Author:    Steven Eiselen         | Language:  JavaScript 
| Project:   Zed Alert a.k.a. ZAC   | Library:   P5JS (p5js.org/)
+-----------------------------------+-----------------------------------
| Description: TODO
+-----------------------------------------------------------------------
| [AS-YOU-BUILD] Implementation Notes:
|  > WRT StAgE: [Body Unit] SteeringMotor components will [now] refer to
|    HERE for flowfields to follow; i.e. for the scent and sound layers.
+-----------------------------------------------------------------------
|########## Zed Alert concept and code[base] © Steven Eiselen ##########
+=====================================================================*/

var TileType = {
  road:     1,
  pave:     2,
  dirt:    16,
  gras:    32,
  sand:    64,
  watr:  1024,
  ERROR: 9999
}


class GameMap{
  constructor(cT,cW,cS,mapInfo){
    //> General/Shared Map Info
    this.cellsTall = cT;
    this.cellsWide = cW;
    this.cellSize  = cS;
    this.cellHalf  = this.cellSize/2;
    this.cellQuar  = this.cellSize/4;
    this.areaWide  = this.cellsWide*this.cellSize;
    this.areaTall  = this.cellsTall*this.cellSize;    
    //> Map 'Layers'
    this.map_tile  = []; // cell type (e.g. buildable, enemyPath, etc.) for rendering and unit speed purposes
    this.map_SP    = []; // spatial partition info (i.e. agents reported in each cell) for a BUNCH of uses
    this.map_scent = []; // vector flow-field s.t. zombies can track traces left by humans passing over cells
    this.map_sound = []; // vector flow-field s.t. zombies and human NPCs can track recent [loud] sounds

    //> UI/UX Toggle Configs
    this.showGrid     = true; // show cell grid   (def:false)
    this.showCoords   = false; // show cell coords (def:false)
    this.showTileMap  = true;  // show map tiles   (def:true)
    this.showSPMap    = false; // show SP map      (def:false)
    this.showScentMap = false; // show scent field (def:false)
    this.showSoundMap = false; // show sound field (def:false)
    this.highlightImp = false; // impassible tiles (def:false)
    this.tileMapMode  = 0;     // [0]-> cell-based | [1]-> marching-squares
    this.SPMapMode    = 0;     // [0]-> population | [1]-> heatmap
    this.scentMapMode = 0;     // [0]-> values     | [1]-> glyphs
    this.soundMapMode = 0;     // [0]-> values     | [1]-> glyphs

    this.initColorPallete();
  } // Ends Constructor


//######################################################################
//>>> Init Functions
//######################################################################


  initColorPallete(){
    //> Grid-Related Settings
    this.strk_grid = color(60,128);    
    this.sWgt_grid = 2; 

    //> Tile-Map Settings
    this.fill_terr_road = color(120, 120, 120); /* color( 82,  82,  82);*/
    this.fill_terr_pave = color(162, 162, 162);    
    this.fill_terr_dirt = color(144,  84,  12); /* color(108,  60,   0);*/
    this.fill_terr_gras = color(  0, 156,   0);       
    this.fill_terr_sand = color(255, 216, 144); /* color(180, 144,  12);*/ /* color(255, 216,  96);*/
    this.fill_terr_watr = color( 60, 120, 180); /* color(  0, 120, 180) */

    //> SP-Map Settings
    this.fill_SP_occ = color(216,168,240,128); 
    this.fill_SP_vac = color(0,0); 

    //> Text-Related Settings
    this.fill_text = color(0);   // text labels
    this.size_text = 20;         // font size    


    //> Good 'Ol 'Error Purple'
    this.fill_ERROR   = color(255,0,255);
  } // Ends Function initColorPallete

  initTileMap(){
    for(let r=0; r<this.cellsTall; r++){
      this.map_tile[r]=[]; 
      for(let c=0; c<this.cellsWide; c++){
        this.map_tile[r][c]=TileType.dirt;
      }
    }    
  } // Ends Function initTileMap

  initSPMap(){
    for (let r=0; r<this.cellsTall; r++) {
      this.map[r]=[];
      for (let c=0; c<this.cellsWide; c++) {
        this.map[r].push(new Map());
      }
    }
  } // Ends Function initSPMap

  initScentMap(){
    /* STUB TODO - pending effort to see if i can reduce scent/sound map data to Array2 */
  }

  initSoundMap(){
    /* STUB TODO - pending effort to see if i can reduce scent/sound map data to Array2 */
  }


//######################################################################
//>>> Map Load and [toString] Save Functions
//######################################################################


  loadMap(mapArr=null){
    if(mapArr){
      for(let r=0; r<this.cellsTall; r++){
        for(let c=0; c<this.cellsWide; c++){
          switch(mapArr[r][c]){
            case 'r': this.map_tile[r][c] = TileType.road; break;
            case 'p': this.map_tile[r][c] = TileType.pave; break;
            case 'd': this.map_tile[r][c] = TileType.dirt; break;            
            case 'g': this.map_tile[r][c] = TileType.gras; break;
            case 's': this.map_tile[r][c] = TileType.sand; break;            
            case 'w': this.map_tile[r][c] = TileType.watr; break;
            default : this.map_tile[r][c] = TileType.ERROR; break;
          }
        }
      }   
    }
    return this; // for function chaining 
  } // Ends Function loadMap

  mapToString(nLine="\n"){
    let retStr = "map = [" + nLine;
    for (var r=0; r<this.cellsTall; r++){
      retStr += "[";
      for (var c=0; c<this.cellsWide; c++){
        retStr+="\'";
        switch(this.map_tile[r][c]){
            case CellType.road : retStr+='r'; break;
            case CellType.pave : retStr+='p'; break;
            case CellType.dirt : retStr+='d'; break;
            case CellType.gras : retStr+='g'; break;
            case CellType.sand : retStr+='s'; break;
            case CellType.watr : retStr+='w'; break;
            default :            retStr+='?'; break;
        }
        retStr+="\'";
        if(c<this.cellsWide-1){retStr+=',';}
      }
      retStr += "],"+nLine;
    }
    retStr += "];";
    return retStr;
  } // Ends Function mapToString


//######################################################################
//>>> SP Map Specific Functions >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
//######################################################################

  //>>> These get ANYTHING posting itself to SP (i.e. [bodies, vehicles, bldgs])
  getObjsInCells(cellList){
    // NAT - Can fill these NOW via SpatialPartitionDemo [BG-3]
  }
  getObjsAtCell(cell){
    // NAT - Can fill these NOW via SpatialPartitionDemo [BG-3]
  }

  //>>> These get UNITS xor BLDGS ONLY (i.e. [bodies, vehicles] xor [bldgs])
  // Note: STUBS for now, as no IMMEDIATE need and still need to set other stuff up first...
  getUnitsInCells(cellList){return null;}
  getUnitsAtCell(cell){return null;}
  getBldgsInCells(cellList){return null;}
  getBldgAtCell(cell){return null;}

  // Vacant Cell <=> SP reports NOTHING at the cell
  isCellVacant(v1,v2){
    switch(arguments.length){
      case 1: return this.isCellVacant(v1[0],v1[1]);
      case 2: return this.cellInBounds(v1,v2) && (this.map_SP[v1][v2].size==0);
    }
  } // Ends Function isCellVacant

  // Self-Evidently the negation of 'isCellVacant'
  isCellOccupied(v1,v2){
    switch(arguments.length){
      case 1: return !this.isCellVacant(v1);
      case 2: return !this.isCellVacant(v1[0],v1[1]);
    }
  } // Ends Function isCellOccupied

  // QAD Desc: Given TL row/col and cells wide/tall, are all encompassing cells [VACANT]?
  // Improvement NOTE/TODO: No need for 'qCell', as 'isCellOccupied' now accepts (r,c) input
  canBuildBldg(ri,ci,w,t){
    let qCell = [-1,-1]; // query cell [row,col]
    for(let r=0; r<t; r++){
      for(let c=0; c<w; c++){
        qCell[0]=ri+r; qCell[1]=ci+c;
        if(this.isCellOccupied(qCell)){return false;}
      }    
    }
    return true;
  } // Ends Function canBuildBldg

  // Naive i.e. finds via searching top-left to bottom-right
  findVacantCell(){
    for (let r=0; r<this.cellsTall; r++) {
      for (let c=0; c<this.cellsWide; c++) {
        if(this.isCellVacant(r,c)){return [r,c];}
      }
    }
    return null;
  } // Ends Function findVacantCell

  // EVERYTHING uses this (i.e. [bodies, vehicles, bldgs]) <-- well maybe NOT bldgs, TBD...
  updatePos(obj){
    //>>> Compute cell coords based on current position
    let newCoords = this.posToCoord(obj.pos);
    //>>> Inside same cell as last update => return null
    if(obj.curCoord != null && obj.curCoord[0]==newCoords[0] && obj.curCoord[1]==newCoords[1] ){return null;}
    //>>> Agent is in new cell => Delete entry from former cell, then set it to new cell
    if(obj.curCoord != null){this.map[obj.curCoord[0]][obj.curCoord[1]].delete(obj.ID);}
    this.map[newCoords[0]][newCoords[1]].set(obj.ID,obj);

    return newCoords;
  } // Ends Function updatePos


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


//######################################################################
//>>> [Terrain] Tile Map Specific Functions
//######################################################################


  // A/O 1/1, cost of terrain cell is its 'enum' value
  getCostAt(row, col){
    this.getValueAt(row,col,'tile');
  } // Ends Function getCostAt

  // NOT handling invalid vals to KISS, map viz and/or cell val will let you know
  setValueAt(r,c,val){
    if(!this.cellInBounds(cell)){return;}
    this.map_tile[r][c] = val;
  } // Ends Function setValueAt

  setAllCellsTo(layer,val){
     for(let r=0; r<this.cellsTall; r++){
      for(let c=0; c<this.cellsWide; c++){
        this.setValueAt(r,c,val);
      }
    }   
  } // Ends Function setAllCellsTo

  // NOT [YET] IMPLEMENTED, but should utilize 'BFS method' when you do so!
  floodFillAt(cell,val){
    /* STUB TODO - pending getting tilemap layer set up (via P5JS-Gridwalker or otherwise) */
  }


//######################################################################
//>>> Scent and Sound Map Specific Functions
//######################################################################


  /*--------------------------------------------------------------------
  |>>> Function advanceScentAndSound 
  +---------------------------------------------------------------------
  | Description: Realizes 'fading' of scent and sound values over time
  |              WRT each cell's entry in their respective map layers.
  +---------------------------------------------------------------------
  |> Optimization Possibility (STRICTLY AS-NEEDED): 
  |   o I could stagger/offset these: whereby scent and sound maps only
  |     update every other frame WRT each other; half the cells update
  |     every other frame; or some combination of both. 
  +-------------------------------------------------------------------*/
  advanceScentAndSound(){
    /* STUB TODO - pending effort to see if i can reduce scent/sound map data to Array2 */
  }

  // currently: updatePos calls whenever human unit leaves current cell
  leaveScent(oldCoord,newCoord,scentVal){
    /* STUB TODO - pending effort to see if i can reduce scent/sound map data to Array2 */
  }

  // called by [handler of] event producing an 'observable' sound (e.g. grenade explodes)
  makeASound(sPos, sRad){
    /* STUB TODO - pending effort to see if i can reduce scent/sound map data to Array2 */
  }


//######################################################################
//>>> Toggle Functions
//######################################################################


  toggleGrid()           {this.showGrid     = !this.showGrid;}
  toggleCoords()         {this.showCoords   = !this.showCoords;}
  toggleTileMap()        {this.showTileMap  = !this.showTileMap;}
  toggleHighlightImp()   {this.highlightImp = !this.highlightImp;}
  toggleSPMap()          {this.showSPMap    = !this.showSPMap;}
  toggleScentMap()       {this.showScentMap = !this.showScentMap;}
  toggleSoundMap()       {this.showSoundMap = !this.showSoundMap;}
  toggleTileMapVizMode() {this.tileMapMode  = (this.tileMapMode==0)?1:0;}
  toggleSPMapVizMode()   {this.SPMapMode    = (this.SPMapMode==0)?1:0;}
  toggleScentMapVizMode(){this.scentMapMode = (this.scentMapMode==0)?1:0;}
  toggleSoundMapVizMode(){this.soundMapMode = (this.soundMapMode==0)?1:0;}


//######################################################################
//>>> General Getter Functions
//######################################################################

  getValueAt(layer,v1,v2){
    if(arguments.length==2){return this.getValueAt(layer,v1[0],v1[1]);}
    if(!this.cellInBounds(v1,v2)){return;}
    switch(layer.toLowerCase()){
      case 'tile':  return this.map_tile[r][c];
      case 'sp':    return this.map_SP[r][c];
      case 'scent': return this.map_scent[r][c];
      case 'sound': return this.map_scent[r][c];
      default : console.log("invalid input for parm 'layer' => ["+layer+"]"); return -1;
    }
  } // Ends Function getValueAt

  posToCoord(pos){
    return [floor(pos.y/this.cellSize),floor(pos.x/this.cellSize)];
  } // Ends Function posToCoord

  posToMidpt(pos){
    return this.coordToPos(this.posToCoord(pos));
  } // Ends Function posToMidpt

  coordToMidpt(rc){
    return vec2((rc[1]*this.cellSize)+this.cellHalf, (rc[0]*this.cellSize)+this.cellHalf);
  } // Ends Function coordToMidpt

  posInBounds(pos){
    return (pos.x>=0 && pos.y>=0 && pos.x<this.areaWide && pos.y<this.areaTall);
  } // Ends Function posInBounds

  cellInBounds(v1,v2){
    switch(arguments.length){
      case 1: return this.cellInBounds(v1[0],v1[1]);
      case 2: return (v1>=0 && v1<this.cellsTall && v2>=0 && v2<this.cellsWide);
    }
  } // Ends Function cellInBounds


//######################################################################
//>>> Render Functions
//######################################################################
  render(){
    // only non-debug call alongside 'renderGrid' | must be first call!
    if(this.showTileMap){this.renderTileMap();}
    // debug calls | only call ONE at a time i.e. treat them as mutex!
    if(this.showSPMap){this.renderSPMap();}
    if(this.showScentMap){this.renderScentMap();}
    if(this.showSoundMap){this.renderSoundMap();}
    if(this.showCoords){this.renderCoords();}
    // user optional call for non-debug purposes | must be last call!
    if(this.showGrid){this.renderGrid();}
  } // Ends Function render

  renderGrid(){
    stroke(this.strk_grid); strokeWeight(this.sWgt_grid);
    for(let i=0; i<=this.cellsTall; i++){line(0,this.cellSize*i,this.areaWide,this.cellSize*i);}
    for(let i=0; i<=this.cellsWide; i++){line(this.cellSize*i,0,this.cellSize*i,this.areaTall);}
  } // Ends Function renderGrid

  renderCoords(){
    stroke(this.strk_grid); strokeWeight(this.sWgt_grid); textSize(this.size_text); textAlign(CENTER, CENTER);
    for(let r=0; r<this.cellsTall; r++){
      for(let c=0; c<this.cellsWide; c++){
        text("["+r+","+c+"]", (this.cellSize*c)+this.cellHalf,(this.cellSize*r)+this.cellHalf);  
      }
    }
  } // Ends Function renderCoords

  renderTileMap(){
    noStroke();
    for(let r=0; r<this.cellsTall; r++){
      for(let c=0; c<this.cellsWide; c++){
        switch(this.map_tile[r][c]){
            case TileType.road: fill(this.fill_terr_road); break;
            case TileType.pave: fill(this.fill_terr_pave); break;
            case TileType.dirt: fill(this.fill_terr_dirt); break;            
            case TileType.gras: fill(this.fill_terr_gras); break;
            case TileType.sand: fill(this.fill_terr_sand); break;            
            case TileType.watr: fill(this.fill_terr_watr); break;
            default :           fill(this.fill_ERROR);
        }
        rect(c*this.cellSize,r*this.cellSize,this.cellSize,this.cellSize);
      }
    }
  } // Ends Function renderTileMap

  renderSPMap(){
    /* STUB TODO - pending effort to see if i can reduce scent/sound map data to Array2 */
  } // Ends Function renderSPMap

  renderScentMap(){
    /* STUB TODO - pending effort to see if i can reduce scent/sound map data to Array2 */
  } // Ends Function renderScentMap

  renderSoundMap(){
    /* STUB TODO - pending effort to see if i can reduce scent/sound map data to Array2 */
  } // Ends Function renderSoundMap

} // Ends Class GameMap