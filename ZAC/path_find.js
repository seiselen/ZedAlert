/*======================================================================
|>>> Class ZACPathfinder                               [ZED ALERT - MVP]
+-----------------------------------+-----------------------------------
| Author:    Steven Eiselen         | Language:  JavaScript 
| Project:   Zed Alert a.k.a. ZAC   | Library:   P5JS (p5js.org/)
+-----------------------------------+-----------------------------------
| Description: Computes (for ground units) cell-to-cell shortest paths
|              upon current GameMap utilizing A* Search Algorithm; such
|              that the following map information is considered thereto:
|                > TileType of cells within the TileMap layer: as higher
|                  costs -> reduced unit speed, and as cells of TileType
|                  'watr' (i.e. water) encompass [IMPASSIBLE] traversal.
|                > State of cells within the SP (i.e. Spatial Partition)
|                  map, as there are several scenarios by which a cell
|                  occupied by one or more things is [IMPASSIBLE] WRT a
|                  requestor: depending on the requestor and thing[s].
+-----------------------------------------------------------------------
| [AS-YOU-BUILD] Implementation Notes:
|  > 
+-----------------------------------------------------------------------
|########## Zed Alert concept and code[base] © Steven Eiselen ##########
+=====================================================================*/
class ZACPathfinder{
  constructor(refMap){
    this.cellsTall = refMap.cellsTall;
    this.cellsWide = refMap.cellsWide;
    this.refMap    = refMap.map_tile;
    this.refSPMap  = refMap.map_SP;
    this.map       = [];
    this.openSet   = [];
    this.closedSet = [];
    this.lastPath  = [];
    this.heurTypes = ['E','M']; // E->Euclidean | M->Manhattan
    this.curHeur   = 'E';
    this.initMap();
  } // Ends Constructor

} // Ends Class ZACPathfinder