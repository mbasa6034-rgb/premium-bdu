import os, json, glob, time, urllib.request as r

U = os.environ["U"].rstrip("/")
K = os.environ["K"]

def call(method, path, body=None, prefer=None):
    h = {"apikey": K, "Content-Type": "application/json"}
    if prefer:
        h["Prefer"] = prefer
    data = json.dumps(body).encode() if body is not None else None
    req = r.Request(U + "/rest/v1/" + path, method=method, headers=h, data=data)
    try:
        with r.urlopen(req) as x:
            t = x.read().decode()
            return json.loads(t) if t else None
    except Exception as e:
        msg = e.read().decode() if hasattr(e, "read") else ""
        raise SystemExit("FAILED %s %s: %s %s" % (method, path, msg, e))

for f in sorted(glob.glob("content/chapter-*.json")):
    c = json.load(open(f, encoding="utf-8"))
    row = call("POST", "chapters?on_conflict=no",
               [{"no": c["no"], "title": c["title"], "is_free": bool(c.get("free", False))}],
               "resolution=merge-duplicates,return=representation")[0]
    call("DELETE", "chapter_content?chapter_id=eq.%d" % row["id"])
    items = [{"chapter_id": row["id"], "kind": i["kind"], "title": i["title"], "data": i["data"]}
             for i in c["items"]]
    if items:
        call("POST", "chapter_content", items)
    print("OK", f, len(items), "items")

if os.path.exists("content/settings.json"):
    s = json.load(open("content/settings.json", encoding="utf-8"))
    call("POST", "settings?on_conflict=key",
         [{"key": k, "value": str(v)} for k, v in s.items()], "resolution=merge-duplicates")
    print("OK settings")

call("PATCH", "content_version?id=eq.1", {"version": int(time.time())})
print("Version bumped. Users will see the update button.")
