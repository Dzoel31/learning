# Validasi dan Middleware

Request datang dari luar aplikasi. Periksa input sebelum menggunakannya atau menyimpannya. Middleware adalah fungsi yang dapat membaca atau mengubah request sebelum route mengirim response.

## Validasi input sensor

Tambahkan fungsi ini sebelum route `POST /sensors` di `main.js`:

```js
function validateSensor(req, res, next) {
  const { device_id, sensor_type, value, unit } = req.body;

  if (
    typeof device_id !== "string" ||
    typeof sensor_type !== "string" ||
    typeof value !== "number" ||
    typeof unit !== "string"
  ) {
    return res.status(400).json({
      error: "device_id, sensor_type, value, dan unit harus diisi dengan tipe yang sesuai",
    });
  }

  next();
}

app.post("/sensors", validateSensor, (req, res) => {
  res.status(201).json({ message: "Data sensor diterima", data: req.body });
});
```

`next()` meneruskan request ke middleware atau handler berikutnya. Jika data tidak sesuai, middleware mengakhiri request dengan status `400`.

Validasi sederhana ini belum menangani rentang nilai atau pasangan `sensor_type` dan `unit`. Aturan tersebut perlu ditentukan oleh aplikasi. Untuk proyek besar, gunakan library schema validation agar aturan tidak tersebar.

## CORS

CORS mengatur origin browser yang boleh memanggil API. Contoh Express di [API dengan Express.js](express-api.md) mengizinkan Frontend Mini di `http://127.0.0.1:5500`. Jika alamat atau port frontend berubah, origin yang diizinkan perlu disesuaikan.

CORS bukan autentikasi. Ia mengatur akses dari browser, bukan menggantikan pemeriksaan identitas dan izin pada server.

## Status yang dipakai

| Status | Kapan dipakai pada contoh |
| --- | --- |
| `200` | request berhasil, misalnya `GET /health` |
| `201` | data baru diterima atau dibuat |
| `400` | input tidak lolos validasi |
| `404` | route atau resource tidak ditemukan |
| `500` | kesalahan tak terduga di server |

Lanjutkan ke [Asynchronous JavaScript](async-javascript.md) untuk memahami operasi database dan jaringan.
