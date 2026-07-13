// app/lib/customers.ts
// Seed data pelanggan — struktur ini didesain 1:1 supaya mudah diganti
// dengan hasil fetch() dari API/database sungguhan nantinya.

export type StatusPelanggan = 'Aktif' | 'Nonaktif';

export interface Customer {
  id: number;
  nama: string;
  email: string;
  telepon: string;
  alamat: string;
  avatar: string; // URL foto profil, boleh kosong string ''
  totalPesanan: number;
  totalBelanja: number;
  status: StatusPelanggan;
  vip?: boolean;
  bergabung: string; // ISO date string, contoh '2024-11-02'
}

export const CUSTOMERS: Customer[] = [
  {
    id: 1,
    nama: 'Raka Pratama',
    email: 'raka.pratama@gmail.com',
    telepon: '081234567890',
    alamat: 'Jl. Merdeka No. 12, Bandung',
    avatar: '',
    totalPesanan: 14,
    totalBelanja: 28500000,
    status: 'Aktif',
    vip: true,
    bergabung: '2023-08-14',
  },
  {
    id: 2,
    nama: 'Dinda Ayu Lestari',
    email: 'dinda.ayu@gmail.com',
    telepon: '082198765432',
    alamat: 'Jl. Cihampelas No. 45, Bandung',
    avatar: '',
    totalPesanan: 6,
    totalBelanja: 9800000,
    status: 'Aktif',
    vip: false,
    bergabung: '2024-02-20',
  },
  {
    id: 3,
    nama: 'Bima Setiawan',
    email: 'bima.setiawan@yahoo.com',
    telepon: '085711223344',
    alamat: 'Jl. Sudirman No. 8, Jakarta',
    avatar: '',
    totalPesanan: 2,
    totalBelanja: 3200000,
    status: 'Nonaktif',
    vip: false,
    bergabung: '2024-05-11',
  },
  {
    id: 4,
    nama: 'Salsabila Putri',
    email: 'salsabila.putri@gmail.com',
    telepon: '087812349900',
    alamat: 'Jl. Dago No. 101, Bandung',
    avatar: '',
    totalPesanan: 21,
    totalBelanja: 45200000,
    status: 'Aktif',
    vip: true,
    bergabung: '2022-12-01',
  },
  {
    id: 5,
    nama: 'Fajar Nugroho',
    email: 'fajar.nugroho@outlook.com',
    telepon: '081399881122',
    alamat: 'Jl. Gatot Subroto No. 20, Surabaya',
    avatar: '',
    totalPesanan: 4,
    totalBelanja: 6100000,
    status: 'Aktif',
    vip: false,
    bergabung: '2024-09-03',
  },
  {
    id: 6,
    nama: 'Clara Wijaya',
    email: 'clara.wijaya@gmail.com',
    telepon: '089677221100',
    alamat: 'Jl. Braga No. 5, Bandung',
    avatar: '',
    totalPesanan: 0,
    totalBelanja: 0,
    status: 'Nonaktif',
    vip: false,
    bergabung: '2025-01-17',
  },
  {
    id: 7,
    nama: 'Yoga Firmansyah',
    email: 'yoga.firmansyah@gmail.com',
    telepon: '081255667788',
    alamat: 'Jl. Ahmad Yani No. 33, Bekasi',
    avatar: '',
    totalPesanan: 9,
    totalBelanja: 15600000,
    status: 'Aktif',
    vip: false,
    bergabung: '2023-06-25',
  },
  {
    id: 8,
    nama: 'Intan Permata Sari',
    email: 'intan.permata@gmail.com',
    telepon: '082133445566',
    alamat: 'Jl. Riau No. 19, Bandung',
    avatar: '',
    totalPesanan: 17,
    totalBelanja: 32100000,
    status: 'Aktif',
    vip: true,
    bergabung: '2023-03-09',
  },
  {
    id: 9,
    nama: 'Reza Maulana',
    email: 'reza.maulana@yahoo.com',
    telepon: '085644332211',
    alamat: 'Jl. Pahlawan No. 7, Semarang',
    avatar: '',
    totalPesanan: 1,
    totalBelanja: 1500000,
    status: 'Nonaktif',
    vip: false,
    bergabung: '2025-04-02',
  },
  {
    id: 10,
    nama: 'Wulan Anggraini',
    email: 'wulan.anggraini@gmail.com',
    telepon: '087744556699',
    alamat: 'Jl. Kemang Raya No. 15, Jakarta',
    avatar: '',
    totalPesanan: 11,
    totalBelanja: 21000000,
    status: 'Aktif',
    vip: false,
    bergabung: '2024-07-30',
  },
];

// app/lib/api.ts

// ... code lainnya

// EXPORT UTILS DARI SINI JUGA
export { formatRp, formatNumber } from './utils';