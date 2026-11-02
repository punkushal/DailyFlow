/* statistics.js: streaks and per-day completion figures */
const streaks=ds=>{const a=[...ds].map(dn).sort((x,y)=>x-y);let best=0,run=0,prev=null;a.forEach(n=>{run=prev!==null&&n===prev+1?run+1:1;best=Math.max(best,run);prev=n});
 const set=new Set(a),t=dn(today());let c=set.has(t)?t:t-1,cur=0;while(set.has(c)){cur++;c--}return{cur,best}};
const dayInfo=(date,ix)=>{let c=0;ix.forEach(s=>{if(s.has(date))c++});const d=S.tasks.filter(t=>t.createdAt<=date&&(!t.archivedAt||t.archivedAt>date)).length;return{c,d:Math.max(d,c)}};
