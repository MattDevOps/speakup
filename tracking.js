/* ══════════════════════════════════
   USAGE TRACKING (Firebase)
   Listens to the app's events (su:login, su:lesson, su:quiz) and stores them
   for dashboard.html. Event names and fields are described in events.js.
══════════════════════════════════ */
// Firebase Realtime Database that receives the events (setup steps: dashboard.html)
const TRACKING_URL='https://speakup-40311-default-rtdb.europe-west1.firebasedatabase.app/speakup';
// Never send events while testing on this computer (local server or file://)
const LOCAL_HOSTS=['localhost','127.0.0.1',''];
let trackingBase=LOCAL_HOSTS.includes(location.hostname)?'':TRACKING_URL;

function eventsUrl(){return trackingBase+EVENTS_PATH;}
function eventPayload(userId,event,extra){
  return JSON.stringify(Object.assign({u:userId,e:event,t:Date.now()},extra||{}));
}
function trackEvent(userId,event,extra){
  if(!trackingBase) return;
  fetch(eventsUrl(),{method:'POST',body:eventPayload(userId,event,extra)}).catch(()=>{});
}

// Build a short device hint like "iPhone Safari" or "Windows Chrome" so we
// can distinguish devices behind the same router (where IPs would match).
// Order matters: the first rule that matches wins.
const OS_RULES=[[/iPhone|iPod/,'iPhone'],[/iPad/,'iPad'],[/Android/,'Android'],[/Windows/,'Windows'],[/Mac OS X/,'Mac'],[/Linux/,'Linux']];
const BROWSER_RULES=[[/Edg\//,'Edge'],[/OPR\/|Opera/,'Opera'],[/Chrome\//,'Chrome'],[/Firefox\//,'Firefox'],[/Safari\//,'Safari']];
function firstMatch(rules,text){
  const rule=rules.find(([re])=>re.test(text));
  return rule?rule[1]:'';
}
function deviceHint(){
  const ua=navigator.userAgent||'';
  return [firstMatch(OS_RULES,ua),firstMatch(BROWSER_RULES,ua)].filter(Boolean).join(' ')||'Unknown';
}

// Logins are tagged with IP/location so the dashboard can tell which device
// they signed in from. Uses ipwho.is (free, no API key, CORS-enabled).
async function lookupLocation(){
  try{
    const r=await fetch('https://ipwho.is/');
    const j=await r.json();
    if(j&&j.success!==false) return {ip:j.ip,city:j.city,region:j.region,country:j.country};
  }catch(e){}
  return {};
}
async function trackLogin(userId){
  if(!trackingBase) return;
  const info={d:deviceHint()};
  // Users added inside the app are unknown to the dashboard, so send their name
  const u=allUsers().find(x=>x.id===userId);
  if(u&&u.custom){info.n=u.nameHe;info.em=u.emoji;}
  trackEvent(userId,EV.LOGIN,Object.assign(info,await lookupLocation()));
}

const TRACKED={
  'su:login': d=>trackLogin(d.userId),
  'su:lesson':d=>trackEvent(d.userId,EV.LESSON,{lid:d.lid,lvl:d.lvl}),
  'su:quiz':  d=>trackEvent(d.userId,EV.QUIZ,{lid:d.lid,lvl:d.lvl}),
};
Object.entries(TRACKED).forEach(([name,handler])=>
  document.addEventListener(name,e=>handler(e.detail))
);

// Track session end so the dashboard can compute time-in-app per login.
// Uses sendBeacon because regular fetch is unreliable during page unload.
window.addEventListener('beforeunload',function(){
  if(!trackingBase||!cur||!cur.userId) return;
  const payload=eventPayload(cur.userId,EV.LOGOUT);
  if(navigator.sendBeacon){
    navigator.sendBeacon(eventsUrl(),new Blob([payload],{type:'application/json'}));
  }else{
    fetch(eventsUrl(),{method:'POST',body:payload,keepalive:true}).catch(()=>{});
  }
});
