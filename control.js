const firebaseConfig = {
  apiKey: "AIzaSyCpx...",
  authDomain: "player-5f939.firebaseapp.com",
  databaseURL: "https://player-5f939-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "player-5f939"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();

let queue=[];
let queueKeys=[];
const titleCache={};

function watchQueue(){

 db.ref("queue").on("value",snap=>{

  const data=snap.val()||{};
  queue=Object.values(data);
  queueKeys=Object.keys(data);

  updateQueueUI();

 });

}

function send(){

 const input=document.getElementById("url");
 const url=input.value.trim();
 if(!url) return;
 db.ref("queue").push(url);
 input.value="";

}

function updateQueueUI(){

 const list=document.getElementById("queue");
 list.innerHTML="";

 queue.forEach((url,i)=>{

  const id=getID(url);
  const thumb=`https://img.youtube.com/vi/${id}/mqdefault.jpg`;

  const li=document.createElement("li");

  const title=titleCache[url]||"読み込み中...";

  li.innerHTML=`
  <div style="display:flex;gap:10px">

  <img src="${thumb}" width="120">

  <div style="flex:1">

  <div style="font-weight:bold">${title}</div>

  <button onclick="forcePlay(${i})">▶</button>
  <button onclick="moveUp(${i})">↑</button>
  <button onclick="moveDown(${i})">↓</button>
  <button onclick="removeQueue('${queueKeys[i]}')">削除</button>

  </div>
  </div>
  `;

  list.appendChild(li);

  if(!titleCache[url]) fetchTitle(url);

 });

}

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

function forcePlay(index){

 db.ref("control").set({
  type:"force",
  url:queue[index],
  time:Date.now()
 });

}

function reload(){

 db.ref("control").set({
  type:"reload",
  time:Date.now()
 });

}

function skip(){

 db.ref("control").set({
  type:"skip",
  time:Date.now()
 });

}

function removeQueue(key){
 db.ref("queue/"+key).remove();
}

function moveUp(index){

 if(index<=0) return;

 const updates={};

 updates["queue/"+queueKeys[index]]=queue[index-1];
 updates["queue/"+queueKeys[index-1]]=queue[index];

 db.ref().update(updates);

}

function moveDown(index){

 if(index>=queue.length-1) return;

 const updates={};

 updates["queue/"+queueKeys[index]]=queue[index+1];
 updates["queue/"+queueKeys[index+1]]=queue[index];

 db.ref().update(updates);

}

function getID(url){

 const reg =
 /(?:youtube\.com\/(?:.*v=|v\/|embed\/)|youtu\.be\/)([^#\&\?]{11})/;

 const match = url.match(reg);

 if(match) return match[1];

 return url;

}

watchQueue();
