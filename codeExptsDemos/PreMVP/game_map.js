/*>>> AS-YOU-BUILD NOTES:

--> Steering Agents/Motors will [now] ref HERE for scent/sound flowfields to follow


*/
var TileType = {};
var 

class GameMap{
  constructor(cT,cW,cS,mapInfo){
    //##################################################################
    //>>> DATA STRUCTURE / VARIABLE DECLARATIONS (AND INITS A/A)
    //##################################################################

    //> General/Shared Map Info
    this.cellsTall = cT;
    this.cellsWide = cW;
    this.cellSize  = cS;
    this.cellHalf  = this.cellSize/2;
    this.cellQuar  = this.cellSize/4;
    this.areaWide  = this.cellsWide*this.cellSize;
    this.areaTall  = this.cellsTall*this.cellSize;    

    //> [Sub] Layer Map Info
    this.map_tile  = []; // cell type (e.g. buildable, enemyPath, etc.) for rendering and unit speed purposes
    this.map_SP    = []; // spatial partition info (i.e. agents reported in each cell) for a BUNCH of uses
    this.map_scent = []; // vector flow-field s.t. zombies can track traces left by humans passing over cells
    this.map_sound = []; // vector flow-field s.t. zombies and human NPCs can track recent [loud] sounds

    //> UI/UX Toggle Configs
    this.showGrid    =  false; // show cell grid   (def:false)
    this.showCoords   = false; // show cell coords (def:false)
    this.showTileMap  = true;  // show map tiles   (def:true)
    this.showSPMap    = false; // show SP map      (def:false)
    this.showScentMap = false; // show scent field (def:false)
    this.showSoundMap = false; // show sound field (def:false)



  }


}



/*

//======================================================================
//>>> Init and Loader Functions
//======================================================================

//> Init Functions
initColorPallete()
initTileMap()
initSPMap()
initScentMap()
initSoundMap()

//> Loader Functions
loadMap(mapArr=null)

//======================================================================
//>>> Update Functions
//======================================================================

//> EVERYTHING uses this (i.e. [bodies, vehicles, bldgs])
updatePos(obj)
removePos(obj) // used when object is: (1) killed/destroyed or (2) body unit inside vehicle or {guard tower, bunker}

//> Used by Scent/Sound maps to decay/fade/reduce values over time
updateCells()

//======================================================================
//>>> Toggle Functions
//======================================================================

//> Toggles flag which [should] effect showing/hiding each, respectively 
toggleGrid()
toggleCoords()
toggleTileMap()
toggleSPMap()
toggleScentMap()
toggleSoundMap()

//> Swaps between [supported] display modes if/as respective maps render
toggleTileMapVizMode(options=>{perCell,marchSquares}) //<== though again: NO MARCHING SQUARES for awhile!
toggleSPMapVizMode(options=>{population,heatmap})
toggleScentMapVizMode(options=>{values,glyphs})
toggleSoundMapVizMode(options=>{values,glyphs})


//======================================================================
//>>> Setters
//======================================================================

//> General Setters (s.t. layer and val specified as parms)
setValueAt(cell,layer,val)
setAllCellsTo(layer,val)
resetCellVals(layer) // basically: calls 'this.setAllCellsTo(layer, <default value WRT layer>)'

//> Setters WRT Tile [Map] Layer
floodFillAt(cell,layer,val) // NOT [YET] IMPLEMENTED, but should utilize 'BFS method' when you do so!

//> Setters WRT SP Layer
setToFilled(cell)
setToVacant(cell)

//> Setters WRT Scent/Sound Layers (resp.)
leaveScent(oldCoord,newCoord,scentVal) // currently: updatePos calls whenever human unit leaves current cell
makeASound(sPos, sRad) // called by [handler of] event producing an 'observable' sound (e.g. grenade explodes)

//======================================================================
//>>> Getters and ToStrings/ToConsoles
//======================================================================

//> Gets ANYTHING posting itself to SP (i.e. [bodies, vehicles, bldgs])
getObjsInCells(cellList)
getObjsAtCell(cell)

//> Gets UNITS xor BLDGS ONLY (i.e. [bodies, vehicles] xor [bldgs])
getUnitsInCells(cellList)
getUnitsAtCell(cell)
getBldgsInCells(cellList)
getBldgAtCell(cell)

//> 'Legacy' WRT above generalizations, but keeping for now
isCellVacant(rc)
isCellOccupied(rc)
canBuildBldg(cellTL,w,t) // where [cellTL]=> top-left cell and [w,t]=> cells wide/tall of building 
findVacantCell() // finds via searching top-left to bottom-right

getAt(row, col)
getCostAt(int row, int col)

//> Getters (Spatial-Oriented)
getCellCoordAtPos(pos)
getCellMidPtAtPos(pos)
getCellTLPosAtPos(pos)
getCellPosAtPos(){return this.getCellTLPosAtPos();}
getCellMidPtAtCoord(cell)
getCellPosAtCoord(){return this.getCellTLPosAtCoord();}
getCellTLPosAtCoord(cell)
posInBounds(pos)
cellInBounds(cell)

//> ToStrings
mapToString(nLine="\n")


//======================================================================
//>>> Render Functions
//======================================================================
render()
renderGrid()
renderCellCoords()
renderTileMap()
renderSPMap()
renderScentMap()
renderSoundMap()








*/