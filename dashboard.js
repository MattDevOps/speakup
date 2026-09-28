/* ══════════════════════════════════
   DASHBOARD PAGE
   Connection, panel toggles and HTML. The numbers come from dashboard-data.js.
   Event data comes from the database, so it is escaped before it is shown.
══════════════════════════════════ */
const REFRESH_MS=30000;
const RECENT_LOG_SIZE=30;
const PANELS={
  history:{key:'su_dash_history',btn:'historyBtn',label:'login history & time used'},
  lessons:{key:'su_dash_lessons',btn:'lessonsBtn',label:'lessons completed'},
};
const EVENT_LABELS={
  [EV.LOGIN]:['👤','opened the app'],
  [EV.LESSON]:['📖','started a lesson'],
  [EV.QUIZ]:['🎯','finished a quiz'],
};

let fbBase='';
let allEvents=[];
let autoTimer=null;
const shown=Object.fromEntries(Object.entries(PANELS).map(([name,p])=>[name,localStorage.getItem(p.key)==='1']));

/* Connection */
function toggleSetup(){
  const b=document.getElementById('setupBox');
  b.style.display=b.style.display==='none'?'block':'none';
}
function setStatus(msg,cls){
  const el=document.getElementById('status');
  el.textContent=msg;el.className='status '+(cls||'');
}
function connect(){
  const typed=document.getElementById('fbUrl').value.trim();
  let url=typed.replace(/\/+$/,'');
  if(!url){setStatus('Please paste a URL','err');return;}
  // ensure it ends with /speakup
  if(!url.endsWith('/speakup')) url+='/speakup';
  fbBase=url;
  localStorage.setItem('su_dash_url',typed);
  setStatus('Connecting...','');
  fetchData();
  document.getElementById('refreshRow').style.display='block';
  document.getElementById('toggleRow').style.display='block';
  Object.keys(PANELS).forEach(updatePanelBtn);
  if(autoTimer) clearInterval(autoTimer);
  autoTimer=setInterval(fetchData,REFRESH_MS);
}
async function fetchData(){
  try{
    const res=await fetch(fbBase+EVENTS_PATH);
    if(!res.ok) throw new Error('HTTP '+res.status);
    const raw=await res.json();
    allEvents=raw?Object.values(raw).sort((a,b)=>a.t-b.t):[];
    const summary=raw?allEvents.length+' events loaded (last refresh: '+new Date().toLocaleTimeString()+')':'no data yet';
    setStatus('Connected - '+summary,'ok');
    render();
  }catch(e){
    setStatus('Error: '+e.message+' - check your URL','err');
  }
}

/* Panel toggles */
function updatePanelBtn(name){
  const btn=document.getElementById(PANELS[name].btn);
  if(!btn) return;
  btn.textContent=(shown[name]?'Hide ':'Show ')+PANELS[name].label;
  btn.classList.toggle('active',shown[name]);
}
function togglePanel(name){
  shown[name]=!shown[name];
  localStorage.setItem(PANELS[name].key,shown[name]?'1':'0');
  updatePanelBtn(name);
  render();
}

/* HTML */
function statBox(num,label){
  return `<div class="stat-box"><div class="stat-num">${num}</div><div class="stat-lbl">${label}</div></div>`;
}
function renderDayBars(bars){
  const max=Math.max(...bars.map(d=>d.count),1);
  return bars.map(d=>`<div class="day-row">
    <div class="day-label">${d.label}</div>
    <div class="day-bar-wrap"><div class="day-bar" style="width:${(d.count/max)*100}%"></div></div>
    <div class="day-count">${d.count}</div>
  </div>`).join('');
}
function renderPersonalBanner(p){
  const seen=p.count>0;
  const status=seen
    ? `<div class="seen-msg">✓ Saw it ${p.count}× ${p.quizzed?'· finished quiz':''}</div><div class="meta">Last opened ${timeAgo(p.lastTs)}</div>`
    : `<div class="miss-msg">Not seen yet</div><div class="meta">Open ${esc(p.where)}</div>`;
  return `<div class="personal-banner${seen?' seen':''}">
    <div class="personal-icon">${seen?'💖':'⏳'}</div>
    <div class="personal-text"><b>"${esc(p.phrase)}"</b>${status}</div>
  </div>`;
}
function renderUserCard(u,now){
  const allUserEvts=allEvents.filter(e=>e.u===u.id);
  const evts=allUserEvts.filter(isActivity);
  const s=userStats(evts,now);
  return `<div class="user-card">
    <div class="user-hdr">
      <div class="user-avatar">${esc(u.emoji)}</div>
      <div>
        <div class="user-name">${esc(u.name)}</div>
        <div class="user-last">Last active: ${s.lastTs?timeAgo(s.lastTs):'Never'}</div>
      </div>
    </div>
    ${personalStatus(u.id,evts).map(renderPersonalBanner).join('')}
    <div class="stats-grid">${statBox(s.sessions,'Sessions')}${statBox(s.lessons,'Lessons')}${statBox(s.quizzes,'Quizzes')}</div>
    <div class="stats-grid">${statBox(s.today,'Today')}${statBox(s.days7,'Last 7 days')}${statBox(s.total,'All time')}</div>
    <div class="activity-bar">
      <div class="activity-title">Last 7 days</div>
      ${renderDayBars(dayBars(evts))}
    </div>
    ${shown.lessons?renderLessonsPanel(evts):''}
    ${shown.history?renderHistoryPanel(allUserEvts):''}
  </div>`;
}
function renderActivityLog(users){
  const rows=allEvents.filter(isActivity).slice(-RECENT_LOG_SIZE).reverse().map(e=>{
    const u=users.find(x=>x.id===e.u);
    const [emoji,text]=EVENT_LABELS[e.e]||['❓',esc(e.e)];
    return `<div class="log-entry">
      <div class="log-emoji">${emoji}</div>
      <div class="log-text"><b>${u?esc(u.name):'?'}</b> ${text}</div>
      <div class="log-time">${fmtDateTime(e.t)}</div>
    </div>`;
  }).join('');
  return `<div class="log-section">
    <h3>RECENT ACTIVITY</h3>
    ${rows||'<div style="color:rgba(255,255,255,0.3);font-size:12px">No events yet</div>'}
  </div>`;
}
function render(){
  const content=document.getElementById('content');
  if(!allEvents.length){
    content.innerHTML='<div class="empty">No usage data yet. Once they start using the app, data will appear here.</div>';
    return;
  }
  const now=Date.now(),users=dashboardUsers(allEvents);
  content.innerHTML=`<div class="users-grid">${users.map(u=>renderUserCard(u,now)).join('')}</div>${renderActivityLog(users)}`;
}

function renderLessonRow(level,l,activity){
  const d=activity[lessonKey(level,l.id)];
  const cls='lesson-row-d'+(l.personal?' highlight':'')+(d&&d.quizzes>0?' done':'');
  const counts=d
    ? `<span>opened <b>${d.starts}</b></span><span>quiz <b class="${d.quizzes>0?'done':''}">${d.quizzes}</b></span>`
    : `<span style="color:rgba(255,255,255,0.25)">not opened</span>`;
  return `<div class="${cls}">
    <div class="lesson-name">${l.personal?'<span class="star">💖</span>':''}${l.emoji} ${l.name}</div>
    <div class="lesson-counts">${counts}</div>
  </div>`;
}
function renderLessonsPanel(evts){
  const activity=lessonActivity(evts);
  const opened=Object.values(activity);
  const groups=Object.entries(LESSON_CATALOG).map(([level,lessons])=>
    `<div class="lvl-group"><div class="lvl-group-hdr">${LEVEL_META[level].label}</div>${lessons.map(l=>renderLessonRow(level,l,activity)).join('')}</div>`
  ).join('');
  const noteIfEmpty=opened.length===0
    ? '<div style="color:rgba(255,255,255,0.35);font-size:11px;margin-top:8px">No tagged lesson events yet. Older events (before this update) didn\'t record which lesson was opened — new opens from now on will show up here.</div>'
    : '';
  return `<div class="lessons-panel">
    <div class="lessons-title"><span>LESSONS OPENED</span><span class="lessons-total">${opened.length} opened · ${opened.filter(v=>v.quizzes>0).length} quizzed</span></div>
    ${groups}
    ${noteIfEmpty}
  </div>`;
}

function renderSessionRow(s){
  const loc=fmtLocation(s);
  const devHtml=s.device?`<div class="history-loc">💻 ${esc(s.device)}</div>`:'';
  const locHtml=loc?`<div class="history-loc">📍 ${esc(loc)}</div>`:'';
  const durCls='history-dur'+(s.estimated?' est':'');
  const title=s.estimated?'Estimated (no logout recorded)':'Measured';
  return `<div class="history-row"><div class="history-when"><div>${fmtDateTime(s.start)}</div>${devHtml}${locHtml}</div><div class="${durCls}" title="${title}">${fmtDuration(s.duration)}${s.estimated?'*':''}</div></div>`;
}
function renderHistoryPanel(evts){
  const sessions=buildSessions(evts);
  if(!sessions.length){
    return `<div class="history-panel">
      <div class="history-title"><span>LOGIN HISTORY</span><span class="history-total">0m</span></div>
      <div style="color:rgba(255,255,255,0.3);font-size:11px">No logins yet</div>
    </div>`;
  }
  const total=sessions.reduce((a,s)=>a+s.duration,0);
  const note=sessions.some(s=>s.estimated)
    ? '<div style="color:rgba(255,255,255,0.25);font-size:10px;margin-top:6px">* estimated — older sessions before logout tracking, or browser closed without warning</div>'
    : '';
  return `<div class="history-panel">
    <div class="history-title"><span>LOGIN HISTORY (${sessions.length})</span><span class="history-total">Total: ${fmtDuration(total)}</span></div>
    <div class="history-list">${sessions.slice().reverse().map(renderSessionRow).join('')}</div>
    ${note}
  </div>`;
}

// Reconnect with the saved URL so you don't have to paste it every time
(function loadSaved(){
  const saved=localStorage.getItem('su_dash_url');
  if(saved){document.getElementById('fbUrl').value=saved;connect();}
})();
