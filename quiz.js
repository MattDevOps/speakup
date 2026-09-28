/* ══════════════════════════════════
   QUIZ
══════════════════════════════════ */
const MIC_LABEL={idle:'לחצו על המיקרופון ואמרו באנגלית',listening:'מקשיב... דברו עכשיו!',empty:'קודם לחצו על המיקרופון ודברו'};
const NUDGES=['נסו לומר בקול רם – זה עוזר לזכור!','הקשיבו וחזרו על המילה','תרגול עושה את ההבדל','אמרו בביטחון!','לא להתבייש – אמרו בקול!'];
// In the quiz there is no second try, the next question comes right after
const MISS_MSGS=['לא נורא, ממשיכים!','כמעט! בפעם הבאה תצליחו','זו מילה קשה – הקשיבו לתשובה','ככה לומדים – ממשיכים!'];
const ANSWER_LABEL={speak:'שמעתי',tap:'בחרתם'};
// How long the feedback stays on screen before the next question (ms)
const FEEDBACK_MIN_MS={correct:1300,wrong:2600};

function curQ(){return cur.qq[cur.qi];}
function setMic(state){
  const mb=document.getElementById('micBtn'),label=document.getElementById('micLabel');
  const on=state==='listening';
  mb.className='mic-btn'+(on?' listening':''); mb.textContent=on?'🛑':'🎤';
  label.textContent=MIC_LABEL[state]; label.className='mic-label'+(on?' active':'');
}

function startQuiz(){
  const words=cur.lesson.words,pool=lessonsFor(cur.userId,cur.level).flatMap(l=>l.words);
  cur.qq=shuffle(words).map(word=>{
    const wrong=shuffle(pool.filter(w=>w.e!==word.e)).slice(0,3);
    return{word,options:shuffle([word,...wrong])};
  });
  cur.qi=0; cur.qs=0; cur.streak=0; cur.fa=false;
  cur.quizMode=SPEECH_IN_OK?'speak':'tap';
  renderQ(); show('s-quiz');
}
function setMode(m){
  cur.quizMode=m; stopListening();
  document.getElementById('modeSpeakBtn').className='mode-btn '+(m==='speak'?'active-mode':'inactive-mode');
  document.getElementById('modeTapBtn').className='mode-btn '+(m==='tap'?'active-mode':'inactive-mode');
  document.getElementById('speakMode').style.display=m==='speak'?'block':'none';
  document.getElementById('tapMode').style.display=m==='tap'?'block':'none';
  hideFeedback('q');
}
function renderQ(){
  const q=curQ(),t=cur.qq.length;
  document.getElementById('qCount').textContent=`${cur.qi+1} מתוך ${t}`;
  document.getElementById('qPbar').style.width=`${(cur.qi/t)*100}%`;
  document.getElementById('qScore').textContent=cur.qs;
  const he=document.getElementById('qHebrew');
  he.textContent=q.word.h; he.className='q-hebrew '+sizeClass(q.word.h);
  document.getElementById('heardText').textContent='...';
  cur.spokenText=''; cur.fa=false;
  setMic('idle');
  document.getElementById('mcOpts').innerHTML=q.options.map((o,i)=>`
    <button class="opt" onclick="subMC(${i})">
      <span dir="ltr">${esc(o.e)}</span><span class="opt-p">${esc(o.p)}</span>
    </button>`).join('');
  document.getElementById('qNudge').textContent=NUDGES[cur.qi%NUDGES.length];
  setMode(cur.quizMode);
}
function playCurrentQ(){speak(curQ().word.e);}
function toggleMic(){
  if(cur.fa) return;
  if(cur.recognizing){ stopListening(); setMic('idle'); return; }
  const started=startListening(
    (text,isFinal)=>{
      document.getElementById('heardText').textContent=text||'...';
      cur.spokenText=text;
      if(isFinal){ stopListening(); setMic('idle'); }
    },
    ()=>setMic('idle')
  );
  if(started) setMic('listening');
}
function checkSpoken(){
  if(cur.fa) return;
  const spoken=cur.spokenText;
  if(!spoken){setMic('empty');return;}
  const target=curQ().word.e;
  handleAnswer(checkMatch(spoken,target),spoken,target);
}
function subMC(i){
  if(cur.fa) return;
  const q=curQ(),chosen=q.options[i],ok=chosen===q.word;
  const btns=document.querySelectorAll('#mcOpts .opt');
  btns[i].classList.add(ok?'correct':'wrong');
  if(!ok) btns[q.options.indexOf(q.word)].classList.add('correct');
  handleAnswer(ok,chosen.e,q.word.e);
}
function handleAnswer(ok,heard,target){
  cur.fa=true;
  cur.streak=ok?cur.streak+1:0;
  if(ok) cur.qs++;
  const mainText=ok&&cur.streak>=3?`${cur.streak} ברצף 🔥`:pick(ok?CHEERS:MISS_MSGS);
  const detail=ok?`✓ ${ltr(target)}`:`${ANSWER_LABEL[cur.quizMode]}: ${ltr(heard)} · התשובה הנכונה: ${ltr(target)}`;
  showFeedback('q',ok,mainText,detail);
  document.getElementById('qScore').textContent=cur.qs;
  // Always play the right answer, and wait long enough for it to finish
  speak(target);
  setTimeout(advQ,Math.max(FEEDBACK_MIN_MS[ok?'correct':'wrong'],speechMs(target)));
}
function advQ(){cur.fa=false;stopAudio();cur.qi++;if(cur.qi>=cur.qq.length)showResult();else renderQ();}

/* ══════════════════════════════════
   RESULT
══════════════════════════════════ */
// Index 0 = 3 stars, 1 = 2 stars, 2 = 1 star
const RESULT_MSGS={
  beginner:['התחלה מצוינת!','עבודה טובה!','המשיכו כך!'],
  intermediate:['מצוין!','כל הכבוד!','ממשיכים להתאמן!'],
  advanced:['יוצא מן הכלל!','מרשים מאוד!','מאמץ יפה!'],
};
const RESULT_EMOJI={3:'🏆',2:'🌟',1:'💪'};
function starsFor(score,total){
  if(score>=Math.ceil(total*0.85)) return 3;
  if(score>=Math.ceil(total*0.6)) return 2;
  return 1;
}
function renderXpBox(wasNew,earned,doneCount,totalLessons){
  const xb=document.getElementById('xpBox');
  xb.style.display=wasNew?'block':'none';
  if(!wasNew) return;
  const levelDone=doneCount===totalLessons;
  document.getElementById('xpT').textContent=levelDone?'🎓 סיימתם את הרמה!':`קיבלתם ${earned} ⭐`;
  document.getElementById('xpSub').textContent=levelDone
    ?`כל השיעורים ברמת ${lm().labelHe} הושלמו!`
    :`סיימתם ${doneCount} מתוך ${totalLessons} שיעורים`;
}
function showResult(){
  stopAudio();
  emit('su:quiz',{userId:cur.userId,lid:cur.lesson.id,lvl:cur.level});
  const t=cur.qq.length,sc=cur.qs,earned=starsFor(sc,t);
  const ud2=ud(),wasNew=!ud2.done.includes(cur.lesson.id);
  ud2.stars+=earned; if(wasNew) ud2.done.push(cur.lesson.id); delete ud2.progress[cur.lesson.id]; save();
  document.getElementById('starCount').textContent=ud2.stars;
  document.getElementById('rEmoji').textContent=RESULT_EMOJI[earned];
  document.getElementById('rTitle').textContent=RESULT_MSGS[cur.level][3-earned];
  document.getElementById('rScore').textContent=`${sc} תשובות נכונות מתוך ${t}`;
  ['st1','st2','st3'].forEach((id,i)=>{const el=document.getElementById(id);el.className='si';if(i<earned)setTimeout(()=>el.className='si on',i*220+150);});
  renderXpBox(wasNew,earned,ud2.done.length,lessonsFor(cur.userId,cur.level).length);
  // chips that speak on tap
  document.getElementById('wChips').innerHTML=cur.lesson.words.map((w,i)=>`<span class="chip" onclick="speakLessonWord(${i})">🔊 ${esc(w.e)}</span>`).join('');
  show('s-result');
}
function retryQuiz(){startQuiz();}
