var demoMap;
var curBaseDam  = 64;
var curBlastRad = 128;
var curDecayFac = 0.01;

function setup(){
  createCanvas(800,800).parent("viz");
  ellipseMode(CENTER);
  demoMap = new SplashMap(40,40,20);
}

function draw(){
  //>>> UI/UX METHODS
  keyDown();

  //>>> RENDER METHODS
  background(240);
  demoMap.render();
  drawBlastRad();
  drawCurParms();
  drawFPS();
  drawCanvasBorder();
}

function mousePressed(){
  if(!mouseInCanvas()){return;}
  switch(mouseButton){
    case LEFT:   demoMap.makeASplash(demoMap.posToMidpt(mousePtToVec()), curBaseDam, curBlastRad, curDecayFac); return;
    case CENTER: demoMap.resetCellVals(); return;
}}

//######################################################################
//>>> UI/UX METHODS IN-LIEU-OF DOM-UI 
//    (i.e. <vs> a HTML sidepanel containing buttons/sliders/etc.)
//######################################################################
var mouseWheelMode = 'r'; // s.t.: [r]=> blast radius [d]=> base damage

function keyDown(frmIntv=2){
  if(frameCount%frmIntv!=0){return;}
  if(keyIsPressed){switch(keyCode){case LEFT_ARROW: curBaseDam--; return; case RIGHT_ARROW: curBaseDam++; return; case UP_ARROW: curBlastRad++; return; case DOWN_ARROW: curBlastRad--; return;}}
} // Ends Function keyDown

function keyPressed(){
  if(key=='R'||key=='r'){mouseWheelMode='r';} if(key=='D'||key=='d'){mouseWheelMode='d';}  
} // Ends Function keyPressed

function mouseWheel(event){
  let deltaVal = Math.sign(event.delta)*((keyIsPressed===true && keyCode === SHIFT) ? 8 : 2);
  switch(mouseWheelMode){case 'r': curBlastRad-=deltaVal; return; case 'd': curBaseDam-=deltaVal; return;}
} // Ends Function mouseWheel

//######################################################################
//>>> OTHER / 'UNIQUE-TO-THIS-PROJECT' FUNCTIONS
//######################################################################
function drawBlastRad(){
  let mMpt = demoMap.posToMidpt(mousePtToVec());
  noFill(); stroke(244,60,0); strokeWeight(2);
  ellipse(mMpt.x,mMpt.y,curBlastRad*2);
}

function drawCurParms(){
  noStroke(); fill(0,128); rect(0,0,256,96); 
  textSize(24); textAlign(LEFT,TOP); strokeWeight(4); stroke(0,180); fill(255); textStyle(BOLD); textFont('monospace');
  text("Blast Radius: "+curBlastRad, 8,4);
  text("Base Damage:  "+curBaseDam, 8,36);
  text("Decay Factor: "+curDecayFac, 8,68);
  textStyle(NORMAL); textFont('sans-serif'); // QAD resets for 'drawFPS' as it uses standard font
}

var colMap = [[228,0,24],[255,160,36],[255,255,255]];
function linMapCol(val){
  let vKey = val/(100/(colMap.length-1)); //=> key of pct from which to 'colerp'
  let idxL = floor(vKey); //=> index of left color on raw map
  let idxR = ceil(vKey); //=> index of right color on raw map
  let lPct = vKey-floor(vKey); //=> % by which to lerp between L and R colors
  return lerpColor(color(colMap[idxL]), color(colMap[idxR]), lPct);
}