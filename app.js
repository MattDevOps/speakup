/* ══════════════════════════════════
   STATE & STORAGE
══════════════════════════════════ */
const STORE_KEY='su_v1';
function emptyLevels(){
  return Object.fromEntries(Object.keys(LEVEL_META).map(k=>[k,{stars:0,done:[],progress:{}}]));
}
let data=Object.fromEntries(allUsers().map(u=>[u.id,emptyLevels()]));
let cur={userId:null,level:null,lesson:null,reviewed:null,ci:0,qq:[],qi:0,qs:0,streak:0,fa:false,quizMode:'speak',recognizing:false,spokenText:''};
function ud(){return data[cur.userId][cur.level];}
function user(){return allUsers().find(u=>u.id===cur.userId);}
function lm(){return LEVEL_META[cur.level];}
function save(){try{localStorage.setItem(STORE_KEY,JSON.stringify(data));}catch(e){}}
function load(){
  try{
    const saved=JSON.parse(localStorage.getItem(STORE_KEY));
    if(!saved) return;
    allUsers().forEach(u=>Object.keys(LEVEL_META).forEach(k=>{
      const s=saved[u.id]&&saved[u.id][k];
      if(s) data[u.id][k]={stars:s.stars||0,done:s.done||[],progress:s.progress||{}};
    }));
  }catch(e){}
}

/* ══════════════════════════════════
   UI HELPERS (shuffle, pick, esc, ltr live in util.js)
══════════════════════════════════ */
// Long Hebrew phrases get a smaller font so they fit on the card
const SIZE_STEPS=[[22,'len-l'],[12,'len-m']];
function sizeClass(text){
  const step=SIZE_STEPS.find(([min])=>text.length>min);
  return step?step[1]:'';
}

let toastTimer=null;
function toast(msg){
  const el=document.getElementById('toast');
  el.textContent=msg; el.classList.add('on');
  clearTimeout(toastTimer);
  toastTimer=setTimeout(()=>el.classList.remove('on'),4500);
}

/* ══════════════════════════════════
   FEEDBACK (shared by lesson + quiz)
══════════════════════════════════ */
const CHEERS=['כל הכבוד!','מדהים!','יופי!','אלופים!','מצוין!','נהדר!','סחתיין!','איזה כיף!','ממש טוב!','עבודה יפה!','פצצה!'];
const OK_EMOJIS=['🎉','🌟','💪','✨','🔥','👏','🥳'];

// prefix is the id prefix of the feedback card: 'lesson' or 'q'
function showFeedback(prefix,ok,mainText,detailHtml){
  const fb=document.getElementById(prefix+'Fb');
  fb.className='fb-card fin '+(ok?'correct':'wrong');
  fb.style.display='block';
  document.getElementById(prefix+'FbEmoji').textContent=ok?pick(OK_EMOJIS):'😅';
  document.getElementById(prefix+'FbMain').textContent=mainText;
  document.getElementById(prefix+'FbHeard').innerHTML=detailHtml;
  fb.scrollIntoView({block:'nearest',behavior:'smooth'});
}
function hideFeedback(prefix){
  const fb=document.getElementById(prefix+'Fb');
  fb.style.display='none'; fb.className='fb-card fin';
}

/* ══════════════════════════════════
   NAVIGATION
══════════════════════════════════ */
function activeScreen(){return document.querySelector('.screen.active').id;}
function show(id){
  document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  document.getElementById('scroll').scrollTop=0;
  emit('screenchange',id);
}
function updateHeader(){
  const u=user(),l=cur.level;
  const sub=!u?'לדבר אנגלית בקלות':l?`${u.nameHe} · ${LEVEL_META[l].icon} ${LEVEL_META[l].labelHe}`:`${u.nameHe} · בחירת רמה`;
  document.getElementById('hSub').textContent=sub;
  document.getElementById('starCount').textContent=u&&l?ud().stars:0;
  document.getElementById('backBtn').style.display=u?'flex':'none';
}
const BACK_TARGET={'s-levels':goProfiles,'s-home':goLevels,'s-lesson':goHome,'s-quiz':goHome,'s-result':goHome};
function goBack(){(BACK_TARGET[activeScreen()]||goProfiles)();}
function stopAudio(){stopListening();window.speechSynthesis.cancel();}
function goProfiles(){stopAudio();cur.userId=null;cur.level=null;updateHeader();renderProfiles();show('s-profiles');}
function goLevels(){stopAudio();cur.level=null;updateHeader();renderLevels();show('s-levels');}
function saveProgress(){
  if(!cur.lesson||!cur.reviewed||!cur.userId||!cur.level) return;
  const ud2=ud(),id=cur.lesson.id;
  if(!ud2.done.includes(id)){ud2.progress[id]=cur.reviewed.size;save();}
}
function goHome(){
  if(activeScreen()==='s-lesson') saveProgress();
  stopAudio();updateHeader();renderHome();show('s-home');
}

/* ══════════════════════════════════
   PROFILES
══════════════════════════════════ */
function renderProfiles(){
  document.getElementById('profileList').innerHTML=allUsers().map(u=>{
    const ud2=data[u.id];
    const pips=Object.entries(LEVEL_META).map(([k,m])=>
      `<span class="lvl-pip ${m.pip}">${m.icon} ${ud2[k].done.length}/${lessonsFor(u.id,k).length}</span>`
    ).join('');
    const total=Object.keys(LEVEL_META).reduce((sum,k)=>sum+ud2[k].stars,0);
    return`<div class="prof-card" onclick="selectUser('${u.id}')">
      <div class="p-avatar">${u.emoji}</div>
      <div style="flex:1">
        <div class="p-name">${esc(u.nameHe)} <span class="sub-en">${esc(u.name)}</span></div>
        <div class="p-sub">⭐ ${total} כוכבים</div>
        <div class="p-levels">${pips}</div>
      </div>
      ${u.custom?`<button class="rm-btn" onclick="event.stopPropagation();confirmRemoveUser('${u.id}')" aria-label="מחיקת משתמש">🗑️</button>`:''}
      <div class="chev">‹</div>
    </div>`;
  }).join('');
}
function selectUser(id){cur.userId=id;emit('su:login',{userId:id});updateHeader();renderLevels();show('s-levels');}

/* ══════════════════════════════════
   LEVELS
══════════════════════════════════ */
function renderLevels(){
  const u=user();
  document.getElementById('lvlAv').textContent=u.emoji;
  document.getElementById('lvlName').textContent=u.nameHe;
  document.getElementById('levelList').innerHTML=Object.entries(LEVEL_META).map(([k,m])=>{
    const ud2=data[cur.userId][k],total=lessonsFor(cur.userId,k).length,done=ud2.done.length,pct=total?Math.round(done/total*100):0;
    return`<div class="${m.lc} lvl-card" onclick="selectLevel('${k}')">
      <div class="lvl-top">
        <div class="lvl-title">${m.icon} ${m.labelHe} <span class="sub-en">${m.label}</span></div>
        <span class="lvl-badge ${m.bdg}">⭐ ${ud2.stars}</span>
      </div>
      <div class="lvl-desc">${m.descHe}</div>
      <div class="lvl-prow">
        <div class="lvl-pbar"><div class="lvl-pfill ${m.fill}" style="width:${pct}%"></div></div>
        <div class="lvl-ptext">${done}/${total} שיעורים</div>
      </div>
    </div>`;
  }).join('');
}
function selectLevel(level){cur.level=level;updateHeader();renderHome();show('s-home');}

/* ══════════════════════════════════
   HOME (lesson list)
══════════════════════════════════ */
function lessonMeta(l,done,prog){
  const n=l.words.length,unit=lm().unitHe;
  if(done) return `${n} ${unit} • הושלם ✓`;
  if(prog>0) return `למדתם ${prog} מתוך ${n} ${unit}`;
  return `${n} ${unit} • לחצו כדי להתחיל`;
}
function renderHome(){
  const u=user(),m=lm(),ud2=ud(),ls=lessonsFor(cur.userId,cur.level);
  document.getElementById('homeHdr').innerHTML=`
    <div class="hh-av">${u.emoji}</div>
    <div style="flex:1">
      <div class="hh-name">${esc(u.nameHe)} <span class="lvl-badge ${m.bdg}" style="font-size:10px">${m.icon} ${m.labelHe}</span></div>
      <div class="hh-sub">סיימתם ${ud2.done.length} מתוך ${ls.length} שיעורים</div>
    </div>
    <button class="sw-btn" onclick="goLevels()">📊 החלפת רמה</button>`;
  document.getElementById('lessonList').innerHTML=`
    <div class="sec-label">${m.icon} שיעורים · רמת ${m.labelHe}</div>
    ${ls.map(l=>{
      const dn=ud2.done.includes(l.id);
      const prog=ud2.progress[l.id]||0;
      return`<button class="lesson-row ${dn?'done':''}" onclick="startLesson('${l.id}')">
        <span class="lr-emoji">${l.emoji}</span>
        <div class="lr-info"><div class="lr-he">${l.he}</div><div class="lr-en">${l.en}</div><div class="lr-meta">${lessonMeta(l,dn,prog)}</div></div>
        ${dn?'<span class="lr-check">✓</span>':(prog>0?'<span style="color:var(--gold);font-size:12px">⏳</span>':'')}
        <span class="lr-arrow">‹</span>
      </button>`;
    }).join('')}`;
  document.getElementById('starCount').textContent=ud2.stars;
}

/* ══════════════════════════════════
   INIT (runs after every script has loaded)
══════════════════════════════════ */
document.addEventListener('DOMContentLoaded',()=>{
  load(); updateHeader(); renderProfiles(); show('s-profiles');
});
