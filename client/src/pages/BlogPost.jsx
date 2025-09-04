import { useEffect, useMemo, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import Layout from '../components/layout/Layout'
import api from '../lib/api'

export default function BlogPost() {
  const { slug } = useParams()
  const [post, setPost] = useState(null)
  const [activeIdx, setActiveIdx] = useState(0)
  const intervalRef = useRef(null)
  const containerRef = useRef(null)

  useEffect(() => {
    api.get(`/api/blog/slug/${slug}`).then(({ data }) => setPost(data)).catch(() => {})
  }, [slug])

  const images = useMemo(() => (post?.images && Array.isArray(post.images) ? post.images : []), [post])

  /* ---- carousel logic unchanged ---- */
  useEffect(() => {
    if (images.length <= 1) return
    if (intervalRef.current) clearInterval(intervalRef.current)
    intervalRef.current = setInterval(() => {
      setActiveIdx((idx) => (idx + 1) % images.length)
    }, 4000)
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [images.length])

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const onKey = (e) => {
      if (e.key === 'ArrowRight') setActiveIdx((i) => (i + 1) % Math.max(images.length, 1))
      if (e.key === 'ArrowLeft') setActiveIdx((i) => (i - 1 + Math.max(images.length, 1)) % Math.max(images.length, 1))
    }
    el.addEventListener('keydown', onKey)
    return () => el.removeEventListener('keydown', onKey)
  }, [images.length])

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    let startX = 0
    let delta = 0
    const onTouchStart = (e) => { startX = e.touches[0].clientX; delta = 0 }
    const onTouchMove = (e) => { delta = e.touches[0].clientX - startX }
    const onTouchEnd = () => {
      if (Math.abs(delta) > 50) {
        if (delta < 0) setActiveIdx((i) => (i + 1) % Math.max(images.length, 1))
        else setActiveIdx((i) => (i - 1 + Math.max(images.length, 1)) % Math.max(images.length, 1))
      }
    }
    el.addEventListener('touchstart', onTouchStart, { passive: true })
    el.addEventListener('touchmove', onTouchMove, { passive: true })
    el.addEventListener('touchend', onTouchEnd)
    return () => {
      el.removeEventListener('touchstart', onTouchStart)
      el.removeEventListener('touchmove', onTouchMove)
      el.removeEventListener('touchend', onTouchEnd)
    }
  }, [images.length])
  /* ----------------------------------- */

  if (!post) return null

  return (
    <Layout>
      <article className="mx-auto max-w-4xl px-4 pt-20 pb-16">
        {/* Hero carousel */}
        {images.length > 0 && (
          <motion.div
            ref={containerRef}
            tabIndex={0}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="relative mb-10 rounded-3xl overflow-hidden outline-none shadow-xl"
            aria-roledescription="carousel"
            aria-label="Blog images carousel"
          >
            <div className="aspect-[16/10] relative">
              <AnimatePresence initial={false}>
                <motion.img
                  key={activeIdx}
                  src={images[activeIdx]}
                  alt={post.title}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.6 }}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              </AnimatePresence>
            </div>

            {images.length > 1 && (
              <>
                <button
                  onClick={() => setActiveIdx((i) => (i - 1 + images.length) % images.length)}
                  className="absolute left-4 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-white/80 backdrop-blur text-gray-800 shadow-lg hover:bg-white transition"
                  aria-label="Previous image"
                >
                  ←
                </button>
                <button
                  onClick={() => setActiveIdx((i) => (i + 1) % images.length)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-white/80 backdrop-blur text-gray-800 shadow-lg hover:bg-white transition"
                  aria-label="Next image"
                >
                  →
                </button>

                {/* dots */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                  {images.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveIdx(i)}
                      className={`h-2 rounded-full transition-all duration-300 ${i === activeIdx ? 'w-8 bg-white' : 'w-2 bg-white/60 hover:bg-white'}`}
                      aria-label={`Go to image ${i + 1}`}
                    />
                  ))}
                </div>
              </>
            )}
          </motion.div>
        )}

        {/* Article body */}
        <motion.header
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 tracking-tight">
            {post.title}
          </h1>
          <div className="mt-3 flex items-center gap-4">
            <span className="text-lg text-gray-700 font-medium">By {post.author}</span>
            <span className="text-gray-400">•</span>
            <time className="text-gray-500">{new Date(post.createdAt).toLocaleDateString()}</time>
          </div>
        </motion.header>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="prose prose-lg max-w-none mt-12 text-gray-800"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
      </article>
    </Layout>
  )
}