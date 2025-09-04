import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import Layout from '../components/layout/Layout'
import api from '../lib/api'

export default function BlogPost() {
  const { slug } = useParams()
  const [post, setPost] = useState(null)
  useEffect(() => {
    api.get(`/api/blog/slug/${slug}`).then(({ data }) => setPost(data)).catch(() => {})
  }, [slug])
  return (
    <Layout>
      <div className="mx-auto max-w-3xl px-4 py-12">
        {post && (
          <article>
            <h1 className="text-3xl font-semibold">{post.title}</h1>
            <div className="text-sm text-gray-600 mt-1">By {post.author}</div>
            {post.images?.[0] && <img src={post.images[0]} alt="" className="mt-6 rounded-xl" />}
            <div className="prose mt-6" dangerouslySetInnerHTML={{ __html: post.content }} />
          </article>
        )}
      </div>
    </Layout>
  )
}


