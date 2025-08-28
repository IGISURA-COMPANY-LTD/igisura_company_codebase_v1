import Navbar from './Navbar'
import Footer from './Footer'

export default function Layout({ children }) {
  return (
    <div className="min-h-full flex flex-col">
      <a href="#content" className="sr-only focus:not-sr-only focus:ring-2 focus:ring-brand-500 focus:bg-white focus:absolute focus:top-2 focus:left-2 rounded px-3 py-1">Skip to content</a>
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur border-b border-gray-200">
        <Navbar />
      </header>
      <main id="content" className="flex-1">{children}</main>
      <Footer />
    </div>
  )
}


