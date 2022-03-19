/*======================================================================
|>>> Class GridWalker                              [ZAC | ZED ALERT MVP]
+-----------------------------------+-----------------------------------
| Author:    Steven Eiselen         | Language:  JavaScript 
| Project:   Zed Alert a.k.a. ZAC   | Library:   P5JS (p5js.org/)
+-----------------------------------+-----------------------------------
| Description: TODO
+-----------------------------------------------------------------------
| [AS-YOU-BUILD] Implementation Notes:
|  > (Assigning Refs For [GridMap]/[PathFinder]): I've implemented the
|    method of their assignment in a way I hope is more convenient and
|    generalized/robust (i.e. for side/spinoff projects) than annoying.
|    The constructor will first ask if any input was provided for them.
|    If not: both are global objects which must be initialized within
|    'main.js', thus the constructor will then ask if anything exists by
|    their 'standard name' (i.e. 'gridMap' and 'pathFind' respectively).
|    Only if that fails will it assign one xor both to [null] (which is 
|    NOT good!) Ergo, this means that if you follow the standard names: 
|    all you need to pass in when creating a GridWalker instance is its
|    initial row, column, and body length! 
+-----------------------------------------------------------------------
|######## Zed Alert i.e. ZAC Concept/Code[base] © Steven Eiselen #######
+=====================================================================*/
class GridWalker{
  constructor(row,col,len,sp_map,pfd){
    //> Map/Pathfinder Refs (NOTE: Searches by 'Standard Names' first 
    this.map   = (sp_map) ? sp_map : (typeof gridMap !== 'undefined' && gridMap)  ? gridMap  : null;
    this.pFind = (pfd) ? pfd : (typeof pathFind !== 'undefined' && pathFind) ? pathFind : null;
    //> Transform Info
    this.pos = createVector(col*this.map.cellSize+(this.map.cellSize/2),row*this.map.cellSize+(this.map.cellSize/2));
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
    //> Map/Path [Current] State
    this.curPath    = [];
    this.curWaypt   = 0;
    this.curCoord   = null; // current map coordinate, as received by map as 'receipt' for updating its SP state
    this.curMoveTar = null; // current 'move-to' target (as P5.Vector) s.t. if not null: agent will move thereto 
    this.curLACell  = null; // current look-ahead cell - used to handle path interruptions and rerouting thereof
    //> For Preventing 'Insta-Spin' when new path starts behind agent
    this.numRots    = round(PI/this.maxForce)*2; // total # of frames to rotate
    this.curRots    = 0;     // counts number of rotations [towards target]
    this.isFacingMT = false; // 'is facing move-to target'
    //> State Flags/Toggles
    this.debugPrint  = false;
    this.isSelected  = false;
    this.isUsingSP   = false; // agent is utilizing the spatial partitioning system
    this.dispLACell  = false;
    this.dispCurPath = false;

    //> Loader Calls
    this.initGFXVals();
    if(this.isUsingSP){this.updateSP();} // say 'hello world' to SP and prime SP state
  } // Ends Constructor

  //####################################################################
  //>>> [RE]INIT AND LOADER FUNCTIONS
  //####################################################################
  initGFXVals(){
    //> For Agent Shape
    this.fill_agt = color(255); 
    this.strk_reg = color(0,0,255); 
    this.sWgt_reg = 1;
    this.strk_sel = color(0,255,0);
    this.sWgt_sel = 2;
    //> For Agent Path
    this.fill_path = color(255,64);
    this.strk_path = color(60,128);
    this.sWgt_path = 4;
    //> For Agent SP
    this.fill_LAC  = color(0,144,0,128);
  } // Ends Function initGFXVals



  //####################################################################
  //>>> UPDATE/ADVANCE/BEHAVIOR FUNCTIONS
  //####################################################################


  /*--------------------------------------------------------------------
  |>>> Function update
  +---------------------------------------------------------------------
  | Overview: TODO
  +-------------------------------------------------------------------*/
  update(){
    if(this.isUsingSP){this.updateSP(); this.handleReroute();}
    this.updatePathFollowState();
    this.moveToCurMoveTar_viaDesVelAndNewPos();
    //this.moveToCurMoveTar_viaVelAndDotProd();
  } // Ends Function update


  /*--------------------------------------------------------------------
  |>>> Function updateSP
  +---------------------------------------------------------------------
  | Overview: Calls <updatePos> upon grid map to update its existence 
  |           within the SP[Map] system (via map cell WRT its position)
  |           in return for being able to grab nearby agents which also
  |           report their existence thereto. Receiving its current map
  |           coordinate acts as a 'receipt' from the map indicating it
  |           been successfully updated; as I could [but am NOT] simply
  |           calling <posToCoord> thereof as to enforce this 'receipt'.
  +-------------------------------------------------------------------*/
  updateSP(){
    let newCoord = this.map.updatePos(this);
    if(newCoord != null){this.curCoord = newCoord;}    
  } // Ends Function updateSP 


  /*--------------------------------------------------------------------
  |>>> Function moveToCurMoveTar (Via DesVelAndNewPos XOR VelAndDotProd)
  +---------------------------------------------------------------------
  | Overview: There are currently two variants of the 'moveToCurMoveTar'
  |           function as I'm at an impasse over which one is the 'best'
  |           and would [desperately] prefer to move forward on wrapping
  |           up ZAC Gridwalker and the full unification than ponder on
  |           this orb into 2023 with no progress made like it's 2016 in
  |           the Processing-ZAC days. Stress test them when you get the
  |           chance; until then: simply call one XOR the other to KISS.
  +-------------------------------------------------------------------*/
  moveToCurMoveTar_viaDesVelAndNewPos(){
    if(this.curMoveTar){
      if(!this.isFacingMT){this.rotateToFaceMoveTar(); if(!this.isFacingMT){return;}}
      // Steering Agent Behavior [SEEK] in two lines, howaboutdat?!?
      let desVel = p5.Vector.sub(this.curMoveTar,this.pos).setMag(this.maxSpeed); // desired velocity
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

  moveToCurMoveTar_viaVelAndDotProd(){
    if(this.curMoveTar){
      let des = p5.Vector.sub(this.curMoveTar,this.pos).setMag(this.maxSpeed);
      let str = p5.Vector.sub(des,this.vel).limit(this.maxForce);
      this.vel.add(str).limit(this.maxSpeed);

      let newPos = p5.Vector.add(this.pos,this.vel); // this is the position i will be at upon effecting vel without clamping
      let vecT_0 = p5.Vector.sub(this.curMoveTar,this.pos); // get ori at t_0 (i.e. pre-update)
      let vecT_1 = p5.Vector.sub(this.curMoveTar,newPos);   // get ori at t_1 (i.e. on-update a.k.a. 'lookahead')

      if(p5.Vector.dot(vecT_0,vecT_1)<0){this.pos.set(this.curMoveTar); this.curMoveTar=null;}
      else{this.pos.set(newPos)};
    }
    else{
      this.vel.mult(0);
    }

    // update orientation WRT difference between it and current velocity
    if(this.vel.magSq()>0){this.ori.add(p5.Vector.sub(this.vel,this.ori).limit(this.maxForce));}
  } // Ends Function moveToCurMoveTar



  /*--------------------------------------------------------------------
  |>>> Function updatePathFollowState
  +---------------------------------------------------------------------
  | Overview: TODO
  +-------------------------------------------------------------------*/
  updatePathFollowState(){
    if(this.curWaypt<this.curPath.length){
      let newPos = p5.Vector.add(this.pos,this.vel);
      if(p5.Vector.dist(this.pos,newPos)>p5.Vector.dist(this.pos,this.curPath[this.curWaypt])){newPos.set(this.curPath[this.curWaypt]);}
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




  /*--------------------------------------------------------------------
  |>>> Function handleReroute
  +---------------------------------------------------------------------
  | Overview: This function realizes basic path-related collision and
  |           obstacle management for Gridwalker agents. There is a VERY
  |           detailed article on what this does and how it works in the
  |           ZAC Technical Notes OneNote. If you're NOT Steven Eiselen,
  |           and he does NOT have these Technical notes transcribed to
  |           either GHMD in ZAC's repo xor HTML on the ZAC Page within 
  |           the 'Research Projects' menu on the EISELEN GitHub site:
  |           then IOU that content - do email me a [friendly] reminder
  |           via <steven.eiselen@gmail.com> plz thx. If you are me (lol
  |           Total Recall 'i am yuu noh yuu ahh mee!'), then get up off
  |           your lazy, fat, ADHD / Anxiety / Blackpill-Doomer ravaged
  |           ass and get one of the two up, PRONTO!
  +---------------------------------------------------------------------
  |> Implementation Notes/NATs:
  |   o [Note 1]: For now, this function will be called on every frame;
  |     which will check-and-fail initial condition unless 'it's time'.
  +-------------------------------------------------------------------*/
  handleReroute(){
    //> if curLACell i.e. 'P_c+1' is not null and curLACell is [OCCUPIED] ==>
    if(this.curLACell != null && this.map.isCellOccupied(this.curLACell)){

      //> if (c+1 == curPath.length-1) i.e. path ends at 'P_c+1' ==> remove P_c+1, then return ∎
      if(this.curWaypt+2 == this.curPath.length){
        this.curPath.pop(); 
        if(this.debugPrint){console.log("CASE: P_c+1 ENDS PATH => POP P_c+1");}
        return;
      }

      //> else ==> find the first path cell whose SP status is [VACANT], starting from P_c+2 (i.e. find 'P_v')
      let cellV_idx = -1;
      for (let i=this.curWaypt+1; i<this.curPath.length; i++) {
        if(this.map.isCellVacant(this.map.posToCoord(this.curPath[i]))){
          cellV_idx=i; 
          break;
        }
      }

      //> if there are NO [VACANT] successor path cells ==> remove P_(c+1,n), then return ∎
      if(cellV_idx==-1){
        this.curPath.splice(this.curWaypt+1); 
        if(this.debugPrint){console.log("CASE: NO VACANT P_v => POP P_C+1,n");}
        return;
      }

      //> get the path from P_c to P_v; which will encompass the new: (P_c,⋯,P_v]
      let pathCell_c  = this.map.posToCoord(this.curPath[this.curWaypt]);
      let pathCell_v  = this.map.posToCoord(this.curPath[cellV_idx]);
      let pathReRoute = this.pFind.findPath(pathCell_c,pathCell_v,true);

      //> get the path from P_v to P_n, then shift; which will encompass: [P_v+1,⋯,P_n]
      let pathRemain  = this.curPath.splice(cellV_idx);
      pathRemain.shift();

      //> concat (P_c,⋯,P_v] with [P_v+1,⋯,P_n], then [P_c] with (P_c,⋯,P_n]; encompassing: [P_c,⋯,P_n];
      this.curPath = [this.curPath[this.curWaypt].copy()].concat(pathReRoute.concat(pathRemain));

      //> and of course these need to be reset; though I think 'insta-spin' handling does NOT
      this.curWaypt = 0;      
      this.setLookaheadCell();

      if(this.debugPrint){console.log(this.curWaypt + " | " + this.curPath.length + " | Frame# : " + frameCount);}
    }
  } // Ends Function handleReroute





  //####################################################################
  //>>> SETTER FUNCTIONS
  //####################################################################

  /*--------------------------------------------------------------------
  |>>> Function setToUsingSP
  +---------------------------------------------------------------------
  | Overview: Self-Explanatory, sans the following context... For now, 
  |           Gridwalker will have 'isUsingSP' set to [false] to prevent
  |           issues with other projects it's [now] used in which don't
  |           utilize SP. On the plus side: it returns the instance for
  |           function chaining, as to conveniently make call within the
  |           same expression as the instantiation.
  +-------------------------------------------------------------------*/
  setToUsingSP(){
    this.isUsingSP=true;
    return this; // for function chaining
  } // Ends Function setToUsingSP



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
  | Overview: Self Expanatory, sans call to <setLookaheadCell>, which is
  |           used (iff agent is using SP system) to check next cell on
  |           current path to determine if re-route needs to be handled.
  +-------------------------------------------------------------------*/
  setCurTarToNextPathWaypt(){
    this.curMoveTar = (this.curWaypt<this.curPath.length) ? this.curPath[this.curWaypt] : null;
    if(this.isUsingSP){this.setLookaheadCell();}  
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


  /*--------------------------------------------------------------------
  |>>> Function setLookaheadCell
  +---------------------------------------------------------------------
  | Overview: TODO
  +-------------------------------------------------------------------*/
  setLookaheadCell(){
    this.curLACell = (this.curWaypt+1 < this.curPath.length) ? this.map.posToCoord(this.curPath[this.curWaypt+1]) : null;
    //if(this.curWaypt+1 < this.curPath.length){this.curLACell = this.map.posToCoord(this.curPath[this.curWaypt+1]);}
    //else{this.curLACell = null;}
  } // Ends Function setLookaheadCell




  //####################################################################
  //>>> GETTER FUNCTIONS
  //####################################################################
  
  inSameCellAsMe(othCell){
    let myCell = this.map.posToCoord(this.pos);
    return othCell[0]==myCell[0]&&othCell[1]==myCell[1];
  }


  //##################################################################
  //>>> RENDER FUNCTIONS
  //##################################################################
  
  render(){
    this.renderBody();
    this.renderCurPath();
    this.renderLACell();
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
    fill(this.fill_agt);
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
      stroke(this.fill_path); strokeWeight(this.sWgt_path);
      line(this.curPath[i].x,this.curPath[i].y,this.curPath[(i+1)%pLen].x,this.curPath[(i+1)%pLen].y);      
    }
  } // Ends Function renderCurPath


  /*--------------------------------------------------------------------
  |>>> Function renderLACell
  +---------------------------------------------------------------------
  | Overview: Renders lookahead cell, though intended for debug purposes
  |           only. Keeping it accordingly in case it's still needed.
  +-------------------------------------------------------------------*/
  renderLACell(){
    if(this.dispLACell && this.curLACell){
      let posLA = this.map.getCellTLPos(this.curLACell);
      fill(this.fill_LAC); noStroke();
      rect(posLA.x,posLA.y,cellSize,cellSize);
    }    
  } // Ends Function renderLACell

} // Ends Class Gridwalker