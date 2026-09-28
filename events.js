/* ══════════════════════════════════
   USAGE EVENTS: the contract between the app (tracking.js) and dashboard.html
   Stored fields: u = user id, e = event type, t = time (ms),
   lid/lvl = lesson id and level, d = device, n/em = name and picture of a
   user added inside the app, ip/city/region/country = login location
══════════════════════════════════ */
const EV={LOGIN:'login',LESSON:'lesson',QUIZ:'quiz',LOGOUT:'logout'};
const EVENTS_PATH='/events.json';
