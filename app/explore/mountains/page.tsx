import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function MountainsExplorePage() {
  const supabase = await createClient()

  const { data: mountains } = await supabase
    .from('mountains')
    .select('*')
    .order('elevation', { ascending: false })

  return (
    <main className="px-4 py-6">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/explore" className="text-gray-400 hover:text-gray-600">←</Link>
        <h1 className="text-2xl font-bold">All Mountains</h1>
      </div>

      <p className="text-sm text-gray-400 mb-4">{mountains?.length} mountains in the Philippines</p>

      <div className="grid grid-cols-3 gap-3">
        {mountains?.map((mountain) => (
          <Link
            key={mountain.id}
            href={`/mountains/${mountain.id}`}
            className="bg-white rounded-2xl p-3 shadow-sm hover:shadow-md transition text-center"
          >
            <div className="text-3xl mb-1">
              {mountain.is_volcano ? '🌋' : '🏔️'}
            </div>
            <p className="text-xs font-semibold leading-tight line-clamp-2">
              {mountain.name}
            </p>
            <p className="text-xs text-gray-400 mt-1">{mountain.elevation}m</p>
          </Link>
        ))}
      </div>
    </main>
  )
}