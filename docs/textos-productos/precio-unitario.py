# Unit price (UX-16): net content of each food variant, so Shopify shows the price per kg / per L
# (Dawn renders it under the price in cards and product page). Net content from the product names,
# variant titles and descriptions; never the shipping weight (it includes the packaging).
# Usage: python3 precio-unitario.py   (needs `shopify store auth` with write_products)
import json, subprocess

STORE = "brudabrey.myshopify.com"
# handle -> {variant title (or "*" for the only variant): (quantity, unit)}; reference 1 KG or 1 L.
NET = {
    "pienso-pollo-cachorro": {"3kg": (3, "KG"), "12kg": (12, "KG")},
    "pienso-gato-estirilizado": {"*": (1.5, "KG")},
    "pienso-hipoalergenico-salmon-perro": {"3kg": (3, "KG"), "12kg": (12, "KG")},
    "pienso-senior-pollo-arroz-perro": {"3kg": (3, "KG"), "12kg": (12, "KG")},
    "pienso-gatito-pollo": {"1,5kg": (1.5, "KG"), "4kg": (4, "KG")},
    "lata-pate-perro-adulto": {"*": (400, "G")},
    "lata-cordero-monoproteina-perro": {"*": (400, "G")},
    "sobres-gatito-pollo-salsa": {"*": (1020, "G")},
    "lata-gato-senior-atun": {"*": (85, "G")},
    "snack-insecto-hipoalergenico-perro": {"*": (100, "G")},
    "snack-malta-gatos": {"*": (60, "G")},
    "chips-manzana-zanahoria-perro": {"*": (80, "G")},
    "menu-barf-pollo-verduras-perro": {"*": (1, "KG")},
    "menu-barf-ternera-cordero-perro": {"*": (1, "KG")},
    "cuellos-pollo-barf-perro": {"*": (1, "KG")},
    "mezcla-verduras-algas-barf-perro": {"*": (400, "G")},
    "aceite-de-salmon": {"*": (250, "ML")},
}


def gql(query, variables=None, mutation=False):
    cmd = ["shopify", "store", "execute", "-s", STORE, "-j", "--no-input", "-q", query]
    if variables:
        cmd += ["-v", json.dumps(variables)]
    if mutation:
        cmd.append("--allow-mutations")
    r = subprocess.run(cmd, capture_output=True, text=True)
    out = r.stdout[r.stdout.find("{"):] if "{" in r.stdout else r.stdout
    data = json.loads(out)
    return data.get("data", data)


for handle, sizes in NET.items():
    product = gql("query($h: String!) { productByHandle(handle: $h) { id variants(first: 10) { nodes { id title } } } }", {"h": handle})["productByHandle"]
    variants = []
    for v in product["variants"]["nodes"]:
        size = sizes.get(v["title"]) or sizes.get("*")
        if not size:
            print("sin tamaño:", handle, v["title"])
            continue
        qty, unit = size
        ref_unit = "L" if unit in ("ML", "CL", "L") else "KG"
        variants.append({"id": v["id"], "showUnitPrice": True, "unitPriceMeasurement": {"quantityValue": qty, "quantityUnit": unit, "referenceValue": 1, "referenceUnit": ref_unit}})
    res = gql(
        "mutation($p: ID!, $v: [ProductVariantsBulkInput!]!) { productVariantsBulkUpdate(productId: $p, variants: $v) { userErrors { field message } } }",
        {"p": product["id"], "v": variants},
        mutation=True,
    )
    errors = res["productVariantsBulkUpdate"]["userErrors"] if "productVariantsBulkUpdate" in res else [{"message": json.dumps(res)[:300]}]
    print(("ERROR " + errors[0]["message"]) if errors else "ok", handle, len(variants))
