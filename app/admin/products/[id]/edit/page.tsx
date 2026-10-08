import ProductForm from "@/components/admin/ProductForm";

export default function EditProductPage({ params }: { params: { id: string } }) {
  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-ink-900">Edit Product</h1>
      <ProductForm productId={params.id} />
    </div>
  );
}
