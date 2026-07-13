'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Fraunces, Inter, JetBrains_Mono } from 'next/font/google';
import {
  Pencil,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  ShieldCheck,
} from 'lucide-react';

const fraunces = Fraunces({ subsets: ['latin'], weight: ['600', '700'], variable: '--font-display' });
const inter = Inter({ subsets: ['latin'], weight: ['400', '500', '600', '700'], variable: '--font-body' });
const jetbrainsMono = JetBrains_Mono({ subsets: ['latin'], weight: ['400', '600', '700'], variable: '--font-mono' });

// ⭐ FUNGSI KOMPRES GAMBAR
const compressImage = (file: File, maxWidth: number = 400, quality: number = 0.7): Promise<string> => {
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

export default function DetailMyProfile() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ msg: string; tone: 'ok' | 'err' } | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // State form
  const [nama, setNama] = useState('');
  const [email, setEmail] = useState('');
  const [noTelepon, setNoTelepon] = useState('');
  const [alamat, setAlamat] = useState('');
  const [avatar, setAvatar] = useState('');
  const [role, setRole] = useState('customer');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      if (!token) {
        router.push('/auth2');
        return;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Gagal mengambil data profil');
      }

      const data = await response.json();
      setNama(data.nama || '');
      setEmail(data.email || '');
      setNoTelepon(data.telepon || '');
      setAlamat(data.alamat || '');
      setAvatar(data.avatar || '');
      setRole(data.role || 'customer');
    } catch (error: any) {
      console.error('Error fetching profile:', error);
      setToast({ msg: error.message || 'Gagal memuat profil', tone: 'err' });
    } finally {
      setLoading(false);
    }
  };

  // ⭐ HANDLE UPLOAD FOTO PROFIL
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validasi ukuran file (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setToast({ msg: 'Ukuran gambar maksimal 2MB!', tone: 'err' });
      return;
    }

    // Validasi tipe file
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      setToast({ msg: 'Format gambar harus JPG, PNG, atau WEBP!', tone: 'err' });
      return;
    }

    setIsUploading(true);
    try {
      const compressedDataUrl = await compressImage(file, 400, 0.7);
      setAvatar(compressedDataUrl);
      setToast({ msg: '✅ Foto profil berhasil diupload!', tone: 'ok' });
      
      // ⭐ LANGSUNG SIMPAN KE DATABASE
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          nama,
          telepon: noTelepon,
          alamat,
          avatar: compressedDataUrl
        })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Gagal update foto profil');
      }

      // Update user di localStorage
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      localStorage.setItem('user', JSON.stringify({
        ...currentUser,
        nama,
        telepon: noTelepon,
        alamat,
        avatar: compressedDataUrl
      }));

    } catch (error: any) {
      console.error('Error uploading avatar:', error);
      setToast({ msg: error.message || 'Gagal upload foto', tone: 'err' });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setToast(null);

    try {
      const token = localStorage.getItem('token');

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          nama,
          telepon: noTelepon,
          alamat,
          avatar
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Gagal update profil');
      }

      // Update user di localStorage
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      localStorage.setItem('user', JSON.stringify({
        ...currentUser,
        nama,
        telepon: noTelepon,
        alamat,
        avatar
      }));

      setToast({ msg: '✅ Profil berhasil diperbarui!', tone: 'ok' });
      setTimeout(() => {
        router.push('/myprofile');
      }, 1500);

    } catch (error: any) {
      console.error('Error updating profile:', error);
      setToast({ msg: error.message || 'Gagal update profil', tone: 'err' });
    } finally {
      setSaving(false);
    }
  };

  const getInitial = () => {
    if (nama) return nama.charAt(0).toUpperCase();
    return '👤';
  };

  // ⭐ TRIGGER FILE INPUT
  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  if (loading) {
    return (
      <div
        className={`${fraunces.variable} ${inter.variable} ${jetbrainsMono.variable} font-body min-h-screen p-4 bg-cover bg-center bg-no-repeat bg-fixed relative antialiased text-white flex items-center justify-center`}
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
          <span className="text-xs tracking-widest uppercase text-[#8A8178]">Memuat profil...</span>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`${fraunces.variable} ${inter.variable} ${jetbrainsMono.variable} font-body min-h-screen p-4 bg-cover bg-center bg-no-repeat bg-fixed relative antialiased text-white`}
      style={{ backgroundImage: `url('/background keranjang2.jpg')` }}
    >
      <style jsx global>{`
        .font-display { font-family: var(--font-display), serif; }
        .font-body { font-family: var(--font-body), sans-serif; }
        .font-mono-num { font-family: var(--font-mono), monospace; }
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
        input:focus-visible, textarea:focus-visible, button:focus-visible {
          outline: 2px solid #C9A34E;
          outline-offset: 2px;
        }
        @keyframes ringPulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(201,163,78,0.35); }
          50% { box-shadow: 0 0 0 6px rgba(201,163,78,0); }
        }
        .avatar-ring { animation: ringPulse 2.4s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) {
          .rise, .avatar-ring { animation: none !important; }
        }
      `}</style>

      {/* Overlay gradient + vignette */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0D0A09]/80 via-[#0D0A09]/70 to-[#0D0A09]/90 pointer-events-none z-0" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_0%,_rgba(0,0,0,0.55)_100%)] pointer-events-none z-0" />
      <div className="absolute inset-0 backdrop-blur-[2px] pointer-events-none z-0" />

      <div className="w-full max-w-2xl mx-auto relative z-10 flex flex-col gap-6 py-6">

        {/* NAVBAR */}
        <div className="w-full bg-[#FFFDF6] text-black px-6 py-2.5 rounded-full flex justify-between items-center shadow-md rise">
          <span className="font-display font-semibold tracking-wide text-sm flex items-center gap-1.5">🎸 GitarKu</span>
          <button type="button" onClick={() => router.back()} className="text-[10px] font-bold tracking-widest uppercase opacity-60 hover:opacity-100 transition">
            Back &gt;
          </button>
        </div>

        {/* PAGE TITLE */}
        <div className="px-2 rise" style={{ animationDelay: '60ms' }}>
          <h1 className="font-display text-xl font-semibold text-[#FFFDF6]">Profil Saya</h1>
          <p className="text-xs text-neutral-300 mt-0.5">Kelola informasi akun dan data pribadimu</p>
          {/* Signature: string divider */}
          <div className="string-divider flex flex-col gap-[3px] w-20 mt-3" aria-hidden="true">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <span key={i} style={{ height: `${1 + i * 0.45}px`, opacity: 1 - i * 0.11 }} />
            ))}
          </div>
        </div>

        {/* AVATAR CARD */}
        <div className="bg-black/40 backdrop-blur-sm rounded-3xl p-6 shadow-2xl border border-white/5 flex items-center gap-5 rise" style={{ animationDelay: '110ms' }}>
          <div className="relative shrink-0">
            <div className="avatar-ring w-20 h-20 rounded-full bg-gradient-to-br from-[#E8DCC4] to-[#C9A34E] p-[3px]">
              <div className="w-full h-full rounded-full bg-[#EFEAE0] flex items-center justify-center text-3xl font-bold text-amber-800 overflow-hidden">
                {avatar ? (
                  <img src={avatar} alt={nama} className="w-full h-full rounded-full object-cover" />
                ) : (
                  getInitial()
                )}
              </div>
            </div>
            {/* ⭐ FILE INPUT - HIDDEN */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
            />
            {/* ⭐ TOMBOL PENSIL - UPLOAD FOTO */}
            <button
              type="button"
              onClick={handleUploadClick}
              disabled={isUploading}
              aria-label="Ubah foto profil"
              className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-amber-700 text-white flex items-center justify-center shadow-md hover:bg-amber-600 hover:scale-105 active:scale-95 transition disabled:opacity-50"
            >
              {isUploading ? (
                <span className="animate-spin text-xs">⟳</span>
              ) : (
                <Pencil size={13} />
              )}
            </button>
          </div>
          <div className="min-w-0">
            <h2 className="font-display text-lg font-semibold text-[#FFFDF6] truncate">{nama || 'User'}</h2>
            <p className="text-xs text-neutral-300 truncate">{email}</p>
            <span className="inline-flex items-center gap-1 mt-2 text-[10px] font-bold tracking-widest uppercase text-amber-400 bg-amber-900/30 px-2.5 py-1 rounded-full">
              <ShieldCheck size={11} />
              {role === 'admin' ? 'Admin' : 'Gold Member'}
            </span>
          </div>
        </div>

        {/* FORM */}
        <div className="bg-black/40 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-white/5 rise" style={{ animationDelay: '160ms' }}>
          <h3 className="font-display text-base font-semibold mb-1">Informasi Pribadi</h3>
          <p className="text-[11px] text-neutral-400 mb-6">Perubahan tersimpan begitu kamu menekan simpan.</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="text-[10px] font-bold tracking-widest uppercase text-gray-300 flex items-center gap-1.5 mb-1.5">
                <User size={12} /> Nama Lengkap
              </label>
              <input
                type="text"
                required
                value={nama}
                onChange={(e) => setNama(e.target.value)}
                className="w-full px-5 py-2.5 rounded-xl bg-[#FFFDF6] text-black text-sm font-medium focus:outline-none focus:ring-2 focus:ring-amber-600/60 shadow-inner transition-shadow"
                placeholder="Nama lengkap"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-bold tracking-widest uppercase text-gray-300 flex items-center gap-1.5 mb-1.5">
                  <Mail size={12} /> Email
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  disabled
                  className="w-full px-5 py-2.5 rounded-xl bg-[#FFFDF6]/50 text-black/60 text-sm font-medium cursor-not-allowed border border-white/20"
                />
                <p className="text-[9px] text-neutral-400 mt-1">Email tidak dapat diubah</p>
              </div>
              <div>
                <label className="text-[10px] font-bold tracking-widest uppercase text-gray-300 flex items-center gap-1.5 mb-1.5">
                  <Phone size={12} /> No Telepon
                </label>
                <input
                  type="tel"
                  required
                  value={noTelepon}
                  onChange={(e) => setNoTelepon(e.target.value)}
                  className="w-full px-5 py-2.5 rounded-xl bg-[#FFFDF6] text-black text-sm font-mono-num font-medium focus:outline-none focus:ring-2 focus:ring-amber-600/60 shadow-inner transition-shadow"
                  placeholder="08123456789"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold tracking-widest uppercase text-gray-300 flex items-center gap-1.5 mb-1.5">
                <MapPin size={12} /> Alamat
              </label>
              <textarea
                required
                rows={2}
                value={alamat}
                onChange={(e) => setAlamat(e.target.value)}
                className="w-full px-5 py-2.5 rounded-xl bg-[#FFFDF6] text-black text-sm font-medium focus:outline-none focus:ring-2 focus:ring-amber-600/60 shadow-inner transition-shadow resize-none"
                placeholder="Jl. Contoh No. 123, Kota"
              />
            </div>

            {/* Avatar URL (hidden input for future) */}
            <input
              type="hidden"
              value={avatar}
              onChange={(e) => setAvatar(e.target.value)}
            />

            <div className="w-full flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-6 py-2.5 bg-transparent border border-white/20 text-white/80 font-bold rounded-full text-xs tracking-widest uppercase hover:bg-white/5 transition"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-8 py-2.5 bg-amber-700 hover:bg-amber-600 disabled:opacity-50 text-white font-bold rounded-full text-xs tracking-widest transition shadow-md uppercase hover:shadow-amber-900/40 hover:shadow-lg active:scale-[0.98]"
              >
                {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
              </button>
            </div>
          </form>
        </div>

        {/* TOAST */}
        {toast && (
          <div className={`fixed bottom-6 right-6 z-[300] px-4 py-3 rounded-xl text-xs font-semibold shadow-2xl animate-fade-up border ${
            toast.tone === 'ok' ? 'bg-emerald-900/90 border-emerald-700 text-emerald-200' : 'bg-red-900/90 border-red-700 text-red-200'
          }`}>
            {toast.msg}
          </div>
        )}
      </div>
    </div>
  );
}
