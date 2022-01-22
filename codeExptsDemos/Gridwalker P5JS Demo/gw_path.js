/*----------------------------------------
>>> Pathfinder Object
------------------------------------------
Purpose: Implements simple pathfinding via
         A* informed search algorithm.
----------------------------------------*/
class GWPathfinder{
  constructor(refMap){
    this.cellsTall = refMap.cellsTall;
    this.cellsWide = refMap.cellsWide;
    this.refMap    = refMap.tileMap;
    this.refSPMap  = refMap.sparMap;
    this.map       = [];
    this.openSet   = [];
    this.closedSet = [];
    this.lastPath  = [];
    this.heurTypes = ['E','M']; // E->Euclidean | M->Manhattan
    this.curHeur   = 'E';
    this.initMap();
  } // Ends Constructor

  initMap(){
    // Init rows first
    for (var r = 0; r < this.cellsTall; r++) {this.map[r]=[];}

    // Init Search Nodes
    for (var r = 0; r < this.cellsTall; r++){
      for(var c = 0; c < this.cellsWide; c++){
        this.map[r][c] = new SearchNode(r,c);
      }
    }

    // Init the Neighbor Graph
    for (var r = 0; r < this.cellsTall; r++){
      for(var c = 0; c < this.cellsWide; c++){
        this.map[r][c].addNeighbors(this.map);
      }
    }  
  } // Ends Function initMap


  heuristic(a, b) { 
    if(this.curHeur=='E'){return dist(a.r, a.c, b.r, b.c);}
    if(this.curHeur=='M'){return abs(a.i - b.i) + abs(a.j - b.j);}
    console.log(">>> Error: Heuristic Type *"+this.curHeur+"* invalid!");
  } // Ends Function heuristic

  /*----------------------------------------------------------------------
  |>>> Function removeFromArray
  |-----------------------------------------------------------------------
  | Purpose: Used by A* to pop min element from open set. A Priority Queue
  |          should be used for this, but keeping things simple for now
  | Source:  Code derived from Dan Shiffman 'The Coding Train'
  |-----------------------------------------------------------------------
  | Implementation Notes: Suggestion made by Shiffman viewer that indexOf 
  | function could be used instead - but again: keeping things simple.
  +---------------------------------------------------------------------*/
  removeFromArray(arr, elt) {
    for (var i = arr.length - 1; i >= 0; i--) {
      if (arr[i] == elt) {
        arr.splice(i, 1);
      }
    }
  } // Ends Function removeFromArray

  findPath(startCoord,goalCoord,greedFactor=1){
    
    var start = this.map[startCoord[0]][startCoord[1]];
    var goal  = this.map[goalCoord[0]][goalCoord[1]];

    // Update the search node values based on changes in map since last call
    this.initMap();

    // Init open/closed set and return path
    this.openSet   = [];
    this.closedSet = [];
    var path       = [];

    this.openSet.push(start);
    
    while(this.openSet.length > 0){
      
      // Get next on Implicit Pri-Q
      var getMin = 0;
      for(var i = 0; i < this.openSet.length; i++ ){
        if(this.openSet[i].f < this.openSet[getMin].f){
          getMin = i;
        }
      }
      var current = this.openSet[getMin];
      
      // Goal Found!
      if(current === goal){
        break;
      }
      
      // Remove current from frontier, add to closed set
      this.removeFromArray(this.openSet, current);
      this.closedSet.push(current);
      
      // Explore adjacencies
      var neighbors = current.neighbors;
      for (var i = 0; i < neighbors.length; i++) {
        var neighbor = neighbors[i];
        
        // Qualifying Conditions for admission into open set (i.e. if ANY fail: it will NOT be considered for a path)
        if(
          !this.closedSet.includes(neighbor) && 
          this.refMap[neighbor.r][neighbor.c]   != CellType.watr && /* asserts water tiles are REJECTED */
          this.refSPMap[neighbor.r][neighbor.c] == null /* asserts occupied cells are REJECTED i.e. 'Phase 0 Obstacle Handle' */
        ){
          var tempG = current.g + this.heuristic(neighbor, current) + (this.refMap[current.r][current.c]/greedFactor);

          // Is this a better path than before?
          var newPath = false;
          if (this.openSet.includes(neighbor)) {
            if (tempG < neighbor.g) {
              neighbor.g = tempG;
              newPath = true;
            }
          } else {
            neighbor.g = tempG;
            newPath = true;
            this.openSet.push(neighbor);
          }

          // Yes, it's a better path
          if (newPath) {
            neighbor.h = this.heuristic(neighbor, goal);
            neighbor.f = neighbor.g + neighbor.h;
            neighbor.parent = current;
          } 
        } // Ends Consideration of a Neighbor
      } // Ends Exploration of Neighbors   
    } // Ends Path Calculation While Loop
  
    // Print That Goal was not found (Maybe return empty path?)
    if(current!=goal){this.summaryToConsole(false); path=[]; this.lastPath=path; return path;}
    
    // Generate the Path.
    var temp = current;
    path.push( createVector( (temp.c*cellSize)+(cellSize/2), (temp.r*cellSize)+(cellSize/2) ));
    while (temp.parent) {
      path.push( createVector( (temp.parent.c*cellSize)+(cellSize/2), (temp.parent.r*cellSize)+(cellSize/2) ));
      temp = temp.parent;
    }

    // pop the last element (starting cell position) since agent ordered path from this cell already.
    path.pop();

    // Reverse the path so it's start->goal
    path = path.reverse();
    
    //this.summaryToConsole(true); console.log("Path Length = "+path.length); // for DEBUG purposes only!
    
    this.lastPath = path;  
    return path;
  } // Ends Function findPath


  summaryToConsole(goalFound){
    console.log( (goalFound) ? "GOAL FOUND!" : "GOAL NOT FOUND!");
    console.log( "Closed Set: [" + this.closedSet.length + "] | Open Set: [" + this.openSet.length + "]");  
  }


  // DEBUG DISPLAY FUNCTIONS
  displayBothSets(){ellipseMode(CENTER);this.showOpenSet();this.showClosedSet(); this.drawPath();}
  showClosedSet(){for(var i=0; i<this.closedSet.length; i++){this.closedSet[i].render(color(255,120,0));}}
  showOpenSet(){for(var i=0; i<this.openSet.length; i++){this.openSet[i].render(color(0,255,0));}}
  drawPath(){
    if(this.lastPath.length>0){
      noFill();stroke(0,180,255,96);strokeWeight(cellSize/2);
      beginShape();for(var i=0; i<this.lastPath.length; i++){vertex(this.lastPath[i].x,this.lastPath[i].y);}endShape();
      stroke(255);strokeWeight(1);textSize(12);
      for(var i=0; i<this.lastPath.length; i++){text(i,this.lastPath[i].x,this.lastPath[i].y);}
    }
  }
} // Ends Class Pathfinder


/*----------------------------------------
>>> SearchNode Object
------------------------------------------
Purpose: Represents a cell on the map for 
         pathfinding purposes. SearchNode
         is utilized solely by Pathfinder
         and should be considered a util
         subclass of it.
----------------------------------------*/
function SearchNode(row,col,tileVal){
  // Location Info
  this.r = row;
  this.c = col;
  
  // For A*
  this.f = 0;
  this.g = 0;
  this.h = 0;  
  this.parent = null;
  
  // Neighbors - temporary for now
  this.neighbors = [];
  
  // Keep this? Better than closed set?
  this.found = false;
  
  // Render. Keep as debug if not in use
  this.render = function(color){ fill(color);noStroke();ellipse(this.c*cellSize+cellSize/2, this.r*cellSize+cellSize/2, cellSize/2, cellSize/2);}
  
  // Get neighbors. Use this version for now, can experiment with algos used in PRIZE later...
  this.addNeighbors = function(grid) {
    var r = this.r;
    var c = this.c;  
    if (r<cellsTall-1){this.neighbors.push(grid[r+1][c]);} // BOTTOM 
    if (r>0){this.neighbors.push(grid[r-1][c]);}           // TOP   
    if (c<cellsWide-1){this.neighbors.push(grid[r][c+1]);} // RIGHT 
    if (c>0){this.neighbors.push(grid[r][c-1]);}           // LEFT
    if (c>0 && r>0){this.neighbors.push(grid[r-1][c-1]);} // TOP LEFT
    if (c<cellsWide-1 && r>0){this.neighbors.push(grid[r-1][c+1]);} // TOP RIGHT
    if (r<cellsTall-1 && c>0){this.neighbors.push(grid[r+1][c-1]);} // BOTTOM LEFT
    if (r<cellsTall-1 && c<cellsWide-1){this.neighbors.push(grid[r+1][c+1]);} // BOTTOM RIGHT
  }
} // Ends SearchNode Object Definition