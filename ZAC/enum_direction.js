/*====================================================================
|>>> 'Quasi-Enum' Direction
+---------------------------------------------------------------------
| Overview: "JavaScript enum" representing the direction of a map cell
|           WRT another map cell (via Moore Neighborhood). Currently
|           used with Scent and Sound Grids to inform of the direction
|           that some [smelly] units xor [loud] sound originated from. 
|           Also contains an array of UNICODE glyphs corresponding to 
|           each direction for [debug] display of map data. Other uses
|           beyond ZAC are possible; i.e. for projects involving basic
|           (i.e. Moore Neighborhood) flow fields, Flow Diagrams, Sim
|           Games, 'Gridwalker' paths, etc. Ergo for this reason and
|           its use in 2 ZAC Map Subtypes (even 3 as there might be a
|           use with SPMap): this is located within the GridMap Class
|           as a static object thereto.
| Schema:   Values correspond to clockwise traversal of a cell's Moore
|           Neighborhood: starting at [Top-Right]/[Northeast], whereby
|           the [Center]/[Origin] has a value of zero (0), as follows:
|                     +---------+    +---------+    +-----+
|                     |NW  N  NE|    |RL  T  TR|    |7 8 1|
|                     | W ORG  E| => | L CTR  R| => |6 0 2|
|                     |SW  S  SE|    |BL  B  BR|    |5 4 3|
|                     +---------+    +---------+    +-----+

>>> TODO: Above Description was for an older version that my stupid
          ass threw into ZAC's main source <vs> making a goddamned
          'enum_direction.js' source file in the first place. Ergo:
          give it a look-through and make any updates A/A at some pt.
+===================================================================*/
var Direction = {
  'O':0, 'ORG':0, 'NE':1, 'E':2, 'SE':3, 'S':4, 'SW':5, 'W':6, 'NW':7, 'N':8, 
  'C':0, 'CTR':0, 'TR':1, 'R':2, 'BR':3, 'B':4, 'BL':5, 'L':6, 'TL':7, 'T':8,
  'X':9, // <== None/Expired/Unknown or otherwise Default value
  glyph : ['•','⬈','⮕','⬊','⬇','⬋','⬅','⬉','⬆','∅']
}; // Ends Enum Direction