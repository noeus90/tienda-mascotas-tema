# Product names and size values (UX-17, 23/11/2026): accents, capitals, clear names and sizes
# written the Spanish way ("3 kg", "1,5 kg", "400 g"). Handles do not change, so no link breaks.
# Usage: python3 nombres.py   (needs `shopify store auth` with write_products)
import json, subprocess

STORE = "brudabrey.myshopify.com"

TITLES = {
    "arbol": "Árbol rascador gato",
    "cama-con-pelo": "Cama de pelo perro",
    "cortaunas": "Cortauñas gato",
    "juguete-raton": "Ratón de juguete gato",
    "malta": "Malta para gatos",
    "correa-nylon": "Correa de nylon perro",
    "lata-para-gatos-de-conejo": "Lata conejo gato",
    "pelota-mordedor-perro": "Pelota mordedora perro",
}
OPTION_NAMES = {"tamaño del saco": "Tamaño del saco de pienso", "Tamaño lata": "Tamaño", "Tamaño según perro": "Tamaño"}
VALUES = {"3kg": "3 kg", "12kg": "12 kg", "1,5kg": "1,5 kg", "1.5kg": "1,5 kg", "4kg": "4 kg", "400 gramos": "400 g",
          "pequeño": "Pequeña", "mediano": "Mediana", "grande": "Grande"}


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


products = gql("{ products(first: 100) { nodes { id handle title options { id name optionValues { id name } } } } }")["products"]["nodes"]
for p in products:
    if p["handle"] in TITLES and p["title"] != TITLES[p["handle"]]:
        r = gql("mutation($p: ProductUpdateInput!) { productUpdate(product: $p) { userErrors { message } } }",
                {"p": {"id": p["id"], "title": TITLES[p["handle"]]}}, True)["productUpdate"]["userErrors"]
        print("título", p["title"], "->", TITLES[p["handle"]], r or "ok")
    for o in p["options"]:
        values = [{"id": v["id"], "name": VALUES[v["name"]]} for v in o["optionValues"] if v["name"] in VALUES]
        new_name = OPTION_NAMES.get(o["name"])
        if not values and not new_name:
            continue
        option = {"id": o["id"]}
        if new_name:
            option["name"] = new_name
        r = gql("mutation($p: ID!, $o: OptionUpdateInput!, $v: [OptionValueUpdateInput!]) { productOptionUpdate(productId: $p, option: $o, optionValuesToUpdate: $v) { userErrors { field message } } }",
                {"p": p["id"], "o": option, "v": values}, True)["productOptionUpdate"]["userErrors"]
        print("opción", p["handle"], o["name"], "->", new_name or o["name"], [v["name"] for v in values], r or "ok")
