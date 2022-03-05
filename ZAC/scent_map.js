/*======================================================================
|>>> Class ScentMap                                    [ZED ALERT - MVP]
+-----------------------------------+-----------------------------------
| Author:    Steven Eiselen         | Language:  JavaScript 
| Project:   Zed Alert a.k.a. ZAC   | Library:   P5JS (p5js.org/)
+-----------------------------------+-----------------------------------
| Description: TODO
+-----------------------------------------------------------------------
[AS-YOU-BUILD] Implementation Notes 
  o General Purpose: vector flow-field encompassing 'scent trails' (s.t.
    WRT ZAC: humand passing over cells leave scent trails and direction
    to next cell on their path which zombies can use to track them with)
  o Map Modes: [0] : values | [1] : glyphs | [2] : glyphs and heatmap
  o Dependency Note: Requires two global variables of name [scentAddVal]
    and [scentDecayFac] which define, respectively: how many 'points' an
    agent increments a scent map cell by whenever leaving a scent (s.t.
    currently same for all units with a value of typically [20] but will
    eventually be WRT each unit); and a decay factor by which scent map
    cell values will decrease (currently typically set at [0.98]).
+-----------------------------------------------------------------------
|########## Zed Alert concept and code[base] © Steven Eiselen ##########
+=====================================================================*/
class ScentMap extends GridMap{
  constructor(cT,cW,cS){
    super(cT,cW,cS);
    this.curMapMode  = 2;
    this.totMapModes = 3;
    this.initMap();
    this.initColorPallete();
  } // Ends Constructor

  initColorPallete(){
    super.initColorPallete();
    //>>> Cell Colormap-Related Settings 
    this.col_hmap1 = color(228);
    this.col_hmap2 = color(0,240,60);   
  } // Ends Function initColorPallete

  initMap(){
    for (let r=0; r<this.cellsTall; r++) {
      this.map[r]=[];
      for (let c=0; c<this.cellsWide; c++) {
        this.map[r].push([0,Direction.X]);
      }
    }
  } // Ends Function initMap

  /*--------------------------------------------------------------------
  |>>> Function advanceScent
  +---------------------------------------------------------------------
  | Overview: Realizes 'fading' of scent values for all cells over time.
  +-------------------------------------------------------------------*/  
  advanceScent(){
    if(frameCount%4==3){return;}
    for(let r=0; r<this.cellsTall; r++){
      for(let c=0; c<this.cellsWide; c++){
        if(this.map[r][c][0] > 0.25){this.map[r][c][0] *= scentDecayFac;}
        if(this.map[r][c][0] < 1)   {this.map[r][c][1]  = Direction.X;}
      }
    }
  } // Ends Function advanceScent

  /*--------------------------------------------------------------------
  |>>> Function spreadScent
  +---------------------------------------------------------------------
  | Overview: [At Present,] function <updatePos> in SPMap will call this
  |           whenever human unit leave their current cell; as to effect
  |           them likewise leaving a scent trace.
  +-------------------------------------------------------------------*/
  spreadScent(oldC,newC){
    let diffR = newC[0]-oldC[0];
    let diffC = newC[1]-oldC[1];
    this.map[oldC[0]][oldC[1]][1]  = Direction[((diffR|diffC) == 0) ? 'C' : ((diffR==0) ? '' : (diffR<0) ? 'T' : 'B')+((diffC==0) ? '' : (diffC<0) ? 'L' : 'R')];
    this.map[oldC[0]][oldC[1]][0] += scentAddVal;
  } // Ends Function spreadScent

  detectScent(){
    /*> TODO STUB <*/
  } // Ends Function detectScent

  //> Note: Order of switch cases i.e. {0,2,1} is INTENTIONAL as [2] => heatmap with glyphs atop
  renderMap(){
    switch(this.curMapMode){
      case 0:this.renderCellValues(); break;
      case 2:this.renderCellHeatmap();
      case 1:this.renderCellGlyphs();
    }
  } // Ends Function renderMap

  renderCellValues(){
    fill(this.fill_text); noStroke(); textAlign(CENTER,CENTER); textSize(this.size_text);
    for(let r=0; r<this.cellsTall; r++){
      for(let c=0; c<this.cellsWide; c++){
        text(int(this.map[r][c][0]), (c*this.cellSize)+this.cellHalf, (r*this.cellSize)+this.cellHalf);
      }
    }
  } // Ends Function renderScentVals

  renderCellGlyphs(){
    fill(this.fill_text); noStroke(); textAlign(CENTER,CENTER); textSize(this.size_text);
    for(let r=0; r<this.cellsTall; r++){
      for(let c=0; c<this.cellsWide; c++){
        text(Direction.glyph[this.map[r][c][1]], (c*this.cellSize)+this.cellHalf, (r*this.cellSize)+this.cellHalf);
      }
    } 
  } // Ends Function renderGlyphDirs

  renderCellHeatmap(){
    noStroke();
    for(let r=0; r<this.cellsTall; r++){
      for(let c=0; c<this.cellsWide; c++){
        fill(lerpColor(this.col_hmap1,this.col_hmap2,this.map[r][c][0]/100)); 
        rect(c*this.cellSize,r*this.cellSize,this.cellSize,this.cellSize);
      }
    } 
  } // Ends Function renderHeatmap

} // Ends Class ScentMap