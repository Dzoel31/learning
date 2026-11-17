# Backend Mini dengan Express.js

Buat API kecil yang bisa memeriksa status server dan menerima satu pembacaan sensor. Data belum disimpan; penyimpanan PostgreSQL ditambahkan pada [Dashboard Hands-on](dashboard-hands-on.md).

## Endpoint

| Method | Path | Tugas |
| --- | --- | --- |
| `GET` | `/health` | memeriksa server merespons |
| `POST` | `/sensors` | memeriksa bentuk dasar dan mengembalikan pembacaan |

## Buat proyek

Di PowerShell:

```powershell
mkdir mini_backend
Set-Location mini_backend
npm init -y
npm install express cors
New-Item main.js
```

Isi `main.js`:

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
  const { device_id, sensor_type, value, unit } = req.body;
  if (
    typeof device_id !== "string" ||
    typeof sensor_type !== "string" ||
    typeof value !== "number" ||
    typeof unit !== "string"
  ) {
    return res.status(400).json({ error: "Format data sensor tidak valid" });
  }

  return res.status(201).json({
    message: "Data sensor diterima",
    data: { device_id, sensor_type, value, unit },
  });
});

app.listen(8000, "127.0.0.1", () => {
  console.log("API berjalan di http://127.0.0.1:8000");
});
```

`express.json()` membaca body JSON. `req.body` berisi data yang dikirim client. Status `400` menunjukkan format input ditolak, sedangkan `201` menandai data baru diterima.

## Jalankan server

```powershell
node main.js
```

Buka `http://127.0.0.1:8000/health`. Hasilnya:

```json
{"status":"ok"}
```

Untuk menguji endpoint POST dari terminal PowerShell:

```powershell
curl.exe -X POST http://127.0.0.1:8000/sensors `
  -H "Content-Type: application/json" `
  -d '{"device_id":"esp32-01","sensor_type":"temperature","value":28.5,"unit":"celsius"}'
```

Coba hilangkan `value` atau kirim sebagai teks. Server akan membalas `400`. Jika format benar, respons memuat pesan dan data sensor. Lanjutkan ke [IoT Simulator Mini](iot-simulator-mini.md) untuk mengirim data dari script, lalu [Dashboard Hands-on](dashboard-hands-on.md) untuk menyimpannya.
