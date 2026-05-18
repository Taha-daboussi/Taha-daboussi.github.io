#!/usr/bin/env python3
"""Build-time only: vendor Google Fonts latin woff2 locally. Not shipped/used at runtime."""
import re, sys, subprocess, pathlib

UA = ("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
      "(KHTML, like Gecko) Chrome/120.0 Safari/537.36")
HERE = pathlib.Path(__file__).parent

FAMILIES = {
    "Newsreader": "Newsreader:opsz,wght@18..72,400;18..72,500;18..72,600",
    "Hanken+Grotesk": "Hanken+Grotesk:wght@400;500;600;700",
    "JetBrains+Mono": "JetBrains+Mono:wght@400;500",
}

def fetch(url):
    return subprocess.run(["curl", "-sS", "--max-time", "30", "-A", UA, url],
                           capture_output=True, check=True).stdout

faces = []
for key, spec in FAMILIES.items():
    css = fetch(f"https://fonts.googleapis.com/css2?family={spec}&display=swap").decode()
    # Split into "/* subset */ @font-face {...}" pairs; keep only the 'latin' subset.
    blocks = re.split(r"/\*\s*([\w-]+)\s*\*/", css)
    for i in range(1, len(blocks), 2):
        subset, body = blocks[i].strip(), blocks[i + 1]
        if subset != "latin":
            continue
        fam = re.search(r"font-family:\s*'([^']+)'", body).group(1)
        wght = re.search(r"font-weight:\s*(\d+)", body).group(1)
        style = re.search(r"font-style:\s*(\w+)", body).group(1)
        url = re.search(r"url\((https://[^)]+\.woff2)\)", body).group(1)
        slug = fam.lower().replace(" ", "-")
        fname = f"{slug}-{wght}.woff2"
        (HERE / fname).write_bytes(fetch(url))
        faces.append((fam, wght, style, fname))
        print(f"  vendored {fname}")

out = ["/* Self-hosted fonts — vendored at build time, zero runtime CDN calls. */"]
for fam, wght, style, fname in faces:
    out.append(
        f"@font-face{{font-family:'{fam}';font-style:{style};font-weight:{wght};"
        f"font-display:swap;src:url('./{fname}') format('woff2');}}"
    )
(HERE / "fonts.css").write_text("\n".join(out) + "\n")
print(f"wrote fonts.css with {len(faces)} faces")
