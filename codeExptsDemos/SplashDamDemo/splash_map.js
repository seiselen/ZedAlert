
class SplashMap{
  constructor(cW,cT,cS){
    this.cellsWide = cW;
    this.cellsTall = cT;
    this.cellSize  = cS;
    this.cellSizeH = this.cellSize/2;
    this.map       = [];
    this.initGrid();
    this.initColorPallete();
  } // Ends Constructor

  //##################################################################
  //>>> LOADER AND INIT FUNCTIONS
  //##################################################################

  initColorPallete(){
    //>>> Cell Colormap-Related Settings
    this.col_hmap1 = color(50,136,189);
    this.col_hmap2 = color(213,62,79);
    //>>> Grid-Related Settings
    this.strk_grid = color(60,128);    
    this.sWgt_grid = 2; 
    //>>> Text-Related Settings
    this.fill_text = color(60);
    this.size_text = 14;
  } // Ends Function initColorPallete

  initGrid(){
    this.map.length = 0;
    for (var r = 0; r < this.cellsTall; r++) {
      this.map[r]=[];
      for (var c = 0; c < this.cellsWide; c++){this.map[r].push(-1);}
    }
    this.resetCellVals();
  } // Ends Function initGrid

  //##################################################################
  //>>> ACTION/EVENT FUNCTIONS
  //##################################################################

  // resets cell values to [100] i.e. 'full health'; as done @ init and before calls of 'makeASplash'
  resetCellVals(){
    for (var r = 0; r < this.cellsTall; r++) {
      for (var c = 0; c < this.cellsWide; c++) {
        this.map[r][c] = 100;
      }
    }    
  } // Ends Function resetCellVals

  makeASplash(sPos, sDam, sRad, sFac){
    let coord   = this.posToCoord(sPos);
    let sMpt    = this.posToMidpt(sPos);
    let cellRad = floor(sRad/this.cellSize);
    let sRadSqd = sRad*sRad;
    let cDist   = -1;
    let cDam    = -1;
    for(let r=coord[0]-cellRad; r<=coord[0]+cellRad; r++){
      for(let c=coord[1]-cellRad; c<=coord[1]+cellRad; c++){
        if(this.cellInBounds(r,c)){
          cDist = sMpt.dist(this.coordToPos(r,c));
          if(cDist <= sRad){this.map[r][c] = max(0,this.map[r][c]-round(sDam*pow(sFac,(cDist/sRad))));}
        }
      }
    }
  } // Ends Function makeASplash

  //##################################################################
  //>>> GENERAL UTIL FUNCTIONS (incl. [TEMP] debug/tester)
  //##################################################################

  posToCoord(pos){return [floor(pos.y/this.cellSize),floor(pos.x/this.cellSize)];}
  posToMidpt(pos){return this.coordToPos(this.posToCoord(pos));} // <= new [and convenient!]

  //>>> Kinda liking this mechanism as an analog of function overloading in JS!
  coordToPos(v1,v2){switch(arguments.length){   
    case 1: return vec2((v1[1]*this.cellSize)+this.cellSizeH, (v1[0]*this.cellSize)+this.cellSizeH);
    case 2: return vec2((v2*this.cellSize)+this.cellSizeH, (v1*this.cellSize)+this.cellSizeH);
  }}

  cellInBounds(v1,v2){switch(arguments.length){
    case 1: return (v1[0]>=0 && v1[0]<this.cellsTall && v1[1]>=0 && v1[1]<this.cellsWide);
    case 2: return (v1>=0 && v1<this.cellsTall && v2>=0 && v2<this.cellsWide);
  }}

  //##################################################################
  //>>> RENDER FUNCTIONS
  //##################################################################
  render(){
    this.renderHeatmap();
    this.renderDamVals();
    this.renderGrid();    
  }

  renderDamVals(){
    fill(this.fill_text); noStroke(); textAlign(CENTER,CENTER); textSize(this.size_text); textStyle(BOLD);
    for(let r=0; r<this.cellsTall; r++){ for(let c=0; c<this.cellsWide; c++){
      text(((this.map[r][c]>=100) ? "1⁰⁰" : this.map[r][c]), (c*this.cellSize)+this.cellSizeH, (r*this.cellSize)+this.cellSizeH);
    }}
    textStyle(NORMAL); // reset back, as showFPS and otherwise uses default settings
  } // Ends Function renderDamVals

  renderHeatmap(){
    noStroke();
    for(let r=0; r<this.cellsTall; r++){ for(let c=0; c<this.cellsWide; c++){
      //fill(lerpColor(this.col_hmap1,this.col_hmap2,this.map[r][c]/100)); 
      fill(linMapCol(this.map[r][c]));
      rect(c*this.cellSize,r*this.cellSize,this.cellSize,this.cellSize);
    }} 
  } // Ends Function renderHeatmap

  renderGrid(){
    stroke(this.strk_grid); strokeWeight(this.sWgt_grid);
    for(let i=0; i<=this.cellsTall; i++){line(0,this.cellSize*i,width,this.cellSize*i);}
    for(let i=0; i<=this.cellsWide; i++){line(this.cellSize*i,0,this.cellSize*i,height);}
  } // Ends Function renderGrid

} // Ends Class SplashMap