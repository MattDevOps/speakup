/* ══════════════════════════════════
   HELP (Hebrew instructions)
   One entry per screen: `hint` is the one-line instruction shown at the top
   of that screen, `steps` is the full explanation shown in the help window.
══════════════════════════════════ */
const HELP_SEEN_KEY='su_help_seen_v1';
const HELP={
  's-profiles':{icon:'👋',title:'בוחרים שם',
    hint:'לחצו על השם שלכם כדי להתחיל.',
    steps:[
      'לחצו על השם שלכם ברשימה.',
      'השם שלכם לא ברשימה? לחצו על "➕ הוספת משתמש", כתבו את השם ולחצו על "שמירה".',
      'כל אחד מתקדם בנפרד – הכוכבים וההתקדמות נשמרים לכל אחד בנפרד.',
    ]},
  's-levels':{icon:'📊',title:'בוחרים רמה',
    hint:'בחרו רמה. מתחילים מאפס? בחרו 🌱 מתחיל.',
    steps:[
      '🌱 מתחיל – מילים בסיסיות. מכאן מתחילים.',
      '🌿 בינוני – משפטים שימושיים ליום-יום.',
      '🌳 מתקדם – ניבים וביטויים מורכבים.',
      'אפשר להחליף רמה בכל רגע.',
    ]},
  's-home':{icon:'📚',title:'בוחרים שיעור',
    hint:'לחצו על שיעור כדי להתחיל ללמוד.',
    steps:[
      'כל שיעור הוא נושא אחד, למשל ברכות או מספרים.',
      '✓ ירוק = שיעור שסיימתם. ⏳ = שיעור שהתחלתם ולא סיימתם.',
      'מומלץ ללמוד לפי הסדר, שיעור אחד ביום.',
    ]},
  's-lesson':{icon:'🎓',title:'לומדים מילה',
    hint:'הקשיבו למילה 🔊, ואז לחצו על 🎤 ואמרו אותה באנגלית.',
    steps:[
      'בכרטיס רואים את המילה בעברית, באנגלית, ואיך אומרים אותה – באותיות עבריות.',
      'לחצו על הכפתור הכחול 🔊 כדי לשמוע את המילה. אפשר לשמוע כמה פעמים שרוצים.',
      'לחצו על הכפתור האדום 🎤, חכו שיהפוך לירוק, ואמרו את המילה באנגלית בקול רם.',
      'אמרתם נכון? עוברים למילה הבאה. לא הצלחתם? נסו שוב, זה בסדר גמור.',
      'לחצו על "הבא" כדי להמשיך, ובסוף על "לחידון".',
    ]},
  's-quiz':{icon:'🎯',title:'עונים על החידון',
    hint:'אמרו באנגלית את המילה שכתובה בעברית. קשה לדבר? לחצו על "בחירה".',
    steps:[
      'מופיעה מילה בעברית. צריך לומר אותה באנגלית.',
      'דיבור 🎤: לחצו על המיקרופון, אמרו את המילה, ואז לחצו על "בדיקה".',
      'בחירה 👆: לחצו על התשובה הנכונה מתוך ארבע אפשרויות.',
      'לא זוכרים? לחצו על "שמעו את התשובה".',
    ]},
  's-result':{icon:'🏆',title:'אוספים כוכבים',
    hint:'כל הכבוד! לחצו על "עוד שיעורים" כדי להמשיך.',
    steps:[
      'בסוף כל חידון מקבלים עד 3 כוכבים ⭐.',
      'אפשר ללחוץ על כל מילה כדי לשמוע אותה שוב.',
      '"נסו שוב" – חוזרים על החידון. "עוד שיעורים" – בוחרים שיעור חדש.',
    ]},
};
const HELP_TIPS=[
  '🎤 בפעם הראשונה הדפדפן יבקש אישור להשתמש במיקרופון. לחצו על "אישור" (Allow).',
  '🌐 האפליקציה עובדת הכי טוב בדפדפן Chrome.',
  '🔊 לא שומעים? בדקו שהווליום פתוח ושהטלפון לא על שקט.',
  '🐢 הדיבור מהיר מדי? לחצו על 🔊 למעלה ובחרו מהירות איטית יותר.',
  '📞 צריכים עזרה? התקשרו למאט: 053-280-3041.',
];

function helpSection(id,n,currentId){
  const h=HELP[id];
  return `<section class="help-sec${id===currentId?' current':''}" data-screen="${id}">
    <h3><span class="help-num">${n}</span> ${h.icon} ${h.title}</h3>
    <ul>${h.steps.map(s=>`<li>${s}</li>`).join('')}</ul>
  </section>`;
}
function renderHelp(currentId){
  document.getElementById('helpBody').innerHTML=
    Object.keys(HELP).map((id,i)=>helpSection(id,i+1,currentId)).join('')+
    `<section class="help-sec tips"><h3>💡 חשוב לדעת</h3><ul>${HELP_TIPS.map(t=>`<li>${t}</li>`).join('')}</ul></section>`;
}
// Opens the full guide with the current screen's section highlighted
function openHelp(){
  renderHelp(activeScreen());
  document.getElementById('helpModal').classList.add('on');
  const current=document.querySelector('#helpBody .current');
  if(current) current.scrollIntoView({block:'start'});
}
function closeHelp(){
  document.getElementById('helpModal').classList.remove('on');
  try{localStorage.setItem(HELP_SEEN_KEY,'1');}catch(e){}
}
function helpSeen(){
  try{return localStorage.getItem(HELP_SEEN_KEY)==='1';}catch(e){return false;}
}

document.addEventListener('screenchange',e=>{
  const h=HELP[e.detail];
  document.getElementById('hintText').textContent=h?h.hint:'';
});
// First visit: show the guide before anything else
document.addEventListener('DOMContentLoaded',()=>{
  if(helpSeen()) return;
  renderHelp(null);
  document.getElementById('helpModal').classList.add('on');
});
