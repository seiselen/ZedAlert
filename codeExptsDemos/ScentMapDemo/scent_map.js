var Direction = {
  'O':0, 'ORG':0, 'NE':1, 'E':2, 'SE':3, 'S':4, 'SW':5, 'W':6, 'NW':7, 'N':8, 
  'C':0, 'CTR':0, 'TR':1, 'R':2, 'BR':3, 'B':4, 'BL':5, 'L':6, 'TL':7, 'T':8,
  'X':9, // 'X' => None/Expired/Unknown (i.e. val is zero, cell blocks sound, etc.)
  'glyph':['+','⬈','⮕','⬊','⬇','⬋','⬅','⬉','⬆',' ']
};

class ScentMap{
  static decayFactor = 0.98;
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

  //####################################################################
  //>>> LOADER AND INIT FUNCTIONS
  //####################################################################

  initColorPallete(){
    //>>> Cell Colormap-Related Settings 
    this.col_hmap1 = color(228);
    this.col_hmap2 = color(0,240,60);
    //>>> Grid-Related Settings
    this.strk_grid = color(60,128);    
    this.sWgt_grid = 2; 
    //>>> Text-Related Settings
    this.fill_text = color(0);   // text labels
    this.size_text = 20;         // font size
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
    if(frameCount%16!=0){return;}
    for(let r=0; r<this.cellsTall; r++){
      for(let c=0; c<this.cellsWide; c++){
        if(this.map[r][c].val>0.25){this.map[r][c][0] *= ScentMap.decayFactor;}
        if(this.map[r][c].val<1){this.map[r][c][1]     = Direction.X;}
      }
    }    
  } // Ends Function updateCells

  // for this demo: map is NOT servicing SP, nor does it need to know which agent notifies it
  leaveScent(oldC,newC){
    let diffR = newC[0]-oldC[0];
    let diffC = newC[1]-oldC[1];
    this.map[oldC[0]][oldC[1]][1]  = Direction[((diffR|diffC) == 0) ? 'C' : ((diffR==0) ? '' : (diffR<0) ? 'T' : 'B')+((diffC==0) ? '' : (diffC<0) ? 'L' : 'R')];
    this.map[oldC[0]][oldC[1]][0] += curScentPts;
  } // Ends Function leaveScent

  //####################################################################
  //>>> GENERAL UTIL FUNCTIONS (incl. [TEMP] debug/tester)
  //####################################################################
  posToCoord(pos){return [floor(pos.y/this.cellSize),floor(pos.x/this.cellSize)];}
  posToMidpt(pos){return this.coordToPos(this.posToCoord(pos));}
  coordToPos(v1,v2){switch(arguments.length){case 1: return vec2((v1[1]*this.cellSize)+this.cellHalf, (v1[0]*this.cellSize)+this.cellHalf); case 2: return vec2((v2*this.cellSize)+this.cellHalf, (v1*this.cellSize)+this.cellHalf);}}
  cellInBounds(v1,v2){switch(arguments.length){case 1: return (v1[0]>=0 && v1[0]<this.cellsTall && v1[1]>=0 && v1[1]<this.cellsWide); case 2: return (v1>=0 && v1<this.cellsTall && v2>=0 && v2<this.cellsWide);}}

  setValsTo100(){for(let r=0; r<this.cellsTall; r++){for(let c=0; c<this.cellsWide; c++){this.map[r][c][0] = 100;}}}

  //####################################################################
  //>>> RENDER FUNCTIONS
  //####################################################################
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

} // Ends Class ScentMap