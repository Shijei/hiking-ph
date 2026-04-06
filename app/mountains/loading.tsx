export default function Loading() {
  return (
    <main className="px-4 py-6">
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded-xl w-32 mb-6" />
        <div className="grid gap-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-2xl p-5 shadow-sm">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
              <div className="h-3 bg-gray-100 rounded w-1/2" />
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}