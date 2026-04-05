import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function MountainsPage() {
  const supabase = await createClient()

  const { data: mountains, error } = await supabase
    .from('mountains')
    .select('*')
    .order('elevation', { ascending: false })

  if (error) {
    return <p className="p-10 text-red-500">Error: {error.message}</p>
  }

  return (
    <main className="max-w-4xl mx-auto px-4 py-10">
      <a href="/" className="text-sm text-gray-400 hover:text-gray-600 mb-6 inline-block">
        Back to home
      </a>

      <div className="mb-8">
        <h1 className="text-3xl font-bold">🏔️ Philippine Mountains</h1>
        <p className="text-gray-500 mt-1">
          {mountains?.length} mountains listed — track the ones you have conquered.
        </p>
      </div>

      <div className="grid gap-3">
        {mountains?.map((mountain) => (
          <Link
            key={mountain.id}
            href={`/mountains/${mountain.id}`}
            className="block border rounded-xl p-5 hover:shadow-md transition"
          >
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-lg font-semibold">
                  {mountain.name}
                  {mountain.is_volcano && (
                    <span className="ml-2 text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">
                      Volcano
                    </span>
                  )}
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  {mountain.provinces?.join(', ')}
                </p>
              </div>
              <div className="text-right">
                <span className="text-sm font-medium text-gray-700">
                  {mountain.elevation}m
                </span>
                <p className="text-xs text-gray-400">{mountain.island_group}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </main>
  )
}