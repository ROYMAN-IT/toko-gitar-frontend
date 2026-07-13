// app/lib/utils.ts

/**
 * Format angka ke format Rupiah dengan titik sebagai pemisah ribuan
 * Contoh: 1500000 -> Rp 1.500.000
 */
export const formatRp = (amount: number): string => {
  if (amount === undefined || amount === null || isNaN(amount)) {
    return 'Rp 0';
  }
  
  const formatted = amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `Rp ${formatted}`;
};

/**
 * Format angka dengan titik sebagai pemisah ribuan (tanpa Rp)
 * Contoh: 1500000 -> 1.500.000
 */
export const formatNumber = (amount: number): string => {
  if (amount === undefined || amount === null || isNaN(amount)) {
    return '0';
  }
  return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};