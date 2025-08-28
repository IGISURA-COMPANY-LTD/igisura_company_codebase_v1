import Layout from '../components/layout/Layout'
import useProductsStore from '../stores/products'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import ProductCard from '../components/cards/ProductCard'
import BlogCard from '../components/cards/BlogCard'
import api from '../lib/api'

export default function Home() {
  const { featured, fetchFeatured } = useProductsStore()
  const [posts, setPosts] = useState([])
  const [loadingPosts, setLoadingPosts] = useState(true)

  useEffect(() => {
    fetchFeatured(4)
    let alive = true
    setLoadingPosts(true)
    api.get('/api/blog', { params: { limit: 2 } }).then(({ data }) => {
      if (!alive) return
      const list = Array.isArray(data?.posts) ? data.posts : []
      setPosts(list)
    }).catch(() => {}).finally(() => alive && setLoadingPosts(false))
    return () => { alive = false }
  }, [])

  return (
    <Layout>
      {/* Hero */}
      <section className="relative min-h-[80vh] md:min-h-[90vh] flex items-center bg-fixed bg-center bg-cover" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1524594154908-eddffdb4535f?q=80&w=1600&auto=format&fit=crop)' }}>
        <div className="absolute inset-0 bg-black/25" />
        <div className="relative w-full">
          <div className="mx-auto max-w-7xl px-4 py-20 grid gap-10 md:grid-cols-2 items-center">
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <h1 className="text-white text-4xl md:text-6xl font-bold tracking-tight">Discover the Natural Power of Nettle</h1>
              <p className="mt-4 text-white/90 max-w-prose">Health-promoting products crafted from stinging nettle — supporting wellness, strength, and vitality.</p>
              <div className="mt-6 flex gap-3">
                <a href="/products" className="btn-primary">Shop Our Products</a>
                <a href="/about" className="btn">Learn Our Story</a>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="mx-auto max-w-7xl px-4 py-16">
        <h2 className="text-2xl font-semibold">Featured Products</h2>
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          {featured.length === 0 ? (
            Array.from({ length: 4 }).map((_, i) => <div key={i} className="card p-4"><div className="skeleton h-44 rounded-xl" /><div className="skeleton h-4 w-2/3 mt-3 rounded" /><div className="skeleton h-4 w-1/3 mt-2 rounded" /></div>)
          ) : (
            featured.map((p) => <ProductCard key={p.id} product={p} />)
          )}
        </div>
      </section>

      {/* Brand Story */}
      <section className="mx-auto max-w-7xl px-4 py-16 grid gap-10 md:grid-cols-2 items-center">
        <div className="aspect-video rounded-2xl overflow-hidden bg-gray-100">
          <img src="https://images.unsplash.com/photo-1542736667-069246bdbcaf?q=80&w=1600&auto=format&fit=crop" alt="Founder and nettle fields" className="w-full h-full object-cover" />
        </div>
        <div>
          <h2 className="text-2xl font-semibold">A Story of Wellness and Resilience</h2>
          <p className="mt-3 text-gray-700">After listening to many of the President Paul Kagame speeches encouraging our generation to create our own businesses and improve by expanding those start-ups; the fear that I always had of not being confident and of failure suddenly vanished. Thus was born the idea of researching and developing products derived from the stinging nettle plants.</p>
          <a href="/about" className="btn mt-6">Read Our Full Story</a>
        </div>
      </section>

      {/* Health Benefits */}
      <section className="bg-brand-50">
        <div className="mx-auto max-w-7xl px-4 py-16">
          <h2 className="text-2xl font-semibold">Nature's Wellness, Bottled.</h2>
          <div className="mt-6 grid md:grid-cols-3 gap-4">
            {[
              { title: 'Rich in Vitamins', desc: 'Packed with Vitamins A, C, and B6 for daily vitality.' },
              { title: 'Strengthens Bones', desc: 'High in Calcium to support strong, healthy bones.' },
              { title: 'Supports Lactation', desc: 'Known to increase milk for breastfeeding mothers.' },
            ].map((b, idx) => (
              <motion.div key={b.title} initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.4 }} transition={{ delay: idx * 0.1 }} className="card p-5">
                <div className="text-lg font-medium">{b.title}</div>
                <p className="text-gray-600 mt-1">{b.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Blog Highlights */}
      <section className="mx-auto max-w-7xl px-4 py-16">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold">From Our Blog</h2>
          <a href="/blog" className="text-sm text-brand-700">View all</a>
        </div>
        <div className="mt-6 grid md:grid-cols-2 gap-4">
          {loadingPosts ? (
            Array.from({ length: 2 }).map((_, i) => <div key={i} className="card p-4"><div className="skeleton h-40 rounded-xl" /><div className="skeleton h-4 w-2/3 mt-3 rounded" /><div className="skeleton h-4 w-1/3 mt-2 rounded" /></div>)
          ) : posts.length === 0 ? (
            <div className="text-gray-600">No blog posts yet. Check back soon.</div>
          ) : (
            posts.map((post) => <BlogCard key={post.id} post={post} />)
          )}
        </div>
      </section>

      {/* Newsletter */}
      <section className="bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 py-16 grid md:grid-cols-2 items-center gap-6">
          <div>
            <h3 className="text-xl font-semibold">Stay Updated with Igisura</h3>
            <p className="text-gray-600 mt-1">Join our newsletter for product updates, wellness tips, and more.</p>
          </div>
          <form className="flex gap-3">
            <input className="w-full border rounded-lg px-3 py-3 focus:outline-none focus:ring-0 focus:border-brand-600" placeholder="Enter your email" />
            <button type="button" className="btn-primary">Subscribe</button>
          </form>
        </div>
      </section>
    </Layout>
  )
}


