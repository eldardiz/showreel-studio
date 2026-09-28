"""Record live web pages as constant-frame-rate MP4 clips via the Chrome DevTools screencast.

Why not Playwright's recordVideo: it encodes VP8 at a low bitrate, which smears the thin UI lines in
product animations. The screencast hands over lossless-ish JPEG frames with timestamps; we lay them on a
30 fps grid (hold the last frame) and encode H.264 at CRF 16.

usage: python3 scripts/capture/screencast.py <jobs.json>
jobs.json: {"base": url, "viewport": [w,h], "dpr": 2, "out": "public/edits/<id>/clips",
            "cookieReject": "Reject", "jobs": [{"name": "seo", "path": "/seo", "seconds": 9,
            "scroll": null | {"start": 1.5, "end": 11, "to": "bottom" | px}}]}
"""
import asyncio, base64, json, os, shutil, subprocess, sys, tempfile
from playwright.async_api import async_playwright

FPS = 30


async def record(ctx, base, job, out_dir, vw, vh, dpr):
    page = await ctx.new_page()
    cdp = await ctx.new_cdp_session(page)
    frames = []  # (timestamp, bytes)

    def on_frame(ev):
        frames.append((ev["metadata"]["timestamp"], base64.b64decode(ev["data"])))
        asyncio.ensure_future(cdp.send("Page.screencastFrameAck", {"sessionId": ev["sessionId"]}))

    cdp.on("Page.screencastFrame", on_frame)
    await cdp.send("Page.startScreencast", {"format": "jpeg", "quality": 92, "maxWidth": round(vw * dpr), "maxHeight": round(vh * dpr), "everyNthFrame": 1})
    t0 = asyncio.get_event_loop().time()
    await page.goto(base + job["path"], wait_until="domcontentloaded")
    sc = job.get("scroll")
    if sc:
        await page.wait_for_timeout(int(sc["start"] * 1000))
        # eased scroll driven by rAF so it reads as a camera move, not a jump
        dur = sc["end"] - sc["start"]
        await page.evaluate(
            """([dur, to]) => new Promise(res => {
                const max = document.documentElement.scrollHeight - innerHeight;
                const target = to === 'bottom' ? max : Math.min(max, to);
                const t0 = performance.now(), y0 = scrollY;
                const ease = t => t < .5 ? 4*t*t*t : 1 - Math.pow(-2*t + 2, 3) / 2;
                const step = now => { const p = Math.min(1, (now - t0) / (dur * 1000));
                  window.scrollTo(0, y0 + (target - y0) * ease(p)); p < 1 ? requestAnimationFrame(step) : res(); };
                requestAnimationFrame(step); })""",
            [dur, sc.get("to", "bottom")],
        )
    remaining = job["seconds"] - (asyncio.get_event_loop().time() - t0)
    if remaining > 0:
        await page.wait_for_timeout(int(remaining * 1000))
    await cdp.send("Page.stopScreencast")
    await page.close()

    if not frames:
        raise RuntimeError(f"no frames for {job['name']}")
    frames.sort(key=lambda f: f[0])
    start = frames[0][0]
    tmp = tempfile.mkdtemp()
    n = int(job["seconds"] * FPS)
    k = 0
    for i in range(n):
        t = start + i / FPS
        while k + 1 < len(frames) and frames[k + 1][0] <= t:
            k += 1
        with open(os.path.join(tmp, f"f{i:05d}.jpg"), "wb") as fh:
            fh.write(frames[k][1])
    out = os.path.join(out_dir, f"{job['name']}.mp4")
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-framerate", str(FPS), "-i", os.path.join(tmp, "f%05d.jpg"),
                    "-vf", f"scale={round(vw * dpr)}:{round(vh * dpr)}:flags=lanczos,format=yuv420p", "-c:v", "libx264", "-crf", "16",
                    "-preset", "slow", "-movflags", "+faststart", out], check=True)
    shutil.rmtree(tmp)
    return {"name": job["name"], "frames": len(frames), "out": out}


async def main(cfg_path):
    cfg = json.load(open(cfg_path))
    vw, vh = cfg["viewport"]
    dpr = cfg.get("dpr", 2)
    os.makedirs(cfg["out"], exist_ok=True)
    async with async_playwright() as p:
        b = await p.chromium.launch()
        ctx = await b.new_context(viewport={"width": vw, "height": vh}, device_scale_factor=dpr)
        if cfg.get("cookieReject"):
            pg = await ctx.new_page()
            await pg.goto(cfg["base"] + "/", wait_until="networkidle")
            try:
                await pg.get_by_role("button", name=cfg["cookieReject"]).click(timeout=4000)
            except Exception:
                pass
            await pg.close()
        only = set(sys.argv[2:])
        for job in cfg["jobs"]:
            if only and job["name"] not in only:
                continue
            print(json.dumps(await record(ctx, cfg["base"], job, cfg["out"], vw, vh, dpr)))
        await b.close()


if __name__ == "__main__":
    asyncio.run(main(sys.argv[1]))
