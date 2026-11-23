# Uploads textos.py to Shopify: description (HTML) and SEO meta description of each product, and
# deletes the "Texto de prueba" metafields. Uses `shopify store execute` (authorize once with
# `shopify store auth -s brudabrey.myshopify.com --scopes read_products,write_products`).
# Usage: python3 subir.py [handle ...]   (no handles: all products in textos.py)
import html, json, os, subprocess, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from textos import TEXTS  # noqa: E402

STORE = "brudabrey.myshopify.com"
TEST_KEYS = ["key_benefits", "beneficios_clave", "active_ingredients", "ingredientes_activos", "analytical_composition", "lista_inci", "usage_guide", "modo_de_uso"]


def gql(query, variables=None, mutation=False):
    cmd = ["shopify", "store", "execute", "-s", STORE, "-j", "--no-input", "-q", query]
    if variables:
        cmd += ["-v", json.dumps(variables)]
    if mutation:
        cmd.append("--allow-mutations")
    r = subprocess.run(cmd, capture_output=True, text=True)
    if r.returncode:
        raise SystemExit(r.stderr or r.stdout)
    out = json.loads(r.stdout)
    return out.get("data", out)


def to_html(intro, bullets, note):
    parts = [f"<p>{html.escape(intro)}</p>"]
    if bullets:
        parts.append("<ul>" + "".join(f"<li>{html.escape(b)}</li>" for b in bullets) + "</ul>")
    if note:
        parts.append(f"<p>{html.escape(note)}</p>")
    return "".join(parts)


only = sys.argv[1:]
products = gql(
    "{ products(first: 100) { nodes { id handle metafields(first: 30, namespace: \"custom\") { nodes { key value } } } } }"
)["products"]["nodes"]
done = 0
for p in products:
    if p["handle"] not in TEXTS or (only and p["handle"] not in only):
        continue
    intro, bullets, note, seo = TEXTS[p["handle"]]
    res = gql(
        "mutation($p: ProductUpdateInput!) { productUpdate(product: $p) { product { id } userErrors { field message } } }",
        {"p": {"id": p["id"], "descriptionHtml": to_html(intro, bullets, note), "seo": {"description": seo}}},
        mutation=True,
    )["productUpdate"]
    errors = res["userErrors"]
    # Test placeholders only ("Texto de prueba: ..."): real data is never deleted.
    stale = [m["key"] for m in p["metafields"]["nodes"] if m["key"] in TEST_KEYS and "texto de prueba" in (m["value"] or "").lower()]
    if stale:
        d = gql(
            "mutation($m: [MetafieldIdentifierInput!]!) { metafieldsDelete(metafields: $m) { userErrors { message } } }",
            {"m": [{"ownerId": p["id"], "namespace": "custom", "key": k} for k in stale]},
            mutation=True,
        )["metafieldsDelete"]
        errors += d["userErrors"]
    print(("ERROR " + errors[0]["message"]) if errors else "ok", p["handle"], ("· borrados: " + ", ".join(stale)) if stale else "", flush=True)
    done += 0 if errors else 1
print("actualizados:", done)
