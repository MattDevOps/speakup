/* ══════════════════════════════════
   SPEECH SYNTHESIS (TTS)
══════════════════════════════════ */
let voices=[];
const VOICE_KEY='su_voice_v1';
const RATE_KEY='su_rate_v1';
let chosenVoiceName=null;
let speechRate=0.9;

// Curated American voices only — a small handpicked list of natural-sounding
// voices, no robotic ones. Mix of men and women. Names below cover the most
// common high-quality voices across Chrome, Edge, Safari, iOS, and Android.
const FEMALE_NAMES=/\b(aria|jenny|michelle|ana|samantha|ava|allison|susan|nicky|joanna|kimberly|salli|ivy|kendra|joey|emma|olivia)\b/i;
const MALE_NAMES  =/\b(guy|davis|tony|brandon|christopher|eric|roger|tom|aaron|matthew|justin|kevin|noah|liam)\b/i;
const QUALITY_RE  =/natural|neural|premium|enhanced/i;
const ROBOT_RE    =/espeak|fred|albert|bahh|bells|boing|bubbles|cellos|deranged|hysterical|junior|kathy|pipe organ|princess|ralph|trinoids|whisper|zarvox|good news|bad news|cellos|organ|wobble|trinoids/i;

function voiceGender(name){
  if(FEMALE_NAMES.test(name)) return 'F';
  if(MALE_NAMES.test(name))   return 'M';
  return null;
}

// Score a voice. Higher = more natural sounding.
function scoreVoice(v){
  const n=(v.name||'');
  const lang=(v.lang||'').toLowerCase();
  if(lang!=='en-us') return -999;
  if(ROBOT_RE.test(n)) return -999;
  let s=0;
  if(/natural/i.test(n))  s+=60;
  if(/neural/i.test(n))   s+=55;
  if(/premium/i.test(n))  s+=45;
  if(/enhanced/i.test(n)) s+=35;
  if(/online/i.test(n))   s+=25;
  if(/google/i.test(n))   s+=20;
  if(voiceGender(n))      s+=15;
  // Penalize the older "Desktop" Windows voices which are robotic even though en-US
  if(/\bdesktop\b/i.test(n)) s-=40;
  if(/microsoft (david|zira|mark|hazel)\b/i.test(n)&&!/natural/i.test(n)) s-=20;
  return s;
}

// Returns the curated list shown in the picker. Strict filter: en-US,
// not robotic, and either named (gender-identified) or marked Natural/Neural.
// Capped at 6 voices with gender diversity.
function curatedVoices(){
  const out=[];
  voices.forEach(v=>{
    const lang=(v.lang||'').toLowerCase();
    const name=v.name||'';
    if(lang!=='en-us') return;
    if(ROBOT_RE.test(name)) return;
    if(/\bdesktop\b/i.test(name)) return;
    const gender=voiceGender(name);
    const isQuality=QUALITY_RE.test(name);
    // Must be a recognized good-quality voice OR a named voice
    if(!gender&&!isQuality&&!/google us english/i.test(name)) return;
    out.push({v,gender,score:scoreVoice(v),quality:isQuality});
  });
  out.sort((a,b)=>b.score-a.score);
  // Diversity cap: keep up to 3 female + 3 male + 1 neutral, max 6 total
  const F=out.filter(x=>x.gender==='F').slice(0,3);
  const M=out.filter(x=>x.gender==='M').slice(0,3);
  const N=out.filter(x=>!x.gender).slice(0,1);
  return [...F,...M,...N].sort((a,b)=>b.score-a.score).slice(0,6);
}

function pickBestVoice(){
  if(!voices.length) return null;
  const curated=curatedVoices();
  if(curated.length) return curated[0].v;
  // Fallback: any en-US voice that isn't obviously robotic
  const fallback=voices.filter(v=>(v.lang||'').toLowerCase()==='en-us'&&!ROBOT_RE.test(v.name||''));
  if(fallback.length) return fallback[0];
  // Last resort: any English voice
  return voices.find(v=>(v.lang||'').toLowerCase().startsWith('en'))||null;
}

function currentVoice(){
  if(chosenVoiceName){
    const v=voices.find(x=>x.name===chosenVoiceName);
    if(v) return v;
  }
  return pickBestVoice();
}

function loadVoicePref(){
  try{
    const v=localStorage.getItem(VOICE_KEY); if(v) chosenVoiceName=v;
    const r=parseFloat(localStorage.getItem(RATE_KEY)); if(!isNaN(r)&&r>=0.5&&r<=1.5) speechRate=r;
  }catch(e){}
}
function saveVoicePref(){
  try{
    if(chosenVoiceName) localStorage.setItem(VOICE_KEY,chosenVoiceName);
    localStorage.setItem(RATE_KEY,String(speechRate));
  }catch(e){}
}
loadVoicePref();

function loadVoices(){
  voices=window.speechSynthesis.getVoices()||[];
  // If the picker modal is open, refresh it (Chrome populates voices async)
  const m=document.getElementById('voiceModal');
  if(m&&m.classList.contains('on')) renderVoiceModal();
}
window.speechSynthesis.onvoiceschanged=loadVoices;
loadVoices();

function speak(text, onEnd){
  window.speechSynthesis.cancel();
  // Chrome quirk: voices may not be ready on first call. Try again shortly.
  if(!voices.length){
    voices=window.speechSynthesis.getVoices()||[];
    if(!voices.length){ setTimeout(()=>speak(text,onEnd),120); return; }
  }
  const u=new SpeechSynthesisUtterance(text);
  u.rate=speechRate; u.pitch=1;
  const v=currentVoice();
  if(v){ u.voice=v; u.lang=v.lang||'en-US'; }
  else { u.lang='en-US'; }
  if(onEnd) u.onend=onEnd;
  window.speechSynthesis.speak(u);
}

// Rough time needed to say a phrase out loud at the current speed (ms)
function speechMs(text){
  return 600+text.trim().split(/\s+/).length*400/speechRate;
}

/* Voice picker modal */
function openVoiceModal(){
  loadVoices();
  renderVoiceModal();
  document.getElementById('voiceModal').classList.add('on');
}
function closeVoiceModal(){
  window.speechSynthesis.cancel();
  document.getElementById('voiceModal').classList.remove('on');
}
function renderVoiceModal(){
  const sel=document.getElementById('voiceSelect');
  if(!sel) return;
  const curated=curatedVoices();
  if(!curated.length){
    sel.innerHTML='<option>(לא נמצאו קולות באנגלית במכשיר הזה)</option>';
  } else {
    const cur=currentVoice();
    // Friendly label: "👩 Aria (Natural)" / "👨 Guy (Natural)"
    sel.innerHTML=curated.map(({v,gender,quality})=>{
      const icon=gender==='F'?'👩':gender==='M'?'👨':'🔊';
      // Clean up the display name a bit — strip "Microsoft", "Google", "(en-US)"
      let label=v.name
        .replace(/Microsoft\s+/i,'')
        .replace(/Google\s+/i,'')
        .replace(/\s*\(.*?\)\s*/g,'')
        .replace(/\s+Online$/i,'')
        .replace(/\s+-\s+English.*$/i,'')
        .trim();
      const tag=quality?' ✨':'';
      const isSel=cur&&v.name===cur.name?'selected':'';
      return `<option value="${esc(v.name)}" ${isSel}>${icon} ${esc(label)}${tag}</option>`;
    }).join('');
  }
  document.getElementById('rateRange').value=speechRate;
  document.getElementById('rateLabel').textContent=speechRate.toFixed(2)+'×';
}
function onVoiceChange(){
  chosenVoiceName=document.getElementById('voiceSelect').value;
  saveVoicePref();
  // Auto-play a short sample so the user hears the change immediately
  testVoice();
}
function onRateChange(){
  speechRate=parseFloat(document.getElementById('rateRange').value)||0.9;
  document.getElementById('rateLabel').textContent=speechRate.toFixed(2)+'×';
  saveVoicePref();
}
function testVoice(){
  speak("Hello! I am your English teacher. Let's practice speaking together.");
}

/* ══════════════════════════════════
   SPEECH RECOGNITION (STT)
══════════════════════════════════ */
let recognition=null;
const SpeechRec=window.SpeechRecognition||window.webkitSpeechRecognition;
const SPEECH_IN_OK=!!SpeechRec;
const MIC_UNSUPPORTED='הדפדפן הזה לא תומך בזיהוי דיבור. פתחו את האתר בדפדפן Chrome.';
const MIC_DENIED='אין אישור להשתמש במיקרופון. לחצו על סמל המנעול 🔒 ליד כתובת האתר ואשרו את המיקרופון.';
// Hebrew explanation per SpeechRecognition error code. Codes that are not
// listed (e.g. "aborted", which we trigger ourselves) stay silent.
const MIC_ERRORS={
  'not-allowed':MIC_DENIED,
  'service-not-allowed':MIC_DENIED,
  'no-speech':'לא שמעתי כלום. לחצו שוב על המיקרופון ודברו בקול רם.',
  'audio-capture':'לא נמצא מיקרופון במכשיר.',
  'network':'אין חיבור לאינטרנט. בדקו את החיבור ונסו שוב.',
};

function initRecognition(){
  if(!SPEECH_IN_OK) return null;
  const r=new SpeechRec();
  r.lang='en-US'; r.continuous=false; r.interimResults=true;
  return r;
}

// Returns true if the microphone started listening
function startListening(onResult, onEnd){
  if(recognition){recognition.abort();}
  recognition=initRecognition();
  if(!recognition){toast(MIC_UNSUPPORTED);return false;}
  recognition.onresult=e=>{
    let interim='',final='';
    for(let i=e.resultIndex;i<e.results.length;i++){
      if(e.results[i].isFinal) final+=e.results[i][0].transcript;
      else interim+=e.results[i][0].transcript;
    }
    onResult(final||interim, !!final);
  };
  recognition.onend=()=>{ cur.recognizing=false; if(onEnd) onEnd(); };
  recognition.onerror=e=>{
    cur.recognizing=false;
    if(MIC_ERRORS[e.error]) toast(MIC_ERRORS[e.error]);
    if(onEnd) onEnd();
  };
  recognition.start();
  cur.recognizing=true;
  return true;
}

function stopListening(){
  if(recognition) recognition.stop();
  cur.recognizing=false;
}

// The recognizer writes numbers as digits ("1") and natural speech as
// contractions ("don't"), while the lessons spell both out. Normalize before
// comparing so a correct answer is not marked wrong.
const DIGIT_WORDS={'1':'one','2':'two','3':'three','4':'four','5':'five','10':'ten','20':'twenty','100':'one hundred'};
const CONTRACTIONS=[
  [/\blet's\b/g,'let us'],
  [/n't\b/g,' not'],
  [/'m\b/g,' am'],
  [/'ll\b/g,' will'],
  [/'d\b/g,' would'],
  [/'re\b/g,' are'],
  [/'ve\b/g,' have'],
  [/'s\b/g,' is'],
];
function normalizeSpeech(s){
  const expanded=CONTRACTIONS.reduce((t,[re,to])=>t.replace(re,to),s.toLowerCase().replace(/[’‘]/g,"'"));
  return expanded
    .replace(/\d+/g,d=>DIGIT_WORDS[d]||d)
    .replace(/[^a-z\s]/g,'')
    .replace(/\s+/g,' ')
    .trim();
}

function checkMatch(spoken, target){
  const sp=normalizeSpeech(spoken), tg=normalizeSpeech(target);
  if(sp===tg) return true;
  // fuzzy: check if all words of target appear as whole words in spoken
  const tWords=tg.split(' ');
  const sWords=sp.split(' ');
  return tWords.every(w=>sWords.includes(w));
}
