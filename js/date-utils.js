/* date-utils.js: local dates (YYYY-MM-DD) and small shared helpers */
const $=s=>document.querySelector(s);
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const pad=n=>String(n).padStart(2,'0'),fmt=d=>`${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`,today=()=>fmt(new Date());
const parse=s=>{const[a,b,c]=s.split('-').map(Number);return new Date(a,b-1,c)};
const dn=s=>{const[a,b,c]=s.split('-').map(Number);return Date.UTC(a,b-1,c)/864e5};
const addDays=(s,n)=>{const d=parse(s);d.setDate(d.getDate()+n);return fmt(d)};
const uid=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,6);
