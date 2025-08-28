export default function ProductCard({ product }) {
  return (
    <a href={`/product/${product.slug || product.id}`} className="card p-4 group transform transition-transform duration-200 hover:scale-105">
      <div className="aspect-square rounded-xl bg-gray-100 overflow-hidden">
        {product.images?.[0] && (
          <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" loading="lazy" />
        )}
      </div>
      <div className="mt-3">
        <div className="font-medium truncate" title={product.name}>{product.name}</div>
        <div className="text-brand-700">${Number(product.price).toFixed(2)}</div>
      </div>
    </a>
  )
}


