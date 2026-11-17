# Selamat datang di Modul AIoT

!!! note "AI-generated content — perlu validasi ulang"
    Pembaruan materi, ilustrasi, contoh kode, dan lab interaktif ini mencakup konten yang dibuat atau disunting dengan bantuan AI. Maintainer atau pengajar perlu memvalidasi ulang ketepatan konsep, referensi, perhitungan, serta contoh kode sebelum digunakan sebagai acuan. Build situs dan simulasi browser tidak menggantikan pengujian contoh secara menyeluruh atau validasi pada hardware nyata.

AIoT menggabungkan Internet of Things (IoT) dan Artificial Intelligence (AI). Di proyek Smart Hydroponic, misalnya, sensor membaca kondisi tanaman dan larutan nutrisi. Backend menerima data itu, lalu dashboard menampilkannya. Jika kamu ingin memperkirakan perubahan suhu air dari riwayat pembacaan, kamu bisa mulai menguji model prediksi.

Modul KSM AIoT ini membahas cara tiap bagian bekerja dan bagaimana semuanya terhubung, dari perangkat dan komunikasi data sampai aplikasi web dan model AI.

## Mulai belajar

Kalau baru mengenal AIoT, mulai dari [pengantar IoT](iot/overview.md) dan [pengantar AI](ai/overview.md). Saat siap praktik, pilih latihan sesuai minat dan alat yang kamu punya.

| Saya ingin | Mulai dari | Hasil pertama |
| --- | --- | --- |
| Membaca sensor dengan ESP32 | [Siapkan Arduino IDE](getting-started/arduino-ide.md), lalu ikuti [latihan DHT11](hands-on/iot-hands-on.md#rangkaian-pemantau-suhu-dan-kelembapan) | Suhu dan kelembapan muncul di Serial Monitor. |
| Mengirim data tanpa ESP32 | [Backend Mini](hands-on/backend-mini.md), lalu [IoT Simulator Mini](hands-on/iot-simulator-mini.md) | Terminal menampilkan respons dari kiriman sensor. |
| Menampilkan data di browser | [Frontend Mini](hands-on/frontend-mini.md), lalu [Dashboard Hands-on](hands-on/dashboard-hands-on.md) | Tombol memeriksa API, lalu halaman menampilkan pembacaan yang tersimpan. |
| Memilih dan menguji model | [AI Fundamental](ai/fundamental.md), lalu [Machine Learning](ai/machine-learning/overview.md) | Kamu bisa menentukan tujuan prediksi dan menyiapkan cara menilai hasilnya. |
| Menjalankan aplikasi di server | [Cloud & Deployment](deployment/overview.md) | Kamu bisa memeriksa sambungan ke server dan status aplikasi. |

Bab pendamping tersedia di [IoT](iot/overview.md), [Protokol](protocol/overview.md), [Git](version-control/overview.md), [Backend](backend/overview.md), [Frontend](frontend/overview.md), dan [Database](database/overview.md).

Lihat [repositori belajar](https://github.com/IoT-Smart-Hydroponic/learning) atau [panduan kontribusi](guide.md).
