# Dari Latihan ke Proyek AIoT Nyata

Di [Dashboard Hands-on](dashboard-hands-on.md), tombol **Refresh** membaca hasil `GET /sensors`. Di Smart Hydroponic, dashboard membaca data hidroponik terbaru. Ikuti nilai pH dari database sampai muncul pada kartu dashboard.

## Ikuti satu pembacaan pH

1. Di [route hidroponik](https://github.com/ksm-aiot-upnvj/smart-hydroponic/blob/c747d66fec590d8f6bb4e78660f5f8ac66e18bba/backend/routes/hydroponic_routes.py), temukan `get_latest_hydroponic_data`. Gabungkan awalan router `/hydroponics` dengan rute `/data/latest` untuk mendapat alamat yang dipanggil.
2. Di [HydroponicService](https://github.com/ksm-aiot-upnvj/smart-hydroponic/blob/c747d66fec590d8f6bb4e78660f5f8ac66e18bba/backend/services/hydroponic_service.py), temukan `get_latest_data`. Query memilih satu baris terakhir dari tabel `hydroponic_data`, berdasarkan urutan `dataid`.
3. Di [Dashboard.vue](https://github.com/ksm-aiot-upnvj/smart-hydroponic/blob/c747d66fec590d8f6bb4e78660f5f8ac66e18bba/frontend-vue/src/views/Dashboard.vue), cari `refreshLatestMetrics`. Fungsi memanggil API dan memakai `data.ph` untuk memperbarui tampilan dengan dua angka desimal.

## Periksa hasil bacaanmu

Jika tabel latihan kosong, `GET /sensors` mengembalikan daftar kosong. Di versi Smart Hydroponic yang ditautkan, apa respons ketika data terbaru belum tersedia? Cari cabang `data is None` pada route. Jawabannya adalah status HTTP **204**, sehingga tidak ada badan respons yang berisi pembacaan pH.
