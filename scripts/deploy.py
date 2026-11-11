import os, json, glob, time, urllib.request as r

U = os.environ["U"].rstrip("/")
K = os.environ["K"]
EX = ("questions", "quiz", "mid", "final", "mock")
FREE_Q = 10

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

courses = {}
files = [f for f in sorted(glob.glob("content/**/*.json", recursive=True))
         if os.path.basename(f) != "settings.json"]

for f in files:
    c = json.load(open(f, encoding="utf-8"))
    y = int(c.get("year", 1)); s = int(c.get("semester", 1)); cname = c.get("course", "General")
    ck = (y, s, cname)
    if ck not in courses:
        courses[ck] = call("POST", "courses?on_conflict=year,semester,title",
                           [{"year": y, "semester": s, "title": cname}],
                           "resolution=merge-duplicates,return=representation")[0]["id"]
    no = int(c["no"])
    free = bool(c["free"]) if "free" in c else (no == 1)
    row = call("POST", "chapters?on_conflict=course_id,no",
               [{"course_id": courses[ck], "no": no, "title": c["title"], "is_free": free}],
               "resolution=merge-duplicates,return=representation")[0]
    call("DELETE", "chapter_content?chapter_id=eq.%d" % row["id"])
    rows = []
    for it in c["items"]:
        d = it["data"]
        base = {"chapter_id": row["id"], "kind": it["kind"], "title": it["title"]}
        qs = d.get("items", [])
        if it["kind"] in EX and not free and len(qs) > FREE_Q:
            rows.append(dict(base, part=0, premium_part=False,
                             data={"items": qs[:FREE_Q], "total": len(qs)}))
            rows.append(dict(base, part=1, premium_part=True,
                             data={"items": qs[FREE_Q:]}))
        else:
            if it["kind"] in EX:
                d = dict(d)
                d["total"] = len(qs)
            rows.append(dict(base, part=0, premium_part=False, data=d))
    if rows:
        call("POST", "chapter_content", rows)
    print("OK", f, "->", cname, "Y%d S%d" % (y, s), "chapter", no, "free" if free else "premium")

if os.path.exists("content/settings.json"):
    st = json.load(open("content/settings.json", encoding="utf-8"))
    call("POST", "settings?on_conflict=key",
         [{"key": k, "value": str(v)} for k, v in st.items()], "resolution=merge-duplicates")
    print("OK settings")

call("PATCH", "content_version?id=eq.1", {"version": int(time.time())})
print("Version bumped. Users will see the update button.")
