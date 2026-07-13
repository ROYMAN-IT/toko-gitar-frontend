'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function AuthCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams.get('token');
    const userParam = searchParams.get('user');

    if (token && userParam) {
      try {
        const user = JSON.parse(decodeURIComponent(userParam));
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        router.push('/admin');
      } catch (e) {
        router.push('/auth?error=Invalid user data');
      }
    } else {
      router.push('/auth?error=No token received');
    }
  }, [searchParams, router]);

  return (
    <div className="min-h-screen bg-[#0D0A09] text-white flex items-center justify-center">
      <div className="text-center">
        <div className="text-amber-500 text-2xl mb-4">⏳</div>
        <p className="text-neutral-400">Memproses login...</p>
      </div>
    </div>
  );
}