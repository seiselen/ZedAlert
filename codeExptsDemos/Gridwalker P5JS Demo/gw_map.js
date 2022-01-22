var CellType = {
  road:     1,
  dirt:    32,
  sand:    64,
  watr:  1024,
  ERROR: 9999,
}
// good vals: {r:1, d:32, s:64, w:1024, ?:9999


class GWMap{
  constructor(cellsTall,cellsWide, cellSize){
    this.cellsTall = cellsTall;
    this.cellsWide = cellsWide;
    this.cellSize  = cellSize;
    this.cellSizeH = this.cellSize/2;
    this.tileMap   = []; // stores CellType val informing of cell's current tile type
    this.sparMap   = []; // stores boolean indicating if cell is currently occupied
    this.showGrid  = true;
    this.showSPMap = true;

    this.initColorPallete();
    this.initTileMap();
    this.initSparMap();
  } // Ends Constructor


  //####################################################################
  //>>> LOADER/[RE]INIT FUNCTIONS
  //####################################################################
  initColorPallete(){
    this.sp_cOcc_fill = color(216,168,240,128); // currently reporting occupied
    this.sp_cVac_fill = color(0,0);         // currently reporting vacant 
    this.pf_excl_fill = color(240,60,48);   // 'blind' to PF and static to SP (e.g. water tiles, but currently not implemented)

    this.mt_dirt_fill = color(144,84,12);   // indicates cells of CellType.dirt 
    this.mt_road_fill = color(120,120,120); // indicates cells of CellType.road 
    this.mt_sand_fill = color(255,216,144); // indicates cells of CellType.sand 
    this.mt_watr_fill = color(60,120,180);  // indicates cells of CellType.watr 
    this.ERROR_fill   = color(255,0,255);

    this.grid_strk = color(60,128); // originally (24,24,24) in this project
    this.grid_swgt = 1;  
  } // Ends Function initColorPallete

  initTileMap(){
    for(let r=0; r<this.cellsTall; r++){this.tileMap[r]=[]; for(let c=0; c<this.cellsWide; c++){this.tileMap[r][c]=CellType.dirt;}}    
  } // Ends Function initTileMap

  initSparMap(){
    for(let r=0; r<this.cellsTall; r++){this.sparMap[r]=[]; for(let c=0; c<this.cellsWide; c++){this.sparMap[r][c]=null;}}
  } // Ends Function initSparMap


  //####################################################################
  //>>> SETTER FUNCTIONS
  //####################################################################

  //>>> TODO: 'FloodFill' (i.e./lead = find else implement modified BFS)

  setValueAt(coord,val){
    if(this.isValidCell(coord)){this.tileMap[coord[0]][coord[1]] = val;}
    else{console.log(">>> Error: setValueAt("+row+","+col+","+val+") has invalid parms!");}
  } // Ends Function setValueAt

  //####################################################################
  //>>> UPDATE/ADVANCE FUNCTIONS
  //####################################################################
  updatePos(obj){
    //>>> Compute cell coords based on current position
    let newCoords = this.cellViaPos(obj.pos);
    //>>> Agent has a curent coordinate
    if(obj.curCoord){
      //>>> In same cell as last update => immediately return null (agent responsible to understand + handle this)
      if(obj.curCoord[0]==newCoords[0]&&obj.curCoord[1]==newCoords[1]){return null;}
      //>>> Agent now in different cell => Update SP Map accordingly
      this.sparMap[obj.curCoord[0]][obj.curCoord[1]] = null;
    }
    this.sparMap[newCoords[0]][newCoords[1]] = obj;
    return newCoords;
  } // Ends Function updatePos

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
  +-------------------------------------------------------------------*/
  postBuilding(obj){obj.cells.forEach((cell)=>this.sparMap[cell[0]][cell[1]]=obj);}
  pullBuilding(obj){obj.cells.forEach((cell)=>this.sparMap[cell[0]][cell[1]]=null);}

  //####################################################################
  //>>> GETTER FUNCTIONS
  //####################################################################
  isValidCell(rc){
    return (rc[0]>=0 && rc[0]<this.cellsTall && rc[1]>=0 && rc[1]<this.cellsWide);
  } // Ends Function isValidCell

  isCellVacant(rc){
    return this.isValidCell(rc) && this.sparMap[rc[0]][rc[1]]==null;
  } // Ends Function isCellVacant

  isCellOccupied(rc){
    return !this.isCellVacant(rc);
  } // Ends Function isCellOccupied

  cellViaPos(pos){
    return [Math.floor(pos.y/this.cellSize),Math.floor(pos.x/this.cellSize)];
  } // Ends Function cellViaPos

  getCellMidPt(rc){
    return (this.isValidCell(rc)) ? vec2((rc[1]*this.cellSize)+this.cellSizeH, (rc[0]*this.cellSize)+this.cellSizeH) : vec2(-1,-1);
  } // Ends Function getCellMidPt

  getCellTLPos(rc){
    return createVector((rc[1]*this.cellSize),(rc[0]*this.cellSize));
  } // Ends Function getCellTLPos

  getUnitsInCells(list){
    let units = [];
    for (let i=0; i<list.length; i++){units = units.concat(this.getUnitsAtCell(list[i]));} 
    return units;
  } // Ends Function getUnitsInCells

  getUnitsAtCell(cell){
    if(this.isValidCell()){return this.sparMap[cell[0]][cell[1]];}
    return null;
  } // Ends Function getUnitsAtCell

  //>>> QAD Desc: Given TL row/col and cells wide/tall, are all encompassing cells [VACANT]?
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


  //####################################################################
  //>>> FUNCTION PAIR 'loadMap' and 'mapToString' [KEEP GROUPED FOR NOW]
  //####################################################################
  // NOTE: *NO* Erroneous Input Checking!
  loadMap(mapArr=null){
    if(mapArr){
      for(let r=0; r<this.cellsTall; r++){
        for(let c=0; c<this.cellsWide; c++){
          switch(mapArr[r][c]){
            case 'd': this.tileMap[r][c] = CellType.dirt; break;
            case 's': this.tileMap[r][c] = CellType.sand; break;
            case 'r': this.tileMap[r][c] = CellType.road; break;
            case 'w': this.tileMap[r][c] = CellType.watr; break;
            default : this.tileMap[r][c] = CellType.ERROR; break;
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
        switch(this.tileMap[r][c]){
            case CellType.dirt : retStr+='d'; break;
            case CellType.sand : retStr+='s'; break;
            case CellType.road : retStr+='r'; break;
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


  //####################################################################
  //>>> RENDER FUNCTIONS
  //####################################################################
  render(){
    this.renderTileMap();
    if(this.showSPMap){this.renderSparMap();}
    if(this.showGrid){this.renderGrid();}
  } // Ends Function render

  renderTileMap(){
    noStroke();
    for(var r=0; r<this.cellsTall; r++){
      for(var c=0; c<this.cellsWide; c++){
        switch(this.tileMap[r][c]){
          case CellType.dirt: fill(this.mt_dirt_fill); break;
          case CellType.road: fill(this.mt_road_fill); break;
          case CellType.sand: fill(this.mt_sand_fill); break;
          case CellType.watr: fill(this.mt_watr_fill); break;
          default:            fill(this.ERROR_fill);
        }
        rect(c*this.cellSize,r*this.cellSize,this.cellSize,this.cellSize);
      }
    }
  } // Ends Function renderTileMap

  renderSparMap(){
    noStroke();
    for(var r=0; r<this.cellsTall; r++){
      for(var c=0; c<this.cellsWide; c++){
        switch(this.sparMap[r][c]){
          case null : fill(this.sp_cVac_fill); break;
          default   : fill(this.sp_cOcc_fill); break;
        }
        rect(c*this.cellSize,r*this.cellSize,this.cellSize,this.cellSize);
      }
    }
  } // Ends Function renderSparMap

  renderGrid(){
    strokeWeight(this.grid_swgt); stroke(this.grid_strk);
    for(let i=0; i<=this.cellsTall; i++){line(0,this.cellSize*i,width,this.cellSize*i);}
    for(let j=0; j<=this.cellsWide; j++){line(this.cellSize*j,0,this.cellSize*j,height);}
  } // Ends Function renderGrid  

} // Ends Class WorldMap