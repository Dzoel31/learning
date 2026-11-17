# Linux Basics for Deployment

## Kenapa perlu belajar Linux?

Sebagian besar server deployment berjalan di Linux. Jadi, memahami dasar Linux akan sangat membantu saat menjalankan backend, database, dan service pendukung AIoT.

## Konsep dasar yang perlu dipahami

- File system: struktur folder seperti `/home`, `/etc`, `/var`, `/opt`.
- User dan permission: siapa yang boleh baca, tulis, dan eksekusi file.
- Service: aplikasi yang berjalan di background (misal NGINX, database, backend).
- Networking dasar: port, IP, dan koneksi antar-service.

## Command Linux yang sering dipakai

| Kebutuhan | Command |
| --- | --- |
| Cek lokasi saat ini | `pwd` |
| Lihat isi folder | `ls -la` |
| Pindah folder | `cd /path/tujuan` |
| Buat folder | `mkdir nama-folder` |
| Salin file/folder | `cp -r sumber tujuan` |
| Pindah/rename file | `mv lama baru` |
| Hapus file | `rm nama-file` |
| Hapus folder | `rm -r nama-folder` |
| Lihat isi file | `cat nama-file` |
| Edit file via terminal | `nano nama-file` |

## Command untuk monitoring server

| Kebutuhan | Command |
| --- | --- |
| Lihat proses berjalan | `ps aux` |
| Monitor proses real-time | `top` |
| Lihat penggunaan disk | `df -h` |
| Lihat ukuran folder/file | `du -sh *` |
| Cek memory | `free -h` |
| Cek port yang aktif | `ss -tuln` |

## Command service (systemd)

| Kebutuhan | Command |
| --- | --- |
| Cek status service | `sudo systemctl status nginx` |
| Menjalankan service | `sudo systemctl start nginx` |
| Menghentikan service | `sudo systemctl stop nginx` |
| Restart service | `sudo systemctl restart nginx` |
| Aktif saat boot | `sudo systemctl enable nginx` |

## Tips praktik untuk pemula

- Biasakan cek posisi folder dengan `pwd` sebelum menjalankan command.
- Gunakan `ls -la` untuk memastikan file yang akan diubah benar.
- Hati-hati dengan `rm -r` karena bisa menghapus banyak file sekaligus.
- Simpan konfigurasi penting dan lakukan backup sebelum edit.

## Periksa API dari server

Jika dashboard gagal mengambil data, masuk ke server lewat [SSH](ssh-basics.md). Jalankan `ss -tuln` dan cari port 8000. Jika port terlihat, jalankan `curl -i http://127.0.0.1:8000/health`. Port yang terbuka menunjukkan ada proses yang menerima koneksi. Respons HTTP 200 dengan isi yang diharapkan menunjukkan endpoint latihan bisa merespons dari server.

Jika API dijalankan di Docker, lanjutkan ke [pemeriksaan container](docker-container.md#periksa-container-yang-menjalankan-api).
