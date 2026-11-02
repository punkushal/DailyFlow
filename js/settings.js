/* settings.js: application state, defaults, preferences and theme */
let S;
const fresh=()=>{S={tasks:[],comps:[],affs:DEF.map((t,i)=>({id:'aff_'+(i+1),text:t,isActive:true})),goal:'',p:{key:'prefs',theme:null,affirmationInterval:5000,autoRotateAffirmations:true}}};
const savePrefs=()=>save(['settings'],o=>o.settings.put(S.p));
function applyTheme(){const r=document.documentElement;if(S.p.theme)r.dataset.theme=S.p.theme;else delete r.dataset.theme}
