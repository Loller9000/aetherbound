/* =====================================================================
   Aetherbound legality engine — talks to the public Scryfall API
   from the visitor's browser. No server or build step needed.
   ===================================================================== */
(function () {
  const API = "https://api.scryfall.com";
  const CFG = window.AETHERBOUND;
  const BASICS = new Set([
    "Plains", "Island", "Swamp", "Mountain", "Forest", "Wastes",
    "Snow-Covered Plains", "Snow-Covered Island", "Snow-Covered Swamp",
    "Snow-Covered Mountain", "Snow-Covered Forest", "Snow-Covered Wastes"
  ]);
  const norm = s => s.toLowerCase().normalize("NFKD").replace(/[̀-ͯ]/g, "").trim();
  const extraBans = new Set(CFG.extraBans.map(norm));
  const unbans = new Set(CFG.unbans.map(norm));

  /* ---- polite, serialized requests (Scryfall asks for ~10/sec max) ---- */
  let queue = Promise.resolve();
  function request(url, opts) {
    const run = async () => {
      await new Promise(r => setTimeout(r, 110));
      const res = await fetch(url, Object.assign({ headers: { Accept: "application/json" } }, opts));
      const body = await res.json().catch(() => ({}));
      if (!res.ok && res.status !== 404) {
        const err = new Error(body.details || `Scryfall returned ${res.status}`);
        err.status = res.status;
        throw err;
      }
      return { status: res.status, body };
    };
    const p = queue.then(run, run);
    queue = p.catch(() => {});
    return p;
  }

  async function searchAll(q, extra = "", maxPages = 20) {
    let url = `${API}/cards/search?q=${encodeURIComponent(q)}${extra}`;
    const out = [];
    for (let i = 0; url && i < maxPages; i++) {
      const { status, body } = await request(url);
      if (status === 404) break;
      out.push(...body.data);
      url = body.has_more ? body.next_page : null;
    }
    return out;
  }

  const oracleOf = c => c.oracle_id || (c.card_faces && c.card_faces[0].oracle_id);
  const chunk = (arr, n) => arr.reduce((a, x, i) => (i % n ? a[a.length - 1].push(x) : a.push([x]), a), []);

  /* Look up cards by name (75 per request). */
  async function lookupNames(names, onProgress) {
    const found = [], notFound = [];
    const batches = chunk(names, 75);
    for (let i = 0; i < batches.length; i++) {
      const { body } = await request(`${API}/cards/collection`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ identifiers: batches[i].map(name => ({ name })) })
      });
      found.push(...(body.data || []));
      (body.not_found || []).forEach(n => notFound.push(n.name));
      onProgress && onProgress((i + 1) / batches.length);
    }
    return { found, notFound };
  }

  /* All paper printings for a list of oracle ids. */
  async function printsFor(oracleIds, onProgress) {
    const map = new Map();
    const batches = chunk([...new Set(oracleIds)], 10);
    for (let i = 0; i < batches.length; i++) {
      const q = `game:paper unique:prints (${batches[i].map(id => "oracleid:" + id).join(" or ")})`;
      const prints = await searchAll(q, "&include_extras=true");
      prints.forEach(p => {
        const id = oracleOf(p);
        if (!map.has(id)) map.set(id, []);
        map.get(id).push(p);
      });
      onProgress && onProgress((i + 1) / batches.length);
    }
    return map;
  }

  function isLegalPrinting(p) {
    return CFG.legalSetCodes.has(p.set) && p.security_stamp !== "triangle" && !p.digital;
  }

  /* Decide a single card's Aetherbound status.
     Returns { status: "legal" | "banned" | "notinpool" | "notlegal", reason, legalSets } */
  function evaluate(card, prints) {
    const name = card.name;
    if (BASICS.has(name)) return { status: "legal", reason: "Basic land", legalSets: [] };
    const legalPrints = (prints || []).filter(isLegalPrinting);
    const legalSets = [...new Set(legalPrints.map(p => p.set))];
    if (!legalSets.length) {
      const ub = (prints || []).some(p => p.security_stamp === "triangle");
      return {
        status: "notinpool",
        reason: ub ? "Universes Beyond card with no Aetherbound printing" : "Never printed in a legal set",
        legalSets
      };
    }
    const n = norm(name);
    if (extraBans.has(n)) return { status: "banned", reason: "Banned in Aetherbound", legalSets };
    const cmd = card.legalities && card.legalities.commander;
    if (cmd === "banned" && !unbans.has(n)) return { status: "banned", reason: "On the Commander banlist", legalSets };
    if (cmd === "not_legal" && !unbans.has(n)) return { status: "notlegal", reason: "Not legal in Commander (ante, conspiracy, etc.)", legalSets };
    return { status: "legal", reason: "", legalSets };
  }

  function canBeCommander(card) {
    const type = card.type_line || (card.card_faces && card.card_faces[0].type_line) || "";
    const text = (card.oracle_text || (card.card_faces || []).map(f => f.oracle_text).join("\n") || "");
    const front = type.split("//")[0];
    return (/Legendary/.test(front) && /Creature/.test(front)) || /can be your commander/i.test(text);
  }

  function allowsMultiples(card) {
    if (BASICS.has(card.name)) return true;
    const text = card.oracle_text || "";
    return /A deck can have any number of cards named/i.test(text) || /A deck can have up to (\w+) cards named/i.test(text);
  }

  function multipleLimit(card) {
    if (BASICS.has(card.name)) return Infinity;
    const m = /A deck can have up to (\w+) cards named/i.exec(card.oracle_text || "");
    if (m) {
      const words = { one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10 };
      return words[m[1].toLowerCase()] || parseInt(m[1], 10) || Infinity;
    }
    return /any number of cards named/i.test(card.oracle_text || "") ? Infinity : 1;
  }

  /* Parse a pasted decklist. Accepts "1 Sol Ring", "1x Sol Ring (C21) 263",
     "Sol Ring", MTGO/Arena/Moxfield exports. Lines under a "Commander"
     heading are treated as commanders. */
  function parseDeck(text) {
    const cards = [], commanders = [];
    let section = "main";
    text.split(/\r?\n/).forEach(raw => {
      let line = raw.trim();
      if (!line) { if (section === "cmd") section = "main"; return; }   // blank line ends the commander block
      if (section === "cmd" && commanders.length >= 2) section = "main"; // a deck has at most two commanders
      if (line.startsWith("//") || line.startsWith("#")) {
        const h = line.replace(/^[\/#\s]+/, "").toLowerCase();
        if (/^commanders?\b/.test(h)) section = "cmd";
        else if (h) section = /sideboard|maybe/.test(h) ? "skip" : "main";
        return;
      }
      const heading = line.replace(/:$/, "").toLowerCase();
      if (/^(commanders?|command zone)$/.test(heading)) { section = "cmd"; return; }
      if (/^(deck|main|mainboard|companion|lands?|creatures?|instants?|sorcery|sorceries|artifacts?|enchantments?|planeswalkers?|battles?|other)( \(\d+\))?$/.test(heading)) { section = "main"; return; }
      if (/^(sideboard|maybeboard|considering|tokens?)( \(\d+\))?$/.test(heading)) { section = "skip"; return; }
      if (section === "skip") return;
      let isCmd = section === "cmd";
      if (/\*cmdr\*|\[commander\]/i.test(line)) { isCmd = true; line = line.replace(/\*cmdr\*|\[commander\]/ig, ""); }
      const m = /^(\d+)\s*x?\s+(.+)$/i.exec(line);
      let qty = 1, name = line;
      if (m) { qty = parseInt(m[1], 10); name = m[2]; }
      name = name
        .replace(/\s*\*[A-Z]+\*\s*/g, " ")       // *F* foil markers
        .replace(/\s+\([A-Za-z0-9]{2,6}\)\s*[\w\-★]*\s*$/, "") // (SET) 123
        .replace(/\s+\[[^\]]*\]\s*$/, "")         // [tags]
        .replace(/\s+\/\s+/g, " // ")
        .trim();
      if (!name) return;
      (isCmd ? commanders : cards).push({ qty, name });
    });
    return { cards, commanders };
  }

  window.AB = {
    API, request, searchAll, lookupNames, printsFor, evaluate, isLegalPrinting,
    canBeCommander, allowsMultiples, multipleLimit, parseDeck, oracleOf, norm, BASICS,
    imageOf(card, size = "normal") {
      if (card.image_uris) return card.image_uris[size];
      if (card.card_faces && card.card_faces[0].image_uris) return card.card_faces[0].image_uris[size];
      return "";
    },
    esc(s) { return String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])); }
  };
})();
