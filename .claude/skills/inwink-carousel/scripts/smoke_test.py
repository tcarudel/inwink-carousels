"""Test rapide de la démo CRSL.
Usage : python3 smoke_test.py dist/crsl/demo/index.html [--only cle1,cle2] [--width 1200]
Vérifie que chaque bloc #ct-<cle> est initialisé (data-crsl) sans erreur JavaScript,
et enregistre une capture par carrousel dans dist/screens/.
Prérequis : pip install playwright && playwright install chromium"""
import asyncio, os, sys

def args():
    a = sys.argv[1:]
    if not a: sys.exit(__doc__)
    page = os.path.abspath(a[0])
    only = a[a.index("--only") + 1].split(",") if "--only" in a else None
    width = int(a[a.index("--width") + 1]) if "--width" in a else 1200
    return page, only, width

async def main():
    from playwright.async_api import async_playwright
    page_path, only, width = args()
    out = os.path.abspath(os.path.join(os.path.dirname(page_path), "..", "..", "screens"))
    os.makedirs(out, exist_ok=True)
    errors, failed = [], []
    async with async_playwright() as p:
        b = await p.chromium.launch()
        pg = await b.new_page(viewport={"width": width, "height": 800})
        pg.on("pageerror", lambda e: errors.append(str(e)))
        pg.on("console", lambda m: errors.append(m.text) if m.type == "error" else None)
        await pg.goto("file://" + page_path)
        await pg.wait_for_timeout(1000)
        ids = await pg.evaluate("[...document.querySelectorAll('[id^=ct-]')].map(e => e.id)")
        for cid in ids:
            key = cid[3:]
            if only and key not in only: continue
            state = await pg.evaluate("document.getElementById('%s').getAttribute('data-crsl')" % cid)
            await pg.evaluate("document.getElementById('%s').scrollIntoView()" % cid)
            await pg.wait_for_timeout(400)
            shot = os.path.join(out, "%s-%d.png" % (key, width))
            try: await pg.locator("#" + cid).screenshot(path=shot, timeout=5000)
            except Exception: await pg.screenshot(path=shot)
            ok = state == key
            if not ok: failed.append(key)
            print(("OK    " if ok else "ECHEC ") + key + " -> " + shot)
        await b.close()
    if errors:
        print("\nErreurs JavaScript :")
        for e in errors: print(" - " + e)
    print("\nRésultat : " + ("tout est initialisé" if not failed and not errors else "à corriger"))
    sys.exit(1 if failed or errors else 0)

asyncio.run(main())
