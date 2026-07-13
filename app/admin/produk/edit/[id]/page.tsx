'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Fraunces, Inter, JetBrains_Mono } from 'next/font/google';
import { productAPI, categoryAPI, Product, Category } from '@/lib/api';

const fraunces = Fraunces({ subsets: ['latin'], weight: ['500', '600', '700'], style: ['normal', 'italic'], variable: '--font-display' });
const inter = Inter({ subsets: ['latin'], weight: ['400', '500', '600', '700'], variable: '--font-body' });
const jetbrainsMono = JetBrains_Mono({ subsets: ['latin'], weight: ['400', '600', '700'], variable: '--font-mono' });

// Fungsi kompres gambar
const compressImage = (file: File, maxWidth: number = 800, quality: number = 0.7): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        let width = img.width;
        let height = img.height;
        if (width > maxWidth) {
          height = (maxWidth / width) * height;
          width = maxWidth;
        }
        
        canvas.width = width;
        canvas.height = height;
        ctx?.drawImage(img, 0, 0, width, height);
        
        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedDataUrl);
      };
      img.onerror = reject;
    };
    reader.onerror = reject;
  });
};

export default function EditProduk() {
  const router = useRouter();
  const params = useParams();
  const id = params.id;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [toast, setToast] = useState<{ msg: string; tone: 'ok' | 'err' } | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [isCompressing, setIsCompressing] = useState(false);

  const [formData, setFormData] = useState({
    category_id: '',
    name: '',
    description: '',
    price: '',
    stock: '',
    image: '',
    rating: '',
    terjual: '',
    is_featured: false,
    body: '',
    neck: '',
    fret: '',
    scale: '',
    pickup: '',
    color: '',
    weight: '',
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      const categoriesData = await categoryAPI.getAll();
      setCategories(categoriesData || []);

      try {
        const productData = await productAPI.getById(Number(id));
        
        // Parse spesifikasi dari JSON
        const spesifikasi = productData.spesifikasi || {};
        
        setFormData({
          category_id: String(productData.category_id),
          name: productData.name,
          description: productData.description || '',
          price: String(productData.price),
          stock: String(productData.stock),
          image: productData.image || '',
          rating: String(productData.rating || 0),
          terjual: String(productData.terjual || 0),
          is_featured: productData.is_featured || false,
          body: spesifikasi.Body || '',
          neck: spesifikasi.Neck || '',
          fret: spesifikasi.Fret || '',
          scale: spesifikasi['Scale Length'] || '',
          pickup: spesifikasi.Pickup || '',
          color: spesifikasi.Color || '',
          weight: spesifikasi.Weight || '',
        });
        setImagePreview(productData.image || '');
      } catch (error: any) {
        console.error('Product not found:', error);
        setToast({ msg: 'Produk tidak ditemukan!', tone: 'err' });
        setTimeout(() => {
          router.push('/admin/produk');
        }, 1500);
        return;
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setToast({ msg: 'Gagal memuat data produk', tone: 'err' });
      setTimeout(() => router.push('/admin/produk'), 1500);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setToast({ msg: 'Ukuran gambar maksimal 5MB!', tone: 'err' });
      return;
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      setToast({ msg: 'Format gambar harus JPG, PNG, atau WEBP!', tone: 'err' });
      return;
    }

    setIsCompressing(true);
    try {
      const compressedDataUrl = await compressImage(file, 800, 0.7);
      setImagePreview(compressedDataUrl);
      setFormData({ ...formData, image: compressedDataUrl });
      setImageFile(file);
      setToast({ msg: 'Gambar berhasil diupload!', tone: 'ok' });
    } catch (error) {
      console.error('Error compressing image:', error);
      setToast({ msg: 'Gagal memproses gambar', tone: 'err' });
    } finally {
      setIsCompressing(false);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview('');
    setFormData({ ...formData, image: '' });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!formData.category_id) errs.category_id = 'Kategori wajib dipilih';
    if (!formData.name.trim()) errs.name = 'Nama produk wajib diisi';
    if (!formData.price) errs.price = 'Harga wajib diisi';
    if (Number(formData.price) <= 0) errs.price = 'Harga harus lebih dari 0';
    if (!formData.stock) errs.stock = 'Stok wajib diisi';
    if (Number(formData.stock) < 0) errs.stock = 'Stok tidak boleh negatif';
    if (formData.rating && (Number(formData.rating) < 0 || Number(formData.rating) > 5)) {
      errs.rating = 'Rating harus antara 0 - 5';
    }
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSaving(true);
    try {
      const spesifikasiObj: Record<string, string> = {};
      if (formData.body) spesifikasiObj.Body = formData.body;
      if (formData.neck) spesifikasiObj.Neck = formData.neck;
      if (formData.fret) spesifikasiObj.Fret = formData.fret;
      if (formData.scale) spesifikasiObj['Scale Length'] = formData.scale;
      if (formData.pickup) spesifikasiObj.Pickup = formData.pickup;
      if (formData.color) spesifikasiObj.Color = formData.color;
      if (formData.weight) spesifikasiObj.Weight = formData.weight;

      await productAPI.update(Number(id), {
        category_id: Number(formData.category_id),
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: Number(formData.price),
        stock: Number(formData.stock),
        image: formData.image || null,
        rating: formData.rating ? Number(formData.rating) : 0,
        spesifikasi: spesifikasiObj,
        terjual: formData.terjual ? Number(formData.terjual) : 0,
        is_featured: formData.is_featured,
      });

      setToast({ msg: 'Produk berhasil diupdate!', tone: 'ok' });
      setTimeout(() => {
        router.push('/admin/produk');
        router.refresh();
      }, 1500);
    } catch (error: any) {
      console.error('Error updating product:', error);
      setToast({ msg: error.message || 'Gagal mengupdate produk', tone: 'err' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className={`${fraunces.variable} ${inter.variable} ${jetbrainsMono.variable} font-body min-h-screen bg-[#0D0A09] text-white flex`}>
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
            <div className="h-px bg-neutral-800 my-3" />
            {/* ⭐ PENGATURAN DIHAPUS */}
          </nav>
          <div className="px-3 py-4 border-t border-neutral-800">
            <button onClick={() => router.push('/')} className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold text-neutral-400 hover:bg-red-950/40 hover:text-red-400 transition-colors">
              <span>➜</span> Keluar
            </button>
          </div>
        </aside>
        <div className="flex-1 ml-60 flex items-center justify-center">
          <div className="text-neutral-500">Memuat data produk...</div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${fraunces.variable} ${inter.variable} ${jetbrainsMono.variable} font-body min-h-screen bg-[#0D0A09] text-white flex antialiased`}>
      <style jsx global>{`
        .font-display { font-family: var(--font-display), serif; }
        .font-body { font-family: var(--font-body), sans-serif; }
        .font-mono-num { font-family: var(--font-mono), monospace; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-up { animation: fadeUp 0.18s ease-out; }
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
          <div className="h-px bg-neutral-800 my-3" />
          {/* ⭐ PENGATURAN DIHAPUS */}
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
              <span>Admin</span><span>/</span><span className="text-amber-500 font-semibold">Produk</span><span>/</span>
              <span className="text-amber-500 font-semibold">Edit</span>
            </div>
            <h1 className="font-display text-xl font-semibold text-white">Edit Produk</h1>
          </div>
          <button
            onClick={() => router.push('/admin/produk')}
            className="text-xs font-semibold text-neutral-400 hover:text-white transition-colors"
          >
            ✕ Batal
          </button>
        </header>

        <main className="flex-1 px-8 py-6">
          <div className="bg-white/[0.03] border border-neutral-800 rounded-2xl p-8 max-w-2xl">
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">

              {/* KATEGORI */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wide text-neutral-400 mb-1.5">
                  Kategori <span className="text-red-400">*</span>
                </label>
                <select
                  required
                  value={formData.category_id}
                  onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                  className={`w-full bg-white/5 border rounded-xl px-4 py-3 text-xs text-neutral-100 focus:outline-none focus:border-amber-700 ${
                    formErrors.category_id ? 'border-red-700' : 'border-neutral-700'
                  }`}
                >
                  <option className="text-black" value="">Pilih Kategori</option>
                  {categories.map((cat) => (
                    <option className="text-black" key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
                {formErrors.category_id && (
                  <span className="text-[10px] text-red-400 mt-1">{formErrors.category_id}</span>
                )}
              </div>

              {/* NAMA PRODUK */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wide text-neutral-400 mb-1.5">
                  Nama Produk <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Contoh: Fender Stratocaster"
                  className={`w-full bg-white/5 border rounded-xl px-4 py-3 text-xs text-neutral-100 focus:outline-none focus:border-amber-700 placeholder:text-neutral-500 ${
                    formErrors.name ? 'border-red-700' : 'border-neutral-700'
                  }`}
                />
                {formErrors.name && (
                  <span className="text-[10px] text-red-400 mt-1">{formErrors.name}</span>
                )}
              </div>

              {/* DESKRIPSI */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wide text-neutral-400 mb-1.5">
                  Deskripsi
                </label>
                <textarea
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Deskripsi produk..."
                  className="w-full bg-white/5 border border-neutral-700 rounded-xl px-4 py-3 text-xs text-neutral-100 focus:outline-none focus:border-amber-700 placeholder:text-neutral-500 resize-none"
                />
              </div>

              {/* HARGA & STOK */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wide text-neutral-400 mb-1.5">
                    Harga <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="15000000"
                    className={`w-full bg-white/5 border rounded-xl px-4 py-3 text-xs text-neutral-100 focus:outline-none focus:border-amber-700 placeholder:text-neutral-500 ${
                      formErrors.price ? 'border-red-700' : 'border-neutral-700'
                    }`}
                  />
                  {formErrors.price && (
                    <span className="text-[10px] text-red-400 mt-1">{formErrors.price}</span>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wide text-neutral-400 mb-1.5">
                    Stok <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    placeholder="10"
                    className={`w-full bg-white/5 border rounded-xl px-4 py-3 text-xs text-neutral-100 focus:outline-none focus:border-amber-700 placeholder:text-neutral-500 ${
                      formErrors.stock ? 'border-red-700' : 'border-neutral-700'
                    }`}
                  />
                  {formErrors.stock && (
                    <span className="text-[10px] text-red-400 mt-1">{formErrors.stock}</span>
                  )}
                </div>
              </div>

              {/* RATING & TERJUAL */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wide text-neutral-400 mb-1.5">
                    Rating (0-5)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="5"
                    value={formData.rating}
                    onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
                    placeholder="4.5"
                    className={`w-full bg-white/5 border rounded-xl px-4 py-3 text-xs text-neutral-100 focus:outline-none focus:border-amber-700 placeholder:text-neutral-500 ${
                      formErrors.rating ? 'border-red-700' : 'border-neutral-700'
                    }`}
                  />
                  {formErrors.rating && (
                    <span className="text-[10px] text-red-400 mt-1">{formErrors.rating}</span>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wide text-neutral-400 mb-1.5">
                    Terjual
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.terjual}
                    onChange={(e) => setFormData({ ...formData, terjual: e.target.value })}
                    placeholder="0"
                    className="w-full bg-white/5 border border-neutral-700 rounded-xl px-4 py-3 text-xs text-neutral-100 focus:outline-none focus:border-amber-700 placeholder:text-neutral-500"
                  />
                </div>
              </div>

              {/* SPESIFIKASI - FORM INPUT TERPISAH */}
              <div className="border-t border-neutral-800 pt-4 mt-2">
                <label className="block text-xs font-bold uppercase tracking-wide text-neutral-400 mb-3">
                  Spesifikasi Produk
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[9px] font-bold uppercase tracking-wide text-neutral-500 mb-1">Body</label>
                    <input
                      type="text"
                      value={formData.body}
                      onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                      placeholder="Solid Spruce"
                      className="w-full bg-white/5 border border-neutral-700 rounded-xl px-3 py-2 text-xs text-neutral-100 focus:outline-none focus:border-amber-700 placeholder:text-neutral-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold uppercase tracking-wide text-neutral-500 mb-1">Neck</label>
                    <input
                      type="text"
                      value={formData.neck}
                      onChange={(e) => setFormData({ ...formData, neck: e.target.value })}
                      placeholder="Mahogany"
                      className="w-full bg-white/5 border border-neutral-700 rounded-xl px-3 py-2 text-xs text-neutral-100 focus:outline-none focus:border-amber-700 placeholder:text-neutral-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold uppercase tracking-wide text-neutral-500 mb-1">Fret</label>
                    <input
                      type="number"
                      value={formData.fret}
                      onChange={(e) => setFormData({ ...formData, fret: e.target.value })}
                      placeholder="22"
                      className="w-full bg-white/5 border border-neutral-700 rounded-xl px-3 py-2 text-xs text-neutral-100 focus:outline-none focus:border-amber-700 placeholder:text-neutral-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold uppercase tracking-wide text-neutral-500 mb-1">Scale Length</label>
                    <input
                      type="text"
                      value={formData.scale}
                      onChange={(e) => setFormData({ ...formData, scale: e.target.value })}
                      placeholder="25.5 inch"
                      className="w-full bg-white/5 border border-neutral-700 rounded-xl px-3 py-2 text-xs text-neutral-100 focus:outline-none focus:border-amber-700 placeholder:text-neutral-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold uppercase tracking-wide text-neutral-500 mb-1">Pickup</label>
                    <input
                      type="text"
                      value={formData.pickup}
                      onChange={(e) => setFormData({ ...formData, pickup: e.target.value })}
                      placeholder="SSH"
                      className="w-full bg-white/5 border border-neutral-700 rounded-xl px-3 py-2 text-xs text-neutral-100 focus:outline-none focus:border-amber-700 placeholder:text-neutral-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold uppercase tracking-wide text-neutral-500 mb-1">Color</label>
                    <input
                      type="text"
                      value={formData.color}
                      onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                      placeholder="Sunburst"
                      className="w-full bg-white/5 border border-neutral-700 rounded-xl px-3 py-2 text-xs text-neutral-100 focus:outline-none focus:border-amber-700 placeholder:text-neutral-500"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-[9px] font-bold uppercase tracking-wide text-neutral-500 mb-1">Weight</label>
                    <input
                      type="text"
                      value={formData.weight}
                      onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                      placeholder="3.5 kg"
                      className="w-full bg-white/5 border border-neutral-700 rounded-xl px-3 py-2 text-xs text-neutral-100 focus:outline-none focus:border-amber-700 placeholder:text-neutral-500"
                    />
                  </div>
                </div>
              </div>

              {/* GAMBAR - UPLOAD FILE */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wide text-neutral-400 mb-1.5">
                  Gambar Produk
                </label>
                
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                />

                <button
                  type="button"
                  onClick={handleUploadClick}
                  disabled={isCompressing}
                  className="w-full bg-white/5 border-2 border-dashed border-neutral-700 hover:border-amber-700 rounded-xl px-4 py-6 text-xs text-neutral-400 hover:text-neutral-200 transition-colors flex flex-col items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="text-2xl">📁</span>
                  <span>{isCompressing ? 'Memproses gambar...' : 'Klik untuk pilih gambar'}</span>
                  <span className="text-[9px] text-neutral-500">PNG, JPG, JPEG, WEBP (Max 5MB)</span>
                </button>

                {imagePreview && (
                  <div className="mt-3 relative inline-block">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="h-40 w-40 object-cover rounded-xl border border-neutral-700"
                    />
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-red-600 hover:bg-red-700 text-white text-xs flex items-center justify-center"
                    >
                      ✕
                    </button>
                  </div>
                )}

                {imageFile && (
                  <p className="text-[10px] text-neutral-400 mt-1">
                    File: {imageFile.name} ({(imageFile.size / 1024).toFixed(1)} KB)
                  </p>
                )}
              </div>

              {/* PILIHAN (FEATURED) */}
              <div>
                <label className="flex items-center gap-2.5 text-xs text-neutral-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_featured}
                    onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                    className="h-3.5 w-3.5 rounded accent-amber-700 cursor-pointer"
                  />
                  <span>Tandai sebagai produk <span className="text-amber-400 font-bold">Pilihan</span> (akan muncul di halaman utama)</span>
                </label>
              </div>

              {/* BUTTONS */}
              <div className="flex gap-3 pt-4 border-t border-neutral-800">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-amber-700 hover:bg-amber-600 disabled:opacity-50 text-white text-xs font-bold uppercase tracking-wide rounded-xl py-3 transition-colors"
                >
                  {saving ? 'Menyimpan...' : 'Update Produk'}
                </button>
                <button
                  type="button"
                  onClick={() => router.push('/admin/produk')}
                  className="flex-1 text-xs font-bold uppercase tracking-wide text-neutral-300 border border-neutral-700 rounded-xl py-3 hover:bg-white/5 transition-colors"
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>

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