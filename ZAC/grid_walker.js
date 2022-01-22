class GridWalker{
  constructor(row,col,len,map,ID=undefined){
    this.ID = ID;   
    //> Transform Info
    this.pos = createVector(col*map.cellSize+(map.cellSize/2),row*map.cellSize+(map.cellSize/2));
    this.ori = createVector(1,0);
    this.vel = createVector(0,0);
    //> 'Quasi-SA' Settings
    this.maxSpeed = 2;
    this.maxForce = (this.maxSpeed*this.maxSpeed)/20;
    //> Size Settings (latter two used for rendering agent 'chevron' shape)
    this.bodyLen  = len;
    this.bodyHalf = this.bodyLen/2;
    this.bodyThrd = this.bodyLen/3;
    this.bodySxth = this.bodyLen/6;
    //> Map Ref and [Current] Path State
    this.map        = map;
    this.curPath    = [];
    this.curWaypt   = 0;
    this.curMoveTar = null; // current 'move-to' target (as P5.Vector) s.t. if not null: agent will move thereto 
    this.curLACell  = null; // current look-ahead cell - used to handle path interruptions and rerouting thereof
    //> For Preventing 'Insta-Spin' when new path starts behind agent
    this.numRots    = round(PI/this.maxForce)*2; // total # of frames to rotate
    this.curRots    = 0;     // counts number of rotations [towards target]
    this.isFacingMT = false; // 'is facing move-to target'
    //> State Flags/Toggles
    this.isSelected  = false;
    this.isUsingSP   = false; // agent is utilizing the spatial partitioning system
    this.dispLACell  = false;
    this.dispCurPath = false;

    //> Loader Calls
    this.initGFXVals();
    if(this.isUsingSP){this.updateSP();} // say 'hello world' to SP and prime SP state
  } // Ends Constructor

  //####################################################################
  //>>> [RE]INIT FUNCTIONS
  //####################################################################
  initGFXVals(){
    //> For Agent Shape
    this.fill     = color(60); 
    this.strk_reg = color(0,255,0); 
    this.sWgt_reg = 1.5;
    this.strk_sel = color(216,120,0);
    this.swgt_sel = 3;
    //> For Agent Path
    this.path_fill = color(255,64);
    this.path_strk = color(60,128);
    this.path_sWgt = 4;
  } // Ends Function initGFXVals 

  //####################################################################
  //>>> UPDATE/ADVANCE/BEHAVIOR FUNCTIONS
  //####################################################################

  update(){
    this.updatePathFollowState();
    this.moveToCurMoveTar();
  } // Ends Function update


  /*--------------------------------------------------------------------
  |>>> Function moveToCurMoveTar
  +---------------------------------------------------------------------
  | Overview: TODO
  +-------------------------------------------------------------------*/
  moveToCurMoveTar(){
    if(this.curMoveTar){
      if(!this.isFacingMT){this.rotateToFaceMoveTar(); if(!this.isFacingMT){return;}}
      // Steering Agent Behavior [SEEK] in two lines, howaboutdat?!?
      var desVel = p5.Vector.sub(this.curMoveTar,this.pos).setMag(this.maxSpeed); // desired velocity
      let newPos = p5.Vector.add(this.pos,desVel);
      // Clamp if it overshoots the waypoint
      if(p5.Vector.dist(this.pos,newPos)>p5.Vector.dist(this.pos,this.curMoveTar)){newPos.set(this.curMoveTar);}
      if(p5.Vector.dist(this.pos,newPos)==p5.Vector.dist(this.pos,this.curMoveTar)){this.curMoveTar=null;}
      // Update position WRT this frame (i.e. Gridwalker's 'Euler Intregration')
      this.pos.set(newPos);
      // Update ori WRT direction to curMoveTar (hence why it's now here and not following the if/else)
      this.ori.add(p5.Vector.sub(desVel,this.ori).limit(this.maxForce));     
    }
    else{
      this.vel.mult(0);
    }
  } // Ends Function moveToCurMoveTar


  /*--------------------------------------------------------------------
  |>>> Function updatePathFollowState
  +---------------------------------------------------------------------
  | Overview: TODO
  +-------------------------------------------------------------------*/
  updatePathFollowState(){
    if(this.curWaypt<this.curPath.length){
      let newPos = p5.Vector.add(this.pos,this.vel);
      if(p5.Vector.dist(this.pos,newPos)>p5.Vector.dist(this.pos,this.curPath[this.curWaypt])){newPos=this.curPath[this.curWaypt];}
      if(p5.Vector.dist(this.pos,newPos)==p5.Vector.dist(this.pos,this.curPath[this.curWaypt])){this.curWaypt++;this.setCurTarToNextPathWaypt();}
    }
  } // Ends Function updatePathFollowState 


  /*--------------------------------------------------------------------
  |>>> Function rotateToFaceMoveTar
  +---------------------------------------------------------------------
  | Overview: TODO
  +-------------------------------------------------------------------*/
  rotateToFaceMoveTar(){
    if(this.curRots==0 && abs(p5.Vector.dot(this.ori.copy().normalize(),p5.Vector.sub(this.pos,this.curMoveTar).normalize())-1)>=0.98){this.isFacingMT=true; return;}
    this.ori.setHeading(this.ori.heading()+(PI/this.numRots)); this.curRots++;
    if(this.curRots==this.numRots){this.isFacingMT=true;}
  } // Ends Function rotateToFaceMoveTar


  //####################################################################
  //>>> SETTER FUNCTIONS
  //####################################################################

  /*--------------------------------------------------------------------
  |>>> Function setMaxSpeed
  +---------------------------------------------------------------------
  | Overview: Sets maxSpeed AND maxForce WRT maxSpeed via new heuristic.
  +-------------------------------------------------------------------*/
  setMaxSpeed(newSpeed){
    this.maxSpeed = newSpeed;
    this.maxForce = (this.maxSpeed*this.maxSpeed)/20;
  } // Ends Function setMaxSpeed


  /*--------------------------------------------------------------------
  |>>> Function resetInstaSpinHandleState
  +---------------------------------------------------------------------
  | Overview: Self-Evident via title, agent state changes to acknowledge
  |           that it might be facing opposite of the 'move-to' target.
  |           This MUST BE called whenever a new path is passed in to be
  |           followed, xor new p5.Vector passed in to be moved to; i.e.
  |           whenever <givePath> and <giveMoveTar> (resp.) are called.
  +---------------------------------------------------------------------
  | Implementation Note On Frequency Of Calls / Reduction Thereof:
  |  > For the 'Path Following' case: this function need only be called
  |    once; and the rotation process only done once IFF necessary; as
  |    there is [presently] no scenario in which a GridWalker will be
  |    facing opposite of its next waypoint sans the first waypoint.
  |  > For the 'Move To Here' case: this function is also called once, 
  |    although as of typing: such will amount to one call and rotation
  |    process handle per action for what will be a number of actions in
  |    scenarios such as "follow another agent". However, this will only
  |    amount to the 'good' scenario of "you are NOT facing opposite the
  |    target - proceed as usual"; so while the computation work overall
  |    will still be greater than the path following case: it's not by
  |    that much of a factor (that my OCD need worry about, i.e. KISS!) 
  +-------------------------------------------------------------------*/
  resetInstaSpinHandleState(){
    this.isFacingMT = false; 
    this.curRots  = 0;
  } // Ends Function resetInstaSpinHandleState 


  /*--------------------------------------------------------------------
  |>>> Function givePath
  +---------------------------------------------------------------------
  | Overview: Provides agent with new path to follow. A necessary call
  |           is made to <resetInstaSpinHandleState> to either commence
  |           the 'rotate towards target (i.e. first waypoint)' process
  |           before starting to move thereto; else set flag indicating
  |           this is was done xor not necessary. This process will only
  |           need to be done ONCE for the entire traveral of the path!
  +-------------------------------------------------------------------*/
  givePath(path){
    this.curWaypt = 0; 
    this.curPath  = path;
    this.resetInstaSpinHandleState();
    this.setCurTarToNextPathWaypt(); // Intuition: Receiving path immediately 'awakens' curMoveTar to first waypt
  } // Ends Function givePath


  /*--------------------------------------------------------------------
  |>>> Function setCurTarToNextPathWaypt
  +---------------------------------------------------------------------
  | Overview: Self Expanatory, 'Nuff Said.
  +-------------------------------------------------------------------*/
  setCurTarToNextPathWaypt(){
    this.curMoveTar = (this.curWaypt<this.curPath.length) ? this.curPath[this.curWaypt] : null;
  } // Ends Function setCurTarToNextPathWaypt


  /*--------------------------------------------------------------------
  |>>> Function giveMoveTar
  +---------------------------------------------------------------------
  | Overview: Provides Gridwalker with (new) 'move-to' target. The input
  |           MUST be of type [p5.Vector], and SHOULD correspond to the
  |           midpoint of a cell in the Moore Neighborhood of the cell
  |           this agent is currently within (unless you know what you
  |           are doing WRT alternate non path-follow based movement).
  |           A necessary call is made to <resetInstaSpinHandleState> to 
  |           either commence the 'rotate towards target' process before
  |           before moving thereto; else set the flag indicating this 
  |           was done xor not necessary. This process will need to be
  |           done for EACH call of this function, ergo again put such
  |           into consideration for the alternate movement scenarios.
  |           On the plus side, as the comment box documentation for the
  |           <resetInstaSpinHandleState> function states: you'll likely
  |           only need to do the rotation on the first call; as you're
  |           likely not going to have this agent keep moving towards
  |           stuff it's not facing.
  +-------------------------------------------------------------------*/
  giveMoveTar(target){
    this.curMoveTar = target;
    this.resetInstaSpinHandleState();
  } // Ends Function giveMoveTar 


  //####################################################################
  //>>> GETTER FUNCTIONS
  //####################################################################
  
  inSameCellAsMe(othCell){
    let myCell = this.map.cellViaPos(this.pos);
    return othCell[0]==myCell[0]&&othCell[1]==myCell[1];
  }


  // debating whether or not to keep this...
  getMapCell(){
    return this.map.cellViaPos(this.pos);
  }


  //##################################################################
  //>>> RENDER FUNCTIONS
  //##################################################################
  
  render(){
    this.renderBody();
    //this.renderLACell();
  }


  /*--------------------------------------------------------------------
  |>>> Function renderBody
  +---------------------------------------------------------------------
  | Overview: Renders agent via the classic Chevron-Shaped simple agent
  |           representation. This is also the NEW-AND-IMPROVED version:
  |           wherein the triangle/chevron is now geometrically centered
  |           to the agent's position, the vertex locations aligned with
  |           the agent's orientation (i.e. no need to add 'PI/2' to the
  |           <rotate> call anymore), and the chevron's rear 'fold' less
  |           pronounced (i.e. bodyLen/3 <vs> bodyLen/2) as to effect a 
  |           smoother shape WRT the 'fins' at the stern port/starboard.
  | Note:     The difference between rendering this as a triangle versus
  |           a chevron is the [STERN] vertex. If commented out: you'll
  |           see a triangle; else you'll otherwise see a chevron.
  +-------------------------------------------------------------------*/
  renderBody(){
    fill(this.fill);
    switch(this.isSelected){
      case true:  stroke(this.strk_sel); strokeWeight(this.sWgt_sel); break;
      case false: stroke(this.strk_reg); strokeWeight(this.sWgt_reg); break;
    }

    push();
      translate(this.pos.x,this.pos.y);
      rotate(this.ori.heading());
      translate(this.bodySxth,0);
      beginShape();
        vertex(this.bodyHalf,0); // <---------------- BOW    (FRONT)
        vertex(-this.bodyHalf,-this.bodyHalf); // <-- STARBD (RIGHT)
        vertex(-this.bodyThrd,0); // <--------------- STERN  (BACK/CHEVRON)
        vertex(-this.bodyHalf,this.bodyHalf); // <--- PORT   (LEFT)
      endShape(CLOSE); 
    pop();
  } // Ends Function renderBody


  /*--------------------------------------------------------------------
  |>>> Function renderCurPath
  +---------------------------------------------------------------------
  | Overview: [QAD] Renders agent's path (A/A). This code is via 'Scent
  |           Map Demo' wherein I commented: "disgustingly inefficient,
  |           I know, but KISS as this is only a demo". While that was
  |           true, I should refactor this to serve as a util for agent
  |           specific rendering of current paths <== i.e. a [TODO].
  +-------------------------------------------------------------------*/
  renderCurPath(){
    if(!this.dispCurPath || !this.curPath){return;}
    let pLen = this.curPath.length;
    for (let i=0; i<pLen; i++) {
      stroke(this.path_fill); strokeWeight(this.path_sWgt);
      line(this.curPath[i].x,this.curPath[i].y,this.curPath[(i+1)%pLen].x,this.curPath[(i+1)%pLen].y);      
    }
  } // Ends Function renderCurPath


  /*--------------------------------------------------------------------
  |>>> Function renderLACell
  +---------------------------------------------------------------------
  | Overview: [QAD] Renders the lookahead cell, as used when debugging
  |           Gridwalker-P5JS. Keeping it in case it's still needed.
  +-------------------------------------------------------------------*/
  renderLACell(){
    if(this.dispLACell && this.curLACell){
      let posLA = this.map.getCellTLPos(this.lookaheadC);
      fill(0,144,0,128); noStroke();
      rect(posLA.x,posLA.y,cellSize,cellSize);
    }    
  } // Ends Function renderLACell


} // Ends Class Gridwalker