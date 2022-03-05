/*======================================================================
|>>> Class PathFinder                                  [ZED ALERT - MVP]
+-----------------------------------+-----------------------------------
| Author:    Steven Eiselen         | Language:  JavaScript 
| Project:   Zed Alert a.k.a. ZAC   | Library:   P5JS (p5js.org/)
+-----------------------------------+-----------------------------------
| Overview/Notes: Relocated to 'ZAC Technical Notes' in OneNote
+-----------------------------------------------------------------------
| [AS-YOU-BUILD] Implementation Notes:
|  > 
+-----------------------------------------------------------------------
|########## Zed Alert concept and code[base] © Steven Eiselen ##########
+=====================================================================*/
class PathFinder{
  static Algo = {'BFS':1,'GBF':2,'UCS':3,'AST':4, keyViaVal(val){return Object.keys(PathFinder.Algo).find(k=>{return PathFinder.Algo[k]==val;})}}
  static Heur = {'EUC':'e', "MAN":'m'}

  constructor(tt, sp){
    this.ttMap = tt;
    this.spMap = sp;

    this.openSet   = new PriorityQueue((p,q)=>(SearchNode.compare(p,q)));
    this.closedSet = new Map();

    this.totalCost = 0; // total cost of path currently being found
    this.curHeur   = PathFinder.Heur.EUC;
    this.curAlgo   = PathFinder.Algo.AST;

    this.nodeMap = [] // Search Node Object Pool (explicit WRT map cell coords)
  } // Ends Constructor



  initNodeMap(){
    // STUB
  }





  // Called before a new path is computed
  resetState(){
    this.openSet.clear();
    this.closedSet.clear();
    this.totalCost = 0;
  }

  setAlgo(newAlgo){
    this.curAlgo = PathFinder.Algo[newAlgo];
  } // Ends Function setAlgo

  // Returns coord of input adjacency WRT input coord via Direction 'enum' (and MUCH NICER than orig PathfindingProcessing version!)
  coordViaAdj(coord, adj){
    switch(adj){
      case Direction.N  : return [coord[0]-1,coord[1]];   //  [N]=>[8]
      case Direction.S  : return [coord[0]+1,coord[1]];   //  [S]=>[4]
      case Direction.E  : return [coord[0],coord[1]+1];   //  [E]=>[2]
      case Direction.W  : return [coord[0],coord[1]-1];   //  [W]=>[6]
      case Direction.NE : return [coord[0]-1,coord[1]+1]; // [NE]=>[1]
      case Direction.SE : return [coord[0]+1,coord[1]+1]; // [SE]=>[3]
      case Direction.SW : return [coord[0]+1,coord[1]-1]; // [NW]=>[5]
      case Direction.NW : return [coord[0]-1,coord[1]-1]; // [SW]=>[7]
      // Crappy Input Neighborhood :-)
      default: console.log("ERROR! Invalid Direction Input!"); return[-1,-1];
    } // Ends Switch
  } // Ends Function coordViaAdj


  getClosedSet(){
    let retList = [];
    Array.from(this.closedSet.values()).forEach((sNode)=>retList.push([sNode.coord[0],sNode.coord[1]]));
    return retList;
  } // Ends Function getClosedSe

  getOpenSet(){
    let retList = [];
    this.openSet.nodes.forEach((sNode)=>retList.push([sNode.coord[0],sNode.coord[1]]));
    return retList;
  } // Ends Function getOpenSet



  // TODO: Actually [still] looks ass-backwards WRT when shit is added to the closed set. Via BFS Wiki: https://en.wikipedia.org/wiki/Breadth-first_search
  findPath(start,goal){
    this.resetState();

    let curCoord; 
    let adjCoord;

    // sentinel counter/limit to prevent infinite loop : keep for now
    let secCount = 0; 
    let secLimit = 10000;

    // this will eventually need to be dist WRT appropriate TileType cost as to (mostly if not fully) undershoot
    let initHeurDist =  this.ttMap.distBetweenCoords(start,goal);

    let curSNode = new SearchNode(start, 0, initHeurDist, null);

    this.openSet.enqueue(curSNode);

    //####################################################################
    //>>> Phase 1 : Find Path
    //####################################################################
    while(!this.openSet.isEmpty() && secCount<secLimit){  

      // remove min totsal co
      curSNode = this.openSet.dequeue();
      
      // If [GOAL] dequeued: BREAK further exploration - we got it!
      if(arr2Equals(curSNode.coord,goal)){break;}

      // 
      this.closedSet.set(curSNode.coord.toString(), curSNode);
      
      // Current node NOT on closed set (JS syntax note: MUST use '==' NEVER '===')
      if(this.closedSet.get(curSNode.coord.toString()) == null){
        // Put current node into the closed set
        
        
        // explore Moore Neighborhood of current cell coord
        for(let adj=1; adj<9; adj++){

          adjCoord = this.coordViaAdj(curSNode.coord,adj);

          // disregards out-of-bound cells xor water tile cells
          if(!this.ttMap.cellInBounds(adjCoord) || this.ttMap.getValueAt(adjCoord)==TileType.WATER){continue;}

          // create search node WRT current pathfinding algorithm
          switch(this.curAlgo){
            case PathFinder.Algo.AST : this.openSet.enqueue(new SearchNode(adjCoord, (curSNode.cost+this.ttMap.getCostAt(adjCoord)), this.ttMap.distBetweenCoords(adjCoord, goal), curSNode)); break;
            case PathFinder.Algo.UCS : this.openSet.enqueue(new SearchNode(adjCoord, (curSNode.cost+this.ttMap.getCostAt(adjCoord)), 0, curSNode)); break;            
            case PathFinder.Algo.GBF : this.openSet.enqueue(new SearchNode(adjCoord, 0, this.ttMap.distBetweenCoords(adjCoord, goal), curSNode)); break;
            case PathFinder.Algo.BFS : this.openSet.enqueue(new SearchNode(adjCoord, 0, 0, curSNode)); break;            
          } // Ends Switch
        } // Ends For Loop
      } // Ends Conditional
      secCount++;
    } // Ends While Loop    

    //####################################################################
    //>>> Phase 2 : Generate+Return Path
    //####################################################################
    let path = [];
    while(curSNode!=null){
      this.totalCost += this.ttMap.getCostAt(curSNode.coord);
      path.push([curSNode.coord[0],curSNode.coord[1]]);
      curSNode=curSNode.parent;
    }
    path.pop();
    path.reverse();
    return path;
  } // Ends Function findPath


} // Ends Class PathFinder






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
| Variables: [nhCoords] => neighborhood coords i.e. the [row,col] values
|            corresponding to the [row,col] value of this search node.
|  
+-----------------------------------------------------------------------
| [AS-YOU-BUILD] Implementation Notes:
|  > 
+-----------------------------------------------------------------------
|########## Zed Alert concept and code[base] © Steven Eiselen ##########
+=====================================================================*/
class SearchNode{
  // Comparator Method, as passed to Priority Queue for it to use
  static compare(a,b){
    return Math.sign((a.travCost+a.heurCost)-(b.travCost+b.heurCost));
  }

  constructor(loc,cost,heur,par){
    this.coord    = loc;
    this.parent   = par; 
    this.nhCoords = [];   
    this.travCost = cost;
    this.heurCost = heur;

    this.initNeighborCoords();
  } // Ends Constructor

  /*----------------------------------------------------------------------
  |>>> Function initNeighborCoords 
  +-----------------------------------------------------------------------
  | Overview: Computes and caches the [row,col] coords for each neighbor
  |           of this SearchNode; <vs> recomputing \foreach pathfind call. 
  +-----------------------------------------------------------------------
  | Implementation Notes:
  |  > Current Ordering (at time of typing this): {N,S,E,W,NE,SE,NW,SW}.
  |    This order is *effectively* arbitrary, as the shortest path should
  |    be found regardless; with the CAVEAT that different orderings might
  |    yield different paths for scenarios of *multiple* shortest paths.
  +---------------------------------------------------------------------*/
  initNeighborCoords(){
    this.nhCoords = [[this.coord[0]-1,this.coord[1]], [this.coord[0]+1,this.coord[1]], [this.coord[0],this.coord[1]+1], [this.coord[0],this.coord[1]-1], [this.coord[0]-1,this.coord[1]+1], [this.coord[0]+1,this.coord[1]+1], [this.coord[0]+1,this.coord[1]-1], [this.coord[0]-1,this.coord[1]-1],];
  } // Ends Function initNeighborCoords

  /*----------------------------------------------------------------------
  |>>> Function toString
  +-----------------------------------------------------------------------
  | Overview: Self-Explanatory. The info given with <toString> should be
  |           suficient for most cases sans getting more info about this
  |           node's parent than simply that it exists; for which one can
  |           grab the parent's reference and call <toString> thereto.
  +---------------------------------------------------------------------*/
  toString(){
    return "SearchNode @ ["+this.coord[0]+","+this.coord[1]+"] => trav. cost: ["+this.travCost+"] | heur. cost: ["+this.heurCost+"] | has parent: "+ ((this.parent) ? "[yes]" : "[no]");
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