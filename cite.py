"""Citation tooling for the MD/DFT x ionic-liquid course (see docs/specs/... §7).

  python cite.py verify            resolve + title-check every DOI used by the lectures
  python cite.py emit <doi> ...    print house-style reference lines from Crossref
  python cite.py add <doi> ...     fetch + cache metadata into the library

House rule: reference lines come from this tool, never typed by hand — two attempts at
hand-typing author names on this course were 100% wrong. The library JSON is rebuilt
automatically from Crossref when missing, so losing it costs only time.

Resolution semantics worth remembering: HTTP 404 = the identifier does not exist;
HTTP 403 from doi.org = the identifier resolved but the publisher blocks bots.
Do not "normalise" a working DOI because its redirect returned 403.
"""

import html
import json
import pathlib
import re
import sys
import time
import urllib.error
import urllib.parse
import urllib.request

UA = {"User-Agent": "myblog-citation-audit/1.0 (mailto:research@example.com)"}
LIBP = pathlib.Path("docs/paper/track-md-dft-authors.json")
POSTS = sorted(pathlib.Path("src/content/posts").glob("md-dft-il-*.md"))
DOI_RE = re.compile(r"10\.\d{4,9}/[^\s、，。；：）（\]》\"'“”]+")


def load():
    if not LIBP.exists():
        return {}
    try:
        return json.loads(LIBP.read_text(encoding="utf-8"))
    except json.JSONDecodeError:
        return {}


def save(lib):
    LIBP.parent.mkdir(parents=True, exist_ok=True)
    LIBP.write_text(json.dumps(lib, ensure_ascii=False, indent=1), encoding="utf-8")


def clean(s):
    return re.sub(r"\s+", " ", html.unescape(re.sub(r"<[^>]+>", " ", s or ""))).strip()


def toks(s):
    return {w for w in re.sub(r"[^a-z0-9 ]", " ", clean(s).lower()).split() if len(w) > 3}


def coverage(claimed, actual):
    """Fraction of the Crossref title's words present in our reference entry.

    Low coverage means the DOI points at a different paper than the entry claims.
    """
    want = toks(claimed)
    return (len(want & toks(actual)) / len(want)) if want else 1.0


def strip(d):
    return d.rstrip(".,;:)]}>\"'`”’")


def http_json(url, tries=4):
    for i in range(tries):
        try:
            req = urllib.request.Request(url, headers=UA)
            with urllib.request.urlopen(req, timeout=40) as r:
                return json.loads(r.read().decode("utf-8", errors="replace"))
        except urllib.error.HTTPError as e:
            if e.code == 404:
                return None
            if e.code in (429, 503) and i < tries - 1:
                time.sleep(5 + 4 * i)
                continue
            raise
        except Exception:  # noqa: BLE001
            if i < tries - 1:
                time.sleep(2 + 2 * i)
                continue
            raise
    return None


def record(doi, msg):
    names = [f"{a.get('family','')}, {a.get('given','')}".strip().strip(",")
             for a in (msg.get("author") or [])]
    one = []
    for a in names:
        if "," in a:
            fam, giv = a.split(",", 1)
            one.append(f"{giv.strip()} {fam.strip()}".strip())
        else:
            one.append(a)
    title = clean((msg.get("title") or [""])[0])
    venue = clean((msg.get("container-title") or [""])[0]) or msg.get("type", "")
    year = (msg.get("issued", {}).get("date-parts") or [[None]])[0][0]
    vol = msg.get("volume") or ""
    pg = msg.get("page") or msg.get("article-number") or ""
    kind = {"report": " [技术报告]", "proceedings-article": " [会议论文]",
            "book-chapter": " [图书章节]"}.get(msg.get("type"), "")
    tail = (f", {vol}" + (f": {pg}" if pg else "")) if vol else ""
    return {"authors": names, "title": title, "venue": venue, "year": year,
            "volume": vol, "page": pg, "type": msg.get("type"),
            "reference_line": f"{', '.join(one)}. {title}. {venue}{kind}, {year}{tail}. DOI: {doi}."}


def lookup(lib, doi):
    hit = next((k for k in lib if k.lower() == doi.lower()), None)
    if hit:
        return lib[hit]
    msg = http_json("https://api.crossref.org/works/" + urllib.parse.quote(doi, safe=""))
    if not msg:
        return None
    rec = record(doi, msg)
    lib[doi] = rec
    return rec


def ref_entries(text):
    tail = text.split("## 参考文献")[-1]
    for m in re.finditer(r"^\[(\d+)\]\s+(.*?)(?=^\[\d+\]|\Z)", tail, re.S | re.M):
        body = m.group(2)
        for d in DOI_RE.findall(body):
            yield strip(d), re.sub(r"\s+", " ", body)


def cmd_verify():
    lib, problems = load(), 0
    for f in POSTS:
        text = f.read_text(encoding="utf-8")
        seen, bad = set(), []
        for doi, entry in ref_entries(text):
            if doi in seen:
                continue
            seen.add(doi)
            rec = lookup(lib, doi)
            if rec is None:
                bad.append(f"{doi}  (404 / unresolved)")
            elif coverage(rec["title"], entry) < 0.6:
                bad.append(f"{doi}  (entry omits Crossref title: \"{rec['title'][:44]}\")")
        name = f.name.replace("md-dft-il-", "").replace(".md", "")
        print(f"{name:34} {len(seen):3} distinct DOIs  {'clean' if not bad else 'PROBLEMS'}")
        for b in bad:
            print(f"    !! {b}")
        problems += len(bad)
    save(lib)
    print(f"\nlibrary {len(lib)} records;  problems {problems}")
    return 1 if problems else 0


if __name__ == "__main__":
    a = sys.argv[1:]
    if not a:
        print(__doc__)
    elif a[0] == "verify":
        sys.exit(cmd_verify())
    elif a[0] in ("emit", "add"):
        lib = load()
        for i, d in enumerate(a[1:], 1):
            rec = lookup(lib, d)
            if rec is None:
                print(f"[{i}] !! UNRESOLVED {d}")
            elif a[0] == "emit":
                print(f"[{i}] {rec['reference_line']}\n")
            else:
                print(f"ok {d} [{rec['year']}] {rec['title'][:56]}")
            time.sleep(0.25)
        save(lib)
        print(f"library {len(lib)} records")
    else:
        print(__doc__)
