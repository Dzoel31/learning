# Lab Async vs Sync

Atur durasi I/O request A, lalu jalankan simulasi untuk membandingkan kapan request B selesai pada mode blocking dan nonblocking.

<div class="async-guide" data-async-guide>
  <noscript>Aktifkan JavaScript untuk mencoba simulator. I/O nonblocking memberi event loop kesempatan menangani request lain.</noscript>
</div>

Garis waktu ini model sederhana: biaya CPU handler diabaikan dan mode blocking menirukan waktu tunggu yang menahan event loop. Potongan kode hanya ditampilkan; halaman tidak menjalankannya.

[Kembali ke materi Asynchronous JavaScript](../backend/async-javascript.md)
