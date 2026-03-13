export default function AdminFooter() {
  return (
    <footer className="bg-gray-900 text-gray-400 py-6 mt-auto shrink-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <span className="text-white font-bold">
              <span className="text-orange-400">King's</span> Restaurant
            </span>
            <span className="ml-2 text-xs">Admin Panel</span>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-xs sm:text-sm">
            <a
              href="mailto:gowind.tech@gmail.com"
              className="inline-flex items-center gap-2 text-slate-400 hover:text-orange-400 transition-colors"
            >
              <img
                src="/images/gowind-logo.png"
                alt="Go Wind"
                className="h-5 sm:h-6 w-auto max-w-[80px] sm:max-w-[100px] object-contain"
              />
              <span>Powered By Go Wind - Powering Your Digital Growth</span>
            </a>
            <span className="hidden sm:inline text-slate-600">|</span>
            <span>© {new Date().getFullYear()} King's Restaurant. All rights reserved.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
