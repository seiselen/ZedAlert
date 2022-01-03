/*======================================================================
|>>> Class SoundMap
+-----------------------------------------------------------------------
|# QAD Notes
|  > Cell Values: 
|    o [-1]    => Sound Blocked (i.e. is building, ergo won't spread it)
|    o [0]     => Sound Expired (i.e. no longer 'interests' listeners)
|    o [1,100] => Sound Active  (i.e. none of the above, 'Nuff Said)
|  > Cell Directions: |7 8 1|    |NW  N  NE|    |RL  T  TR|
|                     |6 0 2| => | W ORG  E| => | L CTR  R|
|                     |5 4 3|    |SW  S  SE|    |BL  B  BR|
+=====================================================================*/
var Direction = {
  'O':0, 'ORG':0, 'NE':1, 'E':2, 'SE':3, 'S':4, 'SW':5, 'W':6, 'NW':7, 'N':8, 
  'C':0, 'CTR':0, 'TR':1, 'R':2, 'BR':3, 'B':4, 'BL':5, 'L':6, 'TL':7, 'T':8,
  'X':9, // <== None/Expired/Unknown (i.e. val is zero, cell blocks sound, etc.)
  glyph : ['•','⬈','⮕','⬊','⬇','⬋','⬅','⬉','⬆','∅']
};

class SoundMap{
  static decayFactor = 0.95;

  constructor(cW,cT,cS){
    this.cellsWide = cW;
    this.cellsTall = cT;
    this.cellSize  = cS;
    this.cellHalf  = this.cellSize/2;
    this.map       = [];
    this.showGrid  = true;

    this.initGrid();
    this.initColorPallete();
  } // Ends Constructor

  //##################################################################
  //>>> LOADER AND INIT FUNCTIONS
  //##################################################################
  initColorPallete(){
    //>>> Cell Colormap-Related Settings
    this.col_hmap1 = color(180,180,216);
    this.col_hmap2 = color(255,255,0);
    //>>> Grid-Related Settings
    this.strk_grid = color(60,128);    
    this.sWgt_grid = 2; 
    //>>> Text-Related Settings
    this.fill_text = color(60);
    this.size_text = 20;
  } // Ends Function initColorPallete

  initGrid(){
    for (let r = 0; r < this.cellsTall; r++) {
      this.map[r]=[];
      for (let c = 0; c < this.cellsWide; c++) {
        this.map[r].push([0,Direction.X]);
      }
    }
  } // Ends Function initGrid

  //##################################################################
  //>>> UPDATE [PER-FRAME] AND EVENT-BASED FUNCTIONS
  //##################################################################
  updateCells(){
    for(let r=0; r<this.cellsTall; r++){
      for(let c=0; c<this.cellsWide; c++){
        if(this.map[r][c][0] > 0.25){this.map[r][c][0] *= SoundMap.decayFactor;}
        if(this.map[r][c][0] < 1)   {this.map[r][c][1]  = Direction.X;}
      }
    }
  } // Ends Function updateCells

  makeASound(sPos, sRad){
    let coord   = this.posToCoord(sPos);
    let sMpt    = this.posToMidpt(sPos);
    let cMpt    = vec2();
    let cellRad = floor(sRad/this.cellSize);
    let sRadSqd = sRad*sRad;
    let diffR   = -1;
    let diffC   = -1;
    for(let r=coord[0]-cellRad; r<=coord[0]+cellRad; r++){
      for(let c=coord[1]-cellRad; c<=coord[1]+cellRad; c++){
        cMpt.set(this.coordToPos(r,c));
        if(this.cellInBounds(r,c) && distSq(sMpt,cMpt) <= sRadSqd){
          diffR = coord[0]-r;
          diffC = coord[1]-c;
          this.map[r][c][1]  = Direction[((diffR|diffC) == 0) ? 'C' : ((diffR==0) ? '' : (diffR<0) ? 'T' : 'B')+((diffC==0) ? '' : (diffC<0) ? 'L' : 'R')];
          this.map[r][c][0] += soundAddVal;
        }
      }
    }
  } // Ends Function makeASound

  //##################################################################
  //>>> GENERAL UTIL FUNCTIONS
  //##################################################################
  posToCoord(pos){return [floor(pos.y/this.cellSize),floor(pos.x/this.cellSize)];}
  posToMidpt(pos){return this.coordToPos(this.posToCoord(pos));}
  coordToPos(v1,v2){switch(arguments.length){case 1: return vec2((v1[1]*this.cellSize)+this.cellHalf, (v1[0]*this.cellSize)+this.cellHalf); case 2: return vec2((v2*this.cellSize)+this.cellHalf, (v1*this.cellSize)+this.cellHalf);}}
  cellInBounds(v1,v2){switch(arguments.length){case 1: return (v1[0]>=0 && v1[0]<this.cellsTall && v1[1]>=0 && v1[1]<this.cellsWide); case 2: return (v1>=0 && v1<this.cellsTall && v2>=0 && v2<this.cellsWide);}}

  //##################################################################
  //>>> RENDER FUNCTIONS
  //##################################################################
  render(){
    this.renderHeatmap();
    this.renderDirGlyphs();
    this.renderGrid();    
  } // Ends Function render

  renderDirGlyphs(){
    fill(this.fill_text); noStroke(); textAlign(CENTER,CENTER); textSize(this.size_text);
    for(let r=0; r<this.cellsTall; r++){
      for(let c=0; c<this.cellsWide; c++){
        text(Direction.glyph[this.map[r][c][1]], (c*this.cellSize)+this.cellHalf, (r*this.cellSize)+this.cellHalf);
      }
    } 
  } // Ends Function renderDirGlyphs

  renderHeatmap(){
    noStroke();
    for(let r=0; r<this.cellsTall; r++){
      for(let c=0; c<this.cellsWide; c++){
        fill(lerpColor(this.col_hmap1,this.col_hmap2,this.map[r][c][0]/100)); 
        rect(c*this.cellSize,r*this.cellSize,this.cellSize,this.cellSize);
      }
    } 
  } // Ends Function renderHeatmap

  renderGrid(){
    stroke(this.strk_grid); strokeWeight(this.sWgt_grid);
    for(let i=0; i<=this.cellsTall; i++){line(0,this.cellSize*i,width,this.cellSize*i);}
    for(let i=0; i<=this.cellsWide; i++){line(this.cellSize*i,0,this.cellSize*i,height);}
  } // Ends Function renderGrid

} // Ends Class SoundMap