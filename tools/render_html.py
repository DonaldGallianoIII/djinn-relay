"""
Render every markdown file in the djinn-relay repo to a styled HTML page,
plus an index, so the set can be read in a browser without an editor.

@interacts  reads plugins/, _FromClaude/, docs/ markdown; writes html/ only
@deps       python-markdown (fenced_code, tables); no project imports
@complexity O(n * m), n markdown files (about 45), m lines per file (under 300)
@alloc      one string per file, released after write; nothing retained
"""

from __future__ import annotations

import html
import re
import sys
from pathlib import Path

import markdown

CONFIG = {
    "OutDir": "html",
    "Title": "Djinn Relay",
    "Groups": [
        ("Start here", ["plugins/djinn/README.md", "plugins/djinn/CONTRACTS.md", "plugins/djinn/relay.md"]),
        ("Session log", ["docs/session-log-2026-09-12.md"]),
        ("Commands", ["plugins/djinn/commands/review.md", "plugins/djinn/commands/brief.md", "plugins/djinn/commands/dispatch.md"]),
        ("Agents", sorted(str(p) for p in Path("plugins/djinn/agents").glob("*.md"))),
        ("Templates", ["plugins/djinn/templates/fix-brief.md", "plugins/djinn/templates/config.yaml"]),
        ("Review reports (what the Fable reviewers said)", sorted(str(p) for p in Path("_FromClaude").glob("prompt-review-*.md"))),
        ("Briefs given to the agents", ["_FromClaude/PROMPT-REVIEW-BRIEF.md", "_FromClaude/APPLY-BRIEF.md"]),
    ],
}

STYLE = """
:root { --ink:#1b1b1b; --paper:#fbfaf7; --card:#ffffff; --line:#d9d4c7; --accent:#2b4c7e; --code:#f1efe8; }
* { box-sizing:border-box; }
body { margin:0; padding:24px 16px 64px; background:var(--paper); color:var(--ink);
       font:16px/1.55 Georgia, "Times New Roman", serif; }
main { max-width:900px; margin:0 auto; }
nav.top { font-family: system-ui, sans-serif; font-size:14px; margin-bottom:20px; }
nav.top a { color:var(--accent); text-decoration:none; }
nav.top a:hover { text-decoration:underline; }
h1 { font-size:30px; margin:0 0 6px; line-height:1.2; }
p.path { font-family: ui-monospace, Menlo, Consolas, monospace; font-size:13px; color:#555; margin:0 0 24px; }
section.block { background:var(--card); border:1px solid var(--line); border-left:5px solid var(--accent);
                border-radius:6px; padding:18px 22px; margin:0 0 18px; }
section.block h2 { margin:0 0 12px; font-size:21px; }
section.meta { border-left-color:#8a8a8a; font-family: system-ui, sans-serif; font-size:14px; }
section.meta dl { display:grid; grid-template-columns:max-content 1fr; gap:4px 14px; margin:0; }
section.meta dt { font-weight:700; }
section.meta dd { margin:0; }
h3 { font-size:17px; margin:18px 0 8px; }
h4 { font-size:16px; margin:14px 0 6px; }
pre { background:var(--code); border:1px solid var(--line); border-radius:4px; padding:12px 14px;
      overflow-x:auto; font:13px/1.45 ui-monospace, Menlo, Consolas, monospace; }
code { background:var(--code); padding:1px 4px; border-radius:3px;
       font:0.92em ui-monospace, Menlo, Consolas, monospace; }
pre code { background:none; padding:0; }
table { border-collapse:collapse; width:100%; margin:10px 0; font-size:15px; }
th, td { border:1px solid var(--line); padding:6px 9px; text-align:left; vertical-align:top; }
th { background:var(--code); }
.tablewrap { overflow-x:auto; }
blockquote { margin:10px 0; padding:6px 14px; border-left:4px solid var(--line); color:#444; }
ul.index { list-style:none; padding:0; margin:0; }
ul.index li { padding:6px 0; border-bottom:1px dashed var(--line); }
ul.index li:last-child { border-bottom:none; }
ul.index a { color:var(--accent); text-decoration:none; font-family: system-ui, sans-serif; }
ul.index a:hover { text-decoration:underline; }
ul.index span.sub { color:#666; font-size:14px; margin-left:8px; }
@media (max-width:480px) { body { font-size:15px; } h1 { font-size:24px; } section.block { padding:14px 14px; } }
"""

FRONTMATTER_RE = re.compile(r"\A---\n(.*?)\n---\n", re.S)


def split_frontmatter(text: str) -> tuple[dict[str, str], str]:
    match = FRONTMATTER_RE.match(text)
    if not match:
        return {}, text
    meta: dict[str, str] = {}
    for line in match.group(1).splitlines():
        if ":" in line and not line.startswith(" "):
            key, _, value = line.partition(":")
            meta[key.strip()] = value.strip()
    return meta, text[match.end():]


def render_body(body: str) -> str:
    converted = markdown.markdown(body, extensions=["fenced_code", "tables"])
    converted = converted.replace("<table>", '<div class="tablewrap"><table>').replace("</table>", "</table></div>")
    parts = re.split(r"(?=<h2)", converted)
    blocks = []
    for part in parts:
        if not part.strip():
            continue
        blocks.append(f'<section class="block">{part}</section>')
    return "\n".join(blocks)


def render_meta(meta: dict[str, str]) -> str:
    if not meta:
        return ""
    rows = "".join(f"<dt>{html.escape(k)}</dt><dd>{html.escape(v)}</dd>" for k, v in meta.items())
    return f'<section class="block meta"><h2>Front matter</h2><dl>{rows}</dl></section>'


def page(title: str, path: str, inner: str, depth: int) -> str:
    home = "../" * depth + "index.html"
    return (
        f"<!doctype html><html lang='en'><head><meta charset='utf-8'>"
        f"<meta name='viewport' content='width=device-width, initial-scale=1'>"
        f"<title>{html.escape(title)}</title><style>{STYLE}</style></head><body><main>"
        f"<nav class='top'><a href='{home}'>Index</a></nav>"
        f"<h1>{html.escape(title)}</h1><p class='path'>{html.escape(path)}</p>{inner}"
        f"</main></body></html>"
    )


def out_path(src: str) -> Path:
    return Path(CONFIG["OutDir"]) / (src.replace(".md", ".html").replace(".yaml", ".html"))


def render_file(src: str) -> tuple[str, str]:
    text = Path(src).read_text(encoding="utf-8")
    if src.endswith(".yaml"):
        meta, body = {}, f"```yaml\n{text}\n```"
    else:
        meta, body = split_frontmatter(text)
    title = meta.get("title") or meta.get("name") or Path(src).stem
    inner = render_meta(meta) + render_body(body)
    dest = out_path(src)
    dest.parent.mkdir(parents=True, exist_ok=True)
    dest.write_text(page(title, src, inner, len(dest.parent.parts) - 1), encoding="utf-8")
    return title, meta.get("description", "")


def render_index(entries: list[tuple[str, list[tuple[str, str, str]]]]) -> None:
    sections = []
    for group, items in entries:
        lis = "".join(
            f"<li><a href='{html.escape(str(out_path(src).relative_to(CONFIG['OutDir'])))}'>{html.escape(title)}</a>"
            f"<span class='sub'>{html.escape(sub[:110])}</span></li>"
            for src, title, sub in items
        )
        sections.append(f"<section class='block'><h2>{html.escape(group)}</h2><ul class='index'>{lis}</ul></section>")
    Path(CONFIG["OutDir"]).mkdir(exist_ok=True)
    Path(CONFIG["OutDir"], "index.html").write_text(
        page(CONFIG["Title"], "rendered 2026-09-12 from the markdown in this folder", "\n".join(sections), 0),
        encoding="utf-8",
    )


def main() -> int:
    entries = []
    for group, srcs in CONFIG["Groups"]:
        items = []
        for src in srcs:
            if not Path(src).exists():
                print(f"skip missing {src}", file=sys.stderr)
                continue
            title, sub = render_file(src)
            items.append((src, title, sub))
        entries.append((group, items))
    render_index(entries)
    print(f"rendered {sum(len(i) for _, i in entries)} pages into {CONFIG['OutDir']}/")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
