import Layout from '../components/layout/Layout'

const benefits = [
  'Rich in Metal',
  'Rich in Vitamin A',
  'Rich in Vitamin C',
  'Rich in Vitamin B6',
  'Rich in Proteins',
  'Rich in Calcium which strengthens bones',
  'Increase milk for mothers who breastfeed',
]

export default function HealthBenefits() {
  return (
    <Layout>
      <div className="mx-auto max-w-3xl px-4 py-12">
        <h1 className="text-3xl font-semibold">Health Benefits</h1>
        <ul className="mt-6 space-y-2 list-disc pl-6 text-gray-700">
          {benefits.map((b) => (
            <li key={b}>{b}</li>
          ))}
        </ul>
      </div>
    </Layout>
  )
}


