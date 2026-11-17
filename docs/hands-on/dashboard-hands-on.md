# Dashboard Hands-on

Hubungkan simulator, API Express.js, PostgreSQL, dan halaman frontend. Siapkan [Backend Mini](backend-mini.md), [Database Mini](database-mini.md), [Frontend Mini](frontend-mini.md), dan [IoT Simulator Mini](iot-simulator-mini.md). Buat tabel `sensor_readings` di database `aiot_learning`.

## Hubungkan Express.js ke PostgreSQL

Di folder `mini_backend`, pasang driver PostgreSQL:

```powershell
npm install pg
```

Atur alamat database pada sesi PowerShell yang menjalankan server. Ganti nama pengguna dan kata sandi sesuai PostgreSQL lokalmu:

```powershell
$env:DATABASE_URL = 'postgresql://user_latihan:sandi_latihan@127.0.0.1:5432/aiot_learning'
```

Di `main.js`, tambahkan pool koneksi setelah membuat aplikasi Express:

```js
const { Pool } = require("pg");
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
```

Ganti handler `POST /sensors` dan tambahkan `GET /sensors`:

```js
app.post("/sensors", async (req, res, next) => {
  const { device_id, sensor_type, value, unit } = req.body;
  if (
    typeof device_id !== "string" ||
    typeof sensor_type !== "string" ||
    typeof value !== "number" ||
    typeof unit !== "string"
  ) {
    return res.status(400).json({ error: "Format data sensor tidak valid" });
  }

  try {
    const result = await pool.query(
      `INSERT INTO sensor_readings (device_id, sensor_type, value, unit)
       VALUES ($1, $2, $3, $4)
       RETURNING id, device_id, sensor_type, value, unit, recorded_at`,
      [device_id, sensor_type, value, unit],
    );
    return res.status(201).json({ message: "Data sensor disimpan", data: result.rows[0] });
  } catch (error) {
    return next(error);
  }
});

app.get("/sensors", async (req, res, next) => {
  try {
    const result = await pool.query(
      `SELECT id, device_id, sensor_type, value, unit, recorded_at
       FROM sensor_readings
       ORDER BY recorded_at DESC, id DESC
       LIMIT 10`,
    );
    return res.json(result.rows);
  } catch (error) {
    return next(error);
  }
});

app.use((error, req, res, next) => {
  console.error(error);
  res.status(500).json({ error: "Terjadi kesalahan pada server" });
});
```

Parameter `$1` sampai `$4` dikirim terpisah dari SQL agar nilai input tidak disambungkan menjadi teks query. `await` menunggu database, sementara `try`/`catch` meneruskan masalah ke penangan error Express. Letakkan handler error setelah semua route dan sebelum `app.listen`.

Jalankan `node main.js` dari sesi terminal yang sudah memiliki `DATABASE_URL`. Pastikan tabel dibuat lewat [Database Mini](database-mini.md).

## Kirim data dan tampilkan di frontend

Jalankan simulator. Respons `POST /sensors` kini memuat ID baris dan `recorded_at`. Buka `http://127.0.0.1:8000/sensors` untuk membaca sepuluh data terbaru.

Di `mini_frontend/index.html`, ubah URL Fetch dari `/health` menjadi `/sensors`. Ganti tampilan JSON dengan:

```javascript
output.textContent = data.length
  ? data.map(({ id, device_id, sensor_type, value, unit }) =>
      `#${id} ${device_id} · ${sensor_type} · ${value} ${unit}`
    ).join("\n")
  : "Belum ada pembacaan.";
```

Klik **Refresh**. Baris terbaru di halaman harus menunjukkan nilai yang sama dengan respons simulator dan hasil API. Jika request dari browser ditolak CORS, periksa origin frontend yang diizinkan di `main.js`.

Rujukan: [node-postgres: Connecting](https://node-postgres.com/features/connecting) dan [node-postgres: Queries](https://node-postgres.com/features/queries).
