# Feature Status — Next Swimming School

Dokumen ini merangkum fitur yang **sudah diimplementasikan** dan yang **belum dibuat**, berdasarkan blueprint v3 final.

Terakhir diperbarui: 2026-05-13

---

## Sudah Dibuat

### Public Routes
| Route | Keterangan |
|---|---|
| `/` | Landing page (SEO-optimized) |
| `/program` | List program |
| `/program/[slug]` | Detail program |
| `/kontak` | Halaman kontak & lokasi |
| `/tentang` | Halaman tentang |
| `/daftar/member` | Registrasi mandiri member (multi-step) |
| `/daftar/member/sukses` | Konfirmasi setelah registrasi |
| `/login` | Login semua role |
| `/lupa-password` | Forgot password |
| `/reset-password` | Reset password |

### Admin Panel `/a/*`
| Route | Keterangan |
|---|---|
| `/a/dashboard` | Overview cabang (stats, absensi terbaru) |
| `/a/member` | List member |
| `/a/member/[id]` | Detail member (profil, kelas, absensi, rapot, pembayaran) |
| `/a/member/baru` | Tambah member manual |
| `/a/member/registrasi` | List pendaftar menunggu approval |
| `/a/coach` | List coach |
| `/a/coach/[id]` | Detail coach (profil, kelas, sertifikat) |
| `/a/coach/baru` | Tambah coach |
| `/a/coach/sertifikat` | Approval sertifikat coach |
| `/a/kelas` | List kelas |
| `/a/kelas/[id]` | Detail kelas |
| `/a/kelas/baru` | Buat kelas baru |
| `/a/absensi` | Rekap absensi semua member |
| `/a/absensi/manual` | Input absensi manual (izin/sakit) |
| `/a/absensi/coach` | History clock-in coach + suspicious flag |
| `/a/finansial` | Dashboard finansial + list invoice |
| `/a/finansial/[invoice_id]` | Detail invoice + catat pembayaran (incl. tombol Lunas) |
| `/a/finansial/generate` | Generate tagihan bulanan |
| `/a/rapot` | List rapot semua siswa |
| `/a/rapot/[id]` | Detail rapot |
| `/a/rapot/notifikasi` | List rapot yang sudah keluar (WA reminder) |
| `/a/approval` | Hub change request (edit profil member/coach) |
| `/a/reminder` | Kirim WA reminder ke member |
| `/a/semester` | Setting periode semester aktif |
| `/a/admin` | Manajemen akun admin cabang |
| `/a/cabang` | List cabang (admin view) |
| `/a/cabang/[id]` | Detail & edit cabang |
| `/a/log` | Log aktivitas admin |

### Coach Panel `/c/*`
| Route | Keterangan |
|---|---|
| `/c/dashboard` | Overview kelas hari ini, status clock-in |
| `/c/clock-in` | Absen masuk (selfie + GPS + jarak ke cabang) |
| `/c/absensi` | Hub pilih kelas untuk absensi |
| `/c/absensi/[kelas_id]` | Halaman absen aktif (scan QR + checklist manual) |
| `/c/kelas` | List kelas yang diajar |
| `/c/kelas/[id]` | Detail kelas + list member |
| `/c/member` | List semua member binaan |
| `/c/member/[id]` | Detail member + tombol WA |
| `/c/rapot` | List siswa yang perlu/sudah dirapot |
| `/c/rapot/[member_id]` | Form input/edit rapot per member |
| `/c/qr` | QR code coach |
| `/c/profil` | Profil coach + sertifikat |
| `/c/pengaturan` | Ubah password |

### Member Panel `/m/*`
| Route | Keterangan |
|---|---|
| `/m/dashboard` | Overview, kelas mendatang, stats bulan ini |
| `/m/qr` | QR code fullscreen (Wake Lock) |
| `/m/jadwal` | Calendar kelas yang diikuti |
| `/m/absensi` | History absensi + filter date |
| `/m/rapot` | List rapot per semester |
| `/m/rapot/[id]` | Detail rapot |
| `/m/pembayaran` | Info pembayaran |
| `/m/coach` | Info coach + tombol WA |
| `/m/profil` | Lihat & edit profil (edit perlu approval) |
| `/m/pengaturan` | Ubah password |

### Owner Panel `/o/*`
| Route | Keterangan |
|---|---|
| `/o/dashboard` | Helicopter view semua cabang |
| `/o/cabang` | List cabang |
| `/o/cabang/[id]` | Detail & drill down per cabang |
| `/o/cabang/baru` | Tambah cabang baru |
| `/o/log` | Log aktivitas semua admin |

### Server Actions (`lib/actions/`)
| File | Cakupan |
|---|---|
| `auth.ts` | Login, logout, reset password, set/clear role cookies |
| `member.ts` | CRUD member, approve/reject registrasi |
| `coach.ts` | CRUD coach, sertifikat |
| `class.ts` | CRUD kelas, jadwal, coach & member assignment |
| `branch.ts` | CRUD cabang |
| `attendance.ts` | Catat absensi, clock-in coach |
| `finance.ts` | Generate invoice, catat pembayaran |
| `rapot.ts` | Input/edit rapot, submit |
| `change-request.ts` | Approve/reject perubahan profil |
| `public.ts` | Registrasi publik, program listing |

---

## Belum Dibuat

### Admin Panel
| Route / Fitur | Phase | Keterangan |
|---|---|---|
| `/a/calendar` | 3 | Master calendar semua kelas, event, lomba |
| `/a/coach/izin` | 2 | Manage coach izin + assign coach pengganti |
| `/a/member/import` | 2 | Bulk import CSV/XLSX member afiliasi |
| `/a/finansial/pembayaran` | 2 | History pembayaran tersendiri |
| `/a/finansial/laporan` | 3 | Generate laporan keuangan (PDF/XLSX) |
| `/a/event` + `/a/event/[id]` | 3 | Modul event & lomba |
| `/a/rapot/timeline` | 2 | Setting deadline input rapot per semester |
| `/a/cms/berita` | 3 | Kelola berita/artikel |
| `/a/cms/program` | 3 | Kelola program (yang muncul di public) |
| `/a/cms/landing` | 3 | Edit konten landing page |
| `/a/cms/sekolah` | 2 | CRUD sekolah afiliasi |
| `/a/role` | 2 | CRUD role & permission (manager/owner only) |
| `/a/user` | 2 | CRUD user admin cabang (manager only) |
| `/a/export` | 3 | Export data periodik (CSV/XLSX) |
| `/a/cabang-saya` | 2 | Setting cabang (manager-only) |
| Tab **Lomba** di member detail | 3 | History lomba per member |
| Export CSV/XLSX di setiap halaman | 3 | Per-halaman export button |

### Owner Panel
| Route / Fitur | Phase | Keterangan |
|---|---|---|
| `/o/finansial` | 2 | Financial konsolidasi semua cabang |
| `/o/coach` | 2 | Semua coach lintas cabang + assignment |
| `/o/laporan` | 3 | Laporan multi-cabang |
| `/o/export` | 3 | Export multi-cabang |

### School Panel `/s/*` — Belum ada sama sekali
| Route / Fitur | Phase | Keterangan |
|---|---|---|
| `/s/dashboard` | 2 | Overview murid afiliasi sekolah |
| `/s/member` | 2 | List murid afiliasi |
| `/s/member/[id]` | 2 | Detail member (read-only) |
| `/s/rapot` | 2 | List rapot + bulk download PDF |
| `/s/rapot/[id]` | 2 | Detail rapot + download PDF |
| `/s/laporan` | 3 | Laporan periodik attendance |

### Member Panel
| Route / Fitur | Phase | Keterangan |
|---|---|---|
| `/m/lomba` | 3 | History lomba & catatan waktu |
| `/m/notifikasi` | 3 | Inbox notifikasi in-app |
| Banner pembayaran overdue di dashboard | 2 | "Tagihan bulan ini belum dibayar" |
| Review coach setelah rapot | 2 | Rating + komentar ke coach |

### Coach Panel
| Route / Fitur | Phase | Keterangan |
|---|---|---|
| `/c/lomba` | 3 | Input hasil lomba member |
| `/c/notifikasi` | 3 | Inbox notifikasi in-app |

### Sistem / Infrastruktur
| Fitur | Phase | Keterangan |
|---|---|---|
| PDF rapot auto-generate (`@react-pdf/renderer`) | 2 | Generate PDF saat coach submit rapot |
| Notifikasi system (in-app + email Resend) | 3 | Real-time notif + email kategori penting |
| Label afiliasi vs reguler di member list | 2 | Badge tipe member |
| Auto-flag member overdue tanggal 1 | 2 | Cron job / scheduled function |
| Coach pengganti (dari menu izin) | 2 | Akses absen otomatis ke coach pengganti |
| Timeline enforcement rapot (auto-disable) | 2 | Input rapot ditutup setelah deadline |
| PWA (manifest, service worker, install prompt) | 4 | Fase terakhir |
| Push notification | 4 | iOS 16.4+, semua Android |
| Offline absensi fallback | 4 | Background sync via service worker |

---

## Ringkasan Progress

| Panel | Selesai | Total Estimasi | % |
|---|---|---|---|
| Public | 10 route | 10 | ~100% |
| Admin `/a/*` | 27 route | 42 | ~64% |
| Coach `/c/*` | 13 route | 15 | ~87% |
| Member `/m/*` | 10 route | 12 | ~83% |
| Owner `/o/*` | 5 route | 9 | ~56% |
| School `/s/*` | 0 route | 6 | 0% |
| **Total** | **65 route** | **94** | **~69%** |

**Phase 1 (MVP single branch):** ~90% selesai — sisa: label afiliasi, auto-flag overdue, banner pembayaran di dashboard member.

**Phase 2 (Rapot, Afiliasi, Multi-Branch):** ~30% selesai — PDF rapot, School Panel, coach izin/pengganti, timeline rapot belum ada.

**Phase 3 (Event, Reminder, CMS, Export):** ~15% selesai — Reminder hub sudah ada, sisanya belum.

**Phase 4 (PWA):** 0% — sesuai roadmap, dikerjakan terakhir.
