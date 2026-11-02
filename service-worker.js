/* service-worker.js: offline support. Bump VERSION when you ship a new release. */
const VERSION='dailyflow-v1',SHELL=["./", "index.html", "style.css", "app.js", "manifest.json", "js/date-utils.js", "js/database.js", "js/settings.js", "js/goals.js", "js/affirmations.js", "js/tasks.js", "js/task-completions.js", "js/statistics.js", "js/backup.js", "js/ui.js", "assets/icons/apple-touch-icon.png", "assets/icons/icon-192.png", "assets/icons/icon-512.png", "assets/icons/icon-maskable-512.png"];
self.addEventListener('install',e=>{e.waitUntil(caches.open(VERSION).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==VERSION).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
/* Network first (always fresh when online), cache fallback (works offline). */
self.addEventListener('fetch',e=>{
  const r=e.request;if(r.method!=='GET'||new URL(r.url).origin!==location.origin)return;
  e.respondWith(fetch(r).then(res=>{if(res.ok){const cp=res.clone();caches.open(VERSION).then(c=>c.put(r,cp))}return res})
    .catch(()=>caches.match(r,{ignoreSearch:true}).then(m=>m||(r.mode==='navigate'?caches.match('./'):Response.error()))));
});
