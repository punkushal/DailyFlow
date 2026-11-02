/* database.js: IndexedDB setup and safe transactional writes */
let db=null;
const ST=['tasks','completions','settings','affirmations','goals'];
const open=()=>new Promise(res=>{try{const r=indexedDB.open('dailyflow',1);r.onupgradeneeded=()=>ST.forEach(s=>r.result.createObjectStore(s,{keyPath:s==='settings'?'key':'id'}));r.onsuccess=()=>res(r.result);r.onerror=()=>res(null)}catch(e){res(null)}});
const tx=(stores,fn)=>new Promise((res,rej)=>{if(!db)return res();try{const t=db.transaction(stores,'readwrite'),o={};stores.forEach(s=>o[s]=t.objectStore(s));fn(o);t.oncomplete=()=>res();t.onerror=t.onabort=()=>rej(t.error)}catch(e){rej(e)}});
const getAll=s=>new Promise(res=>{try{const r=db.transaction(s).objectStore(s).getAll();r.onsuccess=()=>res(r.result);r.onerror=()=>res([])}catch(e){res([])}});
const save=(stores,fn)=>tx(stores,fn).catch(()=>toast('Couldn’t save your changes'));
const writeAll=()=>save(ST,o=>{ST.forEach(s=>o[s].clear());S.tasks.forEach(t=>o.tasks.put(t));S.comps.forEach(c=>o.completions.put(c));S.affs.forEach(a=>o.affirmations.put(a));o.goals.put({id:'main_goal',text:S.goal});o.settings.put(S.p)});
