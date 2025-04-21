Untuk menjalankan aplikasi backend HausJogja, ikuti langkah-langkah berikut:

1. Install dependencies:
   ```
   npm install
   ```

2. Konfigurasi environment variables:
   - Salin file .env.example menjadi .env
   - Sesuaikan DATABASE_URL dengan konfigurasi MySQL Anda

3. Jalankan migrasi database:
   ```
   npx prisma migrate dev
   ```

4. Seed database (opsional):
   ```
   node prisma/seed.js
   ```

5. Jalankan server:
   ```
   npm run dev
   ```

6. Akses dokumentasi Swagger:
   ```
   http://localhost:5000/api-docs
   ```

Struktur Database:
- User: Menyimpan informasi pengguna (admin dan user biasa)
- Category: Menyimpan kategori produk
- Product: Menyimpan informasi produk

Endpoint API:
1. Auth:
   - POST /api/auth/register - Mendaftar pengguna baru
   - POST /api/auth/login - Login pengguna
   - GET /api/auth/profile - Mendapatkan profil pengguna
   - PUT /api/auth/profile - Memperbarui profil pengguna

2. Categories:
   - POST /api/categories - Membuat kategori baru (admin)
   - GET /api/categories - Mendapatkan semua kategori
   - GET /api/categories/:id - Mendapatkan kategori berdasarkan ID
   - PUT /api/categories/:id - Memperbarui kategori (admin)
   - DELETE /api/categories/:id - Menghapus kategori (admin)

3. Products:
   - POST /api/products - Membuat produk baru (admin)
   - GET /api/products - Mendapatkan semua produk
   - GET /api/products/category/:slug - Mendapatkan produk berdasarkan kategori
   - GET /api/products/:slug - Mendapatkan produk berdasarkan slug
   - PUT /api/products/:id - Memperbarui produk (admin)
   - DELETE /api/products/:id - Menghapus produk (admin)
*/