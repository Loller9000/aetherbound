# Aetherbound website

A static site: plain HTML, CSS, and JavaScript. No build step or server code is needed. Upload the whole folder to any static host (GitHub Pages, Netlify, Cloudflare Pages, Azure Static Web Apps, or a plain web server) and point your domain at it.

## Pages

| File | What it is |
|---|---|
| `index.html` | Home / format overview |
| `rules.html` | Deck construction and game rules |
| `sets.html` | Every legal set, plus what's excluded |
| `banlist.html` | Commander banlist (live from Scryfall) split into "in the pool" and "already outside the pool", plus Aetherbound-specific bans |
| `checker.html` | Deck legality checker |
| `search.html` | Card search limited to Aetherbound-legal cards |

## Changing the format

Edit **`assets/config.js`**. Everything else reads from it.

- **New Standard set released:** add it to `standardSets` using its Scryfall set code (find codes at https://scryfall.com/sets). If it's a Universes Beyond set, add it to `universesBeyondSets` instead.
- **Ban a card for Aetherbound only:** add the exact card name to `extraBans`.
- **Unban a card that's banned in Commander:** add it to `unbans`.
- Update `lastUpdated` (it shows in the footer).

## How legality is decided

A card is legal if it has at least one paper printing in a set in `preStandardSets` or `standardSets`, that printing isn't a Universes Beyond card (Scryfall's triangle security stamp), it's legal in Commander (unless listed in `unbans`), and it isn't in `extraBans`.

The checker and search call the public Scryfall API from each visitor's browser, so card data and the Commander banlist stay current without you doing anything. Scryfall asks for no more than about 10 requests per second; the scripts already space requests out.
