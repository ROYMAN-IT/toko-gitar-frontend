// frontend/lib/api.ts
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export interface Product {
  id: number;
  category_id: number;
  category_name?: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  image: string;
  is_featured?: boolean;
  created_at: string;
}

export interface Category {
  id: number;
  name: string;
  description: string;
  created_at: string;
}

export interface Customer {
  id: number;
  nama: string;
  email: string;
  telepon: string;
  alamat: string;
  avatar: string;
  totalPesanan: number;
  totalBelanja: number;
  status: 'Aktif' | 'Nonaktif';
  vip: boolean;
  bergabung: string;
}

const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  const fullUrl = `${API_URL}${url}`;
  console.log('📤 Fetching:', fullUrl);

  const response = await fetch(fullUrl, {
    ...options,
    headers,
  });

  console.log('📥 Response status:', response.status);

  if (!response.ok) {
    const error = await response.json();
    console.error('❌ Error response:', error);
    throw new Error(error.message || 'Terjadi kesalahan');
  }

  return response.json();
};

// ==================== PRODUCTS API ====================
export const productAPI = {
  getAll: async (params?: any) => {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          query.append(key, value.toString());
        }
      });
    }
    const url = `/products?${query.toString()}`;
    return fetchWithAuth(url);
  },

  getById: async (id: number) => {
    return fetchWithAuth(`/products/${id}`);
  },

  create: async (data: any) => {
    return fetchWithAuth('/products', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (id: number, data: any) => {
    return fetchWithAuth(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  delete: async (id: number) => {
    return fetchWithAuth(`/products/${id}`, {
      method: 'DELETE',
    });
  },

  toggleFeatured: async (id: number) => {
    return fetchWithAuth(`/products/${id}/toggle-featured`, {
      method: 'PATCH',
    });
  },
};

// ==================== CATEGORIES API ====================
export const categoryAPI = {
  getAll: async () => {
    return fetchWithAuth('/categories');
  },

  create: async (data: { name: string; description?: string }) => {
    return fetchWithAuth('/categories', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};

// ==================== CUSTOMERS API ====================
export const customerAPI = {
  getAll: async () => {
    const result = await fetchWithAuth('/customers');
    return result as Customer[];
  },

  getById: async (id: number) => {
    const result = await fetchWithAuth(`/customers/${id}`);
    return result as Customer;
  },

  update: async (id: number, data: Partial<Customer>) => {
    const result = await fetchWithAuth(`/customers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return result;
  },

  delete: async (id: number) => {
    const result = await fetchWithAuth(`/customers/${id}`, {
      method: 'DELETE',
    });
    return result;
  },

  toggleVip: async (id: number) => {
    const result = await fetchWithAuth(`/customers/${id}/toggle-vip`, {
      method: 'PATCH',
    });
    return result;
  },

  toggleStatus: async (id: number) => {
    const result = await fetchWithAuth(`/customers/${id}/toggle-status`, {
      method: 'PATCH',
    });
    return result;
  },
};

// ==================== AUTH API ====================
export const authAPI = {
  login: async (email: string, password: string) => {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Login gagal');
    }

    const result = await response.json();
    if (result.token) {
      localStorage.setItem('token', result.token);
      localStorage.setItem('user', JSON.stringify(result.user));
    }
    return result;
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getCurrentUser: () => {
    if (typeof window !== 'undefined') {
      const user = localStorage.getItem('user');
      return user ? JSON.parse(user) : null;
    }
    return null;
  },
};

// ==================== CART API ====================
export const cartAPI = {
  getCart: async () => {
    const result = await fetchWithAuth('/cart');
    return result;
  },

  addItem: async (product_id: number, quantity: number = 1) => {
    const result = await fetchWithAuth('/cart', {
      method: 'POST',
      body: JSON.stringify({ product_id, quantity }),
    });
    return result;
  },

  updateItem: async (itemId: number, quantity: number) => {
    const result = await fetchWithAuth(`/cart/${itemId}`, {
      method: 'PUT',
      body: JSON.stringify({ quantity }),
    });
    return result;
  },

  removeItem: async (itemId: number) => {
    const result = await fetchWithAuth(`/cart/${itemId}`, {
      method: 'DELETE',
    });
    return result;
  },
};

// ⭐ ==================== ORDERS API ====================
export const orderAPI = {
  create: async (data: { address: string }) => {
    const result = await fetchWithAuth('/orders', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return result;
  },

  getAll: async () => {
    const result = await fetchWithAuth('/orders');
    return result;
  },

  getById: async (id: number) => {
    const result = await fetchWithAuth(`/orders/${id}`);
    return result;
  },

  updateStatus: async (id: number, status: string) => {
    const result = await fetchWithAuth(`/orders/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
    return result;
  },
};

// ⭐ ==================== PAYMENT API ====================
export const paymentAPI = {
  // ⭐ PAKE YANG ASLI (REAL MIDTRANS)
  createReal: async (order_id: number) => {
    const result = await fetchWithAuth('/payments/create-real', {
      method: 'POST',
      body: JSON.stringify({ order_id }),
    });
    return result;
  },

  create: async (order_id: number) => {
    const result = await fetchWithAuth('/payments/create', {
      method: 'POST',
      body: JSON.stringify({ order_id }),
    });
    return result;
  },

  getStatus: async (order_id: number) => {
    const result = await fetchWithAuth(`/payments/status/${order_id}`);
    return result;
  },
};