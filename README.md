# taha-daboussi.com

Personal portfolio. Single page, no framework, no build step — plain HTML + CSS + vanilla JS, all assets self-hosted (fonts vendored as `woff2`, icons inlined as one SVG sprite). Dark by default with a persisted light toggle.

```
index.html        markup + inline icon sprite
styles.css        all styling (CSS variables, dark/light, responsive)
main.js           theme toggle, mobile nav, scroll-reveal, clock, mailto form
assets/
  fonts/          Newsreader · Hanken Grotesk · JetBrains Mono (woff2, latin)
  Taha_daboussi.pdf   downloadable résumé
  favicon.svg · og-image.png
CNAME             custom domain for GitHub Pages
netlify.toml      zero-config Netlify deploy
```

## Run locally

Any static server works — there is no build:

```bash
cd portfolio
python3 -m http.server 8731
# open http://localhost:8731
```

(Use a server, not `file://` — the inline SVG sprite and fonts need HTTP.)

## Deploy

### Option A — GitHub Pages (configured)

Repo ships a `CNAME` (`taha-daboussi.com`). Push to the default branch, then in
**Settings → Pages**: Source = *Deploy from a branch*, branch = `main`, folder = `/ (root)`.

Then point DNS at the registrar for **taha-daboussi.com**:

| Type  | Name | Value |
|-------|------|-------|
| A     | `@`  | `185.199.108.153` |
| A     | `@`  | `185.199.109.153` |
| A     | `@`  | `185.199.110.153` |
| A     | `@`  | `185.199.111.153` |
| AAAA  | `@`  | `2606:50c0:8000::153` |
| AAAA  | `@`  | `2606:50c0:8001::153` |
| AAAA  | `@`  | `2606:50c0:8002::153` |
| AAAA  | `@`  | `2606:50c0:8003::153` |
| CNAME | `www`| `<github-username>.github.io.` |

In **Settings → Pages → Custom domain** enter `taha-daboussi.com` and tick
**Enforce HTTPS** once the certificate is issued (can take ~15 min–24 h).

### Option B — Netlify

Drag the folder onto app.netlify.com, or:

```bash
npx netlify-cli deploy --prod --dir .
```

`netlify.toml` already sets `publish = "."` with no build command. Add
`taha-daboussi.com` under **Domain settings**; Netlify will supply its own
DNS / nameserver instructions (use those instead of the table above).

## Regenerating assets (rarely needed)

- **Fonts:** `python3 assets/fonts/_vendor.py` re-pulls latin `woff2` + rewrites `fonts.css`.
- **Résumé PDF:** `cat <resume>.md | node ~/.claude/scripts/normalize-ats.mjs | python3 ~/resumes/render.py /dev/stdin assets/Taha_daboussi.pdf` (source: the Exinity Senior Golang résumé).

## Notes

- `.preview/` (Playwright venv + review screenshots) is git-ignored and never deployed.
- No analytics, no trackers, no third-party runtime requests.
- Accessibility: skip link, `:focus-visible` rings, reduced-motion honored, content
  stays readable if JS fails (scroll-reveal is progressive enhancement).
