import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import SignOutButton from './SignOutButton'

export default async function ProfilePage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: conquests } = await supabase
    .from('conquests')
    .select('*, mountains(*)')
    .eq('user_id', user.id)
    .order('conquered_at', { ascending: false })

  const { data: reviews } = await supabase
    .from('reviews')
    .select('*, agencies(*)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <main className="max-w-4xl mx-auto px-4 py-10">
      <a href="/" className="text-sm text-gray-400 hover:text-gray-600 mb-6 inline-block">
        Back to home
      </a>

      {/* Profile Header */}
      <div className="border rounded-xl p-6 mb-8 flex items-center gap-4">
        {user.user_metadata.avatar_url && (
          <img
            src={user.user_metadata.avatar_url}
            alt="Profile"
            className="w-16 h-16 rounded-full"
          />
        )}
        <div>
          <h1 className="text-2xl font-bold">{user.user_metadata.full_name}</h1>
          <p className="text-gray-500 text-sm">{user.email}</p>
          <div className="mt-2">
            <SignOutButton />
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="border rounded-xl p-5 text-center">
          <p className="text-3xl font-bold">{conquests?.length ?? 0}</p>
          <p className="text-gray-500 text-sm mt-1">Mountains Conquered</p>
        </div>
        <div className="border rounded-xl p-5 text-center">
          <p className="text-3xl font-bold">{reviews?.length ?? 0}</p>
          <p className="text-gray-500 text-sm mt-1">Reviews Written</p>
        </div>
      </div>

      {/* Conquered Mountains */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">🏔️ Conquered Mountains</h2>
        {conquests && conquests.length > 0 ? (
          <div className="grid gap-3">
            {conquests.map((conquest) => (
              <Link
                key={conquest.id}
                href={`/mountains/${conquest.mountain_id}`}
                className="block border rounded-xl p-4 hover:shadow-md transition"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">{conquest.mountains.name}</p>
                    <p className="text-sm text-gray-400">
                      {conquest.mountains.provinces?.join(', ')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{conquest.mountains.elevation}m</p>
                    <p className="text-xs text-gray-400">
                      {new Date(conquest.conquered_at).toLocaleDateString('en-PH', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-gray-400">No mountains conquered yet. 
            <Link href="/mountains" className="text-black underline ml-1">Start exploring!</Link>
          </p>
        )}
      </div>

      {/* Reviews Written */}
      <div>
        <h2 className="text-xl font-semibold mb-4">📝 Reviews Written</h2>
        {reviews && reviews.length > 0 ? (
          <div className="grid gap-3">
            {reviews.map((review) => (
              <Link
                key={review.id}
                href={`/agencies/${review.agency_id}`}
                className="block border rounded-xl p-4 hover:shadow-md transition"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">{review.agencies.name}</p>
                    <p className="text-sm text-gray-500 mt-1">{review.body}</p>
                  </div>
                  <div className="text-right ml-4">
                    <p className="text-sm font-medium">{review.rating} / 5</p>
                    <p className="text-xs text-gray-400">
                      {new Date(review.created_at).toLocaleDateString('en-PH', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-gray-400">No reviews written yet.
            <Link href="/" className="text-black underline ml-1">Review an agency!</Link>
          </p>
        )}
      </div>
    </main>
  )
}