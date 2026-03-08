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

let player;

let queue=[];
let queueKeys=[];

let loop=false;

const titleCache={};

const socket = io();

// /* ----------------
// YouTube Player
// ---------------- */

// function onYouTubeIframeAPIReady(){

//  if(!document.getElementById("player")) return;

//  player = new YT.Player('player',{
//   height:'100%',
//   width:'100%',
//   events:{
//    'onStateChange':onStateChange
//   }
//  });

//  watchQueue();
// }

// function onStateChange(e){

//  if(e.data===0){

//   if(loop){
//    replayCurrent();
//    return;
//   }

//   playNext();

//  }

// }

/* ----------------
Queue
---------------- */

function watchQueue(){

 db.ref("queue").on("value",snap=>{

  const data=snap.val()||{};

  queue=Object.values(data);
  queueKeys=Object.keys(data);

  updateQueueUI();

 });

}

// function playNext(){

//  if(queue.length===0) return;

//  const currentKey=queueKeys[0];

//  db.ref("queue/"+currentKey).remove();

//  if(queue.length==0) return;

//  const nextUrl=queue[0];
//  const id=getID(nextUrl);

//  player.loadVideoById(id);

// }

/* ----------------
Replay Current
---------------- */

// function replayCurrent(){

//  if(!player) return;
//  if(queue.length===0) return;

//  const url=queue[0];
//  const id=getID(url);

//  player.stopVideo();
//  player.loadVideoById(id);

// }

function reload_send(){
    socket.emit("reload")
}
  
/* ----------------
Send
---------------- */

function send(){

 const input=document.getElementById("url");
 if(!input) return;

 const url=input.value.trim();
 if(!url) return;

 db.ref("queue").push(url);

 input.value="";

 updateQueueUI();

}

/* ----------------
Queue UI
---------------- */

function updateQueueUI(){

 const list=document.getElementById("queue");
 if(!list) return;

 list.innerHTML="";

 queue.forEach((url,i)=>{

  const id=getID(url);
  const thumb=`https://img.youtube.com/vi/${id}/mqdefault.jpg`;

  const li=document.createElement("li");

  const title=titleCache[url]||"読み込み中...";

  let buttons="";

  if(i===0){

   buttons=`<span style="color:red;font-weight:bold">▶ 再生中</span>`;

  }else{

   buttons=`
   <button onclick="forcePlay(${i})">▶</button>
   <button onclick="moveUp(${i})">↑</button>
   <button onclick="moveDown(${i})">↓</button>
   <button onclick="removeQueue('${queueKeys[i]}')">削除</button>
   `;

  }

  li.innerHTML=`
  <div style="display:flex;gap:10px;align-items:flex-start">

    <img src="${thumb}" width="120">

    <div style="flex:1">

      <div style="font-weight:bold">${title}</div>
      <div style="font-size:12px;color:#666">${url}</div>

      <div class="buttons">
      ${buttons}
      </div>

    </div>

  </div>
  `;

  list.appendChild(li);

  if(!titleCache[url]){
   fetchTitle(url);
  }

 });

}

socket.on("updateQueueUI", () => {
    updateQueueUI();
})

/* ----------------
Title Fetch
---------------- */

function fetchTitle(url){

 fetch(`https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`)
 .then(r=>r.json())
 .then(data=>{

  titleCache[url]=data.title;
  updateQueueUI();

 })
 .catch(()=>{

  titleCache[url]="タイトル取得失敗";

 });

}

/* ----------------
Force Play
---------------- */

function forcePlay(index){

 const url=queue[index];
 const id=getID(url);

 player.loadVideoById(id);

}

/* ----------------
Queue Remove
---------------- */

function removeQueue(key){

 db.ref("queue/"+key).remove();

}

/* ----------------
Reorder
---------------- */

function moveUp(index){

 if(index<=1) return;

 const aKey=queueKeys[index];
 const bKey=queueKeys[index-1];

 const updates={};

 updates["queue/"+aKey]=queue[index-1];
 updates["queue/"+bKey]=queue[index];

 db.ref().update(updates);

}

function moveDown(index){

 if(index===queue.length-1) return;

 const aKey=queueKeys[index];
 const bKey=queueKeys[index+1];

 const updates={};

 updates["queue/"+aKey]=queue[index+1];
 updates["queue/"+bKey]=queue[index];

 db.ref().update(updates);

}

// /* ----------------
// Controls
// ---------------- */

// function skip(){

//  playNext();

// }

// function toggleLoop(){

//  loop=!loop;
//  alert("Loop:"+loop);

// }

/* ----------------
Utility
---------------- */

function getID(url){

 let m=url.match(/v=([^&]+)/);

 if(m) return m[1];

 if(url.includes("youtu.be"))
  return url.split("/").pop();

 return url;

}

watchQueue();
