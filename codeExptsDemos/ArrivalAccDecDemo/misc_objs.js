/*======================================================================
|>>> Class SATarget
+=====================================================================*/
class SATarget{
  constructor(x,y,rBody,rDisk){
    this.pos  = vec2(x,y);
    this.radB = rBody;
    this.radD = rDisk;
    this.body = new NGon(x,y,rBody);
    this.disk = new NGon(x,y,rDisk).setContour(4);    
    this.fill = color(240,180,0);
    this.strk = color(60,128);
    this.sWgt = 2;
  }

  updatePos(pos){
    this.pos=pos;
    //> ugly-as-shit but it works and this should be a human (me) UI call only
    this.body.setPos(pos);
    this.disk.setPos(pos);
  }

  updateDiskRadius(rad){
    this.disk.setRadius(rad);
  }

  render(){
    fill(this.fill); stroke(this.strk); strokeWeight(this.sWgt); 
    this.body.render(true);
    this.disk.render(true);
  }
} // Ends Class SATarget


/*======================================================================
|>>> Class NGon                 (NOTE: IMPROVED -VS- ONE FROM GEAR GEN!)
+=====================================================================*/
class NGon{
  constructor(x,y,r,s=32){
    this.pos    = vec2(x,y);
    this.rad    = r;
    this.nSides = s;
    this.verts  = [];
    this.fill   = color(240,180,0);
    this.strk   = color(60,128);
    this.sWgt   = 2;
    this.initNgon();
  }

  initNgon(){
    var rdnItv = (PI*2)/this.nSides;
    for (var i=1; i<=this.nSides; i++){this.verts.push(vec2(cos(rdnItv*i),sin(rdnItv*i)));}
    this.vertsRev=this.verts.slice().reverse(); // reversed copy for contour drawing
  }

  setPos(pos){this.pos=pos;}
  setRadius(r){this.rad = r; if(this.con){this.setContour(this.con);}}
  setContour(c){this.con = c; this.conRad = this.rad-this.con; return this;}

  render(extStyle=false){
    if(!extStyle){fill(this.fill); stroke(this.strk); strokeWeight(this.sWgt);}
    push(); translate(this.pos.x,this.pos.y); beginShape();
    this.verts.forEach((v)=>vertex(this.rad*v.x, this.rad*v.y));
    if(this.con>0){beginContour(); this.vertsRev.forEach((v)=>vertex(this.conRad*v.x, this.conRad*v.y)); endContour();}
    endShape(CLOSE); pop();
  }
} // Ends Class NGon