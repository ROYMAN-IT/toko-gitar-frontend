import React from 'react';

export type ProductFormProps = {
  product?: any;
  isEditing?: boolean;
};

export default function ProductForm({ product, isEditing = false }: ProductFormProps) {
  return (
    <form>
      {/* ...basic form markup... */}
      <div>Product form placeholder</div>
    </form>
  );
}