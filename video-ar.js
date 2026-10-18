'use strict';
// WebAR MindAR + A-Frame: video sebagai tekstur pada kad gambar.
(() => {
  const video = document.getElementById('videoAR');
  const target = document.getElementById('kadAR');
  const status = document.getElementById('status');
  const btnMain = document.getElementById('btnMain');
  const btnUlang = document.getElementById('btnUlang');
  const arVideo = document.getElementById('arVideo');
  const arPoster = document.getElementById('arPoster');
  const progress = document.getElementById('kemajuan');
  const timing = document.getElementById('masa');
  const scene = document.querySelector('a-scene');
  let targetAda = false;

  function teksStatus(teks) { status.textContent = teks; }
  function masa(s) {
    const num = Number.isFinite(s) ? Math.floor(s) : 0;
    return `${Math.floor(num / 60)}:${String(num % 60).padStart(2, '0')}`;
  }
  function kemasKini() {
    const berjalan = !video.paused && !video.ended;
    btnMain.textContent = berjalan ? '⏸ Jeda' : '▶ Mainkan video';
    btnMain.setAttribute('aria-pressed', String(berjalan));
    timing.textContent = `${masa(video.currentTime)} / ${masa(video.duration)}`;
    progress.value = Number.isFinite(video.duration) && video.duration > 0
      ? Math.round(video.currentTime / video.duration * 1000) : 0;
  }
  function paparVideo(ya) {
    arVideo.setAttribute('visible', String(ya));
    arPoster.setAttribute('visible', String(!ya));
  }
  function mula() {
    if (!targetAda) {
      teksStatus('Imbas kad hingga dikesan dahulu, kemudian tekan Mainkan video.');
      return;
    }
    // play() berlaku terus selepas pengguna menekan butang. Ini penting pada iPhone.
    const hasil = video.play();
    if (hasil && typeof hasil.catch === 'function') {
      hasil.catch((e) => {
        paparVideo(false);
        kemasKini();
        teksStatus('Video tidak boleh dimainkan dalam AR pada pelayar ini. Cuba pautan “Tonton tanpa AR” di bawah.');
        console.warn('Video playback blocked', e);
      });
    }
    teksStatus('Memuatkan video…');
  }
  btnMain.addEventListener('click', () => {
    if (video.paused || video.ended) mula();
    else video.pause();
  });
  btnUlang.addEventListener('click', () => {
    video.pause();
    video.currentTime = 0;
    mula();
  });
  video.addEventListener('playing', () => {
    paparVideo(true);
    teksStatus('✓ Video sedang dimainkan di atas kad AR.');
    kemasKini();
  });
  video.addEventListener('pause', () => {
    kemasKini();
    if (targetAda && !video.ended) teksStatus('Video dijeda. Tekan Mainkan video untuk sambung.');
  });
  video.addEventListener('ended', () => {
    paparVideo(false);
    teksStatus('Video tamat. Tekan Ulang untuk menonton sekali lagi.');
    kemasKini();
  });
  video.addEventListener('timeupdate', kemasKini);
  video.addEventListener('loadedmetadata', kemasKini);
  video.addEventListener('error', () => {
    const message = 'Video gagal dimuatkan. Pastikan video-kata-kerja.mp4 telah dimuat naik ke folder utama GitHub.';
    teksStatus(message);
    console.error(message, video.error);
  });
  target.addEventListener('targetFound', () => {
    targetAda = true;
    btnMain.disabled = false;
    btnUlang.disabled = false;
    teksStatus('✓ Kad dikesan! Tekan “Mainkan video” untuk mula dengan suara.');
    kemasKini();
  });
  target.addEventListener('targetLost', () => {
    targetAda = false;
    video.pause();
    btnMain.disabled = true;
    btnUlang.disabled = true;
    teksStatus('Kad tidak kelihatan. Halakan kamera semula kepada kad.');
  });
  scene.addEventListener('arError', () => {
    teksStatus('Kamera / fail sasaran MindAR gagal dimuatkan. Semak kebenaran kamera dan targets.mind.');
  });
  // Berhenti memainkan audio jika pengguna keluar daripada halaman.
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) video.pause();
  });
  kemasKini();
})();
