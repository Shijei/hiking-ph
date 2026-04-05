import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import ConquestButton from './ConquestButton'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function MountainPage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  const { data: mountain, error } = await supabase
    .from('mountains')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !mountain) return notFound()

  const { data: conquest } = user
    ? await supabase
        .from('conquests')
        .select('*')
        .eq('mountain_id', id)
        .eq('user_id', user.id)
        .single()
    : { data: null }

  const { count } = await supabase
    .from('conquests')
    .select('*', { count: 'exact', head: true })
    .eq('mountain_id', id)

  return (
    <main className="max-w-4xl mx-auto px-4 py-10">
      <a href="/mountains" className="text-sm text-gray-400 hover:text-gray-600 mb-6 inline-block">
        Back to mountains
      </a>

      <div className="border rounded-xl p-6 mb-8">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold">
              {mountain.name}
              {mountain.is_volcano && (
                <span className="ml-2 text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full align-middle">
                  Volcano
                </span>
              )}
            </h1>
            <p className="text-gray-500 mt-1">{mountain.island_group}</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold">{mountain.elevation}m</p>
            <p className="text-sm text-gray-400">elevation</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-6 text-sm">
          <div>
            <p className="text-gray-400">Province/s</p>
            <p className="font-medium">{mountain.provinces?.join(', ')}</p>
          </div>
          <div>
            <p className="text-gray-400">Region/s</p>
            <p className="font-medium">{mountain.regions?.join(', ')}</p>
          </div>
          <div>
            <p className="text-gray-400">Coordinates</p>
            <p className="font-medium">{mountain.coordinates ?? 'N/A'}</p>
          </div>
          <div>
            <p className="text-gray-400">Hikers conquered</p>
            <p className="font-medium">{count ?? 0}</p>
          </div>
        </div>

        {mountain.alt_names?.length > 0 && (
          <div className="mt-4 text-sm">
            <p className="text-gray-400">Also known as</p>
            <p className="font-medium">{mountain.alt_names.join(', ')}</p>
          </div>
        )}
      </div>

      <div className="mb-8">
        {user ? (
          <ConquestButton
            mountainId={id}
            userId={user.id}
            conquered={!!conquest}
          />
        ) : (
          <div className="border rounded-xl p-5 text-center">
            <p className="text-gray-500 mb-3">Sign in to mark this mountain as conquered.</p>
            <a href="/login" className="bg-black text-white px-4 py-2 rounded-xl text-sm hover:bg-gray-800 transition">
              Sign in
            </a>
          </div>
        )}
      </div>
    </main>
  )
}