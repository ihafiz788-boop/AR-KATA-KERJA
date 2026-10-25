/* KAJATIF WebAR - iPhone loading fix v6.1.
   Sasaran 0 = Video 1 (transitif); sasaran 1 = Video 2 (tak transitif).
   Perubahan: mulai atas sentuhan, tanpa video dalam <a-assets>, dengan diagnosis ralat.
*/
(()=>{
'use strict';
const $=id=>document.getElementById(id);
const targetsFile='targets-kajatif-kad-baharu.mind';
const lessons=[
  {title:'Kata Kerja Aktif Transitif',src:'video-1-transitif.mp4',poster:'poster-1.jpg'},
  {title:'Kata Kerja Aktif Tak Transitif',src:'video-2-tak-transitif.mp4',poster:'poster-2.jpg'}
];
let active=-1, scene, videoNodes=[], videoPlanes=[], posterPlanes=[], timeoutHandle=null;
function status(s){$('status').textContent=s;}
function loader(title,detail){$('loaderTitle').textContent=title;$('loaderMessage').textContent=detail;}
function stopTimeout(){if(timeoutHandle){clearTimeout(timeoutHandle);timeoutHandle=null;}}
function fail(title,detail){stopTimeout();$('loaderSpin').classList.add('hidden');$('readyActions').classList.add('hidden');$('loaderActions').classList.remove('hidden');$('preflight').classList.remove('hidden');loader(title,detail);status(detail);}
function ready(){stopTimeout();$('preflight').classList.add('hidden');status('Kamera sedia. Imbas seluruh gambar Kad 1 atau Kad 2.');}
const format=t=>{let s=Number.isFinite(t)?Math.floor(t):0;return `${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}`};
function controls(){const v=active>=0?videoNodes[active]:null;$('playBtn').disabled=$('repeatBtn').disabled=!v;$('playBtn').textContent=v&&!v.paused?'⏸ Jeda Video':'▶ Mainkan Video';$('progress').value=v&&v.duration>0?Math.round(v.currentTime/v.duration*1000):0;$('time').textContent=v?format(v.currentTime)+' / '+format(v.duration):'0:00 / 0:00';}
function pauseAll(){videoNodes.forEach((v,i)=>{v.pause();if(videoPlanes[i])videoPlanes[i].setAttribute('visible',false);if(posterPlanes[i])posterPlanes[i].setAttribute('visible',true);});}
function pick(i){if(active===i)return;pauseAll();active=i;videoNodes[i].currentTime=0;$('topic').textContent=`Kad ${i+1} dikesan • ${lessons[i].title}`;status(`Kad ${i+1} dikesan. Tekan Mainkan Video.`);$('directLink').href='./'+lessons[i].src;controls();}
function lost(i){if(active!==i)return;pauseAll();active=-1;$('topic').textContent='Menunggu kad';status('Kad hilang daripada kamera. Halakan semula kamera ke arah kad.');$('directLink').href='./pratonton.html';controls();}
function el(tag,attrs={}){const n=document.createElement(tag);for(const [k,v] of Object.entries(attrs))n.setAttribute(k,String(v));return n;}
async function preflight(){
  if(!window.AFRAME||!window.MINDAR?.IMAGE?.Compiler)throw Error('Pustaka AR gagal dimuat. Semak sambungan internet.');
  for(const l of lessons){
    let r=await fetch('./'+l.src+'?v=61',{method:'HEAD',cache:'no-store'});
    if(r.status===405){r=await fetch('./'+l.src+'?v=61',{cache:'no-store'});r.body?.cancel?.().catch(()=>{});}
    if(!r.ok)throw Error('Fail video tiada: '+l.src+' (HTTP '+r.status+').');
  }
  const r=await fetch('./'+targetsFile+'?v=61',{cache:'no-store'});
  if(!r.ok)throw Error('Fail '+targetsFile+' tiada (HTTP '+r.status+'). Jana dan muat naik fail itu terlebih dahulu.');
  const ab=await r.arrayBuffer();
  if(ab.byteLength<1000)throw Error('Fail pengecaman terlalu kecil / rosak.');
  const c=new window.MINDAR.IMAGE.Compiler();
  const targets=c.importData(ab);
  if(!Array.isArray(targets)||targets.length!==2)throw Error('Fail pengecaman mesti mengandungi tepat dua kad asal KAJATIF. Jana semula.');
}
function build(){
  if(!navigator.mediaDevices?.getUserMedia)throw Error('Pelayar ini tidak menyediakan kamera. Buka pautan terus menggunakan Safari.');
  if(!window.isSecureContext)throw Error('Kamera memerlukan pautan HTTPS. Buka melalui GitHub Pages.');
  // Videos are OUTSIDE <a-assets> so iOS Safari does not wait for video preload.
  // Old version hung at "Membuka kamera" because the scene waited for media readiness.
  const shelf=el('div',{id:'ar-media-shelf'});
  shelf.style.cssText='position:fixed;width:1px;height:1px;overflow:hidden;left:-1000px;top:0;pointer-events:none;opacity:0';
  lessons.forEach((l,i)=>{
    const v=el('video',{id:'arvideo'+i,src:'./'+l.src,preload:'none',playsinline:'','webkit-playsinline':'',crossorigin:'anonymous'});
    v.playsInline=true;v.muted=false;v.loop=false;
    const img=el('img',{id:'poster'+i,src:'./'+l.poster,crossorigin:'anonymous'});
    shelf.append(v,img);videoNodes.push(v);
  });
  document.body.append(shelf);
  scene=el('a-scene',{
    'mindar-image':`imageTargetSrc: ./${targetsFile}?v=61; autoStart: true; maxTrack: 1; filterMinCF: 0.0001; filterBeta: 0.001;`,
    'embedded':'','renderer':'colorManagement: true; antialias: true;',
    'vr-mode-ui':'enabled: false','device-orientation-permission-ui':'enabled: false',
    'loading-screen':'enabled: false'
  });
  scene.append(el('a-camera',{position:'0 0 0','look-controls':'enabled: false'}));
  lessons.forEach((l,i)=>{
    const t=el('a-entity',{'mindar-image-target':'targetIndex: '+i});
    const poster=el('a-plane',{width:'1',height:'0.5625',position:'0 0 0.012',material:`shader: flat; src: #poster${i}; side: double`,visible:'true'});
    const screen=el('a-plane',{width:'1',height:'0.5625',position:'0 0 0.018',material:'shader: flat; color: #000000; side: double',visible:'false'});
    t.append(poster,screen);scene.append(t);posterPlanes.push(poster);videoPlanes.push(screen);
    t.addEventListener('targetFound',()=>pick(i));t.addEventListener('targetLost',()=>lost(i));
  });
  scene.addEventListener('loaded',()=>loader('Mengaktifkan kamera…','Jika Safari meminta izin kamera, pilih Benarkan.'));
  scene.addEventListener('arReady',ready);
  scene.addEventListener('arError',e=>{console.error('MindAR arError',e);fail('Kamera tidak dapat diaktifkan','Buka dalam Safari, semak Settings → Apps → Safari → Camera dan cuba semula.');});
  $('ar-host').append(scene);
  videoNodes.forEach((v,i)=>{
    v.addEventListener('playing',()=>{
      if(active===i){
        // Assign video texture only once playback has actually started.
        videoPlanes[i].setAttribute('material','src','#arvideo'+i);
        videoPlanes[i].setAttribute('visible',true);posterPlanes[i].setAttribute('visible',false);
        status('Video '+(i+1)+' sedang dimainkan.');
      }
      controls();
    });
    v.addEventListener('loadedmetadata',controls);v.addEventListener('timeupdate',controls);
    v.addEventListener('pause',controls);
    v.addEventListener('ended',()=>{
      videoPlanes[i].setAttribute('visible',false);posterPlanes[i].setAttribute('visible',true);
      if(active===i)status('Video tamat. Tekan Ulang untuk menonton lagi.');controls();
    });
    v.addEventListener('error',()=>{if(active===i)status('Video gagal dimuatkan. Cuba buka video melalui pautan di bawah.');});
  });
  timeoutHandle=setTimeout(()=>{
    if(!$('preflight').classList.contains('hidden')){
      fail('Kamera mengambil masa terlalu lama','AR tidak berjaya bermula. Cuba buka laman terus dalam Safari (bukan pelayar dalam aplikasi), kemudian jalankan Uji Kamera Telefon.');
    }
  },40000);
}
async function play(){if(active<0)return;try{await videoNodes[active].play();}catch(e){console.error(e);status('Video tidak dapat dimainkan. Tekan sekali lagi atau buka video tanpa AR.');}}
$('playBtn').addEventListener('click',()=>{if(active<0)return;const v=videoNodes[active];if(v.paused)void play();else v.pause();controls();});
$('repeatBtn').addEventListener('click',()=>{if(active<0)return;videoNodes[active].currentTime=0;void play();});
$('tryAgain').addEventListener('click',()=>location.reload());
$('startCamera').addEventListener('click',()=>{
  $('readyActions').classList.add('hidden');$('loaderSpin').classList.remove('hidden');
  loader('Membuka kamera…','Jika Safari meminta akses kamera, pilih Benarkan.');
  try{build();}catch(e){console.error(e);fail('Kamera tidak dapat dibuka',String(e?.message||e));}
});
document.addEventListener('visibilitychange',()=>{if(document.hidden)pauseAll();});
async function init(){
  try{loader('Menyemak fail AR…','Mengesahkan video dan kedua-dua kad.');await preflight();
    $('loaderSpin').classList.add('hidden');
    $('readyActions').classList.remove('hidden');
    loader('Sedia untuk mengimbas','Tekan Aktifkan Kamera AR untuk membenarkan Safari menggunakan kamera.');
  }catch(e){console.error('preflight',e);fail('Fail AR belum lengkap',String(e?.message||e));}
}
init();
})();
