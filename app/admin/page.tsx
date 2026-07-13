'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Fraunces, Inter, JetBrains_Mono } from 'next/font/google';
import { productAPI } from '../lib/api';
import { formatRp } from '../lib/utils';

const fraunces = Fraunces({ subsets: ['latin'], weight: ['500', '600', '700'], style: ['normal', 'italic'], variable: '--font-display' });
const inter = Inter({ subsets: ['latin'], weight: ['400', '500', '600', '700'], variable: '--font-body' });
const jetbrainsMono = JetBrains_Mono({ subsets: ['latin'], weight: ['400', '600', '700'], variable: '--font-mono' });

const LOW_STOCK_THRESHOLD = 5;

export default function AdminDashboard() {
  const router = useRouter();
  
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const productsData = await productAPI.getAll({ limit: 100 });
      setProducts(productsData.data || []);
    } catch (error) {
      console.error('❌ Error fetching products:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const stats = useMemo(() => {
    const totalProduk = products.length;
    const totalStok = products.reduce((s, p) => s + (p.stock || 0), 0);
    const nilaiInventori = products.reduce((s, p) => s + (p.price || 0) * (p.stock || 0), 0);
    const stokMenipis = products.filter(p => p.stock > 0 && p.stock <= LOW_STOCK_THRESHOLD);
    const stokHabis = products.filter(p => p.stock === 0);
    
    const kategoriMap: Record<string, { count: number; nilai: number }> = {};
    products.forEach(p => {
      const key = p.category_name || 'Uncategorized';
      if (!kategoriMap[key]) {
        kategoriMap[key] = { count: 0, nilai: 0 };
      }
      kategoriMap[key].count += 1;
      kategoriMap[key].nilai += (p.price || 0) * (p.stock || 0);
    });

    return { 
      totalProduk, 
      totalStok, 
      nilaiInventori, 
      stokMenipis, 
      stokHabis,
      kategoriMap,
      kategoriList: Object.keys(kategoriMap)
    };
  }, [products]);

  const kategoriBreakdown = useMemo(() => {
    const max = Math.max(1, ...Object.values(stats.kategoriMap).map(k => k.count));
    return stats.kategoriList.map(key => ({
      kategori: key,
      count: stats.kategoriMap[key].count,
      pct: (stats.kategoriMap[key].count / max) * 100,
      nilai: stats.kategoriMap[key].nilai
    }));
  }, [stats]);

  return (
    <div className={`${fraunces.variable} ${inter.variable} ${jetbrainsMono.variable} font-body min-h-screen bg-[#0D0A09] text-white flex antialiased`}>
      <style jsx global>{`
        .font-display { font-family: var(--font-display), serif; }
        .font-body { font-family: var(--font-body), sans-serif; }
        .font-mono-num { font-family: var(--font-mono), monospace; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-up { animation: fadeUp 0.25s ease-out; }
        @keyframes shimmer { 0% { background-position: -400px 0; } 100% { background-position: 400px 0; } }
        .skeleton { background: linear-gradient(90deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.09) 50%, rgba(255,255,255,0.04) 100%); background-size: 800px 100%; animation: shimmer 1.6s infinite linear; }
      `}</style>

      {/* ================= SIDEBAR ================= */}
      <aside className="w-60 shrink-0 bg-[#14100E] border-r border-neutral-800 flex flex-col fixed h-screen z-30">
        <div className="px-5 py-5 border-b border-neutral-800 flex items-center gap-2">
          <span className="text-lg">🎸</span>
          <div className="flex flex-col leading-tight">
            <span className="font-display font-semibold text-sm text-white">GitarKu</span>
            <span className="text-[9px] uppercase tracking-wider text-amber-600 font-bold">Admin Panel</span>
          </div>
        </div>

        <nav className="flex-1 px-3 py-5 flex flex-col gap-1">
          <SidebarLink icon="📊" label="Dashboard" active />
          <SidebarLink icon="🎸" label="Produk" onClick={() => router.push('/admin/produk')} />
          <SidebarLink icon="👥" label="Pelanggan" onClick={() => router.push('/admin/pelanggan')} />
          {/* MENU PENGATURAN DIHAPUS */}
        </nav>

        <div className="px-3 py-4 border-t border-neutral-800">
          <button
            onClick={() => router.push('/')}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold text-neutral-400 hover:bg-red-950/40 hover:text-red-400 transition-colors"
          >
            <span>➜</span> Keluar
          </button>
        </div>
      </aside>

      {/* ================= MAIN ================= */}
      <div className="flex-1 ml-60 flex flex-col min-h-screen">

        {/* TOPBAR */}
        <header className="sticky top-0 z-20 bg-[#0D0A09]/95 backdrop-blur-md border-b border-neutral-800 px-8 py-4 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-[10px] text-neutral-500 select-none mb-0.5">
              <span>Admin</span><span>/</span><span className="text-amber-500 font-semibold">Dashboard</span>
            </div>
            <h1 className="font-display text-xl font-semibold text-white">Ringkasan Toko</h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-amber-800 flex items-center justify-center text-xs font-bold shadow-lg shadow-amber-900/30">A</div>
          </div>
        </header>

        <main className="flex-1 px-8 py-6 flex flex-col gap-6">

          {loading ? (
            <div className="flex flex-col gap-6 animate-fade-up">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="bg-white/[0.03] border border-neutral-800 rounded-2xl p-4 h-[76px]">
                    <div className="h-2.5 w-20 rounded skeleton mb-2.5" />
                    <div className="h-5 w-16 rounded skeleton" />
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white/[0.03] border border-neutral-800 rounded-2xl p-5 h-64">
                  <div className="h-4 w-48 rounded skeleton mb-5" />
                  <div className="h-2.5 w-full rounded skeleton mb-3" />
                  <div className="h-2.5 w-full rounded skeleton mb-3" />
                  <div className="h-2.5 w-2/3 rounded skeleton" />
                </div>
                <div className="bg-white/[0.03] border border-neutral-800 rounded-2xl p-5 h-64">
                  <div className="h-4 w-32 rounded skeleton mb-4" />
                  <div className="h-2.5 w-full rounded skeleton mb-2" />
                  <div className="h-2.5 w-full rounded skeleton" />
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* PRIMARY STATS */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-up">
                <StatCard 
                  label="Total Produk" 
                  value={stats.totalProduk.toString()} 
                  icon="🎸" 
                  tone="neutral" 
                  mono 
                />
                <StatCard 
                  label="Total Stok" 
                  value={stats.totalStok.toString()} 
                  icon="📦" 
                  tone="neutral" 
                  mono 
                />
                <StatCard 
                  label="Nilai Inventori" 
                  value={formatRp(stats.nilaiInventori)} 
                  icon="💰" 
                  tone="good" 
                  mono 
                />
                <StatCard 
                  label="Stok Menipis" 
                  value={stats.stokMenipis.length.toString()} 
                  icon="⚠️" 
                  tone="warn" 
                  mono 
                />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* KATEGORI BREAKDOWN */}
                <div className="lg:col-span-2 bg-white/[0.03] border border-neutral-800 rounded-2xl p-5 flex flex-col gap-5 animate-fade-up">
                  <div className="flex items-center justify-between">
                    <h3 className="font-display text-sm font-semibold text-white flex items-center gap-1.5">
                      <span className="text-amber-500">▸</span> Distribusi Produk per Kategori
                    </h3>
                    <span className="text-[10px] text-neutral-500 font-mono-num bg-white/5 rounded-full px-2.5 py-1">{stats.totalProduk} produk total</span>
                  </div>

                  <div className="flex flex-col gap-4">
                    {kategoriBreakdown.length === 0 ? (
                      <p className="text-xs text-neutral-500 py-4 text-center">Belum ada kategori</p>
                    ) : (
                      kategoriBreakdown.map(k => (
                        <div key={k.kategori} className="flex flex-col gap-1.5 group">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-semibold text-neutral-200 group-hover:text-amber-400 transition-colors">{k.kategori}</span>
                            <span className="text-neutral-500 font-mono-num">{k.count} produk · {formatRp(k.nilai)}</span>
                          </div>
                          <div className="h-2.5 w-full bg-neutral-800 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-amber-700 to-amber-500 rounded-full transition-all duration-500" style={{ width: `${k.pct}%` }} />
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="h-px bg-neutral-800" />

                  <div className="flex items-center justify-between">
                    <h3 className="font-display text-sm font-semibold text-white flex items-center gap-1.5">
                      <span className="text-amber-500">▸</span> Semua Produk
                    </h3>
                    <button onClick={() => router.push('/admin/produk')} className="text-[10px] font-bold uppercase text-amber-500 hover:text-amber-400 transition-colors">
                      Lihat Semua →
                    </button>
                  </div>

                  <div className="flex flex-col gap-1">
                    {products.length === 0 ? (
                      <p className="text-xs text-neutral-500 py-4 text-center">Belum ada produk</p>
                    ) : (
                      products.slice(0, 5).map((p, i) => (
                        <div key={p.id} onClick={() => router.push('/admin/produk')} className="flex items-center gap-3 py-2 px-2 rounded-lg hover:bg-white/[0.05] cursor-pointer transition-colors">
                          <span className="text-[10px] font-mono-num text-neutral-500 w-4">{i + 1}</span>
                          <div className="h-9 w-9 rounded-lg bg-[#1A1A1A] border border-neutral-800 overflow-hidden shrink-0">
                            <img src={p.image || ''} alt={p.name} className="w-full h-full object-cover" loading="lazy" />
                          </div>
                          <div className="flex flex-col flex-1 min-w-0">
                            <span className="text-xs font-semibold text-neutral-200 truncate">{p.name}</span>
                            <span className="text-[10px] text-neutral-500">{p.category_name || '-'}</span>
                          </div>
                          <span className="text-xs font-bold text-amber-500 font-mono-num shrink-0">{formatRp(p.price)}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* STOK ALERTS */}
                <div className="flex flex-col gap-4 animate-fade-up">
                  <div className="bg-white/[0.03] border border-neutral-800 rounded-2xl p-5 flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-display text-sm font-semibold text-white flex items-center gap-1.5">
                        <span className="text-amber-500">▸</span> Perlu Perhatian
                      </h3>
                      <span className="text-[10px] font-bold bg-amber-700/20 text-amber-400 rounded-full px-2.5 py-1">
                        {stats.stokMenipis.length + stats.stokHabis.length}
                      </span>
                    </div>

                    {stats.stokHabis.length === 0 && stats.stokMenipis.length === 0 ? (
                      <div className="text-center py-6">
                        <span className="text-xl">✅</span>
                        <p className="text-xs text-neutral-500 mt-2">Semua stok aman. Tidak ada yang perlu ditindak.</p>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-1 max-h-80 overflow-y-auto">
                        {stats.stokHabis.map(p => (
                          <div key={p.id} onClick={() => router.push('/admin/produk')} className="flex items-center gap-2.5 py-2 px-2 rounded-lg hover:bg-white/[0.05] cursor-pointer transition-colors">
                            <span className="h-1.5 w-1.5 rounded-full bg-red-500 shrink-0 shadow-[0_0_6px_rgba(239,68,68,0.6)]" />
                            <span className="text-xs text-neutral-200 truncate flex-1">{p.name}</span>
                            <span className="text-[9px] font-bold uppercase text-red-400 shrink-0 bg-red-950/40 rounded-full px-2 py-0.5">Habis</span>
                          </div>
                        ))}
                        {stats.stokMenipis.map(p => (
                          <div key={p.id} onClick={() => router.push('/admin/produk')} className="flex items-center gap-2.5 py-2 px-2 rounded-lg hover:bg-white/[0.05] cursor-pointer transition-colors">
                            <span className="h-1.5 w-1.5 rounded-full bg-amber-500 shrink-0 shadow-[0_0_6px_rgba(245,158,11,0.6)]" />
                            <span className="text-xs text-neutral-200 truncate flex-1">{p.name}</span>
                            <span className="text-[9px] font-bold uppercase text-amber-500 font-mono-num shrink-0 bg-amber-950/40 rounded-full px-2 py-0.5">{p.stock} unit</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* QUICK ACTIONS - HANYA KELOLA SEMUA PRODUK */}
                  <div className="bg-white/[0.03] border border-neutral-800 rounded-2xl p-5 flex flex-col gap-2.5">
                    <h3 className="font-display text-sm font-semibold text-white mb-1 flex items-center gap-1.5">
                      <span className="text-amber-500">▸</span> Aksi Cepat
                    </h3>
                    <button onClick={() => router.push('/admin/produk')} className="w-full text-left text-xs font-semibold text-neutral-200 bg-white/5 hover:bg-amber-700/15 hover:text-amber-400 border border-neutral-700 hover:border-amber-700/40 rounded-xl px-3.5 py-2.5 transition-all">
                      📋 Kelola Semua Produk
                    </button>
                    {/* TOMBOL TAMBAH PRODUK DIHAPUS */}
                  </div>
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}

function SidebarLink({ icon, label, active, onClick }: { icon: string; label: string; active?: boolean; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs font-semibold transition-colors text-left ${
        active ? 'bg-amber-700/15 text-amber-400 border border-amber-700/30' : 'text-neutral-400 hover:bg-white/5 hover:text-neutral-200'
      }`}
    >
      <span>{icon}</span>{label}
    </button>
  );
}

function StatCard({ label, value, icon, tone, mono }: { label: string; value: string; icon: string; tone: 'neutral' | 'warn' | 'danger' | 'good'; mono?: boolean }) {
  const toneMap: Record<string, string> = {
    neutral: 'text-neutral-200',
    warn: 'text-amber-400',
    danger: 'text-red-400',
    good: 'text-emerald-400',
  };
  return (
    <div className="bg-white/[0.03] border border-neutral-800 rounded-2xl p-4 flex items-start justify-between hover:border-neutral-700 transition-colors">
      <div className="flex flex-col">
        <span className="text-[10px] uppercase tracking-wider text-neutral-500 font-bold mb-1.5">{label}</span>
        <span className={`text-lg font-bold ${toneMap[tone]} ${mono ? 'font-mono-num' : 'font-display'}`}>{value}</span>
      </div>
      <span className="text-base opacity-70">{icon}</span>
    </div>
  );
}
