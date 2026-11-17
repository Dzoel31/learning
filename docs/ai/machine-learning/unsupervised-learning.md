# Unsupervised Learning

Unsupervised learning mencari struktur pada data tanpa label target. Model dapat mengelompokkan pola penggunaan energi, menandai pembacaan sensor yang berbeda, atau merangkum banyak fitur ke beberapa dimensi.

```mermaid
flowchart LR
    A[Data tanpa label] --> B[Pilih kemiripan atau struktur]
    B --> C[Model membentuk kelompok atau representasi]
    C --> D[Periksa hasil dengan konteks data]
```

## K-Means

K-Means membagi data menjadi `K` kelompok. Setiap kelompok diwakili centroid, yaitu rata-rata titik anggotanya. Model meminimalkan jumlah jarak kuadrat:

$$
J = \sum_{k=1}^{K}\sum_{x_i \in C_k}\lVert x_i - \mu_k\rVert^2
$$

`C_k` adalah kelompok ke-`k` dan `μ_k` centroidnya. Prosesnya berulang: tempatkan tiap titik ke centroid terdekat, hitung ulang centroid, lalu ulangi sampai penempatan hampir tidak berubah.

![Ilustrasi dua kelompok K-Means dan centroid](../../assets/images/ml-kmeans.svg)

Contoh satu dimensi: data `1, 2, 8, 9` dengan centroid awal `2` dan `8`. Pembagian terdekat menghasilkan `{1, 2}` dan `{8, 9}`. Centroid baru menjadi `(1+2)/2 = 1,5` dan `(8+9)/2 = 8,5`. Semua titik berjarak `0,5` dari centroidnya, sehingga `J = 4 × 0,5² = 1`.

K-Means perlu jumlah kelompok ditentukan di awal dan lebih cocok untuk kelompok yang relatif padat. Hasilnya juga bergantung pada skala fitur dan pemilihan centroid awal.

## DBSCAN

DBSCAN membentuk kelompok dari titik yang punya cukup banyak tetangga dalam radius `ε` (epsilon). `min_samples` menentukan jumlah minimum tetangga untuk menganggap suatu titik sebagai titik inti. Titik yang tidak terhubung ke kelompok mana pun ditandai sebagai noise.

Metode ini dapat menemukan kelompok dengan bentuk tidak bulat dan tidak perlu diberi jumlah kelompok. Hasilnya sensitif terhadap `ε`; fitur dengan skala berbeda sebaiknya distandardisasi lebih dulu. Untuk data berdimensi tinggi, jarak antar titik sering makin sulit dibedakan.

## Hierarchical clustering

Agglomerative clustering memulai dari satu kelompok per titik, lalu berulang kali menggabungkan dua kelompok terdekat. Pilihan *linkage* menentukan jarak antarkelompok: `single` memakai pasangan terdekat, `complete` pasangan terjauh, dan `average` rata-rata jarak.

Dendrogram memperlihatkan urutan penggabungan. Memotong dendrogram pada ketinggian tertentu menghasilkan jumlah kelompok yang berbeda. Metode ini membantu melihat struktur bertingkat, tetapi kebutuhan komputasinya dapat besar untuk dataset yang sangat banyak.

## Gaussian Mixture Model (GMM)

GMM menganggap data berasal dari campuran beberapa distribusi Gaussian. Berbeda dari K-Means yang menetapkan satu kelompok tegas, GMM memberi probabilitas keanggotaan untuk setiap kelompok.

Untuk komponen ke-`k`, probabilitas posteriornya sebanding dengan:

$$
p(k \mid x) = \frac{\pi_k\,\mathcal{N}(x \mid \mu_k, \Sigma_k)}{\sum_j \pi_j\,\mathcal{N}(x \mid \mu_j, \Sigma_j)}
$$

`π_k` adalah bobot komponen, sedangkan `μ_k` dan `Σ_k` adalah rata-rata dan kovariansnya. Jika satu pembacaan mendapat probabilitas `0,55` untuk kondisi A dan `0,45` untuk kondisi B, sistem dapat menandainya sebagai pola yang berada di batas dua kelompok.

## PCA untuk merangkum fitur

Principal Component Analysis (PCA) mengubah fitur berkorelasi menjadi sumbu baru yang saling tegak lurus. Komponen pertama menangkap variasi terbesar, komponen kedua menangkap variasi terbesar berikutnya, dan seterusnya.

Secara matematis, PCA mencari eigenvector dari matriks kovarians data yang sudah dipusatkan. Proyeksi ke `q` komponen ditulis `Z = XW_q`, dengan `W_q` berisi `q` eigenvector terpilih. Mengurangi jumlah komponen dapat membantu visualisasi dan mengurangi ukuran input, tetapi informasi yang dibuang juga bisa memuat sinyal penting.

PCA bukan algoritma clustering: PCA mengubah representasi data, sementara K-Means atau metode lain dapat dijalankan setelahnya. Periksa proporsi variasi yang dipertahankan sebelum memakai hasil reduksi untuk keputusan.

## Memilih metode

Gunakan K-Means jika jumlah kelompok dapat diperkirakan dan kelompoknya cukup kompak. Pilih DBSCAN saat ingin menandai noise dan bentuk kelompok tidak diketahui. Gunakan hierarchical clustering untuk membaca hubungan bertingkat, GMM untuk keanggotaan probabilistik, dan PCA untuk mengurangi dimensi. Nama kelompok tetap perlu ditafsirkan berdasarkan konteks sensor dan operasi.

[Kembali ke Machine Learning](overview.md)
