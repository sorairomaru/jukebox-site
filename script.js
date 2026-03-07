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
let queue = [];
let queueKeys = [];
let loop = false;

/* =====================
   YouTube Player
===================== */

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
}

function onStateChange(e){

 if(e.data === 0){

  if(loop){
   player.playVideo();
   return;
  }

  removeFirst();
 }

}

/* =====================
   Queue
===================== */

function watchQueue(){

 db.ref("queue").on("value",snap=>{

  const data = snap.val() || {};

  queue = Object.values(data);
  queueKeys = Object.keys(data);

  updateQueueUI();

  if(player && player.getPlayerState() !== 1){
   playNext();
  }

 });

}

function playNext(){

 if(queue.length === 0) return;

 const id = getID(queue[0]);

 player.loadVideoById(id);

}

function removeFirst(){

 if(queueKeys.length === 0) return;

 db.ref("queue/"+queueKeys[0]).remove();

}

/* =====================
   Send
===================== */

function send(){

 const input = document.getElementById("url");

 if(!input) return;

 const url = input.value.trim();

 if(!url) return;

 db.ref("queue").push(url);

 input.value = "";

}

/* =====================
   Admin Queue UI
===================== */

function updateQueueUI(){

 const list = document.getElementById("queue");

 if(!list) return;

 list.innerHTML = "";

 queue.forEach((url,i)=>{

  const li = document.createElement("li");

  li.innerHTML = `
   ${url}
   <button onclick="removeQueue('${queueKeys[i]}')">削除</button>
  `;

  list.appendChild(li);

 });

}

function removeQueue(key){

 db.ref("queue/"+key).remove();

}

/* =====================
   Controls
===================== */

function skip(){

 removeFirst();

}

function toggleLoop(){

 loop = !loop;

 alert("Loop: "+loop);

}

/* =====================
   Utility
===================== */

function getID(url){

 let match = url.match(/v=([^&]+)/);

 if(match) return match[1];

 if(url.includes("youtu.be"))
  return url.split("/").pop();

 return url;

}

/* =====================
   Page Init
===================== */

watchQueue();
