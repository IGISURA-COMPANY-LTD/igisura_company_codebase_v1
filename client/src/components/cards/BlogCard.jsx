export default function BlogCard({ post }) {
  return (
    <a href={`/blog/${post.slug || post.id}`} className="card p-4 group">
      <div className="aspect-[16/10] rounded-xl bg-gray-100 overflow-hidden">
        {post.image && <img src={post.image} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />}
      </div>
      <div className="mt-3 font-medium line-clamp-2" title={post.title}>{post.title}</div>
      {post.excerpt && <p className="text-sm text-gray-600 line-clamp-3 mt-1">{post.excerpt}</p>}
      <div className="mt-3 text-sm text-brand-700">Read More →</div>
    </a>
  )
}


