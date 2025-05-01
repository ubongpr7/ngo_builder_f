export default function Loading() {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="h-8 w-64 bg-gray-200 rounded animate-pulse mb-6"></div>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white p-6 rounded-lg shadow">
              <div className="h-5 w-24 bg-gray-200 rounded animate-pulse mb-2"></div>
              <div className="h-8 w-16 bg-gray-200 rounded animate-pulse mb-1"></div>
              <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
            </div>
          ))}
        </div>
  
        <div className="grid gap-6 md:grid-cols-2">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="h-6 w-48 bg-gray-200 rounded animate-pulse mb-4"></div>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="border-b pb-4">
                  <div className="h-5 w-48 bg-gray-200 rounded animate-pulse mb-2"></div>
                  <div className="h-4 w-full bg-gray-200 rounded animate-pulse mb-1"></div>
                  <div className="h-3 w-32 bg-gray-200 rounded animate-pulse"></div>
                </div>
              ))}
            </div>
          </div>
  
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="h-6 w-48 bg-gray-200 rounded animate-pulse mb-4"></div>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-4 border-b pb-4">
                  <div className="h-16 w-16  => (
                <div key={i} className=\"flex gap-4 border-b pb-4">
                  <div className="h-16 w-16 bg-gray-200 rounded animate-pulse"></div>
                  <div>
                    <div className="h-5 w-48 bg-gray-200 rounded animate-pulse mb-2"></div>
                    <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
  
        <div className="mt-8">
          <div className="h-24 w-full bg-gray-200 rounded animate-pulse"></div>
        </div>
      </div>
    )
  }
  