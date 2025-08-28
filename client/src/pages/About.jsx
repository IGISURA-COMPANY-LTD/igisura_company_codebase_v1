import Layout from '../components/layout/Layout'

export default function About() {
  return (
    <Layout>
      <div className="mx-auto max-w-3xl px-4 py-12 space-y-6">
        <h1 className="text-3xl font-semibold">About Us</h1>
        <section>
          <h2 className="text-xl font-medium">Her Story</h2>
          <p className="mt-2 text-gray-700">After listening to many of the President Paul Kagame speeches encouraging our generation to create our own businesses and improving by expanding those start-ups; the fear that I always had of not being confident and of failure suddenly vanished. Thus was the idea born of researching and developing products derived from the stinging nettle plants.</p>
        </section>
        <section>
          <h2 className="text-xl font-medium">Mission & Vision</h2>
          <p className="mt-2 text-gray-700">Mission: Support and empower nettle farmers by providing efficient, affordable processing technology and building the business structure to bring nettle products to market.</p>
          <p className="mt-2 text-gray-700">Vision: To be a sustainable and innovative enterprise producing high quality nettle products to reduce malnutrition and create jobs.</p>
        </section>
      </div>
    </Layout>
  )
}


