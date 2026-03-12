export function CardSkeleton() {
  return (
    <div className="bg-white rounded-xl sm:rounded-2xl overflow-hidden shadow-sm animate-pulse flex flex-col h-full">
      <div className="aspect-square w-full bg-gray-200" />
      <div className="p-2.5 sm:p-4 space-y-2 sm:space-y-3">
        <div className="h-3 sm:h-4 bg-gray-200 rounded w-3/4" />
        <div className="h-3 bg-gray-200 rounded w-full hidden sm:block" />
        <div className="h-3 bg-gray-200 rounded w-1/2 hidden sm:block" />
        <div className="flex justify-between items-center pt-2">
          <div className="h-4 sm:h-5 bg-gray-200 rounded w-12 sm:w-16" />
          <div className="h-8 sm:h-9 bg-gray-200 rounded-lg w-14 sm:w-24" />
        </div>
      </div>
    </div>
  );
}

export function TableRowSkeleton({ cols = 6 }) {
  return (
    <tr className="animate-pulse">
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <div className="h-4 bg-gray-200 rounded w-full" />
        </td>
      ))}
    </tr>
  );
}

export function StatSkeleton() {
  return (
    <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-gray-100 animate-pulse">
      <div className="flex items-start gap-3">
        <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-gray-200 shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="h-3 sm:h-4 bg-gray-200 rounded w-20 mb-2" />
          <div className="h-6 sm:h-8 bg-gray-200 rounded w-16" />
        </div>
      </div>
    </div>
  );
}
