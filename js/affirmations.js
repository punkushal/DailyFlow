/* affirmations.js: default affirmations and the fading rotation */
let affTok=0;
const DEF=["Small progress is still progress.","Your future is built by what you do today.","Discipline takes you where motivation cannot.","You don’t need to be perfect. You need to be consistent.","Every day is another opportunity to improve.","Focus on your journey, not someone else’s.","You are capable of building the life you want."];
let ai=0;
function affStart(){const tok=++affTok,el=$('#aff'),l=()=>S.affs.filter(a=>a.isActive);if(!el)return;
 if(!l().length){el.innerHTML='<a href="#prefs">Add an affirmation to start your day with a positive thought.</a>';return}
 ai%=l().length;el.textContent=l()[ai].text;
 if(l().length<2||!S.p.autoRotateAffirmations)return;
 const tick=()=>setTimeout(()=>{if(tok!==affTok)return;if(document.hidden)return tick();const e=$('#aff');if(!e)return;e.style.opacity=0;
  setTimeout(()=>{if(tok!==affTok)return;const a=l();if(!a.length)return;ai=(ai+1)%a.length;e.textContent=a[ai].text;e.style.opacity=1;tick()},400)},S.p.affirmationInterval);tick()}
