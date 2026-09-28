/* ══════════════════════════════════
   LESSON (listen & repeat)
══════════════════════════════════ */
const LISTEN_LABEL={idle:'🔊 הקשיבו למילה',playing:'🔊 מנגן...',again:'🔊 הקשיבו שוב'};
// In a lesson the learner can try the same word again
const RETRY_MSGS=['לא נורא, נסו שוב!','כמעט! עוד ניסיון אחד','קרוב מאוד! נסו שוב','זו מילה קשה – נסו שוב לאט'];
const SPEAK_LABEL={idle:'🎤 לחצו ואמרו את המילה באנגלית',listening:'🎙️ מקשיב... דברו עכשיו'};

function setListenBtn(state){
  const btn=document.getElementById('listenBtn');
  btn.textContent=LISTEN_LABEL[state];
  btn.classList.toggle('playing',state==='playing');
}
function setSpeakBtn(state){
  const btn=document.getElementById('speakBackBtn');
  btn.textContent=SPEAK_LABEL[state];
  btn.className='speak-btn'+(state==='listening'?' listening':'');
}
function curWord(){return cur.lesson.words[cur.ci];}

function startLesson(id){
  emit('su:lesson',{userId:cur.userId,lid:id,lvl:cur.level});
  cur.lesson=lessonsFor(cur.userId,cur.level).find(l=>l.id===id);
  cur.ci=0; cur.reviewed=new Set(); updateCard(); show('s-lesson');
}
function renderWord(w){
  const he=document.getElementById('wHebrew');
  he.textContent=w.h; he.className='wc-hebrew '+sizeClass(w.h);
  document.getElementById('wEnglish').textContent=w.e;
  document.getElementById('wPronun').textContent='כך אומרים: '+w.p;
  document.getElementById('wExample').textContent='🔊 "'+w.x+'"';
}
function updateCard(){
  const w=curWord(),t=cur.lesson.words.length;
  document.getElementById('cardTitle').textContent=cur.lesson.emoji+' '+cur.lesson.he;
  document.getElementById('cardCount').textContent=`${cur.ci+1} מתוך ${t}`;
  document.getElementById('cardPbar').style.width=`${((cur.ci+1)/t)*100}%`;
  renderWord(w);
  document.getElementById('prevBtn').classList.toggle('btn-off',cur.ci===0);
  const last=cur.ci===t-1;
  document.getElementById('nextBtn').style.display=last?'none':'';
  document.getElementById('quizBtn').style.display='block';
  document.getElementById('backToLessonsBtn').style.display=last?'block':'none';
  cur.reviewed.add(cur.ci);
  hideFeedback('lesson'); setListenBtn('idle'); setSpeakBtn('idle');
  stopAudio();
  // auto-play the word
  setTimeout(()=>speak(w.e),400);
}
function speakWord(){
  setListenBtn('playing');
  speak(curWord().e,()=>setListenBtn('again'));
}
function speakExample(){speak(curWord().x);}
function speakLessonWord(i){speak(cur.lesson.words[i].e);}
function toggleSpeakBack(){
  if(cur.recognizing){ stopListening(); setSpeakBtn('idle'); return; }
  const w=curWord();
  const started=startListening(
    (text,isFinal)=>{
      if(!isFinal) return;
      setSpeakBtn('idle');
      showLessonFeedback(checkMatch(text,w.e),text,w.e);
    },
    ()=>setSpeakBtn('idle')
  );
  if(started) setSpeakBtn('listening');
}
function showLessonFeedback(ok,heard,target){
  showFeedback('lesson',ok,pick(ok?CHEERS:RETRY_MSGS),`שמעתי: ${ltr(heard)} · צריך לומר: ${ltr(target)}`);
  if(ok) setTimeout(()=>{if(cur.ci<cur.lesson.words.length-1)nextCard();},1200);
}
function prevCard(){stopAudio();if(cur.ci>0){cur.ci--;updateCard();}}
function nextCard(){stopAudio();if(cur.ci<cur.lesson.words.length-1){cur.ci++;updateCard();}}
