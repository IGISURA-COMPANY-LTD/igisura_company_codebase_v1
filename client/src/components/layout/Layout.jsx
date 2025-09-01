// No logic change — only styling & motion
import { useEffect, useState } from 'react'
import Navbar from './Navbar'
import Footer from './Footer'

export default function Layout({ children, transparentHeader = false }) {
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    if (!transparentHeader) return
    const onScroll = () => setScrolled(window.scrollY > 10)
    onScroll()
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [transparentHeader])

  const headerClass = transparentHeader
    ? `fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${scrolled ? 'bg-white/70 backdrop-blur shadow-lg nav-scrolled' : 'bg-transparent nav-landing '}`
    : 'sticky top-0 z-40 bg-white/80 backdrop-blur shadow-sm nav-scrolled'

  return (
    <div className="min-h-screen flex flex-col">
      <a href="#content" className="sr-only focus:not-sr-only absolute top-4 left-4 z-50 bg-brand-600 text-white px-3 py-1 rounded-md shadow">
        Skip to content
      </a>
      <header className={headerClass}>
        <Navbar />
      </header>
      <main id="content" className="flex-1">{children}</main>
      <Footer />
    </div>
  )
}