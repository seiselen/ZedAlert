/*======================================================================
|>>> Class PathFinder                                  [ZED ALERT - MVP]
+-----------------------------------+-----------------------------------
| Author:    Steven Eiselen         | Language:  JavaScript 
| Project:   Zed Alert a.k.a. ZAC   | Library:   P5JS (p5js.org/)
+-----------------------------------+-----------------------------------
| Overview/Notes: Relocated to 'ZAC Technical Notes' in OneNote
+-----------------------------------------------------------------------
| [AS-YOU-BUILD] Implementation Notes:
|  > TILE MAP (i.e. 'ttMap') will be primary source for map dims (i.e.
|    'cellsWide') as well as GridMap functions (i.e. <posToCoord>), as
|    a valid one MUST always be passed in; whereas SP MAP (i.e. 'spMap')
|    is kinda-sorta optional (i.e. if SP system is not being used), and
|    is handled accordingly (i.e. via <validateSP> function).
|  > VARIABLE 'hScaleFct' -> 'Heuristic Scale Factor', and os simply the
|    cost of a [DIRT] tile. Used to scale distances in terms of cells to
|    that of (cells*TileType.cost(DIRT)); e.g. "4 cells from goal" s.t. 
|    cost(DIRT)=>2 encompasses a total cost of (4*2)=[8]. 
|  > VARIABLES 'secCount' and 'secLimit' encompass the usual sentinels
|    for preventing an infinite while loop : keep for now
+-----------------------------------------------------------------------
|########## Zed Alert concept and code[base] © Steven Eiselen ##########
+=====================================================================*/
class PathFinder{
  static Algo = {'BFS':1,'GBF':2,'UCS':3,'AST':4, keyViaVal(val){return Object.keys(PathFinder.Algo).find(k=>{return PathFinder.Algo[k]==val;})}}
  static Heur = {'EUC':'e', "MAN":'m'}
  static secLimit = 10000;

  constructor(tt, sp){
    this.ttMap     = tt;
    this.spMap     = sp;
    this.cellsTall = tt.cellsTall;
    this.cellsWide = tt.cellsWide;
    this.cellSize  = tt.cellSize;
    this.curHeur   = PathFinder.Heur.EUC;
    this.curAlgo   = PathFinder.Algo.AST;
    this.hScaleFct = TileType.cost(TileType.DIRT);

    this.totCost   = 0; // total cost of path currently being found    
    this.tempCost  = 0; // temp cost, as to compare with current shortest (A/A)
    this.secCount  = 0; 
    this.oSet      = new PriorityQueue((p,q)=>(SearchNode.compare(p,q)));
    this.cSet      = new Map();
    this.curCoord  = null; 
    this.adjCoord  = null;
    this.curNode   = null;
    this.adjNode   = null;

    this.initNodeMap();
  } // Ends Constructor


  // Inits Search Node Graph
  initNodeMap(){
    this.nodeMap = [];    
    for(let r=0; r<this.cellsTall; r++){
      this.nodeMap[r]=[]; 
      for(let c=0; c<this.cellsWide; c++){
        this.nodeMap[r].push(new SearchNode([r,c], Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER, null));
    }} 
  } // Ends Function initMap


  resetAllNodes(){
    for(let r=0; r<this.cellsTall; r++){
      for(let c=0; c<this.cellsWide; c++){
        this.resetNodeVals(this.nodeMap[r][c]);
    }}
  } // Ends Function resetAllNodes


  resetNodeVals(node){
    node.gScore = Number.MAX_SAFE_INTEGER;
    node.hScore = Number.MAX_SAFE_INTEGER;
    node.parent   = null;
  } // Ends Function resetNodeVals


  // Called before a new path is computed
  resetState(){
    this.resetAllNodes();
    this.oSet.clear();
    this.cSet.clear();
    this.secCount  = 0;
    this.totCost   = 0;
    this.tempCost  = 0;
    this.curCoord  = null; 
    this.adjCoord  = null;
    this.curNode   = null;
    this.adjNode   = null;
  } // Ends Function resetState


  setAlgo(newAlgo){
    this.curAlgo = PathFinder.Algo[newAlgo];
  } // Ends Function setAlgo


  // Returns coord of input adjacency WRT input coord via Direction 'enum' (and MUCH NICER than orig PathfindingProcessing version!)
  coordViaAdj(coord, adj){
    switch(adj){
      case Direction.N  : return [coord[0]-1, coord[1],   1];          //  [N]=>[8]
      case Direction.S  : return [coord[0]+1, coord[1],   1];          //  [S]=>[4]
      case Direction.E  : return [coord[0],   coord[1]+1, 1];          //  [E]=>[2]
      case Direction.W  : return [coord[0],   coord[1]-1, 1];          //  [W]=>[6]
      case Direction.NE : return [coord[0]-1, coord[1]+1, Math.SQRT2]; // [NE]=>[1]
      case Direction.SE : return [coord[0]+1, coord[1]+1, Math.SQRT2]; // [SE]=>[3]
      case Direction.NW : return [coord[0]-1, coord[1]-1, Math.SQRT2]; // [SW]=>[7]
      case Direction.SW : return [coord[0]+1, coord[1]-1, Math.SQRT2]; // [NW]=>[5]
      // Crappy Input Neighborhood :-)
      default: console.log("ERROR! Invalid Direction Input!"); return[-1,-1];
    } // Ends Switch
  } // Ends Function coordViaAdj


  // Cool use of Short-Circuit {OR}
  validateSP(adj){
    return (this.spMap == null || this.spMap.isCellVacant(adj));
  }


  //> Heuristic distance function, s.t. 'qCoord' should typically always be the goal cell coords
  heurDist(pCoord,qCoord){
    switch(this.curHeur){
      case PathFinder.Heur.EUC: return this.hScaleFct*dist(pCoord[0], pCoord[1], qCoord[0], qCoord[1]); 
      case PathFinder.Heur.MAN: return this.hScaleFct*distManh(pCoord[0], pCoord[1], qCoord[0], qCoord[1]); 
      default : console.error("Error! Invalid Value ["+this.curHeur+"]."); return -9999;
    }
  } // Ends Function heurDist


  // THIS RETURNS *COORDS*, I.E. NOT MIDPOINT POSITIONS. Wrap it as parm to call of <constructPathAsMidPts> to get them (for now at least...)
  constructPath(node,midPts=false){
    let path = [];
    this.secCount = 0;
    while(node!=null && this.secCount < PathFinder.secLimit){
      this.totCost += this.ttMap.getCostAt(node.coord);
      switch(midPts){
        case true: path.push(this.ttMap.coordToMidPt(node.coord)); break;
        case false: path.push([node.coord[0],node.coord[1]]); break;
      }
      node = node.parent;
      this.secCount++;
    }
    path.pop();
    path.reverse();
    return path;
  } // Ends Function constructPath


  getClosedSet(){
    let retList = [];
    Array.from(this.cSet.values()).forEach((sNode)=>retList.push([sNode.coord[0],sNode.coord[1]]));
    return retList;
  } // Ends Function getClosedSe


  getOpenSet(){
    let retList = [];
    this.oSet.nodes.forEach((sNode)=>retList.push([sNode.coord[0],sNode.coord[1]]));
    return retList;
  } // Ends Function getOpenSet


  summaryToConsole(goalFound){
    console.log(PathFinder.Algo.keyViaVal(this.curAlgo) + " Outcome: " + ((goalFound) ? "GOAL FOUND!" : "GOAL NOT FOUND!") + "\n> Closed Set: ["+this.cSet.size +"]\n> Open Set:   ["+this.oSet.nodes.length+"]");
  }



  findPath(start,goal,midPts=false){
    this.resetState();
    let goalFound = false;
    // create search node WRT current pathfinding algorithm
    switch(this.curAlgo){
      case PathFinder.Algo.BFS : goalFound = this.findPathBFS(start,goal); break;
      case PathFinder.Algo.GBF : goalFound = this.findPathGBF(start,goal); break;
      case PathFinder.Algo.UCS : goalFound = this.findPathUCS(start,goal); break;      
      case PathFinder.Algo.AST : goalFound = this.findPathAST(start,goal); break;      
    }

    this.summaryToConsole(goalFound);

    return this.constructPath(this.curNode, midPts);
  } // Ends Function findPath


  findPathBFS(start, goal){
    this.curNode = this.nodeMap[start[0]][start[1]];
    this.oSet.push(this.curNode);
    this.cSet.set(this.curNode.coord.toString(), this.curNode);

    while(!this.oSet.isEmpty() && this.secCount<PathFinder.secLimit){
      this.curNode = this.oSet.pop();
      if(arr2Equals(this.curNode.coord, goal)){return true;}
      for(let i=0; i<8; i++){
        this.adjCoord = this.curNode.adjCoords[i];
        if(!this.ttMap.cellInBounds(this.adjCoord) || this.cSet.has(this.adjCoord.toString()) || this.ttMap.getValueAt(this.adjCoord)==TileType.WATER || !this.validateSP()){continue;}
        this.adjNode = this.nodeMap[this.adjCoord[0]][this.adjCoord[1]];
        this.adjNode.parent = this.curNode;
        this.cSet.set(this.adjCoord.toString(), this.adjNode);
        this.oSet.push(this.adjNode);
      } // Ends For Loop
      this.secCount++;
    } // Ends While Loop
    return false;
  } // Ends Function findPathBFS


  findPathGBF(start, goal){
    this.curNode = this.nodeMap[start[0]][start[1]];
    this.curNode.gScore = 0;
    this.curNode.hScore = this.heurDist(this.curNode.coord,goal);
    this.oSet.enqueue(this.curNode);

    while(!this.oSet.isEmpty() && this.secCount<PathFinder.secLimit){
      this.curNode = this.oSet.dequeue();
      if(arr2Equals(this.curNode.coord, goal)){return true;}
      if(this.cSet.has(this.curNode.coord.toString())){continue;}
      this.cSet.set(this.curNode.coord.toString(), this.curNode);

      for(let i=0; i<8; i++){
        this.adjCoord = this.curNode.adjCoords[i];

        if( !this.ttMap.cellInBounds(this.adjCoord) || 
            this.cSet.has(this.adjCoord.toString()) || this.oSet.has(this.adjCoord) || //> TODO: Test if these two are [still] needed???
            this.ttMap.getValueAt(this.adjCoord)==TileType.WATER || !this.validateSP()){
          continue;
        }

        this.adjNode = this.nodeMap[this.adjCoord[0]][this.adjCoord[1]];
        this.adjNode.parent = this.curNode;
        this.adjNode.hScore = this.heurDist(this.adjCoord, goal);
        this.oSet.enqueue(this.adjNode);
      } // Ends For Loop
      this.secCount++;
    } // Ends While Loop
    return false;
  } // Ends Function findPathGBF


  findPathUCS(start, goal){
    this.curNode = this.nodeMap[start[0]][start[1]];
    this.curNode.gScore = 0;    
    this.curNode.hScore = 0;
    this.oSet.enqueue(this.curNode);
    this.cSet.set(this.curNode.coord.toString(), this.curNode);

    while(!this.oSet.isEmpty() && this.secCount<PathFinder.secLimit){
      this.curNode = this.oSet.dequeue();
      if(arr2Equals(this.curNode.coord,goal)){return true;}
      //if(this.cSet.has(this.curNode.coord.toString())){ console.log("hi"); continue;}
      //this.cSet.set(this.curNode.coord.toString(), this.curNode);

      for(let i=0; i<8; i++){
        this.adjCoord = this.curNode.adjCoords[i];

        if(!this.ttMap.cellInBounds(this.adjCoord) || this.ttMap.getValueAt(this.adjCoord)==TileType.WATER || !this.validateSP()){continue;}

        this.adjNode = this.nodeMap[this.adjCoord[0]][this.adjCoord[1]];
        this.tempCost = this.curNode.gScore + (this.ttMap.getCostAt(this.adjCoord)*this.adjNode.getDiagFact(i));

        if(!this.cSet.has(this.adjCoord.toString()) && !this.oSet.has(this.adjCoord)){
          this.adjNode.parent = this.curNode;
          this.adjNode.gScore = this.tempCost;
          this.adjNode.hScore = 0;
          this.oSet.enqueue(this.adjNode);
          this.cSet.set(this.adjCoord.toString(), this.adjNode); 
        }
        else if (this.oSet.has(this.adjCoord) && this.tempCost < this.adjNode.gScore){
          this.adjNode.parent = this.curNode;
          this.adjNode.gScore = this.tempCost;
          this.adjNode.hScore = 0;
        }

      } // Ends For Loop
      this.secCount++;
    } // Ends While Loop
    return false;
  } // Ends Function findPathUCS


  findPathAST(start, goal){
    this.curNode = this.nodeMap[start[0]][start[1]];
    this.curNode.gScore = 0;
    this.curNode.hScore = this.heurDist(this.curNode.coord, goal);
    this.oSet.enqueue(this.curNode);
    this.cSet.set(this.curNode.coord.toString(), this.curNode);

    while(!this.oSet.isEmpty() && this.secCount<PathFinder.secLimit){
      this.curNode = this.oSet.dequeue();
      if(arr2Equals(this.curNode.coord,goal)){return true;}
      //if(this.cSet.has(this.curNode.coord.toString())){ console.log("hi"); continue;}
      //this.cSet.set(this.curNode.coord.toString(), this.curNode);

      for(let i=0; i<8; i++){
        this.adjCoord = this.curNode.adjCoords[i];

        if(!this.ttMap.cellInBounds(this.adjCoord) || this.cSet.has(this.adjCoord.toString()) || this.ttMap.getValueAt(this.adjCoord)==TileType.WATER || !this.validateSP()){continue;}

        this.adjNode = this.nodeMap[this.adjCoord[0]][this.adjCoord[1]];
        this.tempCost = this.curNode.gScore + (this.ttMap.getCostAt(this.adjCoord)*this.adjNode.getDiagFact(i));

        if(this.oSet.has(this.adjCoord)){
          if (this.tempCost < this.adjNode.gScore){
            this.adjNode.gScore = this.tempCost;
            this.adjNode.hScore = this.heurDist(this.adjCoord, goal);
            this.adjNode.parent = this.curNode;
            this.oSet.heapifyUp(this.oSet.idx(this.adjCoord));                    
          }
        }
        else{
            this.adjNode.gScore = this.tempCost;
            this.adjNode.hScore = this.heurDist(this.adjCoord, goal);
            this.adjNode.parent = this.curNode;
            this.oSet.enqueue(this.adjNode);
            this.cSet.set(this.adjCoord.toString(), this.adjNode); 
        }

      } // Ends For Loop
      this.secCount++;
    } // Ends While Loop
    return false;
  } // Ends Function findPathAST

} // Ends Class PathFinder


/*>>> TEMPORARY FOR [HOPEFULLY NOT] AS-NEEDED REFERENCE UNTIL PATHFINDER IS [PROVEN]. THEN COULD THROW IN 'ZAC OLD CODE GRAVEYARD' IF YOU'RE *THAT* OCD ABOUT KEEPING IT...
  findPath(start,goal){
    let initHeurDist = this.ttMap.distBetweenCoords(start,goal);
    let curNode      = new SearchNode(start, 0, initHeurDist, null);
    let tempSNode    = null;

    this.openSet.enqueue(curNode);
    this.closedSet.set(curNode.coord.toString(), curNode);

    while(!this.openSet.isEmpty() && this.secCount<PathFinder.secLimit){  
      curNode = this.openSet.dequeue();
      if(arr2Equals(curNode.coord,goal)){this.summaryToConsole(true); return;}
      
      for(let adj=1; adj<9; adj++){
        adjCoord = this.coordViaAdj(curNode.coord,adj);

        if(this.ttMap.cellInBounds(adjCoord) && this.closedSet.has(adjCoord.toString()) && this.ttMap.getValueAt(adjCoord)==TileType.WATER && this.validateSP()){
   
          switch(this.curAlgo){
            case PathFinder.Algo.AST : tempSNode = new SearchNode(adjCoord, (curNode.travCost+this.ttMap.getCostAt(adjCoord)), this.ttMap.distBetweenCoords(adjCoord, goal), curNode); break;
            case PathFinder.Algo.UCS : tempSNode = new SearchNode(adjCoord, (curNode.travCost+ (this.ttMap.getCostAt(adjCoord)*adjCoord[2])), 0, curNode); break;            
            case PathFinder.Algo.GBF : tempSNode = new SearchNode(adjCoord, 0, this.ttMap.distBetweenCoords(adjCoord, goal), curNode); break;
            case PathFinder.Algo.BFS : tempSNode = new SearchNode(adjCoord, curNode.travCost+adjCoord[2], 0, curNode); break;            
          } // Ends Switch

          this.openSet.enqueue(tempSNode);
          this.closedSet.set(tempSNode.coord.toString(), tempSNode) 
        }
      } // Ends For Loop
      secCount++;
    } // Ends While Loop    
    this.summaryToConsole(false);
  } // Ends Function findPath
*/



/*======================================================================
|>>> Class SearchNode                                  [ZED ALERT - MVP]
+-----------------------------------+-----------------------------------
| Author:    Steven Eiselen         | Language:  JavaScript 
| Project:   Zed Alert a.k.a. ZAC   | Library:   P5JS (p5js.org/)
+-----------------------------------+-----------------------------------
| Overview:  Implements representation of a map cell WRT its pathfinding
|            state; specifically its travel cost (i.e. from some 'start'
|            cell), heuristic cost (i.e. towards some 'goal' cell), and
|            the cell which first discovered it.
| Variables: > [adjCoords] : [row,col] coords of adjacent cells WRT this
|            search node (i.e. its neighborhood)
|            > travCost : AKA 'gScore' encompasses "currently known cost 
|              of cheapest path from <start> to <cell>" (i.e. does NOT 
|              include 'heuristic-dist-from-here-to-goal')
|            > heurCost : AKA 'fScore' AKA TOTAL score encompasses the 
|              "current best guess for how short path from <start> to 
|               <goal> could be if going through <cell>"; i.e. it has
|              the value travCost[cell] + heur(cell).
+-----------------------------------------------------------------------
| [AS-YOU-BUILD] Implementation Notes:
|  > 'heurCost' => TOTAL COST i.e. 'travCost' + [most recent] heur dist
|  > Should I prune out-of-bounds coords (A/A) at construction to spare
|    the <cellInBounds(...)> check within the pathfind algorithms' code?
+-----------------------------------------------------------------------
|########## Zed Alert concept and code[base] © Steven Eiselen ##########
+=====================================================================*/
class SearchNode{
  // Comparator Method, as passed to Priority Queue for it to use
  static compare(a,b){
    return Math.sign(a.fScore()-b.fScore());
  }

  constructor(loc,g,h,par){
    this.coord  = loc;
    this.parent = par;  
    this.gScore = g;
    this.hScore = h;
    this.fScore = function(){return this.gScore + this.hScore;}
    this.initAdjCoords();
  } // Ends Constructor

  /*----------------------------------------------------------------------
  |>>> Function initAdjCoords 
  +-----------------------------------------------------------------------
  | Overview: Computes and caches the [row,col] coords for each neighbor
  |           of this SearchNode; <vs> recomputing \foreach pathfind call. 
  +-----------------------------------------------------------------------
  | Implementation Notes:
  |  > Current Ordering (at time of typing this): {N,S,E,W,NE,SE,NW,SW}.
  |    This order is *effectively* arbitrary, as the shortest path should
  |    be found regardless; with the CAVEAT that different orderings might
  |    yield different paths for scenarios of *multiple* shortest paths.
  |  > I also want to keep the ordering s.t. the first 4 coords encompass 
  |    the Von Neuman neighborhood, vs per the order of [Direction] enum.
  |  > I still need to add the 3rd 'coord' of {[1] XOR sqrt(2)} to provide
  |    an accurate cell-to-cell distance WRT diagonal neighbors
  +---------------------------------------------------------------------*/
  initAdjCoords(){
    this.adjCoords = [
    // Von Neuman Neighbors
      [this.coord[0]-1, this.coord[1]  ],
      [this.coord[0]+1, this.coord[1]  ],
      [this.coord[0],   this.coord[1]+1],
      [this.coord[0],   this.coord[1]-1],
    // Moore-Excl Neighbors
      [this.coord[0]-1, this.coord[1]+1],
      [this.coord[0]+1, this.coord[1]+1],
      [this.coord[0]+1, this.coord[1]-1],
      [this.coord[0]-1, this.coord[1]-1]
    ];
  } // Ends Function initNeighborCoords

  getDiagFact(i){
    return (i<4) ? 1 : Math.SQRT2;
  }

  /*----------------------------------------------------------------------
  |>>> Function toString
  +-----------------------------------------------------------------------
  | Overview: Self-Explanatory. The info given with <toString> should be
  |           suficient for most cases sans getting more info about this
  |           node's parent than simply that it exists; for which one can
  |           grab the parent's reference and call <toString> thereto.
  +---------------------------------------------------------------------*/
  toString(){
    return "SearchNode @ ["+this.coord[0]+","+this.coord[1]+"] => 'G' Score: ["+this.gScore+"] | 'H' Score: ["+this.hScore+"] | has parent: "+ ((this.parent) ? "[yes]" : "[no]");
  } // Ends Function toString

  /*----------------------------------------------------------------------
  |>>> Function toConsole 
  +-----------------------------------------------------------------------
  | Overview: Self-Explanatory, 'Nuff Said... sans that I decided to call
  |           console 'warn' <vs> 'log'; for no other reason than that it
  |           will appear yellow in Chrome (and other?) browser consoles.
  +---------------------------------------------------------------------*/
  toConsole(){
    console.warn(this.toString());
  } // Ends Function toConsole
} // Ends Class SearchNode