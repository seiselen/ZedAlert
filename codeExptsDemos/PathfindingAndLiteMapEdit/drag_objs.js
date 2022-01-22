function createDragObject(token,row,col){
  if (!myMap.cellInBounds(row,col)){return null;}
  return new DragObject(token,row,col);
}

class DragObject{
  constructor(t,r,c){
    this.token     = t; // s.t {'start' XOR 'goal'}
    this.coord     = [r,c];
    this.pos       = myMap.coordToPos(r,c);
    this.diameter  = Config.cellSize;
    this.radius    = this.diameter/2;
    this.selected  = false; // i.e. 'is selected'
    this.mouseOff  = null;  // i.e. 'mouse offset'
    this.fill_tokS = color(0,120,216);
    this.fill_tokG = color(216,0,0);
    this.fill_ERRR = color(255,0,255);    
    this.strk_reg  = color(60);
    this.strk_sel  = color(255);    
    this.sWgt_circ = 2;    
  }

  onMousePressed(mousePt){
    if(p5.Vector.dist(mousePt,this.pos) <= this.radius){this.selected = true; this.mouseOff = p5.Vector.sub(this.pos,mousePt); return this;} 
    return null;
  }

  onMouseDragged(mousePt){
    if(this.selected){this.pos.set(p5.Vector.add(this.mouseOff,mousePt));}
  }

  onMouseReleased(mousePt){
    if(!this.selected){return;}
    this.selected = false;
    this.snapToCell(this.pos);
    let newCoord = myMap.posToCoord(this.pos);
    if (newCoord == null || arr2Equals(newCoord, pathTokens.getOtherToken(this).coord)){this.snapToPrevMRC(); return;}
    this.coord = newCoord;
  } // Ends Function OnMouseReleased

  snapToPrevMRC(){
    this.snapToCell(myMap.coordToPos(this.coord));
  }

  snapToCell(newPos){
    if(newPos==null){return;} 
    this.pos.set(myMap.posToMidpt(newPos));
  }

  render() {
    (this.selected) ? stroke(this.strk_sel) : stroke(this.strk_reg); 
    strokeWeight(this.sWgt_circ);
    switch(this.token){case "start": fill(this.fill_tokS); break; case "goal": fill(this.fill_tokG); break; default: fill(this.fill_ERRR);}
    ellipse(this.pos.x,this.pos.y,this.diameter,this.diameter);
  }
} // Ends Class DragObject


