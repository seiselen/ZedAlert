/*>>> QAD Notes:

> Alternate Colors:
  o WATER @ [  0, 120, 180] yields a deeper blue than current
  o SAND @  [255, 216,  96] yields a more reddish than current
  o Both of the above similarly appear higher-contrast than current

*/

var TileType = {
  DIRT:   0,
  GRASS:  1,
  ROAD:   2,
  PAVE:   3,
  SAND:   4,
  WATER:  5,
  ERROR: -1,

  cost : (ID)=>{ switch(ID){           // | *V2* | *V3* |
    case TileType.ROAD  : return 1;    // |    1 |  0.5 |
    case TileType.PAVE  : return 1;    // |    1 |  0.8 |
    case TileType.DIRT  : return 2;    // |    2 |  1.0 |
    case TileType.GRASS : return 3;    // |    3 |  2.0 |
    case TileType.SAND  : return 4;    // |    4 |  4.0 |
    case TileType.WATER : return 1024; // | 1024 | 64.0 |
    default: return 9999;
  }},

  valToString : (val)=>{
    let keys = Object.keys(TileType);
    for (let i=0; i<keys.length; i++) {
      if(TileType[keys[i]]==val){return keys[i];}
    }
    return undefined;
  },

  valToColArr : (val)=>{return TileType.idToColArr(TileType[val]);},

  idToColArr : (ID)=>{ switch(ID){
    case TileType.ROAD  : return [ 84,  84,  84];
    case TileType.PAVE  : return [168, 168, 168];
    case TileType.DIRT  : return [144,  84,  12];
    case TileType.GRASS : return [  0, 144,  24];
    case TileType.SAND  : return [255, 216, 144];
    case TileType.WATER : return [ 60, 120, 180];
    default             : return [255,0,255];
  }}

}; // Ends Enum TileType