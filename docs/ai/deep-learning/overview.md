# Deep Learning

Mulai dengan jaringan kecil yang memprediksi satu nilai dari data sensor. Siapkan satu tabel pembacaan, bagi data berdasarkan waktu, lalu bandingkan hasil jaringan dengan tebakan sederhana seperti nilai terakhir.

## Prasyarat

Ikuti [Masalah dan Data](../machine-learning/masalah-dan-data.md), [Preprocessing](../machine-learning/preprocessing.md), dan [Evaluasi Model](../machine-learning/evaluasi-model.md). Siapkan Python dan pahami fungsi, list, serta operasi aritmetika dasar.

## Urutan Materi

1. [Dasar Neural Network](dasar-neural-network.md) memperkenalkan bobot, bias, dan bentuk input.
2. [Fungsi Aktivasi](activation-function.md) menjelaskan perubahan nilai masukan di tiap neuron.
3. [Forward dan Backward Pass](forward-backward.md) mengikuti satu prediksi sampai bobot diperbarui.
4. [Loss Function](loss-function.md) mengukur selisih prediksi dan target.
5. [Optimasi dan Training](optimasi-dan-training.md) membandingkan hasil pelatihan dan validasi.
6. [Arsitektur MLP](arsitektur-mlp.md) menyusun jaringan untuk data berbentuk tabel.

Gunakan [TensorFlow, Keras, dan PyTorch](frameworks.md) untuk mengenali library yang dipakai pada contoh model. Jika tugasnya membaca pola lokal pada gambar atau sinyal, lanjutkan ke [CNN](cnn.md). Jika prediksi bergantung pada beberapa pembacaan sebelumnya, baca [Model Sequence](model-sequence.md).

Setelah menyelesaikan materi, coba [Lab Pelatihan Neural Network](lab-neuron.md) untuk mengubah bobot dan melihat pengaruhnya pada prediksi.

## Topik lanjutan

Deteksi anomali tanpa banyak label, penggabungan gambar dan sensor, serta pengukuran kinerja model di perangkat edge bisa dipelajari setelah punya hasil pembanding. Untuk deployment, ukur waktu prediksi dan penggunaan memori pada perangkat tujuan.

[Kembali ke Overview AI](../overview.md)
