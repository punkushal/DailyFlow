/* ui.js: rendering, modals and user interaction */
const main=$('#main');
let view='today',cal=null,selT='',H={};
const toast=m=>{const e=$('#toast');e.textContent=m;e.classList.add('on');clearTimeout(toast.t);toast.t=setTimeout(()=>e.classList.remove('on'),2800)};
function modal(html,h){H=h||{};const m=$('#modal');m.innerHTML=`<div class="box">${html}</div>`;m.hidden=false;const i=m.querySelector('input:not([type=checkbox]),textarea');if(i)i.focus()}
const closeM=()=>{$('#modal').hidden=true;$('#modal').innerHTML=''};
$('#modal').onclick=e=>{const b=e.target.closest('[data-m]'),k=b&&b.dataset.m;if(e.target.id==='modal'||k==='x')return closeM();if(k&&H[k]&&H[k]()!==false)closeM()};
const confirmBox=(msg,label,fn)=>modal(`<p>${msg}</p><div class="btns"><button data-m="x">Cancel</button><button class="pri bad" data-m="ok">${label}</button></div>`,{ok(){fn()}});
function taskModal(t){const n=active().length+(t?0:1),cur=t?t.priority:n;
 const opts=Array.from({length:n},(_,i)=>`<option value="${i+1}"${cur===i+1?' selected':''}>${i+1}${i===0?' (highest)':''}</option>`).join('');
 modal(`<h3>${t?'Edit task':'Add task'}</h3><label>Task name<input id="fn" maxlength="120" value="${t?esc(t.name):''}"></label><label>Priority position<select id="fp">${opts}</select></label><div class="btns">${t?'<button class="bad" data-m="arch">Archive</button><button class="bad" data-m="del">Delete</button>':''}<button data-m="x">Cancel</button><button class="pri" data-m="ok">Save</button></div>`,{
  ok(){const name=$('#fn').value.trim();if(!name){$('#fn').focus();return false}const pos=+$('#fp').value;if(t)updateTask(t,name,pos);else addTask(name,pos);render()},
  arch(){archive(t.id);render()},
  del(){confirmBox(`Delete “${esc(t.name)}” permanently? Its completion history will be removed too.`,'Delete',()=>{remove(t.id);render()});return false}})}
function goalModal(){modal(`<h3>Personal goal</h3><label>Why are you doing this?<textarea id="gt" rows="3" maxlength="200">${esc(S.goal)}</textarea></label><div class="btns"><button data-m="x">Cancel</button><button class="pri" data-m="ok">Save</button></div>`,{ok(){saveGoal($('#gt').value.trim());render()}})}
function affModal(a){modal(`<h3>${a?'Edit':'Add'} affirmation</h3><label>Text<input id="at" maxlength="160" value="${a?esc(a.text):''}"></label><div class="btns"><button data-m="x">Cancel</button><button class="pri" data-m="ok">Save</button></div>`,{ok(){const v=$('#at').value.trim();if(!v){$('#at').focus();return false}
 let x=a;if(x)x.text=v;else{x={id:'aff_'+uid(),text:v,isActive:true};S.affs.push(x)}save(['affirmations'],o=>o.affirmations.put(x));render()}})}
function vToday(){const l=active(),t=today(),ix=byTask(),done=l.filter(x=>ix.get(x.id)&&ix.get(x.id).has(t)).length,pct=l.length?Math.round(done/l.length*100):0;
 return `<section class="hero"><div class="goal" data-act="goal">${S.goal?esc(S.goal):'<span class="mut">Tap to set your personal goal</span>'}</div><div class="aff" id="aff"></div></section>
<div class="card"><div class="row"><b>Today’s Progress</b>${l.length?`<span>${done} / ${l.length} completed · ${pct}%</span>`:''}</div>${l.length?`<div class="bar"><i style="width:${pct}%"></i></div>`:'<p class="mut">You don’t have any tasks for today. Add your first task to get started.</p>'}</div>
<div class="row"><h2>Tasks</h2><button class="pri" data-act="add">+ Add task</button></div>
${l.length?`<div id="list">${l.map(x=>{const c=ix.get(x.id)||new Set(),d=c.has(t);return `<div class="task${d?' done':''}" data-id="${x.id}" role="checkbox" aria-checked="${d}" tabindex="0"><span class="h" data-act="drag" title="Drag to reorder">⠿</span><span class="pr">${pad(x.priority)}</span><span class="nm"><span class="t">${esc(x.name)}</span><small>${c.size} ${c.size===1?'day':'days'} · ${streaks(c).cur}-day streak</small></span><button class="ib" data-act="edit" aria-label="Edit task">✎</button><span class="cb">${d?'✓':''}</span></div>`}).join('')}</div>`:'<p class="mut center">Your task list is empty. Add something meaningful to work on today.</p>'}`}
function vArch(){const l=archived(),ix=byTask();return `<h2>Archived tasks</h2>`+(l.length?l.map(t=>`<div class="card row" data-id="${t.id}"><span class="nm"><span class="t">${esc(t.name)}</span><small>${(ix.get(t.id)||new Set()).size} completed days · archived ${t.archivedAt||''}</small></span><span><button data-act="restore">Restore</button> <button class="bad" data-act="del">Delete</button></span></div>`).join(''):'<p class="mut">You haven’t archived any tasks yet.</p>')}
function vPrefs(){const p=S.p;return `<h2>Settings</h2>
<div class="card"><b>Personal goal</b><p>${S.goal?esc(S.goal):'<span class="mut">Not set</span>'}</p><button data-act="goal">Edit goal</button></div>
<div class="card"><b>Affirmations</b>${S.affs.length?S.affs.map(a=>`<div class="row li" data-id="${a.id}"><span>${esc(a.text)}</span><span><button data-act="aedit">Edit</button> <button class="bad" data-act="adel">Delete</button></span></div>`).join(''):'<p class="mut">No affirmations yet.</p>'}<div class="btns" style="justify-content:flex-start"><button class="pri" data-act="aadd">+ Add affirmation</button></div>
<label><input type="checkbox" id="auto" ${p.autoRotateAffirmations?'checked':''}>Rotate automatically</label><label>Rotation interval (seconds)<input type="number" id="iv" min="2" max="60" value="${p.affirmationInterval/1000}"></label></div>
<div class="card"><b>Theme</b><div class="btns" style="justify-content:flex-start">${[['light','Light'],['dark','Dark'],['','System']].map(([v,l])=>`<button data-act="theme" data-v="${v}" class="${(p.theme||'')===v?'on':''}">${l}</button>`).join('')}</div></div>
<div class="card"><b>Your data</b><p class="note">Everything is stored on this device only.</p><div class="btns" style="justify-content:flex-start">${deferredInstall?'<button class="pri" data-act="install">Install app</button>':''}<button data-act="exp">Export</button><button data-act="imp">Import</button><button class="bad" data-act="clr">Clear all data</button></div></div>`}
function vHist(){const ix=byTask(),T=today();
 if(!S.comps.length)return `<h2>History</h2><p class="mut">Your productivity journey starts today. Complete your first task to build your history.</p>`;
 const firstD=[...S.tasks.map(t=>t.createdAt),...S.comps.map(c=>c.completedDate)].sort()[0],sel=S.tasks.find(t=>t.id===selT);let tiles;
 if(sel){const c=ix.get(sel.id)||new Set(),s=streaks(c),f30=addDays(T,-29),from=sel.createdAt>f30?sel.createdAt:f30,span=dn(T)-dn(from)+1;let n=0;c.forEach(d=>{if(d>=from&&d<=T)n++});
  tiles=[[c.size,'Completed days'],[s.cur,'Current streak (days)'],[s.best,'Longest streak (days)'],[Math.min(100,Math.round(n/span*100))+'%','Completion, last 30 days']]}
 else{const s=streaks(new Set(S.comps.map(c=>c.completedDate)));let sum=0,cnt=0,top=null;
  for(let d=firstD,i=0;d<=T&&i<5000;d=addDays(d,1),i++){const x=dayInfo(d,ix);if(x.d){sum+=x.c/x.d;cnt++}}
  S.tasks.forEach(t=>{const n=(ix.get(t.id)||new Set()).size;if(!top||n>top.n)top={n,name:t.name}});
  tiles=[[S.comps.length,'Total completed task-days'],[s.cur,'Current streak (days)'],[s.best,'Longest streak (days)'],[cnt?Math.round(sum/cnt*100)+'%':'–','Average daily completion'],[top&&top.n?esc(top.name):'–','Most consistent task']]}
 const wk=[6,5,4,3,2,1,0].map(i=>{const d=addDays(T,-i),x=dayInfo(d,ix);return `<div><span>${x.d?x.c+'/'+x.d:'–'}</span><div class="bw"><i style="height:${x.d?Math.round(x.c/x.d*100):0}%"></i></div><span>${parse(d).toLocaleDateString(undefined,{weekday:'short'})}</span></div>`}).join('');
 if(!cal)cal={y:new Date().getFullYear(),m:new Date().getMonth()};
 const first=new Date(cal.y,cal.m,1),dim=new Date(cal.y,cal.m+1,0).getDate(),lead=(first.getDay()+6)%7,[fy,fm]=firstD.split('-').map(Number),now=new Date(),curM=now.getFullYear()*12+now.getMonth();
 let cells=['Mo','Tu','We','Th','Fr','Sa','Su'].map(w=>`<div class="wd">${w}</div>`).join('')+'<div></div>'.repeat(lead);
 for(let i=1;i<=dim;i++){const d=`${cal.y}-${pad(cal.m+1)}-${pad(i)}`;let k='dn';
  if(d<=T&&d>=firstD){if(sel)k=(ix.get(sel.id)||new Set()).has(d)?'dh':(d>=sel.createdAt?'dz':'dn');else{const x=dayInfo(d,ix);k=!x.d?'dn':x.c===0?'dz':x.c>=x.d?'dh':'dp'}}
  cells+=`<div class="${k}${d===T?' today':''}" title="${d}">${i}</div>`}
 const rows=[...S.tasks].map(t=>[t,(ix.get(t.id)||new Set()).size]).sort((a,b)=>b[1]-a[1]);
 return `<h2>History</h2><label>Show statistics for<select id="ts"><option value="">All tasks</option>${S.tasks.map(t=>`<option value="${t.id}"${t.id===selT?' selected':''}>${esc(t.name)}${t.status==='archived'?' (archived)':''}</option>`).join('')}</select></label>
<div class="tiles" style="margin-top:12px">${tiles.map(([v,l])=>`<div class="card tile" style="margin:0"><b>${v}</b><span>${l}</span></div>`).join('')}</div>
<div class="card"><b>Last 7 days</b><div class="wk" style="margin-top:10px">${wk}</div></div>
<div class="card"><div class="row"><button data-act="cprev" ${cal.y*12+cal.m<=fy*12+fm-1?'disabled':''}>‹</button><b>${first.toLocaleDateString(undefined,{month:'long',year:'numeric'})}</b><button data-act="cnext" ${cal.y*12+cal.m>=curM?'disabled':''}>›</button></div><div class="cal" style="margin-top:10px">${cells}</div>
<div class="lg"><span>■ All done</span><span>■ Partial</span><span>■ None done</span><span>□ No data / future</span></div></div>
<div class="card"><b>Completed days per task</b>${rows.map(([t,n])=>`<div class="row li"><span>${esc(t.name)}${t.status==='archived'?' <span class="mut">(archived)</span>':''}</span><b>${n}</b></div>`).join('')}</div>
<p class="note">A streak counts consecutive calendar days with a completion; the current streak stays alive until a full day is missed. Daily completion compares tasks completed with tasks that existed on that day. Each task counts once per date.</p>`}
function act(a,id,el){const t=id&&S.tasks.find(x=>x.id===id);
 switch(a){
 case 'add':taskModal();break;
 case 'edit':if(t)taskModal(t);break;
 case 'goal':goalModal();break;
 case 'restore':if(t){restore(id);render()}break;
 case 'del':if(t)confirmBox(`Delete “${esc(t.name)}” permanently? Its completion history will be removed too.`,'Delete',()=>{remove(id);render()});break;
 case 'aadd':affModal();break;
 case 'aedit':affModal(S.affs.find(x=>x.id===id));break;
 case 'adel':S.affs=S.affs.filter(x=>x.id!==id);save(['affirmations'],o=>o.affirmations.delete(id));render();break;
 case 'theme':S.p.theme=el.dataset.v||null;savePrefs();applyTheme();render();break;
 case 'install':if(deferredInstall){deferredInstall.prompt();deferredInstall=null;render()}break;
 case 'exp':exportModal();break;
 case 'imp':importModal();break;
 case 'clr':confirmBox('Delete all tasks, history, goal and settings from this device? This cannot be undone.','Clear everything',()=>{fresh();cal=null;selT='';applyTheme();writeAll().then(()=>{location.hash='';render();toast('All data cleared')})});break;
 case 'cprev':cal.m--;if(cal.m<0){cal.m=11;cal.y--}render();break;
 case 'cnext':{const n=new Date();if(cal.y*12+cal.m>=n.getFullYear()*12+n.getMonth())break;cal.m++;if(cal.m>11){cal.m=0;cal.y++}render();break}
 }}
function render(){const h=location.hash.slice(1);view=['history','archive','prefs'].includes(h)?h:'today';
 $('#date').textContent=new Date().toLocaleDateString(undefined,{weekday:'long',year:'numeric',month:'long',day:'numeric'});
 $('#nav').innerHTML=[['today','Today'],['history','History'],['archive','Archive'],['prefs','Settings']].map(([k,l])=>`<a href="#${k}" class="${k===view?'on':''}">${l}</a>`).join('');
 main.innerHTML=({today:vToday,history:vHist,archive:vArch,prefs:vPrefs})[view]();
 if(view==='today')affStart();else affTok++}
main.onclick=e=>{const a=e.target.closest('[data-act]'),w=e.target.closest('[data-id]');
 if(a){act(a.dataset.act,w&&w.dataset.id,a);return}
 if(w&&w.classList.contains('task'))toggle(w.dataset.id)};
main.onchange=e=>{const t=e.target;
 if(t.id==='auto'){S.p.autoRotateAffirmations=t.checked;savePrefs()}
 else if(t.id==='iv'){const v=Math.min(60,Math.max(2,+t.value||5));t.value=v;S.p.affirmationInterval=v*1000;savePrefs()}
 else if(t.id==='ts'){selT=t.value;render()}};
main.addEventListener('pointerdown',e=>{const h=e.target.closest('[data-act="drag"]');if(!h)return;e.preventDefault();
 const c=h.closest('.task'),box=c.parentNode;c.classList.add('drag');try{h.setPointerCapture(e.pointerId)}catch(_){}
 const mv=ev=>{const nx=[...box.children].filter(x=>x!==c).find(x=>{const r=x.getBoundingClientRect();return ev.clientY<r.top+r.height/2});box.insertBefore(c,nx||null)};
 const up=()=>{h.removeEventListener('pointermove',mv);h.removeEventListener('pointerup',up);h.removeEventListener('pointercancel',up);c.classList.remove('drag');
  const m=new Map(S.tasks.map(t=>[t.id,t])),l=[...box.children].map(x=>m.get(x.dataset.id)).filter(Boolean);persistTasks(setOrder(l));render()};
 h.addEventListener('pointermove',mv);h.addEventListener('pointerup',up);h.addEventListener('pointercancel',up)});
document.addEventListener('keydown',e=>{const open=!$('#modal').hidden;
 if(e.key==='Escape'&&open)closeM();
 else if(e.key==='Enter'&&open&&e.target.tagName==='INPUT'&&e.target.type!=='checkbox'){e.preventDefault();const b=$('#modal [data-m="ok"]');if(b)b.click()}
 else if((e.key===' '||e.key==='Enter')&&e.target.classList&&e.target.classList.contains('task')){e.preventDefault();toggle(e.target.dataset.id)}});
window.addEventListener('hashchange',()=>{render();scrollTo(0,0)});
function exportModal(){const j=exportJSON();
 modal(`<h3>Export backup</h3><p class="mut">Download your data as a JSON file and keep it somewhere safe.</p><div class="btns"><button data-m="x">Close</button><button data-m="copy">Copy text</button><button class="pri" data-m="ok">Download file</button></div>`,{
  ok(){const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([j],{type:'application/json'}));a.download=`dailyflow-backup-${today()}.json`;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),1500);toast('Backup downloaded');return false},
  copy(){if(navigator.clipboard)navigator.clipboard.writeText(j).then(()=>toast('Copied'),()=>toast('Copy failed'));else toast('Copy isn’t supported here');return false}})}
function importModal(){modal(`<h3>Import backup</h3><p class="mut">Choose a DailyFlow backup file, or paste its JSON. This replaces all current data.</p><label>Backup file<input type="file" id="if" accept=".json,application/json"></label><label>Or paste JSON<textarea id="ij" rows="6" placeholder="Paste backup JSON here"></textarea></label><div class="btns"><button data-m="x">Cancel</button><button class="pri" data-m="ok">Replace data</button></div>`,{ok(){let d;try{d=JSON.parse($('#ij').value);validate(d)}catch(e){toast(e instanceof SyntaxError?'That isn’t valid JSON':e.message);return false}
 confirmBox('Replace all current data with this backup? This cannot be undone.','Replace',()=>applyImport(d));return false}});
 $('#if').onchange=e=>{const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=()=>{$('#ij').value=String(r.result)};r.readAsText(f)}}
