
// Note 01: Color agent gets is WRT its ID, else 'cyan' assigned as ERROR default!
// Note 02: Colormap Source: colorbrewer2.org/#type=qualitative&scheme=Set1&n=8
var AgentColors = {
  colors: [[0,255,255],[48,120,216],[228,120,0],[255,255, 51],[255,120,255]],
  get: function(ID){return (ID>0 && ID<this.colors.length) ? this.colors[ID] : this.colors[0];}
} // Ends 'Struct' AgentColors

// "E"-> Error Default | "1"-> CCW rect | "2"-> CW rect | "3"-> TL/BR diagonal | "4"-> interesting bendy course
var AgentPaths = {
  "E" : [[1,1],[2,2]],
  "1" : [[1,23],[1,22],[1,21],[1,20],[1,19],[1,18],[1,17],[1,16],[1,15],[1,14],[1,13],[1,13],[2,13],[3,13],[4,13],[5,13],[6,13],[7,13],[8,13],[9,13],[10,13],[11,13],[12,13],[13,13],[14,13],[15,13],[16,13],[17,13],[18,13],[19,13],[20,13],[21,13],[21,14],[21,15],[21,16],[21,17],[21,18],[21,19],[21,20],[21,21],[21,22],[21,23],[20,23],[19,23],[18,23],[17,23],[16,23],[15,23],[14,23],[13,23],[12,23],[11,23],[10,23],[9,23],[8,23],[7,23],[6,23],[5,23],[4,23],[3,23],[2,23]],
  "2" : [[3,1],[3,2],[3,3],[3,4],[3,5],[3,6],[3,7],[3,8],[3,9],[3,10],[3,11],[3,12],[3,13],[3,14],[3,15],[3,16],[3,17],[3,18],[3,19],[3,20],[3,21],[4,21],[5,21],[6,21],[7,21],[8,21],[9,21],[10,21],[11,21],[12,21],[13,21],[14,21],[15,21],[16,21],[17,21],[18,21],[19,21],[20,21],[21,21],[22,21],[23,21],[23,20],[23,19],[23,18],[23,17],[23,16],[23,15],[23,14],[23,13],[23,12],[23,11],[23,10],[23,9],[23,8],[23,7],[23,6],[23,5],[23,4],[23,3],[23,2],[23,1],[22,1],[21,1],[20,1],[19,1],[18,1],[17,1],[16,1],[15,1],[14,1],[13,1],[12,1],[11,1],[10,1],[9,1],[8,1],[7,1],[6,1],[5,1],[4,1]],
  "3" : [[23,23],[22,22],[21,21],[20,20],[19,19],[18,18],[17,17],[16,16],[15,15],[14,14],[13,13],[12,12],[11,11],[10,10],[9,9],[8,8],[7,7],[6,6],[5,5],[4,4],[3,3],[2,2],[1,1],[2,2],[3,3],[4,4],[5,5],[6,6],[7,7],[8,8],[9,9],[10,10],[11,11],[12,12],[13,13],[14,14],[15,15],[16,16],[17,17],[18,18],[19,19],[20,20],[21,21],[22,22]],
  "4" : [[19,19],[18,19],[17,19],[16,19],[15,19],[14,19],[13,19],[12,19],[11,19],[10,19],[9,19],[8,19],[7,19],[6,19],[5,19],[5,18],[5,17],[5,16],[5,15],[5,14],[5,13],[5,12],[5,11],[5,10],[5,9],[5,8],[5,7],[5,6],[5,5],[5,4],[5,3],[6,3],[7,3],[8,3],[9,3],[10,3],[11,3],[12,3],[13,3],[14,3],[15,3],[16,3],[17,3],[18,3],[19,3],[20,3],[21,3],[21,4],[21,5],[21,6],[21,7],[21,8],[21,9],[21,10],[21,11],[20,11],[19,11],[19,10],[19,9],[19,8],[19,7],[19,6],[19,5],[18,5],[17,5],[17,6],[17,7],[17,8],[17,9],[17,10],[17,11],[16,11],[15,11],[15,10],[15,9],[15,8],[15,7],[15,6],[15,5],[14,5],[13,5],[13,6],[13,7],[13,8],[13,9],[13,10],[13,11],[13,12],[13,13],[13,14],[13,15],[14,15],[15,15],[16,15],[17,15],[18,15],[19,15],[19,16],[19,17],[19,18]],
  getPntPath : function(ID){
    let cellPath = this.getCellPath(ID);
    let mptPath = [];
    cellPath.forEach((c)=>mptPath.push(demoMap.coordToPos(c)));
    return mptPath;
  },
  getCellPath : function(ID){
    return (ID in this) ? this[ID] : this.E;
  }
};


/*----------------------------------------------------------------------
|>>> Class WayptAgent
+-----------------------------------------------------------------------
| Description: Simple Waypoint Agent derived from that of TD-P5JS. Its
|              [reduced] purpose is to simply run around in a pre-set
|              loop/path and leave its scent within every cell visited,
|              exactly ONCE during its visit. This will likely be at the
|              'at-midpoint' event (wherein it sets its goal to the next
|              cell on its path).
*=====================================================================*/
class WayptAgent{
  constructor(ID,row,col,map){
    this.ID  = ID;
    this.map = map;
    this.pos = vec2(col*map.cellSize+(map.cellSize/2),row*map.cellSize+(map.cellSize/2));
    this.vel = vec2(0,0);
    this.ori = vec2(1,0);

    this.maxSpeed = 3.0; // Using fixed val of [3.0] via TD-P5JS as no need for variability
    this.maxForce = this.maxSpeed/10; // relates to turn speed, and good heuristic via TD-P5JS
    this.bodyLen  = 24; // Using fixed val of [24] via TD-P5JS as no need for variability
    this.bodyLenH = this.bodyLen/2;

    this.leftScent = false; // 'dirty bit' used to ensure scent dropped only ONCE per cell visit!

    this.initColorPallete();
    this.setupWayptPath();
  } // Ends Constructor

  //##################################################################
  //>>> LOADER AND INIT FUNCTIONS
  //##################################################################

  initColorPallete(){
    //> for agent body
    this.body_fill = color(AgentColors.get(this.ID));
    this.body_strk = color(60);
    this.body_sWgt = 2;
    //> for agent path
    this.path_fill = color(AgentColors.get(this.ID));
    this.path_strk = color(60);
    this.path_sWgt = 4;
    this.path_fill.setAlpha(128);
    this.path_strk.setAlpha(128);
  } // Ends Function initColorPallete

  setupWayptPath(){
    this.curWaypt = 0;
    this.cellPath = AgentPaths.getCellPath(this.ID); // getting both to make map notif. easier
    this.curPath  = AgentPaths.getPntPath(this.ID);
  } // Ends Function setupWayptPath

  //##################################################################
  //>>> UPDATE, ACTION, AND EVENT FUNCTIONS
  //###################################################################
  update(){
    this.gotoPath();
  } // Ends Function update

  gotoPath(){
    if(this.curWaypt<this.curPath.length){

      // Calculate 'proposed' next move 
      let des = p5.Vector.sub(this.curPath[this.curWaypt],this.pos);
      des.setMag(this.maxSpeed);
      let newPos = p5.Vector.add(this.pos,des);

      // Determine orientation given desired velocity and current ori
      let oriDelta = p5.Vector.sub(des,this.ori);
      oriDelta.limit(this.maxForce);
      this.ori.add(oriDelta);

      // Clamp position if overshoots waypoint (large velocities unhandled! <= BUT I HAVE SOLUTION IF NEEDED)
      if(p5.Vector.dist(this.pos,newPos) > p5.Vector.dist(this.pos,this.curPath[this.curWaypt]) ){
        newPos = this.curPath[this.curWaypt];
      }

      // At current waypoint (exactly xor clamped overshoot, and also means I never 'lose a frame' of movement)
      if(p5.Vector.dist(this.pos,newPos) == p5.Vector.dist(this.pos,this.curPath[this.curWaypt]) ){ 
        this.map.updatePos(this.cellPath[this.curWaypt],this.cellPath[(this.curWaypt+1)%this.curPath.length]);
        this.curWaypt++;
      }
      this.pos = newPos;
    }
    else{
      this.curWaypt = 0;
    }
  } // Ends Function gotoPath

  //##################################################################
  //>>> RENDER FUNCTIONS
  //##################################################################
  render(){this.renderBody();} // redundant? yes. keep it anyway? yes.

  renderBody(){
    let theta = this.ori.heading()+(PI/2);

    fill(this.body_fill); stroke(this.body_strk); strokeWeight(this.body_sWgt);

    push();
      translate(this.pos.x,this.pos.y);
      rotate(theta);
      // Triangle Chevron body representation
      beginShape();
      vertex(0,-this.bodyLen);              // Head
      vertex(-this.bodyLenH,this.bodyLenH); // Starboard
      vertex(this.bodyLenH,this.bodyLenH);  // Port
      endShape(CLOSE);
    pop();   
  } // Ends Function renderBody

  // Disgustingly inefficient, I know. But KISS, and this is only for a demo, so also YOLO. 
  renderPath(){
    let pLen = this.curPath.length;
    for (let i=0; i<pLen; i++) {
      stroke(this.path_fill); strokeWeight(this.path_sWgt);
      line(this.curPath[i].x,this.curPath[i].y,this.curPath[(i+1)%pLen].x,this.curPath[(i+1)%pLen].y);      
    }
  }
} // Ends Class WayptAgent


/*>>> ORIG 'SIMPLIFIED PATHS' DEFS BACKUP:
  "1" : [[1,23], [1,13], [21,13], [21,23]],
  "2" : [[3,1], [3,21], [23,21], [23,1]],
  "3" : [[23,23], [1,1]],
  "4" : [[19,19], [5,19], [5,3], [21,3], [21,11], [19,11], [19,5], [17,5], [17,11], [15,11], [15,5], [13,5], [13,15], [19,15]],
<<<*/