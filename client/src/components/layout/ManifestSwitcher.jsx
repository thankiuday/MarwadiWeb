import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export default function ManifestSwitcher() {
  const { pathname } = useLocation();

  useEffect(() => {
    const isAdminRoute = pathname.startsWith('/admin') || pathname.startsWith('/superadmin');
    const manifestPath = isAdminRoute ? '/manifest-admin.json' : '/manifest.json';

    let link = document.querySelector('link[rel="manifest"]');
    if (!link) {
      link = document.createElement('link');
      link.rel = 'manifest';
      document.head.appendChild(link);
    }
    if (link.getAttribute('href') !== manifestPath) {
      link.href = manifestPath;
    }
  }, [pathname]);

  return null;
}
