export default function TopNavbar({ title }) {
  return (
    <header className="sticky top-0 z-10 bg-white/98 backdrop-blur-md border-b border-slate-100 shadow-sm">
      <div className="flex items-center justify-between gap-3 pl-[68px] pr-4 lg:pl-6 py-3 sm:py-4 min-h-[56px] sm:min-h-[64px]">
        <h1 className="text-lg sm:text-2xl font-bold text-gray-900 truncate min-w-0 flex-1">{title}</h1>
      </div>
    </header>
  );
}
