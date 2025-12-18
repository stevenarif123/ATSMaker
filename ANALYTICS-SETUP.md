# 📊 Panduan Setup Analytics dengan Firebase

## Langkah 1: Buat Project Firebase (Jika Belum Ada)

1. Buka [Firebase Console](https://console.firebase.google.com/)
2. Klik "Add project" atau gunakan project yang sudah ada
3. Ikuti wizard pembuatan project

## Langkah 2: Setup Firestore Database

1. Di Firebase Console, pilih project Anda
2. Klik **Build** > **Firestore Database**
3. Klik **Create database**
4. Pilih **Start in test mode** (kita akan set rules nanti)
5. Pilih lokasi database (pilih yang terdekat dengan user Anda, misal: asia-southeast2 untuk Indonesia)
6. Klik **Done**

## Langkah 3: Setup Firestore Security Rules

1. Di Firestore Database, klik tab **Rules**
2. Copy dan paste rules berikut:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /atsmaker_visits/{document=**} {
      allow read: if true;
      allow write: if true;
    }
    match /atsmaker_daily_stats/{document=**} {
      allow read: if true;
      allow write: if true;
    }
    match /atsmaker_page_views/{document=**} {
      allow read: if true;
      allow write: if true;
    }
    match /atsmaker_actions/{document=**} {
      allow read: if true;
      allow write: if true;
    }
    match /atsmaker_countries/{document=**} {
      allow read: if true;
      allow write: if true;
    }
  }
}
```

3. Klik **Publish**

## Langkah 4: Dapatkan Firebase Config

1. Di Firebase Console, klik ⚙️ **Settings** > **Project settings**
2. Scroll ke bawah ke bagian **Your apps**
3. Klik icon **</>** (Web) untuk menambah web app
4. Beri nama app (misal: "ATS Maker")
5. Klik **Register app**
6. Copy konfigurasi Firebase yang muncul

## Langkah 5: Setup Environment Variables

1. Buat file `.env.local` di root project
2. Isi dengan konfigurasi Firebase Anda:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123

NEXT_PUBLIC_ADMIN_PASSWORD=YourSecurePassword123
```

## Langkah 6: Build dan Deploy

```bash
npm run build
```

Upload folder `out/` ke hosting Anda.

---

## 📈 Mengakses Dashboard Analytics

Buka: `https://yoursite.com/atsmaker/admin`

Login dengan password yang Anda set di `NEXT_PUBLIC_ADMIN_PASSWORD`.

---

## 📊 Metrik yang Di-track

| Metrik | Deskripsi |
|--------|-----------|
| Total Kunjungan | Semua page views |
| Pengunjung Unik | Per hari, berdasarkan localStorage |
| PDF Export | Resume dan cover letter |
| DOCX Export | Resume dan cover letter |
| Resume Dibuat | Jumlah resume version baru |
| Cover Letter | Jumlah cover letter dibuat |
| Negara | Berdasarkan IP address pengunjung |

---

## 🌍 Deteksi Lokasi

Lokasi pengunjung dideteksi menggunakan:
1. **Primary**: ip-api.com (gratis, 45 req/menit)
2. **Fallback**: ipapi.co (jika primary gagal)

Data yang disimpan:
- Nama negara
- Kode negara (untuk flag emoji)
- Kota (opsional)
- Region (opsional)

---

## ⚠️ Catatan Penting

1. **Privacy**: Tidak ada data personal yang disimpan (nama, email, dll)
2. **GDPR**: Untuk compliance penuh, tambahkan cookie consent
3. **Rate Limiting**: ip-api.com memiliki limit 45 request/menit
4. **Biaya**: Firestore free tier cukup untuk ~50K reads/day

---

## 🔒 Keamanan

- Visitor ID disimpan di localStorage browser
- Password admin di-hash di client-side
- Firestore rules membatasi akses ke collection analytics saja
- Tidak ada autentikasi Firebase yang diperlukan untuk tracking
