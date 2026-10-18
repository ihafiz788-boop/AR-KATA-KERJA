// Semua dialog Bahasa Melayu boleh ditukar di sini.
const pelajaran = [
  {kata:'membaca', ayat:'Ali membaca buku.', objek:'buku', huraian:'Perkataan membaca ialah kata kerja aktif transitif kerana diikuti objek, iaitu buku.'},
  {kata:'menyiram', ayat:'Aina menyiram pokok.', objek:'pokok', huraian:'Perkataan menyiram ialah kata kerja aktif transitif kerana diikuti objek, iaitu pokok.'},
  {kata:'menulis', ayat:'Murid menulis karangan.', objek:'karangan', huraian:'Perkataan menulis ialah kata kerja aktif transitif kerana diikuti objek, iaitu karangan.'}
];
let indeks = 0;
const $ = (selector) => document.querySelector(selector);
const status = $('#status');
const kadAR = $('#kadAR');
function paparContoh() {
  const item = pelajaran[indeks];
  $('#kata').textContent = item.kata;
  $('#huraian').textContent = `${item.ayat} ${item.huraian}`;
  $('#kataAR').setAttribute('value', item.kata);
  $('#ayatAR').setAttribute('value', item.ayat);
}
function cakap() {
  const item = pelajaran[indeks];
  if (!('speechSynthesis' in window)) {
    status.textContent = 'Telefon ini tidak menyokong fungsi suara automatik.';
    return;
  }
  window.speechSynthesis.cancel();
  const dialog = new SpeechSynthesisUtterance(`Hai murid-murid! Hari ini kita belajar kata kerja aktif transitif. ${item.ayat} ${item.huraian}`);
  dialog.lang = 'ms-MY';
  dialog.rate = 0.87;
  dialog.pitch = 1.1;
  const suara = window.speechSynthesis.getVoices();
  const suaraBM = suara.find(v=>v.lang.toLowerCase().startsWith('ms'));
  if (suaraBM) dialog.voice = suaraBM;
  dialog.onerror = () => { status.textContent = 'Audio tidak tersedia. Sila baca penerangan pada skrin.'; };
  window.speechSynthesis.speak(dialog);
}
$('#tukar').addEventListener('click', ()=> {
  indeks = (indeks + 1) % pelajaran.length;
  if ('speechSynthesis' in window) window.speechSynthesis.cancel();
  paparContoh();
});
$('#suara').addEventListener('click', cakap);
// Mesej status muncul sebaik sahaja MindAR berjaya / gagal mengesan kad.
kadAR.addEventListener('targetFound', () => { status.textContent = '✓ Kad berjaya dikesan! Watak cikgu 3D muncul.'; });
kadAR.addEventListener('targetLost', () => { status.textContent = 'Kad hilang daripada kamera. Halakan semula kepada kad.'; });
$('#kadAR').closest('a-scene').addEventListener('arError', () => {
  status.textContent = 'Kamera / sasaran gagal dimuatkan. Semak akses kamera dan fail targets.mind.';
});
paparContoh();
