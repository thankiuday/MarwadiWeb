import { createContext, useContext, useState } from 'react';

export const AdminNavbarContext = createContext(null);

export function AdminNavbarProvider({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  return (
    <AdminNavbarContext.Provider value={{ mobileOpen, setMobileOpen }}>
      {children}
    </AdminNavbarContext.Provider>
  );
}

export function useAdminNavbar() {
  const ctx = useContext(AdminNavbarContext);
  if (!ctx) throw new Error('useAdminNavbar must be used within AdminNavbarProvider');
  return ctx;
}
