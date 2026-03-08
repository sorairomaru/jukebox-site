const firebaseConfig = {
  apiKey: "AIzaSyCpxkOCrAjqD546uAS_EphDS5CemuJy59s",
  authDomain: "player-5f939.firebaseapp.com",
  databaseURL: "https://player-5f939-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "player-5f939",
  storageBucket: "player-5f939.firebasestorage.app",
  messagingSenderId: "547215751927",
  appId: "1:547215751927:web:2e15e53ef4ee7ef11531f2",
  measurementId: "G-K79JSXENG3"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();

let queue = [];
let queueKeys = [];

const titleCache = {};

/* ----------------
Queue Watch
---------------- */

function watchQueue() {

 db.ref("queue").on("value", snap => {

  const data = snap.val() || {};

  queue = Object.values(data);
  queueKeys = Object.keys(data);

  updateQueueUI();

 });

}

/* ----------------
Send URL
---------------- */

function send() {

 const input = document.getElementById("url");
 if (!input) return;

 let url = input.value.trim();
 if (!url) return;

 db.ref("queue").push(url);

 input.value = "";

}

/* ----------------
Queue UI
---------------- */

function updateQueueUI() {

 const list = document.getElementById("queue");
 if (!list) return;

 list.innerHTML = "";

 queue.forEach((url, i) => {

  const id = getID(url);
  const thumb = `https://img.youtube.com/vi/${id}/mqdefault.jpg`;

  const li = document.createElement("li");

  const title = titleCache[url] || "読み込み中...";

  let buttons = "";

  /* --- 1番目（再生中） --- */

  if (i === 0) {

   buttons = `<span style="color:red;font-weight:bold">▶ 再生中</span>`;

   li.style.background = "#333";
   li.style.borderLeft = "5px solid red";

  }

  /* --- 2番目以降 --- */

  else {

   let upButton = "";

   if (i === 1) {
    upButton = `<button disabled>↑</button>`;
   } else {
    upButton = `<button onclick="moveUp(${i})">↑</button>`;
   }

   buttons = `
   <button onclick="forcePlay(${i})">▶</button>
   ${upButton}
   <button onclick="moveDown(${i})">↓</button>
   <button onclick="removeQueue('${queueKeys[i]}')">削除</button>
   `;

  }

  li.innerHTML = `
  <div style="display:flex;gap:10px;align-items:flex-start">

    <img src="${thumb}" width="120">

    <div style="flex:1">

      <div style="font-weight:bold">${title}</div>
      <div style="font-size:12px;color:#aaa">${url}</div>

      <div style="margin-top:5px">
      ${buttons}
      </div>

    </div>

  </div>
  `;

  list.appendChild(li);

  if (!titleCache[url]) {
   fetchTitle(url);
  }

 });

}

/* ----------------
Title Fetch
---------------- */

function fetchTitle(url) {

 fetch(`https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`)
  .then(r => r.json())
  .then(data => {

   titleCache[url] = data.title;
   updateQueueUI();

  })
  .catch(() => {

   titleCache[url] = "タイトル取得失敗";

  });

}

/* ----------------
Force Play
---------------- */

// function forcePlay(index,key) {

 // db.ref("control").set({
 //  type: "force",
 //  url: queue[index],
 //  time: Date.now()
 // });

// }
function forcePlay(index){

 if(index === 0) return;

 const updates = {};

 const targetKey = queueKeys[index];
 const currentKey = queueKeys[0];

 const targetUrl = queue[index];

 /* 押した動画を一番上に */
 updates["queue/" + currentKey] = targetUrl;
 updates["queue/" + targetKey] = null;

 db.ref().update(updates);

 db.ref("control").set({
  type:"reload",
  time:Date.now()
 });

}



/* ----------------
Reload
---------------- */

function reload() {

 db.ref("control").set({
  type: "reload",
  time: Date.now()
 });

}

/* ----------------
Skip
---------------- */

function skip() {

 db.ref("control").set({
  type: "skip",
  time: Date.now()
 });

}

/* ----------------
Remove Queue
---------------- */

function removeQueue(key) {

 db.ref("queue/" + key).remove();

}

/* ----------------
Move Up
---------------- */

function moveUp(index) {

 if (index <= 1) return;

 const updates = {};

 updates["queue/" + queueKeys[index]] = queue[index - 1];
 updates["queue/" + queueKeys[index - 1]] = queue[index];

 db.ref().update(updates);

}

/* ----------------
Move Down
---------------- */

function moveDown(index) {

 if (index >= queue.length - 1) return;

 const updates = {};

 updates["queue/" + queueKeys[index]] = queue[index + 1];
 updates["queue/" + queueKeys[index + 1]] = queue[index];

 db.ref().update(updates);

}

/* ----------------
YouTube ID Extract
---------------- */

function getID(url) {

 const reg = /(?:youtube\.com\/(?:.*v=|v\/|embed\/|shorts\/)|youtu\.be\/)([^#\&\?]{11})/;

 const match = url.match(reg);

 if (match) return match[1];

 return url;

}

/* ----------------
Start
---------------- */

watchQueue();
