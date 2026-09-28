/* ══════════════════════════════════
   SMALL HELPERS (shared by index.html and dashboard.html)
══════════════════════════════════ */
function shuffle(a){return[...a].sort(()=>Math.random()-0.5);}
function pick(a){return a[Math.floor(Math.random()*a.length)];}
function esc(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}
// English text inside a Hebrew sentence: keep it left-to-right
function ltr(s){return `<bdi dir="ltr">${esc(s)}</bdi>`;}
// Announce something that happened in the app (listeners: help.js, tracking.js)
function emit(name,detail){document.dispatchEvent(new CustomEvent(name,{detail}));}
