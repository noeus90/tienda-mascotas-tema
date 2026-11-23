# Uploads out/<handle>.svg.png as the image of each product that has no media.
# stagedUploadsCreate -> POST file -> productCreateMedia, through `shopify store execute`.
import json, os, subprocess, sys, urllib.request, uuid

HERE = os.path.dirname(os.path.abspath(__file__))
STORE = "brudabrey.myshopify.com"

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

def post_multipart(url, params, filename, data):
    boundary = uuid.uuid4().hex
    body = b""
    for p in params:
        body += f'--{boundary}\r\nContent-Disposition: form-data; name="{p["name"]}"\r\n\r\n{p["value"]}\r\n'.encode()
    body += f'--{boundary}\r\nContent-Disposition: form-data; name="file"; filename="{filename}"\r\nContent-Type: image/png\r\n\r\n'.encode() + data + f"\r\n--{boundary}--\r\n".encode()
    req = urllib.request.Request(url, data=body, headers={"Content-Type": f"multipart/form-data; boundary={boundary}"})
    urllib.request.urlopen(req).read()

products = gql("{ products(first:100){ nodes { id title handle mediaCount { count } } } }")["products"]["nodes"]
only = sys.argv[1:]
done = 0
for p in products:
    path = os.path.join(HERE, "out", p["handle"] + ".svg.png")
    if p["mediaCount"]["count"] or not os.path.exists(path) or (only and p["handle"] not in only):
        continue
    data = open(path, "rb").read()
    filename = p["handle"] + ".png"
    target = gql(
        "mutation($input:[StagedUploadInput!]!){ stagedUploadsCreate(input:$input){ stagedTargets { url resourceUrl parameters { name value } } userErrors { message } } }",
        {"input": [{"filename": filename, "mimeType": "image/png", "resource": "IMAGE", "httpMethod": "POST", "fileSize": str(len(data))}]},
        mutation=True,
    )["stagedUploadsCreate"]["stagedTargets"][0]
    post_multipart(target["url"], target["parameters"], filename, data)
    res = gql(
        "mutation($id:ID!,$media:[CreateMediaInput!]!){ productCreateMedia(productId:$id, media:$media){ media { id status } mediaUserErrors { message } } }",
        {"id": p["id"], "media": [{"originalSource": target["resourceUrl"], "mediaContentType": "IMAGE", "alt": p["title"]}]},
        mutation=True,
    )["productCreateMedia"]
    errors = res["mediaUserErrors"]
    print(("ERROR " + errors[0]["message"]) if errors else "ok", p["handle"], flush=True)
    done += 0 if errors else 1
print("subidas:", done)
