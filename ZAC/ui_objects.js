

class UIStyle{
  static TextOriOpts = {TL:1,TR:2,CTR:0,TC:3}; // top-left, top-right, center, top-center
  constructor(){
    this.fill_bGround = color(0,120,255);      // Color when not clicked or toggled
    this.fill_fGround = color(240,240,240,50); // Transparent color when clicked or toggled

    this.strk_border  = color(255,255,255);
    this.strk_border2 = color(180,180,180);    // color to use if disabled (A/A)

    this.strk_weight  = 1;
    this.strk_weight2 = 4;

    this.fill_text    = color(255,255,255);
    this.fill_text2   = color(180,180,180);    // color to use if disabled (A/A)

    this.boldText     = false; // make text bold (i.e. via stroke weight)
    this.boldTextWgt  = 2; // TODO: Implement for other UIObject types; as only currently used for ClickButton!

    this.textSize     = 18;
    this.textOff      = [0,0]; // offset [LEFT,DOWN] from top left corner
    this.textDims     = [0,0]; // textbox dimensions (if using text wrap mode)
    this.useTextWrap  = false;

    this.textOri      = UIStyle.TextOriOpts.TL; // default text ori: top left
  }

  // Use at own risk, as clearly not handled
  setStyle(id,val){
    this[id] = val;
  }

    // Util that sets styles and whatnot
  setPredefStyle(objType){
    switch(objType){
      case "container":
        this.strk_weight2 = 4;
      case "click":
        this.textOff     = [5,7];
        this.fill_bGround = color(144,144,144);
        this.fill_text    = color(0,0,0);
        break;
      case "click2":  
        this.fill_bGround = color(144,144,144);
        this.fill_text    = color(0);
        this.textOri      = UIStyle.TextOriOpts.CTR;
        break;    
      case "toggle":
        this.textOff     = [5,7];
        this.fill_bGround = color(144,144,144);
        this.fill_fGround = color(180,180,180,64);
        this.strk_border2 = color(120,120,120);
        this.fill_text    = color(0,0,0);
        break;
      case "label":
        this.fill_bGround = color(60);
        this.textOri = UIStyle.TextOriOpts.CTR;
        break;
      case "label_transparent":
        this.fill_bGround = color(0,0);
        this.textOri = UIStyle.TextOriOpts.CTR;
        break;
      case "label2":
        this.fill_bGround = color(0,0);
        this.textOff      = [4,8]
        UIStyle.TextOriOpts.TL;
        break;
      case "rectBar":
        this.fill_bGround = color(60);
        this.strk_weight  = 0;
        break;
      case "label3":
        this.textOff     = [10,-9];
        this.strk_border  = color(255,0);     
        this.fill_bGround = color(255,0);
        break;
    } // Ends Switch
  } // Ends Function setPredefStyle
} // Ends Class UIStyle


class UIObject{
  constructor(pos, dim){
    this.pos = pos;
    this.dim = dim;
    this.ePt = createVector(this.pos.x+this.dim.x,this.pos.y+this.dim.y);
    this.mPt = p5.Vector.mult(this.dim,0.5).add(this.pos);

    this.text;
    this.style = new UIStyle();
    this.mouseOver = false;
  } // Ends Constructor

  update(){
    this.mouseOver = (this.isMouseOver()) ? true : false;
  } // Ends Function update

  isMouseOver(){
    return (mouseX >= this.pos.x && mouseX <= this.ePt.x && mouseY >= this.pos.y && mouseY <= this.ePt.y);
  } // Ends Function isMouseOver

  onMousePressed(){
     // Default behavior is to do nothing
  } // Ends Function onMousePressed

  // Interfaces to this object's UIStyle component
  setPredefStyle(objType){this.style.setPredefStyle(objType);return this;}
  setStyle(id,val){this.style.setStyle(id,val);return this;}


  //>>> Text rendering via this object's text orientation
  renderTextViaOri(){
    switch(this.style.textOri){
      case UIStyle.TextOriOpts.TL:  this.renderTextViaTLCorner(); break;
      case UIStyle.TextOriOpts.TR:  this.renderTextViaTRCorner(); break;
      case UIStyle.TextOriOpts.CTR: this.renderTextViaCenter(); break;
      case UIStyle.TextOriOpts.TC: this.renderTextViaTCenter(); break;   
    }
  }

  renderTextViaTLCorner(){textAlign(LEFT,TOP);    this.renderText(this.pos.x+this.style.textOff[0],this.pos.y+this.style.textOff[1]);}
  renderTextViaTRCorner(){textAlign(RIGHT,TOP);   this.renderText(this.ePt.x-this.style.textOff[0],this.pos.y+this.style.textOff[1]);}
  renderTextViaCenter(){textAlign(CENTER,CENTER); this.renderText(this.mPt.x+this.style.textOff[0],this.mPt.y+this.style.textOff[1]);}
  renderTextViaTCenter(){textAlign(CENTER,TOP);   this.renderText(this.mPt.x+this.style.textOff[0],this.pos.y+this.style.textOff[1]);}

  renderText(x1,y1){
    switch(this.style.useTextWrap){
      case true: text(this.text,x1,y1,this.style.textDims[0],this.style.textDims[1]); break;
      case false: text(this.text,x1,y1); break; 
    }
  }

} // Ends Class UIObject


/*----------------------------------------------------------------------
|>>> class UIContainer (of superclass UIObject)
+-----------------------------------------------------------------------
| Description: Functions as a 'panel' and container for other UIObject
|              types, such that all such objects (buttons, labels, etc.) 
|              should be placed within a UIContainer.
+---------------------------------------------------------------------*/
class UIContainer extends UIObject{
  constructor(pos, dim){
    super(pos,dim);
    this.children = [];
    this.hidden   = false;
    this.debugViz = false;
  } // Ends Constructor

  setHidden(val = !this.hidden){
    this.hidden = val;
    return this; // for function chaining purposes
  } // Ends Function setHidden

  addChildren(kids){
    kids.forEach(c => this.addChild(c));
    return this;
  } // Ends Function addChildren

  addChild(child){
    // offset child pos and ePt by parent's pos
    this.adjParentPosToChild(child,this.pos);
    this.children.push(child);
    return this;
  } // Ends Function addChild

  adjParentPosToChild(child,pos){
    child.pos.add(pos);
    child.ePt.add(pos);
    child.mPt.add(pos);
    // not FULLY tested more than 1 level, but is straightforward recursion so should work.
    if(child.children){child.children.forEach(c => child.adjParentPosToChild(c,pos));}
  }

  update(){
    if(this.hidden){return;}
    super.update();
    this.children.forEach(c => c.update());
  } // Ends Function update

  render(){
    if(this.hidden){return;}
    strokeWeight(this.style.strk_weight);stroke(this.style.strk_border);fill(this.style.fill_bGround);
    rect(this.pos.x,this.pos.y,this.dim.x,this.dim.y);
    if(this.debugViz){ this.renderMidpoint(); this.renderMouseOver();}
    this.children.forEach(c => c.render());
  } // Ends Function render

  // Implemented for DEBUG purposes only (i.e. not part of player's UI/UX)
  renderMidpoint(){noFill();ellipse(this.mPt.x,this.mPt.y,5,5);}
  renderMouseOver(){if(this.mouseOver){stroke(this.style.fill_text);strokeWeight(this.style.strk_weight2);noFill();rect(this.pos.x,this.pos.y,this.dim.x,this.dim.y);}}

  onMousePressed(){
    if(this.hidden){return;}
    this.children.forEach(c => c.onMousePressed());
  } // Ends Function onMousePressed
} // Ends Class UIContainer


/*----------------------------------------------------------------------
|>>> class UIClickButton (of superclass UIObject)
+-----------------------------------------------------------------------
| Description:  Implements a simple button that, when clicked while the
|               mouse is over it, will change the visual effect of the
|               button while calling the [callback] method bound to it.
| Dependencies: Uses p5js global var 'mouseIsPressed
+---------------------------------------------------------------------*/
class UIClickButton extends UIObject{
  constructor(pos, dim, label=""){
    super(pos,dim);
    this.text = label;
    this.action;
  } // Ends Constructor

  bindAction(act){
    this.action = act;
    return this;
  } // Ends Function bindAction

  render(){
    strokeWeight(this.style.strk_weight);stroke(this.style.strk_border);fill(this.style.fill_bGround);
    rect(this.pos.x,this.pos.y,this.dim.x,this.dim.y);

    (this.style.boldText) ? stroke(this.style.fill_text) : noStroke();
    fill(this.style.fill_text);textSize(this.style.textSize);
    this.renderTextViaOri();

    if(this.mouseOver && mouseIsPressed){
      stroke(this.style.strk_border);strokeWeight(this.style.strk_weight2);fill(this.style.fill_fGround);
      rect(this.pos.x,this.pos.y,this.dim.x,this.dim.y);
    }
  } // Ends Function render

  onMousePressed(){if(this.mouseOver && this.action){this.action();}}

} // Ends Class UIClickButton


/*----------------------------------------------------------------------
|>>> class UIToggleButton (of superclass UIObject)
+-----------------------------------------------------------------------
| Description:  Implements a simple button that, when clicked while the
|               mouse is over it, will switch between an on/off state
|               visually while toggling the corresponding state bound to
|               it. For modularity/decoupling purposes: the toggle state
|               will synch with its bound variable only ONCE, when first
|               bound (although I'm sure a reason to listen/synch to the
|               bound state will emerge at some point).
+---------------------------------------------------------------------*/
class UIToggleButton extends UIObject{
  constructor(pos, dim, label=null){
    super(pos,dim);
    this.text = label;
    this.state;
  } // Ends Constructor

  bindState(state){
    this.state = state;
    return this;
  } // Ends Function bindState

  update(){
    super.update();
  } // Ends Function update

  render(){
    strokeWeight(this.style.strk_weight);stroke(this.style.strk_border);fill(this.style.fill_bGround);
    rect(this.pos.x,this.pos.y,this.dim.x,this.dim.y);

    noStroke();fill(this.style.fill_text);textSize(this.style.textSize);
    this.renderTextViaOri();

    if(this.state.val){
      strokeWeight(this.style.strk_weight2); stroke(this.style.strk_border2); fill(this.style.fill_fGround);
      rect(this.pos.x+2,this.pos.y+2,this.dim.x-4,this.dim.y-4); // 'magic values', I know...
    }
  } // Ends Function render

  onMousePressed(){
    if(this.mouseOver){this.state.toggle();}
  } // Ends Function onMousePressed

} // Ends Class UIToggleButton


/*----------------------------------------------------------------------
|>>> class UIBuyButton (of superclass UIObject)
+-----------------------------------------------------------------------
| Description: x
| Side Note:   Button will poll bound state for now (to K.I.S.S.), but
|              can look into other design patterns i.e. 2-way messenger
|              s.t. the bound state will tell it if it can't be afforded
+---------------------------------------------------------------------*/
class UIBuyButton extends UIObject{
  constructor(pos, dim, label=""){
    super(pos,dim);
    this.text = label;
    this.action;
    this.query;
    this.style.cantBuyCol = color(0,128);
  } // Ends Constructor

  bindAction(act){
    this.action = act;
    return this;
  } // Ends Function bindAction

  bindQuery(qry){
    this.query = qry;
    return this;
  } // Ends Function bindAction

  update(){
    super.update();
  } // Ends Function update

  render(){
    strokeWeight(this.style.strk_weight);stroke(this.style.strk_border);fill(this.style.fill_bGround);
    rect(this.pos.x,this.pos.y,this.dim.x,this.dim.y);


    (this.style.boldText) ? stroke(this.style.fill_text) : noStroke();
    fill(this.style.fill_text);textSize(this.style.textSize);
    this.renderTextViaOri();


    if(this.query()){
      if(this.mouseOver && mouseIsPressed){
        strokeWeight(this.style.strk_weight);stroke(this.style.strk_border);fill(this.style.fill_fGround);
        rect(this.pos.x,this.pos.y,this.dim.x,this.dim.y);
      }
    }
    else{
      strokeWeight(this.style.strk_weight2);stroke(this.style.cantBuyCol);fill(this.style.cantBuyCol);
      rect(this.pos.x,this.pos.y,this.dim.x,this.dim.y);
    }
  } // Ends Function render

  onMousePressed(){
    if(this.mouseOver && this.action && this.query()){this.action();}
  } // Ends Function onMousePressed

} // Ends Class UIClickButton


/*----------------------------------------------------------------------
|>>> class UILabel (of superclass UIObject)
+-----------------------------------------------------------------------
| Description: Simple text label, sits at its position and looks pretty.
|              If external state is bound to it - it will need to update
|              to reflect the value thereof. I'm currently doing this
|              every frame, but a more advanced 'onChanged' messaging
|              system could be utilized as well (but K.I.S.S. for now!)
+-----------------------------------------------------------------------
| Implementation Notes:
|  > Use mouse-over to implement a tooltip popup in a future version?
+---------------------------------------------------------------------*/
class UILabel extends UIObject{
  constructor(pos, dim, label=""){
    super(pos,dim);
    this.text = label;
    this.cBack;
  } // Ends Constructor

  // Used for manual setting (i.e. one-time at init <vs> needing updates)
  setText(text){
    this.text = text;
    return this;
  } // Ends Function setText

  bindCallback(cBack){
    this.cBack = cBack;
    this.text  = this.cBack();
    return this;
  } // Ends Function bindState

  update(){
    if(this.cBack){this.text = this.cBack();}
  } // Ends Function update

  render(){
    strokeWeight(this.style.strk_weight);stroke(this.style.strk_border);fill(this.style.fill_bGround);
    rect(this.pos.x,this.pos.y,this.dim.x,this.dim.y);

    switch(this.style.boldText){
      case true: stroke(this.style.fill_text); strokeWeight(this.style.strk_border2); break;
      default: noStroke();
    }

    fill(this.style.fill_text);textSize(this.style.textSize);
    this.renderTextViaOri(); 
  } // Ends Function render

} // Ends Class UILabel



/*----------------------------------------------------------------------
|>>> class UIRectBar (of superclass UIObject)
+-----------------------------------------------------------------------
| Description: Simple rectangular bar, 'Nuff Said. Used to visualize a
|              partition between two siblings of a UIContainer, fill in
|              empty space between such siblings and the remaining space
|              of their parent UIContainer, etc.
+---------------------------------------------------------------------*/
class UIRectBar extends UIObject{
  constructor(pos, dim){
    super(pos,dim);
  } // Ends Constructor

  update(){
    /* Do nothing. Keeping a stub as UIObject super updates mouseOver */
  } // Ends Function update

  // NOTE: Demo's how to use strokeweight of 0 (zero) to effect noStroke() call
  render(){
    switch(this.style.strk_weight){
      case 0 : noStroke(); break;
      default: strokeWeight(this.style.strk_weight); stroke(this.style.strk_border); break;
    }
    fill(this.style.fill_bGround);
    rect(this.pos.x,this.pos.y,this.dim.x,this.dim.y);
  } // Ends Function render

} // Ends Class UIRectBar