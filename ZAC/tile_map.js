/*======================================================================
|>>> Class TileMap                                     [ZED ALERT - MVP]
+-----------------------------------+-----------------------------------
| Author:    Steven Eiselen         | Language:  JavaScript 
| Project:   Zed Alert a.k.a. ZAC   | Library:   P5JS (p5js.org/)
+-----------------------------------+-----------------------------------
| Description: TODO
+-----------------------------------------------------------------------
[AS-YOU-BUILD] Implementation Notes 
  o General Purpose: represents/encompasses tile types for each map cell
    (i.e. dirt, sand, water, road, etc.) for rendering, pathfinding, and
    unit speed purposes
  o TO KISS - THIS VERSION IS HARDCODED WRT ZAC TILETYPES. SORRY WORLD,
    I want to actually implement this damned thing... This also means
    that this class will expect to see the 'TileTypes' "enum" somewhere
    as an accessible global object
  o Map Modes: 
      [0] : ColoredMapCells
      [1] : TexturedMapCells
      [2] : ColoredMarchSqs
      [3] : TexturedMarchSqs
+-----------------------------------------------------------------------
|########## Zed Alert concept and code[base] © Steven Eiselen ##########
+=====================================================================*/
class TileMap extends GridMap{
  constructor(cT,cW,cS){
    super(cT,cW,cS);
    this.curMapMode  = 0;
    this.totMapModes = 4;
    this.initMap();
    this.initColorPallete();
  }

  initColorPallete(){
    super.initColorPallete();
    this.fill_terr_ROAD  = color( 84,  84,  84);
    this.fill_terr_PAVE  = color(168, 168, 168);    
    this.fill_terr_DIRT  = color(144,  84,  12);
    this.fill_terr_GRASS = color(  0, 144,  24);    
    this.fill_terr_SAND  = color(255, 216, 144); // color(255, 216,  96)
    this.fill_terr_WATER = color( 60, 120, 180); // color(  0, 120, 180)
  }

  initMap(){
    for(let r=0; r<this.cellsTall; r++){
      this.map[r]=[];
      for(let c=0; c<this.cellsWide; c++){
        this.map[r].push(TileType.DIRT);
      }
    }    
  } // Ends Function initTileMap

  loadMap(mapArr=null){
    if(mapArr){
      for(let r=0; r<this.cellsTall; r++){
        for(let c=0; c<this.cellsWide; c++){
          switch(mapArr[r][c]){
            case 'r': this.map[r][c] = TileType.ROAD;  break;
            case 'p': this.map[r][c] = TileType.PAVE;  break;
            case 'd': this.map[r][c] = TileType.DIRT;  break;            
            case 'g': this.map[r][c] = TileType.GRASS; break;
            case 's': this.map[r][c] = TileType.SAND;  break;            
            case 'w': this.map[r][c] = TileType.WATER; break;
            default : this.map[r][c] = TileType.ERROR; break;
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
        switch(this.map[r][c]){
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



  // QAD: Used by external stuff (namely UI/UX) to render cursors, etc. WRT tile type colors
  getTileColor(tile){
    switch(tile){
      case TileType.ROAD  : return this.fill_terr_ROAD;  break;
      case TileType.PAVE  : return this.fill_terr_PAVE;  break;
      case TileType.DIRT  : return this.fill_terr_DIRT;  break;
      case TileType.GRASS : return this.fill_terr_GRASS; break;
      case TileType.SAND  : return this.fill_terr_SAND;  break;
      case TileType.WATER : return this.fill_terr_WATER; break;
      default: fill(this.map.fill_ERROR);
    }
  } // Ends Function getTileColor

  getCostAt(p,q){
    switch(arguments.length){
      case 1 : return (this.cellInBounds(p)) ? TileType.cost(this.map[p[0]][p[1]]) : undefined;
      case 2 : return (this.cellInBounds(p,q)) ? TileType.cost(this.map[p][q]) : undefined;
      default: return undefined;
    }
  } // Ends Function getCostAt

  //> Keeping this as a cute little reset method
  setAllCellsToTile(val=TileType.DIRT){
    for(let r=0; r<this.cellsTall; r++){
      for(let c=0; c<this.cellsWide; c++){
        this.map[r][c]=val;
    }}
  } // Ends Function setAllCellsToTile


  /*--------------------------------------------------------------------
  |>>> Function canBuildBldg
  +---------------------------------------------------------------------
  | Description: [QAD] Given TL row/col and cells wide/tall, are all of
  |              the cells encompassing this region NOT of typy [WATER]?
  |              That is: a building of size [WxT] cells could be placed
  |              atop each such cell without any part being over water?
  | Note:        SPMap has a function of the same name which performs
  |              'the other half' of the greater query, i.e. determines
  |              if any of the cells are of type [VACANT].
  +-------------------------------------------------------------------*/
  canBuildBldg(ri,ci,w,t){
    for(let r=0; r<t; r++){
      for(let c=0; c<w; c++){
        if(this.getValueAt(ri+r,ci+c)==TileType.WATER){return false;}
      }    
    }
    return true;
  } // Ends Function canBuildBldg


  renderMap(){
    if(!this.showCells){return;}
    noStroke();
    for(let r=0; r<this.cellsTall; r++){
      for(let c=0; c<this.cellsWide; c++){
        switch(this.map[r][c]){
          case TileType.ROAD  : fill(this.fill_terr_ROAD);  break;
          case TileType.PAVE  : fill(this.fill_terr_PAVE);  break;
          case TileType.DIRT  : fill(this.fill_terr_DIRT);  break;
          case TileType.GRASS : fill(this.fill_terr_GRASS); break;
          case TileType.SAND  : fill(this.fill_terr_SAND);  break;
          case TileType.WATER : fill(this.fill_terr_WATER); break;
          default             : fill(this.fill_ERROR);
        }
        rect(c*this.cellSize,r*this.cellSize,this.cellSize,this.cellSize);
      }
    }
  } // Ends Function renderMap

} // Ends Class TileMap