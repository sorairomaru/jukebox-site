const firebaseConfig = {
apiKey: "YOURKEY",
authDomain: "YOURDOMAIN",
databaseURL: "YOURDB",
projectId: "YOURID"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();

let player;
let queue=[];
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
}

function onStateChange(e){

if(e.data==0){

if(loop){
player.playVideo();
return;
}

queue.shift();
playNext();

}
}

function playNext(){

if(queue.length==0)return;

let id = getID(queue[0]);

player.loadVideoById(id);

}

function watchQueue(){

db.ref("queue").on("value",snap=>{

queue = Object.values(snap.val()||{});

if(player && player.getPlayerState()!=1){
playNext();
}

});

}

function send(){

let url=document.getElementById("url").value;

db.ref("queue").push(url);

}

function skip(){

queue.shift();
playNext();

}

function toggleLoop(){

loop=!loop;

}

function getID(url){

let r=/v=([^&]+)/;
let m=url.match(r);

if(m)return m[1];

return url.split("/").pop();

}
