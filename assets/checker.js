(function () {
  const C = window.AETHERBOUND;
  const form = document.getElementById("checker-form");
  const cmdInput = document.getElementById("cmd-input");
  const deckInput = document.getElementById("deck-input");
  const btn = document.getElementById("check-btn");
  const statusEl = document.getElementById("check-status");
  const progress = document.getElementById("check-progress");
  const bar = progress.querySelector("div");
  const results = document.getElementById("results");
  const esc = AB.esc;

  const STATUS_LABEL = {
    legal: "Legal", banned: "Banned", notinpool: "Not in pool",
    notlegal: "Not legal", notfound: "Not found"
  };

  document.getElementById("sample-btn").addEventListener("click", () => {
    cmdInput.value = "Omnath, Locus of Mana";
    deckInput.value = [
      "1 Sol Ring", "1 Birds of Paradise", "1 Llanowar Elves", "1 Craterhoof Behemoth",
      "1 Eternal Witness", "1 Cultivate", "1 Kodama's Reach", "1 Rampant Growth",
      "1 Ragavan, Nimble Pilferer", "1 Green Sun's Zenith", "1 Sylvan Library",
      "1 Aragorn, the Uniter", "1 Counterspell", "1 Primeval Titan", "40 Forest"
    ].join("\n");
  });

  function setProgress(stage, frac) {
    progress.classList.remove("hidden");
    bar.style.width = Math.round(frac * 100) + "%";
    statusEl.textContent = stage;
  }

  form.addEventListener("submit", async e => {
    e.preventDefault();
    const parsed = AB.parseDeck(deckInput.value);
    cmdInput.value.split(/\r?\n/).map(s => s.trim()).filter(Boolean)
      .forEach(name => parsed.commanders.push({ qty: 1, name: AB.parseDeck(name).cards[0]?.name || name }));

    if (!parsed.cards.length && !parsed.commanders.length) {
      results.innerHTML = `<div class="card muted">Paste a decklist first.</div>`;
      return;
    }
    btn.disabled = true;
    try {
      await check(parsed);
    } catch (err) {
      results.innerHTML = `<div class="summary bad"><div><div class="big">Couldn't reach Scryfall</div><div class="muted">${esc(err.message)}. Try again in a moment.</div></div></div>`;
    } finally {
      btn.disabled = false;
      progress.classList.add("hidden");
      statusEl.textContent = "";
    }
  });

  async function check({ cards, commanders }) {
    // Merge duplicate lines
    const entries = new Map();
    const add = (e, isCmd) => {
      const key = AB.norm(e.name);
      const cur = entries.get(key) || { name: e.name, qty: 0, isCmd: false };
      // A commander named in the box, under a heading, and/or in the list is still one card
      if (cur.isCmd || (isCmd && cur.qty)) cur.qty = Math.max(cur.qty, e.qty);
      else cur.qty += e.qty;
      cur.isCmd = cur.isCmd || isCmd;
      entries.set(key, cur);
    };
    commanders.forEach(e => add(e, true));
    cards.forEach(e => add(e, false));

    const names = [...entries.values()].map(e => e.name);
    setProgress("Looking up cards…", 0);
    const { found, notFound } = await AB.lookupNames(names, f => setProgress("Looking up cards…", f * 0.3));

    // Map scryfall card back to entry (collection lookup is case/format tolerant)
    const byNorm = new Map();
    found.forEach(c => {
      byNorm.set(AB.norm(c.name), c);
      if (c.card_faces) byNorm.set(AB.norm(c.card_faces[0].name), c);
    });
    const nf = new Set(notFound.map(AB.norm));

    const rows = [];
    for (const e of entries.values()) {
      const card = byNorm.get(AB.norm(e.name)) || byNorm.get(AB.norm(e.name.split(" // ")[0]));
      rows.push({ ...e, card: nf.has(AB.norm(e.name)) ? null : card || null });
    }

    const needPrints = rows.filter(r => r.card && !AB.BASICS.has(r.card.name)).map(r => AB.oracleOf(r.card));
    const prints = await AB.printsFor(needPrints, f => setProgress("Checking printings…", 0.3 + f * 0.7));

    rows.forEach(r => {
      if (!r.card) { r.result = { status: "notfound", reason: "No card with this name", legalSets: [] }; return; }
      r.result = AB.evaluate(r.card, prints.get(AB.oracleOf(r.card)));
    });

    render(rows);
  }

  function render(rows) {
    const issues = [];
    const warns = [];
    const cmds = rows.filter(r => r.isCmd);
    const total = rows.reduce((n, r) => n + r.qty, 0);

    // Commander checks
    if (!cmds.length) issues.push("No commander. Add one in the commander box or under a “Commander” heading.");
    if (cmds.length > 2) issues.push(`${cmds.length} commanders listed; a deck can have at most two (with Partner or a similar ability).`);
    cmds.forEach(r => {
      if (r.card && !AB.canBeCommander(r.card)) issues.push(`${r.card.name} can't be a commander (not a legendary creature).`);
    });
    if (cmds.length === 2 && cmds.every(r => r.card)) {
      const pairing = /\b(Partner|Friends forever|Choose a Background|Doctor's companion)\b/i;
      const txt = r => r.card.oracle_text || (r.card.card_faces || []).map(f => f.oracle_text).join(" ") || "";
      if (!cmds.some(r => pairing.test(txt(r)) || /Background/.test(r.card.type_line)))
        warns.push("Two commanders listed, but neither has Partner or a similar pairing ability.");
    }

    // Size
    if (total !== C.deck.size) issues.push(`Deck has ${total} cards (including commander${cmds.length > 1 ? "s" : ""}); it needs exactly ${C.deck.size}.`);

    // Singleton
    rows.forEach(r => {
      if (!r.card) return;
      const limit = AB.multipleLimit(r.card);
      if (r.qty > limit) issues.push(`${r.qty} copies of ${r.card.name} — singleton allows ${limit === 1 ? "only one" : "up to " + limit}.`);
    });

    // Color identity
    const identity = new Set(cmds.filter(r => r.card).flatMap(r => r.card.color_identity || []));
    rows.forEach(r => {
      r.offColor = false;
      if (!r.card || r.isCmd || !cmds.length) return;
      const off = (r.card.color_identity || []).filter(c => !identity.has(c));
      if (off.length) { r.offColor = true; issues.push(`${r.card.name} is outside your commander's color identity (${off.join("")}).`); }
    });

    // Legality
    const bad = rows.filter(r => r.result.status !== "legal");
    bad.forEach(r => issues.push(`${r.card ? r.card.name : r.name}: ${STATUS_LABEL[r.result.status].toLowerCase()} — ${r.result.reason}.`));

    const ok = !issues.length;
    const idStr = identity.size ? [...identity].join("") : "C";
    const order = { notfound: 0, banned: 1, notinpool: 2, notlegal: 3, legal: 4 };
    rows.sort((a, b) => (b.isCmd - a.isCmd) || (order[a.result.status] - order[b.result.status]) || (b.offColor - a.offColor) || a.name.localeCompare(b.name));

    results.innerHTML = `
      <div class="summary ${ok ? "ok" : "bad"}">
        <div>
          <div class="big">${ok ? "Aetherbound legal" : `${issues.length} issue${issues.length === 1 ? "" : "s"} found`}</div>
          <div class="muted small">${total} cards · ${rows.length} unique · color identity ${esc(idStr)} · ${bad.length} card${bad.length === 1 ? "" : "s"} not legal</div>
        </div>
      </div>
      ${issues.length || warns.length ? `<ul class="issues">${issues.map(i => `<li>${esc(i)}</li>`).join("")}${warns.map(w => `<li class="warn">${esc(w)}</li>`).join("")}</ul>` : ""}
      <div class="card" style="padding:8px 12px;overflow-x:auto">
        <table class="result-table">
          <thead><tr><th>Qty</th><th>Card</th><th>Status</th><th>Legal via</th></tr></thead>
          <tbody>${rows.map(rowHtml).join("")}</tbody>
        </table>
      </div>`;
  }

  function rowHtml(r) {
    const name = r.card
      ? `<a href="${esc(r.card.scryfall_uri)}" rel="noopener">${esc(r.card.name)}</a>`
      : esc(r.name);
    const pill = r.offColor && r.result.status === "legal"
      ? `<span class="pill warn">Off-color</span>`
      : `<span class="pill ${r.result.status}">${STATUS_LABEL[r.result.status]}</span>`;
    const via = r.result.status === "legal"
      ? (r.result.legalSets.length ? r.result.legalSets.slice(0, 4).map(s => s.toUpperCase()).join(", ") + (r.result.legalSets.length > 4 ? "…" : "") : r.result.reason)
      : r.result.reason;
    return `<tr><td>${r.qty}</td><td>${name}${r.isCmd ? ' <span class="pill legal" style="background:rgba(227,187,102,.15);color:var(--gold)">Commander</span>' : ""}</td><td>${pill}</td><td class="muted small">${esc(via)}</td></tr>`;
  }
})();
