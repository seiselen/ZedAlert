/*======================================================================
|>>> Class SearchNode
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
+=====================================================================*/

var PathAlgo = {'BFS':1,'GBF':2,'UCS':3,'AST':4, keyViaVal(val){return Object.keys(PathAlgo).find(k=>{return PathAlgo[k]==val;})}}
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


  setAlgo(algo){
    this.curAlgo = PathAlgo[algo];
  }


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