# Asynchronous JavaScript

Server sering menunggu operasi yang lebih lambat daripada perhitungan biasa, seperti query database atau request ke layanan AI. JavaScript memakai Promise dan `async`/`await` untuk menulis alur tunggu itu dengan jelas.

## Menunggu operasi

```js
async function loadSensors() {
  const response = await fetch("http://127.0.0.1:8000/sensors");
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }
  return response.json();
}
```

`await` menunggu Promise selesai sebelum memakai hasilnya. Selama operasi I/O menunggu, Node.js dapat menangani pekerjaan lain. Ini bukan berarti perhitungan CPU berat otomatis menjadi lebih cepat.

## Lab antrean dan event loop

Bandingkan dua request pada satu event loop. A masuk pada detik 0; B datang pada detik 1 dan membutuhkan satu detik I/O. Ubah durasi A, jalankan satu detik demi satu detik, lalu bandingkan waktu selesai B.

<div class="async-guide" data-async-guide>
  <noscript>Aktifkan JavaScript untuk mencoba simulator. I/O nonblocking memberi event loop kesempatan menangani request lain.</noscript>
</div>

Garis waktu adalah model sederhana: biaya CPU handler diabaikan dan mode blocking menirukan waktu tunggu yang menahan event loop. Potongan kode hanya ditampilkan, bukan dieksekusi di halaman.

## Tangani kegagalan

```js
try {
  const sensors = await loadSensors();
  console.log(sensors);
} catch (error) {
  console.error("Gagal mengambil data:", error.message);
}
```

Di route Express, gunakan `try`/`catch` ketika handler menunggu database atau API lain, lalu teruskan error ke middleware error. Tambahkan handler terakhir seperti ini agar client menerima JSON saat server gagal:

```js
app.use((error, req, res, next) => {
  console.error(error);
  res.status(500).json({ error: "Terjadi kesalahan pada server" });
});
```

Daftarkan middleware error setelah semua route. Jangan mengirim detail internal error ke client.

Untuk query PostgreSQL, driver menyediakan operasi asinkron. Lihat penggunaan database pada [Dashboard Hands-on](../hands-on/dashboard-hands-on.md). Materi ini membahas pola async; ia tidak menggantikan pemahaman tentang query atau transaksi.
