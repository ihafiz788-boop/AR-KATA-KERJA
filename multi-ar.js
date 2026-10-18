'use strict';
/* Dua kad (targetIndex 0 / 1), dua fail MP4. Tidak menggunakan model 3D. */
(() => {
  const entries = [
    { name: 'Kata Kerja Aktif Transitif', video: document.getElementById('video0'),
      target: document.getElementById('sasaran0'), plane: document.getElementById('paparanVideo0'),
      poster: document.getElementById('paparanPoster0'), file: './video-kata-kerja.mp4' },
    { name: 'Kata Kerja Aktif Tak Transitif', video: document.getElementById('video1'),
      target: document.getElementById('sasaran1'), plane: document.getElementById('paparanVideo1'),
      poster: document.getElementById('paparanPoster1'), file: './video-kata-kerja-tak-transitif.mp4' },
  ];
  const main = document.getElementById('btnMain');
  const repeat = document.getElementById('btnUlang');
  const status = document.getElementById('status');
  const topic = document.getElementById('topik');
  const progress = document.getElementById('kemajuan');
  const clock = document.getElementById('masa');
  const fallback = document.getElementById('tontonBiasa');
  const scene = document.querySelector('a-scene');
  let active = null;

  function say(t) { status.textContent = t; }
  function fmt(t) {
    const v = Number.isFinite(t) ? Math.floor(t) : 0;
    return `${Math.floor(v / 60)}:${String(v % 60).padStart(2, '0')}`;
  }
  function showVideo(entry, enabled) {
    entry.plane.setAttribute('visible', String(enabled));
    entry.poster.setAttribute('visible', String(!enabled));
  }
  function refresh() {
    const item = active === null ? null : entries[active];
    main.disabled = repeat.disabled = !item;
    if (!item) {
      main.textContent = '▶ Mainkan Video';
      progress.value = 0;
      clock.textContent = '0:00 / 0:00';
      return;
    }
    const v = item.video;
    main.textContent = !v.paused && !v.ended ? '⏸ Jeda Video' : '▶ Mainkan Video';
    progress.value = Number.isFinite(v.duration) && v.duration > 0
      ? Math.round((v.currentTime / v.duration) * 1000) : 0;
    clock.textContent = `${fmt(v.currentTime)} / ${fmt(v.duration)}`;
  }
  function found(i) {
    if (active !== null && active !== i) entries[active].video.pause();
    active = i;
    const item = entries[i];
    topic.textContent = `Kad ${i + 1} • ${item.name}`;
    fallback.href = item.file;
    say(`✓ Kad ${i + 1} dikesan! Tekan Mainkan Video.`);
    refresh();
  }
  function lost(i) {
    if (active !== i) return;
    entries[i].video.pause();
    active = null;
    topic.textContent = 'Menunggu kad...';
    say('Kad tidak kelihatan. Halakan kamera semula kepada kad untuk sambung.');
    refresh();
  }
  function playSelected() {
    if (active === null) { say('Imbas salah satu kad dahulu.'); return; }
    const playingIndex = active;
    const v = entries[playingIndex].video;
    // Aksi play() berlaku secara langsung dalam klik pengguna (penting untuk audio pada iOS).
    const result = v.play();
    say('Memuatkan video…');
    if (result && result.catch) result.catch((e) => {
      console.warn('Video tidak dapat dimainkan:', e);
      showVideo(entries[playingIndex], false);
      say('Tidak dapat memainkan video. Cuba pautan “Tonton video di luar AR” atau semak fail MP4.');
      refresh();
    });
  }
  main.addEventListener('click', () => {
    if (active === null) return;
    const v = entries[active].video;
    if (!v.paused && !v.ended) v.pause(); else playSelected();
  });
  repeat.addEventListener('click', () => {
    if (active === null) return;
    const v = entries[active].video;
    v.pause(); v.currentTime = 0; playSelected();
  });
  entries.forEach((entry, i) => {
    entry.target.addEventListener('targetFound', () => found(i));
    entry.target.addEventListener('targetLost', () => lost(i));
    entry.video.addEventListener('playing', () => {
      showVideo(entry, true);
      if (active === i) say(`✓ Memainkan video Kad ${i + 1}.`);
      refresh();
    });
    entry.video.addEventListener('pause', () => {
      if (active === i && !entry.video.ended) say('Video dijeda. Tekan Mainkan Video untuk sambung.');
      refresh();
    });
    entry.video.addEventListener('ended', () => {
      showVideo(entry, false);
      if (active === i) say('Video tamat. Tekan Ulang untuk menonton semula.');
      refresh();
    });
    entry.video.addEventListener('error', () => {
      if (active === i) say(`Video Kad ${i + 1} gagal dimuatkan. Semak fail MP4 dalam GitHub.`);
      console.warn('Ralat memuatkan video', entry.file, entry.video.error);
    });
    entry.video.addEventListener('loadedmetadata', refresh);
    entry.video.addEventListener('timeupdate', refresh);
  });
  scene.addEventListener('arError', () => {
    say('Kamera atau targets.mind gagal dimuatkan. Pastikan fail targets.mind mengandungi kedua-dua kad.');
  });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) entries.forEach(e => e.video.pause());
  });
  refresh();
})();
