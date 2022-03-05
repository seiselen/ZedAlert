class GWPathfinder{
  constructor(ref_T,ref_S){
    this.cellsTall = ref_T.cellsTall;
    this.cellsWide = ref_T.cellsWide;
    this.refTMap   = ref_T;
    this.refSMap   = ref_S;
    this.map       = [];
    this.openSet   = [];
    this.closedSet = [];
    this.lastPath  = [];
    this.heurTypes = ['E','M']; // E->Euclidean | M->Manhattan
    this.curHeur   = 'E';
    this.showOCSet = true;
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


  heuristic(a,b){switch(this.curHeur){case 'E': return dist(a.r, a.c, b.r, b.c); case 'M': return abs(a.i - b.i) + abs(a.j - b.j);} console.error("Error! Invalid Input ["+this.curHeur+"].");}
  removeFromArray(a,e){for (let i=a.length-1; i>=0; i--){if (a[i]==e){a.splice(i,1);}}}

  findPath(startCoord,goalCoord,greedFactor=1){
    // Update the search node values based on changes in map since last call
    this.initMap();

    var start = this.map[startCoord[0]][startCoord[1]];
    var goal  = this.map[goalCoord[0]][goalCoord[1]];

    // Init open/closed set and return path
    this.openSet   = [];
    this.closedSet = [];
    var path       = [];

    this.openSet.push(start);
    
    while(this.openSet.length > 0){
      
      // Get next on Implicit Pri-Q
      var getMin = 0;
      for(var i = 0; i < this.openSet.length; i++ ){
        if(this.openSet[i].f < this.openSet[getMin].f){getMin = i;}
      }
      var current = this.openSet[getMin];
      
      // Goal Found!
      if(current===goal){break;}
      
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
          this.refTMap.getValueAt(neighbor.r,neighbor.c) != TileType.WATER && 
          this.refSMap.isCellVacant(neighbor.r,neighbor.c)
        ){
          var tempG = current.g + this.heuristic(neighbor, current) + (this.refTMap.getValueAt(current.r,current.c)/greedFactor);

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
    
    // Generate Path.
    var temp = current;
    path.push( createVector( (temp.c*cellSize)+(cellSize/2), (temp.r*cellSize)+(cellSize/2) ));
    while (temp.parent) {
      path.push( createVector( (temp.parent.c*cellSize)+(cellSize/2), (temp.parent.r*cellSize)+(cellSize/2) ));
      temp = temp.parent;
    }

    path.pop();            // as it's the cell agent is [presumably] currently at
    path = path.reverse(); // s.t. it is [start]->[goal]
    
    //this.summaryToConsole(true); console.log("Path Length = "+path.length); // for DEBUG purposes only!
    
    this.lastPath = path;  
    return path;
  } // Ends Function findPath

  //> DEBUG AND/OR DISPLAY FUNCTIONS
  summaryToConsole(goalFound){console.log( (goalFound) ? "GOAL FOUND!" : "GOAL NOT FOUND!"); console.log( "Closed Set: [" + this.closedSet.length + "] | Open Set: [" + this.openSet.length + "]");}
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

function SearchNode(row,col){
  //> Location Info
  this.r=row; this.c=col;       
  //> For A*
  this.f=0; 
  this.g=0; 
  this.h=0;
  //> Used for path construction phase
  this.parent = null; 
  //> Temporary for now
  this.neighbors = []; 
  //> unused, but keeping as use thereof could be better than closed set?
  this.found = false;
  // Get neighbors. Use this version for now, can experiment with algos used in PRIZE later...
  this.addNeighbors = function(grid) {
    if (this.r<cellsTall-1){this.neighbors.push(grid[this.r+1][this.c]);} //<------------------------- BOTTOM 
    if (this.r>0){this.neighbors.push(grid[this.r-1][this.c]);} //<----------------------------------- TOP   
    if (this.c<cellsWide-1){this.neighbors.push(grid[this.r][this.c+1]);} //<------------------------- RIGHT 
    if (this.c>0){this.neighbors.push(grid[this.r][this.c-1]);} //<----------------------------------- LEFT
    if (this.c>0 && this.r>0){this.neighbors.push(grid[this.r-1][this.c-1]);} //<--------------------- TOP LEFT
    if (this.c<cellsWide-1 && this.r>0){this.neighbors.push(grid[this.r-1][this.c+1]);} //<----------- TOP RIGHT
    if (this.r<cellsTall-1 && this.c>0){this.neighbors.push(grid[this.r+1][this.c-1]);} //<----------- BOTTOM LEFT
    if (this.r<cellsTall-1 && this.c<cellsWide-1){this.neighbors.push(grid[this.r+1][this.c+1]);} //<- BOTTOM RIGHT
  }
  // Keep as debug if not in use
  this.render = function(color){ fill(color);noStroke();ellipse(this.c*cellSize+cellSize/2, this.r*cellSize+cellSize/2, cellSize/2, cellSize/2);}
} // Ends SearchNode Object Definition