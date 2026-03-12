export default function PageLoader() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50/80" aria-label="Loading">
      <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
      <p className="mt-4 text-sm text-slate-500">Loading...</p>
    </div>
  );
}
