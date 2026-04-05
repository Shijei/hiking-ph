import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import ReviewForm from './ReviewForm'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function AgencyPage({ params }: PageProps) {
  const { id } = await params

  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  const { data: agency, error: agencyError } = await supabase
    .from('agencies')
    .select('*')
    .eq('id', id)
    .single()

  if (agencyError || !agency) return notFound()

  const { data: reviews } = await supabase
    .from('reviews')
    .select('*')
    .eq('agency_id', id)
    .order('created_at', { ascending: false })

  const avgRating =
    reviews && reviews.length > 0
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
      : null

  const reviewCount = reviews?.length ?? 0
  const fbUrl = agency.fb_page_url as string | null

  return (
    <main className="max-w-4xl mx-auto px-4 py-10">

      <a href="/" className="text-sm text-gray-400 hover:text-gray-600 mb-6 inline-block">
        Back to agencies
      </a>

      <div className="border rounded-xl p-6 mb-8">
        <h1 className="text-3xl font-bold">{agency.name}</h1>
        <p className="text-gray-500 mt-2">{agency.description}</p>

        <div className="flex flex-wrap gap-4 mt-4 text-sm text-gray-500">
          <span>Price: {agency.price_range}</span>
          <span>Location: {agency.regions?.join(', ')}</span>
        </div>

        {fbUrl && (
          <div className="mt-2">
            <a href={fbUrl} target="_blank" className="text-blue-500 text-sm hover:underline">
              Facebook Page
            </a>
          </div>
        )}

        {avgRating && (
          <div className="mt-4 text-2xl font-semibold">
            {avgRating} / 5
            <span className="text-sm text-gray-400 font-normal ml-2">
              ({reviewCount} {reviewCount === 1 ? 'review' : 'reviews'})
            </span>
          </div>
        )}
      </div>

      <div className="mb-8">
        {user ? (
          <ReviewForm agencyId={id} userId={user.id} />
        ) : (
          <div className="border rounded-xl p-5 text-center">
            <p className="text-gray-500 mb-3">Sign in to write a review.</p>
            <a href="/login" className="bg-black text-white px-4 py-2 rounded-xl text-sm hover:bg-gray-800 transition">
              Sign in
            </a>
          </div>
        )}
      </div>

      <h2 className="text-xl font-semibold mb-4">Reviews</h2>

      {reviews && reviews.length > 0 ? (
        <div className="grid gap-4">
          {reviews.map((review) => (
            <div key={review.id} className="border rounded-xl p-5">
              <div className="flex items-center gap-2 mb-2">
                <span className="font-medium">{review.rating} / 5</span>
                <span className="text-sm text-gray-400">
                  {new Date(review.created_at).toLocaleDateString('en-PH', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </span>
              </div>
              <p className="text-gray-700">{review.body}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-400">No reviews yet. Be the first to review this agency!</p>
      )}

    </main>
  )
}