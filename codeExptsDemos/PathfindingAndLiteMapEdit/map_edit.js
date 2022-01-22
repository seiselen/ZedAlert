/*======================================================================
|>>> Class MapEditor
+-----------------------------------------------------------------------
| Overview: TODO
+-----------------------------------------------------------------------
|> TEMP/QAD Implementation Notes and TODOs:
|   o The 'Get-Then-Set' design pattern, as utilized by many 2D Cellular
|     Automata realizations, involves first gathering a list of cells to
|     set, then setting therefrom; <vs> 'Set-As-You-Get', which involves
|     setting values as valid ones thereto are found. This method should
|     resolve much of the artifacts / deficiency encountered within the 
|     original Processing versions of several major generative functions
|     of this class which [still] use 'Set-As-You-Get'. Such artifacts
|     typically encompass lone tiles of some type even though the method
|     [should] resolve this; because it cannot recognize any changes to
|     the map preceeding the 'southeast' direction by which the row/col
|     double for-loop traverses through the 2D grid world/map. Ergo...
|   o TODO: I still need to patch the primary generation phase code for
|     the aforementioned functions which still utilize 'Set-As-You-Get';
|     but will likely leave this as a TODO for the 'next season' of ZAC 
|     development (ETAish late spring early summer 2022?)
+=====================================================================*/
class MapEditor{
  static maxPaintSize = 5;
  static tileSeedPct  = 5; // Percent chance that random tile gets seeded with some type (e.g. for lake, pond, field, etc. generation)

  constructor(gMap){
    this.map = gMap;
    this.paintSize = 1; // square # tiles to paint map tiles (i.e. 'paint water tiles 3x3'); a.k.a. 'drawCellSize' in PathfindingProcessing
    this.paintType = TileType.DIRT;
    this.paintFill = false;
    this.flowField  = [];
    this.blocksMade = [];    
    this.noiseScale = 0.25;
    this.debugPrint = false;
  }

  initFlowField(){
    for(let r=0; r<this.map.cellsTall; r++){this.flowField[r]=[]; for(let c=0; c<this.map.cellsWide; c++){this.flowField[r][c]=0;}} 
    return this; // used for method chaining as typically called preceeding 'randFlowField' call 
  } // Ends Function initFlowField

  randFlowField(){
    noiseSeed(Date.now());
    for(let r=0; r<this.map.cellsTall; r++){for(let c=0; c<this.map.cellsWide; c++){
      this.flowField[r][c]=noise(r*this.noiseScale,c*this.noiseScale);
    }}
  } // Ends Function randFlowField

  // Gets coord that is IN BOUNDS of map, of course!
  getRandomCoord(){
    return [int(random(1,this.map.cellsTall)),int(random(1,this.map.cellsWide))];
  }

  getAdjTotal(row, col, tile){
    let tot = 0;
    for(let adjR = row-1; adjR <= row+1; adjR++){
      for(let adjC = col-1; adjC <= col+1; adjC++){
        if((adjC!=col || adjR!=row) && this.map.cellInBounds(adjR,adjC) && this.map.getValueAt(adjR,adjC) == tile){tot++;}
      }
    }
    return tot;
  } // Ends Function getAdjTotal


  // Defined because the desire to assert valid hash keys is greater than my OCD nagging if its worth its own function
  closedSetKey(sNode){
    return ""+sNode[0]+","+sNode[1];
  } // Ends Function closedSetKey


  //> Warning: Invalid Input NOT handled (though painted tiles will likely appear 'ERROR' purple)
  setPaintType(newType){this.paintType = newType;}

  setPaintSize(coTerm){this.paintSize = constrain(this.paintSize+coTerm, 1, MapEditor.maxPaintSize);}

  paintAtMouseTile(){
    let mouseCoord = this.map.posToCoord(mousePtToVec());
    (this.paintSize==1) ? this.paintSingle(mouseCoord) : this.paintRegion(mouseCoord);
  } // Ends Function paintAtMouseTile

  paintSingle(coord){
    this.map.setValueAt(coord,this.paintType);
  } // Ends Function paintSingle

  paintRegion(coord){
    let temp = [-1,-1];
    for(let r=coord[0]; r<coord[0]+this.paintSize; r++){
      for(let c=coord[1]; c<coord[1]+this.paintSize; c++){
        if(this.map.cellInBounds(r,c)){temp[0]=r; temp[1]=c; this.paintSingle(temp);}    
      }
    }
  } // Ends Function paintRegion


  /*--------------------------------------------------------------------
  |>>> Function floodFill
  +---------------------------------------------------------------------
  |> 'Canon' Note: This is now the OFFICIAL VERSION; i.e. TODO is remove
  |                analog in ZAC-MVP's GameMap class (especially as the
  |                GameMap should NOT contain any other map-edit-related
  |                functions other than setting tile values as getters).
  +-------------------------------------------------------------------*/
  floodFill(seedRow, seedCol, newVal){
    if(!this.map.cellInBounds(seedRow,seedCol)){return;}
    let curVal    = this.map.map_tile[seedRow][seedCol];
    let temp      = null;
    let openSet   = [];
    let closedSet = new Map();
    let curSec    = 0;
    let maxSec    = this.map.cellsWide*this.map.cellsTall;
    
    openSet.push([seedRow,seedCol]);
    closedSet.set(""+seedRow+","+seedCol, 1);

    while(curSec<maxSec && openSet.length > 0){
      temp = openSet.shift();
      this.map.setValueAt(temp,newVal);
      for(let adjR = temp[0]-1; adjR <= temp[0]+1; adjR++){
        for(let adjC = temp[1]-1; adjC <= temp[1]+1; adjC++){
          // Von Neuman Neighborhood <vs> Moore bc of pesky diagonal-border cells
          if(this.map.cellInBounds(adjR,adjC) && (adjR==temp[0] || adjC==temp[1])){
            // Final conditional makes sure all prospective filled tiles need to match original seed tile type
            if(!closedSet.get(""+adjR+","+adjC) && this.map.map_tile[adjR][adjC] == curVal){
              closedSet.set(""+adjR+","+adjC, 1);
              openSet.push([adjR,adjC]);    
            }          
          }   
        }
      }
      curSec++;
    }
    // console.log("SEC = " + curSec + " MAX = " + maxSec);
    openSet.length = 0;
    closedSet.clear();
  } // Ends Function floodFill


  /*--------------------------------------------------------------------
  |>>> Function floodFillAtMouseTile
  +---------------------------------------------------------------------
  | Overview: Calls 'floodFill' with the cell coordinate corresponding
  |           to the current mouse position over the cancas; 'Nuff Said.
  +-------------------------------------------------------------------*/
  floodFillAtMouseTile(){
    let mouseCoord = this.map.posToCoord(mousePtToVec());
    this.floodFill(mouseCoord[0], mouseCoord[1], this.paintType);
  } // Ends Function floodFillAtMouseTile


  /*--------------------------------------------------------------------
  |>>> Function makeRiver
  +-------------------------------------------------------------------*/
  makeRiver(source,destin){
    let buffer = source;
    this.map.setValueAt(buffer,TileType.WATER);
    
    while(buffer[0] != destin[0] || buffer[1] != destin[1]) {
      // I am above and to the left of my destination...Move me either right or down
      if(buffer[1]<destin[1] && buffer[0]<destin[0]){if(int(random(2))==1){buffer[1]+=1;}else{buffer[0]+=1;}}
      // I am above and to the right of my destination...Move me either left or down
      else if(buffer[1]>destin[1] && buffer[0]<destin[0]){if(int(random(2))==1){buffer[1]-=1;} else{buffer[0]+=1;}}
      // I am below and to the left of my destination...Move me either right or up
      else if (buffer[1]<destin[1] && buffer[0]>destin[0]){if(int(random(2))==1){buffer[1]+=1;}else{buffer[0]-=1;}}
      // I am below and to the right of my destination...Move me either left or up
      else if (buffer[1]>destin[1] && buffer[0]>destin[0]){if(int(random(2))==1){buffer[1]-=1;}else{buffer[0]-=1;}}
      // I am one of the remaining [strictly] {above, below, left, right} cases, handle me accordingly
      else if (buffer[1]<destin[1]){buffer[1]+=1;} 
      else if (buffer[1]>destin[1]){buffer[1]-=1;}   
      else if (buffer[0]<destin[0]){buffer[0]+=1;}
      else if (buffer[0]>destin[0]){buffer[0]-=1;}
      // Set the tile I ended up moving to with tile type water
      this.map.setValueAt(buffer,TileType.WATER);
    } // Ends While Loop
  } // Ends Function makeRiver

  /*--------------------------------------------------------------------
  |>>> Function makeRandomRiver
  +---------------------------------------------------------------------
  | Overview: Calls 'makeRiver' with input via valls of 'gerRandomCoord'
  |           (ergo on 'random-but-in-range' coordinates); 'Nuff Said. 
  +-------------------------------------------------------------------*/
  makeRandomRiver(){
    this.makeRiver(this.getRandomCoord(),this.getRandomCoord());
  } // Ends Function makeRandomRiver


  /*--------------------------------------------------------------------
  |>>> [INCOMPLETE-VIA-R&D] Function makeRiverViaFlowField
  +---------------------------------------------------------------------
  | Overview: At the moment, generates extremely long winding rivers via
  |           utilizing a perlin [open simplex?] noise flow-field. This
  |           was an unexpected but delightfully interesting suprise, as
  |           I was about to comment it out as currently degenerate but 
  |           worth perhaps some future R&D! Suffice it to say that such
  |           is now certainly worthy thereto: however I want to get the 
  |           remaining 'ClassicMapMaker' Processing code refactored and
  |           and installed to this project first, before launching any 
  |           expeditions (especially of the Project Genesis type).
  +---------------------------------------------------------------------
  |> Special Note: Logic Schema For Current Switch Case Ternary
  |  > Condition 1:   Rejects adjacencies whose locations are opposite
  |                   to the flow direction of this cell.
  |  > Condition 2:   Rejects adjacencies whose flow directions are
  |                   opposite to the flow direction of this cell.
  |  > Condition 3,4: For adjacencies whose locations are neither equal
  |                   nor opposite to the flow direction of this cell, 
  |                   rejects any whose flow direction leads into this
  |                   cell xor parallel thereto.
  |  > Condition 5:   Admits adjacencies whose location (as relative to
  |                   this cell) and flow direction both match the flow
  |                   direction of this cell (i.e. form a 'straight-line
  |                   'path with this cell). As this is the 'preference'
  |                   for heuristic reasons discussed below, such cases
  |                   thus receive a score of [2].
  |  > Default Case:  Admits remaining adjacencies, encompassing those
  |                   whose locations and/or directions lead 'forwards
  |                   and/or outwards from this cell' WRT its location 
  |                   and direction. Such cases receive a score of [1],
  |                   implying they are at least satisfactory if there
  |                   exists no adjacency of the preferential case.
  |> Special Note: Rationale for Aforementioned 'Preferential Condition'
  |  > Despite the main motivation of this 'complicated as fuck' version
  |    being to PREVENT the undesirable "little diagonal squiggle [good]
  |    followed by straight line run to the destination [bad]" scenario
  |    of the original version, I believe this behavior needs to (rather
  |    ironically) be encouraged: at least on a cell-to-cell basis.
  |  > The main rational why is that I suspect the flow field will (or
  |    at least naturally ought to) minimize significant spans of some
  |    same direction while being 'smoothly random' in the variation of
  |    flows thereof; consequent of their [perlin] noise computation.
  +---------------------------------------------------------------------
  |> NAT[S]: Figure out how to [better] handle diagonal directions; and
  |          recall that clipping them to Von Neuman neighbor cells only
  |          (i.e. {N,S,E,W} worked like crap, so that's not an option).
  +-------------------------------------------------------------------*/
  makeRiverViaFlowField(source,destin){
    let openSet   = new PriorityQueue((p,q)=>(Math.sign(q[2]-p[2])));
    let closedSet = new Map();
    let curSec    = 0;
    let maxSec    = this.map.cellsWide*this.map.cellsTall;
    let myDir     = -1;
    let prefAdj   = null;
    let curNode   = [source[0],source[1],0,null];

    openSet.enqueue(curNode);
    closedSet.set((""+curNode[0]+","+curNode[1]), curNode);

    while(!openSet.isEmpty() && curSec<maxSec){
      curNode = openSet.dequeue();

      if(arr2Equals(curNode,destin)){break;}

      myDir = bucket(this.flowField[curNode[0]][curNode[1]], 8);

      for(let adjR = curNode[0]-1; adjR <= curNode[0]+1; adjR++){
        for(let adjC = curNode[1]-1; adjC <= curNode[1]+1; adjC++){
          // If adjacency is in bounds, in the Von Neuman Neighborhood, and has NOT [yet] been placed on the closed set
          if(this.map.cellInBounds(adjR,adjC) && (adjR==curNode[0] || adjC==curNode[1]) && !closedSet.get(""+adjR+","+adjC)){

            let adjLoc = Direction[((adjR>curNode[0]) ? 'N' : (adjR<curNode[0]) ? 'S' : (adjC>curNode[1]) ? 'E' : (adjC<curNode[1]) ? 'W' : 'X')];
            let adjDir = bucket(this.flowField[adjR][adjC],8);

            // see comment above for more info
            let adjScore = 0;
            switch(myDir){
              case Direction.N: adjScore = ((adjLoc == Direction.S) ? 0 : (adjDir == Direction.S || adjDir==Direction.SW || adjDir==Direction.SE) ? 0 : (adjLoc == Direction.W && (adjDir==Direction.NE || adjDir==Direction.E)) ? 0 : (adjLoc == Direction.E && (adjDir==Direction.NW || adjDir==Direction.W)) ? 0 : (adjLoc == myDir && adjDir == myDir) ? 2 : 1); break;
              case Direction.S: adjScore = ((adjLoc == Direction.N) ? 0 : (adjDir == Direction.N || adjDir==Direction.NW || adjDir==Direction.NE) ? 0 : (adjLoc == Direction.W && (adjDir==Direction.SE || adjDir==Direction.E)) ? 0 : (adjLoc == Direction.E && (adjDir==Direction.SW || adjDir==Direction.W)) ? 0 : (adjLoc=myDir && adjDir==myDir) ? 2 : 1); break;
              case Direction.E: adjScore = ((adjLoc == Direction.W) ? 0 : (adjDir == Direction.W || adjDir==Direction.NW || adjDir==Direction.SW) ? 0 : (adjLoc == Direction.N && (adjDir==Direction.SE || adjDir==Direction.S)) ? 0 : (adjLoc == Direction.S && (adjDir==Direction.NE || adjDir==Direction.N)) ? 0 : (adjLoc=myDir && adjDir==myDir) ? 2 : 1); break;
              case Direction.W: adjScore = ((adjLoc == Direction.E) ? 0 : (adjDir == Direction.E || adjDir==Direction.NE || adjDir==Direction.SE) ? 0 : (adjLoc == Direction.N && (adjDir==Direction.SW || adjDir==Direction.S)) ? 0 : (adjLoc == Direction.S && (adjDir==Direction.NW || adjDir==Direction.N)) ? 0 : (adjLoc=myDir && adjDir==myDir) ? 2 : 1); break;
              default:          adjScore = 0;
            }

            openSet.enqueue([adjR,adjC,curNode[2]+adjScore,curNode]); 
            closedSet.set(""+adjR+","+adjC, curNode);
          }   
        }
      }
      curSec++;
    }
    // console.log("SEC = " + curSec + " MAX = " + maxSec);

    let rivCoords = []; 
    while(curNode!=null){rivCoords.push([curNode[0],curNode[1]]); curNode=curNode[3];}
    // Finally: paint each cell tile in the river to water
    rivCoords.forEach((coord)=>this.map.setValueAt(coord,TileType.WATER));
  } // Ends Function makeRiverViaFlowField



  /*--------------------------------------------------------------------
  |>>> Function makeSimpleShore
  +---------------------------------------------------------------------
  | Overview: Creates shorelines via setting all non [WATER] tile cells 
  |           encompassing the permimeter of any/all such cells to type
  |           [SAND]. That is, for each map cell, if it is not a [WATER]
  |           tile, but at at least one of its Moore Neighbors happens
  |           to be such a tile: then set it to a [SAND] tile. Will not
  |           replace with <setTypeViaAdjs> call, as getting it general
  |           enough for water, grass, and sand-gras dune gen was enough
  |           of a headache; but could do so at some point in future.
  +-------------------------------------------------------------------*/
  makeSimpleShore(){
    for(let r=0; r<this.map.cellsTall; r++){
      for(let c=0; c<this.map.cellsWide; c++){
        if(this.map.getValueAt(r,c) != TileType.WATER){
          for(let adjR=r-1; adjR<=r+1; adjR++){
            for(let adjC=c-1; adjC<=c+1; adjC++){
              if((r!=adjR || c!=adjC) && this.map.cellInBounds(adjR,adjC) && this.map.getValueAt(adjR,adjC)==TileType.WATER){
                this.map.setValueAt(r,c,TileType.SAND); 
    } } } } } }   
  } // Ends Function makeSimpleShore


  /*--------------------------------------------------------------------
  |>>> Function makePondsAndLakes
  +---------------------------------------------------------------------
  | Overview: TODO
  +---------------------------------------------------------------------
  |> Implementation Notes:
  |  > [Old] Note: Difference between this one and grass generation- no
  |                random chance, spread via seeds only!
  |  > [New] Note: Perhaps implement another version utilizing Lague's
  |                'Cave-Gen-With-CAs' algorithm and/or Perlin Noise?
  |  > NAT:        As with CA's - Versus setting tile values directly,
  |                first create a list of cells to set, then set them.
  +-------------------------------------------------------------------*/
  makePondsAndLakes(pctWater=25){
    let totalCells  = this.map.cellsWide*this.map.cellsTall;   
    let curWatTiles = 0; 
    let numWatTiles = (totalCells*pctWater)/100;
    let curFails    = 0; 
    let maxFails    = totalCells*10;
    let numAdded    = 0; 
    let numDeleted  = 0;

    let sample = []; 
    // Phase 1 Water Tile Generation: Set water tiles from dirt via either random chance (via pctDoTile) else adjacent [neighboring] water tiles
    // ^ Note: Check if latter (i.e. adjacency-based) method is consistent/correct WRT when I install Moore Neighborhood support
    while(curFails<maxFails && curWatTiles<numWatTiles){   
      sample = this.getRandomCoord();
      if(this.map.getValueAt(sample)==TileType.DIRT && (int(random(100))<MapEditor.tileSeedPct || this.getAdjTotal(sample[0],sample[1],TileType.WATER)>1)){
        this.map.setValueAt(sample,TileType.WATER); curWatTiles++;
      }
      else{curFails++;}
    }
    if(this.debugPrint){console.log("makePondsAndLakes: water cell placement [curFails/maxFails] = ["+curFails+"/"+maxFails+"]");}

    if(this.debugPrint){console.log("makePondsAndLakes: [curWaterTiles/numWaterTiles] = ["+curWatTiles+"/"+numWatTiles+"] i.e. "+nf((curWatTiles/numWatTiles)*100,2,2)+"%");}
    
    // Phase 2 Water Tile Generation: Set all independent water tiles to dirt, then add as many back via resampling random cells with adjaceny rule increased
    for(let r=0; r<this.map.cellsTall; r++){
      for(let c=0; c<this.map.cellsWide; c++){ 
        if(this.map.getValueAt(r,c)==TileType.WATER && this.getAdjTotal(r,c,TileType.WATER)<3){
          this.map.setValueAt(r,c,TileType.DIRT);
          numDeleted++;
        }
      }
    }

    curFails = 0; // needed to reset from existing value
    while(curFails<maxFails && numAdded<numDeleted){   
      sample = this.getRandomCoord();   
      if(this.map.getValueAt(sample)==TileType.DIRT && this.getAdjTotal(sample[0],sample[1],TileType.WATER)>=4){
        this.map.setValueAt(sample,TileType.WATER); numAdded++; curWatTiles++;
      }
      else{curFails++;}
    }
    if(this.debugPrint){console.log("makePondsAndLakes: [numDeleted/numAdded] = ["+numDeleted+"/"+numAdded+"]");}
    
    if(this.debugPrint){console.log("makePondsAndLakes: [curWaterTiles/numWaterTiles] = ["+curWatTiles+"/"+numWatTiles+"] i.e. "+nf((curWatTiles/numWatTiles)*100,2,2)+"%");}
    // One last mode of generation: [DIRT] tiles with 6+ [WATER] neighbors become [DIRT]
    curWatTiles+= this.setTypeViaAdjs(TileType.DIRT,TileType.WATER,TileType.WATER);

    if(this.debugPrint){console.log("makePondsAndLakes: [curWaterTiles/numWaterTiles] = ["+curWatTiles+"/"+numWatTiles+"] i.e. "+nf((curWatTiles/numWatTiles)*100,2,2)+"%");}
  } // Ends Function makePondsAndLakes


  /*--------------------------------------------------------------------
  |>>> Function makeGrass
  +---------------------------------------------------------------------
  | Overview: TODO
  +-------------------------------------------------------------------*/
  makeGrass(pctGrass=25){    
    let  totalCells     = this.map.cellsWide*this.map.cellsTall;   
    let  numGrassTiles  = (totalCells*pctGrass)/100;
    let  curGrassTiles  = 0;  
    let  sample         = []; 
    let  curFails       = 0; 
    let  maxFails       = totalCells*10;

    while(curFails<maxFails && curGrassTiles<numGrassTiles){   
      sample = this.getRandomCoord();  
      if(this.map.getValueAt(sample)==TileType.DIRT && (int(random(100))<MapEditor.tileSeedPct || this.getAdjTotal(sample[0],sample[1],TileType.GRASS)>1)){
        this.map.setValueAt(sample,TileType.GRASS); curGrassTiles++;
      }
      else{curFails++;}
    }
    if(this.debugPrint){console.log("makeGrass: grass cell placement [curFails/maxFails] = ["+curFails+"/"+maxFails+"]");}

    // Turn any [GRASS] with [8] [DIRT] neighbors to [DIRT], then any [DIRT] with [6+] [GRASS] neighbors to [GRASS], then hope the ratio is ~100%
    let loneGrassRemoved = this.setTypeViaAdjs(TileType.GRASS,TileType.DIRT,TileType.DIRT,8);
    let numGrassReplaced = (loneGrassRemoved==0) ? 0 : this.setTypeViaAdjs(TileType.DIRT,TileType.GRASS,TileType.GRASS,6,loneGrassRemoved);

    if(this.debugPrint){
      let replaceRatio = (loneGrassRemoved==0) ? 0 : nf((numGrassReplaced/loneGrassRemoved)*100,2,2);      
      console.log("makeGrass: lone grass cell replacement: [replaced/removed] = ["+numGrassReplaced+"/"+loneGrassRemoved+"] ("+replaceRatio+"%)");
      console.log("makeGrass: [curGrassTiles/numGrassTiles] = ["+curGrassTiles+"/"+numGrassTiles+"] i.e. "+nf((curGrassTiles/numGrassTiles)*100,2,2)+"%");
    }    
  } // Ends Function makeGrass


  /*--------------------------------------------------------------------
  |>>> Function setTypeViaAdjs
  +---------------------------------------------------------------------
  | Overview: Assigns all cells of TileType [inType] the value [toType] 
  |           if at least [adjMin] of their adjacent Moore Neighborhood 
  |           cells are of value [adjType]. Utilizes the 'Get-Then-Set' 
  |           design pattern / policy as discussed in the header comment
  |           box documentation of this class. ALSO: I'm NOT supporting
  |           default parms because handling thereof is too much of a 
  |           pain and I want to finish this part of ZAC, so will KISS.
  |           Well, seems the one parm that can remain is the original
  |           one I had in mind: adjMin; so at least MVP is retained!
  | Returns:  Total number of cells which were set to [type]; such that
  |           callers like <makeGrass> can use it for their own stats.
  | Parms:    {inType, toType, adjType} => self-explanatory per above
  |           adjMin => self-explanatory per above with TWO EXCEPTIONS
  |           corresponding to special/no input; as follows:
  |            o nothing => assigned default value of [6] per the header
  |            o [-1]    => NO adjacencies must be [adjType] for cell to
  |                         be assigned [toType] ... yes this is a hack,
  |                         but I want to complete this damned function
  |                         before my OCD wastes [even more] time on it!
  +-------------------------------------------------------------------*/
  setTypeViaAdjs(inType, toType, adjType, adjMin=6, stopAt=-1){
    let jobList = [];

    for(let r=0; r<this.map.cellsTall; r++){
      for(let c=0; c<this.map.cellsWide; c++){
        if (this.getAdjTotal(r,c,adjType)<adjMin){continue;}
        if (this.map.getValueAt(r,c)!=inType){continue;}
        jobList.push([r,c]);
      }
    }
    if(stopAt>0){jobList.length=stopAt;}
    jobList.forEach(cell=>this.map.setValueAt(cell[0],cell[1],toType));
    return jobList.length;
  } // Ends Function setTypeViaAdjs


  /*--------------------------------------------------------------------
  |>>> Function makeSimpleSandDuneGrass
  +---------------------------------------------------------------------
  | Overview: Originally the 2nd Phase of 'makeSimpleShore', sets any
  |           [DIRT] tile with 4 or more Moore Neighbors of type [SAND]
  |           to type [GRASS]; thus (kinda?) simulating the grassy areas
  |           adjacent to coast lines (as seen on Long Island and most
  |           archetypal tropical [island] coastlines). 
  +-------------------------------------------------------------------*/
  makeSimpleSandDuneGrass(adjMin=4){
    this.setTypeViaAdjs(TileType.DIRT,TileType.GRASS,TileType.SAND,4);
  } // Ends Function makeSimpleSandDuneGrass


  /*--------------------------------------------------------------------
  |>>> Function createBlocks
  +---------------------------------------------------------------------
  | Overview: Creates 'blocks' (i.e. of which buildings are built upon)
  |           composed of a rectangular area of [PAVE] tiles surrounded 
  |           by a perimeter of [ROAD] tiles. All cells of such an area
  |           must NOT be of type {[WATER],[ROAD],[PAVE]}, else it will
  |           be rejected and another random span considered thereafter.
  | Parms:    numBlocks     - how many blocks to generate (NO GUARANTEE 
  |                           that this many will actually be generated,
  |                           due to both the aforementioned constraints
  |                           as well as the current map state) 
  |           minDim/maxDim - min/max cell range constraining both width
  |                           and height of a generated block; s.t. if
  |                           minDim=[4], maxDim=[8], and the values [5]
  |                           and [6] are selected for the block's width
  |                           and height, and the site thereof is valid:
  |                           there will appear [3x4] cell area composed
  |                           of [PAVE] tiles, surrounded by a [1x] cell
  |                           perimeter of [ROAD] tiles.
  +---------------------------------------------------------------------
  |> Implementation Notes/Issues/TODOs:
  |  o I'm currently recomputing 'random-within-range' heights/widths of
  |    candidate blocks following each site validation fail. This isn't
  |    [generally] neccessary, but it's also not doing any [noticeable]
  |    damage - so KISS and don't fix what ain't broke. I'm nonetheless
  |    noting this in case I ever do work on a more specified/customized 
  |    block creation method at some point in the future.
  |  o R&D a method for resolving 'boulevards' if [roadOverlapOK==true];
  |    i.e. whenever two or more blocks are close enough such that their
  |    perimeter [ROAD] tiles border each other (as to produce a 2x-wide
  |    road thereof) <VS> overlapping each other (as to effect two sides
  |    of the same street sharing the same [ROAD] tiles thereof). I will
  |    refrain from pursuing this right now as to KISS and be a good boy 
  |    towards completing the refactor of this code to P5JS ASAP: but it
  |    is something I want to perhaps sketch out on paper sometime soon.
  |    Suffice it to say (rather, to repeat): this is a TODO item.   
  +-------------------------------------------------------------------*/
  createBlocks(numBlocks=5,minDim=5,maxDim=8,roadOverlapOK=true){   
    let curFails  = 0;
    let maxFails  = 64;   // no issues so far, change if/as needed
    let curBlocks = 0;
    let isValid   = true;
    let extent;           // i.e. bottom right cell of block construct
    let origin;           // i.e. top left cell of block construct

    while(curFails<maxFails && curBlocks<numBlocks){
      origin  = this.getRandomCoord();
      extent  = [origin[0]+round(random(minDim,maxDim)), origin[1]+round(random(minDim,maxDim))]; 
      isValid = true;

      // Qualify <XOR> Disqualify validity of proposed site for placement of block
      if(!this.map.cellInBounds(origin) || !this.map.cellInBounds(extent)){isValid=false;}
      else{
        for(let r=origin[0]; r<extent[0]; r++){
          for(let c=origin[1]; c<extent[1]; c++){
            switch(this.map.getValueAt(r,c)){
              case TileType.WATER: isValid = false; break;
              case TileType.PAVE:  isValid = false; break;
              case TileType.ROAD:  if(!roadOverlapOK || (r!=origin[0] && r!=extent[0]-1 && c!=origin[1] && c!=extent[1]-1)){isValid=false;} break;
      } } } }

      if(!isValid){curFails++; continue;}
   
      for(let r=origin[0]; r<extent[0]; r++){
        for(let c=origin[1]; c<extent[1]; c++){
          if(r==origin[0] || r==extent[0]-1 || c==origin[1] || c==extent[1]-1){this.map.setValueAt(r,c,TileType.ROAD);}
          else{this.map.setValueAt(r,c,TileType.PAVE);}
      } }

      this.blocksMade.push([origin, extent, [int(lerp(origin[0],extent[0],0.5)), int(lerp(origin[1],extent[1],0.5))]]);
      curBlocks++;
    }

    if(this.debugPrint){console.log("makeBlockWithSurroundingRoads: block generation [curFails/maxFails] = ["+curFails+"/"+maxFails+"]");}
  } // Ends Function createBlocks


  /*--------------------------------------------------------------------
  |>>> Function createBlockToSpec
  +---------------------------------------------------------------------
  | Overview: Creates block to exact position and size specs, sans only 
  |           any cells thereof which are out-of-bounds of map [cells].
  | Parms:    Self-Explanatory, except noting that they are exclusive to
  |           the perimeter of [ROAD] cells surrounding the [R R R R R]
  |           [PAVE] cells which compose the block. IOW for [R P P P R]
  |           example: input values of {2,2,4,3} will yield [R P P P R]
  |           a [4] tall [3] wide rect of [PAVE] type cells [R P P P R]
  |           with top-left cell coord is [2,2], surrounded [R P P P R]
  |           by a perimeter of [ROAD] cells, as seen here: [R R R R R]
  +-------------------------------------------------------------------*/
  createBlockToSpec(row,col,cellsTall,cellsWide){
    // Get Top-Left and Bot-Right coords for [ROAD] perimeter i.e. 'REAL extents'
    let roadTL = [row-1,col-1];
    let roadBR = [roadTL[0]+cellsTall+1,roadTL[1]+cellsWide+1];
    // Are extents in-bounds? If so: only constraint passes and block gets made (no matter what exists on its cells)
    if(!this.map.cellInBounds(roadTL) || !this.map.cellInBounds(roadBR)){return;}

    for (let r=roadTL[0]; r<=roadBR[0]; r++){
      for (let c=roadTL[1]; c<=roadBR[1]; c++){       
        this.map.setValueAt(r,c, ((r==roadTL[0]||r==roadBR[0]||c==roadTL[1]||c==roadBR[1]) ? TileType.ROAD : TileType.PAVE));
      }
    }

    this.blocksMade.push([roadTL, roadBR, [int(lerp(roadTL[0],roadBR[0],0.5)), int(lerp(roadTL[1],roadBR[1],0.5))]]);
  } // Ends Function createBlockToSpec


  /*--------------------------------------------------------------------
  |>>> Functions connectBlocksToEachOther / connectBlockToBlock
  +---------------------------------------------------------------------
  | Description: Creates connections between all combinations of blocks
  |              as straight-line [ROAD] paths via Breath-First Search.
  |              Linear spans are realized via only considering a cell's
  |              Von Neuman neighbors; and my OCD notes that we utilize
  |              combination <vs> permutation because we are considering
  |              a path from blocks [p,q] as equivalent to [q,p].
  | Defeciency:  BFS yields 'tangled wires' of connection paths for even
  |              small groups of blocks in maps of mostly [DIRT] cells. 
  |              Although this [pleasantly often] produces a nice effect
  |              resembling bypasses and side-road detours which feature
  |              both 'T' and '+' intersections: less-nice artifacts get
  |              generated alongside. I could keep it as-is: especially
  |              as the purpose of the 'MapEditor' PCG functions are to
  |              provide a basis from which a human can then 'carve-out'
  |              the fine[r] details; and not [YET] to serve as a fully
  |              autonomous PCG map generator (of any significant degree
  |              of 'trustworthiness', anyway). In any case, there's a
  |              relatively straightforward solution to this defeciency
  |              which should work, discussed below in 'Implementation 
  |              Notes/TODOs'...
  +---------------------------------------------------------------------
  |> Implementation Notes/TODOS:
  |   o The cause of the 'Tangled Wire Road Paths' defeciency discussed 
  |     above appears mostly if not fully due to the limitations of BFS;
  |     namely: that it inserts discovered cells in FIFO order into a 
  |     simple Queue, versus inserting WRT lowest cost-from-source into
  |     a Priority Queue. Thus, when generating paths: it CANNOT observe
  |     existing road paths, thus cannot resolve a connection between 
  |     blocks 'p' and 'q' by [implicitly] concluding at some point in
  |     the pathfinding process: "I just found the existing connection 
  |     between blocks 'r' and 'q', and it will get to 'p' quicker than
  |     any alternative I can [continue to] discover, so I'll use it!"
  |     Pathfinding algorithms which DO use a Priority Queue, ergo CAN
  |     add cells to the open set WRT cost and likewise pop therefrom
  |     include UCS and A*, which the (under-construction) Pathfinder
  |     class util realizes. Thus TODO: utilize its pathfinding function
  |     versus the internal one currentlly within <connectBlockToBlock>.
  +-------------------------------------------------------------------*/
  connectBlocksToEachOther(){
    if(this.blocksMade.length<2){return;}
    for(let i=0; i<this.blocksMade.length; i++){for(let j=i+1; j<this.blocksMade.length; j++){this.connectBlockToBlock(i,j);}}
  } // Ends Function connectBlocksToEachOther
  

  connectBlockToBlock(pIdx,qIdx){
    let source = this.blocksMade[pIdx][2];
    let destin = this.blocksMade[qIdx][2];

    let openSet   = [];
    let closedSet = new Map(); 
    let curSec    = 0;
    let maxSec    = this.map.cellsWide*this.map.cellsTall;
    let goalFound = false; 
    let totalHops = 0;
    let curSN  = [source,null]; // SearchNode Array[2]=>{Coord Array[2], SearchNode parent}
    let curRC  = null;
    let tmpKey = [];
    
    openSet.push(curSN);
    closedSet.set(this.closedSetKey(curSN[0]),curSN);

    while(!goalFound && curSec<maxSec && openSet.length>0){
      curSN = openSet.shift();
      curRC = curSN[0];

      this.blocksMade.forEach((block)=>{if(!arr2Equals(curRC,source) && arr2Equals(curRC,destin)){goalFound=true}});
      if(goalFound){break;}
    
      for(let adjR=curRC[0]-1; adjR<=curRC[0]+1; adjR++){
        for(let adjC=curRC[1]-1; adjC<=curRC[1]+1; adjC++){
          tmpKey = this.closedSetKey([adjR,adjC]);
          if(!this.map.cellInBounds(adjR,adjC)||(adjR==curRC[0]&&adjC==curRC[1])||(adjR!=curRC[0]&&adjC!=curRC[1])||(closedSet.get(tmpKey))||(this.map.getValueAt(adjR,adjC)==TileType.WATER)){continue;}
          openSet.push([[adjR,adjC],curSN]);
          closedSet.set(tmpKey,curSN);
        } // Ends Inner For Loop
      } // Ends Outer For Loop
      curSec++;
    } // Ends Frontier Exploration While Loop
  

    if(goalFound){
      while(curSN != null){
        totalHops++;
        curRC = curSN[0];
        if(this.map.getValueAt(curRC)!=TileType.PAVE){this.map.setValueAt(curRC,TileType.ROAD);}
        curSN=curSN[1];
      }
    }

    if(this.debugPrint){
      console.log("BFS Run Completed. Stats...");
      console.log("Total Map Cells: ["+maxSec+"]");
      console.log("Sentinel Count:  ["+curSec+"]");
      console.log("Goal Cell Found: ["+goalFound+"]");
      console.log("Total Path Hops: ["+totalHops+"]");
      console.log("Open Set Size:   ["+openSet.length+"]");
      console.log("Closed Set Size: ["+closedSet.size+"]");
    }

  } // Ends Function connectBlockToBlock


  //####################################################################
  //>>> RENDER FUNCTIONS (MOST SANS renderCursor INTENDED DEBUG-ONLY)
  //####################################################################

  renderCursor(){
    if(!mouseInCanvas()){return;}
    let cSize = this.map.cellSize;
    
    stroke(255,255,0); strokeWeight(4);
    switch(this.paintType){
      case TileType.ROAD  : fill(this.map.fill_terr_ROAD);  break;
      case TileType.PAVE  : fill(this.map.fill_terr_PAVE);  break;
      case TileType.DIRT  : fill(this.map.fill_terr_DIRT);  break;
      case TileType.GRASS : fill(this.map.fill_terr_GRASS); break;
      case TileType.SAND  : fill(this.map.fill_terr_SAND);  break;
      case TileType.WATER : fill(this.map.fill_terr_WATER); break;
      default:              fill(this.map.fill_terr_ERROR); break;
    }

    push(); translate(floor(mouseX/cSize)*cSize,floor(mouseY/cSize)*cSize);
    if(!this.paintFill){rect(0,0,min(this.map.cellsWide-floor(mouseX/cSize), this.paintSize)*cSize,min(this.map.cellsTall-floor(mouseY/cSize), this.paintSize)*cSize);       }
    else{rect(0,0,cSize,cSize);}
    pop();
  } // Ends Function drawMouseCoordCursor

  renderFlowField(){
    noStroke();
    for(let r=0; r<this.map.cellsTall; r++){for(let c=0; c<this.map.cellsWide; c++){
      fill(map(this.flowField[r][c], 0,1, 0,255),255); rect(c*this.map.cellSize,r*this.map.cellSize,this.map.cellSize,this.map.cellSize);
    }}
  } // Ends Function renderFlowField

  renderFlowFieldGlyphs(){
    noStroke(); fill(0); textSize(12); textAlign(CENTER,CENTER); push(); translate(this.map.cellHalf,this.map.cellHalf);
    for(let r=0; r<this.map.cellsTall; r++){for(let c=0; c<this.map.cellsWide; c++){
      text(Direction.glyph[bucket(this.flowField[r][c], 8)],c*this.map.cellSize, r*this.map.cellSize);
    }}
    pop();
  } // Ends Function renderFlowFieldGlyphs

} // Ends Class MapEditor