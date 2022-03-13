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
    this.initMap();
  } // Ends Constructor

  // Inits Search Node Graph, then neighbor refs \foreach Search Node
  initMap(){
    for(let r=0; r<this.cellsTall; r++){this.map[r]=[]; for(let c=0; c<this.cellsWide; c++){this.map[r].push(new GWSearchNode(r,c));}}
    for(let r=0; r<this.cellsTall; r++){for(let c=0; c<this.cellsWide; c++){this.map[r][c].addNeighbors(this.map);}}  
  } // Ends Function initMap


  heuristic(a,b){switch(this.curHeur){case 'E': return dist(a.r, a.c, b.r, b.c); case 'M': return abs(a.i - b.i) + abs(a.j - b.j);} console.error("Error! Invalid Input ["+this.curHeur+"].");}
  removeFromArray(a,e){for (let i=a.length-1; i>=0; i--){if (a[i]==e){a.splice(i,1);}}}
  getMinFromArray(a){let minIdx = 0; for(var i=0; i<a.length; i++){if(a[i].f<a[minIdx].f){minIdx=i;}} return a[minIdx];}


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

      var current = this.getMinFromArray(this.openSet);
      
      if(current===goal){break;}
      
      this.removeFromArray(this.openSet, current);
      this.closedSet.push(current);
      

      for (var i = 0; i < current.neighbors.length; i++) {
        var adj = current.neighbors[i];        

        if(
          !this.closedSet.includes(adj) && 
          this.refTMap.getValueAt(adj.r,adj.c) != TileType.WATER && 
          this.refSMap.isCellVacant(adj.r,adj.c)
        ){
          var tempG = current.g + this.heuristic(adj, current) + (this.refTMap.getValueAt(current.r,current.c)/greedFactor);

          // Is this a better path than before?
          var newPath = false;
          if (this.openSet.includes(adj)) {
            if (tempG < adj.g) {
              adj.g = tempG;
              newPath = true;
            }
          } else {
            adj.g = tempG;
            newPath = true;
            this.openSet.push(adj);
          }

          // Yes, it's a better path
          if (newPath) {
            adj.h = this.heuristic(adj, goal);
            adj.f = adj.g + adj.h;
            adj.parent = current;
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

    path.pop(); path=path.reverse();  
    this.lastPath = path;  
    return path;
  } // Ends Function findPath

} // Ends Class Pathfinder

function GWSearchNode(row,col){
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
} // Ends GWSearchNode Object Definition