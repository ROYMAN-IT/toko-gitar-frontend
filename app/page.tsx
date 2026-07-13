'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Fraunces, Inter, JetBrains_Mono } from 'next/font/google';
import { productAPI } from './lib/api';
import { formatRp } from './lib/utils';

// ✅ IMPORT AOS
import 'aos/dist/aos.css';
import AOS from 'aos';

const fraunces = Fraunces({ subsets: ['latin'], weight: ['500', '600', '700'], style: ['normal', 'italic'], variable: '--font-display' });
const inter = Inter({ subsets: ['latin'], weight: ['400', '500', '600', '700'], variable: '--font-body' });
const jetbrainsMono = JetBrains_Mono({ subsets: ['latin'], weight: ['400', '600', '700'], variable: '--font-mono' });

export default function Home() {
  const router = useRouter();
  const [isLoggedIn] = useState(false);
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeaturedProducts();

    // ✅ INISIALISASI AOS
    AOS.init({
      duration: 800,
      once: true,
      offset: 100,
      easing: 'ease-out-cubic',
    });
  }, []);

  const fetchFeaturedProducts = async () => {
    try {
      setLoading(true);
      const data = await productAPI.getAll({ featured: 'true', limit: 3 });
      setFeaturedProducts(data.data || []);
    } catch (error) {
      console.error('Error fetching featured products:', error);
      setFeaturedProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleProtectedClick = (menuName: string) => {
    if (!isLoggedIn) {
      alert(`Akses Ditolak! Anda harus daftar dan login terlebih dahulu untuk mengakses halaman ${menuName}.`);
    } else {
      alert(`Membuka halaman ${menuName}...`);
    }
  };

  return (
    <div
      className={`${fraunces.variable} ${inter.variable} ${jetbrainsMono.variable} font-body min-h-screen text-white flex flex-col items-center overflow-x-hidden relative antialiased`}
      style={{
        background: 'radial-gradient(circle at 20% 15%, #262019 0%, #0D0A09 45%, #060403 100%)',
      }}
    >
      <style jsx global>{`
        .font-display { font-family: var(--font-display), serif; }
        .font-body { font-family: var(--font-body), sans-serif; }
        .font-mono-num { font-family: var(--font-mono), monospace; }

        @keyframes fleckFloat {
          0%   { transform: translate3d(0, -8vh, 0) rotate(0deg); opacity: 0; }
          10%  { opacity: var(--fleck-op, 0.3); }
          90%  { opacity: var(--fleck-op, 0.3); }
          100% { transform: translate3d(var(--fleck-drift, 12px), 108vh, 0) rotate(160deg); opacity: 0; }
        }
        .fleck-ambient {
          position: absolute;
          top: 0;
          border-radius: 999px;
          pointer-events: none;
          animation-name: fleckFloat;
          animation-timing-function: linear;
          animation-iteration-count: infinite;
          filter: blur(0.3px);
        }
        @keyframes softDrift {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(14px, -10px); }
        }
        .drift-slow { animation: softDrift 12s ease-in-out infinite; }
        .drift-slower { animation: softDrift 18s ease-in-out infinite reverse; }

        @keyframes heroFadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .hero-in { animation: heroFadeUp 0.9s cubic-bezier(0.16,1,0.3,1) both; }
        .hero-in-delay-1 { animation: heroFadeUp 0.9s cubic-bezier(0.16,1,0.3,1) 0.12s both; }
        .hero-in-delay-2 { animation: heroFadeUp 0.9s cubic-bezier(0.16,1,0.3,1) 0.24s both; }
        .hero-in-delay-3 { animation: heroFadeUp 0.9s cubic-bezier(0.16,1,0.3,1) 0.36s both; }

        @keyframes shimmerSweep {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        .title-shimmer {
          background: linear-gradient(110deg, #fff 20%, #F2C879 45%, #fff 60%, #D97A3F 80%);
          background-size: 250% auto;
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          animation: shimmerSweep 5s linear infinite;
        }

        @keyframes cardShine {
          0% { transform: translateX(-120%) rotate(8deg); }
          100% { transform: translateX(220%) rotate(8deg); }
        }
        .card-shine::after {
          content: '';
          position: absolute;
          top: -50%;
          left: 0;
          width: 40%;
          height: 200%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.35), transparent);
          transform: translateX(-120%) rotate(8deg);
          pointer-events: none;
        }
        .group:hover .card-shine::after {
          animation: cardShine 0.9s ease-out;
        }

        @keyframes pulseGlow {
          0%, 100% { box-shadow: 0 0 0 0 rgba(217,122,63,0.35); }
          50% { box-shadow: 0 0 0 10px rgba(217,122,63,0); }
        }
        .pulse-ring { animation: pulseGlow 2.4s ease-out infinite; }

        @keyframes shimmer { 0% { background-position: -400px 0; } 100% { background-position: 400px 0; } }
        .skeleton { background: linear-gradient(90deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.12) 50%, rgba(255,255,255,0.05) 100%); background-size: 800px 100%; animation: shimmer 1.6s infinite linear; }

        @media (prefers-reduced-motion: reduce) {
          .fleck-ambient, .drift-slow, .drift-slower, .hero-in, .hero-in-delay-1, .hero-in-delay-2, .hero-in-delay-3, .title-shimmer, .pulse-ring { animation: none !important; }
        }
      `}</style>

      {/* AMBIENT GLOWS */}
      <div className="drift-slow absolute -top-24 -left-20 w-[420px] h-[420px] rounded-full bg-amber-700/[0.10] blur-[110px] pointer-events-none z-0" />
      <div className="drift-slower absolute -bottom-28 -right-16 w-[380px] h-[380px] rounded-full bg-orange-600/[0.08] blur-[100px] pointer-events-none z-0" />
      <div className="drift-slow absolute top-1/3 right-1/4 w-[260px] h-[260px] rounded-full bg-amber-400/[0.06] blur-[90px] pointer-events-none z-0" />

      {/* GRAIN HALUS */}
      <div
        className="absolute inset-0 pointer-events-none z-0 opacity-[0.045] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
          backgroundSize: '140px 140px',
        }}
      />

      {/* VIGNETTE */}
      <div
        className="absolute inset-0 pointer-events-none z-0"
        style={{ boxShadow: 'inset 0 0 200px 70px rgba(0,0,0,0.5)' }}
      />

      {/* SERPIHAN CAHAYA AMBIENT */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0" aria-hidden="true">
        {flecks.map((f, i) => (
          <span
            key={i}
            className="fleck-ambient"
            style={{
              left: f.left,
              width: f.size,
              height: f.size,
              background: f.hue,
              animationDuration: f.dur,
              animationDelay: f.delay,
              // @ts-ignore
              '--fleck-drift': f.drift,
              '--fleck-op': f.op,
            } as React.CSSProperties}
          />
        ))}
      </div>

      {/* NAVBAR */}
      <nav className="w-full bg-[#FFFDF6]/95 text-black px-4 md:px-12 py-3.5 flex justify-between items-center shadow-[0_4px_30px_rgba(0,0,0,0.5)] border-b border-gray-300/50 backdrop-blur-md sticky top-0 z-50" data-aos="fade-down" data-aos-duration="600">
        <div className="font-display font-semibold text-base tracking-wide flex items-center gap-1.5">
          <span className="text-lg filter drop-shadow">🎸</span> GitarKu
        </div>
        <div className="hidden sm:flex gap-6 font-bold text-xs uppercase tracking-wide items-center">
          <button onClick={() => handleProtectedClick('Produk')} className="text-neutral-600 hover:text-amber-800 transition cursor-pointer relative group">
            Produk
            <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-amber-700 group-hover:w-full transition-all duration-300" />
          </button>
          <button onClick={() => handleProtectedClick('Kategori')} className="text-neutral-600 hover:text-amber-800 transition cursor-pointer relative group">
            Kategori
            <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-amber-700 group-hover:w-full transition-all duration-300" />
          </button>
        </div>
        <div className="flex gap-3 items-center">
          <Link href="/auth2" className="text-[11px] font-bold uppercase tracking-wide text-neutral-600 hover:text-amber-800 transition px-2">Login</Link>
          <Link href="/auth" className="text-[11px] font-bold uppercase tracking-wide bg-amber-800 hover:bg-amber-700 text-white rounded-full px-4 py-2 transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-amber-800/30 active:translate-y-0">Daftar</Link>
        </div>
      </nav>

      {/* HERO SECTION */}
      <header className="w-full max-w-6xl flex-1 flex flex-col items-center justify-center text-center py-24 relative min-h-[75vh] px-4" data-aos="fade-up" data-aos-duration="1000" data-aos-delay="100">
        <svg className="hidden lg:block absolute left-0 top-1/2 -translate-y-1/2 w-40 h-80 text-amber-100/10" viewBox="0 0 100 200" fill="currentColor">
          <path d="M45,15 C45,10 55,10 55,15 L54,30 L46,30 Z" />
          <rect x="48" y="30" width="4" height="75" />
          <path d="M50,105 C33,105 30,122 39,142 C30,162 33,188 50,188 C67,188 70,162 61,142 C70,122 67,105 50,105 Z" />
          <circle cx="50" cy="138" r="7" fill="#0D0A09" />
        </svg>
        <svg className="hidden lg:block absolute right-0 top-1/2 -translate-y-1/2 w-40 h-80 text-amber-100/10 [transform:translateY(-50%)_scaleX(-1)]" viewBox="0 0 100 200" fill="currentColor">
          <path d="M45,15 C45,10 55,10 55,15 L54,30 L46,30 Z" />
          <rect x="48" y="30" width="4" height="75" />
          <path d="M50,105 C33,105 30,122 39,142 C30,162 33,188 50,188 C67,188 70,162 61,142 C70,122 67,105 50,105 Z" />
          <circle cx="50" cy="138" r="7" fill="#0D0A09" />
        </svg>

        <div className="relative z-10 max-w-xl px-4">
          <span className="hero-in text-[10px] font-bold tracking-[0.25em] uppercase text-amber-500 mb-4 block relative">
            <span className="inline-block w-6 h-px bg-amber-500 align-middle mr-2" />
            Sejak 2026 · Toko Gitar Terpercaya
            <span className="inline-block w-6 h-px bg-amber-500 align-middle ml-2" />
          </span>
          <h1 className="hero-in-delay-1 font-display italic text-4xl md:text-6xl font-semibold mb-4 title-shimmer drop-shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
            The Guitar Vault
          </h1>
          <p className="hero-in-delay-2 text-gray-300 tracking-[0.1em] text-xs md:text-sm mb-10 uppercase font-light drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
            Sanctuary online untuk pecinta gitar
          </p>
          <button
            onClick={() => handleProtectedClick('Katalog Produk')}
            className="hero-in-delay-3 pulse-ring px-10 py-3 border-2 border-amber-700 rounded-full font-bold tracking-[0.2em] text-xs bg-amber-800 text-white hover:bg-transparent hover:text-amber-500 transition-all duration-300 shadow-xl active:scale-95"
          >
            BELANJA SEKARANG
          </button>
        </div>
      </header>

      {/* TRUST BAR */}
      <div className="w-full max-w-5xl px-4 relative z-10 -mt-6 mb-16" data-aos="fade-up" data-aos-duration="800" data-aos-delay="200">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { icon: '🚚', label: 'Gratis Ongkir', sub: 'Min. belanja 500rb' },
            { icon: '🛡️', label: 'Garansi Resmi', sub: '1 tahun servis' },
            { icon: '💳', label: 'Cicilan 0%', sub: 'Hingga 12 bulan' },
            { icon: '↩️', label: 'Retur Mudah', sub: '7 hari uang kembali' },
          ].map((item, i) => (
            <div
              key={item.label}
              className="flex items-center gap-2.5 bg-white/[0.04] border border-neutral-700/30 rounded-xl px-3 py-2.5 hover:bg-white/[0.08] hover:border-amber-700/40 hover:-translate-y-1 transition-all duration-300"
              style={{ animation: `heroFadeUp 0.7s cubic-bezier(0.16,1,0.3,1) ${0.1 * i}s both` }}
            >
              <span className="text-base">{item.icon}</span>
              <div className="flex flex-col leading-tight text-left">
                <span className="text-[10px] font-bold text-neutral-200">{item.label}</span>
                <span className="text-[9px] text-neutral-500">{item.sub}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* PRODUK PILIHAN - DARI DATABASE */}
      <section className="w-full max-w-5xl px-4 relative z-10 mb-20" data-aos="fade-up" data-aos-duration="800" data-aos-delay="150">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <span className="text-amber-500 text-lg">✦</span>
            <h2 className="font-display text-xl md:text-2xl font-semibold text-white">Produk Pilihan Minggu Ini</h2>
          </div>
          <button onClick={() => handleProtectedClick('Katalog Produk')} className="text-[10px] font-bold uppercase tracking-wide text-amber-500 hover:text-amber-400 transition-colors flex items-center gap-1 group">
            Lihat Semua <span className="group-hover:translate-x-1 transition-transform">→</span>
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-[#FFFDF6]/10 border border-neutral-700/30 rounded-2xl p-4">
                <div className="w-full aspect-square rounded-xl skeleton mb-3.5" />
                <div className="h-2.5 w-20 rounded skeleton mb-2" />
                <div className="h-3.5 w-32 rounded skeleton" />
              </div>
            ))}
          </div>
        ) : featuredProducts.length === 0 ? (
          <div className="text-center py-12 text-neutral-500 bg-white/[0.02] rounded-2xl border border-neutral-800">
            <span className="text-2xl block mb-2">🎸</span>
            <p>Belum ada produk pilihan.</p>
            <p className="text-[10px] text-neutral-600 mt-1">Admin bisa menandai produk sebagai pilihan di halaman kelola produk.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {featuredProducts.map((p, i) => (
              <button
                key={p.id}
                onClick={() => handleProtectedClick(p.name)}
                className="card-shine text-left bg-[#FFFDF6] text-black p-4 rounded-2xl flex flex-col shadow-[0_15px_35px_rgba(0,0,0,0.5)] hover:-translate-y-2 hover:shadow-[0_30px_60px_rgba(0,0,0,0.7)] transition-all duration-300 border border-gray-200/40 group relative overflow-hidden"
                style={{ animation: `heroFadeUp 0.6s cubic-bezier(0.16,1,0.3,1) ${0.12 * i}s both` }}
                data-aos="fade-up"
                data-aos-duration="600"
                data-aos-delay={i * 100}
              >
                <div className="w-full aspect-square bg-[#1A1A1A] rounded-xl flex items-center justify-center mb-3.5 shadow-[inset_0_4px_20px_rgba(0,0,0,0.8)] border border-neutral-800/90 overflow-hidden relative">
                  {p.image ? (
                    <img src={p.image} alt={p.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  ) : (
                    <span className="text-3xl opacity-40 group-hover:opacity-70 transition">🎸</span>
                  )}
                  {p.is_featured && (
                    <span className="absolute top-2 left-2 text-[8px] font-bold bg-amber-500 text-black rounded-full px-2 py-0.5 shadow-md">⭐ PILIHAN</span>
                  )}
                </div>
                <span className="text-[9px] text-neutral-400 uppercase tracking-wide font-bold">{p.category_name || 'Gitar'}</span>
                <h3 className="font-display text-sm font-semibold text-neutral-800 mt-0.5 group-hover:text-amber-700 transition">{p.name}</h3>
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-neutral-100">
                  <span className="text-xs font-black text-amber-900 font-mono-num">{formatRp(p.price)}</span>
                  <span className="text-[10px] text-amber-600 opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0 transition-all duration-300 font-bold">Lihat →</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </section>

      {/* TENTANG WEBSITE */}
      <main className="w-full max-w-4xl text-center pt-16 pb-24 border-t border-white/10 relative px-4" data-aos="fade-up" data-aos-duration="800" data-aos-delay="100">
        <div className="absolute left-1/2 -translate-x-1/2 -top-px w-24 h-px bg-gradient-to-r from-transparent via-amber-600 to-transparent"></div>
        <div className="relative z-10 max-w-2xl mx-auto space-y-6">
          <span className="text-amber-600 text-2xl block">◆</span>
          <h2 className="font-display text-xl md:text-2xl font-semibold tracking-wide uppercase text-gray-100">
            Tentang Website Ini
          </h2>
          <p className="text-gray-300 text-sm md:text-base leading-relaxed font-light tracking-wide drop-shadow-[0_2px_6px_rgba(0,0,0,0.6)]">
            Website ini didedikasikan untuk para pecinta gitar. Kami menyajikan berbagai
            macam gitar berkualitas tinggi, dari akustik hingga elektrik, untuk memenuhi
            kebutuhan musikal Anda. Temukan inspirasi, pelajari teknik, dan miliki gitar
            impian Anda di sini.
          </p>
        </div>
      </main>

      {/* FOOTER - UPDATED DENGAN LINK ANDA */}
      <footer className="w-full bg-[#08060580] border-t border-white/10 relative z-10 px-4 py-10" data-aos="fade-up" data-aos-duration="600" data-aos-delay="50">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="font-display font-semibold text-sm flex items-center gap-1.5">🎸 GitarKu</div>
          <div className="flex gap-6 text-[10px] uppercase tracking-wide text-neutral-400">
            <a 
              href="https://www.instagram.com/Prnzzwdii_/" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="hover:text-amber-500 cursor-pointer transition"
            >
              Instagram
            </a>
            <a 
              href="https://wa.me/6287734985003" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="hover:text-amber-500 cursor-pointer transition"
            >
              WhatsApp
            </a>
            <span className="hover:text-amber-500 cursor-pointer transition">Bantuan</span>
          </div>
          <div className="text-[9px] tracking-widest text-gray-500 font-mono-num uppercase text-center md:text-right">
            © 2026 GitarKu · Dibuat oleh Pranaya Widi Ramadhan
          </div>
        </div>
      </footer>
    </div>
  );
}

const flecks = [
  { left: '5%',  size: 4, delay: '0s',   dur: '14s', drift: '16px', hue: '#F2C879', op: 0.35 },
  { left: '16%', size: 2, delay: '2s',   dur: '17s', drift: '-10px', hue: '#D97A3F', op: 0.28 },
  { left: '28%', size: 3, delay: '4.5s', dur: '13s', drift: '12px',  hue: '#F2C879', op: 0.3 },
  { left: '39%', size: 2, delay: '1.2s', dur: '16s', drift: '-14px', hue: '#EFE3C8', op: 0.24 },
  { left: '52%', size: 4, delay: '3.4s', dur: '15s', drift: '18px',  hue: '#D97A3F', op: 0.32 },
  { left: '64%', size: 2, delay: '0.6s', dur: '18s', drift: '-8px',  hue: '#F2C879', op: 0.26 },
  { left: '76%', size: 3, delay: '5s',   dur: '14.5s', drift: '10px', hue: '#EFE3C8', op: 0.3 },
  { left: '88%', size: 3, delay: '2.8s', dur: '16.5s', drift: '-16px', hue: '#D97A3F', op: 0.28 },
];