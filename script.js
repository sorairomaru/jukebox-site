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

/* ----------------
YouTube Player
---------------- */

function onYouTubeIframeAPIReady(){

 if(!document.getElementById("player")) return;

 player = new YT.Player('player',{
  height:'100%',
  width:'100%',
  events:{
   'onStateChange':onStateChange
  }
 });

 watchQueue();
 watchNowPlaying();
}

function onStateChange(e){

 if(e.data===0){

  if(loop){
   player.playVideo();
   return;
  }

  playNext();

 }

}

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

function playNext(){

 if(queue.length===0) return;

 const url=queue[0];
 const id=getID(url);

 player.loadVideoById(id);

 moveToNowPlaying(queueKeys[0],url);

}

/* ----------------
Now Playing
---------------- */

function moveToNowPlaying(key,url){

 db.ref("nowPlaying").set(url);

 db.ref("queue/"+key).remove();

}

function watchNowPlaying(){

 db.ref("nowPlaying").on("value",snap=>{

  const el=document.getElementById("nowPlaying");

  if(!el) return;

  const url=snap.val();

  if(!url){
   el.innerHTML="なし";
   return;
  }

  el.innerHTML=url;

 });

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

}

/* ----------------
Queue UI
---------------- */

function updateQueueUI(){

 const list=document.getElementById("queue");
 if(!list) return;

 list.innerHTML="";

 queue.forEach((url,i)=>{

  const li=document.createElement("li");

  li.innerHTML=`
  <span>${url}</span>

  <div class="buttons">

  <button onclick="forcePlay(${i})">▶</button>
  <button onclick="moveUp(${i})">↑</button>
  <button onclick="moveDown(${i})">↓</button>
  <button onclick="removeQueue('${queueKeys[i]}')">削除</button>

  </div>
  `;

  list.appendChild(li);

 });

}

/* ----------------
Force Play
---------------- */

function forcePlay(index){

 const url=queue[index];
 const id=getID(url);

 player.loadVideoById(id);

 moveToNowPlaying(queueKeys[index],url);

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

 if(index===0) return;

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

/* ----------------
Controls
---------------- */

function skip(){

 playNext();

}

function toggleLoop(){

 loop=!loop;
 alert("Loop:"+loop);

}

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
watchNowPlaying();
