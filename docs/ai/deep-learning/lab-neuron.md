# Lab Pelatihan Neural Network

Ubah input, pilih neuron, lalu perhatikan bagaimana bobot dan bias menggeser titik kerja pada kurva aktivasi. Coba skenario **Saturasi sigmoid** dan **Dead ReLU**, lalu lihat seberapa besar perubahan bobot setelah satu langkah.

<div class="neuron-lab" data-neuron-lab>
  <noscript>Lihat contoh hitung di bab Forward dan Backward Pass jika JavaScript belum aktif.</noscript>
</div>

Playground ini menghitung satu lapisan dengan satu contoh data. Tiap neuron menghitung jumlah berbobot dan bias. Tombol **Langkah gradient descent** memperbarui bobot serta bias semua neuron berdasarkan rata-rata kuadrat kesalahan (MSE). Pada ReLU, lab memakai gradien nol saat \(z \leq 0\).

Untuk membandingkan, pilih **Dead ReLU**, lalu ubah aktivasi ke **Leaky ReLU**. Untuk input negatif, fungsi ini menghasilkan `0,01 × z` dengan turunan 0,01. Langkah berikutnya bisa memperbarui bobot neuron itu. Di titik `z = 0`, lab memakai kemiringan sisi negatif.

Untuk hitungan satu neuron dengan bias tetap, buka [Forward dan Backward Pass](forward-backward.md#hitung-satu-pembaruan-bobot).
