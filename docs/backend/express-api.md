# API dengan Express.js

Express menerima request HTTP, mencocokkan method dan path ke route, lalu mengirim response. Contoh ini memakai endpoint `GET /health` dan `POST /sensors`.

## Pasang Express

Di folder `mini_backend`, jalankan:

```powershell
npm install express cors
```

Buat `main.js`:

```js
const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors({ origin: "http://127.0.0.1:5500" }));
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.post("/sensors", (req, res) => {
  res.status(201).json({
    message: "Data sensor diterima",
    data: req.body,
  });
});

app.listen(8000, "127.0.0.1", () => {
  console.log("API berjalan di http://127.0.0.1:8000");
});
```

`express.json()` membaca body JSON dan mengisinya ke `req.body`. `res.json()` mengirim response JSON. Route POST menggunakan status `201` karena contoh menandai data sebagai resource baru.

## Jalankan dan periksa

```powershell
node main.js
```

Buka `http://127.0.0.1:8000/health`. Untuk mengirim data, buka `http://127.0.0.1:8000/docs` tidak tersedia secara bawaan di Express; gunakan `curl`, Postman, atau halaman Frontend Mini. Contoh dengan curl:

```powershell
curl.exe -X POST http://127.0.0.1:8000/sensors `
  -H "Content-Type: application/json" `
  -d '{"device_id":"esp32-01","sensor_type":"temperature","value":28.5,"unit":"celsius"}'
```

Contoh ini mengembalikan data yang dikirim, belum menyimpannya. Penyimpanan PostgreSQL dibahas di [Dashboard Hands-on](../hands-on/dashboard-hands-on.md).

## Arti parameter handler

- `req` berisi informasi request, seperti `req.params`, `req.query`, dan `req.body`.
- `res` dipakai untuk mengirim status dan response.
- `(req, res) => { ... }` adalah fungsi yang dipanggil Express untuk route tersebut.

Sebelum mempercayai `req.body`, periksa bentuk dan nilainya. Lanjutkan ke [Validasi dan Middleware](validation-middleware.md).
