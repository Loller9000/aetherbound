/* Shared header + footer for every page. */
(function () {
  const pages = [
    ["index.html", "Home"],
    ["rules.html", "Rules"],
    ["sets.html", "Legal Sets"],
    ["banlist.html", "Banlist"],
    ["checker.html", "Deck Checker"],
    ["search.html", "Card Search"]
  ];
  const here = (location.pathname.split("/").pop() || "index.html").toLowerCase();
  const sigil = `<svg viewBox="0 0 32 32" aria-hidden="true">
    <defs><linearGradient id="abg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#5fe3cf"/><stop offset="1" stop-color="#e3bb66"/></linearGradient></defs>
    <circle cx="16" cy="16" r="13" fill="none" stroke="url(#abg)" stroke-width="1.6"/>
    <circle cx="16" cy="16" r="7.5" fill="none" stroke="url(#abg)" stroke-width="1.2" stroke-dasharray="2.4 2"/>
    <path d="M16 4.5 L19 16 L16 27.5 L13 16 Z" fill="url(#abg)"/>
  </svg>`;

  const header = document.getElementById("site-header");
  if (header) {
    header.className = "site-header";
    header.innerHTML = `<nav class="nav" aria-label="Main">
      <a class="brand" href="index.html">${sigil}<span>AETHERBOUND</span></a>
      <button class="nav-toggle" aria-expanded="false" aria-controls="nav-links">Menu</button>
      <ul class="nav-links" id="nav-links">
        ${pages.map(([href, label]) => `<li><a href="${href}"${href === here ? ' aria-current="page"' : ""}>${label}</a></li>`).join("")}
      </ul>
    </nav>`;
    const btn = header.querySelector(".nav-toggle");
    const links = header.querySelector(".nav-links");
    btn.addEventListener("click", () => {
      const open = links.classList.toggle("open");
      btn.setAttribute("aria-expanded", open);
    });
  }

  const footer = document.getElementById("site-footer");
  if (footer) {
    footer.className = "site-footer";
    footer.innerHTML = `<div class="inner">
      <p>Aetherbound is an unofficial, community-run Magic: The Gathering format. Card data and images are provided by <a href="https://scryfall.com" rel="noopener">Scryfall</a>.</p>
      <p>Aetherbound is unofficial Fan Content permitted under the Wizards of the Coast Fan Content Policy. Not approved or endorsed by Wizards. Portions of the materials used are property of Wizards of the Coast. &copy; Wizards of the Coast LLC.</p>
      <p>Format rules last updated ${window.AETHERBOUND ? window.AETHERBOUND.lastUpdated : ""}.</p>
    </div>`;
  }
})();
