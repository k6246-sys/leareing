const V = "kl-v1";
const FILES = ["./", "index.html", "app.js", "manifest.webmanifest", "icon-192.png", "icon-512.png", "apple-touch-icon.png"];
self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(V).then((c) => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== V).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
// 先用已存的檔案（離線也能開），同時在背景更新，下次開啟就是新版
self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;
  e.respondWith(
    caches.match(e.request, { ignoreSearch: true }).then((hit) => {
      const net = fetch(e.request).then((r) => {
        if (r && r.ok) { const cp = r.clone(); caches.open(V).then((c) => c.put(e.request, cp)); }
        return r;
      }).catch(() => hit);
      return hit || net.then((r) => r || caches.match("index.html"));
    })
  );
});
