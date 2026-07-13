'use client';
import React, { useEffect, useState } from 'react';

export type ProductFormProps = {
  product?: Partial<{
    category_id: number;
    name: string;
    description: string;
    price: number;
    stock: number;
    image?: string;
  }>;
  isEditing?: boolean;
};

export default function ProductForm({ product, isEditing = false }: ProductFormProps) {
  const [formData, setFormData] = useState({
    category_id: product?.category_id ?? '',
    name: product?.name ?? '',
    description: product?.description ?? '',
    price: product?.price ?? '',
    stock: product?.stock ?? '',
    image: product?.image ?? '',
  });

  useEffect(() => {}, []);

  return (
    <form>
      <div>Product form placeholder</div>
    </form>
  );
}