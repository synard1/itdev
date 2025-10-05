# Proyek ITDEV

Repositori ini berisi kumpulan proyek-proyek Node.js yang dibuat untuk demonstrasi dan eksplorasi, dengan fokus pada integrasi dengan Google Gemini API.

---

## Daftar Proyek

1.  **[Gemini API Showcase (`1-express`)](#1-gemini-api-showcase-1-express)**: Backend service untuk mendemonstrasikan berbagai fitur non-percakapan dari Gemini API.
2.  **[Gemini Web Chatbot (`2-chatbot`)](#2-gemini-web-chatbot-2-chatbot)**: Aplikasi chatbot berbasis web yang interaktif dan lengkap, dengan frontend dan backend-nya sendiri.

---

## 1. Gemini API Showcase (`1-express`)

Proyek ini adalah server backend yang dibangun menggunakan Node.js dan Express.js. Tujuannya adalah untuk menunjukkan berbagai kemampuan Google Gemini API di luar konteks percakapan.

### Fitur Utama (Endpoints)

Server ini menyediakan beberapa endpoint yang dapat diuji menggunakan tools seperti Postman atau cURL:

-   `POST /generate-text`: Menghasilkan teks berdasarkan prompt.
-   `POST /generate-from-image`: Menghasilkan teks berdasarkan gambar dan prompt.
-   `POST /generate-from-document`: Meringkas atau menjawab pertanyaan dari sebuah dokumen.
-   `POST /generate-from-audio`: Membuat transkrip dari file audio.

### Persiapan dan Instalasi

1.  **Masuk ke direktori proyek:**
    ```bash
    cd 1-express
    ```

2.  **Install semua dependensi:**
    ```bash
    npm install
    ```

3.  **Konfigurasi Environment Variable:**
    Buat file baru bernama `.env` di dalam direktori `1-express`. Kemudian, tambahkan API Key Anda:
    ```
    GENAI_API_KEY="MASUKKAN_API_KEY_ANDA_DISINI"
    ```

4.  **Jalankan Server:**
    ```bash
    node index.js
    ```
    Server akan berjalan di `http://localhost:3000`.

---

## 2. Gemini Web Chatbot (`2-chatbot`)

Ini adalah aplikasi chatbot berbasis web yang lengkap dan fungsional. Proyek ini mencakup backend Node.js/Express yang menangani logika percakapan dengan Gemini API dan frontend HTML/CSS/JavaScript untuk antarmuka pengguna.

### Fitur Utama

-   Antarmuka chat yang interaktif dan responsif.
-   Menyimpan riwayat percakapan selama sesi.
-   Pengguna dapat memasukkan API Key Gemini mereka sendiri, yang akan disimpan di `localStorage` browser.
-   Mendukung dan merender respons dalam format HTML dari bot untuk tampilan yang lebih kaya.
-   Validasi input untuk mencegah pengiriman data JSON yang tidak valid.

### Persiapan dan Instalasi

1.  **Masuk ke direktori proyek:**
    ```bash
    cd 2-chatbot
    ```

2.  **Install semua dependensi:**
    ```bash
    npm install
    ```

3.  **Konfigurasi Environment Variable (Opsional):**
    Anda dapat membuat file `.env` di dalam direktori `2-chatbot` untuk menyediakan API key cadangan (fallback).
    ```
    GENAI_API_KEY="MASUKKAN_API_KEY_ANDA_DISINI"
    ```
    Jika file ini tidak ada, aplikasi akan tetap berjalan dan meminta pengguna untuk memasukkan API key di antarmuka web.

4.  **Jalankan Server:**
    ```bash
    node index.js
    ```
    Server akan berjalan di `http://localhost:3000` (atau port lain jika 3000 sudah digunakan).

5.  **Buka Aplikasi:**
    Buka browser Anda dan kunjungi `http://localhost:3000` untuk mulai menggunakan chatbot.