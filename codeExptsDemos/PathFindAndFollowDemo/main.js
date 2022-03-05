/*######################################################################
|>>> [PathFindAndFollowDemo] (P5JS Demo Project)
+-----------------------------------------------------------------------
| Overview: AKA 'Tank RTS Steering Agent', this was the first successful
|           implementation of the Pathfinder utility with a 'Gridwalker'
|           Quasi-SA which traversed paths given to it. This project is
|           being preserved until its ZAC counterpart is both completed
|           and well-tested. Especially as there is some stuff here that
|           I want to implement within ZAC (see 'Implementation Notes').
+-----------------------------------------------------------------------
| Implementation Notes:
|  > The DOM GUI interface for this is one of the nicer, 'crisper' ones
|    I've developed! Thus this project will most likely be permanently 
|    archived within the BROADGATE repo as a standalone project, despite
|    its ZAC counterpart becoming the 'standard' version once completed.
+#####################################################################*/
var worldWide = 1200;
var worldTall = 800;
var cellSize  = 20;
var cellsTall = worldTall/cellSize;
var cellsWide = worldWide/cellSize;

var gridMap;
var agent;
var pathFind;

var showMouseCoords = false;
var curMouseOption  = "TILE";
var curPaintOption  = "DIRT";
var paintOptionSel  = null;

function setup(){
  createCanvas(worldWide,worldTall).parent("viz");
  gridMap   = new TileMap(cellsTall,cellsWide,cellSize);
  pathFind  = new Pathfinder(cellsTall,cellsWide,gridMap);
  agent     = new GridWalker(11,11,cellSize,gridMap);
  initUI(); 
} // Ends Function setup

function draw(){
  //>>> UI CALLS
  mousePaint();
  //>>> UPDATE CALLS
  updateUI();
  agent.update();
  //>>> RENDER CALLS
  background(0,60,255);
  gridMap.render();
  pathFind.render();
  agent.render();
  drawCanvasBorder();
} // Ends Function draw

function keyPressed(){if(key=='R'){gridMap.setAllCellsToTile(TileType.DIRT);}}

function mousePressed(){
  if(mouseIsPressed&&mouseButton==LEFT&&mouseInCanvas()){
    var mouseCoord = gridMap.posToCoord(mousePtToVec());
    if(!gridMap.cellInBounds(mouseCoord[0],mouseCoord[1]) || curMouseOption!="AGENT"){return;}
    agent.givePath(pathFind.findPath(createVector(int(agent.pos.y/cellSize),int(agent.pos.x/cellSize)), createVector(mouseCoord[0],mouseCoord[1])));  
  }
}

function mousePaint(){
  if (mouseIsPressed && mouseButton==LEFT && mouseInCanvas() && curMouseOption=='TILE'){
    let mouseCoord = gridMap.posToCoord(mousePtToVec());
    if(!gridMap.cellInBounds(mouseCoord[0],mouseCoord[1])){return;}
    gridMap.setValueAt(mouseCoord[0],mouseCoord[1],TileType[curPaintOption]);
  }
}

function onTilePaintOptionChanged(val){curMouseOption=val.value;}
function onDisplayOptionChanged(input){let val=input.checked; switch(input.id){case "DISP_GRID" : gridMap.showGrid=val; return; case "DISP_PATH" : pathFind.showCurPath=val; return; case "DISP_OSET" : pathFind.showCurOset=val; return; case "DISP_CSET" : pathFind.showCurCset=val; return;}}
function initUI(){
  document.getElementsByName('pntOpt').forEach(o=>{if (o.value==curMouseOption){o.checked=true;}});

  paintOptionSel = createSelect().parent("cbox_tile");
  paintOptionSel.option('DIRT');
  paintOptionSel.option('WATER');
  paintOptionSel.selected('DIRT');
  paintOptionSel.changed(()=>{curPaintOption=paintOptionSel.value()});

  select("#DISP_GRID").checked(gridMap.showGrid); 
  select("#DISP_PATH").checked(pathFind.showCurPath); 
  select("#DISP_OSET").checked(pathFind.showCurOset); 
  select("#DISP_CSET").checked(pathFind.showCurCset);}
function updateUI(){select("#TBOX_POS").html((mouseInCanvas()) ? "("+round(mouseX)+","+round(mouseY)+")" : "N/A"); select("#TBOX_COORD").html((mouseInCanvas()) ? "["+gridMap.posToCoord(mousePtToVec())+"]" : "N/A");}


//######################################################################
//>>> PRIMARY (PROJECT-ORIENTED) CLASS DEFINITIONS PROCEED HEREAFTER >>>
//######################################################################


/*======================================================================
|>>> Class Pathfinder
+-----------------------------------------------------------------------
| Description: 2022 QAD clean-up to the original version, this will be
|              DELETED and replaced with analog from 'Pathfinding P5JS'
|              once it's fully and successfully tested.
+-----------------------------------------------------------------------
|> Special [Pre-]Archival Note: If/when merging this project's code into
|  either a [larger] side project else the 'TRUE universal' definition 
|  of the [PathFinder] class; do refer to and give PRIORITY towards the
|  following methods per their features/qualities; as to integrate them
|  within the larger domain (unless they're already added, of course)...
|  (1) <heuristic> : As I seem to have not installed this function into 
|                    the 'Gridwalker P5JS' PathFinder analog, ergo it's
|                    likely also not within the 'Pathfinding P5JS' one!
+-----------------------------------------------------------------------
|>>> NAT TODOs (A/O 1/14/22 FOR 1/15/22)
|     o Utilize PriorityQueue object and swap code where and A/A
|     o For Path Creation: simply append the coords to the array, then
|       use <arr>.map(...) with a lambda which applies the coord-to-pos
|       transformation foreach element. ON THAT NOTE: just freaking use
|       the current version of 'coordToMidPt' from 'Pathfind P5JS' / ZAC
|       MVP; as both are WRT cell midpoints <vs> top-left corner points. 
|     o Replace pre-caching of neighbor refs (in SearchNodes) with naive
|       on-line computation for direct indexing where needed. I'm fully
|       resolved (i.e. no doubts) that there is no considerable savings
|       in a one-time 'compute-and-cache-ref' as to iterate therethrough
|       thereafter <VS> computing them on-the-go via [row+=1][col+-1].
|       Alon always said: use arrays and indexing therein <vs> grabbing
|       refs via adjacency list; and even though JS is almost exlusively
|       objs which use obj refs to other objs --- it's the thought that
|       counts; and maybe Coder Jesus will bless me for such virtuosity!
|
+=====================================================================*/
class Pathfinder{
  constructor(cellsTall,cellsWide,refMap){
    this.cellsTall = cellsTall;
    this.cellsWide = cellsWide;
    this.refMap    = refMap;
    this.map       = [];
    this.oSet   = [];
    this.cSet = [];
    this.prevPath  = []; // most recently computed path, used by <renderPath>
    this.heurTypes = ['E','M']; // E->Euclidean | M->Manhattan
    this.curHeur   = 'E';

    this.showCurPath = true;
    this.showCurOset = false;
    this.showCurCset = false;    

    this.initMap();
  } // Ends Constructor


  // Inits Search Nodes followed by referencing Moore Neighborhood cells \foreach Search Node
  initMap(){
    for(let r=0; r<this.cellsTall; r++){this.map[r]=[]; for(let c=0; c<this.cellsWide; c++){this.map[r].push(new SearchNode(r,c));}}
    for(let r=0; r<this.cellsTall; r++){for(let c=0; c<this.cellsWide; c++){this.map[r][c].addNeighbors(this.map);}}  
  } // Ends Function initMap

  removeFromArray(arr, elt){for(let i=arr.length-1; i>= 0; i--){if(arr[i] == elt){arr.splice(i, 1);}}}

  //> TODO: PRESERVE THIS for installation within the 'Pathfinding P5JS' PathFinder analog
  heuristic(a,b){return (this.curHeur=='E') ? dist(a.r,a.c,b.r,b.c) : (this.curHeur=='M') ? (abs(a.i-b.i)+abs(a.j-b.j)) : -9999;}

  findPath(startCoord,goalCoord){
    let source = this.map[startCoord.x][startCoord.y];
    let destin = this.map[goalCoord.x][goalCoord.y];
    this.oSet  = [];
    this.cSet  = [];

    // Update search node values based on changes in map since last call
    this.initMap();

    // Prime Pathfinding State
    let current = source;
    this.oSet.push(current);
    
    while(this.oSet.length>0){
      
      // Get next on Implicit Pri-Q (1/14/22 Note: So THIS was the forgotten project where I did an O(shit) Pri-Q!)
      let getMin = 0;
      for(let i=0; i<this.oSet.length; i++){if(this.oSet[i].f < this.oSet[getMin].f){getMin = i;}}
      current = this.oSet[getMin];
      
      // Goal Found!
      if(current === destin){console.log("GOAL FOUND"); break;}
      
      // Remove current from frontier, add to closed set
      this.removeFromArray(this.oSet, current);
      this.cSet.push(current);
      
      // Explore adjacencies
      let neighbors = current.neighbors;
      for (let i = 0; i < neighbors.length; i++) {
        let neighbor = neighbors[i];
        
        if (!this.cSet.includes(neighbor) && this.refMap.getValueAt(neighbor.r, neighbor.c) != TileType.WATER) {
          let tempG = current.g + this.heuristic(neighbor, current);

          // Is this a better path than before?
          let newPath = false;

          if (this.oSet.includes(neighbor)) {if (tempG < neighbor.g) {neighbor.g = tempG; newPath = true;}} 
          else {neighbor.g = tempG; newPath = true; this.oSet.push(neighbor);}

          // Yes, it's a better path
          if (newPath) {
            neighbor.h = this.heuristic(neighbor, destin);
            neighbor.f = neighbor.g + neighbor.h;
            neighbor.parent = current;
          } 
        } // Ends Consideration of a Neighbor
      } // Ends Exploration of Neighbors   
    } // Ends Path Calculation While Loop
  
    // Fail Condition => Return/Cache empty path
    if(current!=destin){console.log("GOAL NOT FOUND"); path=[]; this.prevPath=path; return path;}
    
    // make path via parent backtracking / pop [source] and reverse s.t. {[source]+1,-->,[destin]} / cache for viz purposes and return to caller
    let path = [];
    path.push(this.refMap.coordToMidPt(current.r,current.c));
    while(current.parent){path.push(this.refMap.coordToMidPt(current.parent.r,current.parent.c)); current=current.parent;}
    path.pop(); path.reverse(); 
    this.prevPath=path; return path;
  } // Ends Function findPath

  render(){ellipseMode(CENTER); if(this.showCurCset){this.rendercSet();} if(this.showCurOset){this.renderoSet();} if(this.showCurPath){this.renderPath();}}
  renderPath(){if(this.prevPath.length<=0){return;} noFill();stroke(0,216,216,64);strokeWeight(cellSize/2); beginShape();for(let i=0; i<this.prevPath.length; i++){vertex(this.prevPath[i].x,this.prevPath[i].y);}endShape(); fill(0,255,0); stroke(0,255,0); strokeWeight(0.5); textSize(12); for(let i=0; i<this.prevPath.length; i++){text(i,this.prevPath[i].x,this.prevPath[i].y);}}
  rendercSet(){for(let i=0; i<this.cSet.length; i++){this.cSet[i].render(color(255,120,0));}}
  renderoSet(){for(let i=0; i<this.oSet.length; i++){this.oSet[i].render(color(0,255,0));}}
} // Ends Class Pathfinder


/*======================================================================
|>>> Class SearchNode
+=====================================================================*/
function SearchNode(row,col){
  // Location Info
  this.r = row;
  this.c = col;
  // For A*
  this.f = 0;
  this.g = 0;
  this.h = 0;  
  this.parent = null;
  
  this.neighbors = [];
  this.found = false; // Keep this? Better than closed set?
  
  // Keep as debug if not in use
  this.render = function(color){ fill(color);noStroke();ellipse(this.c*cellSize+cellSize/2, this.r*cellSize+cellSize/2, cellSize/2, cellSize/2);}
  
  // Get neighbors. Use this version for now, can experiment with algos used in PRIZE later...
  this.addNeighbors = function(grid) {
    let r=this.r; let c=this.c;  
    if (r<cellsTall-1){this.neighbors.push(grid[r+1][c]);} // BOTTOM 
    if (r>0){this.neighbors.push(grid[r-1][c]);}           // TOP   
    if (c<cellsWide-1){this.neighbors.push(grid[r][c+1]);} // RIGHT 
    if (c>0){this.neighbors.push(grid[r][c-1]);}           // LEFT
    if (c>0 && r>0){this.neighbors.push(grid[r-1][c-1]);} // TOP LEFT
    if (c<cellsWide-1 && r>0){this.neighbors.push(grid[r-1][c+1]);} // TOP RIGHT
    if (r<cellsTall-1 && c>0){this.neighbors.push(grid[r+1][c-1]);} // BOTTOM LEFT
    if (r<cellsTall-1 && c<cellsWide-1){this.neighbors.push(grid[r+1][c+1]);} // BOTTOM RIGHT
  }
} // Ends Class SearchNode