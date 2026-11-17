# Konflik pada Git

Git menghentikan merge atau rebase ketika dua perubahan tidak bisa digabungkan otomatis. Misalnya, di cabang `dashboard` label grafik berubah menjadi “Suhu air”, sedangkan di `main` baris yang sama berubah menjadi “Temperatur air”.

## Menyelesaikan Konflik

1. Jalankan `git status` untuk melihat operasi yang sedang berjalan dan berkas yang perlu diperbaiki.
2. Buka berkas yang disebut Git. Pada konflik teks, bagian di antara penanda diberi dua versi.

   ```text
   <<<<<<< HEAD
   label = "Suhu air"
   =======
   label = "Temperatur air"
   >>>>>>> main
   ```

3. Tulis hasil yang ingin dipertahankan, misalnya `label = "Suhu air (°C)"`. Hapus penanda dan pastikan aplikasinya masih menampilkan label yang benar.
4. Jalankan `git add <nama-file>`. Ulangi untuk berkas lain, lalu baca `git status` lagi.
5. Lanjutkan operasi yang ditampilkan Git. Gunakan `git merge --continue` untuk merge atau `git rebase --continue` untuk rebase.

Jika perlu kembali ke keadaan sebelum operasi, pilih perintah yang sesuai, `git merge --abort` atau `git rebase --abort`. Periksa perubahan lokal dengan `git status` sebelum memulai operasi berikutnya.

Lanjutkan ke [Remote Repositories](remote-repositories.md#perbedaan-antara-git-fetch-dan-git-pull) untuk melihat kapan cabang lokal dan remote perlu diselaraskan.
