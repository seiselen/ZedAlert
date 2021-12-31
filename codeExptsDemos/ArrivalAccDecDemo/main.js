//var unitCircleDegRad;
//function preload() {unitCircleDegRad = loadImage('assets/unitCircleDegRad.png');}

var simIsLive = false;
var initAgentPos = null;
var initTargtPos = null;
var halfDistAgTg = null;

var ColorMap = {
  // Now THIS is a NIFTY way to 'setup setting up some globab dict' whose contents are/include p5js dependencies!
  init : function(){
    this.strk_agtPath = color(0,180,36);
  }
}

var agent;
var target;
function setup(){
  createCanvas(1024,512).parent("pane_viz");
  ColorMap.init();
  //imageMode(CENTER);
  ellipseMode(CENTER);
  initAgentPos = vec2(64,height/2);
  initTargtPos = vec2(width-64, height/2);
  halfDistAgTg = p5.Vector.lerp(initAgentPos, initTargtPos, 0.5);

  agent = new SteeringAgent(initAgentPos.x, initAgentPos.y);
  target = new SATarget(initTargtPos.x, initTargtPos.y, 32, 128);
  init_ui();



}

function draw(){
  //>>> UI/UX WITHOUT ASYNCH CALL SUPPORT

  //>>> UPDATE METHODS
  if(simIsLive){
    if(agent.pos.dist(target.pos) < halfDistAgTg.dist(target.pos)){agent.halt();}
    else{agent.arrive(target.pos);}
  }
  agent.update();

  //>>> RENDER METHODS
  background(216,216,240);
  // image(unitCircleDegRad,width/2,height/2,512,512);
  drawGrid(32,"#3C3C3C80",1);
  drawStripedRect(32,224,64,64,8,ColorMap.strk_agtPath,4,'u');
  drawLineLerp();
  target.render();
  agent.render();  
  drawCurParms();
  drawFPS();
  drawCanvasBorder();
}

function mousePressed(){
  if(mouseInCanvas()&&mouseButton==LEFT){
    target.updatePos(mousePtToVec());
  }  
}



function resetAgent(){
  agent.pos.set(initAgentPos.x, initAgentPos.y);
  agent.vel.set(0,0);
  agent.ori.set(1,0);
  agent.acc.set(0,0);
}



//######################################################################
//>>> UI/UX INIT AND HANDLER[S]          (here because it's not too big)
//######################################################################
var sldr_slowDist, sldr_maxSpeed, sldr_maxForce, butn_startSim, butn_resetSim;
function init_ui(){
  let slWide = "512px";
  sldr_slowDist = createSlider(SteeringAgent.minSlowD, SteeringAgent.maxSlowD, agent.slowDist, 1).style('width', slWide).parent("slider_slowDist").input(()=> ui_parmEdit('slowDist', sldr_slowDist.value()));
  sldr_maxSpeed = createSlider(SteeringAgent.minSpeed, SteeringAgent.maxSpeed, agent.maxSpeed, 1).style('width', slWide).parent("slider_maxSpeed").input(()=> ui_parmEdit('maxSpeed', sldr_maxSpeed.value()));
  sldr_maxForce = createSlider(SteeringAgent.minForce, SteeringAgent.maxForce, agent.maxForce, 0.01).style('width', slWide).parent("slider_maxForce").input(()=> ui_parmEdit('maxForce', sldr_maxForce.value()));
  butn_startSim = createButton("START").parent("but_start").mousePressed(()=>onStartButtonPressed());
  butn_resetSim = createButton("STOP").parent("but_reset").mousePressed(()=>onResetButtonPressed());
  butn_resetSim.elt.disabled = true;
  ui_parmEdit('slowDist', sldr_slowDist.value());
  ui_updateParmLabels(); // initial pump of vals into their respective <td>'s
} // Ends Function init_ui

function onStartButtonPressed(){
  sldr_slowDist.elt.disabled = true;
  sldr_maxSpeed.elt.disabled = true;
  sldr_maxForce.elt.disabled = true;
  butn_startSim.elt.disabled = true;
  butn_resetSim.elt.disabled = false;
  simIsLive = true;
}

function onResetButtonPressed(){
  sldr_slowDist.elt.disabled = false;
  sldr_maxSpeed.elt.disabled = false;
  sldr_maxForce.elt.disabled = false;
  butn_startSim.elt.disabled = false;
  butn_resetSim.elt.disabled = true;
  simIsLive = false;
  resetAgent();
}

function ui_parmEdit(parm, val){
  agent[parm]=val; 
  if(parm=='slowDist'){target.updateDiskRadius(agent.slowDist);} 
  ui_updateParmLabels();
}

function ui_updateParmLabels(){
  select("#label_slowDist").html(agent.slowDist);
  select("#label_maxSpeed").html(agent.maxSpeed);
  select("#label_maxForce").html(agent.maxForce);
}

function drawCurParms(){
  noStroke(); fill(0,128); rect(0,0,640,128); 
  textSize(24); textAlign(LEFT,TOP); strokeWeight(4); stroke(0,180); fill(255); textStyle(BOLD); textFont('monospace');
  text("dist to target position: "+ nf(agent.pos.dist(target.pos), 2, 4), 8,4);
  text("dist to target slow rad: "+ nf((agent.pos.dist(target.pos)-agent.slowDist), 2, 4), 8,36);
  text("agent current velocity:  "+ agent.velValToString(), 8,68);  
  text("agent current positon:  "+ agent.posVecToString(), 8,100);
  textStyle(NORMAL); textFont('sans-serif'); // QAD resets for 'drawFPS' as it uses standard font
}

function drawLineLerp(){
  stroke(0,120,255,128); strokeWeight(4); 
  ellipse(halfDistAgTg.x,halfDistAgTg.y,50,50);
  line(halfDistAgTg.x,0,halfDistAgTg.x,height);
}