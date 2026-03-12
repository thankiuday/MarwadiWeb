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
          <div className="text-xs sm:text-sm">
            © {new Date().getFullYear()} King's Restaurant. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}
