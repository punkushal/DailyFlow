/* app.js: start-up, day rollover, service worker and install prompt */
let deferredInstall=null;
let curDay=today();const dayCheck=()=>{if(today()!==curDay){curDay=today();render()}};
setInterval(dayCheck,30000);document.addEventListener('visibilitychange',()=>{if(!document.hidden)dayCheck()});
(async()=>{fresh();db=await open();
 if(db){const[t,c,a,g,s]=await Promise.all(['tasks','completions','affirmations','goals','settings'].map(getAll)),p=s.find(x=>x.key==='prefs');
  if(p){const ids=new Set(t.map(x=>x.id));S.tasks=t;S.comps=c.filter(x=>ids.has(x.taskId));S.affs=a;S.goal=(g[0]&&g[0].text)||'';S.p=Object.assign(S.p,p);persistTasks(setOrder(active()))}
  else await writeAll()}
 else setTimeout(()=>toast('Storage unavailable: data won’t be kept after closing'),600);
 applyTheme();render()})();

window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferredInstall=e;if(view==='prefs')render()});
window.addEventListener('appinstalled',()=>{deferredInstall=null;toast('DailyFlow installed')});
if('serviceWorker' in navigator&&location.protocol!=='file:')window.addEventListener('load',()=>navigator.serviceWorker.register('service-worker.js').catch(()=>{}));
