---

## Hasil Audit Mendalam: PetCare Suite

---

### 🔴 BUG KRITIS — Wajib Diperbaiki Sebelum Deploy

---

**1. `supabase.raw()` tidak ada di Supabase JS v2 — POS AKAN CRASH**

Di `src/features/pos/pos.service.ts` baris 124, 137, dan 187:

```ts
// SALAH — supabase.raw() tidak exist
await supabase.from('product_variants').update({ stock: supabase.raw('stock - ?', [it.quantity]) }).eq('id', it.reference_id);
await supabase.from('customers').update({ loyalty_points: supabase.raw('coalesce(loyalty_points,0) + ?', [earned]) }).eq('id', payload.customer_id);
await supabase.from('customers').update({ loyalty_points: supabase.raw('coalesce(loyalty_points,0) - ?', [points]) }).eq('id', customerId);
```

`supabase.raw()` adalah syntax Knex/PostgREST lama, **tidak ada** di `@supabase/supabase-js` v2. Saat checkout, stock decrement dan loyalty points tidak akan bekerja — bahkan berpotensi melempar exception yang mematikan seluruh transaksi.

**Perbaikan:** Gunakan PostgreSQL function via RPC, atau baca nilai dulu lalu update:
```ts
// Untuk stock decrement — gunakan RPC atau baca dulu:
const { data: variant } = await supabase.from('product_variants').select('stock').eq('id', it.reference_id).single();
await supabase.from('product_variants').update({ stock: (variant.stock - it.quantity) }).eq('id', it.reference_id);

// Lebih baik, buat SQL function di migration:
// CREATE FUNCTION decrement_stock(variant_id uuid, qty int) RETURNS void ...
// Lalu: await supabase.rpc('decrement_stock', { variant_id: ..., qty: ... })
```

---

**2. Kolom `loyalty_discount_amount` tidak ada di migrasi database**

Di `supabase/migrations/012_pos.sql`, tabel `invoices` tidak memiliki kolom `loyalty_discount_amount`. Namun kolom ini diinsert di `pos.service.ts` baris 87, dipakai di `InvoiceDetailPage.tsx`, dan dikirm dari `PosPage.tsx`. Insert akan gagal dengan error kolom tidak ditemukan.

**Perbaikan:** Tambahkan migration baru:
```sql
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS loyalty_discount_amount numeric(12,2) NOT NULL DEFAULT 0;
```

---

**3. Kolom `processed_by` tidak ada di tabel `refunds`**

Di migration `012_pos.sql`, tabel `refunds` punya kolom `created_by`, tapi `pos.service.ts` baris 150 insert dengan field `processed_by`:
```ts
supabase.from('refunds').insert({ invoice_id: invoiceId, amount, reason, processed_by: processedBy })
```

Ini akan error di database.

**Perbaikan:** Ganti `processed_by` → `created_by` di `pos.service.ts`:
```ts
supabase.from('refunds').insert({ invoice_id: invoiceId, amount, reason, created_by: processedBy })
```

---

**4. `handleSupabaseError` tidak diimport di `appointments.service.ts`**

File `src/features/appointments/appointments.service.ts` menggunakan `handleSupabaseError()` di banyak tempat (baris 87, 102, 121, dst.) tapi hanya import:

```ts
import { supabase } from '@/lib/supabase';
import { posService } from '@/features/pos/pos.service';
```

`handleSupabaseError` tidak diimport dari `@/lib/error`. Ini akan menyebabkan **ReferenceError** saat runtime — setiap error Supabase di module appointments akan melempar `handleSupabaseError is not defined`.

**Perbaikan:**
```ts
import { handleSupabaseError } from '@/lib/error';
```

---

**5. TanStack Query v5 breaking changes — semua hooks pakai API v4**

Package yang diinstall adalah `@tanstack/react-query ^5.101.0`, tapi seluruh codebase masih menggunakan API v4:

- `useQuery(['key'], fn, options)` → di v5 harus `useQuery({ queryKey: ['key'], queryFn: fn, ...options })`
- `useMutation(fn, options)` → di v5 harus `useMutation({ mutationFn: fn, ...options })`
- `keepPreviousData: true` → di v5 harus `placeholderData: keepPreviousData` (import dari tanstack)
- `invalidateQueries(['key'])` → di v5 harus `invalidateQueries({ queryKey: ['key'] })`

Ini mempengaruhi **semua hooks** di: appointments, pets, customers, vaccinations, medical-records, monitoring, grooming, inpatient, inventory, petshop, pos, accounting, notifications, settings.

Proyek ini akan **gagal runtime total** — semua halaman yang mengambil data tidak akan berfungsi.

**Opsi 1 (Downgrade):** Ganti ke `"@tanstack/react-query": "^4.36.1"` dan `"@tanstack/react-query-devtools": "^4.36.1"`.

**Opsi 2 (Upgrade semua hooks):** Migrasi semua hooks ke v5 API — lebih banyak pekerjaan tapi lebih disarankan jangka panjang.

---

### 🟠 BUG SIGNIFIKAN — Bisa Menyebabkan Kegagalan Fitur

---

**6. RLS policies di migration 001 dan 018 konflik dan redundan**

`001_core.sql` membuat policies menggunakan `auth.role()` (JWT claim):
```sql
create policy profiles_owner_full on profiles for all using (auth.role() = 'owner')
```

Kemudian `018_rls_audit.sql` membuat policies baru dengan nama berbeda menggunakan subquery `profiles` table:
```sql
create policy if not exists profiles_owner_full on profiles for all using (
  exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'owner')
)
```

Karena `CREATE POLICY IF NOT EXISTS` dengan nama yang sama, policy lama dari 001 tetap aktif. Dengan RLS, bila ada dua policies untuk operasi yang sama, PostgreSQL menerapkan **OR logic** (permissive). Ini bukan bug mematikan tapi menciptakan inkonsistensi — beberapa tabel masih menggunakan `auth.role()` (custom claim yang mungkin tidak di-set), bukan lookup dari tabel `profiles`.

**Rekomendasi:** Buat migration 020 yang drop semua policies lama berbasis `auth.role()` dan konsolidasi ke satu pendekatan (subquery `profiles`).

---

**7. `owner_uploads` table direferensikan di RLS migration tapi tidak ada migration yang membuat tabel ini**

Migration `018_rls_audit.sql` berisi:
```sql
alter table if exists owner_uploads enable row level security;
create policy if not exists owner_uploads_owner_full on owner_uploads ...
```

Tapi tidak ada satupun migration (001-019) yang `CREATE TABLE owner_uploads`. `IF EXISTS` akan membuat perintah ini tidak error, tapi tabel tidak akan pernah ada, sehingga fitur upload foto hewan peliharaan/customer tidak berfungsi.

**Perbaikan:** Buat migration baru:
```sql
CREATE TABLE IF NOT EXISTS owner_uploads (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references customers(id) on delete cascade,
  pet_id uuid references pets(id) on delete cascade,
  url text not null,
  file_name text,
  uploaded_at timestamptz not null default now()
);
```

---

**8. `inpatient_medications` dan `inpatient_services` direferensikan di service tapi tidak ada di migration**

Di `pos.service.ts` `getInpatientPendingBill()`:
```ts
const meds = await supabase.from('inpatient_medications').select('id,name,unit_price,quantity')...
const services = await supabase.from('inpatient_services').select('id,name,price')...
```

Migration `008_inpatient.sql` hanya membuat `inpatient_medication_schedules` (bukan `inpatient_medications`) dan tidak ada tabel `inpatient_services`. Query ini akan selalu mengembalikan error atau data kosong — fitur load inpatient bill ke POS tidak akan bekerja.

---

**9. Module store mengambil dari `settings.key = 'modules'` tapi seed mengisi di tabel `modules`**

`module.store.ts` melakukan:
```ts
supabase.from('settings').select('value').eq('key', 'modules').single()
```

Tapi `seed.sql` mengisi tabel `modules` (tabel terpisah), dan `settings` hanya diisi dengan `clinic_profile`, `business_hours`, dll. — tidak ada entry dengan key `'modules'` di tabel `settings`.

Akibatnya, `fetchModuleStatus()` selalu gagal atau return null, lalu jatuh ke `defaultModules` hardcoded. `ModuleGuard` tidak pernah benar-benar menggunakan status aktual dari database.

**Perbaikan:** Ubah `module.store.ts` untuk membaca dari tabel `modules`:
```ts
const { data, error } = await supabase.from('modules').select('key, is_enabled');
const status = (data || []).reduce((acc, row) => ({ ...acc, [row.key]: row.is_enabled }), defaultModules);
set({ modules: parseModuleStatus(status), isLoading: false });
```

---

**10. `appointment_id` tidak diisi di seed/creation flow — foreign key nullable tapi query join tidak handle null**

Di `appointmentsService.updateAppointmentStatus()`, saat status `completed`, dibuat invoice draft dengan `appointment_id: id`. Tapi jika appointment di-complete lebih dari sekali (race condition), cek `alreadyExists` menggunakan:
```ts
const reservation = await supabase.from('invoices').select('id').eq('appointment_id', id).limit(1);
const alreadyExists = Array.isArray(reservation.data) ? reservation.data.length > 0 : !!reservation.data;
```

Jika query error (misalnya RLS block), `reservation.data` bisa null dan `!!null = false`, sehingga akan mencoba membuat invoice duplikat dan melanggar constraint `unique(invoice_number)` jika number sama.

---

### 🟡 MASALAH DEPLOYMENT & KONFIGURASI

---

**11. `nodemailer` dan `pdfkit` ada di `dependencies` (bukan devDependencies) tapi hanya dipakai di Edge Functions/server**

`package.json` memasukkan `nodemailer`, `pdfkit`, dan `qrcode` sebagai runtime dependencies padahal digunakan di `supabase/functions/` (Deno environment) dan `server/vaccine-cert-server.cjs` (Node server terpisah). Ini membengkakkan bundle frontend meskipun tidak diimport langsung, dan Vite mungkin mencoba resolve modul Node-only ini.

---

**12. Edge Functions menggunakan `process.env` tapi Supabase Edge Functions (Deno) tidak punya `process`**

Di `supabase/functions/generate-pdf/index.ts`:
```ts
const supabaseUrl = process.env.SUPABASE_URL;
```

Supabase Edge Functions berjalan di Deno, bukan Node. Harus menggunakan:
```ts
const supabaseUrl = Deno.env.get('SUPABASE_URL');
```

Semua Edge Functions (`generate-pdf`, `send-email`, `send-whatsapp`, `generate-queue`) perlu diperbaiki.

---

**13. Login form tidak menggunakan HTML `<form>` + `onSubmit` — Enter key tidak berfungsi**

Di `LoginPage.tsx`, form menggunakan `<Button type="button" onClick={handleSignIn}>` bukan `<form onSubmit={handleSubmit}><Button type="submit">`. Ada workaround `handleSignIn` yang memanggil `handleSubmit(undefined as any)` yang akan crash karena `event.preventDefault()` dipanggil di undefined. Hal yang sama di `ResetPasswordPage.tsx`.

Pengguna tidak bisa login dengan menekan Enter.

**Perbaikan:**
```tsx
<form onSubmit={handleSubmit}>
  ...
  <Button type="submit" disabled={isLoading}>Sign in</Button>
</form>
```

---

**14. `vercel.json` tidak memiliki security headers**

Tidak ada `X-Frame-Options`, `X-Content-Type-Options`, `Content-Security-Policy`, atau `Strict-Transport-Security`. Untuk aplikasi klinik dengan data medis, ini penting.

---

**15. `QueryClient` dibuat tanpa konfigurasi retry/error handling**

```ts
const queryClient = new QueryClient();
```

Tanpa `defaultOptions`, TanStack Query akan retry 3x untuk setiap failed query (termasuk 401/403), mengirimkan 3x request yang tidak perlu ke Supabase.

**Perbaikan:**
```ts
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (count, error: any) => error?.code !== '42501' && error?.code !== 'PGRST116' && count < 2,
      staleTime: 30_000,
    }
  }
});
```

---

### 🔵 MASALAH DATABASE/SCHEMA

---

**16. RLS policies `012_pos.sql` masih menggunakan `auth.role()` (lama)**

Tabel `invoices`, `invoice_items`, `refunds` masih pakai:
```sql
create policy invoices_staff_full on invoices for all using (auth.role() = 'staff')
```

Ini berbeda dengan pendekatan baru di 018 yang menggunakan subquery. Inkonsistensi ini menyebabkan masalah permission jika JWT claims tidak di-set.

---

**17. Tidak ada index pada kolom `customer_id` di tabel-tabel utama**

Tabel `appointments`, `invoices`, `pets` tidak memiliki index eksplisit pada `customer_id`. Dengan volume data besar, query filter by customer akan lambat. Tambahkan:
```sql
CREATE INDEX IF NOT EXISTS idx_appointments_customer_id ON appointments(customer_id);
CREATE INDEX IF NOT EXISTS idx_invoices_customer_id ON invoices(customer_id);
CREATE INDEX IF NOT EXISTS idx_pets_customer_id ON pets(customer_id);
```

---

**18. `queue_number` di tabel `appointments` adalah `int`, tapi di code ditreat sebagai string**

`mapAppointment()` melakukan `String(record.queue_number)` tapi filter di `getAppointments()` menggunakan `queue_number.ilike.${term}` yang tidak akan bekerja pada kolom integer di PostgREST.

---

### Ringkasan Prioritas Perbaikan

| # | Masalah | Dampak |
|---|---------|--------|
| 1 | `supabase.raw()` tidak exist | POS crash saat checkout |
| 2 | Kolom `loyalty_discount_amount` hilang | Invoice creation gagal |
| 3 | Field `processed_by` vs `created_by` | Refund gagal |
| 4 | `handleSupabaseError` tidak diimport di appointments | Semua error appointments crash |
| 5 | TanStack Query v5 API mismatch | Semua halaman tidak bisa fetch data |
| 6 | `owner_uploads` table tidak ada | Fitur upload tidak exist |
| 7 | `inpatient_medications`/`services` table tidak ada | Load inpatient bill ke POS gagal |
| 8 | Module store baca dari settings bukan tabel modules | Module guard selalu pakai default |
| 9 | Edge Functions pakai `process.env` (Deno tidak punya) | Semua Edge Functions crash |
| 10 | Login form tidak submit via Enter | UX rusak |
