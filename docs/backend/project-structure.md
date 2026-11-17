# Struktur Proyek Backend

Saat latihan pertama, satu file `main.js` cukup untuk melihat route dan response bersama-sama. Ketika aplikasi bertambah, pisahkan tugas agar aturan API, validasi, dan query database mudah ditemukan.

## Contoh susunan folder

```text
mini_backend/
├── src/
│   ├── app.js
│   ├── server.js
│   ├── routes/
│   │   └── sensor-routes.js
│   ├── controllers/
│   │   └── sensor-controller.js
│   ├── services/
│   │   └── sensor-service.js
│   └── repositories/
│       └── sensor-repository.js
├── .env
├── .gitignore
└── package.json
```

Nama dan jumlah folder dapat berbeda antarproyek. Ini peta untuk membantu membaca kode, bukan aturan yang wajib diikuti.

| Bagian | Tugas |
| --- | --- |
| `server.js` | menyalakan server dan memilih port |
| `app.js` | membuat aplikasi Express dan memasang middleware |
| `routes/` | memetakan method dan path ke handler |
| `controllers/` | membaca request dan membentuk response |
| `services/` | menjalankan aturan aplikasi |
| `repositories/` | membaca atau menulis database |
| `.env` | menyimpan konfigurasi lokal yang tidak dikomit |

## Ikuti satu request

```mermaid
flowchart LR
    A[POST /sensors] --> B[Route]
    B --> C[Validasi]
    C --> D[Controller]
    D --> E[Service]
    E --> F[Repository]
    F --> G[(PostgreSQL)]
    G --> H[Response JSON]
```

Pada [Backend Mini](../hands-on/backend-mini.md), semua langkah masih berada di `main.js`. Saat membaca proyek yang lebih besar, ikuti endpoint `POST /sensors` dari route sampai repository. Jangan menganggap suatu lapisan dipakai sebelum melihat pemanggilannya.

Pemisahan ini juga berlaku pada FastAPI, meskipun nama file dan cara validasinya berbeda. Lihat [padanan Express.js dan FastAPI](express-fastapi-bridge.md).
