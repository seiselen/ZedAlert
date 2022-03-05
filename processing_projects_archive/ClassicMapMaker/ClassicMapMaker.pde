import java.util.*;

int     screenWide   = 1200;
int     screenTall   = 800;
int     cellSize     = 20;
int     cellHalf     = cellSize/2;
int     cellsWide    = screenWide/cellSize;
int     cellsTall    = screenTall/cellSize;
boolean showGrid     = true;
GridMap  map         = null;
MapMaker mapMaker    = null;

void settings(){
  size(screenWide,screenTall);
}

void setup(){
  textSize(32);
  map = new GridMap();
  mapMaker = new MapMaker(map , 2 , 10 , 25 , 5, 5);   
}

void draw(){
  // UI CALLS
  if(mousePressed && mouseButton==LEFT){mapMaker.mousePaint();}
  // DRAW CALLS
  background(255);
  map.render();
  drawMapTileCursor();
  drawFPS();
}

void keyPressed(){
  if(key==' '){mapMaker.makeProceduralMap();}
  if(key=='g'){map.toggleGrid();}
  if(key=='d'){mapMaker.changeDrawMode();}  
}

PVector mousePtToVec(){return new PVector(mouseX,mouseY);}
void drawFPS(){noStroke(); fill(60,127); rect(0,screenTall-(cellSize*2),(cellSize*5),(cellSize*2)); fill(255); text(nf(frameRate,2,2),4,screenTall-8);}
void drawMapTileCursor(){PVector mousePos = map.posToTLPos(mousePtToVec()); fill(TileType.colors[mapMaker.drawOption]); stroke(0,255,0); strokeWeight(2); rect(mousePos.x,mousePos.y,cellSize,cellSize);}

//######################################################################
//>>> PROJECT-RELATED OBJECT DEFINITIONS FOLLOW...
//######################################################################

/*======================================================================
|>>> 'Enum-In-Lieu-Of-Processing-Lacking-Actual-Enums' TileType
+-----------------------------------------------------------------------
|> Implementation Notes:
|   o Tthese should fundamentally be consts (i.e. 'static final')
|     WRT Java syntax... but meh #yolo; as this is a small[er] one man
|     build and itself will be archived with its P5JS successor once I
|     get this 'interim/middleman' version working and the successor in
|     P5JS likewise ported/refactored and working therein.
+=====================================================================*/
interface TileType{
  int DIRT = 0; int WATER = 1; int SAND  = 2; int GRASS = 3; int ROAD = 4; int PAVE = 5;
  color[] colors = new color[] {(#6C3C00),(#0078B4),(#B4900C),(#009C00),(#525252),(#A2A2A2)};
} // Ends 'Enum-In-Lieu-Of-Processing-Lacking-Actual-Enums' TileType


/*======================================================================
|>>> Class GridMap
+-----------------------------------------------------------------------
|> Implementation Notes:
|   o Fully utilizes on global defs for {cellsTall, cellsWide, cellSize}
|     to KISS (via abusing Processing's heresy of Java's scope standards
|     via its unnaturally expressive 'Wild West' global environment)
|   o Consequently: the newer (2021-2022) util and other functions which
|     utilize these defs do not actually need to be within the GridMap
|     class (i.e. could exist as global functions); but I'm [purposely]
|     keeping them as-is to be cohesive with the new[er] architecture.
+=====================================================================*/
class GridMap{
  private int[][] cells;
  private boolean showGrid = true;
  public          GridMap(){cells = new int[cellsTall][cellsWide]; init();}
  private void    init(){for(int r=0;r<cellsTall;r++){for(int c=0;c<cellsWide;c++){cells[r][c]=TileType.DIRT;}}}
  public void     toggleGrid(){showGrid=!showGrid;}
  public void     setValueAt(int[] coord, int val){this.cells[coord[0]][coord[1]]=val;}  
  public void     setValueAt(int row, int col, int val){this.cells[row][col]=val;}
  public int      getValueAt(int[] coord){return this.cells[coord[0]][coord[1]];}  
  public int      getValueAt(int row, int col){return this.cells[row][col];}
  public boolean  checkInBounds(int[] coord){return (coord[0]>=0 && coord[0]<cellsTall && coord[1]>=0 && coord[1]<cellsWide);}  
  public boolean  checkInBounds(int r, int c){return (r>=0 && r<cellsTall && c>=0 && c<cellsWide);}
  public int[]    posToCoord(PVector pos){return new int[]{int(pos.y/cellSize),int(pos.x/cellSize)};}
  public PVector  coordToPos(int[] coord){return new PVector((coord[1]*cellSize), (coord[0]*cellSize));}
  public PVector  posToTLPos(PVector pos){return coordToPos(posToCoord(pos));}
  public void     render(){renderMap();if(showGrid){renderGrid();}}
  private void    renderMap(){noStroke();for(int r=0;r<cellsTall;r++){for(int c=0;c<cellsWide;c++){fill(TileType.colors[cells[r][c]]); rect(c*cellSize,r*cellSize,cellSize,cellSize);}}}
  private void    renderGrid(){strokeWeight(1); stroke(60,127); for(int i=0; i<=cellsTall; i++){line(0,cellSize*i,screenWide,cellSize*i);} for(int j=0; j<=cellsWide; j++){line(cellSize*j,0,cellSize*j,screenTall);}}
} // Ends Class GridMap



/*======================================================================
|>>> Class MapMaker
+=====================================================================*/
class MapMaker{
  int drawOption = TileType.DIRT;
  int numRivers;
  int pctWater;
  int pctGrass;
  int numBlocks;
  int numSeeds;
  int pctDoTile = 2; // Percent chance we assign a random tile to grass, sand, water, etc.
  int adjMinVal = 4; // Min number of adjacencies that must fit a rule (used for getAdjTotal)
  
  GridMap map;
  ArrayList<BlockDims> blocks = new ArrayList<BlockDims>();

  boolean debugPrint = false;
  
  /*======================================================================
  |>>> Class BlockDims
  +=====================================================================*/
  class BlockDims{int[] UL; int[] LR; int[] CC; public BlockDims(int[] ul, int[] lr, int[] cc){UL=ul; LR=lr; CC=cc;}}

  /*======================================================================
  |>>> Class SearchNode
  +=====================================================================*/
  class MMSearchNode{int row; int col; MMSearchNode parent; public MMSearchNode(int r, int c, MMSearchNode par){this.row=r; this.col=c; this.parent=par;}}

  public MapMaker(GridMap map, int r, int w, int g, int b, int s){
    this.map  = map;
    this.numRivers = r;
    this.pctWater  = w;
    this.pctGrass  = g;
    this.numBlocks = b;
    this.numSeeds  = s;
  } // Ends Constructor

  // Clears block definitions and resets all map tile types (to [DIRT])
  public void clearMap(){blocks.clear(); map.init();}  
  
  // Changes the TileType 'painted upon the map' via [OnMousePressed] event
  public void changeDrawMode(){drawOption = (drawOption+1)%6;}
  
  // Paints map tile at cell coord corresponding to mouse position
  public void mousePaint(){int[] mouseCoord = map.posToCoord(mousePtToVec()); if(map.checkInBounds(mouseCoord)){map.setValueAt(mouseCoord,mapMaker.drawOption);}}
  
  // Get random coodinate (s.t. not an edge cell i.e. first/last row/col)
  private int[] getRandCoord(){return new int[]{int(random(1,cellsTall)),int(random(1,cellsWide))};}

  /*----------------------------------------------------------------------
  |>>> Function makeProceduralMap 
  ----------------------------------------------------------------------*/    
  void makeProceduralMap(){
    clearMap();
    for(int i=0; i<numRivers; i++){makeRiver();}
    makePondsAndLakes();
    makeSimpleShore();
    makeGrass();
    makeBlockWithSurroundingRoads();
    connectBlocksViaBFS();
  }
  

  //> Note(2)/TODO: I know I had hand-solved an easier encoding \forall of these cases for a past BG or Z-5 project, either find it xor recompute!
  //> ^ Supplemental Note: It might have involved ternary ops? Could consider thereto in any case!
  void makeRiver(){
    int[] source = getRandCoord();
    int[] destin = getRandCoord();
    int[] buffer = source;
    
    map.setValueAt(buffer,TileType.WATER);
    
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
      map.setValueAt(buffer,TileType.WATER);
    } // Ends While Loop
  } // Ends Function makeRiver


  //> Note/TODO: as with 'makeRiver', could I [easily(!/?)] figure out a more succinct solution?
  void makeSimpleShore(){
    for(int r=0; r<cellsTall; r++){
      for(int c=0; c<cellsWide; c++){
        if(map.getValueAt(r,c) != TileType.WATER){
          if(
            (map.checkInBounds(r-1,c)   && map.getValueAt(r-1, c)   == TileType.WATER) ||
            (map.checkInBounds(r+1,c)   && map.getValueAt(r+1, c)   == TileType.WATER) ||
            (map.checkInBounds(r,c-1)   && map.getValueAt(  r, c-1) == TileType.WATER) ||
            (map.checkInBounds(r,c+1)   && map.getValueAt(  r, c+1) == TileType.WATER) ||            
            (map.checkInBounds(r-1,c-1) && map.getValueAt(r-1, c-1) == TileType.WATER) || 
            (map.checkInBounds(r+1,c-1) && map.getValueAt(r+1, c-1) == TileType.WATER) || 
            (map.checkInBounds(r-1,c+1) && map.getValueAt(r-1, c+1) == TileType.WATER) || 
            (map.checkInBounds(r+1,c+1) && map.getValueAt(r+1, c+1) == TileType.WATER) ){            
              map.setValueAt(r,c,TileType.SAND);                 
          }
        }
      }
    }
    // One last mode of generation: dirt tiles with adjMinVal+ sand neighbors become grass
    for(int r=0; r<cellsTall; r++){
      for(int c=0; c<cellsWide; c++){ 
        if(map.getValueAt(r,c)==TileType.DIRT && getAdjTotal(r,c,TileType.SAND)>adjMinVal){
          map.setValueAt(r,c,TileType.SAND);
        }
      }
    }         
  } // Ends Function makeSimpleShore
  

  //> [Old] Note: Difference between this one and grass - no random chance, spread via seeds only!
  //> [New] Note: Perhaps try another version utilizing Lague's 'Cave-Gen-With-CAs' algorithm and/or Perlin Noise
  void makePondsAndLakes(){
    int totalCells = cellsWide*cellsTall;   
    int numWaterTiles  = (totalCells*pctWater)/100;
    int waterTilesMade = 0;  
    int[] sample; 
    int failures = 0; 
    int maxFails = totalCells*10;
    int numAdded = 0;
    int numDeleted = 0;

    // Phase 1 Water Tile Generation: Set water tiles from dirt via either random chance (via pctDoTile) else adjacent [neighboring] water tiles
    // ^ Note: Check if latter (i.e. adjacency-based) method is consistent/correct WRT when I install Moore Neighborhood support
    while(failures<maxFails && waterTilesMade<numWaterTiles){   
      sample = getRandCoord();

      if(map.getValueAt(sample)==TileType.DIRT){
        if(int(random(100))<pctDoTile){map.setValueAt(sample,TileType.WATER); waterTilesMade++;}
        else if(getAdjTotal(sample[0],sample[1],TileType.WATER)>1){map.setValueAt(sample,TileType.WATER); waterTilesMade++;}
        else{failures++;}
      }
      else{failures++;}
    }
    if(debugPrint){println("makePondsAndLakes: water cell placement [failures/maxFails] = ["+failures+"/"+maxFails+"]");}
    
    // Phase 2 Water Tile Generation: Set all independent water tiles to dirt, then add as many back via resampling random cells with adjaceny rule increased
    for(int r=0;r<cellsTall;r++){
      for(int c=0;c<cellsWide;c++){ 
        if(map.getValueAt(r,c)==TileType.WATER && getAdjTotal(r,c,TileType.WATER)==0){map.setValueAt(r,c,TileType.DIRT); numDeleted++;}
      }
    }
    if(debugPrint){println("makePondsAndLakes: numDeleted = ["+numDeleted+"]");}
    failures = 0; // needed to reset from existing value
    while(failures<maxFails && numAdded<numDeleted){   
      sample = getRandCoord();   
      if(map.getValueAt(sample)==TileType.DIRT && getAdjTotal(sample[0],sample[1],TileType.WATER)>adjMinVal){map.setValueAt(sample,TileType.WATER); numAdded++;}
      else{failures++;}
    }
    if(debugPrint){println("makePondsAndLakes: numAdded = ["+numAdded+"]");}

    // One last mode of generation: dirt tiles with adjMinVal+ water neighbors become water
    for(int r=0; r<cellsTall; r++){
      for(int c=0; c<cellsWide; c++){ 
        if(map.getValueAt(r,c)==TileType.DIRT && getAdjTotal(r,c,TileType.WATER)>adjMinVal){map.setValueAt(r,c,TileType.WATER);}
      }
    }
  } // Ends Function makePondsAndLakes
  

  void makeGrass(){    
    int totalCells = cellsWide*cellsTall;   
    int numGrassTiles  = (totalCells*pctGrass)/100;
    int grassTilesMade = 0;  
    int[] sample; 
    int failures = 0; 
    int maxFails = totalCells*10;
    while(failures<maxFails && grassTilesMade<numGrassTiles){   
      sample = getRandCoord();

      if(map.getValueAt(sample)==TileType.DIRT){
        // could jam these first two into a single conditional, same with analog in 'makePondsAndLakes'
        if(int(random(100))<pctDoTile){map.setValueAt(sample,TileType.GRASS); grassTilesMade++;}
        else if(getAdjTotal(sample[0],sample[1],TileType.GRASS)>1){map.setValueAt(sample,TileType.GRASS); grassTilesMade++;}
        else{failures++;}
      }
      else{failures++;}
    }
    if(debugPrint){println("makeGrass: grass cell placement [failures/maxFails] = ["+failures+"/"+maxFails+"]");}

    for(int r=0;r<cellsTall;r++){
      for(int c=0;c<cellsWide;c++){ 
        if(map.getValueAt(r,c)==TileType.DIRT && getAdjTotal(r,c,TileType.GRASS)>adjMinVal){map.setValueAt(r,c,TileType.GRASS);}
      }
    } 
  } // Ends Function makeGrass


  /*----------------------------------------------------------------------
  |>>> Function makeBlockWithSurroundingRoads
  ----------------------------------------------------------------------*/  
  void makeBlockWithSurroundingRoads(){
    
    int failures = 0;
    int maxFails = 20;
    boolean validSite = false;
    int blocksMade = 0;

    int[] sample;
    int[] extent = new int[]{-1,-1};

    int tempVal; // Used for comparison with tile types    
    while(failures<maxFails && blocksMade<numBlocks){
      sample = getRandCoord();

      extent[0] = sample[0]+int(random(2,5))+2;
      extent[1] = sample[1]+int(random(2,5))+2;
            
      validSite=true;
      
      // Check #1 - are extents in bounds?
      if( !map.checkInBounds(sample) || !map.checkInBounds(extent)){validSite=false;}

      // Check #2 - are all prospective points sitting on either dirt, grass, or sand (i.e. NOT water or other blocks/roads!)
      else{
        for(int r=sample[0]; r<extent[0]; r++){
          for(int c=sample[1]; c<extent[1]; c++){
            tempVal = map.getValueAt(r,c);
            if(tempVal==TileType.WATER || tempVal==TileType.ROAD || tempVal==TileType.PAVE || tempVal==TileType.SAND){validSite=false;}
          }
        }
      }
      
      // Either out of bounds or overlaps on top of invalid tile type: report fail, reiterate
      if(validSite==false){failures++;}
      
      // Valid site to draw tiles on: assign the road and pavement tiles
      else{   
        for(int r=sample[0]; r<extent[0]; r++){
          for(int c=sample[1]; c<extent[1]; c++){
            if(r==sample[0] || r==extent[0]-1 || c==sample[1] || c==extent[1]-1){map.setValueAt(r,c,TileType.ROAD);}
            else{map.setValueAt(r,c,TileType.PAVE);}
          }
        }

        blocks.add(new BlockDims(sample, extent, new int[]{int(lerp(sample[0],extent[0],0.5)), int(lerp(sample[1],extent[1],0.5))}));
        blocksMade++;
      } // Ends Condition that the block can be drawn
    } // Ends While Loop
    if(debugPrint){println("makeBlockWithSurroundingRoads: block generation [failures/maxFails] = ["+failures+"/"+maxFails+"]");}
  } // Ends Function makeBlockWithSurroundingRoads
  

  void connectBlocksViaBFS(){
    int nBlocks = blocks.size();
    if(nBlocks<2){return;}  
        
    for(int i=0; i<nBlocks; i++){
      drawRoadAndReportNNViaBFS(blocks.get(i));  
    }
  } // Ends Function connectBlocksViaBFS
  

  void drawRoadAndReportNNViaBFS(BlockDims in){
    Queue<MMSearchNode> openSet = new LinkedList<MMSearchNode>();
    int[][] closedSet = new int[cellsTall][cellsWide];
    
    boolean goalFound=false;
    int cSetSize=0;   
  
    int startRow = int(in.CC[0]);
    int startCol = int(in.CC[1]);
      
    MMSearchNode curCoord = null;

    openSet.add(new MMSearchNode(startRow, startCol, null));
    closedSet[startRow][startCol] = 1;
  
    int sec=0; int maxSec=cellsWide*cellsTall;

    while(!goalFound && sec<maxSec && openSet.size()>0){
      curCoord = openSet.poll();
      
      for(BlockDims b : blocks){if(curCoord.row != startRow && curCoord.col != startCol && curCoord.row == b.CC[0] && curCoord.col == b.CC[1]){goalFound=true; break;}}
      if(goalFound){break;}
    
      for(int adjR = curCoord.row-1; adjR <= curCoord.row+1; adjR++){
        for(int adjC = curCoord.col-1; adjC <= curCoord.col+1; adjC++){
          if( !map.checkInBounds(adjR,adjC) || 
              (adjR==curCoord.row && adjC==curCoord.col)      || (adjR!=curCoord.row && adjC!=curCoord.col)      ||
              (map.getValueAt(adjR,adjC) == TileType.WATER) || (map.getValueAt(adjR,adjC) == TileType.SAND)  ||
              (closedSet[adjR][adjC] != 0) ){
            continue;
          }

          closedSet[adjR][adjC] = 1;
          openSet.add(new MMSearchNode(adjR, adjC, curCoord));
          cSetSize++;
        } // Ends Inner For Loop
      } // Ends Outer For Loop
      sec++;
    } // Ends Frontier Exploration While Loop
  
    int totPathSteps = 0;
    while(curCoord != null){
      totPathSteps++;
      if(map.getValueAt(curCoord.row,curCoord.col)!=TileType.PAVE){map.setValueAt(curCoord.row,curCoord.col,TileType.ROAD);}
      curCoord=curCoord.parent;
    }
   
    if(debugPrint){
      println("BFS Run Completed. Stats:");
      println("Total Map cells     = "+maxSec);
      println("Total In Closed Set = "+cSetSize);
      println("Frontier Loop Iters = "+sec);
      println("Total Path Hops     = "+totPathSteps);
      println("Goal was found      = "+goalFound);
    }
  }

  private int getAdjTotal(int cRow, int cCol, int tileID){
    int tot = 0;
    for(int adjR = cRow-1; adjR <= cRow+1; adjR++){
      for(int adjC = cCol-1; adjC <= cCol+1; adjC++){
        if(map.checkInBounds(adjR,adjC) && !(adjC==cCol && adjR==cRow)){
          if(map.getValueAt(adjR,adjC) == tileID){tot++;}
        }
      }
    }
    return tot;
  } // Ends Function getAdjTotal

} // Ends Class MapMaker
