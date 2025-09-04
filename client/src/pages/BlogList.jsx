import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Layout from '../components/layout/Layout'
import api from '../lib/api'

export default function BlogList() {
  const [posts, setPosts] = useState([])
  useEffect(() => {
    api.get('/api/blog').then(({ data }) => setPosts(data.posts || [])).catch(() => {})
  }, [])

  return (
    <Layout>
      <section className="bg-gradient-to-b from-gray-50 to-white">
        <div className="mx-auto max-w-7xl px-4 py-20">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 tracking-tight"
          >
            From the blog
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mt-3 max-w-xl text-lg text-gray-600"
          >
            Stories, tutorials and product updates from our team.
          </motion.p>

          <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((p, i) => (
              <motion.a
                key={p.id}
                href={`/blog/${p.slug || p.id}`}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="group relative flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm hover:shadow-xl transition-shadow duration-300"
              >
                <div className="aspect-[16/10] overflow-hidden">
                  <img
                    src={p.images?.[0]}
                    alt={p.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>

                <div className="flex-1 p-6">
                  <h2 className="text-xl font-semibold text-gray-900 line-clamp-2 group-hover:text-brand-600 transition-colors">
                    {p.title}
                  </h2>
                  <p className="mt-2 text-sm text-gray-500">By {p.author}</p>
                </div>

                <span className="absolute bottom-6 right-6 flex items-center gap-2 text-brand-600 font-semibold opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0 transition-all duration-300">
                  Read more
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </span>
              </motion.a>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  )
}