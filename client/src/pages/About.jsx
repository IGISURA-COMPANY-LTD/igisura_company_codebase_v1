// about.jsx
import Layout from '../components/layout/Layout';

export default function About() {
  return (
    <Layout>
      <div className="mx-auto max-w-3xl px-4 py-20 sm:py-24">
        {/* Hero headline */}
        <header className="text-center mb-14">
          <h1 className="text-4xl sm:text-5xl font-bold text-brand-700">
            About Us
          </h1>
          <p className="mt-3 text-lg text-gray-600">
            The journey from a single speech to a thriving nettle-powered future.
          </p>
        </header>

        {/* Her Story */}
        <section className="card p-6 sm:p-8 mb-10">
          <h2 className="section-title text-brand-600">Her Story</h2>
          <p className="text-gray-700 leading-relaxed">
            After listening to many of President Paul Kagame’s speeches encouraging our
            generation to create businesses and scale them, the fear I once had—of
            failure and self-doubt—vanished. That spark became the idea to research and
            develop products derived from stinging nettle plants, transforming an
            overlooked weed into opportunity.
          </p>
        </section>

        {/* Mission & Vision */}
        <section className="card p-6 sm:p-8">
          <h2 className="section-title text-brand-600">Mission & Vision</h2>

          <div className="space-y-5">
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">Mission</h3>
              <p className="text-gray-700 leading-relaxed">
                Support and empower nettle farmers by providing efficient, affordable
                processing technology and building the business structure to bring
                high-quality nettle products to market.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-1">Vision</h3>
              <p className="text-gray-700 leading-relaxed">
                To be a sustainable and innovative enterprise producing premium nettle
                products that reduce malnutrition and create meaningful jobs across
                Rwanda and beyond.
              </p>
            </div>
          </div>
        </section>

        {/* Optional CTA */}
        <footer className="mt-12 text-center">
          <a
            href="/contact"
            className="btn-primary-lg"
          >
            Support Us
          </a>
        </footer>
      </div>
    </Layout>
  );
}