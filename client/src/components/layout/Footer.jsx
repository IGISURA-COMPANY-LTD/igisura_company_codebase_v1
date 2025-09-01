export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 py-12 grid gap-8 md:grid-cols-4">
        <div>
          <div className="text-2xl font-bold text-white">Igisura</div>
          <p className="mt-2 text-sm">Natural wellness from stinging nettle.</p>
        </div>
        <div>
          <h4 className="font-semibold mb-3">Company</h4>
          <ul className="space-y-2 text-sm">
            <li><a href="/about" className="hover:text-brand-400">About</a></li>
            <li><a href="/blog" className="hover:text-brand-400">Blog</a></li>
            <li><a href="/health-benefits" className="hover:text-brand-400">Health Benefits</a></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-3">Support</h4>
          <ul className="space-y-2 text-sm">
            <li><a href="#" className="hover:text-brand-400">Help Center</a></li>
            <li><a href="#" className="hover:text-brand-400">Shipping</a></li>
            <li><a href="#" className="hover:text-brand-400">Returns</a></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-3">Follow Us</h4>
          <div className="flex gap-3">
            <a aria-label="WhatsApp" className="w-9 h-9 grid place-items-center rounded-full bg-green-500 hover:bg-green-600 transition" href="https://wa.me/250788000000" target="_blank" rel="noreferrer">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 .5A11.3 11.3 0 0 0 .7 11.8c0 2 .5 3.8 1.5 5.4L.5 23.5l6.5-1.7a11.2 11.2 0 0 0 5 1.2 11.3 11.3 0 1 0 0-22.5Z"/></svg>
            </a>
            <a aria-label="Instagram" className="w-9 h-9 grid place-items-center rounded-full bg-gray-100 text-gray-700 hover:bg-white transition" href="#" target="_blank" rel="noreferrer">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M7 2C4.2 2 2 4.2 2 7v10c0 2.8 2.2 5 5 5h10c2.8 0 5-2.2 5-5V7c0-2.8-2.2-5-5-5H7Z"/></svg>
            </a>
            <a aria-label="Facebook" className="w-9 h-9 grid place-items-center rounded-full bg-gray-100 text-gray-700 hover:bg-white transition" href="#" target="_blank" rel="noreferrer">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M13 10V8c0-.6.4-1 1-1h2V4h-3a3 3 0 0 0-3 3v3H8v3h2v7h3v-7h2.2l.3-3H13Z"/></svg>
            </a>
          </div>
        </div>
      </div>
      <div className="border-t border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-4 text-center text-sm">
          © {new Date().getFullYear()} Igisura Company Ltd
        </div>
      </div>
    </footer>
  )
}