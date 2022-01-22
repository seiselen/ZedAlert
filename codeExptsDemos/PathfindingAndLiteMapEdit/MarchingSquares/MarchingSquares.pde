/*======================================================================
| Project: Marching Squares for map editing / Minimaps 
| Author:  Steven Eiselen, University of Arizona Computer Science
+-----------------------------------------------------------------------
| Overview: Implements and Demonstrates 'GridMap' featuring a 'Marching
|           Squares [Algorithm]' visualization mode, as to display more
|           realistic looking worlds vis-a-vis Marching Squares' ability
|           to better (i.e. more naturally/procedurally) represent the 
|           transition from one tile type to another.
+-----------------------------------------------------------------------
|> Impementation Remarks vis-a-vis Alternate/Future Ideas:
|  > I think that the 'mSqCells' array and @init/per-edit [re]computing 
|    thereof is unecessary: as I should be able to implement an O(4*c)
|    function that can do per-frame evaluation during each render call;
|    which would increase work from O(c+|cells|) to O(c+(4*c*|cells|))
|    i.e. ~O(|cells|) to ~O(4*|cells|). However maybe things ARE okay as
|    is: since the O(|cells|) work of updating 'mSqCells' is asynch WRT
|    UI/UX via map painting <vs> added per-frame expense of 'on-the-fly'
|    marching square map computation.
|  > The other idea involved ONLY recomputing 'mSqCells' WRT the region
|    affected by a 'paintAtMouseCursor' call; which is a hell of a lot
|    easier to do. Then again: there are zero noticeable FPS drops with
|    the current version; so this could be an 'if/as-needed' suggestion. 
*=====================================================================*/
int cellSize   = 16;
int cellsWide  = 72;
int cellsTall  = 48;

MSQGridMap myMap;

void settings(){size(cellsWide*cellSize,cellsTall*cellSize,P2D);}
void setup(){myMap = new MSQGridMap(cellsTall, cellsWide, cellSize, createTileset(loadImage("MSQ_Tileset.png"),4,4,60,60,10));}

void draw(){ 
  // UI CALLS
  if(mousePressed && mouseButton == LEFT){myMap.paintAtMouseCursor();}
  // RENDER CALLS
  background(255); 
  myMap.render();
  drawMouseCursor();
  drawFPS();
} // Ends Function draw

void keyPressed(){
  if(key == 'g'){myMap.toggleShowGrid();}
  if(key == 'd'){myMap.changeTilePaintType();}
  if(key == 'm'){myMap.changeMapRenderMode();}
} // Ends keyPressed

void drawMouseCursor(){
  stroke(256,180,0);strokeWeight(2);noFill();
  int xCell = int(mouseX/cellSize);int yCell = int(mouseY/cellSize);
  if(myMap.cellInBounds(yCell,xCell)){rect(xCell*cellSize, yCell*cellSize, cellSize, cellSize);}
} // Ends Function drawMouseCursor


PVector mousePtToVec(){return new PVector(mouseX,mouseY);}
boolean mouseInCanvas(){return (mouseX>0)&&(mouseY>0)&&(mouseX<width)&&(mouseY<height);}
void drawFPS(){noStroke(); fill(0,127); rect(width-64,0,64,32); stroke(255); fill(255); textSize(16); textAlign(CENTER,CENTER); text(nf(frameRate,2,2),width-32,14);}


/*======================================================================
|>>> 'Enums' {TileType, MapMode}
+-----------------------------------------------------------------------
|> Implementation Notes:
|   o Realized as Interfaces in lieu of Processing lacking enum support.
|     The values therein should, WRT OOP, be consts (realized in Java 
|     via the <final static> modifier prefixes); then again: Processing
|     should have upgraded its under-the-hood Java version to J2SE 5.0.
+=====================================================================*/
interface TileType{int DIRT = 0; int WATER = 1;}
interface MapMode{int MAP = 0; int MSQ = 1;}

/*======================================================================
|>>> Class MSQGridMap (Marching Squares Renderable Grid Map)
+-----------------------------------------------------------------------
| Overview: Realization of 'GridMap' featuring two visualization modes:
|           (1) basic 'Render-Each-Cell' and (2) 'Marching Squares'. The
|           latter encompasses the primary focus of this implementation;
|           as using Marching Squares can effect a more visually natural
|           and realistic-looking terrain for 2D 'Tile Worlds' via how
|           it realizes transitions between tile types through use of a
|           dual map oriented on the intersecting corners of map cells.
+=====================================================================*/
class MSQGridMap{
  private int[][]  mapCells;
  private int[][]  mSqCells;
  private int      mapCellsWide;
  private int      mapCellsTall;
  private int      msqCellsWide;
  private int      msqCellsTall;
  private int      cellSize;
  private int      cellHalf;
  private boolean  showGrid = true;

  private int      curPaintTile  = TileType.DIRT;
  private int      mapRenderMode = MapMode.MSQ;

  private PImage[] tileSprites;

  
  public MSQGridMap(int cTall, int cWide, int cSize, PImage[] imgs){
    mapCellsWide = cWide;
    mapCellsTall = cTall;
    msqCellsWide = cWide+1;
    msqCellsTall = cTall+1;
    cellSize     = cSize;
    cellHalf     = cSize/2;
    mapCells     = new int[mapCellsTall][mapCellsWide];
    mSqCells     = new int[msqCellsTall][msqCellsWide];
    tileSprites  = imgs;

    assignMsqCells();
  } // Ends Constructor


  public void changeTilePaintType(){
    curPaintTile = (curPaintTile==TileType.DIRT) ? TileType.WATER : TileType.DIRT;
  } // Ends Function changeTilePaintType


  public void changeMapRenderMode(){
    mapRenderMode = (mapRenderMode==MapMode.MAP) ? MapMode.MSQ : MapMode.MAP;
  } // Ends Function changeMapRenderMode


  public void toggleShowGrid(){
    showGrid = !showGrid;
  } // Ends Function toggleShowGrid

  private void assignMsqCells(){
    int adjVal = 0;
    for(int r=0; r<msqCellsTall; r++){
      for(int c=0; c<msqCellsWide; c++){
        adjVal=0;   
        adjVal += (cellInBounds(r, c-1)   && mapCells[r][c-1]   == TileType.WATER) ? 1 : 0; // Southwest
        adjVal += (cellInBounds(r, c)     && mapCells[r][c]     == TileType.WATER) ? 2 : 0; // Southeast             
        adjVal += (cellInBounds(r-1, c)   && mapCells[r-1][c]   == TileType.WATER) ? 4 : 0; // Northeast         
        adjVal += (cellInBounds(r-1, c-1) && mapCells[r-1][c-1] == TileType.WATER) ? 8 : 0; // Northwest    
        mSqCells[r][c] = adjVal;
      }
    }
  } // Ends Function assignMsqCells


  public void paintAtMouseCursor(){
    int xCell = int(mouseX/cellSize);int yCell = int(mouseY/cellSize);
    if(!cellInBounds(yCell, xCell)){return;}
    mapCells[yCell][xCell] = curPaintTile;
    assignMsqCells();    
  } // Ends Function paintAtMouseCursor


  public boolean cellInBounds(int row, int col){
    return (col>=0 && col<mapCellsWide && row>=0 && row<mapCellsTall);
  } // Ends Function cellInBounds


  public void render(){
    switch(mapRenderMode){
      case MapMode.MAP: renderMapCells(); break; 
      case MapMode.MSQ: renderMSQCells(); break;
    }
    renderGrid();
  } // Ends Function render


  public void renderMSQCells(){
    noFill(); noStroke();
    push();translate(-cellHalf,-cellHalf);
    for(int r=0;r<msqCellsTall;r++){for(int c=0;c<msqCellsWide;c++){
      image(tileSprites[mSqCells[r][c]],c*cellSize,r*cellSize,cellSize,cellSize);
    }}
    pop();
  } // Ends Function renderMSQCells


  public void renderMapCells(){
    noStroke();
    for(int r=0;r<mapCellsTall;r++){for(int c=0;c<mapCellsWide;c++){  
      if(mapCells[r][c]==TileType.DIRT){fill(180,120,0);}
      if(mapCells[r][c]==TileType.WATER){fill(0,144,255);}      
      rect(c*cellSize,r*cellSize,cellSize,cellSize);
    }}
  } // Ends Function renderMapCells


  public void renderGrid(){
    if(!this.showGrid){return;}
    strokeWeight(1); stroke(60,127); noFill();
    for(int i=0; i<=mapCellsTall; i++){line(0,cellSize*i,width,cellSize*i);}
    for(int j=0; j<=mapCellsWide; j++){line(cellSize*j,0,cellSize*j,height);}
  } // Ends Function renderMapGrid  

} // Ends Class MSQGridMap


/*----------------------------------------------------------------------
|>>> Function createTileset
+-----------------------------------------------------------------------
| Purpose: Converts PImage of Sprite Sheet (whose members share the same 
|          dimensions and spacing relative to one another) to 1D PImage
|          array whose elements each contain one sprite from the sheet.
| Parms:   sheet - sprite sheet (as PImage)
|          nR,nC - number of rows/cols of sprites within the sheet
|          sW,sH - pixel width/height of sprites within the sheet
|          sM    - horiz./vert. margin between sprites within the sheet
+-----------------------------------------------------------------------
|> Implementation Notes (1/13/22):
|  > This function alongside the Marching Squares code is why I plan to
|    'archive' this sketch (i.e. retain its .PDE directory containing it
|    within whichever ZAC/BG P5JS project it winds up in); as if/when I
|    finally get around to implementing sprites for ZAC: it'd be a good
|    resource for its analog thereto alongside other related functions.
|  > On that note: I deleted a weak function which rendered only single
|    row spritesheets for diagnostic purposes. If a more robust version
|    thereto is ever needed: this function should be [relatively] easy
|    to 'invert' towards servicing the purpose thereto.
|  > As another 'TODO-If/When-Needed': there will inevitably need to be
|    a version of this function that can handle non-uniform spritesheets
|    in terms of differing sprite dimensions, margins, etc.; for which
|    my best solution thereof is to realize a more robust version of the
|    original naive version of this function: which involved brute-force
|    specifying the {xPos,yPos,wide,tall} dims of each sprite. Instead:
|    I can input an int[n][4]=>{x,y,w,t} encompassing the dims for each
|    sprite desired by the caller; alongside perhaps an 'expedited case'
|    overload version of same parms as here (i.e. uniform dims/margin). 
+---------------------------------------------------------------------*/
PImage[] createTileset(PImage sheet, int nR, int nC, int sW, int sH, int sM){
  int i=0;
  PImage[] set = new PImage[nR*nC];
  // Yeah I squished together the double for loop code, homie. What of it?!?
  for(int r=0; r<nR; r++){for(int c=0; c<nC; c++){
    set[i]=sheet.get(((sW+sM)*c),((sH+sM)*r),sW,sH); 
    i++;
  }}
  return set;
} // Ends Function createTileset
