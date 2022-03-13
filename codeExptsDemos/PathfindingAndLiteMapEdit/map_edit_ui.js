class MapEditUI {
  constructor(mEdit, eltLink){
    this.mapEdit         = mEdit;
    this.floodFillToggle = null;
    this.brushSizeSelect = null;
    this.dirtyBitConfirm = false;
    this.initUISubPanel(eltLink);
  } // Ends Constructor

  initUISubPanel(eltLink){
    let tabPaintMapOpts = createElement("table").class("tab_subP").parent(eltLink);
    createElement("tr").parent(tabPaintMapOpts).child(createElement("td","Map Edit Options").class("lab_head2").style("background","rgb(216, 96, 0)").attribute("colspan","4"));
    createElement("tr").parent(tabPaintMapOpts).html("<td class=\"lab_desc\" style=\"min-width: 60px; background: #181818FF; text-align: center;\">Road</td> <td class=\"lab_rad\" style=\"background: rgb( 84, 84, 84);\"><input type=\"radio\" class=\"inp_rad\" name=\"pntOpt\" onclick=\"mapEditUI.onTilePaintOptionChanged(this);\" value=\"ROAD\"></td> <td class=\"lab_desc\" style=\"min-width: 60px; background: #181818FF; text-align: center;\">Paved</td> <td class=\"lab_rad\" style=\"background: rgb(168,168,168);\"><input type=\"radio\" class=\"inp_rad\" name=\"pntOpt\" onclick=\"mapEditUI.onTilePaintOptionChanged(this);\" value=\"PAVE\"></td>");
    createElement("tr").parent(tabPaintMapOpts).html("<td class=\"lab_desc\" style=\"min-width: 60px; background: #181818FF; text-align: center;\">Dirt</td> <td class=\"lab_rad\" style=\"background: rgb(144, 84, 12);\"><input type=\"radio\" class=\"inp_rad\" name=\"pntOpt\" onclick=\"mapEditUI.onTilePaintOptionChanged(this);\" value=\"DIRT\" checked></td> <td class=\"lab_desc\" style=\"min-width: 60px; background: #181818FF; text-align: center;\">Grass</td> <td class=\"lab_rad\" style=\"background: rgb(  0,144, 24);\"><input type=\"radio\" class=\"inp_rad\" name=\"pntOpt\" onclick=\"mapEditUI.onTilePaintOptionChanged(this);\" value=\"GRASS\"></td>");
    createElement("tr").parent(tabPaintMapOpts).html("<td class=\"lab_desc\" style=\"min-width: 60px; background: #181818FF; text-align: center;\">Sand</td> <td class=\"lab_rad\" style=\"background: rgb(255,216, 96);\"><input type=\"radio\" class=\"inp_rad\" name=\"pntOpt\" onclick=\"mapEditUI.onTilePaintOptionChanged(this);\" value=\"SAND\"></td> <td class=\"lab_desc\" style=\"min-width: 60px; background: #181818FF; text-align: center;\">Water</td> <td class=\"lab_rad\" style=\"background: rgb( 60,120,180);\"><input type=\"radio\" class=\"inp_rad\" name=\"pntOpt\" onclick=\"mapEditUI.onTilePaintOptionChanged(this);\" value=\"WATER\"></td>");
    createElement("tr").style("text-align", "center").parent(tabPaintMapOpts).html("<td class=\"lab_desc\" colspan=\"2\"><span>Brush Size</span> <br> <span class=\"lab_desc\" id=\"brushSizeDropdown\" colspan=\"2\"></span></td> <td class=\"lab_desc\" colspan=\"2\"><span>Flood Fill</span> <br> <label class=\"switch\" style=\"margin-top: 4px; margin-bottom: 4px\"><input type=\"checkbox\" id=\"floodFillToggle\"><span class=\"slider\"></span></label></td>");
    //> Synch DOM UI to init MapEdit Tile Type to draw (should always be TileType.DIRT, but defining procedurally just to be safe {and satisfy my OCD})
    let pntOpts = document.getElementsByName('pntOpt');
    pntOpts.forEach((item)=>{if(TileType[item.value]==this.mapEdit.paintType){item.checked=true;}});
    //> Dropdown for Brush Size
    this.brushSizeSelect = createSelect().style("font-size","1em").style("margin-top","2px").style("padding-top","4px").style("padding-bottom","4px").style("color","white").style("background","#181818FF").parent("#brushSizeDropdown");
    for (var i=1; i<=MapEditor.maxPaintSize; i++) {this.brushSizeSelect.option("["+i+"x"+i+"] cells", i);}
    this.brushSizeSelect.changed(()=>this.mapEdit.setPaintSize(this.brushSizeSelect.value()));    
    //> Additional init code for Flood Fill Toggle
    this.floodFillToggle = select("#floodFillToggle");
    this.floodFillToggle.elt.checked = this.mapEdit.paintFill;
    this.floodFillToggle.changed(()=>{this.mapEdit.paintFill = this.floodFillToggle.checked()}); 
    let tabMapGenOpts = createElement("table").class("tab_subP").parent(eltLink);
    createElement("tr").parent(tabMapGenOpts).child(createElement("td","Map Generate Options").class("lab_head2").style("background","rgb(216, 96, 0)").attribute("colspan","4"));
    //==================================================================
    //> Lakes And Ponds Init
    //==================================================================
    createElement("tr").parent(tabMapGenOpts).style("background","rgb(180,216,255)").style("color","black").html("<td class=\"lab_desc\" style=\"min-width: 60px; font-weight:bold; text-align: center\" colspan=\"4\">Lakes and Ponds</td>", true);
    createElement("tr").parent(tabMapGenOpts).style("text-align","center").html("<td class=\"lab_desc\" style=\"min-width: 48px; padding-left: 2px;\">Water</td> <td id=\"waterPctSldr\"class=\"lab_desc\" style=\"min-width: 120px;\" colspan:\"2\"></td> <td id=\"waterPctVal\"class=\"lab_cVal\" style=\"min-width: 60px\">100%</td>", true);
    createElement("tr").parent(tabMapGenOpts).html("<td class=\"lab_desc\" style=\"min-width: 60px; text-align: center\" colspan=\"2\">Add Sandy Coasts</td> <td class=\"lab_cBox\"><input type=\"checkbox\" onkeydown=\"event.preventDefault()\" id=\"cBox_addCoasts\"/></td>", true);
    this.waterPctSldr  = createSlider(0,100,50).style("width","120px").parent("#waterPctSldr");
    this.labl_waterPct = select("#waterPctVal");
    this.cBox_addCoast = select("#cBox_addCoasts");
    //==================================================================
    //> Grass Fields/Dunes Init
    //==================================================================
    createElement("tr").parent(tabMapGenOpts).style("background","rgb(144,216,144)").style("color","black").html("<td class=\"lab_desc\" style=\"min-width: 60px; font-weight:bold; text-align: center\" colspan=\"4\">Grass Fields/Dunes</td>", true);
    createElement("tr").parent(tabMapGenOpts).style("text-align","center").html("<td class=\"lab_desc\" style=\"min-width: 48px; padding-left: 2px;\">Grass</td> <td id=\"grassPctSldr\"class=\"lab_desc\" style=\"min-width: 120px;\" colspan:\"2\"></td> <td id=\"grassPctVal\"class=\"lab_cVal\" style=\"min-width: 60px\">100%</td>", true);
    createElement("tr").parent(tabMapGenOpts).html("<td class=\"lab_desc\" style=\"min-width: 60px; text-align: center\" colspan=\"2\">Add Grass To Dunes</td> <td class=\"lab_cBox\"><input type=\"checkbox\" onkeydown=\"event.preventDefault()\" id=\"cBox_addDunes\"/></td>", true);
    this.grassPctSldr  = createSlider(0,100,50).style("width","120px").parent("#grassPctSldr");
    this.labl_grassPct = select("#grassPctVal");
    this.cBox_addDunes = select("#cBox_addDunes");
    //==================================================================
    //> Generate / Reset Map
    //==================================================================
    createElement("tr").parent(tabMapGenOpts).style("text-align","center").style("background","#181818FF").html("<td style=\"user-select: none;\" colspan=\"4\"> <button class=\"inp_but\" id=\"butt_mapGenerate\" style=\"background:rgb(32,144,32); color:white; margin-top:4px; margin-bottom:4px;\">GENERATE MAP</button> <button class=\"inp_but\" id=\"butt_mapReset\" style=\"background:rgb(216,32,32); color:white; margin-top:4px; margin-bottom:4px;\">RESET MAP</button></td>");    
    select("#butt_mapGenerate").mousePressed(()=>this.onMapGenerate());
    select("#butt_mapReset").mousePressed(()=>this.onMapReset());
    //==================================================================
    //> Load Map / Save Map
    //==================================================================
    createElement("tr").parent(tabMapGenOpts).child(createElement("td","Map Load/Save Options").class("lab_head2").style("background","rgb(216, 96, 0)").attribute("colspan","4"));
    createElement("tr").parent(tabMapGenOpts).style("text-align","center").style("background","#181818FF").html("<td style=\"user-select: none;\" colspan=\"4\"> <button class=\"inp_but\" id=\"butt_mapLoad\" style=\"background:rgb(216,216,216); color:black; margin-top:4px; margin-bottom:4px;\" >LOAD MAP</button> <button class=\"inp_but\" id=\"butt_mapSave\" style=\"background:rgb(216,216,216); color:black; margin-top:4px; margin-bottom:4px;\">SAVE MAP</button></td>");
    select("#butt_mapLoad").mousePressed(()=>this.onLoadMapDialogue());
    select("#butt_mapSave").mousePressed(()=>this.onSaveMapDialogue());
  } // Ends Function initUISubPanel

  onTilePaintOptionChanged(newItem){
    mapEdit.setPaintType(TileType[newItem.value]);
  } // Ends Function onTilePaintOptionChanged

  onSaveMapDialogue(){
    (confirm("Save Current Map Info To <p> Below Canvas?")) ? select("#mapInfoOutGhettoStyle").html(myMap.mapToString()) :
    (confirm("Delete Existing Map Info In <p> Below Canvas?")) ? select("#mapInfoOutGhettoStyle").html("") : '' ;
    this.dirtyBitConfirm = true;    
  } // Ends Function onSaveMapDialogue

  onLoadMapDialogue(){
    if (confirm("Load An Existing Map ? (Via Text Input Of Name)")){
      let name = prompt("Enter Map Name/ID (As Assigned In 'map_defs' source)","???");
      let mapDef = name;
      if(mapDef){myMap.loadMap(eval(mapDef)); alert("Map Should Load On Pressing [OK]")} else{alert("Cannot Find Map");}
    }
    this.dirtyBitConfirm = true;
  } // Ends Function onLoadMapDialogue

  onMapGenerate(){
    if(confirm("Generate Map Via Values Set Above ???")){
      this.mapEdit.makePondsAndLakes(this.waterPctSldr.value());
      if(this.cBox_addCoast.checked()){this.mapEdit.makeSimpleShore();}
      this.mapEdit.makeGrass(this.grassPctSldr.value());
      if(this.cBox_addDunes.checked()){this.mapEdit.makeSimpleSandDuneGrass();}      
    }
    this.dirtyBitConfirm = true;
  } // Ends Function onMapGenerate

  onMapReset(){
    if(confirm("Reset All Map Tiles To Type [DIRT] ???")){this.mapEdit.map.setAllCellsToTile();}
    this.dirtyBitConfirm = true;
  } // Ends Function onMapReset

  onMousePressed(){
    if(this.floodFillToggle.checked()){this.mapEdit.floodFillAtMouseTile();}
  } // Ends Function onMousePressed

  onMouseDown(){
    this.mapEdit.paintAtMouseTile();
  } // Ends Function onMouseDown

  onMouseWheel(event){
    this.brushSizeSelect.elt.children[this.mapEdit.paintSize-1].removeAttribute("selected");    
    this.mapEdit.adjPaintSize(Math.sign(-event.delta));
    this.brushSizeSelect.elt.children[this.mapEdit.paintSize-1].setAttribute("selected",1);
  } // Ends Function onMouseWheel

  updateLabels(){
    if(this.dirtyBitConfirm){_onmouseup('a'); this.dirtyBitConfirm=false;}
    this.labl_waterPct.html(this.waterPctSldr.value()+"%");
    this.labl_grassPct.html(this.grassPctSldr.value()+"%");
  } // Ends Function updateLabels

} // Ends Class MapEditUI