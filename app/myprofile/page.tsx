'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Fraunces, Inter } from 'next/font/google';
import {
  UserRound,
  ShoppingBag,
  Heart,
  Wallet,
  MapPin,
  Bell,
  ShieldCheck,
  HelpCircle,
  FileText,
  ChevronRight,
  Pencil,
  LogOut,
} from 'lucide-react';

const fraunces = Fraunces({
  subsets: ['latin'],
  weight: ['600', '700'],
  variable: '--font-display',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-body',
});

export default function MyProfile() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [ordersCount, setOrdersCount] = useState(0);

  useEffect(() => {
    fetchProfile();
    fetchOrdersCount();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      if (!token) {
        router.push('/auth2');
        return;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Gagal mengambil data profil');
      }

      const data = await response.json();
      setUser(data);
    } catch (error: any) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrdersCount = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/orders`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setOrdersCount(data.orders?.length || 0);
      }
    } catch (error) {
      console.error('Error fetching orders count:', error);
    }
  };

  const getInitial = () => {
    if (user?.nama) return user.nama.charAt(0).toUpperCase();
    return '👤';
  };

  const getRoleLabel = () => {
    if (user?.role === 'admin') return 'Admin';
    return 'Gold Member';
  };

  // ⭐ HANYA PESANAN SAJA
  const stats = [
    { label: 'Pesanan', value: String(ordersCount), icon: ShoppingBag, href: '/riwayattransaksi' },
  ];

  const menuGroups = [
    {
      title: 'Akun',
      items: [
        { label: 'Profil Saya', desc: 'Nama, email, nomor telepon', icon: UserRound, href: '/detailmyprofile' },
      ],
    },
    {
      title: 'Transaksi',
      items: [
        { label: 'Riwayat Transaksi', desc: 'Lihat semua pesanan', icon: ShoppingBag, href: '/riwayat' },
      ],
    },
  ];

  if (loading) {
    return (
      <div
        className={`${fraunces.variable} ${inter.variable} font-body min-h-screen relative antialiased text-white bg-cover bg-center bg-no-repeat bg-fixed flex items-center justify-center`}
        style={{ backgroundImage: `url('/background keranjang2.jpg')` }}
      >
        <style jsx global>{`
          @keyframes pickSpin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
          .pick-loader {
            width: 30px; height: 36px;
            background: linear-gradient(160deg, #F3E4C4, #C9A34E 50%, #8A5A1E);
            border-radius: 50% 50% 50% 50% / 62% 62% 38% 38%;
            box-shadow: 0 0 16px rgba(201,163,78,0.45);
            animation: pickSpin 1s linear infinite;
          }
        `}</style>
        <div className="absolute inset-0 bg-gradient-to-b from-[#0D0A09]/80 via-[#0D0A09]/70 to-[#0D0A09]/90 pointer-events-none z-0" />
        <div className="relative z-10 flex flex-col items-center gap-4">
          <div className="pick-loader" />
          <span className="text-xs tracking-widest uppercase text-[#8A8178]">Menyetem profilmu...</span>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`${fraunces.variable} ${inter.variable} font-body min-h-screen relative antialiased text-white bg-cover bg-center bg-no-repeat bg-fixed`}
      style={{ backgroundImage: `url('/background keranjang2.jpg')` }}
    >
      <style jsx global>{`
        .font-display {
          font-family: var(--font-display), serif;
        }
        .font-body {
          font-family: var(--font-body), sans-serif;
        }
        .string-divider span {
          display: block;
          border-radius: 999px;
          background: linear-gradient(90deg, rgba(201,163,78,0.9), rgba(201,163,78,0));
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .rise { animation: fadeUp 0.5s ease-out both; }
        button:focus-visible, a:focus-visible {
          outline: 2px solid #C9A34E;
          outline-offset: 2px;
        }
        @media (prefers-reduced-motion: reduce) {
          .rise { animation: none !important; }
        }
      `}</style>

      {/* Overlay gradient + vignette */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0D0A09]/80 via-[#0D0A09]/70 to-[#0D0A09]/90 pointer-events-none z-0" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_0%,_rgba(0,0,0,0.55)_100%)] pointer-events-none z-0" />
      <div className="absolute inset-0 backdrop-blur-[2px] pointer-events-none z-0" />

      {/* NAVBAR - SAMA SEPERTI KERANJANG */}
      <nav className="w-full bg-[#FFFDF6]/95 text-black px-4 md:px-12 py-3.5 flex justify-between items-center shadow-[0_4px_30px_rgba(0,0,0,0.5)] border-b border-gray-300/50 backdrop-blur-md sticky top-0 z-50">
        <span className="font-display font-semibold text-base tracking-wide flex items-center gap-1.5">
          <span className="text-lg filter drop-shadow">🎸</span> GitarKu
        </span>
        <button
          onClick={() => router.push('/dashboard')}
          className="text-[11px] font-bold tracking-widest uppercase text-neutral-500 hover:text-amber-800 transition"
        >
          Back &gt;
        </button>
      </nav>

      {/* Konten */}
      <div className="relative z-10">
        {/* Header */}
        <div className="relative px-5 pt-8 pb-16 rise">
          <p className="text-[#8A8178] text-xs tracking-[0.2em] uppercase">Selamat datang kembali</p>
          <h1 className="font-display text-2xl text-[#FFFDF6] mt-1.5">Halo, {user?.nama || 'User'} 👋</h1>
          {/* Signature: string divider — six lines like guitar strings, low E to high e */}
          <div className="string-divider flex flex-col gap-[3px] w-20 mt-3" aria-hidden="true">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <span key={i} style={{ height: `${1 + i * 0.45}px`, opacity: 1 - i * 0.11 }} />
            ))}
          </div>
        </div>

        {/* Membership card */}
        <div className="px-5 -mt-10 rise" style={{ animationDelay: '80ms' }}>
          <div className="max-w-sm mx-auto bg-[#FFFDF6] rounded-3xl shadow-2xl p-6 relative ring-1 ring-black/5">
            {/* subtle brass corner accent, echoing an inlay */}
            <div className="absolute top-5 right-5 w-1.5 h-1.5 rounded-full bg-[#C9A34E]" aria-hidden="true" />

            <div className="flex items-center gap-4">
              <div className="relative shrink-0">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#E8DCC4] to-[#C9A34E] p-[3px] shadow-[0_0_0_1px_rgba(184,134,59,0.15)]">
                  <div className="w-full h-full rounded-full bg-[#EFEAE0] flex items-center justify-center text-3xl font-bold text-amber-800 overflow-hidden">
                    {user?.avatar ? (
                      <img src={user.avatar} alt={user.nama} className="w-full h-full rounded-full object-cover" />
                    ) : (
                      getInitial()
                    )}
                  </div>
                </div>
                <button
                  onClick={() => router.push('/detailmyprofile')}
                  aria-label="Ubah foto profil"
                  className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-[#B8863B] text-white flex items-center justify-center shadow-md hover:bg-[#a2762f] hover:scale-105 active:scale-95 transition"
                >
                  <Pencil size={13} />
                </button>
              </div>

              <div className="min-w-0">
                <h2 className="font-display text-lg text-[#1C1410] truncate">{user?.nama || 'User'}</h2>
                <p className="text-sm text-[#8A8178] truncate">{user?.email || '-'}</p>
                <span className="inline-flex items-center gap-1.5 mt-2 text-[11px] font-semibold tracking-wide uppercase text-[#8A5A1E] bg-[#F3E4C4] px-2.5 py-1 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#B8863B]" aria-hidden="true" />
                  {getRoleLabel()}
                </span>
              </div>
            </div>

            {/* ⭐ STATS ROW - HANYA PESANAN */}
            <div className="grid grid-cols-1 mt-6 pt-5 border-t border-[#EDE6D8]">
              {stats.map(({ label, value, icon: Icon, href }) => (
                <button
                  key={label}
                  onClick={() => router.push(href)}
                  className="flex items-center justify-center gap-3 text-center group py-2 rounded-xl transition hover:bg-[#F7F2E7]"
                >
                  <Icon size={18} className="text-[#B8863B] group-hover:text-[#8A5A1E] group-hover:-translate-y-0.5 transition" />
                  <span className="font-display text-base text-[#1C1410]">{value}</span>
                  <span className="text-xs text-[#8A8178]">{label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Menu groups */}
        <div className="px-5 mt-6 pb-10 max-w-sm mx-auto space-y-5">
          {menuGroups.map((group, gi) => (
            <div key={group.title} className="rise" style={{ animationDelay: `${140 + gi * 60}ms` }}>
              <p className="text-xs font-semibold tracking-[0.15em] uppercase text-[#8A8178] px-1 mb-2">
                {group.title}
              </p>
              <div className="bg-[#FFFDF6] rounded-2xl shadow-lg overflow-hidden ring-1 ring-black/5">
                {group.items.map(({ label, desc, icon: Icon, href }, i) => (
                  <button
                    key={label}
                    onClick={() => router.push(href)}
                    className={`w-full flex items-center gap-3 text-left px-4 py-3.5 hover:bg-[#F7F2E7] transition group ${
                      i !== group.items.length - 1 ? 'border-b border-[#F0EAE0]' : ''
                    }`}
                  >
                    <span className="w-9 h-9 rounded-full bg-[#F3E4C4] flex items-center justify-center shrink-0 group-hover:bg-[#EAD8AC] transition">
                      <Icon size={17} className="text-[#8A5A1E]" />
                    </span>
                    <span className="flex-1 min-w-0">
                      <span className="block text-[15px] text-[#1C1410]">{label}</span>
                      {desc && <span className="block text-xs text-[#8A8178] truncate">{desc}</span>}
                    </span>
                    <ChevronRight size={18} className="text-[#C9C2B4] shrink-0 group-hover:translate-x-0.5 group-hover:text-[#B8863B] transition" />
                  </button>
                ))}
              </div>
            </div>
          ))}

          {/* Logout */}
          <button
            onClick={() => {
              localStorage.removeItem('token');
              localStorage.removeItem('user');
              router.push('/');
            }}
            className="w-full flex items-center justify-center gap-2 text-[15px] font-medium text-[#C1483A] bg-[#FFFDF6] rounded-2xl shadow-lg py-3.5 hover:bg-[#FBEEEC] active:scale-[0.99] transition ring-1 ring-black/5 rise"
            style={{ animationDelay: `${140 + menuGroups.length * 60 + 40}ms` }}
          >
            <LogOut size={17} />
            Keluar
          </button>

          <p className="text-center text-xs text-[#5A544C] pt-2 tracking-wide">Versi Aplikasi 1.0.0</p>
        </div>
      </div>
    </div>
  );
}