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

/*======================================================================
|>>> 'Enum' TileType
+-----------------------------------------------------------------------
| Description: TODO-TBD => Will be adding [more] info once the pathfind
|              system is installed and working within the codebase!
+=====================================================================*/
var TileType = {
  road:     1,
  pave:     2,
  dirt:    16,
  gras:    32,
  sand:    64,
  watr:  1024,
  ERROR: 9999
}; // Ends Enum TileType


/*======================================================================
|>>> 'Enum' Direction
+-----------------------------------------------------------------------
| Description: Functions as an enum representing the direction of a map
|              cell WRT another map cell (WRT Moore Neighborhood space).
|              Currently used with the Scent and Sound Map [Layers] to
|              inform of the direction that the most recent human unit
|              came from, xor the direction where some sound came from.
|              Also contains an array of UNICODE glyphs corresponding to
|              the values, used for [debug] display of map data.
| Data Schema: Values correspond to clockwise traversal of cell's Moore
|              Neighborhood starting at [Top-Right]/[Northeast], whereby
|              the [Center]/[Origin] has a value of zero (0) as follows:
|
|                      |NW  N  NE|    |RL  T  TR|    |7 8 1|
|                      | W ORG  E| => | L CTR  R| => |6 0 2|
|                      |SW  S  SE|    |BL  B  BR|    |5 4 3|
+=====================================================================*/
var Direction = {
  'O':0, 'ORG':0, 'NE':1, 'E':2, 'SE':3, 'S':4, 'SW':5, 'W':6, 'NW':7, 'N':8, 
  'C':0, 'CTR':0, 'TR':1, 'R':2, 'BR':3, 'B':4, 'BL':5, 'L':6, 'TL':7, 'T':8,
  'X':9, // <== None/Expired/Unknown or otherwise Default value
  glyph : ['•','⬈','⮕','⬊','⬇','⬋','⬅','⬉','⬆','∅']
}; // Ends Enum Direction


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
    for (let r = 0; r < this.cellsTall; r++) {
      this.map_scent[r]=[];
      for (let c = 0; c < this.cellsWide; c++) {
        this.map_scent[r].push([0,Direction.X]);
      }
    }
  } // Ends Function initScentMap

  initSoundMap(){
    for (let r = 0; r < this.cellsTall; r++) {
      this.map_sound[r]=[];
      for (let c = 0; c < this.cellsWide; c++) {
        this.map_sound[r].push([0,Direction.X]);
      }
    }
  } // Ends Function initSoundMap


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


  /*--------------------------------------------------------------------
  |>>> Function floodFill 
  +---------------------------------------------------------------------
  | Description: Performs a 'flood fill' on the region indicated by the
  |              seed row and col with the new tile type. That is, given
  |              the tile type of the input cell, the region defined as
  |              all contiguous cells thereto of the same tile type will
  |              be changed to the new tile type; including itself. This
  |              is implemented via a Breadth-First Search (BFS).
  | Source:      This function was ported from the Genesis-I project '2D
  |              Caves via Cellular Automata'; which itself derives from
  |              a similar BFS approach described by Sebastian Lague for
  |              his Unity3D Procedural CA Caves project. 
  | Side Note:   While I knew that elements of TD-P5JS, StAgE/Sandkings,
  |              other Broadgate projects, and even the older attempts
  |              at implementing ZAC or a peripheral thereof would find
  |              their way to this codebase, I did NOT expect code from
  |              Project Genesis to find its way over here (at least not
  |              unless/until I implemented a robust PCG map generator,
  |              but that's not even planned until the hypothetical i.e.
  |              may-never-happen full commercial version of Zed Alert!) 
  +-------------------------------------------------------------------*/
  floodFill(seedRow, seedCol, newVal){
    if(!this.cellInBounds(seedRow,seedCol)){return;}

    let curVal    = this.map_tile[seedRow][seedCol];
    let temp      = null;
    let openSet   = [];
    let closedSet = new Map();

    openSet.push([seedRow,seedCol]);
    closedSet.set( ""+seedRow+","+seedCol, 1);
  
    let curSec = 0;
    let maxSec = this.cellsWide*this.cellsTall;

    while(curSec<maxSec && openSet.length > 0){
      temp = openSet.shift();
    
      this.map_tile[temp[0]][temp[1]] = newVal;
    
      for(let adjR = temp[0]-1; adjR <= temp[0]+1; adjR++){
        for(let adjC = temp[1]-1; adjC <= temp[1]+1; adjC++){
          console.log(adjR+","+adjC);
          // don't know why 2nd conditional constrains WRT to Von Neuman neighborhood, but okelie dokelie...
          if(this.cellInBounds(adjR,adjC) && (adjR==temp[0] || adjC==temp[1])){
            // Final conditional makes sure all prospective filled tiles need to match original seed tile type
            if(!closedSet.get(""+adjR+","+adjC) && this.map_tile[adjR][adjC] == curVal){
              closedSet.set(""+adjR+","+adjC, 1);
              openSet.push([adjR,adjC]);    
            }          
          }   
        }
      }
      curSec++;
    }  
    console.log("SEC = " + curSec + " MAX = " + maxSec);
    // might be overkill, but #yolo
    openSet.length = 0;
    closedSet.clear(); 
  } // Ends Function floodFill

//######################################################################
//>>> Scent and Sound Map Specific Functions
//######################################################################


  /*--------------------------------------------------------------------
  |>>> Function advanceScentAndSound 
  +---------------------------------------------------------------------
  | Description: Realizes 'fading' of scent and sound values over time
  |              WRT each cell's entry in their respective map layers.
  +---------------------------------------------------------------------
  |> TODO: Merge them or partition into resp. functions per 'Uncle Bobs
  |        1 Behavior/Function' Principle?
  |> Optimization Possibility (STRICTLY AS-NEEDED): 
  |   o I could stagger/offset these: whereby scent and sound maps only
  |     update every other frame WRT each other; half the cells update
  |     every other frame; or some combination of both. 
  +-------------------------------------------------------------------*/
  advanceScentAndSound(){
    //>>> UPDATES SOUND MAP
    for(let r=0; r<this.cellsTall; r++){
      for(let c=0; c<this.cellsWide; c++){
        if(this.map_sound[r][c][0] > 0.25){this.map_sound[r][c][0] *= soundDecayFac;}
        if(this.map_sound[r][c][0] < 1)   {this.map_sound[r][c][1]  = Direction.X;}
      }
    }
    //>>> UPDATES SCENT MAP 
    for(let r=0; r<this.cellsTall; r++){
      for(let c=0; c<this.cellsWide; c++){
        if(this.map_scent[r][c][0] > 0.25){this.map_scent[r][c][0] *= scentDecayFac;}
        if(this.map_scent[r][c][0] < 1)   {this.map_scent[r][c][1]  = Direction.X;}
      }
    }
  } // Ends Function advanceScentAndSound

  // current plan for this: updatePos calls whenever human unit leaves its current cell
  leaveScent(oldC,newC){
    let diffR = newC[0]-oldC[0];
    let diffC = newC[1]-oldC[1];
    this.map_scent[oldC[0]][oldC[1]][1]  = Direction[((diffR|diffC) == 0) ? 'C' : ((diffR==0) ? '' : (diffR<0) ? 'T' : 'B')+((diffC==0) ? '' : (diffC<0) ? 'L' : 'R')];
    this.map_scent[oldC[0]][oldC[1]][0] += scentAddVal;
  } // Ends Function leaveScent

  // called by [handler of] event producing an 'observable' sound (e.g. grenade explodes)
  makeASound(sPos, sRad){
    let coord   = this.posToCoord(sPos);
    let sMpt    = this.posToMidpt(sPos);
    let cMpt    = vec2();
    let cellRad = floor(sRad/this.cellSize);
    let sRadSqd = sRad*sRad;
    let diffR   = -1;
    let diffC   = -1;
    for(let r=coord[0]-cellRad; r<=coord[0]+cellRad; r++){
      for(let c=coord[1]-cellRad; c<=coord[1]+cellRad; c++){
        cMpt.set(this.coordToPos(r,c));
        if(this.cellInBounds(r,c) && distSq(sMpt,cMpt) <= sRadSqd){
          diffR = coord[0]-r;
          diffC = coord[1]-c;
          this.map_sound[r][c][1] = Direction[((diffR|diffC) == 0) ? 'C' : ((diffR==0) ? '' : (diffR<0) ? 'T' : 'B')+((diffC==0) ? '' : (diffC<0) ? 'L' : 'R')];
          this.map_sound[r][c][0] += soundAddVal;
        }
      }
    }
  } // Ends Function makeASound


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

  // more appropriate name would be 'coordToMidPt' but legacy so KISS
  coordToPos(v1,v2){
    switch(arguments.length){
      case 1: return vec2((v1[1]*this.cellSize)+this.cellHalf, (v1[0]*this.cellSize)+this.cellHalf);
      case 2: return vec2((v2*this.cellSize)+this.cellHalf, (v1*this.cellSize)+this.cellHalf);
    }
  } // Ends Function coordToPos

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
    /* STUB TODO - simply need to implement this, not really pending on anything that I'm aware of... */
  } // Ends Function renderSPMap

  renderScentMap(){
    fill(this.fill_text); noStroke(); textAlign(CENTER,CENTER); textSize(this.size_text);
    for(let r=0; r<this.cellsTall; r++){
      for(let c=0; c<this.cellsWide; c++){
        text(((this.scentMapMode==0) ? this.map_scent[r][c][0] : Direction.glyph[this.map_scent[r][c][1]]),(c*this.cellSize)+this.cellHalf, (r*this.cellSize)+this.cellHalf);
      }
    }
  } // Ends Function renderScentMap

  renderSoundMap(){
    fill(this.fill_text); noStroke(); textAlign(CENTER,CENTER); textSize(this.size_text);
    for(let r=0; r<this.cellsTall; r++){
      for(let c=0; c<this.cellsWide; c++){
        text(((this.soundMapMode==0) ? this.map_sound[r][c][0] : Direction.glyph[this.map_sound[r][c][1]]),(c*this.cellSize)+this.cellHalf, (r*this.cellSize)+this.cellHalf);
      }
    }
  } // Ends Function renderSoundMap


} // Ends Class GameMap