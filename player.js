const firebaseConfig = {
  apiKey: "AIzaSyCpx...",
  authDomain: "player-5f939.firebaseapp.com",
  databaseURL: "https://player-5f939-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "player-5f939"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();

let player;
let queue=[];
let queueKeys=[];
let loop=false;

function onYouTubeIframeAPIReady(){

 player = new YT.Player('player',{
  height:'100%',
  width:'100%',
  events:{
   'onStateChange':onStateChange
  }
 });

 watchQueue();
 watchControl();

}

function onStateChange(e){

 if(e.data===0){

  if(loop){
   reload();
   return;
  }

  playNext();

 }

}

function watchQueue(){

 db.ref("queue").on("value",snap=>{

  const data=snap.val()||{};

  queue=Object.values(data);
  queueKeys=Object.keys(data);

  if(player && player.getPlayerState()!=1 && queue.length>0){
   loadVideo(queue[0]);
  }

 });

}

function watchControl(){

 db.ref("control").on("value",snap=>{

  const cmd=snap.val();
  if(!cmd) return;

  if(cmd.type==="reload") reload();
  if(cmd.type==="skip") skip();
  if(cmd.type==="force") loadVideo(cmd.url);

 });

}

function loadVideo(url){

 const id=getID(url);
 player.loadVideoById(id);

}

function playNext(){

 if(queue.length===0) return;

 const currentKey=queueKeys[0];
 db.ref("queue/"+currentKey).remove();

}

function reload(){

 if(queue.length===0) return;
 loadVideo(queue[0]);

}

function skip(){
 playNext();
}

function toggleLoop(){

 loop=!loop;
 alert("Loop:"+loop);

}

function getID(url){

 const reg =
 /(?:youtube\.com\/(?:.*v=|v\/|embed\/)|youtu\.be\/)([^#\&\?]{11})/;

 const match = url.match(reg);

 if(match) return match[1];

 return url;

}
