/* KAJATIF WebAR : kad poster asal; sasaran 0 => video 1, sasaran 1 => video 2. */
(()=>{'use strict';
const $=id=>document.getElementById(id);
const targetFile='targets-kajatif-kad-baharu.mind';
const lessons=[{title:'Kata Kerja Aktif Transitif',src:'video-1-transitif.mp4',poster:'poster-1.jpg'},
               {title:'Kata Kerja Aktif Tak Transitif',src:'video-2-tak-transitif.mp4',poster:'poster-2.jpg'}];
let active=-1,scene=null,videoNodes=[],videoPlanes=[],posterPlanes=[],targetNodes=[];
function fmt(t){const n=Number.isFinite(t)?Math.floor(t):0;return `${Math.floor(n/60)}:${String(n%60).padStart(2,'0')}`;}
function message(text){$('status').textContent=text;}
function loader(title,detail){$('loaderTitle').textContent=title;$('loaderMessage').textContent=detail;}
function fail(text){$('loaderSpin').classList.add('hidden');loader('Persediaan belum lengkap',text);$('loaderActions').classList.remove('hidden');message(text);}
function ok(){ $('preflight').classList.add('hidden'); }
function controls(){const i=active,v=i>=0?videoNodes[i]:null;$('playBtn').disabled=$('repeatBtn').disabled=i<0;$('playBtn').textContent=v&&!v.paused?'⏸ Jeda Video':'▶ Mainkan Video';$('progress').value=v&&v.duration>0?Math.round(1000*v.currentTime/v.duration):0;$('time').textContent=v?fmt(v.currentTime)+' / '+fmt(v.duration):'0:00 / 0:00';}
function pauseAll(){videoNodes.forEach((v,i)=>{v.pause();if(videoPlanes[i])videoPlanes[i].setAttribute('visible','false');if(posterPlanes[i])posterPlanes[i].setAttribute('visible','true');});}
async function fetchFile(path){const res=await fetch('./'+path+'?v=60',{cache:'no-store'});if(!res.ok)throw Error(path+' belum tersedia (HTTP '+res.status+').');return res;}
async function preflight(){for(const item of lessons){const res=await fetchFile(item.src);if(!res.headers.get('content-type')?.toLowerCase().includes('video')&&res.headers.get('content-length')==='0')throw Error(item.src+' kosong.');}
const res=await fetchFile(targetFile),buf=await res.arrayBuffer();if(buf.byteLength<1000)throw Error('Fail pengecaman tidak sah / terlalu kecil.');
const text=new TextDecoder().decode(buf.slice(0,30)).trim().toLowerCase();if(text.startsWith('<!doctype')||text.startsWith('<html'))throw Error('Fail .mind ialah halaman HTML. Muat naik fail .mind sebenar.');
if(!window.MINDAR?.IMAGE?.Compiler)throw Error('Pustaka MindAR belum dimuat. Pastikan sambungan internet.');
const cmp=new window.MINDAR.IMAGE.Compiler();const targets=cmp.importData(buf);if(!Array.isArray(targets)||targets.length!==2)throw Error('Fail pengecaman mesti mempunyai tepat dua kad. Jana semula menggunakan gambar baharu.');}
function node(tag,attrs={},children=[]){const e=document.createElement(tag);Object.entries(attrs).forEach(([k,v])=>e.setAttribute(k,v));children.forEach(c=>e.append(c));return e;}
function select(i){if(active===i)return;pauseAll();active=i;videoNodes[i].currentTime=0;$('topic').textContent=`Kad ${i+1} dikesan • ${lessons[i].title}`;message(`Kad ${i+1} dikesan. Tekan Mainkan Video.`);$('directLink').href='./'+lessons[i].src;controls();}
function lost(i){if(active!==i)return;pauseAll();active=-1;$('topic').textContent='Menunggu imbasan';message('Kad tidak kelihatan. Halakan semula kamera kepada kad.');$('directLink').href='./pratonton.html';controls();}
function build(){scene=node('a-scene',{'mindar-image':`imageTargetSrc: ./${targetFile}?v=60; maxTrack: 1; filterMinCF: 0.0001; filterBeta: 0.001;`,'embedded':'','renderer':'colorManagement: true; physicallyCorrectLights: true;','vr-mode-ui':'enabled: false','device-orientation-permission-ui':'enabled: false','loading-screen':'enabled: false'});
const assets=node('a-assets',{timeout:'60000'});
lessons.forEach((x,i)=>{const v=node('video',{id:'arvideo'+i,src:'./'+x.src,preload:'auto',playsinline:'', 'webkit-playsinline':'',crossorigin:'anonymous'});v.loop=false;videoNodes.push(v);assets.append(v);assets.append(node('img',{id:'poster'+i,src:'./'+x.poster,crossorigin:'anonymous'}));});
scene.append(assets);scene.append(node('a-camera',{position:'0 0 0','look-controls':'enabled: false'}));
lessons.forEach((x,i)=>{const t=node('a-entity',{id:'target'+i,'mindar-image-target':`targetIndex: ${i}`});const poster=node('a-plane',{width:'1',height:'0.5625',position:'0 0 0.012',material:`shader: flat; src: #poster${i}; side: double;`,visible:'true'});const vp=node('a-plane',{width:'1',height:'0.5625',position:'0 0 0.018',material:`shader: flat; src: #arvideo${i}; side: double;`,visible:'false'});t.append(poster,vp);posterPlanes.push(poster);videoPlanes.push(vp);targetNodes.push(t);scene.append(t);t.addEventListener('targetFound',()=>select(i));t.addEventListener('targetLost',()=>lost(i));});
scene.addEventListener('loaded',()=>{ok();message('Kamera sedang dimulakan. Imbas satu kad.');});scene.addEventListener('arReady',()=>{ok();message('Kamera sedia! Imbas keseluruhan gambar Kad 1 atau Kad 2.');});scene.addEventListener('arError',()=>fail('Kamera atau MindAR gagal dimulakan. Semak kebenaran kamera dan internet.'));
$('ar-host').append(scene);
videoNodes.forEach((v,i)=>{v.addEventListener('playing',()=>{if(active===i){videoPlanes[i].setAttribute('visible','true');posterPlanes[i].setAttribute('visible','false');message('Video '+(i+1)+' sedang dimainkan.');}controls();});v.addEventListener('timeupdate',controls);v.addEventListener('pause',controls);v.addEventListener('loadedmetadata',controls);v.addEventListener('ended',()=>{videoPlanes[i].setAttribute('visible','false');posterPlanes[i].setAttribute('visible','true');message('Video tamat. Tekan Ulang untuk menonton lagi.');controls();});v.addEventListener('error',()=>{if(active===i)message('Gagal memuatkan Video '+(i+1)+'. Buka Semak fail.');});});}
async function play(){if(active<0)return;try{await videoNodes[active].play();}catch(e){message('Video tidak dapat dimainkan. Tekan sekali lagi atau buka pratonton video.');}}
$('playBtn').addEventListener('click',()=>{if(active<0)return;const v=videoNodes[active];if(v.paused)void play();else v.pause();controls();});$('repeatBtn').addEventListener('click',()=>{if(active<0)return;videoNodes[active].currentTime=0;void play();});$('tryAgain').addEventListener('click',()=>location.reload());document.addEventListener('visibilitychange',()=>{if(document.hidden)pauseAll();});
async function init(){try{if(!window.AFRAME||!window.MINDAR)throw Error('MindAR atau A-Frame tidak berjaya dimuatkan. Periksa sambungan internet.');loader('Memeriksa dua video…','Mengesahkan fail MP4 baharu.');await preflight();loader('Membuka kamera…','Meminta kebenaran kamera telefon.');build();}catch(e){console.error(e);fail(String(e?.message||e)+' Buka Jana fail pengecaman untuk membuat sasaran baharu.');}}
init();
})();