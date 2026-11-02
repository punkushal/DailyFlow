/* tasks.js: add, edit, reorder, archive, restore and delete tasks */
const persistTasks=ch=>ch.length?save(['tasks'],o=>ch.forEach(t=>o.tasks.put(t))):0;
const active=()=>S.tasks.filter(t=>t.status==='active').sort((a,b)=>a.priority-b.priority);
const archived=()=>S.tasks.filter(t=>t.status==='archived').sort((a,b)=>(b.archivedAt||'').localeCompare(a.archivedAt||''));
const setOrder=l=>{const ch=[];l.forEach((t,i)=>{if(t.priority!==i+1){t.priority=i+1;ch.push(t)}});return ch};
function addTask(name,pos){const t={id:'task_'+uid(),name,priority:0,status:'active',createdAt:today(),archivedAt:null},l=active();l.splice(Math.max(0,Math.min(pos-1,l.length)),0,t);S.tasks.push(t);persistTasks(setOrder(l))}
function updateTask(t,name,pos){t.name=name;const l=active().filter(x=>x!==t);l.splice(Math.max(0,Math.min(pos-1,l.length)),0,t);const ch=setOrder(l);if(!ch.includes(t))ch.push(t);persistTasks(ch)}
function archive(id){const t=S.tasks.find(x=>x.id===id);t.status='archived';t.archivedAt=today();t.priority=null;const ch=setOrder(active());ch.push(t);persistTasks(ch)}
function restore(id){const t=S.tasks.find(x=>x.id===id);t.status='active';t.archivedAt=null;t.priority=1e9;persistTasks(setOrder(active()))}
function remove(id){S.tasks=S.tasks.filter(t=>t.id!==id);const gone=S.comps.filter(c=>c.taskId===id);S.comps=S.comps.filter(c=>c.taskId!==id);const ch=setOrder(active());save(['tasks','completions'],o=>{o.tasks.delete(id);gone.forEach(c=>o.completions.delete(c.id));ch.forEach(t=>o.tasks.put(t))})}
