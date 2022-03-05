/*######################################################################
####################### ZAC 'OLD CODE GRAVEYARD' #######################

 > Overview: Where Obsolete code that is significant enough (in terms of
             self-evidence else to ease my OCD) goes for backup and/or
             referential purposes s.t. they're easier-to-access than the
             GH Repo history of their origin projects (if such projects
             even still exist). Despite the spooky-yet-cute ASCII art:
             this is more of a dumpster than a graveyard: s.t. while one
             can get things from here that were mistakenly thrown out:
             the garbage truck will arrive and empty it sometime soon.

     #####   HOWS THAT  #####   FOR SLICK  #####  ASCII ART?  #####   
    #######            #######            #######            #######  
   ####+####          ####+####          ####+####          ####+#### 
   ##+RIP+##          ##+RIP+##          ##+RIP+##          ##+RIP+## 
   ####+####          ####+####          ####+####          ####+#### 
   #########          #########          #########          ######### 
  ###########        ###########        ###########        ###########
######################################################################*/



/*----------------------------------------------------------------------
|>>> Snippet: Old Method - Disabling Default Right Mouse Click Behavior
+-----------------------------------------------------------------------
|> Overview: This was the old method for disabling the default behavior
|            for right mouse clicks (i.e. options menu pop-up); s.t. it
|            can be used for stuff like commanding an agent to move to
|            another cell in a gridworld without the menu popping up. On
|            02/26/22 within the 'Gridwalker-P5JS' ZAC-related project:
|            it was replaced with a new method featuring a lambda which,
|            when called after a right mouse click event, evaluates the
|            negation of the <mouseInCanvas> function. This new behavior
|            thus disables the context menu popup whenever the mouse is
|            within the canvas, and enables it back whenever outside the
|            canvas: which is the IDEAL behavior I had always desired!
+---------------------------------------------------------------------*/
document.oncontextmenu = function(){return false;}


/*----------------------------------------------------------------------
|>>> Function Gridwalker.gridWalkAlongPath
+-----------------------------------------------------------------------
|> Overview: This was an older method used within Gridwalker whereby
|            delta [pos] and [ori] were tightly coupled to (dependent 
|            upon) the state of the current path given to the agent.
|            As Gridwalker now utilizes an implementation in which it
|            only follows a vector 'curMoveTarget' that is independent
|            from the pathfinding state (although cohesive thereto), 
|            this function is now obsolete; but will be kept here for
|            reference / extra safekeeping for now.
+---------------------------------------------------------------------*/
function gridWalkAlongPath(){
  let des = p5.Vector.sub(this.curPath[this.curWaypt],this.pos).setMag(this.maxSpeed);
  let newPos = p5.Vector.add(this.pos,des);
  // Update orientation (i.e. local forward WRT to global rotation)
  this.ori.add(p5.Vector.sub(des,this.ori).limit(this.maxForce));
  // Clamp if it overshoots the waypoint
  if(p5.Vector.dist(this.pos,newPos)>p5.Vector.dist(this.pos,this.curPath[this.curWaypt])){newPos=this.curPath[this.curWaypt];}
  // At current waypoint (exactly xor clamped overshoot, and also means I never 'lose a frame' of movement)
  if(p5.Vector.dist(this.pos,newPos)==p5.Vector.dist(this.pos,this.curPath[this.curWaypt])){this.curWaypt++;}
  // Finally: update position WRT this frame
  this.pos=newPos;
} // Ends Function gridWalkAlongPath


/*----------------------------------------------------------------------
|>>> Function Gridwalker.moveToCurTar
+-----------------------------------------------------------------------
|> Overview: This features the overshoot detection/handling method used
|            within the 'Gridwalker-P5JS' local version, which works via 
|            the following algorithm:
|              o Create steering force via [SEEK] on move-target
|              o Update current velocity WRT to steerring force
|              o Generate vector encompassing new position (i.e. where
|                agent would be at if not overshooting move-target)
|              o Cast vector from move-target to current agent position
|              o Cast another vector from move-target to position agent
|                would be at if overshoot handling was not implemented
|              o Perform dot product computation upon these two vectors
|              o If dot product result is negative, it means the vectors
|                are facing in opposite directions (WRT move-target as 
|                'bisecting line'). Do set agent position to move-target
|                position, then set move-target to [null], we're here!
|              o Else set agent position to time+1 position
|            
|            The standard/global (i.e. ZAC) version instead utilizes the
|            method used within the 'PathFindAndFollow' local version, 
|            which works via the following algorithm:
|              o Create Desired Velocity only (i.e. SKIP steering force)
|              o Generate vector encompassing new position (i.e. where
|                agent would be at if not overshooting move-target) WRT
|                delta position given application of desired velocity
|              o If the distance between the current and new position is
|                greater than the distance between the current position
|                and move-target: the new position is overshooting; Do
|                set agent position to move-target as with other method
|              o Else set agent position to time+1 position (AKA the new
|                position); also as with the other method.
|            I decided to utilize this latter version as the standard,
|            due to a 'back-of-napkin analysis' thereof suggesting that 
|            it encompasses less object creation, p5.Vector operations,
|            and overall total computation/instructions than the former.
|            Of course, in the case I'm wrong and find that out before
|            deleting this source file: I'll keep it here as a JIC :-)
+---------------------------------------------------------------------*/
function moveToCurTar(){
  if(this.curMoveTar){
    var des = p5.Vector.sub(this.curMoveTar,this.pos).setMag(this.maxSpeed); // desired velocity
    var str = p5.Vector.sub(des,this.vel).limit(this.maxForce);              // steering force
    this.vel.add(str).limit(this.maxSpeed);
    let newPos = p5.Vector.add(this.pos,this.vel);        // this is the position i will be at upon effecting vel without clamping
    let vecT_0 = p5.Vector.sub(this.curMoveTar,this.pos); // get ori at t_0 (i.e. pre-update)
    let vecT_1 = p5.Vector.sub(this.curMoveTar,newPos);   // get ori at t_1 (i.e. on-update a.k.a. 'lookahead')
    if(p5.Vector.dot(vecT_0,vecT_1)<0){this.pos.set(this.curMoveTar); this.curMoveTar=null;}
    else{this.pos.set(newPos)};
  }
  else{
    this.vel.mult(0);
  }

  if(this.vel.magSq()>0){
    var oriDelta = p5.Vector.sub(this.vel,this.ori);
    oriDelta.limit(this.maxForce);
    this.ori.add(oriDelta);
  }
} // Ends Function moveToCurTar


/*----------------------------------------------------------------------
|>>> 'Dict' Colors
+-----------------------------------------------------------------------
|> Overview: Via 'Processing ZAC', keeping as it might be easier and/or
|            more unified means of predefining and getting colors from a
|            centrally-defined 'pallete' dict/object <vs> independently
|            defining within <initGFX> function of every object [class].
+---------------------------------------------------------------------*/
var Colors = {
  debug:     "#FF00FF", // color(255,0,255)
  white:     "#FFFFFF", // color(255,255,255)
  brown:     "#6C3C00", // color(108,60,0)
  lightBlue: "#0078B4", // color(0,120,180)
  mediumGray:"#787878", // color(120,120,120)
  sand:      "#FFD860", // color(255,216,96)
  green:     "#009C00", // color(0,156,0)
  lightGray: "#B4B4B4", // color(180,180,180)
  orange:    "#FF7800", // color(255,120,0)
  darkGray:  "#3C3C3C", // color(60,60,60)
} // Ends Interface Colors




