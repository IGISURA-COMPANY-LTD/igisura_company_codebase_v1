export default function Footer() {
  return (
    <footer className="border-t border-gray-200">
      <div className="mx-auto max-w-7xl px-4 py-10 grid gap-8 md:grid-cols-4">
        <div>
          <div className="text-lg font-semibold">Igisura</div>
          <p className="mt-2 text-sm text-gray-600">Natural wellness from stinging nettle.</p>
        </div>
        <div>
          <div className="text-sm font-medium text-gray-900">Company</div>
          <ul className="mt-3 space-y-2 text-sm text-gray-600">
            <li><a className="hover:text-brand-700" href="/about">About</a></li>
            <li><a className="hover:text-brand-700" href="/blog">Blog</a></li>
            <li><a className="hover:text-brand-700" href="/health-benefits">Health Benefits</a></li>
            <li><a className="hover:text-brand-700" href="#">Careers (placeholder)</a></li>
          </ul>
        </div>
        <div>
          <div className="text-sm font-medium text-gray-900">Support</div>
          <ul className="mt-3 space-y-2 text-sm text-gray-600">
            <li><a className="hover:text-brand-700" href="#">Help Center (placeholder)</a></li>
            <li><a className="hover:text-brand-700" href="#">Shipping (placeholder)</a></li>
            <li><a className="hover:text-brand-700" href="#">Returns (placeholder)</a></li>
            <li><a className="hover:text-brand-700" href="#">Contact (placeholder)</a></li>
          </ul>
        </div>
        <div>
          <div className="text-sm font-medium text-gray-900">Follow us</div>
          <div className="mt-3 flex gap-3">
            <a aria-label="WhatsApp" className="size-9 grid place-items-center rounded-full bg-green-500 text-white hover:bg-green-600" href="https://wa.me/250788000000" target="_blank" rel="noreferrer">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 .5A11.3 11.3 0 0 0 .7 11.8c0 2 .5 3.8 1.5 5.4L.5 23.5l6.5-1.7a11.2 11.2 0 0 0 5 1.2 11.3 11.3 0 1 0 0-22.5Zm0 20.3c-1.7 0-3.2-.4-4.6-1.2l-.3-.2-3.8 1 1-3.7-.2-.3a9 9 0 1 1 7.9 4.4Zm5.1-6.7c-.3-.2-1.8-.9-2-.9-.3-.1-.5-.2-.7.2-.2.3-.8 1-.9 1-.2.2-.4.2-.7.1-.3-.2-1.2-.5-2.3-1.5-.8-.7-1.4-1.6-1.6-1.8-.2-.3 0-.5.1-.7.2-.2.3-.4.4-.6.1-.2.2-.4.3-.6.1-.2 0-.5 0-.7l-.7-1.6c-.2-.5-.5-.4-.7-.4h-.6c-.2 0-.6.1-.9.4-.3.3-1.2 1.2-1.2 2.8s1.2 3.2 1.4 3.4c.2.3 2.4 3.6 5.8 4.9.8.3 1.4.5 1.9.6.8.2 1.5.1 2.1.1.6-.1 1.8-.7 2-1.5.2-.7.2-1.4.1-1.5-.1-.2-.3-.2-.6-.4Z"/></svg>
            </a>
            <a aria-label="Instagram" className="size-9 grid place-items-center rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200" href="#" target="_blank" rel="noreferrer">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M7 2C4.2 2 2 4.2 2 7v10c0 2.8 2.2 5 5 5h10c2.8 0 5-2.2 5-5V7c0-2.8-2.2-5-5-5H7Zm0 2h10c1.7 0 3 1.3 3 3v10c0 1.7-1.3 3-3 3H7c-1.7 0-3-1.3-3-3V7c0-1.7 1.3-3 3-3Zm11 2a1 1 0 1 0 0 2 1 1 0 0 0 0-2ZM12 7a5 5 0 1 0 .001 10.001A5 5 0 0 0 12 7Zm0 2a3 3 0 1 1-.001 6.001A3 3 0 0 1 12 9Z"/></svg>
            </a>
            <a aria-label="Facebook" className="size-9 grid place-items-center rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200" href="#" target="_blank" rel="noreferrer">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M13 10V8c0-.6.4-1 1-1h2V4h-3a3 3 0 0 0-3 3v3H8v3h2v7h3v-7h2.2l.3-3H13Z"/></svg>
            </a>
            <a aria-label="Twitter" className="size-9 grid place-items-center rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200" href="#" target="_blank" rel="noreferrer">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M21.5 7.2c-.6.3-1.2.5-1.9.6.7-.4 1.2-1 1.5-1.8-.6.4-1.3.7-2 .8a3.2 3.2 0 0 0-5.6 2.2c0 .3 0 .5.1.8A9.1 9.1 0 0 1 3.2 6.2a3.2 3.2 0 0 0 1 4.3c-.5 0-1-.1-1.4-.4v.1c0 1.6 1.1 3 2.6 3.3-.3.1-.6.1-.9.1-.2 0-.5 0-.7-.1a3.2 3.2 0 0 0 3 2.2A6.5 6.5 0 0 1 2 18.5c-.2 0-.4 0-.6-.1A9.1 9.1 0 0 0 6.3 20c5.9 0 9.2-4.9 9.2-9.2v-.4c.6-.4 1.1-1 1.5-1.6Z"/></svg>
            </a>
          </div>
        </div>
      </div>
      <div className="border-t border-gray-200">
        <div className="mx-auto max-w-7xl px-4 py-6 text-sm text-gray-600">© {new Date().getFullYear()} Igisura Company Ltd</div>
      </div>
    </footer>
  )
}


