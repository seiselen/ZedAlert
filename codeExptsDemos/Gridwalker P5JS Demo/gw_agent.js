class GWAgent{
  //####################################################################
  //>>> LOADER/[RE]INIT FUNCTIONS
  //####################################################################  
  constructor(r,c,m){
    this.pos = createVector(c*cellSize+(cellSize/2),r*cellSize+(cellSize/2));
    this.vel = createVector(0,0);
    this.ori = createVector(0,0);
    this.map = m;
    this.bodyLength = cellSize/2;
    this.bodyLnHalf = this.bodyLength/2;
    this.curPath    = [];
    this.curMoveTar = null;
    this.curWaypt   = 0;
    this.lookaheadC = null;
    this.maxSpeed   = 2;
    this.maxForce   = 0.8; // low->'aircraft' | high->'tank'
    this.isSelected = false;

    this.initGFXVals();
    this.updateSP();
  } // Ends Constructor

  initGFXVals(){
    this.fill_reg = color(255)
    this.strk_reg = color(60);
    this.swgt_reg = 1;
    this.strk_sel = color(0,0,255);
    this.swgt_sel = 4;
  } // Ends Function initGFXVals 


  //####################################################################
  //>>> UPDATE/ADVANCE FUNCTIONS
  //####################################################################
  update(){
    this.updateSP();
    this.handleReroute();
    this.walkCurPath();
    this.moveToCurTar();
  } // Ends Function update 

  updateSP(){
    let newCoord = this.map.updatePos(this);
    if(newCoord != null){this.curCoord = newCoord;}    
  } // Ends Function updateSP 



  seekCurTar(){
    // Shiffman PERFECT Desc: "The agent desires to move towards the target at maximum speed"
    var des = p5.Vector.sub(this.curMoveTar,this.pos).setMag(this.maxSpeed);
    // Desc: "Difference between current and desired velocity, factored by max [turn] force (s.t. [low]->[aircraft] and [high]->[tank])"
    var steer = p5.Vector.sub(des,this.vel).limit(this.maxForce); 
    return steer;
  } // Ends Behavior seek


  moveToCurTar(){
    if(this.curMoveTar){
      this.vel.add(this.seekCurTar());
      this.vel.limit(this.maxSpeed);

      let newPos = p5.Vector.add(this.pos,this.vel); // this is the position i will be at upon effecting vel without clamping
      let vecT_0 = p5.Vector.sub(this.curMoveTar,this.pos); // get ori at t_0 (i.e. pre-update)
      let vecT_1 = p5.Vector.sub(this.curMoveTar,newPos);   // get ori at t_1 (i.e. on-update a.k.a. 'lookahead')

      if(p5.Vector.dot(vecT_0,vecT_1)<0){this.pos.set(this.curMoveTar); this.curMoveTar=null;}
      else{this.pos.set(newPos)};
    }
    else{
      this.vel.mult(0);
    }

    if(this.vel.magSq()>0){
      var oriDelta = p5.Vector.sub(this.vel,this.ori);
      oriDelta.limit(this.maxForce);
      this.ori.add(oriDelta);
    }

  } // Ends Function moveToCurTar


  walkCurPath(){
    if(this.curWaypt<this.curPath.length){
      // At (or within 1/2 pixel of) current path waypoint
      if(p5.Vector.dist(this.pos,this.curPath[this.curWaypt])<=0.5){
        this.curWaypt++;
        this.setCurTarToNextPathWaypt();
      }
    }
  } // Ends Function walkCurPath 


  // DEPRECATED (BUT keeping around awhile more - despite preservation via repo verz ctrl)
  gotoPath(){
    if(this.curWaypt<this.curPath.length){
      // Calculate 'proposed' next move 
      var des = p5.Vector.sub(this.curPath[this.curWaypt],this.pos);
      des.setMag(this.maxSpeed);
      var newPos = p5.Vector.add(this.pos,des);
      // Set orientation (WRT desired delta ori)
      var oriDelta = p5.Vector.sub(des,this.ori);
      oriDelta.limit(this.maxForce);
      this.ori.add(oriDelta);
      // Clamp if it overshoots the waypoint
      if(p5.Vector.dist(this.pos,newPos) > p5.Vector.dist(this.pos,this.curPath[this.curWaypt]) ){newPos = this.curPath[this.curWaypt];}
      // At current waypoint (exactly xor clamped overshoot, and also means I never 'lose a frame' of movement)
      if(p5.Vector.dist(this.pos,newPos) == p5.Vector.dist(this.pos,this.curPath[this.curWaypt]) ){this.curWaypt++;}
      this.pos = newPos;
    }
  }

  //####################################################################
  //>>> SETTER FUNCTIONS
  //####################################################################
  givePath(path){
    this.curWaypt = 0;
    this.curPath = path;
    // Intuition: Receiving path immediately 'awakens' curMoveTar to first waypt
    this.setCurTarToNextPathWaypt();
  }

  setCurTarToNextPathWaypt(){
    this.curMoveTar = (this.curWaypt<this.curPath.length) ? this.curPath[this.curWaypt] : null;
    this.setLookaheadCell();
  }

  setLookaheadCell(){
    //this.lookaheadC = (this.curWaypt+1 < this.curPath.length) ? this.map.cellViaPos(this.curPath[this.curWaypt+1]) : null;

    if(this.curWaypt+1 < this.curPath.length){

      this.lookaheadC = this.map.cellViaPos(this.curPath[this.curWaypt+1]);

      //console.log(this.curWaypt+" | "+this.curPath.length+" | "+this.lookaheadC);
    }
    else{
      this.lookaheadC = null;
    }


  }

  // NOTE 1: For now, will be called every frame (as to fail the initial condition unless "it's time")
  // NOTE 2: Calls global pathfind obj (TODO: Cache it vis-a-vis map?) 
  handleReroute(){
    //> if lookaheadC i.e. 'P_c+1' is not null and lookaheadC is [OCCUPIED] ==>
    if(this.lookaheadC != null && this.map.isCellOccupied(this.lookaheadC)){

      //> if (c+1 == curPath.length-1) i.e. path ends at 'P_c+1' ==> remove P_c+1, then return ∎
      if(this.curWaypt+2 == this.curPath.length){this.curPath.pop(); console.log("CASE: P_c+1 ENDS PATH => POP P_c+1"); return;}

      //> else ==>
      //> find the first path cell whose SP status is [VACANT], starting from P_c+2 (i.e. find 'P_v')
      let cellV_idx = -1; let pTemp = null;
      for (let i = this.curWaypt+1; i<this.curPath.length; i++) {
        pTemp = this.map.cellViaPos(this.curPath[i]);
        if(this.map.isCellVacant(pTemp)){
          cellV_idx=i;
          break;
        }
      }

      //> if there are NO [VACANT] successor path cells ==> remove P_(c+1,n), then return ∎
      if(cellV_idx==-1){this.curPath.splice(this.curWaypt+1); console.log("CASE: NO VACANT P_v => POP P_C+1,n"); return;}

      //> get the path from P_c to P_v; which will encompass the new: (P_c,⋯,P_v]
      let pathCell_c  = this.map.cellViaPos(this.curPath[this.curWaypt]);
      let pathCell_v  = this.map.cellViaPos(this.curPath[cellV_idx]);
      let pathReRoute = pathfind.findPath(pathCell_c,pathCell_v,32);

      //> get the path from P_v to P_n, then shift; which will encompass: [P_v+1,⋯,P_n]
      let pathRemain  = this.curPath.splice(cellV_idx);
      pathRemain.shift();

      //> concat (P_c,⋯,P_v] with [P_v+1,⋯,P_n], then [P_c] with (P_c,⋯,P_n]; encompassing: [P_c,⋯,P_n];
      this.curPath = [this.curPath[this.curWaypt].copy()].concat(pathReRoute.concat(pathRemain));
      this.curWaypt = 0;
      this.setLookaheadCell();

      //console.log(this.curWaypt + " | " + this.curPath.length + " | Frame# : " + frameCount);
    }
  } // Ends Function handleReroute


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

  //####################################################################
  //>>> RENDER FUNCTIONS
  //####################################################################
  render(){
    this.renderAgentShape();
    this.renderLACell();
  } // Ends Function render

  renderAgentShape(){
    fill(this.fill_reg);
    if(this.isSelected){stroke(this.strk_sel); strokeWeight(this.swgt_sel);}
    else{               stroke(this.strk_reg); strokeWeight(this.swgt_reg);}

    push();
      translate(this.pos.x,this.pos.y);
      rotate(this.ori.heading()+(PI/2));
      // Triangle body representation
      beginShape();
      vertex(0,-this.bodyLength);             // Head
      vertex(-this.bodyLnHalf,this.bodyLnHalf); // Starboard
      vertex(this.bodyLnHalf,this.bodyLnHalf);  // Port
      endShape(CLOSE);
    pop();

    if(this.lookaheadC){
      let posLA = this.map.getCellTLPos(this.lookaheadC);
      fill(0,144,0,128); noStroke();
      rect(posLA.x,posLA.y,cellSize,cellSize);
    }
  } // Ends Function renderAgentShape

  renderLACell(){
    if(this.lookaheadC){
      let posLA = this.map.getCellTLPos(this.lookaheadC);
      fill(0,144,0,128); noStroke();
      rect(posLA.x,posLA.y,cellSize,cellSize);
    }    
  } // Ends Function renderLACell

} // Ends Class GWAgent