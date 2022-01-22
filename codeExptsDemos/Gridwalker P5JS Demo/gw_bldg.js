
// QAD Pre-Condition: MUST CHECK that ALL containing cells are [VACANT] BEFORE instantiating!
class Building{
  constructor(r,c,d,m){
    this.pos   = createVector(c*cellSize,r*cellSize);
    this.dim   = createVector(d[0]*cellSize, d[1]*cellSize);
    this.cells = this.dimToCells(r,c,d[0],d[1]);
    this.map   = m;

    this.map.postBuilding(this); // let SPMap know that I exist
  }

  dimToCells(ri,ci,w,t){
    let ret = [];
    for(let r=0; r<t; r++){
      for(let c=0; c<w; c++){
        ret.push([ri+r,ci+c]);
      }    
    }
    return ret;
  }

  render(){
    Building.renderBldgShape(this.pos);
  }

  static renderBldgShape(pos){
    push(); translate(pos.x,pos.y);
      stroke(0);
      //> Walls (ordering:{left,back,right,front})
      strokeWeight(1); fill(0,144,144); quad(0,0,16,8,16,80,0,96); quad(0,0,96,0,80,8,16,8); quad(80,8,96,0,96,96,80,80); quad(16,80,80,80,96,96,0,96);
      //> Garage Door
      fill(180); strokeWeight(1); rect(32,80,32,16); line(32,84,64,84); line(32,88,64,88); line(32,92,64,92);
      //> Roof
      fill(60); strokeWeight(2); rect(16,8,64,72);
      //> 'Bib'
      fill(120,120,120); noStroke(); rect(0,96,96,16); quad(0,112,96,112,64,128,32,128);
    pop();    
  }
} // Ends Class Building