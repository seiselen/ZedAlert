var human_body_units_data = {

  //>>> Common Attributes / Default Vals Thereof
  // 'filler' values (a/o 12/7) as I wrap my head around greater scope/purpose of this data
  baseHealth : 100,
  baseArmor  : 50,

  //####################################################################
  //>>> Weapon Types, Blurbs, Attibutes / Vals Thereof
  //####################################################################

  /*--------------------------------------------------------------------
  |>>> LEGEND
  +---------------------------------------------------------------------

  | > 'DAM' : Base Damage
  | > 'RGE' : Max Range    (WRT world units, which are currently pixels)
  | > 'ROF' : Rate Of Fire (WRT frames between shots xor bursts thereof)
  +---------------------------------------------------------------------  
  | Notes: 
  |  > A/O 12/7/21, the values for [DAM], [RGE], and [ROF] are expressed
  |    as categorical, pending replacement with numeric ones ASAP. These
  |    temporary values are self-explanatory with the exception of three
  |    special cases of which are described as follows:
  |     - [XTRM] : extremely high damage value
  |     - [CNST] : constant rate of fire
  |     - [PROJ] : damage varies WRT projectile type (fire, frag, etc.)
  +-------------------------------------------------------------------*/
  pistols :    {name: "Pistols (Sidearms)",
    baseType:  {name: "Pistol",            DAM: "LOW",  RGE: "LOW",  ROF: "LOW"},
    subType1:  {name: "Dual Pistols",      DAM: "MED",  RGE: "LOW",  ROF: "MED"},
    subType2:  {name: "Scoped Pistol",     DAM: "HIGH", RGE: "MED",  ROF: "LOW"},
  },
  prec_guns :  {name: "Precision Firearms",
    baseType:  {name: "Hunting Rifle",     DAM: "LOW",  RGE: "MED",  ROF: "LOW"},
    subType1:  {name: "Semi-Auto Rifle",   DAM: "HIGH", RGE: "MED",  ROF: "MED"},
    subType2:  {name: "Sniper Rifle",      DAM: "HIGH", RGE: "XTRM", ROF: "LOW"},
  },
  auto_guns :  {name: "Automatic Firearms",
    baseType:  {name: "Submachine Gun",    DAM: "LOW",  RGE: "LOW",  ROF: "MED",},
    subType1:  {name: "Fully-Auto Rifle",  DAM: "MED",  RGE: "MED",  ROF: "HIGH"},
    subType2:  {name: "Minigun",           DAM: "LOW",  RGE: "LOW",  ROF: "CNST"},
  },
  frag_guns :  {name: "Fragment. Weapons",
    baseType:  {name: "Shotgun",           DAM: "MED",  RGE: "LOW",  ROF: "LOW"},
    subType1:  {name: "Combat Shotgun",    DAM: "HIGH", RGE: "LOW",  ROF: "MED"},
    subType2:  {name: "2X Barrel Shotgun", DAM: "XTRM", RGE: "LOW",  ROF: "LOW"},
  },
  proj_guns :  {name: "Projectile Launchers",
    baseType:  {name: "Grenade Launcher",  DAM: "PROJ", RGE: "LOW",  ROF: "LOW"},
    subType1:  {name: "RPG Launcher",      DAM: "PROJ", RGE: "MED",  ROF: "MED"},
    subType2:  {name: "Missile Launcher",  DAM: "PROJ", RGE: "HIGH", ROF: "LOW"},
  },
  energy_guns: {name: "Energy Weapons",
    baseType:  {name: "Laser Rifle",       DAM: "LOW",  RGE: "MED",  ROF: "HIGH"},
    subType1:  {name: "Plasma Rifle",      DAM: "HIGH", RGE: "MED",  ROF: "MED" },
    subType2:  {name: "Laser Burst Rifle", DAM: "XTRM", RGE: "LOW",  ROF: "LOW" },
  }
};

//####################################################################
//>>> Weapon Type Blurbs (partitioned s.t. above looks neater)
//####################################################################
pistols.baseType.blurb = "Simplest firearm and [typically] default weapon. Fires ~7 shot burst before reload delay";
pistols.subType1.blurb = "Basically: base type ✕ 2";
pistols.subType2.blurb = "Basically: better [DAM] and [RGE] at cost of [ROF] ";

prec_guns.baseType.blurb = "Average rifle as owned by your typical neighborhood outdoorsman";
prec_guns.subType1.blurb = "Think AR-15. Ideal for CQC and engaging small[er] groups of zombies / enemy infantry";
prec_guns.subType2.blurb = "Ideal for dispatching smaller groups of zombies / enemy infantry at long[er] distance";

auto_guns.baseType.blurb = "Might add ‘Dual SMGs’ global upgrade that would increase DAM from [LOW] to [MED]";
auto_guns.subType1.blurb = "Think M-16. Ideal for combat / suppressing fire on small to mid sized groups of bodies";
auto_guns.subType2.blurb = "Minigun Goez Brrrrrr! Note: Might implement a ‘wind-up’ delay before bullets pour out";

frag_guns.baseType.blurb = "Average shotgun as owned by your typical neighborhood shopkeeper [Rooftop Korean]";
frag_guns.subType1.blurb = "Semi-Auto shotgun, firing burst of 6-8 shots before reload delay";
frag_guns.subType2.blurb = "Think Double-Barrel shotgun. Analogous to ‘SuperShotGun’ of [classic] Doom";

proj_guns.baseType.blurb = "Simple base version (i.e. longer [ROF] and shorter [RGE] than its successor upgrade)";
proj_guns.subType1.blurb = "Improved [ROF] and [RGE] of base type (i.e. enough to more than merit upgrade cost)";
proj_guns.subType2.blurb = "Intended for human enemy anti-air/armor, but ironically also good for packs of zombies!";

energy_guns.baseType.blurb = "Goes 'pew, pew, pew’, and analogous to TD-P5JS 'Laser Blaster Tower' ";
energy_guns.subType1.blurb = "‘Semi-Automatic’ improvement with different VFX (i.e. ‘plasma ball’ <vs> ‘beam rod’)";
energy_guns.subType2.blurb = "‘Sniper Rifle’ improvement which fires single but powerful and long-range ‘beam point’";