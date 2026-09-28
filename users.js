/* ══════════════════════════════════
   USERS
   Built-in users come from content.js and appear on every device.
   Users added with the "add user" button are saved on this device only.
══════════════════════════════════ */
const CUSTOM_USERS_KEY='su_users_v1';
const NAME_MAX=20;
const AVATARS=['🧑','👩','👨','👧','👦','👵','👴','🌟'];
const USER_ID_RE=/^u[a-z0-9]+$/;

function readCustomUsers(){
  try{
    const saved=JSON.parse(localStorage.getItem(CUSTOM_USERS_KEY))||[];
    return saved
      .filter(u=>u&&USER_ID_RE.test(u.id)&&typeof u.nameHe==='string'&&u.nameHe.trim())
      .map(u=>({id:u.id,name:'',nameHe:u.nameHe.trim().slice(0,NAME_MAX),emoji:AVATARS.includes(u.emoji)?u.emoji:AVATARS[0],custom:true}));
  }catch(e){return [];}
}
let customUsers=readCustomUsers();
function allUsers(){return [...USERS,...customUsers];}
function saveCustomUsers(){try{localStorage.setItem(CUSTOM_USERS_KEY,JSON.stringify(customUsers));}catch(e){}}

function addUser(nameHe,emoji){
  const u={id:'u'+Date.now().toString(36),name:'',nameHe,emoji,custom:true};
  customUsers.push(u); saveCustomUsers();
  data[u.id]=emptyLevels(); save();
  return u;
}
function removeUser(id){
  customUsers=customUsers.filter(u=>u.id!==id); saveCustomUsers();
  delete data[id]; save();
}

// First rule that matches gives the message shown under the name field
const NAME_RULES=[
  [n=>!n,'כתבו שם כדי להמשיך.'],
  [n=>allUsers().some(u=>u.nameHe===n||(u.name&&u.name.toLowerCase()===n.toLowerCase())),'השם הזה כבר נמצא ברשימה. בחרו שם אחר.'],
];
function nameError(name){
  const rule=NAME_RULES.find(([isBad])=>isBad(name));
  return rule?rule[1]:'';
}

/* Add-user window */
let pickedAvatar=AVATARS[0];
function renderAvatars(){
  document.getElementById('avatarList').innerHTML=AVATARS.map((a,i)=>
    `<button type="button" class="avatar-opt${a===pickedAvatar?' on':''}" onclick="pickAvatar(${i})">${a}</button>`
  ).join('');
}
function pickAvatar(i){pickedAvatar=AVATARS[i];renderAvatars();}
function setAddUserError(msg){document.getElementById('addUserError').textContent=msg;}
function openAddUser(){
  const input=document.getElementById('newUserName');
  input.value=''; pickedAvatar=AVATARS[0];
  setAddUserError(''); renderAvatars();
  document.getElementById('addUserModal').classList.add('on');
  input.focus();
}
function closeAddUser(){document.getElementById('addUserModal').classList.remove('on');}
function submitAddUser(){
  const name=document.getElementById('newUserName').value.trim().slice(0,NAME_MAX);
  const err=nameError(name);
  if(err){setAddUserError(err);return;}
  addUser(name,pickedAvatar);
  closeAddUser(); renderProfiles();
}
function confirmRemoveUser(id){
  const u=customUsers.find(x=>x.id===id);
  if(!u) return;
  if(!confirm(`למחוק את ${u.nameHe}? כל ההתקדמות והכוכבים יימחקו.`)) return;
  removeUser(id); renderProfiles();
}
