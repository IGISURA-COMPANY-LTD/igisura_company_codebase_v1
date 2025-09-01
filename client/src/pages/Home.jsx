import Layout from '../components/layout/Layout'
import useProductsStore from '../stores/products'
import { useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import ProductCard from '../components/cards/ProductCard'
import BlogCard from '../components/cards/BlogCard'
import api from '../lib/api'
import hero1 from '../assets/stinging_nettle_1.jpg'
import hero2 from '../assets/stinging_nettle_2.jpg'
import storyImg from '../assets/stinging_nettle_1.jpg'
import useCartStore from '../stores/cart'

export default function Home() {
  const { featured, fetchFeatured } = useProductsStore()
  const [posts, setPosts] = useState([])
  const [loadingPosts, setLoadingPosts] = useState(true)
  const [slide, setSlide] = useState(0)
  const slides = useMemo(() => [hero1, hero2], [])
  const addItem = useCartStore((s) => s.addItem)

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

  useEffect(() => {
    const id = setInterval(() => setSlide((s) => (s + 1) % slides.length), 9000)
    return () => clearInterval(id)
  }, [slides.length])

  return (
    <Layout transparentHeader>
      {/* HERO */}
      <section className="relative  hero-full overflow-hidden  bg-black">
        <AnimatePresence>
          {slides.map((src, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: slide === idx ? 1 : 0, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.8, ease: 'easeInOut' }}
              className="absolute inset-0"
            >
              <img src={src} alt="Igisura" className="w-full h-full object-cover" />
            </motion.div>
          ))}
        </AnimatePresence>
        <div className="absolute inset-0 bg-black/45 pointer-events-none" />
        <div className="relative z-10 h-full flex items-center justify-center text-center px-4">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className="max-w-4xl"
          >
            <h1 className="text-white drop-shadow-xl text-5xl md:text-7xl font-extrabold leading-tight">
              Discover the Natural Power of <span className="text-brand-400">Nettle</span>
            </h1>
            <p className="mt-6 text-white/90 drop-shadow-md text-lg md:text-2xl max-w-2xl mx-auto">
              Health-promoting products crafted from stinging nettle — supporting wellness, strength, and vitality.
            </p>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="mt-10 flex items-center justify-center gap-4"
            >
              <Link to="/products" className="btn-primary-lg">Shop Now</Link>
              <Link to="/about" className="btn-secondary-lg">Our Story</Link>
            </motion.div>
          </motion.div>
        </div>
        <ScrollCue />
      </section>

      {/* PRODUCTS */}

      <section className="py-24 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4">
            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl font-bold text-center"
            >
              Our Products
            </motion.h2>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.15 } } }}
              className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-4 justify-items-center"
            >
              {(featured || []).slice(0, 3).map((p, i) => (
                <motion.div
                  key={p.id}
                  variants={{ hidden: { opacity: 0, y: 40 }, visible: { opacity: 1, y: 0 } }}
                  transition={{ duration: 0.4, ease: 'easeOut' }}
                  className="group home-product-card"
                >
                  <Link to={`/product/${p.slug || p.id}`}>
                    <img src={p.images?.[0]} alt={p.name} />
                  </Link>

                  <div className="body">
                    <Link to={`/product/${p.slug || p.id}`}>
                      <h3 className="font-semibold text-gray-900 truncate">{p.name}</h3>
                    </Link>
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                      {p.benefits ? String(p.benefits).split(/\.|\n/)[0] : 'Natural wellness, simply.'}
                    </p>
                    <div className="flex items-center justify-between mt-3">
                      <span className="price">${typeof p.price === 'number' ? Number(p.price).toFixed(2) : '0.00'}</span>
                    </div>
                    <button
                      className="add-btn"
                      onClick={() => addItem(p, 1)}
                      aria-label={`Add ${p.name} to cart`}
                    >
                      Add to Cart
                    </button>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            <div className="text-center mt-12">
              <Link to="/products" className="btn-primary">See more</Link>
            </div>
          </div>
      </section>

      {/* STORY */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="grid md:grid-cols-2 gap-12 items-center"
          >
            <div className="order-2 md:order-1">
              <h2 className="text-3xl md:text-4xl font-bold">Our Story</h2>
              <p className="mt-6 text-lg leading-relaxed text-gray-700">
                Born in Nyamata, Bugesera District, Igisura began with a simple experiment—harnessing the healing power of stinging nettle. Today, we bring natural wellness to families across Rwanda and beyond.
              </p>
              <Link to="/about" className="btn-primary mt-8">Read Full Story</Link>
            </div>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, amount: 0.5 }}
              className="rounded-3xl overflow-hidden shadow-xl"
            >
              <img src={storyImg} alt="Our story" className="w-full h-full object-cover" />
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* BENEFITS */}
      <section className="py-24 bg-brand-50">
        <div className="max-w-7xl mx-auto px-4">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl font-bold text-center"
          >
            Health Benefits
          </motion.h2>
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ staggerChildren: 0.08 }}
            className="mt-12 grid md:grid-cols-2 gap-6 max-w-4xl mx-auto"
          >
            {[
              'Rich in Vitamin A', 'Rich in Vitamin C', 'Rich in Vitamin B6',
              'High in Protein', 'Rich in Calcium', 'Increases milk for breastfeeding',
              'Supports liver health', 'Natural antioxidants'
            ].map((text) => (
              <motion.div
                key={text}
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="flex items-start gap-4 p-5 bg-white rounded-2xl shadow-sm hover:shadow-md transition"
              >
                <span className="mt-0.5 inline-block w-6 h-6 rounded-full bg-brand-600 text-white text-xs leading-6 text-center">✓</span>
                <span className="text-gray-800 font-medium">{text}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* BLOG */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-3xl font-bold">From Our Blog</h2>
            <Link to="/blog" className="btn-link">View All</Link>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            {loadingPosts ? (
              Array.from({ length: 2 }).map((_, i) => <BlogSkeleton key={i} />)
            ) : posts.length ? (
              posts.map(p => <BlogCard key={p.id} post={p} />)
            ) : (
              <p className="text-gray-600">No posts yet.</p>
            )}
          </div>
        </div>
      </section>

      {/* NEWSLETTER */}
      <section className="bg-gray-100 py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h3 className="text-3xl font-bold">Stay Updated</h3>
            <p className="mt-3 text-gray-600">Get product drops, wellness tips, and exclusive offers in your inbox.</p>
            <form className="mt-8 flex gap-3 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 rounded-lg px-4 py-3 border border-gray-300 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
              />
              <button type="submit" className="btn-primary">
                Subscribe
              </button>
            </form>
          </motion.div>
        </div>
      </section>
    </Layout>
  )
}

/* Small helper components */
function ScrollCue() {
  return (
    <motion.button
      aria-label="Scroll down"
      onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}
      className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/70 hover:text-white"
      animate={{ y: [0, 6, 0] }}
      transition={{ duration: 1.5, repeat: Infinity }}
    >
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 5v14M19 12l-7 7-7-7" />
      </svg>
    </motion.button>
  )
}

function BlogSkeleton() {
  return (
    <div className="card p-4">
      <div className="skeleton rounded-xl h-40 w-full" />
      <div className="skeleton h-4 w-3/4 mt-4 rounded" />
      <div className="skeleton h-4 w-1/2 mt-2 rounded" />
    </div>
  )
}