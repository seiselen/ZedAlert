/*======================================================================
|>>> Class SearchNode
+-----------------------------------------------------------------------
| Overview: Implements representation of a map cell WRT its pathfinding
|           state; specifically its travel cost (i.e. from some 'start'
|           cell), heuristic cost (i.e. towards some 'goal' cell), and
|           the cell which first discovered it.
+=====================================================================*/
class SearchNode{
  // Comparator Method, as passed to Priority Queue for it to use
  static compare(a,b){
    return Math.sign((a.cost+a.heur)-(b.cost+b.heur));
  }

  // TEMP Note: Processing version partitioned 'coord' into 'row' and 'col', and called 'ID' 'insertionNum'
  constructor(coord,cost,heur,parent,ID='N/A'){
    this.coord = coord;
    this.pNode = parent;    
    this.cost  = cost;
    this.heur  = heur;
    this.ID    = ID;     // e.g. insertion # for debug purposes
  }

  // More than enough info. If you want parent info -> simply query its toString (A/A)
  toString(){
    return "Coord: ["+this.coord[0]+","+this.coord[1]+"] Value: {cost:"+this.cost+", heur:"+this.heur+" Parent: "+ ((this.pNode) ? "yes" : "no");
  }
} // Ends Class SearchNode

/*======================================================================
|>>> Class Pathfinder
+-----------------------------------------------------------------------
| Overview: Computes (for ground units) cell-to-cell shortest paths upon
|           current the GameMap via utilizing one of three (maybe four)
|           pathfinding search algorithms, as follows:
|             > [BFS] Breadth-First Search: Uninformed algorithm which
|               simply 'contours out' from source cell until finding the
|               goal cell (A/A);
|             > [GBF] Greedy Best-First: Informed algorithm which, when
|               exploring the frontier, simply (keeps on) selecting the
|               neighbor/adjacent cell closest to the goal cell (A/A)
|             > [UCS] Uniform Cost Search: AKA 'Dijkstras Algorithm with
|               a goal', this uninformed search is basically a variant
|               of BFS in which cell traversal costs are summed and put
|               into consideration via placement into a Priority Queue.
|             > [A*] A-Star: Informed algorithm which is effectively if
|               not explicitly [UCS] plus [GBF], 'Nuff Said. (actually,
|               there's more to say WRT how I [re]figure out and ideally
|               fine-tune an optimal heuristic, but let's KISS for now).
|          Finally, note that [UCS] and [A*] will place map cell costs 
|          into consideration, [GBF] and [A*] will place heuristic costs
|          based on [relative] distances to goal into consideration, and
|          ALL algorithms will be hardcoded to consider [WATER] (water)
|          tiles [IMPASSIBLE] and thus never considered in any case.
+-----------------------------------------------------------------------
|> Data Structure Notes:
|   o The Open Set requires a Priority Queue (at least for UCS, A*, and
|     possibly GBF {it's been a long night}); as to enqueue SearchNode
|     objects WRT their cost and/xor heuristic values. Thankfully, via
|     Eyas Ranjous' code: I have one which is nicely reduced for this.
|   o The Closed Set requires lookup that's as speedy as possible; which
|     I'll implement via a native JavaScript Map object; as experiments
|     with them in BG-III 'Spatial Partition Demo' have more than proven
|     their efficiency and performance superior to naive/other methods.
+-----------------------------------------------------------------------
| [AS-YOU-BUILD] Implementation Notes:
|  > I'm still a bit concerned about clearing and reinitializing up to
|    cellsWide*cellsTall SearchNodes for every requested path; which is
|    why the A* P5JS version implemented via Shiffman's video thereof
|    works with the same collection of SearchNodes. I plan to do a few
|    simple stress tests to see how heavily pathfind requests hit WRT
|    alloc/dealloc alongside general computation given the use of two
|    new data structures for the open and closed sets; but if a problem
|    is nonetheless found, known solutions include:
|      (1) 'Only-Init-Once' SearchNodes, one for each map cell, as seen
|          via aforementioned A* version (which now only exists within
|          the BG/ZAC project 'GridWalker').
|      (2) Utilize Object Pooling for SearcNodes, which is effectively a
|          'lazier' version of the 'Only-Init-Once' version; in that I'm
|          not assigning one per cell, forever.
|  > If the alloc/dealloc of all necessary SearchNodes per path request
|    does NOT yield a noticeable FPS and/or memory hit during my initial
|    stress test experiments: then freaking KISS and don't worry about
|    implementing the above; as (1) permanently exists within Gridwalker
|    and (2) is described right above here for any future reference.   
+=====================================================================*/

var PathAlgo = {'BFS':1,'GBF':2,'UCS':3,'AST':4};
var PathHeur = {'EUC':1,'MAN':2}; // [EUC]=>[Euclidean] | [MAN]=>Manhattan

class PathFinder{
  constructor(refMap){
    this.refMap    = refMap;
    this.openSet   = new PriorityQueue((p,q)=>(SearchNode.compare(p,q)));
    this.closedSet = new Map();
    this.curCost   = 0; // total cost of most recent path created
    this.curHeur   = PathHeur.EUC;
    this.curAlgo   = PathAlgo.AST;

  } // Ends Constructor

  // Called before a new path is computed
  resetState(){
    this.openSet.clear();
    this.closedSet.clear();
    this.curCost = 0;
  }

  setAlgo(algo){if(Object.values(PathAlgo).includes(algo)){this.curAlgo = algo;}}



  // Returns coord of input adjacency WRT input coord via Direction 'enum' (and MUCH NICER than orig PathfindingProcessing version!)
  coordViaAdj(coord, adj){
    switch(adj){
      // Von Neuman Neighborhood
      case Direction.N  : return [coord[0]-1,coord[1]]; // [N]=>[8]
      case Direction.S  : return [coord[0]+1,coord[1]]; // [S]=>[4]
      case Direction.E  : return [coord[0],coord[1]+1]; // [E]=>[2]
      case Direction.W  : return [coord[0],coord[1]-1]; // [W]=>[6]
      // Additional Moore Neighborhood
      case Direction.NE : return [coord[0]-1,coord[1]+1]; // [N]=>[1]
      case Direction.SE : return [coord[0]+1,coord[1]+1]; // [S]=>[3]
      case Direction.SW : return [coord[0]+1,coord[1]-1]; // [N]=>[5]
      case Direction.NW : return [coord[0]-1,coord[1]-1]; // [S]=>[7]
      // Crappy Input Neighborhood :-)
      default: console.log("ERROR! Invalid Direction Input!"); return[-1,-1];
    } // Ends Switch
  } // Ends Function coordViaAdj


  // Annnd here's the Big Boy - AT LAST... Though I'll work on him (and the oddysey {or not} therein) tomorrow 1/8/22
  // TODO: Actually [still] looks ass-backwards WRT when shit is added to the closed set. Via BFS Wiki: https://en.wikipedia.org/wiki/Breadth-first_search
  findPath(start,goal){
    this.resetState();

    let curCoord; let adjCoord;
    let secCount = 0; let secLimit = 10000; // sentinel counter/limit to prevent infinite loop : keep for now

    let curSNode = new SearchNode(start, 0, this.refMap.distBetweenCoords(start,goal), null);

    this.openSet.enqueue(curSNode);

    //####################################################################
    //>>> Phase 1 : Find Path
    //####################################################################
    while(!this.openSet.isEmpty() && secCount<secLimit){  
      curSNode = this.openSet.dequeue();

      curCoord = curSNode.coord;
      
      // If [GOAL] dequeued: BREAK further exploration - we got it!
      if(arr2Equals(curSNode.coord,goal)){break;}  
      
      // Current node NOT on closed set (JS syntax note: MUST use '==' NEVER '===')
      if(this.closedSet.get(curCoord.toString()) == null){
        // Put current node into the closed set
        this.closedSet.set(curCoord.toString(), curSNode);
        
        // explore Moore Neighborhood of current cell coord
        for(let adj=1; adj<9; adj++){

          adjCoord = this.coordViaAdj(curCoord,adj);

          // disregards out-of-bound cells xor water tile cells
          if(!this.refMap.cellInBounds(adjCoord) || this.refMap.getValueAt(adjCoord)==TileType.watr){continue;}

          // create search node WRT current pathfinding algorithm
          switch(this.curAlgo){
            case PathAlgo.AST : this.openSet.enqueue(new SearchNode(adjCoord, (curSNode.cost+this.refMap.getCostAt(adjCoord)), this.refMap.distBetweenCoords(adjCoord, goal), curSNode)); break;
            case PathAlgo.UCS : this.openSet.enqueue(new SearchNode(adjCoord, (curSNode.cost+this.refMap.getCostAt(adjCoord)), 0, curSNode)); break;            
            case PathAlgo.GBF : this.openSet.enqueue(new SearchNode(adjCoord, 0, this.refMap.distBetweenCoords(adjCoord, goal), curSNode)); break;
            case PathAlgo.BFS : this.openSet.enqueue(new SearchNode(adjCoord, 0, 0, curSNode)); break;            
          } // Ends Switch
        } // Ends For Loop
      } // Ends Conditional
      secCount++;
    } // Ends While Loop    

    //####################################################################
    //>>> Phase 2 : Generate+Return Path
    //####################################################################
    let path = []; 
    this.curCost = 0;
    while(curSNode!=null){
      this.curCost += this.refMap.getCostAt(curSNode.coord);
      path.push([curSNode.coord[0],curSNode.coord[1]]);
      curSNode=curSNode.pNode;
    }
    path.pop();
    path.reverse();
    return path;
  } // Ends Function findPath

  // Array-ize Closed Set, iterate through its elements, append copy of their coords to a list, return said list
  getClosedSet(){
    let retList = [];
    Array.from(this.closedSet.values()).forEach((sNode)=>retList.push([sNode.coord[0],sNode.coord[1]]));
    return retList;
  } // Ends Function getClosedSet {lol,rhymes!}

  // Jeez, appears to be even easier as with the closed set --- this is why I like JavaScript!
  getOpenSet(){
    let retList = [];
    this.openSet.nodes.forEach((sNode)=>retList.push([sNode.coord[0],sNode.coord[1]]));
    return retList;
  } // Ends Function getOpenSet {lol,rhymes!}

} // Ends Class Pathfinder