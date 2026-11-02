# HANDOVER — Branch `ui-mantine` (PR #2)

**Tanggal:** November 2, 2026
**Branch:** `yrbabynisa:ui-mantine` → `itsmegaaa/pdfLan:main`
**Base sekarang:** include PR #1 (security hardening, merged)
**Status:** Draft PR — siap dilanjutkan ke tahap berikutnya

---

## Konteks & tujuan

Goal awal: membawa pdfLan ke **feel Stirling-PDF / iLovePDF dark** — konsisten, a11y-solid, scalable. Root cause masalah UI yang ditemukan di audit:

1. Token desain (`bg-surface`, `text-muted`) dan hex hardcoded (`#131622`, `#8b90b0`, dll) dipakai bersamaan tanpa konsistensi.
2. A11y debt: `<button>` di dalam `<Link>` (ToolCard), `<button>` di dalam `div role=button` (DropZone), kontras ikon rendah.
3. Dua toast library berbeda (`goey-toast` + `sonner`) dipakai ad-hoc.

Solusi: **adopsi Mantine 8** (React 19 compatible, dark mode solid, komponen a11y-correct) secara inkremental tanpa big-bang rewrite.

---

## Yang sudah dikerjakan (4 commit)

### Commit 1 — `6df485d` — Fondasi Mantine
- Install `@mantine/core`, `@mantine/hooks`, `@mantine/notifications`, `postcss-preset-mantine`
- Wrap app root di `MantineProvider defaultColorScheme="dark"` + `<Notifications/>`
- Buat `src/theme.js` (primaryColor `brand`, Zinc surface)
- Fix CSS load order: Tailwind `index.css` **sebelum** Mantine `styles.css` (penting biar Tailwind preflight tidak reset komponen Mantine)

### Commit 2 — `673a6ff` — Test harness + CompressPdf refactor
- Setup Vitest 5 + Testing Library 16 + jsdom 30 (android-arm64 native, support Vite 8)
- Setup file: polyfill `matchMedia` + `ResizeObserver` untuk Mantine di jsdom
- Script `npm run test` + `npm run test:watch` ditambah ke `package.json`
- Ekstrak `CompressionOptions` dari `CompressPdf` jadi exported subcomponent (testable tanpa mount ToolLayout yang berat)
- 6 UI/UX test awal (ErrorBoundary + CompressionOptions)

### Commit 3 — `aa14831` — Theme pixel-match + migrasi komponen
- Theme: brand color scale 10-shade `#e2001a` + Zinc dark surface override → komponen Mantine cocok palette existing
- **ToolCard**: fix `<button>` nested di `<Link>` → favorite jadi `ActionIcon` sibling Link, `aria-label`/`aria-pressed` (a11y fix prioritas)
- **Toast**: goey-toast + sonner → Mantine `notifications` (App.jsx, ToolLayout.jsx, ScanToPdf.jsx); deps dibuang
- **ProtectPdf**: form password → `PasswordInput` + `Checkbox` (a11y label association)
- **UnlockPdf**: hand-rolled toggle → `PasswordInput` (built-in visibility toggle)
- Buang `App.css` (scaffolding Vite orphan)
- 4 test ToolCard a11y ditambah → total 10 test

### Commit 4 — `b3b54e4` — DropZone nested-interactive fix
- CTA `<button>` di dalam `<div role=button>` → `<div aria-hidden>` visual-only
- Outer div (role=button + keyboard handler) yang handle klik — valid HTML/a11y

---

## State saat handover

```
npm run build   → ✅ (vite build clean, Rolldown/Vite 8)
npm run test    → ✅ 10/10 UI/UX tests pass (3 suites)
eslint (files changed) → ✅ clean
```

Pre-existing lint debt di `ToolLayout.jsx` (`Math.random` di render) dan `ScanToPdf.jsx` (ref access) — bukan dari migrasi, diabaikan.

### File yang diubah (19 file)

| File | Perubahan |
|------|-----------|
| `frontend/package.json` | +Mantine deps, +test scripts, -goey-toast/sonner |
| `frontend/package-lock.json` | Update |
| `frontend/postcss.config.js` | +postcss-preset-mantine |
| `frontend/vitest.config.js` | Baru — Vitest config |
| `frontend/src/main.jsx` | +MantineProvider, +Notifications, CSS order fix |
| `frontend/src/theme.js` | Baru — brand + Zinc theme |
| `frontend/src/App.jsx` | -goey-toast, +Mantine Loader, +Mantine notifications |
| `frontend/src/App.css` | **Dihapus** (orphan scaffolding) |
| `frontend/src/components/DropZone.jsx` | Fix nested-interactive CTA |
| `frontend/src/components/ErrorBoundary.jsx` | → Mantine Container/Stack/Title/Button |
| `frontend/src/components/ToolCard.jsx` | Fix button-in-anchor → ActionIcon sibling |
| `frontend/src/components/ToolLayout.jsx` | -goey-toast, +Mantine notifications |
| `frontend/src/pages/tools/CompressPdf.jsx` | → Radio.Group; ekstrak CompressionOptions |
| `frontend/src/pages/tools/ProtectPdf.jsx` | → PasswordInput + Checkbox |
| `frontend/src/pages/tools/UnlockPdf.jsx` | → PasswordInput |
| `frontend/src/pages/tools/ScanToPdf.jsx` | -sonner, +Mantine notifications |
| `frontend/src/test/setup.js` | Baru — jsdom polyfills |
| `frontend/src/test/ErrorBoundary.test.jsx` | Baru — 2 UI/UX test |
| `frontend/src/test/CompressionOptions.test.jsx` | Baru — 4 UI/UX test |
| `frontend/src/test/ToolCard.test.jsx` | Baru — 4 UI/UX test |

---

## Roadmap fase berikutnya (belum dikerjakan)

Item di bawah sudah diidentifikasi tapi **membutuhkan verifikasi visual di browser** atau lebih kompleks:

### Prioritas tinggi (kode-verifiable, gak butuh lihat pixel)
- [ ] **Tool pages form lain**: HtmlToPdf (TextInput URL), WatermarkPdf (TextInput + Slider opacity), PageNumbers (Select format) → pola sama dengan CompressPdf/Protect
- [ ] **DropZone file-grid**: remove button di dalam outer `role=button` — perlu desain ulang interaksi drop-target vs file-card yang lebih bersih

### Prioritas sedang (butuh verifikasi visual)
- [ ] **Theme tweak**: surface shade Mantine mungkin perlu `defaultColorScheme` token adjustment — cek visual `MantineProvider` komponen (Radio, PasswordInput, dll) cocok atau perlu override `theme.colors.dark` shade
- [ ] **Navbar mega-menu**: migrate ke Mantine `Menu`/`HoverCard` (kompleks, banyak state)
- [ ] **Footer**: konsolidasi hex hardcoded → token Tailwind / Mantine vars

### Prioritas rendah / future
- [ ] **ToolLayout besar** (677 baris): migrate Card, tombol aksi, batch list → Mantine primitif
- [ ] **Tailwind 4 + `@mantine/vite` plugin**: opsional setelah migrasi komponen selesai
- [ ] **Storybook + a11y addon**: seperti Stirling-PDF (baseline visual documentation)
- [ ] **Category color-coding**: tiap kategori tool punya accent color signature (iLovePDF pattern)

---

## Cara lanjut

```bash
# Pindah ke branch
git checkout ui-mantine

# Dev server
npm run dev    # frontend, dari folder frontend/
node index.js  # backend, dari folder backend/

# Test UI/UX
cd frontend && npm run test

# Tambah test baru → taruh di src/test/*.test.jsx
# Wrap komponen Mantine dengan MantineProvider di test (lihat setup existing)

# Setelah fase berikutnya siap:
gh pr ready 2 --repo itsmegaaa/pdfLan  # ubah dari draft ke ready
```

---

## Catatan teknis penting

1. **CSS load order wajib dipertahankan** di `main.jsx`:
   ```js
   import './index.css'          // Tailwind (harus duluan)
   import '@mantine/core/styles.css'
   import '@mantine/notifications/styles.css'
   ```
   Kalau dibalik, Tailwind preflight reset komponen Mantine.

2. **Setiap test komponen Mantine wajib dibungkus `MantineProvider`**:
   ```jsx
   const renderWith = (ui) =>
     render(<MantineProvider defaultColorScheme="dark">{ui}</MantineProvider>);
   ```

3. **Jangan pakai utility Tailwind langsung di atas komponen Mantine** — pakai props `classNames` API Mantine atau Tailwind untuk wrapper/layout, bukan untuk styling komponen itu sendiri.

4. **Build via `npm run build` (bukan `npx vite build` langsung)** — Vite 8 pakai Rolldown (Rust) bukan esbuild, jalan di Android/Termux.

---

*Dibuat oleh: yrbabynisa*
*Repo: github.com/itsmegaaa/pdfLan*
*PR: #2 — https://github.com/itsmegaaa/pdfLan/pull/2*
