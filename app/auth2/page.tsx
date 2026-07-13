'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Fraunces, Inter, JetBrains_Mono } from 'next/font/google';

const fraunces = Fraunces({ subsets: ['latin'], weight: ['600', '700'], variable: '--font-display' });
const inter = Inter({ subsets: ['latin'], weight: ['400', '500', '600', '700'], variable: '--font-body' });
const jetbrainsMono = JetBrains_Mono({ subsets: ['latin'], weight: ['400', '600'], variable: '--font-mono' });

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError('');

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email,
          password
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Login gagal");
      }

      if (data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
      }

      // ⭐ REDIRECT BERDASARKAN ROLE
      if (data.user.role === 'admin') {
        router.push('/admin');
      } else {
        router.push('/dashboard');
      }

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`${fraunces.variable} ${inter.variable} ${jetbrainsMono.variable} font-body min-h-screen flex items-center justify-center p-4 relative antialiased overflow-hidden`}
      style={{
        background: 'radial-gradient(circle at 20% 15%, #262019 0%, #0D0A09 45%, #060403 100%)',
      }}
    >
      <style jsx global>{`
        .font-display { font-family: var(--font-display), serif; }
        .font-body { font-family: var(--font-body), sans-serif; }
        .font-mono-num { font-family: var(--font-mono), monospace; }

        @keyframes softDrift {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(14px, -10px); }
        }
        @keyframes cardRise {
          from { opacity: 0; transform: translateY(18px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes fieldIn {
          from { opacity: 0; transform: translateX(-8px); }
          to { opacity: 1; transform: translateX(0); }
        }
        .drift-slow { animation: softDrift 12s ease-in-out infinite; }
        .drift-slower { animation: softDrift 18s ease-in-out infinite reverse; }
        .card-rise { animation: cardRise 0.55s cubic-bezier(0.16, 1, 0.3, 1) both; }
        .field-in-1 { animation: fieldIn 0.5s ease-out 0.1s both; }
        .field-in-2 { animation: fieldIn 0.5s ease-out 0.18s both; }
        .field-in-3 { animation: fieldIn 0.5s ease-out 0.26s both; }

        @keyframes shakeErr {
          10%, 90% { transform: translateX(-1px); }
          20%, 80% { transform: translateX(2px); }
          30%, 50%, 70% { transform: translateX(-4px); }
          40%, 60% { transform: translateX(4px); }
        }
        .shake-err { animation: shakeErr 0.5s; }

        @media (prefers-reduced-motion: reduce) {
          .drift-slow, .drift-slower, .card-rise, .field-in-1, .field-in-2, .field-in-3, .shake-err { animation: none !important; }
        }
      `}</style>

      {/* AMBIENT GLOWS */}
      <div className="drift-slow absolute -top-24 -left-20 w-[420px] h-[420px] rounded-full bg-amber-700/[0.10] blur-[110px] pointer-events-none z-0" />
      <div className="drift-slower absolute -bottom-28 -right-16 w-[380px] h-[380px] rounded-full bg-orange-600/[0.08] blur-[100px] pointer-events-none z-0" />

      {/* GRAIN HALUS */}
      <div
        className="absolute inset-0 pointer-events-none z-0 opacity-[0.04] mix-blend-overlay"
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

      <div className="card-rise w-full max-w-4xl bg-[#1A1A1A] rounded-3xl overflow-hidden shadow-[0_30px_80px_rgba(0,0,0,0.6)] ring-1 ring-white/[0.04] flex flex-col md:flex-row border border-gray-800 min-h-[550px] relative z-10">

        {/* SISI KIRI */}
        <div
          className="flex-1 p-8 flex flex-col justify-between items-center relative border-b md:border-b-0 md:border-r border-gray-800 min-h-[350px] md:min-h-0 bg-cover bg-center overflow-hidden"
          style={{ backgroundImage: `linear-gradient(to bottom, rgba(21, 21, 21, 0.75), rgba(15, 15, 15, 0.9)), url('/background keranjang2.jpg')` }}
        >
          <div className="absolute inset-0 bg-black/45 backdrop-blur-[2px] pointer-events-none" />
          <div className="drift-slow absolute top-[-20%] left-[-20%] w-[70%] h-[70%] rounded-full bg-amber-500/10 blur-[90px] pointer-events-none" />
          <div className="drift-slower absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-orange-600/10 blur-[80px] pointer-events-none" />
          <div className="absolute inset-4 border border-white/5 pointer-events-none" />
          <div className="absolute top-4 left-4 right-4 flex justify-between text-[8px] text-white/20 font-mono-num tracking-widest pointer-events-none select-none">
            <span>LAT: 7.26° S</span><span>LNG: 112.75° E</span>
          </div>
          <div className="absolute bottom-4 left-4 right-4 flex justify-between text-[8px] text-white/20 font-mono-num tracking-widest pointer-events-none select-none">
            <span>SCALE: 1:12</span><span>REF: GT-88</span>
          </div>
          <div className="absolute top-8 left-8 text-xs font-bold tracking-widest text-gray-400 uppercase flex items-center gap-2 z-10">🎸 GitarKu</div>

          <div className="my-auto flex flex-col items-center justify-center text-center px-4 z-10 mt-16 md:mt-0">
            <svg className="w-20 h-40 text-amber-100/85 drop-shadow-[0_0_20px_rgba(217,119,87,0.25)] mb-4 hover:scale-105 transition-transform duration-500" viewBox="0 0 100 200" fill="currentColor">
              <path d="M45,15 C45,10 55,10 55,15 L54,30 L46,30 Z" />
              <circle cx="42" cy="18" r="2.5" /><circle cx="42" cy="24" r="2.5" />
              <circle cx="58" cy="18" r="2.5" /><circle cx="58" cy="24" r="2.5" />
              <rect x="48" y="30" width="4" height="75" opacity="0.9" />
              <line x1="47" y1="45" x2="53" y2="45" stroke="#151515" strokeWidth="1" />
              <line x1="47" y1="60" x2="53" y2="60" stroke="#151515" strokeWidth="1" />
              <line x1="47" y1="75" x2="53" y2="75" stroke="#151515" strokeWidth="1" />
              <line x1="47" y1="90" x2="53" y2="90" stroke="#151515" strokeWidth="1" />
              <path d="M50,105 C33,105 30,122 39,142 C30,162 33,188 50,188 C67,188 70,162 61,142 C70,122 67,105 50,105 Z" />
              <circle cx="50" cy="138" r="7" fill="#151515" />
              <rect x="42" y="162" width="16" height="4" rx="1" fill="#151515" />
            </svg>
            <h3 className="font-display text-white font-bold tracking-[0.2em] text-sm uppercase">The Guitar Vault</h3>
            <p className="text-gray-400 text-[9px] tracking-widest uppercase mt-2 font-mono-num">EST. 2026</p>
          </div>
          <div className="text-[9px] tracking-[0.3em] text-gray-500 uppercase w-full text-center z-10">Premium Instruments Shop</div>
        </div>

        {/* SISI KANAN: FORM SIGN IN */}
        <div className="flex-1 bg-[#FFFDF6] text-black p-10 flex flex-col justify-between relative">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-700 via-amber-400 to-amber-700" />
          <button onClick={() => router.back()} className="absolute top-6 right-8 flex items-center gap-1 text-xs font-bold tracking-widest uppercase text-gray-400 hover:text-black transition cursor-pointer group">
            <svg className="w-3.5 h-3.5 transform group-hover:-translate-x-0.5 transition-transform duration-300" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            <span>BACK</span>
          </button>

          <div className="my-auto space-y-6">
            <div className="text-center mb-8">
              <span className="text-amber-700 text-lg">✦</span>
              <h2 className="font-display text-2xl font-bold tracking-widest text-center uppercase text-gray-800 mt-1">Sign In</h2>
              <p className="text-[10px] text-gray-400 tracking-wide mt-1">Selamat datang pecinta gitar</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div className="field-in-1">
                <label className="text-[10px] font-bold tracking-widest uppercase text-gray-400 block mb-1.5">Email :</label>
                <div className="relative group">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-amber-700 transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.206" />
                    </svg>
                  </span>
                  <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@example.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-black/[0.02] border border-gray-300 text-sm focus:outline-none focus:border-amber-700 focus:ring-2 focus:ring-amber-700/20 transition-all duration-200" />
                </div>
              </div>

              <div className="field-in-2">
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-[10px] font-bold tracking-widest uppercase text-gray-400">Password :</label>
                  <button type="button" onClick={() => alert('Fitur reset password menyusul')} className="text-[10px] font-bold text-amber-800 hover:underline tracking-wide cursor-pointer">Lupa Password?</button>
                </div>
                <div className="relative group">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-amber-700 transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </span>
                  <input type={showPassword ? 'text' : 'password'} required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-black/[0.02] border border-gray-300 text-sm focus:outline-none focus:border-amber-700 focus:ring-2 focus:ring-amber-700/20 transition-all duration-200" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black transition cursor-pointer">
                    {showPassword ? (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <label className="field-in-3 flex items-center gap-2 text-[10px] text-gray-500 tracking-wide cursor-pointer select-none">
                <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} className="h-3.5 w-3.5 rounded accent-amber-800 cursor-pointer" />
                <span>Ingat saya di perangkat ini</span>
              </label>
              
              {error && (
                <div className="shake-err text-red-600 text-xs text-center font-bold bg-red-100 p-2 rounded-lg flex items-center justify-center gap-1.5">
                  <span>⚠</span> {error}
                </div>
              )}
              
              <button type="submit" disabled={loading} className="w-full mt-2 py-2.5 bg-amber-800 text-white font-bold rounded-xl text-xs tracking-widest uppercase hover:bg-amber-700 hover:shadow-[0_8px_24px_rgba(180,83,9,0.35)] hover:-translate-y-0.5 transition-all duration-300 shadow-md active:scale-[0.98] flex items-center justify-center gap-2 group cursor-pointer disabled:hover:translate-y-0">
                <span>{loading ? "Loading..." : "Login"}</span>
                <svg className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>

              <div className="text-center mt-4">
                <span className="text-[10px] text-gray-400 tracking-wider">BELUM PUNYA AKUN? </span>
                <button type="button" onClick={() => router.push('/auth')} className="text-[10px] font-bold hover:underline tracking-wider cursor-pointer text-amber-800">DAFTAR DI SINI</button>
              </div>
            </form>
          </div>

          {/* ⭐ TOMBOL SOSIAL MEDIA SUDAH DIHAPUS! */}
        </div>
      </div>
    </div>
  );
}
