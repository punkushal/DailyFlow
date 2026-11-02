/* task-completions.js: date-specific completion records (one per task per day) */
function toggle(id){const d=today(),k=id+'|'+d,i=S.comps.findIndex(c=>c.id===k);
 if(i>=0){S.comps.splice(i,1);save(['completions'],o=>o.completions.delete(k))}
 else{const c={id:k,taskId:id,completedDate:d,completedAt:new Date().toISOString()};S.comps.push(c);save(['completions'],o=>o.completions.put(c))}
 render()}
const byTask=()=>{const m=new Map();S.comps.forEach(c=>{if(!m.has(c.taskId))m.set(c.taskId,new Set());m.get(c.taskId).add(c.completedDate)});return m};
