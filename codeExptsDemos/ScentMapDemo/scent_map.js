

var Direction = {
  'O':0, 'ORG':0, 'NE':1, 'E':2, 'SE':3, 'S':4, 'SW':5, 'W':6, 'NW':7, 'N':8, 
  'C':0, 'CTR':0, 'TR':1, 'R':2, 'BR':3, 'B':4, 'BL':5, 'L':6, 'TL':7, 'T':8,
  'X':9, // 'X' => None/Expired/Unknown (i.e. val is zero, cell blocks sound, etc.)
  'glyph':['+','⬈','⮕','⬊','⬇','⬋','⬅','⬉','⬆',' ']
};


class ScentMapCell{
  constructor(r,c,mpt){
    this.row = r;
    this.col = c;
    this.mpt = mpt;
    this.dir = Direction.X;
    this.val = 0;
  }

  update(){
    if(frameCount%16==0 && this.val>0.25){this.val*=0.98;}
    if(this.val<1){this.dir = Direction.X;} // could throw as 2nd statement of above, but leaving alone now to KISS
  }

  gainScent(coord,sVal){
    this.setDirViaCoord(coord);
    this.val+=sVal;
  }

  setDirViaCoord(coord){
    let diffR = coord[0]-this.row;
    let diffC = coord[1]-this.col;
    this.dir = Direction[((diffR|diffC) == 0) ? 'C' : ((diffR==0) ? '' : (diffR<0) ? 'T' : 'B')+((diffC==0) ? '' : (diffC<0) ? 'L' : 'R')];
  }

}



class ScentMap{

  constructor(cW,cT,cS){
    this.cellsWide = cW;
    this.cellsTall = cT;
    this.cellSize  = cS;
    this.cellSizeH = this.cellSize/2;
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
    this.map.length = 0;
    for (var r = 0; r < this.cellsTall; r++) {
      this.map[r]=[];
      for (var c = 0; c < this.cellsWide; c++) {
        this.map[r].push(new ScentMapCell(r,c,this.coordToPos([r,c])));
      }
    }
  } // Ends Function initSPGridViaRegObj


  //####################################################################
  //>>> UPDATE FUNCTIONS (I.E. PER-FRAME)
  //####################################################################
  update(){
    this.updateCells();
  }

  updateCells(){
    for(let r=0; r<this.cellsTall; r++){
      for(let c=0; c<this.cellsWide; c++){
        this.map[r][c].update();
      }
    }    
  }


  //####################################################################
  //>>> ACTION/EVENT FUNCTIONS
  //####################################################################

  // for this demo: map is NOT servicing SP, nor does it need to know which agent notifies it
  updatePos(oldCoord,newCoord){
    this.map[oldCoord[0]][oldCoord[1]].gainScent(newCoord,curScentPts);

    // QAD Experiment: 'spread scent' to moore neighbors by 15% of score if score is over 100
    /*
    let row = oldCoord[0];
    let col = oldCoord[1];
    let val = this.map[row][col].val;
    if(val>=100){
      for(let r=row-1; r<=row+1; r++){ for(let c=col-1; c<=col+1; c++){
        if( (r!=row || c!=col) && this.cellInBounds(r,c)){
          this.map[r][c].gainScent(oldCoord,val*0.15);
        }
      }}
    }
    */
  } // Ends Function updatePos

  //####################################################################
  //>>> GENERAL UTIL FUNCTIONS (incl. [TEMP] debug/tester)
  //####################################################################

  posToCoord(pos){return [floor(pos.y/this.cellSize),floor(pos.x/this.cellSize)];}
  coordToPos(rc){return vec2((rc[1]*this.cellSize)+this.cellSizeH, (rc[0]*this.cellSize)+this.cellSizeH);}
  posToMidpt(pos){return this.coordToPos(this.posToCoord(pos));} // <= new [and convenient!]

  // No native function overloading makes Steve sad and/or mad. Meh...
  cellInBounds(v1,v2){
    switch(arguments.length){
      case 1: return (v1[0]>=0 && v1[0]<this.cellsTall && v1[1]>=0 && v1[1]<this.cellsWide);
      case 2: return (v1>=0 && v1<this.cellsTall && v2>=0 && v2<this.cellsWide);
    }
  }

  setDirViaMouse(){
    let mouseCoord = this.posToCoord(mousePtToVec());
    for(let r=0; r<this.cellsTall; r++){
      for(let c=0; c<this.cellsWide; c++){
        this.map[r][c].setDirViaCoord(mouseCoord);
      }
    }    
  }

  setValsToHundred(){
    for(let r=0; r<this.cellsTall; r++){
      for(let c=0; c<this.cellsWide; c++){
        this.map[r][c].val=100;;
      }
    }     
  }


  //####################################################################
  //>>> RENDER FUNCTIONS
  //####################################################################
  render(){
    this.renderHeatmap();
    this.renderDirGlyphs();
    this.renderGrid();    
  }

  renderDirGlyphs(){
    fill(this.fill_text); noStroke();
    textAlign(CENTER,CENTER); textSize(this.size_text);
    for(let r=0; r<this.cellsTall; r++){
      for(let c=0; c<this.cellsWide; c++){
        text(Direction.glyph[this.map[r][c].dir], (c*this.cellSize)+this.cellSizeH, (r*this.cellSize)+this.cellSizeH);
      }
    } 
  } // Ends Function renderDirGlyphs

  renderHeatmap(){
    noStroke();
    for(let r=0; r<this.cellsTall; r++){
      for(let c=0; c<this.cellsWide; c++){
        fill(lerpColor(this.col_hmap1,this.col_hmap2,this.map[r][c].val/100)); 
        rect(c*this.cellSize,r*this.cellSize,this.cellSize,this.cellSize);
      }
    } 
  } // Ends Function renderHeatmap

  renderGrid(){
    stroke(this.strk_grid); strokeWeight(this.sWgt_grid);
    for(let i=0; i<=this.cellsTall; i++){line(0,this.cellSize*i,width,this.cellSize*i);}
    for(let i=0; i<=this.cellsWide; i++){line(this.cellSize*i,0,this.cellSize*i,height);}
  } // Ends Function renderGrid


}