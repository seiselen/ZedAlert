class GameObject{
  static axisColorF = "#0000FF";
  static axisColorR = "#FF0000";

  constructor(pos=null, ID=-1){
    this.ID  = ID;
    this.pos = (pos==null) ? vec2() : pos;
    this.ori = vec2(1,0);
  }

  //====================================================================
  //>>> GETTERS
  //====================================================================
  getOriForward(){return vec2(this.ori.x,this.ori.y);}
  getOriLeft(){return vec2(this.ori.y,-this.ori.x);}
  getOriRight(){return vec2(-this.ori.y,this.ori.x);}
  getOriBack(){return vec2(-this.ori.x,-this.ori.y);}




  //##################################################################
  //>>> GENERAL UTIL FUNCTIONS (incl. [TEMP] debug/tester)
  //##################################################################
  pointAtMouse(){this.ori.set(mousePtToVec().sub(this.pos).normalize());}

  //====================================================================
  //>>> RENDER METHODS
  //====================================================================
  renderAxes(lineLen=32,arrLen=8,origDiam=16){
    let lineF = this.getOriForward().mult(lineLen);
    let lineR = this.getOriRight().mult(lineLen);
    let lineL = this.getOriLeft().mult(lineLen);

    strokeWeight(2); noFill();
    push(); 
    translate(this.pos.x,this.pos.y); 
    stroke(60,128);ellipse(0,0,origDiam,origDiam);
    stroke(GameObject.axisColorF);line(0,0,lineF.x,lineF.y); drawArrow(lineF.x,lineF.y,arrLen,lineF,GameObject.axisColorF);
    stroke(GameObject.axisColorR);line(0,0,lineR.x,lineR.y); drawArrow(lineR.x,lineR.y,arrLen,lineR,GameObject.axisColorR);
    //stroke(255,0,255);line(0,0,lineL.x,lineL.y);
    pop();
  }


}