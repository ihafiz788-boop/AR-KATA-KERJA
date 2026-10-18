 'use strict';
/* WebAR v2.1: dua video dan padanan sasaran yang boleh ditukar.
 * Sasaran 0/1 = indeks dalam targets.mind, bukan nombor pada gambar.
 * Jika imej dikompil dalam susunan terbalik, tekan 'Tukar Padanan'.
 */
(() => {
  const lesson = [
    {name:'Kata Kerja Aktif Transitif', file:'./video-kata-kerja.mp4', id:'video0', poster:'#poster0', label:'KAD 1 - AKTIF TRANSITIF'},
    {name:'Kata Kerja Aktif Tak Transitif', file:'./video-kata-kerja-tak-transitif.mp4', id:'video1', poster:'#poster1', label:'KAD 2 - AKTIF TAK TRANSITIF'}
  ];
  const videos = lesson.map(l => document.getElementById(l.id));
  const targets = [0,1].map(i => ({
    target: document.getElementById('sasaran'+i),
    screen: document.getElementById('paparanVideo'+i),
    poster: document.getElementById('paparanPoster'+i),
    label: document.getElementById('labelSasaran'+i)
  }));
  const btnMain = document.getElementById('btnMain');
  const btnUlang = document.getElementById('btnUlang');
  const btnSwap = document.getElementById('btnSwap');
  const status = document.getElementById('status');
  const topic = document.getElementById('topik');
  const progress = document.getElementById('kemajuan');
  const clock = document.getElementById('masa');
  const fallback = document.getElementById('tontonBiasa');
  const mappingInfo = document.getElementById('mappingInfo');
  const scene = document.querySelector('a-scene');
  let reversed = false;
  let activeRaw = null; // indeks sebenar yang MindAR kesan (0 atau 1)
  const lessonIndex = raw => reversed ? 1-raw : raw;
  const say = t => status.textContent = t;
  const fmt = t => { const n=Number.isFinite(t)?Math.floor(t):0; return `${Math.floor(n/60)}:${String(n%60).padStart(2,'0')}`; };
  const pauseAll = () => videos.forEach(v => v.pause());
  function showVideo(raw, enabled) {
    targets[raw].screen.setAttribute('visible', String(enabled));
    targets[raw].poster.setAttribute('visible', String(!enabled));
  }
  function refresh() {
    const valid = activeRaw !== null;
    btnMain.disabled = btnUlang.disabled = !valid;
    if (!valid) {
      btnMain.textContent = '▶ Mainkan Video'; progress.value=0; clock.textContent='0:00 / 0:00';
      return;
    }
    const v=videos[lessonIndex(activeRaw)];
    btnMain.textContent = !v.paused && !v.ended ? '⏸ Jeda Video' : '▶ Mainkan Video';
    progress.value = Number.isFinite(v.duration) && v.duration>0 ? Math.round(v.currentTime/v.duration*1000) : 0;
    clock.textContent = `${fmt(v.currentTime)} / ${fmt(v.duration)}`;
  }
  function selectRaw(raw) {
    pauseAll();
    activeRaw=raw;
    const logical=lessonIndex(raw);
    const l=lesson[logical];
    topic.textContent=`Sasaran ${raw} → Kad ${logical+1} • ${l.name}`;
    fallback.href=l.file;
    showVideo(raw,false);
    say(`✓ Sasaran ${raw} dikesan. Dipadankan dengan video Kad ${logical+1}. Tekan Mainkan Video.`);
    refresh();
  }
  function clearRaw(raw) {
    if (activeRaw!==raw) return;
    pauseAll();
    showVideo(raw,false);
    activeRaw=null;
    topic.textContent='Menunggu kad...';
    say('Kad tidak kelihatan. Halakan kamera semula kepada kad.');
    refresh();
  }
  function configureMapping() {
    pauseAll();
    targets.forEach((t,raw) => {
      const logical=lessonIndex(raw);
      t.screen.setAttribute('src','#'+lesson[logical].id);
      t.poster.setAttribute('src',lesson[logical].poster);
      t.label.setAttribute('value',lesson[logical].label);
      showVideo(raw,false);
    });
    mappingInfo.textContent = reversed ? 'Padanan diterbalikkan: Sasaran 0 → Video Kad 2 | Sasaran 1 → Video Kad 1' : 'Padanan asal: Sasaran 0 → Video Kad 1 | Sasaran 1 → Video Kad 2';
    if (activeRaw!==null) selectRaw(activeRaw);
    else { say('Padanan dikemas kini. Imbas Kad 1 atau Kad 2.'); refresh(); }
  }
  function play() {
    if (activeRaw===null) return say('Imbas Kad 1 atau Kad 2 dahulu.');
    const raw=activeRaw, logical=lessonIndex(raw);
    const v=videos[logical];
    say(`Sedang memuatkan video Kad ${logical+1}…`);
    const result=v.play(); // panggilan langsung daripada klik pengguna (untuk audio telefon)
    if (result && result.catch) result.catch(err => {
      console.warn('play() gagal',err);
      showVideo(raw,false);
      say('Video gagal dimainkan. Semak fail MP4 atau cuba “Tonton video di luar AR”.');
      refresh();
    });
  }
  btnMain.addEventListener('click', () => {
    if (activeRaw===null) return;
    const v=videos[lessonIndex(activeRaw)];
    if (!v.paused && !v.ended) v.pause(); else play();
  });
  btnUlang.addEventListener('click', () => {
    if (activeRaw===null) return;
    const v=videos[lessonIndex(activeRaw)];
    v.pause(); v.currentTime=0; play();
  });
  btnSwap.addEventListener('click', () => {
    reversed=!reversed;
    configureMapping();
  });
  targets.forEach((t,raw) => {
    t.target.addEventListener('targetFound', () => selectRaw(raw));
    t.target.addEventListener('targetLost', () => clearRaw(raw));
  });
  videos.forEach((v,logical) => {
    v.addEventListener('playing', () => {
      if (activeRaw!==null && lessonIndex(activeRaw)===logical) {
        showVideo(activeRaw,true);
        say(`✓ Video Kad ${logical+1} sedang dimainkan.`);
      }
      refresh();
    });
    v.addEventListener('pause',refresh);
    v.addEventListener('ended', () => {
      if (activeRaw!==null && lessonIndex(activeRaw)===logical) {
        showVideo(activeRaw,false);
        say(`Video Kad ${logical+1} tamat. Tekan Ulang untuk menonton semula.`);
      }
      refresh();
    });
    v.addEventListener('loadedmetadata',refresh);
    v.addEventListener('timeupdate',refresh);
    v.addEventListener('error', () => {
      if (activeRaw!==null && lessonIndex(activeRaw)===logical) say(`Video Kad ${logical+1} gagal dimuatkan. Semak nama fail MP4 di GitHub.`);
    });
  });
  scene.addEventListener('arError', () => say('Kamera atau targets.mind gagal dimuatkan. Semak fail targets.mind dua kad di GitHub.'));
  document.addEventListener('visibilitychange', () => { if (document.hidden) pauseAll(); });
  configureMapping();
})();
