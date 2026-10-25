/* KAJATIF AR Dua Video – fail .mind daripada dua kad, indeks 0 dan 1. */
(() => {'use strict';
const $ = id => document.getElementById(id);
const names = ['Kata Kerja Aktif Transitif','Kata Kerja Aktif Tak Transitif'];
const fileNames = ['video-1-transitif.mp4','video-2-tak-transitif.mp4'];
let active = -1, scene = null, vids = [], videoPlanes = [], posterPlanes = [], targets = [], blobUrl = null;
const status = $('status'), topic = $('topic');
const fmt = t => {let v = Number.isFinite(t) ? Math.floor(t) : 0; return `${Math.floor(v/60)}:${String(v%60).padStart(2,'0')}`};
function updateControls(){const valid=active>=0; $('playBtn').disabled=$('repeatBtn').disabled=!valid; const v=valid?vids[active]:null; $('playBtn').textContent=v&&!v.paused?'⏸ Jeda Video':'▶ Mainkan Video';$('progress').value=v&&v.duration>0?Math.round(v.currentTime/v.duration*1000):0;$('time').textContent=v?fmt(v.currentTime)+' / '+fmt(v.duration):'0:00 / 0:00';}
function pauseAll(){vids.forEach((v,i)=>{v.pause();if(videoPlanes[i]&&posterPlanes[i]){videoPlanes[i].setAttribute('visible',false);posterPlanes[i].setAttribute('visible',true);}})}
function hideLoader(){ $('preflight').classList.add('hidden'); }
function reportError(msg){$('loaderSpin').classList.add('hidden');$('loaderTitle').textContent='AR belum dapat dimulakan';$('loaderMessage').textContent=msg;$('loaderMessage').classList.add('error');$('loaderActions').classList.remove('hidden');status.textContent='Semak punca melalui paparan ralat.';}
function loader(title,msg){$('loaderTitle').textContent=title;$('loaderMessage').textContent=msg;}
async function assetExists(name){try{const r=await fetch('./'+name+'?s=41',{cache:'no-store'});return r.ok&&Number(r.headers.get('content-length')||9999)>100;}catch(_){return false;}}
function isMind(buf){const arr=new Uint8Array(buf); if(arr.length<1000)return false;const beginning=new TextDecoder().decode(arr.slice(0,50)).trimStart().toLowerCase();return !beginning.startsWith('<!doctype')&&!beginning.startsWith('<html');}
async function checkMind(){try{const r=await fetch('./targets.mind?s=41',{cache:'no-store'});if(!r.ok)return null;const b=await r.arrayBuffer();if(!isMind(b))return null;const checker=new window.MINDAR.IMAGE.Compiler();const entries=checker.importData(b);if(!Array.isArray(entries)||entries.length!==2){console.warn('Fail targets.mind lama/tidak mempunyai dua sasaran. Menjana semula.');return null;}return './targets.mind?s=41';}catch(e){console.warn('Tidak dapat mengesahkan targets.mind:',e);return null;}}
async function resizedImage(path){return new Promise((resolve,reject)=>{const im=new Image();im.onload=()=>{const scale=Math.min(1,850/Math.max(im.width,im.height));const canvas=document.createElement('canvas');canvas.width=Math.round(im.width*scale);canvas.height=Math.round(im.height*scale);canvas.getContext('2d').drawImage(im,0,0,canvas.width,canvas.height);const target=new Image();target.onload=()=>resolve(target);target.onerror=()=>reject(new Error('Gagal menyedia '+path));target.src=canvas.toDataURL('image/png')};im.onerror=()=>reject(new Error('Kad gambar '+path+' tidak dijumpai.'));im.src='./'+path+'?s=41';});}
async function autoCompile(){if(!window.MINDAR?.IMAGE?.Compiler)throw new Error('Pustaka penyedia sasaran MindAR tidak dimuat. Semak internet atau gunakan Jana targets.mind di komputer.');loader('Menyediakan dua kad AR…','Fail targets.mind belum dimuat naik. Sistem cuba menjana sasaran daripada kedua-dua kad secara automatik.');const images=await Promise.all([resizedImage('kad-1-transitif.png'),resizedImage('kad-2-tak-transitif.png')]);const c=new window.MINDAR.IMAGE.Compiler();const d=await c.compileImageTargets(images,p=>{loader('Menjana sasaran…','Kemajuan: '+(Number(p)||0).toFixed(0)+'%. Kekalkan halaman ini terbuka.');});if(!Array.isArray(d)||d.length!==2)throw new Error('Tidak dapat menghasilkan dua sasaran.');const b=await c.exportData();if(!isMind(b))throw new Error('Data sasaran yang dijana tidak sah.');blobUrl=URL.createObjectURL(new Blob([b],{type:'application/octet-stream'}));return blobUrl;}
function make(tag,attrs={},children=[]){const e=document.createElement(tag);for(const [k,v] of Object.entries(attrs))e.setAttribute(k,v);for(const c of children)e.append(c);return e;}
function buildScene(src){scene=make('a-scene',{'mindar-image':`imageTargetSrc: ${src}; maxTrack: 1; filterMinCF: 0.0001; filterBeta: 0.001;`,'embedded':'','renderer':'colorManagement: true; physicallyCorrectLights: true;','vr-mode-ui':'enabled: false','device-orientation-permission-ui':'enabled: false','loading-screen':'enabled: false'});
const assets=make('a-assets',{'timeout':'60000'});
for(let i=0;i<2;i++){
const video=make('video',{id:'lessonVideo'+i,src:'./'+fileNames[i],preload:'auto',playsinline:'', 'webkit-playsinline':'', 'crossorigin':'anonymous'});video.setAttribute('playsinline','true');video.setAttribute('webkit-playsinline','true');video.loop=false;vids.push(video);assets.append(video);
const poster=make('img',{id:'poster'+i,src:'./poster-'+(i+1)+'.jpg',crossorigin:'anonymous'});assets.append(poster);
}
scene.append(assets);scene.append(make('a-camera',{position:'0 0 0','look-controls':'enabled: false'}));
for(let i=0;i<2;i++){
const target=make('a-entity',{id:'target'+i,'mindar-image-target':'targetIndex: '+i});
const posterPlane=make('a-plane',{id:'posterPlane'+i,width:'1',height:'0.5583333',position:'0 0 0.006',material:`shader: flat; src: #poster${i}; side: double;`,visible:'true'});
const videoPlane=make('a-plane',{id:'videoPlane'+i,width:'1',height:'0.5583333',position:'0 0 0.009',material:`shader: flat; src: #lessonVideo${i}; side: double;`,visible:'false'});
target.append(posterPlane,videoPlane);posterPlanes.push(posterPlane);videoPlanes.push(videoPlane);targets.push(target);scene.append(target);
}
scene.addEventListener('arReady',()=>{hideLoader();status.textContent='Kamera sedia. Imbas Kad 1 atau Kad 2.';});
scene.addEventListener('arError',evt=>reportError('Kamera atau sistem MindAR gagal dimulakan. Cuba Safari/Chrome, benarkan kamera dan pastikan sambungan internet.'));
scene.addEventListener('loaded',()=>{hideLoader();status.textContent='Kamera sedang bermula. Halakan kepada kad.';});
$('ar-host').append(scene);
targets.forEach((t,i)=>{t.addEventListener('targetFound',()=>select(i));t.addEventListener('targetLost',()=>deselect(i));});
vids.forEach((v,i)=>{
v.addEventListener('playing',()=>{if(active===i){videoPlanes[i].setAttribute('visible',true);posterPlanes[i].setAttribute('visible',false);status.textContent='Video '+(i+1)+' sedang dimainkan.';}updateControls();});
v.addEventListener('pause',updateControls);v.addEventListener('timeupdate',updateControls);v.addEventListener('loadedmetadata',updateControls);
v.addEventListener('ended',()=>{if(active===i){videoPlanes[i].setAttribute('visible',false);posterPlanes[i].setAttribute('visible',true);status.textContent='Video tamat. Tekan Ulang untuk memainkan semula.';}updateControls();});
v.addEventListener('error',()=>{if(active===i)status.textContent='Video '+(i+1)+' gagal dimuat. Buka Semak Fail.';});
});
}
function select(i){if(active===i)return;pauseAll();active=i;vids[i].currentTime=0;topic.textContent='Kad '+(i+1)+' → '+names[i];status.textContent='Kad '+(i+1)+' dikesan! Tekan Mainkan Video.';$('directLink').href='./'+fileNames[i];updateControls();}
function deselect(i){if(active!==i)return;pauseAll();active=-1;topic.textContent='Menunggu pengecaman';status.textContent='Kad hilang daripada kamera. Imbas semula untuk meneruskan.';updateControls();}
function play(){if(active<0)return;const v=vids[active];const p=v.play();if(p?.catch)p.catch(err=>{status.textContent='Tidak dapat mainkan video. Sila tekan sekali lagi atau gunakan pautan video biasa.';});}
$('playBtn').addEventListener('click',()=>{if(active<0)return;const v=vids[active];if(v.paused)play();else v.pause();updateControls();});
$('repeatBtn').addEventListener('click',()=>{if(active<0)return;vids[active].currentTime=0;play();});
$('tryAgain').addEventListener('click',()=>location.reload());
document.addEventListener('visibilitychange',()=>{if(document.hidden)pauseAll();});
async function start(){try{
if(!window.AFRAME||!window.MINDAR)throw new Error('Pustaka A-Frame / MindAR tidak dimuat. Semak internet dan muat semula.');
loader('Memeriksa dua video…','Sedang memastikan MP4 Kad 1 dan Kad 2 wujud.');
for(let i=0;i<2;i++){if(!await assetExists(fileNames[i]))throw new Error('Fail '+fileNames[i]+' tiada. Muat naik semua fail ZIP ke GitHub.');}
loader('Memeriksa fail sasaran…','Mencari targets.mind dua kad.');
const path=await checkMind()||await autoCompile();
loader('Membuka kamera…','Benarkan akses kamera jika diminta.');
buildScene(path);
}catch(e){console.error(e);reportError(String(e?.message||e));}}
start();
})();
