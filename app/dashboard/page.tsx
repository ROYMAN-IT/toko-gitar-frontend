'use client';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Fraunces, Inter, JetBrains_Mono } from 'next/font/google';
import { productAPI, cartAPI } from '../lib/api';
import { formatRp } from '../lib/utils';

const fraunces = Fraunces({ subsets: ['latin'], weight: ['500', '600', '700'], style: ['normal', 'italic'], variable: '--font-display' });
const inter = Inter({ subsets: ['latin'], weight: ['400', '500', '600', '700'], variable: '--font-body' });
const jetbrainsMono = JetBrains_Mono({ subsets: ['latin'], weight: ['400', '600', '700'], variable: '--font-mono' });

type SortKey = 'relevan' | 'harga-asc' | 'harga-desc' | 'stok-desc' | 'rating-desc';

const ITEMS_PER_PAGE = 6;

export default function DashboardKatalog() {
  const router = useRouter();

  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ msg: string; tone: 'ok' | 'err' } | null>(null);
  const [cartCount, setCartCount] = useState(0);
  const [user, setUser] = useState<any>(null);

  const [isOpenKategori, setIsOpenKategori] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedKategori, setSelectedKategori] = useState<string[]>([]);
  const [sortKey, setSortKey] = useState<SortKey>('relevan');
  const [priceMin, setPriceMin] = useState<string>('');
  const [priceMax, setPriceMax] = useState<string>('');
  const [minRating, setMinRating] = useState<number>(0);
  const [onlyStock, setOnlyStock] = useState(false);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchProducts();
    fetchCartCount();
    fetchUser();
    
    const handleCartUpdate = (e: any) => {
      setCartCount(e.detail.count);
    };
    
    window.addEventListener('cartUpdated', handleCartUpdate);
    return () => window.removeEventListener('cartUpdated', handleCartUpdate);
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await productAPI.getAll({ limit: 100 });
      setProducts(data.data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCartCount = async () => {
    try {
      const cartData = await cartAPI.getCart();
      if (cartData && cartData.items) {
        const totalItems = cartData.items.reduce((sum: number, item: any) => sum + item.quantity, 0);
        setCartCount(totalItems);
      } else {
        setCartCount(0);
      }
    } catch (error) {
      console.error('Error fetching cart count:', error);
      setCartCount(0);
    }
  };

  const fetchUser = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data);
      }
    } catch (error) {
      console.error('Error fetching user:', error);
    }
  };

  const kategoriList = useMemo(() => {
    const uniqueCategories = new Set<string>();
    products.forEach(p => {
      if (p.category_name) {
        uniqueCategories.add(p.category_name);
      }
    });
    return Array.from(uniqueCategories);
  }, [products]);

  const formatRpLocal = (n: number) => {
    if (!n) return 'Rp 0';
    return `Rp ${n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')}`;
  };

  const toggleKategori = (kat: string) => {
    setCurrentPage(1);
    setSelectedKategori(prev => prev.includes(kat) ? prev.filter(k => k !== kat) : [...prev, kat]);
  };

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedKategori([]);
    setPriceMin('');
    setPriceMax('');
    setMinRating(0);
    setOnlyStock(false);
    setCurrentPage(1);
  };

  const filteredProducts = useMemo(() => {
    const min = priceMin ? Number(priceMin) : 0;
    const max = priceMax ? Number(priceMax) : Infinity;
    let list = products.filter(p => {
      const matchSearch = p.name?.toLowerCase().includes(searchQuery.toLowerCase()) || false;
      const matchKategori = selectedKategori.length === 0 || selectedKategori.includes(p.category_name);
      const matchHarga = (p.price || 0) >= min && (p.price || 0) <= max;
      const matchRating = (p.rating || 0) >= minRating;
      const matchStock = !onlyStock || (p.stock || 0) > 0;
      return matchSearch && matchKategori && matchHarga && matchRating && matchStock;
    });
    if (sortKey === 'harga-asc') list = [...list].sort((a, b) => (a.price || 0) - (b.price || 0));
    if (sortKey === 'harga-desc') list = [...list].sort((a, b) => (b.price || 0) - (a.price || 0));
    if (sortKey === 'stok-desc') list = [...list].sort((a, b) => (b.stock || 0) - (a.stock || 0));
    if (sortKey === 'rating-desc') list = [...list].sort((a, b) => (b.rating || 0) - (a.rating || 0));
    return list;
  }, [products, searchQuery, selectedKategori, sortKey, priceMin, priceMax, minRating, onlyStock]);

  useEffect(() => { setCurrentPage(1); }, [searchQuery, selectedKategori, priceMin, priceMax, minRating, onlyStock]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / ITEMS_PER_PAGE));
  const pagedProducts = filteredProducts.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const activeFilterCount = selectedKategori.length + (priceMin ? 1 : 0) + (priceMax ? 1 : 0) + (minRating > 0 ? 1 : 0) + (onlyStock ? 1 : 0);

  // Fungsi untuk mendapatkan inisial dari nama user
  const getUserInitials = (nama: string) => {
    if (!nama) return '?';
    const parts = nama.trim().split(' ');
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };

  const FilterPanelContent = (
    <div className="flex flex-col gap-6">
      <div>
        <h4 className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-2.5 flex items-center gap-1.5">
          <span className="text-amber-500">▸</span> Kategori
        </h4>
        <div className="flex flex-col gap-2">
          {kategoriList.length === 0 ? (
            <p className="text-xs text-neutral-500">Belum ada kategori</p>
          ) : (
            kategoriList.map(kat => {
              const count = products.filter(p => p.category_name === kat).length;
              return (
                <label key={kat} className="flex items-center gap-2.5 text-xs text-neutral-200 cursor-pointer group/check">
                  <input
                    type="checkbox"
                    checked={selectedKategori.includes(kat)}
                    onChange={() => toggleKategori(kat)}
                    className="h-3.5 w-3.5 rounded accent-amber-700 cursor-pointer"
                  />
                  <span className="group-hover/check:text-amber-500 transition-colors">{kat}</span>
                  <span className="ml-auto text-[10px] text-neutral-500 font-mono-num bg-white/5 rounded-full px-1.5">{count}</span>
                </label>
              );
            })
          )}
        </div>
      </div>

      <div className="h-px bg-gradient-to-r from-transparent via-neutral-700/60 to-transparent" />

      <div>
        <h4 className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-2.5 flex items-center gap-1.5">
          <span className="text-amber-500">▸</span> Rentang Harga
        </h4>
        <div className="flex items-center gap-2">
          <input
            type="number"
            placeholder="Min"
            value={priceMin}
            onChange={(e) => setPriceMin(e.target.value)}
            className="w-full bg-white/5 border border-neutral-600/40 rounded-lg px-2.5 py-1.5 text-[11px] text-neutral-200 focus:outline-none focus:border-amber-700 transition-colors"
          />
          <span className="text-neutral-500 text-xs">–</span>
          <input
            type="number"
            placeholder="Max"
            value={priceMax}
            onChange={(e) => setPriceMax(e.target.value)}
            className="w-full bg-white/5 border border-neutral-600/40 rounded-lg px-2.5 py-1.5 text-[11px] text-neutral-200 focus:outline-none focus:border-amber-700 transition-colors"
          />
        </div>
      </div>

      <div className="h-px bg-gradient-to-r from-transparent via-neutral-700/60 to-transparent" />

      <div>
        <h4 className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-2.5 flex items-center gap-1.5">
          <span className="text-amber-500">▸</span> Rating Minimum
        </h4>
        <div className="flex flex-col gap-2">
          {[0, 4, 4.5].map(r => (
            <label key={r} className="flex items-center gap-2.5 text-xs text-neutral-200 cursor-pointer group/radio">
              <input
                type="radio"
                name="rating"
                checked={minRating === r}
                onChange={() => setMinRating(r)}
                className="h-3.5 w-3.5 accent-amber-700 cursor-pointer"
              />
              <span className="group-hover/radio:text-amber-500 transition-colors">{r === 0 ? 'Semua Rating' : `★ ${r}+`}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="h-px bg-gradient-to-r from-transparent via-neutral-700/60 to-transparent" />

      <label className="flex items-center gap-2.5 text-xs text-neutral-200 cursor-pointer group/stock">
        <input
          type="checkbox"
          checked={onlyStock}
          onChange={(e) => setOnlyStock(e.target.checked)}
          className="h-3.5 w-3.5 rounded accent-amber-700 cursor-pointer"
        />
        <span className="group-hover/stock:text-amber-500 transition-colors">Hanya yang tersedia</span>
      </label>

      {activeFilterCount > 0 && (
        <button
          onClick={resetFilters}
          className="text-[10px] font-bold uppercase tracking-wide text-red-400 hover:text-red-300 border border-red-800/40 rounded-full px-3 py-1.5 self-start transition-colors"
        >
          ✕ Hapus semua filter ({activeFilterCount})
        </button>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0D0A09] text-white flex flex-col items-center justify-center gap-3">
        <style jsx global>{`
          @keyframes shimmer { 0% { background-position: -400px 0; } 100% { background-position: 400px 0; } }
          .skeleton { background: linear-gradient(90deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.12) 50%, rgba(255,255,255,0.05) 100%); background-size: 800px 100%; animation: shimmer 1.6s infinite linear; }
        `}</style>
        <span className="text-3xl animate-bounce">🎸</span>
        <div className="text-neutral-500 text-sm">Memuat produk...</div>
      </div>
    );
  }

  return (
    <div
      className={`${fraunces.variable} ${inter.variable} ${jetbrainsMono.variable} font-body min-h-screen text-white flex flex-col items-center pt-0 px-0 pb-24 overflow-x-hidden bg-[#0D0A09] bg-cover bg-center bg-no-repeat bg-fixed relative antialiased selection:bg-amber-700 selection:text-white`}
      style={{ backgroundImage: `url('/background keranjang2.jpg')`, backgroundBlendMode: 'overlay' }}
    >
      <style jsx global>{`
        .font-display { font-family: var(--font-display), serif; }
        .font-body { font-family: var(--font-body), sans-serif; }
        .font-mono-num { font-family: var(--font-mono), monospace; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }

        @keyframes cardEnter {
          from { opacity: 0; transform: translateY(16px) scale(0.97); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .card-enter { animation: cardEnter 0.5s cubic-bezier(0.16,1,0.3,1) both; }

        @keyframes cardShine2 {
          0% { transform: translateX(-120%) rotate(10deg); }
          100% { transform: translateX(220%) rotate(10deg); }
        }
        .card-shine2::after {
          content: '';
          position: absolute;
          top: -50%;
          left: 0;
          width: 35%;
          height: 200%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
          transform: translateX(-120%) rotate(10deg);
          pointer-events: none;
        }
        .group:hover .card-shine2::after {
          animation: cardShine2 0.8s ease-out;
        }

        @media (prefers-reduced-motion: reduce) {
          .card-enter { animation: none !important; }
        }
      `}</style>

      <div
        className="absolute inset-0 pointer-events-none z-0"
        style={{
          backgroundImage:
            'linear-gradient(180deg, rgba(13,10,9,0.90) 0%, rgba(13,10,9,0.58) 40%, rgba(13,10,9,0.97) 100%), radial-gradient(circle at 50% 12%, rgba(194,112,61,0.18), transparent 60%), radial-gradient(circle at 90% 90%, rgba(217,122,63,0.08), transparent 50%)',
        }}
      />

      <div
        className="absolute inset-0 pointer-events-none z-0 opacity-[0.04] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
          backgroundSize: '140px 140px',
        }}
      />

      <div
        className="absolute inset-0 pointer-events-none z-0"
        style={{ boxShadow: 'inset 0 0 180px 60px rgba(0,0,0,0.45)' }}
      />

      <nav className="w-full bg-[#FFFDF6]/95 text-black px-4 md:px-12 py-3.5 flex justify-between items-center shadow-[0_4px_30px_rgba(0,0,0,0.5)] border-b border-gray-300/50 backdrop-blur-md sticky top-0 z-50 overflow-visible">
        <div className="flex items-center gap-8 overflow-visible">
          <div className="flex items-center gap-3 overflow-visible">
            <Link 
              href="/cart" 
              className="font-display font-semibold text-base tracking-wide flex items-center gap-1.5 select-none text-neutral-900 hover:text-amber-700 transition-colors"
            >
              <span className="text-lg filter drop-shadow">🎸</span> GitarKu
            </Link>
          </div>

          <div className="hidden sm:flex gap-6 font-bold text-xs uppercase tracking-wide items-center select-none overflow-visible">
            <span className="cursor-pointer text-amber-800 transition-colors duration-300 relative after:absolute after:bottom-[-20px] after:left-0 after:w-full after:h-[3px] after:bg-amber-700 after:rounded-full">Produk</span>

            <div className="relative overflow-visible">
              <button
                onClick={() => setIsOpenKategori(!isOpenKategori)}
                className={`cursor-pointer font-bold text-xs uppercase tracking-wide transition-all duration-300 flex items-center gap-1 focus:outline-none ${isOpenKategori || selectedKategori.length > 0 ? 'text-amber-800' : 'text-neutral-500 hover:text-neutral-900'}`}
              >
                Kategori <span className={`text-[8px] transition-transform duration-300 ${isOpenKategori ? 'rotate-180' : ''}`}>▼</span>
              </button>

              {isOpenKategori && (
                <div className="absolute top-full left-0 mt-5 w-48 bg-[#FFFDF6] text-neutral-800 rounded-xl py-1.5 shadow-[0_10px_30px_rgba(0,0,0,0.25)] border border-gray-200/80 flex flex-col z-[100] animate-fade-in">
                  {kategoriList.length === 0 ? (
                    <span className="px-4 py-2 text-xs text-neutral-400">Belum ada kategori</span>
                  ) : (
                    kategoriList.map((kat, i) => (
                      <button
                        key={kat}
                        onClick={() => { toggleKategori(kat); setIsOpenKategori(false); }}
                        className={`px-4 py-2 text-xs hover:bg-neutral-900/[0.04] hover:text-amber-800 cursor-pointer transition-colors duration-150 text-left font-medium ${i > 0 ? 'border-t border-neutral-100' : ''} ${selectedKategori.includes(kat) ? 'text-amber-800' : ''}`}
                      >
                        {kat}
                      </button>
                    ))
                  )}
                  {selectedKategori.length > 0 && (
                    <button
                      onClick={() => { setSelectedKategori([]); setIsOpenKategori(false); }}
                      className="px-4 py-2 text-xs hover:bg-neutral-900/[0.04] hover:text-red-700 cursor-pointer transition-colors duration-150 text-left font-medium border-t border-neutral-100 text-neutral-400"
                    >
                      ✕ Hapus filter
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex-1 max-w-md mx-4 md:mx-8 relative hidden md:block">
          <input
            type="text"
            placeholder="Cari gitar impianmu disini..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-neutral-900/[0.05] border border-neutral-300 text-neutral-800 px-4 py-1.5 pl-10 rounded-xl text-xs focus:outline-none focus:border-amber-700 focus:bg-white transition-all duration-300 shadow-[inset_0_1px_2px_rgba(0,0,0,0.05)]"
          />
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 text-xs pointer-events-none">🔍</span>
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 text-xs font-bold">✕</button>
          )}
        </div>

        <div className="flex items-center gap-5 text-lg font-medium text-neutral-700">
          {user?.nama && (
            <span className="text-sm font-medium text-neutral-700 hidden lg:inline-block">
              Halo, {user.nama} 👋
            </span>
          )}
          
          <Link href="/cart" title="Keranjang" className="hover:scale-110 hover:text-amber-800 active:scale-95 transition-all duration-200 cursor-pointer relative">
            🛒
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-red-600 h-3 w-3 rounded-full border border-white shadow-md animate-pulse" />
            )}
          </Link>
          
          <button 
            onClick={() => router.push('/myprofile')} 
            title="Profil" 
            className="hover:scale-110 active:scale-95 transition-all duration-200 cursor-pointer flex items-center justify-center"
          >
            {user?.avatar ? (
              <img 
                src={user.avatar} 
                alt="Profile" 
                className="w-8 h-8 rounded-full object-cover border-2 border-amber-700/50 hover:border-amber-500 transition"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-neutral-200 border-2 border-amber-700/50 hover:border-amber-500 transition flex items-center justify-center text-neutral-700 text-sm font-bold">
                {user?.nama ? getUserInitials(user.nama) : (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-neutral-400">
                    <path fillRule="evenodd" d="M18.685 19.097A9.723 9.723 0 0021.75 12c0-5.385-4.365-9.75-9.75-9.75S2.25 6.615 2.25 12a9.723 9.723 0 003.065 7.097A9.716 9.716 0 0012 21.75a9.716 9.716 0 006.685-2.653zm-12.54-1.285A7.486 7.486 0 0112 15a7.486 7.486 0 015.855 2.812A8.224 8.224 0 0112 20.25a8.224 8.224 0 01-5.855-2.438zM15.75 9a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
            )}
          </button>
        </div>
      </nav>

      <div className="w-full max-w-6xl relative z-10 mt-5 px-4">
        <div className="flex items-center gap-1.5 text-[10px] text-neutral-400 select-none">
          <span className="hover:text-amber-500 cursor-pointer transition-colors">Beranda</span>
          <span>/</span>
          <span className="text-amber-500 font-semibold">Katalog Produk</span>
        </div>
      </div>

      <div className="w-full max-w-6xl relative z-10 mt-3 px-4">
        <div className="w-full rounded-2xl border border-amber-800/30 bg-gradient-to-r from-[#1A1613]/80 via-[#1A1613]/50 to-transparent px-6 py-7 md:px-10 md:py-9 flex flex-col gap-2 relative overflow-hidden">
          <div className="absolute right-0 top-0 h-full w-1/3 opacity-[0.07] pointer-events-none select-none text-[120px] leading-none flex items-center justify-end pr-4">🎸</div>
          <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-amber-500 flex items-center gap-2">
            <span className="w-4 h-px bg-amber-500" /> Koleksi Terkurasi
          </span>
          <h1 className="font-display italic text-2xl md:text-4xl text-white leading-tight max-w-lg">
            Temukan senar yang cocok untuk suaramu.
          </h1>
          <p className="text-xs text-neutral-400 max-w-md mt-1">Setiap gitar diperiksa manual sebelum sampai ke tanganmu. Garansi resmi, kondisi terjamin.</p>
        </div>

        <div className="w-full grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
          {[
            { icon: '🚚', label: 'Gratis Ongkir', sub: 'Min. belanja 500rb' },
            { icon: '🛡️', label: 'Garansi Resmi', sub: '1 tahun servis' },
            { icon: '💳', label: 'Cicilan 0%', sub: 'Hingga 12 bulan' },
            { icon: '↩️', label: 'Retur Mudah', sub: '7 hari uang kembali' },
          ].map(item => (
            <div key={item.label} className="flex items-center gap-2.5 bg-white/[0.04] border border-neutral-700/30 rounded-xl px-3 py-2.5 hover:bg-white/[0.08] hover:border-amber-700/40 transition-all duration-300">
              <span className="text-base">{item.icon}</span>
              <div className="flex flex-col leading-tight">
                <span className="text-[10px] font-bold text-neutral-200">{item.label}</span>
                <span className="text-[9px] text-neutral-500">{item.sub}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="w-full max-w-6xl relative z-10 mt-8 px-4 flex gap-8 items-start">

        <aside className="hidden lg:block w-56 shrink-0 sticky top-24 bg-white/[0.03] border border-neutral-700/30 rounded-2xl p-5">
          <h3 className="font-display text-sm font-semibold text-white mb-4 flex items-center gap-1.5">
            <span className="text-amber-500">⚙</span> Filter Produk
          </h3>
          {FilterPanelContent}
        </aside>

        <div className="flex-1 min-w-0 flex flex-col">

          <div className="w-full mb-5 relative block md:hidden">
            <input
              type="text"
              placeholder="Cari gitar impianmu disini..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#FFFDF6] border border-neutral-300 text-neutral-800 px-4 py-2 pl-10 rounded-xl text-xs focus:outline-none shadow-sm"
            />
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 text-xs">🔍</span>
          </div>

          <div className="w-full mb-5 flex lg:hidden gap-2">
            <button
              onClick={() => setMobileFilterOpen(true)}
              className="flex-1 flex items-center justify-center gap-1.5 bg-white/5 border border-neutral-600/40 rounded-xl px-3 py-2 text-[11px] font-bold text-neutral-200"
            >
              ⚙️ Filter {activeFilterCount > 0 && <span className="bg-amber-700 text-white rounded-full h-4 w-4 flex items-center justify-center text-[9px]">{activeFilterCount}</span>}
            </button>
          </div>

          <div className="w-full mb-6 flex flex-wrap gap-3 justify-between items-center text-xs text-neutral-400 select-none">
            <div>Menampilkan <span className="text-amber-500 font-bold font-mono-num">{filteredProducts.length}</span> produk terbaik</div>

            <div className="flex items-center gap-3">
              {searchQuery && <button onClick={() => setSearchQuery('')} className="text-amber-500 hover:underline">Reset Pencarian</button>}
              <label className="flex items-center gap-1.5">
                <span className="hidden sm:inline text-[10px] uppercase tracking-wide">Urutkan:</span>
                <select
                  value={sortKey}
                  onChange={(e) => setSortKey(e.target.value as SortKey)}
                  className="bg-white/5 border border-neutral-600/40 rounded-lg px-2.5 py-1.5 text-[10px] text-neutral-200 focus:outline-none focus:border-amber-700 cursor-pointer"
                >
                  <option className="text-black" value="relevan">Paling Relevan</option>
                  <option className="text-black" value="harga-asc">Harga Terendah</option>
                  <option className="text-black" value="harga-desc">Harga Tertinggi</option>
                  <option className="text-black" value="stok-desc">Stok Terbanyak</option>
                  <option className="text-black" value="rating-desc">Rating Tertinggi</option>
                </select>
              </label>
            </div>
          </div>

          {(selectedKategori.length > 0 || priceMin || priceMax || minRating > 0 || onlyStock) && (
            <div className="w-full mb-5 flex flex-wrap gap-2">
              {selectedKategori.map(kat => (
                <span key={kat} onClick={() => toggleKategori(kat)} className="cursor-pointer text-[10px] bg-amber-700/20 border border-amber-700/40 text-amber-400 rounded-full px-3 py-1 flex items-center gap-1.5 hover:bg-amber-700/30 transition-colors">
                  {kat} ✕
                </span>
              ))}
              {(priceMin || priceMax) && (
                <span onClick={() => { setPriceMin(''); setPriceMax(''); }} className="cursor-pointer text-[10px] bg-amber-700/20 border border-amber-700/40 text-amber-400 rounded-full px-3 py-1 flex items-center gap-1.5 hover:bg-amber-700/30 transition-colors">
                  {priceMin ? formatRpLocal(Number(priceMin)) : 'Rp0'} - {priceMax ? formatRpLocal(Number(priceMax)) : '∞'} ✕
                </span>
              )}
              {minRating > 0 && (
                <span onClick={() => setMinRating(0)} className="cursor-pointer text-[10px] bg-amber-700/20 border border-amber-700/40 text-amber-400 rounded-full px-3 py-1 flex items-center gap-1.5 hover:bg-amber-700/30 transition-colors">
                  ★ {minRating}+ ✕
                </span>
              )}
              {onlyStock && (
                <span onClick={() => setOnlyStock(false)} className="cursor-pointer text-[10px] bg-amber-700/20 border border-amber-700/40 text-amber-400 rounded-full px-3 py-1 flex items-center gap-1.5 hover:bg-amber-700/30 transition-colors">
                  Tersedia ✕
                </span>
              )}
            </div>
          )}

          {pagedProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 w-full">
              {pagedProducts.map((product, idx) => {
                return (
                  <div
                    key={product.id}
                    className="card-enter card-shine2 w-full bg-[#FFFDF6] text-black p-4 rounded-2xl flex flex-col shadow-[0_15px_35px_rgba(0,0,0,0.5)] hover:shadow-[0_28px_55px_rgba(0,0,0,0.65)] hover:-translate-y-2 transition-all duration-300 ease-out border border-gray-200/40 relative group overflow-hidden"
                    style={{ animationDelay: `${(idx % ITEMS_PER_PAGE) * 0.06}s` }}
                  >
                    <button
                      onClick={() => router.push(`/produk/${product.id}`)}
                      className="w-full aspect-square bg-[#1A1A1A] rounded-xl flex items-center justify-center overflow-hidden p-0 mb-3.5 relative shadow-[inset_0_4px_20px_rgba(0,0,0,0.8)] border border-neutral-800/90 transition-all duration-300 cursor-pointer"
                      title={`Lihat detail ${product.name}`}
                    >
                      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/5 to-black/40 opacity-40 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10" />
                      {product.image ? (
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover object-center drop-shadow-[0_10px_20px_rgba(0,0,0,0.8)] group-hover:scale-110 transition-transform duration-500 ease-out"
                          loading="lazy"
                        />
                      ) : (
                        <span className="text-6xl opacity-30">🎸</span>
                      )}

                      <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 z-20">
                        <div className="bg-black/70 backdrop-blur-md px-2 py-0.5 rounded text-[9px] font-bold text-amber-500 select-none tracking-wide font-mono-num">
                          STOK: {product.stock || 0}
                        </div>
                      </div>
                    </button>

                    <div className="w-full flex flex-col mb-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] font-mono-num text-neutral-400 font-bold tracking-wider">#{String(product.id).padStart(3, '0')}</span>
                      </div>
                      <h3
                        onClick={() => router.push(`/produk/${product.id}`)}
                        className="font-display text-sm font-semibold text-neutral-800 tracking-wide line-clamp-1 mt-0.5 group-hover:text-amber-700 transition-colors duration-200 cursor-pointer"
                      >
                        {product.name}
                      </h3>
                      <div className="flex items-center justify-between mt-0.5">
                        <span className="text-[9px] text-neutral-400 uppercase tracking-wide font-bold">{product.category_name || '-'}</span>
                      </div>
                    </div>

                    <div className="w-full flex items-center justify-between mt-auto pt-2 border-t border-neutral-100 gap-2">
                      <div className="flex flex-col">
                        <span className="text-xs font-black text-amber-900 font-mono-num tracking-tight">{formatRpLocal(product.price)}</span>
                      </div>

                      <div className="flex gap-1.5">
                        <button
                          onClick={() => router.push(`/produk/${product.id}`)}
                          className="hover:text-amber-800 hover:bg-amber-100 transition-all duration-200 cursor-pointer p-2 bg-neutral-900/[0.03] rounded-lg border border-neutral-200"
                          title="Lihat Detail"
                        >
                          🔍
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="w-full max-w-md mx-auto text-center py-16 bg-[#FFFDF6]/10 backdrop-blur-sm rounded-2xl border border-neutral-700/30">
              <span className="text-3xl">🎸</span>
              <h3 className="font-display text-sm font-semibold mt-3 text-white">Gitar Tidak Ditemukan</h3>
              <p className="text-xs text-neutral-400 mt-1 px-4">
                {searchQuery
                  ? <>Maaf, kata kunci "{searchQuery}" tidak cocok dengan instrumen apa pun di katalog kami.</>
                  : <>Coba ubah atau kurangi filter yang aktif.</>}
              </p>
              <button
                onClick={resetFilters}
                className="mt-4 text-[10px] font-bold uppercase tracking-wide text-amber-500 hover:text-amber-400 border border-amber-700/40 rounded-full px-4 py-1.5 transition-colors"
              >
                Tampilkan Semua Produk
              </button>
            </div>
          )}

          {filteredProducts.length > 0 && totalPages > 1 && (
            <div className="w-full flex items-center justify-center gap-1.5 mt-9">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="h-8 w-8 rounded-lg border border-neutral-600/40 bg-white/5 text-xs text-neutral-300 disabled:opacity-30 disabled:cursor-not-allowed hover:border-amber-700/60 transition-colors"
              >
                ‹
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`h-8 w-8 rounded-lg text-xs font-bold font-mono-num transition-colors ${
                    currentPage === page ? 'bg-amber-700 text-white' : 'bg-white/5 border border-neutral-600/40 text-neutral-300 hover:border-amber-700/60'
                  }`}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="h-8 w-8 rounded-lg border border-neutral-600/40 bg-white/5 text-xs text-neutral-300 disabled:opacity-30 disabled:cursor-not-allowed hover:border-amber-700/60 transition-colors"
              >
                ›
              </button>
            </div>
          )}
        </div>
      </div>

      {mobileFilterOpen && (
        <div className="fixed inset-0 z-[200] flex lg:hidden">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setMobileFilterOpen(false)} />
          <div className="relative ml-auto w-[85%] max-w-xs h-full bg-[#14100E] border-l border-neutral-700/40 p-5 overflow-y-auto animate-fade-in">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-display text-sm font-semibold text-white">Filter Produk</h3>
              <button onClick={() => setMobileFilterOpen(false)} className="text-neutral-400 hover:text-white text-lg">✕</button>
            </div>
            {FilterPanelContent}
            <button
              onClick={() => setMobileFilterOpen(false)}
              className="w-full mt-6 bg-amber-700 hover:bg-amber-600 text-white text-xs font-bold uppercase tracking-wide rounded-xl py-2.5 transition-colors"
            >
              Terapkan Filter
            </button>
          </div>
        </div>
      )}

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