(function () {
  const C = window.AETHERBOUND;
  const root = document.getElementById("sets-root");
  const filter = document.getElementById("set-filter");
  document.getElementById("set-count").textContent =
    `${C.legalSetCodes.size} sets in the pool.`;

  const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const item = (s, excluded) => `<a class="set-item${excluded ? " excluded" : ""}" href="https://scryfall.com/sets/${s.code}" rel="noopener" data-q="${esc((s.name + " " + s.code + " " + s.year).toLowerCase())}">
      <span class="code">${esc(s.code)}</span><span class="name">${esc(s.name)}</span><span class="year">${s.year}</span></a>`;

  function section(title, blurb, sets, excluded) {
    return `<section class="set-era"><h2>${title} <span class="muted small">(${sets.length})</span></h2>
      <p class="muted">${blurb}</p>
      <div class="set-list">${sets.map(s => item(s, excluded)).join("")}</div></section>`;
  }

  root.innerHTML =
    section("Pre-Standard sets", "Released before the Standard format existed.", C.preStandardSets) +
    section("Standard-legal sets", "Every set that has been legal in Standard, oldest first.", C.standardSets) +
    section("Excluded: Universes Beyond", "These were Standard legal, but Universes Beyond cards are never part of Aetherbound.", C.universesBeyondSets, true) +
    `<section class="set-era"><h2>Also excluded</h2><ul class="plain-list">${C.excludedProductLines.map(l => `<li>${esc(l)}</li>`).join("")}</ul></section>`;

  filter.addEventListener("input", () => {
    const q = filter.value.trim().toLowerCase();
    root.querySelectorAll(".set-item").forEach(el => {
      el.classList.toggle("hidden", q && !el.dataset.q.includes(q));
    });
  });
})();
