/* =====================================================================
   AETHERBOUND FORMAT CONFIG
   ---------------------------------------------------------------------
   This is the single file to edit when the format changes.
   Every page (sets list, banlist, deck checker, card search) reads it.

   Set codes are Scryfall set codes (lowercase). Look any set up at
   https://scryfall.com/sets
   ===================================================================== */

window.AETHERBOUND = {
  lastUpdated: "2026-09-29",

  /* Sets printed before the Standard (Type II) format existed. */
  preStandardSets: [
    { code: "lea", name: "Limited Edition Alpha", year: 1993 },
    { code: "leb", name: "Limited Edition Beta", year: 1993 },
    { code: "2ed", name: "Unlimited Edition", year: 1993 },
    { code: "arn", name: "Arabian Nights", year: 1993 },
    { code: "atq", name: "Antiquities", year: 1994 },
    { code: "3ed", name: "Revised Edition", year: 1994 },
    { code: "leg", name: "Legends", year: 1994 },
    { code: "drk", name: "The Dark", year: 1994 },
    { code: "fem", name: "Fallen Empires", year: 1994 }
  ],

  /* Every paper set that has ever been Standard legal,
     minus Universes Beyond sets (listed separately below). */
  standardSets: [
    { code: "4ed", name: "Fourth Edition", year: 1995 },
    { code: "ice", name: "Ice Age", year: 1995 },
    { code: "chr", name: "Chronicles", year: 1995 },
    { code: "hml", name: "Homelands", year: 1995 },
    { code: "all", name: "Alliances", year: 1996 },
    { code: "mir", name: "Mirage", year: 1996 },
    { code: "vis", name: "Visions", year: 1997 },
    { code: "5ed", name: "Fifth Edition", year: 1997 },
    { code: "wth", name: "Weatherlight", year: 1997 },
    { code: "tmp", name: "Tempest", year: 1997 },
    { code: "sth", name: "Stronghold", year: 1998 },
    { code: "exo", name: "Exodus", year: 1998 },
    { code: "usg", name: "Urza's Saga", year: 1998 },
    { code: "ulg", name: "Urza's Legacy", year: 1999 },
    { code: "6ed", name: "Classic Sixth Edition", year: 1999 },
    { code: "uds", name: "Urza's Destiny", year: 1999 },
    { code: "mmq", name: "Mercadian Masques", year: 1999 },
    { code: "nem", name: "Nemesis", year: 2000 },
    { code: "pcy", name: "Prophecy", year: 2000 },
    { code: "inv", name: "Invasion", year: 2000 },
    { code: "pls", name: "Planeshift", year: 2001 },
    { code: "7ed", name: "Seventh Edition", year: 2001 },
    { code: "apc", name: "Apocalypse", year: 2001 },
    { code: "ody", name: "Odyssey", year: 2001 },
    { code: "tor", name: "Torment", year: 2002 },
    { code: "jud", name: "Judgment", year: 2002 },
    { code: "ons", name: "Onslaught", year: 2002 },
    { code: "lgn", name: "Legions", year: 2003 },
    { code: "scg", name: "Scourge", year: 2003 },
    { code: "8ed", name: "Eighth Edition", year: 2003 },
    { code: "mrd", name: "Mirrodin", year: 2003 },
    { code: "dst", name: "Darksteel", year: 2004 },
    { code: "5dn", name: "Fifth Dawn", year: 2004 },
    { code: "chk", name: "Champions of Kamigawa", year: 2004 },
    { code: "bok", name: "Betrayers of Kamigawa", year: 2005 },
    { code: "sok", name: "Saviors of Kamigawa", year: 2005 },
    { code: "9ed", name: "Ninth Edition", year: 2005 },
    { code: "rav", name: "Ravnica: City of Guilds", year: 2005 },
    { code: "gpt", name: "Guildpact", year: 2006 },
    { code: "dis", name: "Dissension", year: 2006 },
    { code: "csp", name: "Coldsnap", year: 2006 },
    { code: "tsp", name: "Time Spiral", year: 2006 },
    { code: "tsb", name: "Time Spiral Timeshifted", year: 2006 },
    { code: "plc", name: "Planar Chaos", year: 2007 },
    { code: "fut", name: "Future Sight", year: 2007 },
    { code: "10e", name: "Tenth Edition", year: 2007 },
    { code: "lrw", name: "Lorwyn", year: 2007 },
    { code: "mor", name: "Morningtide", year: 2008 },
    { code: "shm", name: "Shadowmoor", year: 2008 },
    { code: "eve", name: "Eventide", year: 2008 },
    { code: "ala", name: "Shards of Alara", year: 2008 },
    { code: "con", name: "Conflux", year: 2009 },
    { code: "arb", name: "Alara Reborn", year: 2009 },
    { code: "m10", name: "Magic 2010", year: 2009 },
    { code: "zen", name: "Zendikar", year: 2009 },
    { code: "wwk", name: "Worldwake", year: 2010 },
    { code: "roe", name: "Rise of the Eldrazi", year: 2010 },
    { code: "m11", name: "Magic 2011", year: 2010 },
    { code: "som", name: "Scars of Mirrodin", year: 2010 },
    { code: "mbs", name: "Mirrodin Besieged", year: 2011 },
    { code: "nph", name: "New Phyrexia", year: 2011 },
    { code: "m12", name: "Magic 2012", year: 2011 },
    { code: "isd", name: "Innistrad", year: 2011 },
    { code: "dka", name: "Dark Ascension", year: 2012 },
    { code: "avr", name: "Avacyn Restored", year: 2012 },
    { code: "m13", name: "Magic 2013", year: 2012 },
    { code: "rtr", name: "Return to Ravnica", year: 2012 },
    { code: "gtc", name: "Gatecrash", year: 2013 },
    { code: "dgm", name: "Dragon's Maze", year: 2013 },
    { code: "m14", name: "Magic 2014", year: 2013 },
    { code: "ths", name: "Theros", year: 2013 },
    { code: "bng", name: "Born of the Gods", year: 2014 },
    { code: "jou", name: "Journey into Nyx", year: 2014 },
    { code: "m15", name: "Magic 2015", year: 2014 },
    { code: "ktk", name: "Khans of Tarkir", year: 2014 },
    { code: "frf", name: "Fate Reforged", year: 2015 },
    { code: "dtk", name: "Dragons of Tarkir", year: 2015 },
    { code: "ori", name: "Magic Origins", year: 2015 },
    { code: "bfz", name: "Battle for Zendikar", year: 2015 },
    { code: "ogw", name: "Oath of the Gatewatch", year: 2016 },
    { code: "soi", name: "Shadows over Innistrad", year: 2016 },
    { code: "w16", name: "Welcome Deck 2016", year: 2016 },
    { code: "emn", name: "Eldritch Moon", year: 2016 },
    { code: "kld", name: "Kaladesh", year: 2016 },
    { code: "aer", name: "Aether Revolt", year: 2017 },
    { code: "w17", name: "Welcome Deck 2017", year: 2017 },
    { code: "akh", name: "Amonkhet", year: 2017 },
    { code: "hou", name: "Hour of Devastation", year: 2017 },
    { code: "xln", name: "Ixalan", year: 2017 },
    { code: "rix", name: "Rivals of Ixalan", year: 2018 },
    { code: "dom", name: "Dominaria", year: 2018 },
    { code: "m19", name: "Core Set 2019", year: 2018 },
    { code: "grn", name: "Guilds of Ravnica", year: 2018 },
    { code: "rna", name: "Ravnica Allegiance", year: 2019 },
    { code: "war", name: "War of the Spark", year: 2019 },
    { code: "m20", name: "Core Set 2020", year: 2019 },
    { code: "eld", name: "Throne of Eldraine", year: 2019 },
    { code: "thb", name: "Theros Beyond Death", year: 2020 },
    { code: "iko", name: "Ikoria: Lair of Behemoths", year: 2020 },
    { code: "m21", name: "Core Set 2021", year: 2020 },
    { code: "znr", name: "Zendikar Rising", year: 2020 },
    { code: "khm", name: "Kaldheim", year: 2021 },
    { code: "stx", name: "Strixhaven: School of Mages", year: 2021 },
    { code: "afr", name: "Adventures in the Forgotten Realms", year: 2021 },
    { code: "mid", name: "Innistrad: Midnight Hunt", year: 2021 },
    { code: "vow", name: "Innistrad: Crimson Vow", year: 2021 },
    { code: "neo", name: "Kamigawa: Neon Dynasty", year: 2022 },
    { code: "snc", name: "Streets of New Capenna", year: 2022 },
    { code: "dmu", name: "Dominaria United", year: 2022 },
    { code: "bro", name: "The Brothers' War", year: 2022 },
    { code: "one", name: "Phyrexia: All Will Be One", year: 2023 },
    { code: "mom", name: "March of the Machine", year: 2023 },
    { code: "mat", name: "March of the Machine: The Aftermath", year: 2023 },
    { code: "woe", name: "Wilds of Eldraine", year: 2023 },
    { code: "lci", name: "The Lost Caverns of Ixalan", year: 2023 },
    { code: "mkm", name: "Murders at Karlov Manor", year: 2024 },
    { code: "otj", name: "Outlaws of Thunder Junction", year: 2024 },
    { code: "big", name: "The Big Score", year: 2024 },
    { code: "blb", name: "Bloomburrow", year: 2024 },
    { code: "dsk", name: "Duskmourn: House of Horror", year: 2024 },
    { code: "fdn", name: "Foundations", year: 2024 },
    { code: "dft", name: "Aetherdrift", year: 2025 },
    { code: "tdm", name: "Tarkir: Dragonstorm", year: 2025 },
    { code: "eoe", name: "Edge of Eternities", year: 2025 },
    { code: "ecl", name: "Lorwyn Eclipsed", year: 2026 },
    { code: "sos", name: "Secrets of Strixhaven", year: 2026 },
    { code: "fra", name: "Reality Fracture", year: 2026 }
  ],

  /* Standard-legal Universes Beyond sets. Shown on the site as excluded;
     never counted as legal printings. */
  universesBeyondSets: [
    { code: "fin", name: "Final Fantasy", year: 2025 },
    { code: "spm", name: "Marvel's Spider-Man", year: 2025 },
    { code: "tla", name: "Avatar: The Last Airbender", year: 2025 },
    { code: "tmt", name: "Teenage Mutant Ninja Turtles", year: 2026 },
    { code: "msh", name: "Marvel Super Heroes", year: 2026 },
    { code: "hob", name: "The Hobbit", year: 2026 },
    { code: "trk", name: "Star Trek", year: 2026 }
  ],

  /* Product lines that never count as a legal printing.
     (Display only — anything not in the two lists above is already excluded.) */
  excludedProductLines: [
    "Modern Horizons (MH1, MH2, MH3) and Modern Horizons 3 Commander",
    "Masters sets (Modern Masters, Eternal Masters, Double Masters, Commander Masters, etc.)",
    "Commander precons and Commander-only sets (Commander Legends, CMM, set-specific precons)",
    "Standard-set bonus sheets that were not Standard legal (Mystical Archive, Retro Artifacts, Multiverse Legends, Enchanting Tales, Special Guests, Breaking News)",
    "Remastered sets (Time Spiral Remastered, Dominaria Remastered, Ravnica Remastered, etc.)",
    "Secret Lair, The List, promos, and other supplemental products",
    "Conspiracy, Battlebond, Jumpstart, Portal, Starter sets, Un-sets",
    "All Universes Beyond cards, in any product",
    "Digital-only cards (Alchemy, Arena-only sets, Through the Omenpaths)"
  ],

  /* Aetherbound uses the official Commander banlist (pulled live from
     Scryfall), plus these adjustments. Use exact English card names. */
  extraBans: [
    // "Card Name",
  ],
  unbans: [
    // "Card Name",   // legal in Aetherbound even though banned in Commander
  ],

  deck: {
    size: 100,
    startingLife: 40,
    commanderDamage: 21
  }
};

/* Derived lookup used by the scripts. */
window.AETHERBOUND.legalSetCodes = new Set(
  [...window.AETHERBOUND.preStandardSets, ...window.AETHERBOUND.standardSets].map(s => s.code)
);
