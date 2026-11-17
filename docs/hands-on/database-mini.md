# Database Mini

Latihan ini memasukkan dua pembacaan lewat SQL dan membaca hasilnya. Jalankan di database latihan `aiot_learning` dari [SQL Basics](../database/sql-basics.md#membuat-database). Jika tabel sudah dibuat di sana, lanjutkan ke `INSERT`.

## Buat tabel

```sql
CREATE TABLE sensor_readings (
    id BIGSERIAL PRIMARY KEY,
    device_id TEXT NOT NULL,
    sensor_type TEXT NOT NULL,
    value DOUBLE PRECISION NOT NULL,
    unit TEXT NOT NULL,
    recorded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

## Simpan dan baca dua pembacaan

```sql
INSERT INTO sensor_readings (device_id, sensor_type, value, unit)
VALUES ('esp32-01', 'temperature', 28.5, 'celsius'),
       ('esp32-01', 'ph', 6.2, 'pH');

SELECT device_id, sensor_type, value, unit, recorded_at
FROM sensor_readings
WHERE device_id = 'esp32-01' AND sensor_type = 'ph'
ORDER BY recorded_at DESC, id DESC;
```

Cari baris `esp32-01` dengan nilai `6.2` dan satuan `pH`. Baris suhu tidak ikut hasil filter. Data di latihan ini dimasukkan lewat SQL. Untuk menyimpan pembacaan yang datang dari API, lanjutkan ke [Dashboard Hands-on](dashboard-hands-on.md).

## Waktu pengukuran dan waktu simpan

`recorded_at` diisi database saat baris dicatat. Jika perangkat menyimpan pembacaan ketika jaringan putus, kiriman bisa tiba jauh setelah pengukuran. Tambahkan kolom `measured_at` pada sistem yang perlu melacak waktu pengukuran sebenarnya.

Jika aplikasi perlu membuat ID berbasis waktu dengan PostgreSQL 18, fungsi bawaannya adalah [`uuidv7()`](https://www.postgresql.org/docs/18/functions-uuid.html). Latihan ini memakai nomor urut dan kolom waktu.
