export type Kategori = 'Electric' | 'Akustik' | 'Classic';

export interface ToneProfile {
  kecerahan: number; // brightness, 0-100
  kehangatan: number; // warmth, 0-100
  sustain: number; // 0-100
}

export interface Spesifikasi {
  body: string;
  top: string;
  neck: string;
  fingerboard: string;
  senar: string;
  pickup?: string;
}

export interface Produk {
  id: number;
  nama: string;
  harga: number;
  hargaCoret: number | null;
  stok: number;
  foto: string;
  kategori: Kategori;
  rating: number;
  terlaris: boolean;
  terjual: number;
  deskripsi: string;
  spesifikasi: Spesifikasi;
  tone: ToneProfile;
}

// Single source of truth. Dashboard dan halaman detail sama-sama import dari sini
// supaya id, harga, stok, dll tidak pernah beda antara dua halaman.
export const PRODUCTS: Produk[] = [
  {
    id: 1,
    nama: 'Cort AC100 E OP',
    harga: 2000000,
    hargaCoret: null,
    stok: 90,
    foto: '/Cort AC100 E OP.jpg',
    kategori: 'Akustik',
    rating: 4.6,
    terlaris: false,
    terjual: 128,
    deskripsi:
      'Body mahoni solidnya memberi bass yang padat tanpa terasa berat, cocok untuk yang baru pindah dari akustik biasa ke panggung kecil. Preamp bawaan membuatnya siap colok ke ampli kapan saja.',
    spesifikasi: {
      body: 'Mahogany',
      top: 'Solid Spruce',
      neck: 'Mahogany',
      fingerboard: 'Rosewood',
      senar: 'Steel string, gauge 12',
      pickup: 'Fishman Presys-style EQ',
    },
    tone: { kecerahan: 55, kehangatan: 75, sustain: 60 },
  },
  {
    id: 2,
    nama: 'Yamaha APX500ii',
    harga: 1500000,
    hargaCoret: 1800000,
    stok: 80,
    foto: '/Yamaha apx 500ii.jpg',
    kategori: 'Akustik',
    rating: 4.8,
    terlaris: true,
    terjual: 342,
    deskripsi:
      'Bodinya tipis dan ringan, dirancang buat yang sering manggung dan butuh gitar yang nyaman digendong berjam-jam. Suaranya cerah dan jernih lewat sound hole yang lebih besar dari akustik pada umumnya.',
    spesifikasi: {
      body: 'Nato, thin-line cutaway',
      top: 'Spruce',
      neck: 'Nato',
      fingerboard: 'Rosewood',
      senar: 'Steel string, gauge 11',
      pickup: 'System66 pickup/preamp',
    },
    tone: { kecerahan: 65, kehangatan: 60, sustain: 55 },
  },
  {
    id: 3,
    nama: 'Sanjaya JR',
    harga: 500000,
    hargaCoret: null,
    stok: 70,
    foto: '/Sanjaya JR.jpg',
    kategori: 'Classic',
    rating: 4.2,
    terlaris: false,
    terjual: 54,
    deskripsi:
      'Ukuran 3/4 yang pas untuk anak-anak atau pemula yang tangannya belum terbiasa dengan neck penuh. Senar nylon-nya lembut di jari, ramah untuk jam latihan pertama.',
    spesifikasi: {
      body: 'Linden, 3/4 size',
      top: 'Linden',
      neck: 'Nato',
      fingerboard: 'Rosewood',
      senar: 'Nylon, tensi rendah',
    },
    tone: { kecerahan: 30, kehangatan: 80, sustain: 40 },
  },
  {
    id: 4,
    nama: 'Yamaha A5R - A',
    harga: 1000000,
    hargaCoret: null,
    stok: 100,
    foto: '/Yamaha A5R.jpg',
    kategori: 'Akustik',
    rating: 4.7,
    terlaris: true,
    terjual: 210,
    deskripsi:
      'Rosewood di sisi dan belakang bodi memberi karakter hangat dengan sustain yang lebih panjang, favorit untuk fingerstyle. Sistem A.R.T. bawaan menjaga suara akustik aslinya tetap natural saat diamplifikasi.',
    spesifikasi: {
      body: 'Rosewood',
      top: 'Solid Sitka Spruce',
      neck: 'Mahogany',
      fingerboard: 'Rosewood',
      senar: 'Steel string, gauge 12',
      pickup: 'Yamaha A.R.T. pickup system',
    },
    tone: { kecerahan: 60, kehangatan: 85, sustain: 70 },
  },
  {
    id: 5,
    nama: 'Taylor JCSM-5',
    harga: 950000,
    hargaCoret: null,
    stok: 200,
    foto: '/Taylor JCSM.jpg',
    kategori: 'Akustik',
    rating: 4.5,
    terlaris: false,
    terjual: 97,
    deskripsi:
      'Grand concert body membuat gitar ini seimbang antara proyeksi suara dan kenyamanan bermain lama. Cocok untuk yang suka strumming maupun fingerpicking bergantian.',
    spesifikasi: {
      body: 'Sapele',
      top: 'Solid Spruce',
      neck: 'Sapele',
      fingerboard: 'Ebony',
      senar: 'Steel string, gauge 12',
    },
    tone: { kecerahan: 68, kehangatan: 65, sustain: 62 },
  },
  {
    id: 6,
    nama: 'Taylor Sunset Blv',
    harga: 2500000,
    hargaCoret: 2900000,
    stok: 50,
    foto: '/Taylor Sunset bidv.jpg',
    kategori: 'Akustik',
    rating: 4.9,
    terlaris: true,
    terjual: 188,
    deskripsi:
      'Salah satu seri premium dengan top spruce yang sudah "terbuka" karakternya sejak baru. Proyeksi suara besar, cocok untuk direkam maupun tampil akustik solo di panggung besar.',
    spesifikasi: {
      body: 'Layered Rosewood',
      top: 'Solid Sitka Spruce',
      neck: 'Tropical Mahogany',
      fingerboard: 'Ebony',
      senar: 'Steel string, gauge 12',
      pickup: 'Expression System 2',
    },
    tone: { kecerahan: 72, kehangatan: 70, sustain: 78 },
  },
  {
    id: 7,
    nama: 'Fores MG -5',
    harga: 3400000,
    hargaCoret: null,
    stok: 40,
    foto: '/Fores MG -5.jpg',
    kategori: 'Classic',
    rating: 4.4,
    terlaris: false,
    terjual: 61,
    deskripsi:
      'Klasik ukuran penuh dengan top solid cedar yang matang dan lembut, favorit untuk repertoar klasik maupun bossa nova. Neck lebar khas gitar klasik memberi ruang lebih untuk teknik jari.',
    spesifikasi: {
      body: 'Rosewood',
      top: 'Solid Cedar',
      neck: 'Cedro, lebar klasik 52mm',
      fingerboard: 'Rosewood',
      senar: 'Nylon, tensi normal',
    },
    tone: { kecerahan: 35, kehangatan: 82, sustain: 45 },
  },
  {
    id: 8,
    nama: 'Casual Z Yamaha',
    harga: 4200000,
    hargaCoret: 4800000,
    stok: 30,
    foto: '/Casual Z Yamaha.jpg',
    kategori: 'Electric',
    rating: 4.7,
    terlaris: false,
    terjual: 76,
    deskripsi:
      'Dual humbucker dengan output tinggi, dibuat untuk yang main distorsi berat maupun clean tone berkarakter. Neck tipis memudahkan permainan cepat dan bending panjang.',
    spesifikasi: {
      body: 'Alder',
      top: 'Flame Maple veneer',
      neck: 'Maple, bolt-on',
      fingerboard: 'Rosewood',
      senar: 'Nickel wound, gauge 09',
      pickup: 'Dual humbucker, coil-split',
    },
    tone: { kecerahan: 85, kehangatan: 40, sustain: 88 },
  },
  {
    id: 9,
    nama: 'Kolvers MG -4',
    harga: 5000000,
    hargaCoret: null,
    stok: 95,
    foto: '/gitar.jpg',
    kategori: 'Electric',
    rating: 4.3,
    terlaris: false,
    terjual: 43,
    deskripsi:
      'Konfigurasi HSS memberi fleksibilitas dari suara vintage single-coil sampai humbucker galak untuk lead. Tremolo bridge terpasang untuk yang suka teknik dive bomb ringan.',
    spesifikasi: {
      body: 'Basswood',
      top: '-',
      neck: 'Maple, bolt-on',
      fingerboard: 'Maple',
      senar: 'Nickel wound, gauge 09',
      pickup: 'HSS, tremolo bridge',
    },
    tone: { kecerahan: 80, kehangatan: 45, sustain: 82 },
  },
];

export function getProdukById(id: number): Produk | undefined {
  return PRODUCTS.find((p) => p.id === id);
}

export function getSerupa(produk: Produk, limit = 3): Produk[] {
  return PRODUCTS.filter((p) => p.kategori === produk.kategori && p.id !== produk.id).slice(0, limit);
}
