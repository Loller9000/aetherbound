(async function () {
  const C = window.AETHERBOUND;
  const statusEl = document.getElementById("ban-status");
  const root = document.getElementById("ban-root");
  const progress = document.getElementById("ban-progress");
  const bar = progress.querySelector("div");
  const esc = AB.esc;
  const unbans = new Set(C.unbans.map(AB.norm));

  const link = (c, name) => c
    ? `<a class="ban-item" href="${esc(c.scryfall_uri)}" rel="noopener"><span class="pill banned">Banned</span>${esc(c.name)}</a>`
    : `<div class="ban-item"><span class="pill banned">Banned</span>${esc(name)}</div>`;

  try {
    const banned = (await AB.searchAll("banned:commander", "&order=name"))
      .filter(c => !unbans.has(AB.norm(c.name)));

    // Extra Aetherbound bans
    let extra = [];
    if (C.extraBans.length) {
      const { found, notFound } = await AB.lookupNames(C.extraBans);
      extra = found.map(c => ({ c })).concat(notFound.map(name => ({ name })));
    }

    progress.classList.remove("hidden");
    statusEl.textContent = "Checking which banned cards are in the Aetherbound pool…";
    const prints = await AB.printsFor(banned.map(AB.oracleOf), f => bar.style.width = Math.round(f * 100) + "%");
    progress.classList.add("hidden");

    const inPool = banned.filter(c => (prints.get(AB.oracleOf(c)) || []).some(AB.isLegalPrinting));
    const outPool = banned.filter(c => !inPool.includes(c));

    statusEl.textContent = "";
    root.innerHTML = `
      <h2>Aetherbound-specific bans <span class="muted small">(${extra.length})</span></h2>
      ${extra.length ? `<div class="ban-grid">${extra.map(x => link(x.c, x.name)).join("")}</div>` : `<p class="muted">None yet. Aetherbound currently uses the Commander banlist as-is.</p>`}
      ${C.unbans.length ? `<h2>Unbanned in Aetherbound</h2><div class="ban-grid">${C.unbans.map(n => `<div class="ban-item"><span class="pill legal">Legal</span>${esc(n)}</div>`).join("")}</div>` : ""}
      <h2>Commander bans in the Aetherbound pool <span class="muted small">(${inPool.length})</span></h2>
      <div class="ban-grid">${inPool.map(c => link(c)).join("")}</div>
      <h2>Commander bans already outside the pool <span class="muted small">(${outPool.length})</span></h2>
      <p class="muted">These are banned in Commander but never printed in an Aetherbound set, so they wouldn't be legal anyway.</p>
      <div class="ban-grid">${outPool.map(c => link(c).replace('class="ban-item"', 'class="ban-item dim"')).join("")}</div>`;
  } catch (err) {
    progress.classList.add("hidden");
    statusEl.textContent = `Couldn't load the banlist from Scryfall (${err.message}). Refresh to try again.`;
  }
})();
