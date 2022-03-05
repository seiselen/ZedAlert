/*======================================================================
|>>> Class SoundMap                                    [ZED ALERT - MVP]
+-----------------------------------+-----------------------------------
| Author:    Steven Eiselen         | Language:  JavaScript 
| Project:   Zed Alert a.k.a. ZAC   | Library:   P5JS (p5js.org/)
+-----------------------------------+-----------------------------------
| Description: TODO
+-----------------------------------------------------------------------
[AS-YOU-BUILD] Implementation Notes 
  o General Purpose: vector flow-field s.t. WRT ZAC - zombies and human
    NPCs can track recent [loud] sounds, e.g. as to move towards them.
  o Cell Values: 
    # [-1]    => Sound Blocked (i.e. if a building: sound won't spread)
    # [0]     => Sound Expired (i.e. no longer 'interests' listeners)
    # [1,100] => Sound Active  (i.e. none of the above, 'Nuff Said)
  o Map Modes: [0] : values | [1] : glyphs | [2] : glyphs and heatmap
  o Dependency Note: Requires two global variables of name [soundAddVal]
    and [soundDecayFac] which define, respectively: the base 'points' a
    thing creates when making a sound (s.t. currently same for anything
    with value of typically [80] but will eventually be specific to the
    thing); and a decay factor by which sound map cell values decrease
    over time (currently typically set at [0.95]).
+-----------------------------------------------------------------------
|########## Zed Alert concept and code[base] © Steven Eiselen ##########
+=====================================================================*/
class SoundMap extends GridMap{
  constructor(cT,cW,cS){
    super(cT,cW,cS);
    this.curMapMode  = 2;
    this.totMapModes = 3;
    this.initColorPallete();
    this.initMap();
  } // Ends Constructor

  initColorPallete(){
    super.initColorPallete();
    //>>> Cell Colormap-Related Settings
    this.col_hmap1  = color(180,180,216);
    this.col_hmap2  = color(255,255,0);
    //>>> Per-Cell Info-Related Settings
    this.size_glyph = 20;
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
  |>>> Function advanceSound
  +---------------------------------------------------------------------
  | Overview: Realizes 'fading' of sound values for all cells over time.
  +-------------------------------------------------------------------*/  
  advanceSound(){
    for(let r=0; r<this.cellsTall; r++){
      for(let c=0; c<this.cellsWide; c++){
        if(this.map[r][c][0] > 0.25){this.map[r][c][0] *= soundDecayFac;}
        if(this.map[r][c][0] < 1)   {this.map[r][c][1]  = Direction.X;}
      }
    }
  } // Ends Function advanceSound

  /*--------------------------------------------------------------------
  |>>> Function spreadSound
  +---------------------------------------------------------------------
  | Overview: [At Present,] the handler of some thing/event producing an
  |           'observable' sound will call this (e.g. grenade explodes);
  |           as to effect making a sound that nearby agents can follow.
  +-------------------------------------------------------------------*/
  spreadSound(sPos, sRad){
    let coord   = this.posToCoord(sPos);
    let sMpt    = this.posToMidPt(sPos);
    let cMpt    = vec2();
    let cellRad = floor(sRad/this.cellSize);
    let sRadSqd = sRad*sRad;
    let diffR   = -1;
    let diffC   = -1;
    for(let r=coord[0]-cellRad; r<=coord[0]+cellRad; r++){
      for(let c=coord[1]-cellRad; c<=coord[1]+cellRad; c++){
        cMpt.set(this.coordToMidPt(r,c));
        if(this.cellInBounds(r,c) && distSq(sMpt,cMpt) <= sRadSqd){
          diffR = coord[0]-r;
          diffC = coord[1]-c;
          this.map[r][c][1] = Direction[((diffR|diffC) == 0) ? 'C' : ((diffR==0) ? '' : (diffR<0) ? 'T' : 'B')+((diffC==0) ? '' : (diffC<0) ? 'L' : 'R')];
          this.map[r][c][0] += soundAddVal;
        }
      }
    }
  } // Ends Function spreadSound

  detectSound(){
    /*> TODO STUB <*/
  } // Ends Function detectSound


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
    fill(this.fill_text); noStroke(); textAlign(CENTER,CENTER); textSize(this.size_glyph);
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