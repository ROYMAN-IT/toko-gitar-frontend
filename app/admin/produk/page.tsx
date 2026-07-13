'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Fraunces, Inter, JetBrains_Mono } from 'next/font/google';
import { productAPI, categoryAPI, Product, Category } from '@/lib/api';
import { formatRp } from '@/lib/utils';
import React from 'react';

const fraunces = Fraunces({ subsets: ['latin'], weight: ['500', '600', '700'], style: ['normal', 'italic'], variable: '--font-display' });
const inter = Inter({ subsets: ['latin'], weight: ['400', '500', '600', '700'], variable: '--font-body' });
const jetbrainsMono = JetBrains_Mono({ subsets: ['latin'], weight: ['400', '600', '700'], variable: '--font-mono' });

const LOW_STOCK_THRESHOLD = 5;
const ITEMS_PER_PAGE = 8;

export default function AdminProducts() {
  const router = useRouter();
  
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'Semua' | 'Habis' | 'Menipis'>('Semua');
  const [selectedCategory, setSelectedCategory] = useState<number | 'Semua'>('Semua');
  const [sortKey, setSortKey] = useState<'terbaru' | 'nama-asc' | 'harga-desc' | 'harga-asc' | 'stok-desc'>('terbaru');
  const [currentPage, setCurrentPage] = useState(1);
  const [showFeatured, setShowFeatured] = useState(false);
  
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [toast, setToast] = useState<{ msg: string; tone: 'ok' | 'err' } | null>(null);
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  const [showSpesifikasiModal, setShowSpesifikasiModal] = useState(false);
  
  const showToast = (msg: string, tone: 'ok' | 'err' = 'ok') => {
    setToast({ msg, tone });
    setTimeout(() => setToast(null), 2600);
  };

  useEffect(() => {
    fetchData();
  }, [showFeatured]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      try {
        const categoriesData = await categoryAPI.getAll();
        setCategories(categoriesData || []);
      } catch (error) {
        console.error('Error fetching categories:', error);
        setCategories([]);
      }

      try {
        const params: any = { limit: 100 };
        if (showFeatured) {
          params.featured = 'true';
        }
        const productsData = await productAPI.getAll(params);
        setProducts(productsData.data || []);
      } catch (error) {
        console.error('Error fetching products:', error);
        setProducts([]);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      showToast('Gagal memuat data', 'err');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await productAPI.delete(id);
      await fetchData();
      showToast('Produk berhasil dihapus', 'ok');
      setConfirmDeleteId(null);
    } catch (error) {
      console.error('Error deleting product:', error);
      showToast('Gagal menghapus produk', 'err');
    }
  };

  const toggleFeatured = async (id: number) => {
    try {
      await productAPI.toggleFeatured(id);
      await fetchData();
      showToast('Status pilihan berhasil diubah', 'ok');
    } catch (error) {
      console.error('Error toggling featured:', error);
      showToast('Gagal mengubah status pilihan', 'err');
    }
  };

  const formatTanggal = (iso: string) =>
    new Date(iso).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });

  const filtered = useMemo(() => {
    let list = products.filter(p => {
      const q = searchQuery.toLowerCase();
      const matchSearch = p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q);
      const matchCategory = selectedCategory === 'Semua' || p.category_id === selectedCategory;
      const matchStatus = statusFilter === 'Semua' 
        || (statusFilter === 'Habis' && p.stock === 0) 
        || (statusFilter === 'Menipis' && p.stock > 0 && p.stock <= LOW_STOCK_THRESHOLD);
      return matchSearch && matchCategory && matchStatus;
    });

    if (sortKey === 'nama-asc') list = [...list].sort((a, b) => a.name.localeCompare(b.name));
    if (sortKey === 'harga-desc') list = [...list].sort((a, b) => b.price - a.price);
    if (sortKey === 'harga-asc') list = [...list].sort((a, b) => a.price - b.price);
    if (sortKey === 'stok-desc') list = [...list].sort((a, b) => b.stock - a.stock);
    if (sortKey === 'terbaru') list = [...list].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    return list;
  }, [products, searchQuery, selectedCategory, statusFilter, sortKey]);

  useEffect(() => { setCurrentPage(1); }, [searchQuery, selectedCategory, statusFilter, sortKey]);
  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paged = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  // Produk yang dipilih untuk modal spesifikasi
  const selectedProduct = products.find(p => p.id === selectedProductId);

  return (
    <div className={`${fraunces.variable} ${inter.variable} ${jetbrainsMono.variable} font-body min-h-screen bg-[#0D0A09] text-white flex antialiased`}>
      <style jsx global>{`
        .font-display { font-family: var(--font-display), serif; }
        .font-body { font-family: var(--font-body), sans-serif; }
        .font-mono-num { font-family: var(--font-mono), monospace; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-up { animation: fadeUp 0.18s ease-out; }
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
          <SidebarLink icon="📊" label="Dashboard" onClick={() => router.push('/admin')} />
          <SidebarLink icon="🎸" label="Produk" active />
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
              <span>Admin</span><span>/</span><span className="text-amber-500 font-semibold">Produk</span>
            </div>
            <h1 className="font-display text-xl font-semibold text-white">Kelola Produk</h1>
          </div>
          <button
            onClick={() => router.push('/admin/produk/tambah')}
            className="bg-amber-700 hover:bg-amber-600 text-white text-xs font-bold rounded-xl px-4 py-2.5 flex items-center gap-1.5 transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-amber-700/30 active:translate-y-0"
          >
            <span>＋</span> Tambah Produk
          </button>
        </header>

        <main className="flex-1 px-8 py-6 flex flex-col gap-6">

          {/* TOOLBAR */}
          <div className="bg-white/[0.03] border border-neutral-800 rounded-2xl p-4 flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <input
                type="text"
                placeholder="Cari produk..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/5 border border-neutral-700 rounded-xl px-4 py-2.5 pl-9 text-xs text-neutral-200 focus:outline-none focus:border-amber-700 placeholder:text-neutral-500 transition-colors"
              />
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500 text-xs">🔍</span>
            </div>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value === 'Semua' ? 'Semua' : Number(e.target.value))}
              className="bg-white/5 border border-neutral-700 rounded-xl px-3 py-2.5 text-xs text-neutral-200 focus:outline-none focus:border-amber-700 cursor-pointer"
            >
              <option className="text-black" value="Semua">Semua Kategori</option>
              {categories.map(cat => (
                <option className="text-black" key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'Semua' | 'Habis' | 'Menipis')}
              className="bg-white/5 border border-neutral-700 rounded-xl px-3 py-2.5 text-xs text-neutral-200 focus:outline-none focus:border-amber-700 cursor-pointer"
            >
              <option className="text-black" value="Semua">Semua Stok</option>
              <option className="text-black" value="Menipis">Stok Menipis</option>
              <option className="text-black" value="Habis">Stok Habis</option>
            </select>

            <select
              value={sortKey}
              onChange={(e) => setSortKey(e.target.value as any)}
              className="bg-white/5 border border-neutral-700 rounded-xl px-3 py-2.5 text-xs text-neutral-200 focus:outline-none focus:border-amber-700 cursor-pointer"
            >
              <option className="text-black" value="terbaru">Terbaru</option>
              <option className="text-black" value="nama-asc">Nama A–Z</option>
              <option className="text-black" value="harga-desc">Harga Tertinggi</option>
              <option className="text-black" value="harga-asc">Harga Terendah</option>
              <option className="text-black" value="stok-desc">Stok Terbanyak</option>
            </select>

            <button
              onClick={() => setShowFeatured(!showFeatured)}
              className={`px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                showFeatured 
                  ? 'bg-amber-700 text-white border border-amber-700 shadow-md shadow-amber-900/30' 
                  : 'bg-white/5 text-neutral-400 border border-neutral-700 hover:bg-white/10 hover:text-neutral-200'
              }`}
            >
              ⭐ {showFeatured ? 'Pilihan' : 'Tampilkan Pilihan'}
            </button>

            <button
              onClick={fetchData}
              className="bg-white/5 hover:bg-white/10 border border-neutral-700 rounded-xl px-3 py-2.5 text-xs text-neutral-400 transition-colors"
            >
              🔄 Refresh
            </button>
          </div>

          {/* TABLE */}
          {loading ? (
            <div className="bg-white/[0.03] border border-neutral-800 rounded-2xl overflow-hidden animate-fade-up">
              <div className="flex flex-col divide-y divide-neutral-800/60">
                {[1, 2, 3, 4, 5].map(i => (
                  <div key={i} className="flex items-center gap-3 px-4 py-3.5">
                    <div className="h-11 w-11 rounded-lg skeleton shrink-0" />
                    <div className="flex flex-col gap-1.5 flex-1">
                      <div className="h-2.5 w-40 rounded skeleton" />
                      <div className="h-2 w-24 rounded skeleton" />
                    </div>
                    <div className="h-2.5 w-16 rounded skeleton" />
                    <div className="h-2.5 w-10 rounded skeleton" />
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-white/[0.03] border border-neutral-800 rounded-2xl overflow-hidden animate-fade-up">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-neutral-800 text-[10px] uppercase tracking-wider text-neutral-500">
                      <th className="px-4 py-3.5">#</th>
                      <th className="px-4 py-3.5">Produk</th>
                      <th className="px-4 py-3.5">Kategori</th>
                      <th className="px-4 py-3.5 text-right">Harga</th>
                      <th className="px-4 py-3.5 text-center">Stok</th>
                      <th className="px-4 py-3.5 text-center">Terjual</th>
                      <th className="px-4 py-3.5 text-center">Rating</th>
                      <th className="px-4 py-3.5 text-center">Pilihan</th>
                      <th className="px-4 py-3.5 text-center">Tanggal</th>
                      <th className="px-4 py-3.5 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paged.map((p, i) => (
                      <tr key={p.id} className="border-b border-neutral-800/60 hover:bg-white/[0.03] transition-colors group">
                        <td className="px-4 py-3 text-xs text-neutral-500 font-mono-num">
                          {(currentPage - 1) * ITEMS_PER_PAGE + i + 1}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="h-11 w-11 rounded-lg bg-[#1A1A1A] border border-neutral-800 overflow-hidden shrink-0 flex items-center justify-center">
                              {p.image ? (
                                <img src={p.image} alt={p.name} className="w-full h-full object-cover" loading="lazy" />
                              ) : (
                                <span className="text-xs opacity-50">🎸</span>
                              )}
                            </div>
                            <div className="flex flex-col min-w-0">
                              <span className="text-xs font-semibold text-neutral-100 truncate max-w-[180px]">{p.name}</span>
                              <span className="text-[9px] text-neutral-500 truncate max-w-[180px]">{p.description}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-xs text-neutral-400">
                          <span className="bg-neutral-800/70 rounded-full px-2.5 py-1 text-[10px] font-semibold">{p.category_name || '-'}</span>
                        </td>
                        <td className="px-4 py-3 text-xs font-bold text-amber-500 font-mono-num text-right">
                          {formatRp(p.price)}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={`text-[10px] font-bold rounded-full px-2.5 py-1 ${
                            p.stock === 0 ? 'bg-red-950/50 text-red-400' :
                            p.stock <= LOW_STOCK_THRESHOLD ? 'bg-amber-950/50 text-amber-400' :
                            'bg-emerald-950/50 text-emerald-400'
                          }`}>
                            {p.stock}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center text-xs text-neutral-300 font-mono-num">
                          {p.terjual || 0}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="text-[10px] font-bold text-amber-400">
                            ★ {p.rating || 0}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() => toggleFeatured(p.id)}
                            className={`text-[10px] font-bold rounded-full px-2.5 py-1 transition-colors ${
                              p.is_featured 
                                ? 'bg-amber-700/20 text-amber-400 border border-amber-700/40' 
                                : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700'
                            }`}
                          >
                            {p.is_featured ? '⭐' : '☆'}
                          </button>
                        </td>
                        <td className="px-4 py-3 text-[11px] text-neutral-400 text-center">
                          {formatTanggal(p.created_at)}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div className="flex items-center justify-center gap-1.5 opacity-70 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => router.push(`/admin/produk/edit/${p.id}`)}
                              title="Edit"
                              className="h-7 w-7 rounded-lg bg-white/5 hover:bg-amber-700/20 hover:text-amber-400 text-neutral-300 text-xs flex items-center justify-center border border-neutral-700 transition-colors"
                            >
                              ✎
                            </button>
                            <button
                              onClick={() => {
                                setSelectedProductId(p.id);
                                setShowSpesifikasiModal(true);
                              }}
                              title="Lihat Spesifikasi"
                              className="h-7 w-7 rounded-lg bg-white/5 hover:bg-blue-700/20 hover:text-blue-400 text-neutral-300 text-xs flex items-center justify-center border border-neutral-700 transition-colors"
                            >
                              📋
                            </button>
                            <button
                              onClick={() => setConfirmDeleteId(p.id)}
                              title="Hapus"
                              className="h-7 w-7 rounded-lg bg-white/5 hover:bg-red-700/20 hover:text-red-400 text-neutral-300 text-xs flex items-center justify-center border border-neutral-700 transition-colors"
                            >
                              🗑
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {paged.length === 0 && (
                <div className="text-center py-14">
                  <span className="text-2xl">🎸</span>
                  <p className="text-xs text-neutral-400 mt-2">Tidak ada produk yang cocok dengan filter ini.</p>
                </div>
              )}

              {/* PAGINATION */}
              {filtered.length > 0 && (
                <div className="flex items-center justify-between px-4 py-3.5 border-t border-neutral-800 text-[11px] text-neutral-500">
                  <span>
                    Menampilkan {(currentPage - 1) * ITEMS_PER_PAGE + 1}–
                    {Math.min(currentPage * ITEMS_PER_PAGE, filtered.length)} dari {filtered.length} produk
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="h-7 w-7 rounded-lg border border-neutral-700 disabled:opacity-30 hover:border-amber-700/60 transition-colors"
                    >
                      ‹
                    </button>
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) pageNum = i + 1;
                      else if (currentPage <= 3) pageNum = i + 1;
                      else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i;
                      else pageNum = currentPage - 2 + i;
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`h-7 w-7 rounded-lg text-[11px] font-bold font-mono-num transition-colors ${
                            currentPage === pageNum ? 'bg-amber-700 text-white' : 'border border-neutral-700 hover:border-amber-700/60'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                    <button
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="h-7 w-7 rounded-lg border border-neutral-700 disabled:opacity-30 hover:border-amber-700/60 transition-colors"
                    >
                      ›
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* ================= CONFIRM DELETE MODAL ================= */}
      {confirmDeleteId !== null && (
        <div className="fixed inset-0 z-[250] flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setConfirmDeleteId(null)} />
          <div className="relative w-full max-w-sm bg-[#14100E] border border-neutral-800 rounded-2xl p-6 animate-fade-up">
            <h3 className="font-display text-base font-semibold text-white mb-2">Hapus produk ini?</h3>
            <p className="text-xs text-neutral-400 mb-6 leading-relaxed">
              Produk akan dihapus permanen dari daftar. Tindakan ini tidak bisa dibatalkan.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDeleteId(null)}
                className="flex-1 text-xs font-bold uppercase tracking-wide text-neutral-300 border border-neutral-700 rounded-xl py-2.5 hover:bg-white/5 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={() => handleDelete(confirmDeleteId)}
                className="flex-1 text-xs font-bold uppercase tracking-wide text-white bg-red-700 hover:bg-red-600 rounded-xl py-2.5 transition-colors"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= SPESIFIKASI MODAL ================= */}
      {showSpesifikasiModal && selectedProduct && (
        <div className="fixed inset-0 z-[260] flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowSpesifikasiModal(false)} />
          <div className="relative w-full max-w-lg bg-[#14100E] border border-neutral-800 rounded-2xl p-6 animate-fade-up max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-base font-semibold text-white">Spesifikasi Produk</h3>
              <button onClick={() => setShowSpesifikasiModal(false)} className="text-neutral-400 hover:text-white text-lg transition-colors">✕</button>
            </div>
            
            <div className="mb-4 pb-4 border-b border-neutral-800">
              <p className="text-sm font-semibold text-white">{selectedProduct.name}</p>
              <p className="text-xs text-neutral-400">{selectedProduct.category_name || '-'}</p>
            </div>

            <div className="flex flex-col gap-2 text-xs bg-white/[0.02] border border-neutral-800/60 rounded-xl p-3">
              {selectedProduct.spesifikasi && Object.keys(selectedProduct.spesifikasi).length > 0 ? (
                Object.entries(selectedProduct.spesifikasi).map(([key, value]) => (
                  <div key={key} className="flex justify-between py-2 border-b border-neutral-800/50 last:border-b-0">
                    <span className="text-neutral-500 font-medium">{key}</span>
                    <span className="text-neutral-200 font-medium">{String(value)}</span>
                  </div>
                ))
              ) : (
                <p className="text-neutral-500 text-center py-4">Belum ada spesifikasi</p>
              )}
            </div>

            <div className="mt-4 pt-4 border-t border-neutral-800 flex justify-end">
              <button
                onClick={() => router.push(`/admin/produk/edit/${selectedProduct.id}`)}
                className="text-xs font-bold text-amber-400 hover:text-amber-300 transition-colors"
              >
                Edit Produk →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= TOAST ================= */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-[300] px-4 py-3 rounded-xl text-xs font-semibold shadow-2xl animate-fade-up border ${
          toast.tone === 'ok' ? 'bg-emerald-900/90 border-emerald-700 text-emerald-200' : 'bg-red-900/90 border-red-700 text-red-200'
        }`}>
          {toast.msg}
        </div>
      )}
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
