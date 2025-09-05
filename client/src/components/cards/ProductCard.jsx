import { useNavigate } from 'react-router-dom';
import useCartStore from '../../stores/cart';
import { toast } from 'react-hot-toast';

export default function ProductCard({ product }) {
  const navigate = useNavigate();
  const addItem = useCartStore((s) => s.addItem);
  const to = `/product/${product.slug || product.id}`;

  return (
    <article className="group relative flex flex-col rounded-2xl bg-white/80 backdrop-blur-sm border border-gray-300 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
      {/* Image area */}
      <div
        className="relative w-full aspect-square overflow-hidden rounded-t-2xl cursor-pointer"
        onClick={() => navigate(to)}
      >
        {product.images?.[0] ? (
          <img
            src={product.images[0]}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full bg-slate-100" />
        )}
      </div>

      {/* Content area */}
      <div className="flex-1 flex flex-col p-4">
        <h3
          className="font-semibold text-slate-900 text-base leading-tight truncate cursor-pointer"
          onClick={() => navigate(to)}
        >
          {product.name}
        </h3>

        <p
          className="mt-1 text-sm text-slate-600 line-clamp-2 cursor-pointer flex-1"
          style={{
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
          onClick={() => navigate(to)}
        >
          {product.description || ''}
        </p>

        <span className="mt-3 text-lg font-bold text-brand-600">
          {Number(product.price).toFixed(2)} RWF
        </span>

        {/* Buttons — outside the link, fully clickable */}
        <div className="mt-4 flex items-center gap-2">
          <button
            onClick={() => navigate(to)}
            className="flex-1 text-center text-sm font-medium py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 transition"
          >
            See Details
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              addItem(product, 1);
              toast.success('Added to cart');
            }}
            className="flex-none px-4 py-2 text-sm font-semibold rounded-lg bg-gradient-to-r from-brand-600 to-brand-700 text-white shadow hover:shadow-md active:scale-95 transition-all"
          >
            Add
          </button>
        </div>
      </div>
    </article>
  );
}