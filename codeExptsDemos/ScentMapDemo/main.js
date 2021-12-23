var demoMap;
var agents = [];
var curScentPts=20;

function setup(){
  createCanvas(800,800).parent("viz");
  ellipseMode(CENTER);
  demoMap = new ScentMap(25,25,32);
  agents.push(new WayptAgent(1, 1,23,demoMap));
  agents.push(new WayptAgent(2, 3, 1,demoMap));
  agents.push(new WayptAgent(3,23,23,demoMap));
  agents.push(new WayptAgent(4,19,19,demoMap));
}

function draw(){
  //>>> UPDATE METHODS
  agents.forEach((a)=>a.update());
  demoMap.update();

  //>>> RENDER METHODS
  background(240);  
  demoMap.renderHeatmap();
  agents.forEach((a)=>a.renderPath());  
  demoMap.renderGrid();  
  demoMap.renderDirGlyphs();  
  agents.forEach((a)=>a.renderBody());

  drawFPS();
  drawCanvasBorder();
}