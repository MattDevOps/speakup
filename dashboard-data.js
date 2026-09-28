/* ══════════════════════════════════
   DASHBOARD DATA
   Pure functions over the event list. Nothing here touches the page.
   USERS, LEVEL_META, LESSONS and PERSONAL_WORDS come from content.js, the same
   file the app uses, so the dashboard follows the lessons automatically.
══════════════════════════════════ */
const DAY_MS=86400000;
const DAY_NAMES=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
const UNKNOWN_USER_EMOJI='🧑';

// Lessons that start with a personal phrase (the FIRST flashcard), so opening
// the lesson means the user has seen the phrase.
const PERSONAL_LESSONS=Object.entries(LESSONS).flatMap(([level,lessons])=>
  lessons.filter(l=>PERSONAL_WORDS[l.id]).map(l=>({level,id:l.id,name:l.en}))
);
const LESSON_CATALOG=Object.fromEntries(Object.entries(LESSONS).map(([level,lessons])=>
  [level,lessons.map(l=>({id:l.id,name:l.en,emoji:l.emoji,personal:!!PERSONAL_WORDS[l.id]}))]
));

// Users added inside the app exist only on that person's device. The
// dashboard learns about them from the name sent with their login events.
function dashboardUsers(events){
  const known=new Set(USERS.map(u=>u.id));
  const extra={};
  events.forEach(e=>{
    if(!e.u||known.has(e.u)) return;
    const u=extra[e.u]||(extra[e.u]={id:e.u,name:e.u,emoji:UNKNOWN_USER_EMOJI});
    if(e.n) u.name=e.n;
    if(e.em) u.emoji=e.em;
  });
  return [...USERS,...Object.values(extra)];
}

// Logout events are session-end markers, not user activity
function isActivity(e){return e.e!==EV.LOGOUT;}

function userStats(evts,now){
  const count=type=>evts.filter(e=>e.e===type).length;
  const since=ms=>evts.filter(e=>now-e.t<ms).length;
  return {
    sessions:count(EV.LOGIN),lessons:count(EV.LESSON),quizzes:count(EV.QUIZ),
    today:since(DAY_MS),days7:since(7*DAY_MS),total:evts.length,
    lastTs:evts.length?evts[evts.length-1].t:null,
  };
}

// Event counts for each of the last 7 days, oldest first
function dayBars(evts){
  const bars=[];
  for(let i=6;i>=0;i--){
    const dayStart=new Date();dayStart.setHours(0,0,0,0);dayStart.setDate(dayStart.getDate()-i);
    const dayEnd=new Date(dayStart);dayEnd.setDate(dayEnd.getDate()+1);
    const count=evts.filter(e=>e.t>=dayStart.getTime()&&e.t<dayEnd.getTime()).length;
    bars.push({label:DAY_NAMES[dayStart.getDay()],count});
  }
  return bars;
}

// One entry per personal phrase this user has. Empty for users without any.
function personalStatus(userId,evts){
  return PERSONAL_LESSONS.filter(l=>PERSONAL_WORDS[l.id][userId]).map(l=>{
    const opened=evts.filter(e=>e.lid===l.id&&e.lvl===l.level);
    return {
      phrase:PERSONAL_WORDS[l.id][userId].e,
      where:LEVEL_META[l.level].label+' → '+l.name,
      count:opened.length,
      quizzed:opened.some(e=>e.e===EV.QUIZ),
      lastTs:opened.length?opened[opened.length-1].t:null,
    };
  });
}

// Lesson activity keyed by "level|lessonId". Older events (before lid/lvl were
// tracked) have no such fields and are ignored.
function lessonKey(level,id){return level+'|'+id;}
function lessonActivity(evts){
  const byKey={};
  evts.filter(e=>(e.e===EV.LESSON||e.e===EV.QUIZ)&&e.lid&&e.lvl).forEach(e=>{
    const k=lessonKey(e.lvl,e.lid);
    if(!byKey[k]) byKey[k]={starts:0,quizzes:0,last:0};
    if(e.e===EV.LESSON) byKey[k].starts++;
    if(e.e===EV.QUIZ) byKey[k].quizzes++;
    if(e.t>byKey[k].last) byKey[k].last=e.t;
  });
  return byKey;
}

// Pair each login event with its session-end. Prefer an explicit logout
// (sent on page unload). Fall back to the last in-session activity for older
// data or sessions where the browser was killed without firing beforeunload.
// Sessions are capped at 2h to avoid runaway estimates.
const SESSION_CAP_MS=2*60*60*1000;
const SESSION_TAIL_MS=60000;
function sessionEnd(start,inWindow){
  const logout=inWindow.find(e=>e.e===EV.LOGOUT);
  if(logout) return {end:logout.t,estimated:false};
  // no logout: assume they stayed ~1 minute past their last lesson/quiz (or past the login)
  const other=inWindow.filter(e=>e.e!==EV.LOGIN);
  const lastT=other.length?other[other.length-1].t:start;
  return {end:lastT+SESSION_TAIL_MS,estimated:true};
}
function buildSessions(evts){
  const sorted=evts.slice().sort((a,b)=>a.t-b.t);
  const logins=sorted.filter(e=>e.e===EV.LOGIN);
  return logins.map((login,i)=>{
    const start=login.t;
    const nextLoginT=i+1<logins.length?logins[i+1].t:Infinity;
    const {end,estimated}=sessionEnd(start,sorted.filter(e=>e.t>start&&e.t<nextLoginT));
    const duration=Math.min(Math.max(end-start,0),SESSION_CAP_MS);
    return {start,end:start+duration,duration,estimated,ip:login.ip,city:login.city,region:login.region,country:login.country,device:login.d};
  });
}

/* Formatting */
function fmtDay(ts){return new Date(ts).toLocaleDateString('en-GB',{day:'numeric',month:'short'});}
function fmtDateTime(ts){return fmtDay(ts)+' '+new Date(ts).toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit'});}
function timeAgo(ts){
  const s=Math.floor((Date.now()-ts)/1000);
  if(s<60) return 'Just now';
  if(s<3600) return Math.floor(s/60)+'m ago';
  if(s<86400) return Math.floor(s/3600)+'h ago';
  if(s<604800) return Math.floor(s/86400)+'d ago';
  return fmtDay(ts);
}
function fmtLocation(s){
  const region=s.region!==s.city?s.region:'';
  const place=[s.city,region,s.country].filter(Boolean).join(', ');
  return [place,s.ip].filter(Boolean).join(' · ');
}
function fmtDuration(ms){
  const s=Math.floor(ms/1000);
  if(s<60) return s+'s';
  const m=Math.floor(s/60);
  if(m<60) return m+'m';
  const h=Math.floor(m/60);
  const rm=m%60;
  return rm?h+'h '+rm+'m':h+'h';
}
