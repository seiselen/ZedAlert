var TileType = {
  DIRT:   0,
  GRASS:  1,
  ROAD:   2,
  PAVE:   3,
  SAND:   4,
  WATER:  5,
  ERROR: -1,
  cost : (ID)=>{switch(ID){           // | *V2* | *V3* |
    case TileType.ROAD  : return 1;    // |    1 |  0.5 |
    case TileType.PAVE  : return 2;    // |    1 |  0.8 |
    case TileType.DIRT  : return 16;   // |    2 |  1.0 |
    case TileType.GRASS : return 32;   // |    3 |  2.0 |
    case TileType.SAND  : return 64;   // |    4 |  4.0 |
    case TileType.WATER : return 1024; // | 1024 | 64.0 |
    default: return 9999;
  }}
}; // Ends Enum TileType

var Direction = {
  'O':0, 'ORG':0, 'NE':1, 'E':2, 'SE':3, 'S':4, 'SW':5, 'W':6, 'NW':7, 'N':8, 
  'C':0, 'CTR':0, 'TR':1, 'R':2, 'BR':3, 'B':4, 'BL':5, 'L':6, 'TL':7, 'T':8,
  'X':9, // <== None/Expired/Unknown or otherwise Default value
  glyph : ['•','⬈','⮕','⬊','⬇','⬋','⬅','⬉','⬆','∅']
}; // Ends Enum Direction

class GameMap{
  constructor(cellsTall,cellsWide, cellSize){
    this.cellsTall = cellsTall;
    this.cellsWide = cellsWide;
    this.cellSize  = cellSize;
    this.cellHalf  = this.cellSize/2;
    this.map_tile  = []; // stores TileType val informing of cell's current tile type
    this.showGrid  = true;

    this.initColorPallete();
    this.initTileMap();
  } // Ends Constructor


  //####################################################################
  //>>> LOADER/[RE]INIT FUNCTIONS
  //####################################################################
  initColorPallete(){
    //> Grid-Related Settings
    this.strk_grid = color(60,128);    
    this.sWgt_grid = 2; 

    //> Tile-Map Settings
    this.fill_terr_ROAD  = color( 84,  84,  84);
    this.fill_terr_PAVE  = color(168, 168, 168);
    this.fill_terr_DIRT  = color(144,  84,  12);
    this.fill_terr_GRASS = color(  0, 144,  24);
    this.fill_terr_SAND  = color(255, 216,  96);
    this.fill_terr_WATER = color( 60, 120, 180);
    this.fill_terr_ERROR = color(255,   0, 255);

    //> Translucent 'foreground' indicating [IMPASSIBLE] cell
    this.fill_impassible = color(240,60,48,128);

  } // Ends Function initColorPallete

  initTileMap(){
    for(let r=0; r<this.cellsTall; r++){this.map_tile[r]=[]; for(let c=0; c<this.cellsWide; c++){this.map_tile[r][c]=TileType.DIRT;}}    
  } // Ends Function initTileMap

  toggleShowGrid(){
    this.showGrid = !this.showGrid;
  }


  //####################################################################
  //>>> SETTER FUNCTIONS
  //####################################################################
  setValueAt(arg1,arg2,arg3){
    if(arguments.length==2){return this.setValueAt(arg1[0],arg1[1],arg2);}
    if(this.cellInBounds(arg1,arg2)){this.map_tile[arg1][arg2] = arg3;}
    else{console.log(">>> ERRR: setValueAt("+arg1+","+arg2+","+arg3+") has invalid parms!");}
  } // Ends Function setValueAt

  setAllValuesTo(val=TileType.DIRT){
    for(let r=0; r<this.cellsTall; r++){for(let c=0; c<this.cellsWide; c++){this.map_tile[r][c]=TileType.DIRT;}}  
  } // Ends Function setAllValuesTo

  //####################################################################
  //>>> GETTER FUNCTIONS
  //####################################################################
  posToCoord(pos){
    return [floor(pos.y/this.cellSize),floor(pos.x/this.cellSize)];
  } // Ends Function posToCoord

  posToMidpt(pos){
    return this.coordToPos(this.posToCoord(pos));
  } // Ends Function posToMidpt

  //>>> WARNING - WILL CAUSE CONFUSION => GRAB 'coordToTLPt' and/or refactor this SANS the "+cellHalf" parts!
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

  //####################################################################
  //>>> GETTER FUNCTIONS (CURRENTLY) SPECIFICALLY USED BY PATHFINDER
  //####################################################################

  distBetweenCoords(pCoord,qCoord){
    return this.coordToPos(pCoord).dist(this.coordToPos(qCoord));
  } // Ends Function distBetweenCoords

  getValueAt(r,c){
    if(arguments.length==1){return this.getValueAt(r[0],r[1]);}
    if(this.cellInBounds(r,c)){return this.map_tile[r][c];}
    else{console.log(">>> Error: coord ["+r+","+c+"] is out-of-bounds!");}
  } // Ends Function getValueAt

  getCostAt(coord){
    if(this.cellInBounds(coord)){return TileType.cost(this.map_tile[coord[0]][coord[1]]);}
    else{console.log(">>> Error: coord ["+coord.toString()+"] is out-of-bounds!");}
  } // Ends Function getCostAt 

  //####################################################################
  //>>> FUNCTION PAIR 'loadMap' and 'mapToString' [KEEP GROUPED FOR NOW]
  //####################################################################
  loadMap(mapArr=null){
    if(mapArr){
      for(let r=0; r<this.cellsTall; r++){
        for(let c=0; c<this.cellsWide; c++){
          switch(mapArr[r][c]){
            case 'r': this.map_tile[r][c] = TileType.ROAD;  break;
            case 'p': this.map_tile[r][c] = TileType.PAVE;  break;
            case 'd': this.map_tile[r][c] = TileType.DIRT;  break;            
            case 'g': this.map_tile[r][c] = TileType.GRASS; break;
            case 's': this.map_tile[r][c] = TileType.SAND;  break;            
            case 'w': this.map_tile[r][c] = TileType.WATER; break;
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
            case TileType.ROAD  : retStr+='r'; break;
            case TileType.PAVE  : retStr+='p'; break;
            case TileType.DIRT  : retStr+='d'; break;
            case TileType.GRASS : retStr+='g'; break;
            case TileType.SAND  : retStr+='s'; break;
            case TileType.WATER : retStr+='w'; break;
            default :             retStr+='?'; break;
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
  render(){this.renderMap();this.renderGrid();}

  renderMap(){
    noStroke();
    for(let r=0; r<this.cellsTall; r++){
      for(let c=0; c<this.cellsWide; c++){
        switch(this.map_tile[r][c]){
            case TileType.ROAD:  fill(this.fill_terr_ROAD);  break;
            case TileType.PAVE:  fill(this.fill_terr_PAVE);  break;
            case TileType.DIRT:  fill(this.fill_terr_DIRT);  break;            
            case TileType.GRASS: fill(this.fill_terr_GRASS); break;
            case TileType.SAND:  fill(this.fill_terr_SAND);  break;            
            case TileType.WATER: fill(this.fill_terr_WATER); break;
            default :            fill(this.fill_ERROR);
        }
        rect(c*this.cellSize,r*this.cellSize,this.cellSize,this.cellSize);
      }
    }
  } // Ends Function renderMap

  renderGrid(){
    if(!this.showGrid){return;}
    strokeWeight(this.sWgt_grid); stroke(this.strk_grid);
    for(let i=0; i<=this.cellsTall; i++){line(0,this.cellSize*i,width,this.cellSize*i);}
    for(let j=0; j<=this.cellsWide; j++){line(this.cellSize*j,0,this.cellSize*j,height);}
  } // Ends Function renderGrid  

} // Ends Class GameMap