(function () {
  const C = window.AETHERBOUND;
  const form = document.getElementById("search-form");
  const input = document.getElementById("search-input");
  const statusEl = document.getElementById("search-status");
  const grid = document.getElementById("search-results");
  const moreBtn = document.getElementById("more-btn");
  const esc = AB.esc;

  const unbans = new Set(C.unbans.map(AB.norm));
  const extraBans = new Set(C.extraBans.map(AB.norm));
  const setFilter = "(" + [...C.legalSetCodes].map(c => "e:" + c).join(" or ") + ")";
  let nextPage = null, shown = 0, total = 0, fallbackMode = false;

  const examples = [
    ["Legendary creatures", "t:legendary t:creature"],
    ["Green ramp", "id:g o:\"search your library\" o:land t:sorcery"],
    ["Cheap counterspells", "o:\"counter target spell\" cmc<=2"],
    ["Board wipes", "o:\"destroy all creatures\""],
    ["Mana rocks", "t:artifact o:\"add {\" cmc<=3 -t:creature"]
  ];
  document.getElementById("chips").innerHTML = examples
    .map(([label, q]) => `<button class="chip" type="button" data-q="${esc(q)}">${esc(label)}</button>`).join("");
  document.getElementById("chips").addEventListener("click", e => {
    const q = e.target.dataset && e.target.dataset.q;
    if (q) { input.value = q; run(); }
  });

  function isAllowed(card) {
    const n = AB.norm(card.name);
    if (extraBans.has(n)) return false;
    const leg = card.legalities && card.legalities.commander;
    if (leg !== "legal" && leg !== "restricted" && !unbans.has(n)) return false;
    if (fallbackMode && !C.legalSetCodes.has(card.set)) return false;
    return card.security_stamp !== "triangle";
  }

  function tile(card) {
    const img = AB.imageOf(card, "normal");
    return `<a class="mtg-card" href="${esc(card.scryfall_uri)}" rel="noopener" title="${esc(card.name)}">
      ${img ? `<img loading="lazy" src="${esc(img)}" alt="${esc(card.name)}">` : `<div class="fallback">${esc(card.name)}</div>`}
    </a>`;
  }

  async function fetchPage(url) {
    const { status, body } = await AB.request(url);
    if (status === 404) return { data: [], total: 0, next: null };
    return { data: body.data, total: body.total_cards, next: body.has_more ? body.next_page : null };
  }

  function show(page, append) {
    const cards = page.data.filter(isAllowed);
    if (!append) { grid.innerHTML = ""; shown = 0; total = page.total; }
    grid.insertAdjacentHTML("beforeend", cards.map(tile).join(""));
    shown += cards.length;
    nextPage = page.next;
    moreBtn.classList.toggle("hidden", !nextPage);
    statusEl.textContent = total
      ? `Showing ${shown} Aetherbound-legal card${shown === 1 ? "" : "s"}${nextPage ? ` (about ${total} matches)` : ""}.`
      : "No Aetherbound-legal cards match that search.";
  }

  async function run() {
    const q = input.value.trim();
    if (!q) return;
    history.replaceState(null, "", "?q=" + encodeURIComponent(q));
    statusEl.textContent = "Searching…";
    grid.innerHTML = "";
    moreBtn.classList.add("hidden");
    const full = `(${q}) game:paper ${setFilter}`;
    fallbackMode = false;
    try {
      show(await fetchPage(`${AB.API}/cards/search?order=name&q=${encodeURIComponent(full)}`), false);
    } catch (err) {
      // If the long set filter is ever rejected, fall back to a set-type filter
      // and check each result's set in the browser.
      if (err.status !== 400 && err.status !== 422) { statusEl.textContent = err.message; return; }
      try {
        const alt = `(${q}) game:paper (st:core or st:expansion) ` + C.universesBeyondSets.map(s => "-e:" + s.code).join(" ");
        fallbackMode = true;
        show(await fetchPage(`${AB.API}/cards/search?order=name&q=${encodeURIComponent(alt)}`), false);
      } catch (err2) {
        statusEl.textContent = err2.message;
      }
    }
  }

  form.addEventListener("submit", e => { e.preventDefault(); run(); });
  moreBtn.addEventListener("click", async () => {
    if (!nextPage) return;
    moreBtn.disabled = true;
    try { show(await fetchPage(nextPage), true); } catch (err) { statusEl.textContent = err.message; }
    moreBtn.disabled = false;
  });

  const initial = new URLSearchParams(location.search).get("q");
  if (initial) { input.value = initial; run(); }
})();
