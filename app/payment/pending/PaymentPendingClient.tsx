'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';

export default function PaymentPending() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [orderId, setOrderId] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    let id = searchParams.get('order_id');
    
    if (!id) {
      id = localStorage.getItem('last_order_id');
    }
    
    if (id) {
      setOrderId(id);
      localStorage.removeItem('last_order_id');
      
      // ✅ EMIT EVENT KE HALAMAN DETAIL PRODUK (biar terjual langsung update!)
      window.dispatchEvent(new CustomEvent('paymentSuccess', { 
        detail: { order_id: id } 
      }));
      
      // ✅ EMIT EVENT KE KERANJANG (biar cart count reset)
      window.dispatchEvent(new CustomEvent('cartUpdated', { 
        detail: { count: 0 } 
      }));
      
      console.log('📢 Event paymentSuccess dikirim untuk order:', id);
      
    } else {
      router.push('/');
    }
  }, [searchParams, router]);

  // ✅ AUTO REDIRECT KE DETAIL PESANAN SETELAH 5 DETIK
  useEffect(() => {
    if (!orderId) return;
    
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          // ✅ AMAN: navigasi langsung via browser (tidak pakai router.push)
          window.location.href = `/detailpemesanan/${orderId}`;
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [orderId]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 px-4">
      <div className="bg-white p-8 md:p-10 rounded-2xl shadow-xl text-center max-w-md w-full border border-gray-200">
        {/* ICON */}
        <div className="text-7xl mb-4 animate-pulse">⏳</div>
        
        {/* TITLE */}
        <h1 className="text-2xl md:text-3xl font-bold text-yellow-600">
          Pembayaran Diproses
        </h1>
        
        {/* ORDER ID */}
        {orderId && (
          <p className="text-gray-600 mt-3 text-sm md:text-base">
            Pesanan #{orderId} sedang menunggu konfirmasi pembayaran.
          </p>
        )}
        
        {/* INFO */}
        <p className="text-sm text-gray-500 mt-1">
          Kami akan memberi tahu Anda setelah pembayaran dikonfirmasi.
        </p>
        
        {/* SPINNER */}
        <div className="flex justify-center mt-4">
          <div className="w-8 h-8 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
        
        {/* AUTO REDIRECT COUNTDOWN */}
        {orderId && (
          <p className="text-xs text-gray-400 mt-3">
            Mengalihkan ke detail pesanan dalam {countdown} detik...
          </p>
        )}
        
        {/* BUTTONS */}
        <div className="mt-6 space-y-3">
          {orderId && (
            <Link
              href={`/detailpemesanan/${orderId}`}
              className="block w-full bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
            >
              📦 Lihat Detail Pesanan
            </Link>
          )}
          <Link
            href="/dashboard"
            className="block w-full bg-gray-200 text-gray-700 px-6 py-2.5 rounded-lg hover:bg-gray-300 transition-colors font-medium text-sm"
          >
            🏠 Kembali ke Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}