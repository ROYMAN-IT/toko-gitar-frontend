'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Fraunces, Inter, JetBrains_Mono } from 'next/font/google';
import { customerAPI, Customer } from '@/lib/api';
import { formatRp } from '@/lib/utils';

const fraunces = Fraunces({ subsets: ['latin'], weight: ['500', '600', '700'], style: ['normal', 'italic'], variable: '--font-display' });
const inter = Inter({ subsets: ['latin'], weight: ['400', '500', '600', '700'], variable: '--font-body' });
const jetbrainsMono = JetBrains_Mono({ subsets: ['latin'], weight: ['400', '600', '700'], variable: '--font-mono' });

type StatusPelanggan = 'Aktif' | 'Nonaktif';
type SortKey = 'terbaru' | 'nama-asc' | 'belanja-desc' | 'belanja-asc' | 'pesanan-desc' | 'pesanan-asc';

const ITEMS_PER_PAGE = 8;

export default function AdminPelangganPage() {
  const router = useRouter();

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusPelanggan | 'Semua'>('Semua');
  const [vipFilter, setVipFilter] = useState<'semua' | 'vip' | 'reguler'>('semua');
  const [sortKey, setSortKey] = useState<SortKey>('terbaru');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const [detailId, setDetailId] = useState<number | null>(null);

  const [confirmBulkDelete, setConfirmBulkDelete] = useState(false);

  const [toast, setToast] = useState<{ msg: string; tone: 'ok' | 'err' } | null>(null);
  const showToast = (msg: string, tone: 'ok' | 'err' = 'ok') => {
    setToast({ msg, tone });
    setTimeout(() => setToast(null), 2600);
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const data = await customerAPI.getAll();
      setCustomers(data || []);
    } catch (error) {
      console.error('Error fetching customers:', error);
      showToast('Gagal memuat data pelanggan', 'err');
    } finally {
      setLoading(false);
    }
  };

  const formatTanggal = (iso: string) =>
    new Date(iso).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
  
  const initials = (name: string) => {
    if (!name || name === 'No Name' || name === '') {
      return '?';
    }
    const parts = name.split(' ').filter(Boolean);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const getDisplayName = (customer: Customer) => {
    if (customer.nama && customer.nama !== 'No Name' && customer.nama !== '') {
      return customer.nama;
    }
    return customer.email?.split('@')[0] || 'User';
  };

  const stats = useMemo(() => {
    const totalPelanggan = customers.length;
    const aktif = customers.filter(c => c.status === 'Aktif').length;
    const vipCount = customers.filter(c => c.vip).length;
    const totalBelanjaSemua = customers.reduce((sum, c) => sum + (c.totalBelanja || 0), 0);
    return { totalPelanggan, aktif, vipCount, totalBelanjaSemua };
  }, [customers]);

  const filtered = useMemo(() => {
    let list = customers.filter(c => {
      const q = searchQuery.toLowerCase();
      const matchSearch =
        (c.nama?.toLowerCase().includes(q) || false) ||
        (c.email?.toLowerCase().includes(q) || false) ||
        (c.telepon?.includes(searchQuery) || false) ||
        String(c.id).includes(searchQuery);
      const matchStatus = statusFilter === 'Semua' || c.status === statusFilter;
      const matchVip = vipFilter === 'semua' || (vipFilter === 'vip' && c.vip) || (vipFilter === 'reguler' && !c.vip);
      return matchSearch && matchStatus && matchVip;
    });

    if (sortKey === 'nama-asc') list = [...list].sort((a, b) => (a.nama || '').localeCompare(b.nama || ''));
    if (sortKey === 'belanja-desc') list = [...list].sort((a, b) => (b.totalBelanja || 0) - (a.totalBelanja || 0));
    if (sortKey === 'belanja-asc') list = [...list].sort((a, b) => (a.totalBelanja || 0) - (b.totalBelanja || 0));
    if (sortKey === 'pesanan-desc') list = [...list].sort((a, b) => (b.totalPesanan || 0) - (a.totalPesanan || 0));
    if (sortKey === 'pesanan-asc') list = [...list].sort((a, b) => (a.totalPesanan || 0) - (b.totalPesanan || 0));
    if (sortKey === 'terbaru') list = [...list].sort((a, b) => (b.id || 0) - (a.id || 0));
    return list;
  }, [customers, searchQuery, statusFilter, vipFilter, sortKey]);

  useEffect(() => { setCurrentPage(1); }, [searchQuery, statusFilter, vipFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paged = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const allVisibleSelected = paged.length > 0 && paged.every(c => selectedIds.includes(c.id));

  const detailCustomer = detailId !== null ? customers.find(c => c.id === detailId) ?? null : null;

  const handleBulkDelete = () => {
    setCustomers(prev => prev.filter(c => !selectedIds.includes(c.id)));
    showToast(`${selectedIds.length} pelanggan dihapus`, 'ok');
    setSelectedIds([]);
    setConfirmBulkDelete(false);
  };

  const toggleVip = async (id: number) => {
    try {
      await customerAPI.toggleVip(id);
      setCustomers(prev => prev.map(c => 
        c.id === id ? { ...c, vip: !c.vip } : c
      ));
      showToast('Status VIP berhasil diubah');
    } catch (error) {
      console.error('Error toggling VIP:', error);
      showToast('Gagal mengubah status VIP', 'err');
    }
  };

  const toggleSelectAllVisible = () => {
    if (allVisibleSelected) {
      setSelectedIds(prev => prev.filter(id => !paged.some(c => c.id === id)));
    } else {
      setSelectedIds(prev => Array.from(new Set([...prev, ...paged.map(c => c.id)])));
    }
  };

  const toggleSelect = (id: number) => {
    setSelectedIds(prev => (prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]));
  };

  return (
    <div className={`${fraunces.variable} ${inter.variable} ${jetbrainsMono.variable} font-body min-h-screen bg-[#0D0A09] text-white flex antialiased`}>
      <style jsx global>{`
        .font-display { font-family: var(--font-display), serif; }
        .font-body { font-family: var(--font-body), sans-serif; }
        .font-mono-num { font-family: var(--font-mono), monospace; }
        @keyframes slideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
        .animate-slide-in { animation: slideIn 0.25s ease-out; }
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
          <SidebarLink icon="🎸" label="Produk" onClick={() => router.push('/admin/produk')} />
          <SidebarLink icon="👥" label="Pelanggan" active />
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
              <span>Admin</span><span>/</span><span className="text-amber-500 font-semibold">Pelanggan</span>
            </div>
            <h1 className="font-display text-xl font-semibold text-white">Kelola Pelanggan</h1>
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
              <div className="bg-white/[0.03] border border-neutral-800 rounded-2xl overflow-hidden">
                <div className="flex flex-col divide-y divide-neutral-800/60">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="flex items-center gap-3 px-4 py-3.5">
                      <div className="h-11 w-11 rounded-full skeleton shrink-0" />
                      <div className="flex flex-col gap-1.5 flex-1">
                        <div className="h-2.5 w-40 rounded skeleton" />
                        <div className="h-2 w-28 rounded skeleton" />
                      </div>
                      <div className="h-2.5 w-16 rounded skeleton" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* STAT CARDS */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-up">
                <StatCard label="Total Pelanggan" value={stats.totalPelanggan.toString()} icon="👥" tone="neutral" />
                <StatCard label="Pelanggan Aktif" value={stats.aktif.toString()} icon="✅" tone="good" />
                <StatCard label="Pelanggan VIP" value={stats.vipCount.toString()} icon="⭐" tone="warn" />
                <StatCard label="Total Belanja" value={formatRp(stats.totalBelanjaSemua)} icon="💰" tone="good" mono />
              </div>

              {/* TOOLBAR */}
              <div className="bg-white/[0.03] border border-neutral-800 rounded-2xl p-4 flex flex-wrap items-center gap-3">
                <div className="relative flex-1 min-w-[200px]">
                  <input
                    type="text"
                    placeholder="Cari nama, email, telepon, atau ID..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-white/5 border border-neutral-700 rounded-xl px-4 py-2.5 pl-9 text-xs text-neutral-200 focus:outline-none focus:border-amber-700 placeholder:text-neutral-500 transition-colors"
                  />
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500 text-xs">🔍</span>
                </div>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as StatusPelanggan | 'Semua')}
                  className="bg-white/5 border border-neutral-700 rounded-xl px-3 py-2.5 text-xs text-neutral-200 focus:outline-none focus:border-amber-700 cursor-pointer"
                >
                  <option className="text-black" value="Semua">Semua Status</option>
                  <option className="text-black" value="Aktif">Aktif</option>
                  <option className="text-black" value="Nonaktif">Nonaktif</option>
                </select>

                <select
                  value={vipFilter}
                  onChange={(e) => setVipFilter(e.target.value as any)}
                  className="bg-white/5 border border-neutral-700 rounded-xl px-3 py-2.5 text-xs text-neutral-200 focus:outline-none focus:border-amber-700 cursor-pointer"
                >
                  <option className="text-black" value="semua">Semua Tipe</option>
                  <option className="text-black" value="vip">VIP</option>
                  <option className="text-black" value="reguler">Reguler</option>
                </select>

                <select
                  value={sortKey}
                  onChange={(e) => setSortKey(e.target.value as SortKey)}
                  className="bg-white/5 border border-neutral-700 rounded-xl px-3 py-2.5 text-xs text-neutral-200 focus:outline-none focus:border-amber-700 cursor-pointer"
                >
                  <option className="text-black" value="terbaru">Terbaru</option>
                  <option className="text-black" value="nama-asc">Nama A–Z</option>
                  <option className="text-black" value="belanja-desc">Belanja Terbanyak</option>
                  <option className="text-black" value="belanja-asc">Belanja Tersedikit</option>
                  <option className="text-black" value="pesanan-desc">Pesanan Terbanyak</option>
                  <option className="text-black" value="pesanan-asc">Pesanan Tersedikit</option>
                </select>

                <button
                  onClick={fetchCustomers}
                  className="bg-white/5 hover:bg-white/10 border border-neutral-700 rounded-xl px-3 py-2.5 text-xs text-neutral-400 transition-colors"
                >
                  🔄 Refresh
                </button>
              </div>

              {/* BULK ACTION BAR */}
              {selectedIds.length > 0 && (
                <div className="bg-amber-900/20 border border-amber-700/40 rounded-xl px-4 py-2.5 flex items-center justify-between animate-fade-up">
                  <span className="text-xs text-amber-300 font-semibold">{selectedIds.length} pelanggan dipilih</span>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setSelectedIds([])} className="text-[10px] uppercase font-bold text-neutral-400 hover:text-neutral-200 px-3 py-1.5 transition-colors">
                      Batal
                    </button>
                    <button
                      onClick={() => setConfirmBulkDelete(true)}
                      className="text-[10px] uppercase font-bold text-white bg-red-700 hover:bg-red-600 rounded-lg px-3 py-1.5 transition-colors"
                    >
                      Hapus Terpilih
                    </button>
                  </div>
                </div>
              )}

              {/* TABLE */}
              <div className="bg-white/[0.03] border border-neutral-800 rounded-2xl overflow-hidden animate-fade-up">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-neutral-800 text-[10px] uppercase tracking-wider text-neutral-500">
                        <th className="px-4 py-3.5 w-10">
                          <input type="checkbox" checked={allVisibleSelected} onChange={toggleSelectAllVisible} className="h-3.5 w-3.5 accent-amber-700 cursor-pointer" />
                        </th>
                        <th className="px-2 py-3.5">Pelanggan</th>
                        <th className="px-4 py-3.5">Telepon</th>
                        <th className="px-4 py-3.5">Pesanan</th>
                        <th className="px-4 py-3.5">Total Belanja</th>
                        <th className="px-4 py-3.5">Bergabung</th>
                        <th className="px-4 py-3.5">Status</th>
                        <th className="px-4 py-3.5">VIP</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paged.map(c => (
                        <tr key={c.id} className="border-b border-neutral-800/60 hover:bg-white/[0.03] transition-colors group">
                          <td className="px-4 py-3">
                            <input type="checkbox" checked={selectedIds.includes(c.id)} onChange={() => toggleSelect(c.id)} className="h-3.5 w-3.5 accent-amber-700 cursor-pointer" />
                          </td>
                          <td className="px-2 py-3">
                            <button onClick={() => setDetailId(c.id)} className="flex items-center gap-3 text-left">
                              <div className="h-11 w-11 rounded-full bg-[#1A1A1A] border border-neutral-800 overflow-hidden shrink-0 flex items-center justify-center">
                                {c.avatar && c.avatar !== '' ? (
                                  <img src={c.avatar} alt={c.nama || c.email} className="w-full h-full object-cover" loading="lazy" />
                                ) : (
                                  <span className="text-sm font-bold text-amber-500">{initials(getDisplayName(c))}</span>
                                )}
                              </div>
                              <div className="flex flex-col min-w-0">
                                <span className="text-xs font-semibold text-neutral-100 truncate max-w-[180px] group-hover:text-amber-400 transition-colors">
                                  {getDisplayName(c)}
                                </span>
                                <span className="text-[9px] text-neutral-500 truncate max-w-[180px]">{c.email}</span>
                              </div>
                            </button>
                          </td>
                          <td className="px-4 py-3 text-xs text-neutral-300 font-mono-num">{c.telepon || '-'}</td>
                          <td className="px-4 py-3 text-xs text-neutral-300 font-mono-num">{c.totalPesanan || 0}</td>
                          <td className="px-4 py-3 text-xs font-bold text-amber-500 font-mono-num">{formatRp(c.totalBelanja || 0)}</td>
                          <td className="px-4 py-3 text-[11px] text-neutral-400">{c.bergabung ? formatTanggal(c.bergabung) : '-'}</td>
                          <td className="px-4 py-3">
                            <span className={`text-[10px] font-bold rounded-full px-2.5 py-1 ${
                              c.status === 'Aktif' ? 'bg-emerald-900/50 text-emerald-300' : 'bg-neutral-800 text-neutral-400'
                            }`}>
                              {c.status || 'Nonaktif'}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <button
                              onClick={() => toggleVip(c.id)}
                              className={`relative h-5 w-9 rounded-full transition-colors ${c.vip ? 'bg-amber-700' : 'bg-neutral-700'}`}
                              title="Toggle status VIP"
                            >
                              <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform ${c.vip ? 'translate-x-4' : 'translate-x-0.5'}`} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {paged.length === 0 && (
                  <div className="text-center py-14">
                    <span className="text-2xl">👥</span>
                    <p className="text-xs text-neutral-400 mt-2">Tidak ada pelanggan yang cocok dengan filter ini.</p>
                  </div>
                )}

                {/* PAGINATION FOOTER */}
                {filtered.length > 0 && (
                  <div className="flex items-center justify-between px-4 py-3.5 border-t border-neutral-800 text-[11px] text-neutral-500">
                    <span>Menampilkan {(currentPage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, filtered.length)} dari {filtered.length} pelanggan</span>
                    <div className="flex items-center gap-1.5">
                      <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="h-7 w-7 rounded-lg border border-neutral-700 disabled:opacity-30 hover:border-amber-700/60 transition-colors">‹</button>
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                        <button key={page} onClick={() => setCurrentPage(page)} className={`h-7 w-7 rounded-lg text-[11px] font-bold font-mono-num transition-colors ${currentPage === page ? 'bg-amber-700 text-white' : 'border border-neutral-700 hover:border-amber-700/60'}`}>
                          {page}
                        </button>
                      ))}
                      <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="h-7 w-7 rounded-lg border border-neutral-700 disabled:opacity-30 hover:border-amber-700/60 transition-colors">›</button>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </main>
      </div>

      {/* ================= DETAIL PELANGGAN MODAL ================= */}
      {detailCustomer && (
        <div className="fixed inset-0 z-[220] flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setDetailId(null)} />
          <div className="relative w-full max-w-sm bg-[#14100E] border border-neutral-800 rounded-2xl p-6 animate-fade-up">
            <button onClick={() => setDetailId(null)} className="absolute top-4 right-4 text-neutral-400 hover:text-white text-lg transition-colors">✕</button>
            <div className="flex items-center gap-3 mb-5">
              <div className="h-14 w-14 rounded-full bg-[#1A1A1A] border border-neutral-800 overflow-hidden shrink-0 flex items-center justify-center">
                {detailCustomer.avatar && detailCustomer.avatar !== '' ? (
                  <img src={detailCustomer.avatar} alt={detailCustomer.nama || detailCustomer.email} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xl font-bold text-amber-500">{initials(getDisplayName(detailCustomer))}</span>
                )}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="font-display text-base font-semibold text-white truncate">
                  {getDisplayName(detailCustomer)}
                </span>
                <span className="text-[10px] font-mono-num text-neutral-500">{detailCustomer.email}</span>
              </div>
              {detailCustomer.vip && (
                <span className="ml-auto text-[9px] font-bold uppercase text-amber-400 bg-amber-900/30 border border-amber-700/40 rounded-full px-2.5 py-1 shrink-0">VIP</span>
              )}
            </div>

            <div className="flex flex-col gap-3 text-xs">
              <DetailRow label="Email" value={detailCustomer.email} />
              <DetailRow label="Telepon" value={detailCustomer.telepon || '-'} />
              <DetailRow label="Alamat" value={detailCustomer.alamat || '-'} />
              <DetailRow label="Status" value={
                <span className={`text-[10px] font-bold rounded-full px-2.5 py-1 ${
                  detailCustomer.status === 'Aktif' ? 'bg-emerald-900/50 text-emerald-300' : 'bg-neutral-800 text-neutral-400'
                }`}>
                  {detailCustomer.status || 'Nonaktif'}
                </span>
              } />
              <DetailRow label="Bergabung" value={detailCustomer.bergabung ? formatTanggal(detailCustomer.bergabung) : '-'} />
              <div className="grid grid-cols-2 gap-3 mt-1">
                <div className="bg-white/[0.03] border border-neutral-800 rounded-xl p-3">
                  <span className="text-[9px] uppercase tracking-wider text-neutral-500 font-bold">Total Pesanan</span>
                  <p className="text-sm font-bold text-neutral-100 font-mono-num mt-1">{detailCustomer.totalPesanan || 0}</p>
                </div>
                <div className="bg-white/[0.03] border border-neutral-800 rounded-xl p-3">
                  <span className="text-[9px] uppercase tracking-wider text-neutral-500 font-bold">Total Belanja</span>
                  <p className="text-sm font-bold text-amber-500 font-mono-num mt-1">{formatRp(detailCustomer.totalBelanja || 0)}</p>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={() => setDetailId(null)} className="flex-1 text-xs font-bold uppercase tracking-wide text-neutral-300 border border-neutral-700 rounded-xl py-2.5 hover:bg-white/5 transition-colors">
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= CONFIRM DELETE (bulk) ================= */}
      {confirmBulkDelete && (
        <ConfirmModal
          title={`Hapus ${selectedIds.length} pelanggan?`}
          message="Semua pelanggan yang dipilih akan dihapus permanen dari daftar. Tindakan ini tidak bisa dibatalkan."
          onCancel={() => setConfirmBulkDelete(false)}
          onConfirm={handleBulkDelete}
        />
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

function StatCard({ label, value, icon, tone, sub, mono }: { label: string; value: string; icon: string; tone: 'neutral' | 'warn' | 'danger' | 'good'; sub?: string; mono?: boolean }) {
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
        {sub && <span className="text-[9px] text-neutral-500 mt-0.5">{sub}</span>}
      </div>
      <span className="text-base opacity-70">{icon}</span>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="text-[10px] uppercase tracking-wide text-neutral-500 font-bold shrink-0 pt-0.5">{label}</span>
      <span className="text-neutral-200 text-right">{value}</span>
    </div>
  );
}

function ConfirmModal({ title, message, onCancel, onConfirm }: { title: string; message: string; onCancel: () => void; onConfirm: () => void }) {
  return (
    <div className="fixed inset-0 z-[250] flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative w-full max-w-sm bg-[#14100E] border border-neutral-800 rounded-2xl p-6 animate-fade-up">
        <h3 className="font-display text-base font-semibold text-white mb-2">{title}</h3>
        <p className="text-xs text-neutral-400 mb-6 leading-relaxed">{message}</p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 text-xs font-bold uppercase tracking-wide text-neutral-300 border border-neutral-700 rounded-xl py-2.5 hover:bg-white/5 transition-colors">
            Batal
          </button>
          <button onClick={onConfirm} className="flex-1 text-xs font-bold uppercase tracking-wide text-white bg-red-700 hover:bg-red-600 rounded-xl py-2.5 transition-colors">
            Hapus
          </button>
        </div>
      </div>
    </div>
  );
}
