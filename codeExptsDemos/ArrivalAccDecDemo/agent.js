class SteeringAgent{
  static minSpeed = 1;
  static maxSpeed = 8;
  static minForce = 0.01;
  static maxForce = 0.50;
  static minSlowD = 64;
  static maxSlowD = 256;

  constructor(x,y){
    this.pos = vec2(x,y);
    this.vel = vec2();
    this.ori = vec2(1,0);
    this.acc = vec2();

    this.bodyLen  = 32;
    this.bodyLenH = this.bodyLen/2;
    this.bodyLen6 = this.bodyLen/6; // needed to offset shape to triangle midpt

    this.maxSpeed = 5;
    this.maxForce = 0.15;
    this.slowDist = SteeringAgent.minSlowD;

    this.initColorPallete();
  }

  initColorPallete(){
    this.fill_agent = color(255);
    this.strk_agent = color(60);
    this.sWgt_agent = 2;
  }


  //##################################################################
  //>>> STEERING AGENT FUNCTIONS
  //##################################################################
  update(){
    this.vel.add(this.acc);
    this.vel.limit(this.maxSpeed);
    this.pos.add(this.vel);
    this.acc.mult(0);
    this.pointAtVel();
  };

  applyForce(force){
    this.acc.add(force);
  };

  arrive(t){ 
    let des = p5.Vector.sub(t,this.pos);
    let dist = des.mag();
    let speed = this.maxSpeed;   
    if(dist<this.slowDist){speed=map(dist,0,this.slowDist,0,this.maxSpeed);} // if within range, slow down as d decreases
    des.setMag(speed);
    let steer = p5.Vector.sub(des,this.vel); 
    steer.limit(this.maxForce);     
    this.applyForce(steer);
  } // Ends Behavior arrive


  halt(){
    var targetEst = createVector(this.pos.x,this.pos.y); // copy target position to new vector
    //targetEst.add(this.vel);
    this.arrive(targetEst);
  }



  //##################################################################
  //>>> GENERAL UTIL FUNCTIONS (incl. [TEMP] debug/tester)
  //##################################################################
  posVecToString(decR=4,decL=2){return '('+nf(this.pos.x,decL,decR)+','+nf(this.pos.y,decL,decR)+')';}
  velValToString(decR=4,decL=2){let val=this.vel.mag(); return (val==0) ? "0" : (val<0.0001) ? "~0" : nf(val, 2, 4);}

  // analogous to Unity's 'lookTowards', and keeping as it's a swell util!
  pointAtMouse(){this.ori.set(mousePtToVec().sub(this.pos).normalize());}
  pointAtVector(vec){this.ori.set(vec.copy().sub(this.pos).normalize());return this;}
  pointAtVel(){this.ori.set(this.vel.copy().normalize());}


  //##################################################################
  //>>> RENDER FUNCTIONS
  //##################################################################
  render(){
    fill(this.fill_agent); stroke(this.strk_agent); strokeWeight(this.sWgt_agent);
    push();
      translate(this.pos.x,this.pos.y);
      rotate(this.ori.heading());

      translate(this.bodyLen6,0);
      beginShape();

      //vertex(0,-this.bodyLenH);vertex(-this.bodyLenH,this.bodyLenH);vertex(this.bodyLenH,this.bodyLenH);
      vertex(this.bodyLenH,0);
      vertex(-this.bodyLenH,-this.bodyLenH);
      vertex(-this.bodyLen6,0);
      vertex(-this.bodyLenH,this.bodyLenH);

      endShape(CLOSE);
    pop();   
  } // Ends Function render  




}