/* backup.js: export, validate and import JSON backups */
const exportJSON=()=>JSON.stringify({app:'dailyflow',version:1,exportedAt:new Date().toISOString(),tasks:S.tasks,completions:S.comps,goal:{id:'main_goal',text:S.goal},affirmations:S.affs,settings:{theme:S.p.theme,affirmationInterval:S.p.affirmationInterval,autoRotateAffirmations:S.p.autoRotateAffirmations}},null,1);
function validate(d){if(!d||d.app!=='dailyflow'||!Array.isArray(d.tasks)||!Array.isArray(d.completions)||!Array.isArray(d.affirmations))throw Error('This isn’t a DailyFlow backup');
 const re=/^\d{4}-\d{2}-\d{2}$/,ids=new Set(),aid=new Set();
 d.tasks.forEach(t=>{if(!t||typeof t.id!=='string'||ids.has(t.id)||typeof t.name!=='string'||!['active','archived'].includes(t.status)||!re.test(t.createdAt||''))throw Error('Backup contains invalid tasks');ids.add(t.id)});
 d.completions.forEach(c=>{if(!c||!ids.has(c.taskId)||!re.test(c.completedDate||''))throw Error('Backup contains invalid completion records')});
 d.affirmations.forEach(a=>{if(!a||typeof a.id!=='string'||aid.has(a.id)||typeof a.text!=='string')throw Error('Backup contains invalid affirmations');aid.add(a.id)})}
function applyImport(d){const seen=new Set(),comps=[];d.completions.forEach(c=>{const k=c.taskId+'|'+c.completedDate;if(!seen.has(k)){seen.add(k);comps.push({id:k,taskId:c.taskId,completedDate:c.completedDate,completedAt:c.completedAt||c.completedDate})}});
 const s=d.settings||{};
 S={tasks:d.tasks.map(t=>({id:t.id,name:t.name,priority:t.status==='archived'?null:(+t.priority||1e9),status:t.status,createdAt:t.createdAt,archivedAt:t.archivedAt||null})),comps,affs:d.affirmations.map(a=>({id:a.id,text:a.text,isActive:a.isActive!==false})),goal:d.goal&&typeof d.goal.text==='string'?d.goal.text:'',p:{key:'prefs',theme:s.theme==='light'||s.theme==='dark'?s.theme:null,affirmationInterval:Math.min(6e4,Math.max(2e3,+s.affirmationInterval||5000)),autoRotateAffirmations:s.autoRotateAffirmations!==false}};
 setOrder(active());return writeAll().then(()=>{applyTheme();render();toast('Backup restored')})}
