'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';

export default function PaymentFailed() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [orderId, setOrderId] = useState<string | null>(null);

  useEffect(() => {
    let id = searchParams.get('order_id');
    
    if (!id) {
      id = localStorage.getItem('last_order_id');
    }
    
    if (id) {
      setOrderId(id);
      localStorage.removeItem('last_order_id');
    } else {
      router.push('/');
    }
  }, [searchParams, router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 px-4">
      <div className="bg-white p-8 rounded-2xl shadow-lg text-center max-w-md w-full">
        <div className="text-6xl mb-4">❌</div>
        <h1 className="text-2xl font-bold text-red-600">Pembayaran Gagal</h1>
        {orderId && (
          <p className="text-gray-600 mt-3">
            Pesanan #{orderId} gagal diproses.
          </p>
        )}
        <p className="text-sm text-gray-500 mt-1">
          Silakan coba lagi atau gunakan metode pembayaran lain.
        </p>
        
        <div className="mt-6 space-y-3">
          <Link
            href="/checkout"
            className="block w-full bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 transition-colors"
          >
            🔄 Coba Bayar Lagi
          </Link>
          <Link
            href="/"
            className="block w-full bg-gray-200 text-gray-700 px-6 py-2.5 rounded-lg hover:bg-gray-300 transition-colors"
          >
            🏠 Kembali ke Beranda
          </Link>
        </div>
      </div>
    </div>
  );
}