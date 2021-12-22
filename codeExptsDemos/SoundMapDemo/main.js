


var demoMap;
var curSoundRad = 87;
var soundAddVal = 80; // current score added to cell when it hears sound

function setup(){
  createCanvas(800,800).parent("viz");
  ellipseMode(CENTER);
  demoMap = new SoundMap(40,40,20);
}

function draw(){
  background(240);

  autoToot();

  demoMap.update();

  demoMap.render();

  drawRadDiscWRTMouse();

  drawCurSoundRad();

  drawFPS();
  drawCanvasBorder();
}

function mousePressed(){
  demoMap.makeASound(mousePtToVec(),curSoundRad);
}

function mouseWheel(event) {
  let cofactor = ((keyIsPressed===true && keyCode === SHIFT) ? 8 : 2);
  curSoundRad-=Math.sign(event.delta)*cofactor; // subtract effects inverted wheel
}


//######################################################################
//>>> OTHER / 'UNIQUE-TO-THIS-PROJECT' FUNCTIONS
//######################################################################
function drawRadDiscWRTMouse(){
  let pos = demoMap.posToMidpt(mousePtToVec());
  noFill(); stroke(244,60,0); strokeWeight(2);
  ellipse(pos.x,pos.y,curSoundRad*2);
}

function drawCurSoundRad(){
  noStroke(); fill(0,128); rect(0,0,300,40);
  textSize(32); textAlign(LEFT,CENTER); strokeWeight(2); stroke(0); fill(255); text("Sound Radius: "+curSoundRad, 8,22);
}

function autoToot(frmIntvl=30, minSRad=50, maxSRad=240){
  if(frameCount%frmIntvl==0){demoMap.makeASound(vec2(random(0,width),random(0,height)),random(minSRad,maxSRad));}  
}