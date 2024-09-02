'use client'
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useMemo, useCallback, useEffect, useState } from 'react';

const useIsSmallScreen = () => {
  const [isSmallScreen, setIsSmallScreen] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => {
      setIsSmallScreen(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return isSmallScreen;
};
interface SideNavbarProps {
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
}


const SideNavbar: React.FC<SideNavbarProps> = ({ isSidebarOpen, onToggleSidebar }) => {
  const pathname = usePathname();
  const isSmallScreen = useIsSmallScreen(); 

  const menuItems = useMemo(
    () => [
      { href: '/', label: 'Overview', icon: <OverviewIcon /> },
      { href: '/dashboard/invoices', label: 'Invoices', icon: <InvoicesIcon /> },
      { href: '/dashboard/clients', label: 'Customers', icon: <ClientsIcon /> },
      { href: '/dashboard/items', label: 'Items', icon: <ItemsIcon /> },
      { href: '/dashboard/expenses', label: 'Expenses', icon: <ExpensesIcon /> },
      { href: '/dashboard/reports', label: 'Reports', icon: <ReportsIcon /> },
      { href: '/dashboard/settings', label: 'Settings', icon: <SettingsIcon /> },
      { href: '/dashboard/vendor', label: 'Vendors', icon: <VendorIcon /> },
      { href: '/dashboard/ledger', label: 'Ledger', icon: <LedgerIcon /> },
      { href: '/dashboard/suppliers', label: 'Suppliers', icon: <SupplierIcon /> },
    ],
    []
  );

  const handleLinkClick = useCallback(() => {
    if (isSmallScreen) {
      onToggleSidebar(); // Close sidebar on small screens
    }
  }, [isSmallScreen, onToggleSidebar]);

  return (
    <div className={`relative ${isSidebarOpen ? 'w-64 absolute z-20' : 'w-0'} h-full bg-black-100 text-white flex flex-col sm:w-64 md:w-72 lg:w-80`}>
      <nav className={`flex-1 overflow-y-auto ${isSidebarOpen ? 'block ' : 'hidden'} sm:block`}>
        <ul className='mx-4 space-y-2 my-2'>
          {menuItems.map(({ href, label, icon }) => (
            <li key={href} className={`p-1 ${pathname === href ? 'bg-black-300 rounded-md' : 'hover:bg-black-300 rounded-md'} `}>
              <Link
                href={href}
                className={`flex items-center gap-2 p-2 rounded-sm ${pathname === href ? 'bg-black-200' : ''}`}
                onClick={handleLinkClick} // Add the click handler here
              >
                {icon}
                <span className=" sm:inline">{label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};
// Icon components for better readability
const OverviewIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
  </svg>
);

const InvoicesIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z" />
  </svg>
);

const ClientsIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
  </svg>
);

const ItemsIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
  </svg>
);

const ExpensesIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 8.25H9m6 3H9m3 6-3-3h1.5a3 3 0 1 0 0-6M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
  </svg>
);

const ReportsIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
  </svg>
);

const SettingsIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9a3.75 3.75 0 1 0-7.5 0 3.75 3.75 0 0 0 7.5 0Zm-7.5 0V6.75a.75.75 0 0 1 .75-.75h10.5a.75.75 0 0 1 .75.75V9m-3.75 6.75V21.75a.75.75 0 0 1-.75.75h-10.5a.75.75 0 0 1-.75-.75V15.75m0 0V9m0 6.75V21.75" />
  </svg>
);

const VendorIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12.75a4.5 4.5 0 0 1 9 0 4.5 4.5 0 0 1-9 0ZM21 12.75a7.5 7.5 0 0 1-15 0A7.5 7.5 0 0 1 21 12.75Z" />
  </svg>
);

const LedgerIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 6h18M3 12h18M3 18h18M4.5 6v12M6 6v12m1.5-12v12M9 6v12m1.5-12v12m1.5-12v12m1.5-12v12m1.5-12v12m1.5-12v12m1.5-12v12" />
  </svg>
);

const SupplierIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.5v-1.75a.75.75 0 0 0-.75-.75H15V8.25a.75.75 0 0 0-.75-.75H9a.75.75 0 0 0-.75.75v3.75H3.75A.75.75 0 0 0 3 11.75v1.75a.75.75 0 0 0 .75.75H9v3.75a.75.75 0 0 0 .75.75h4.5a.75.75 0 0 0 .75-.75v-3.75h5.25a.75.75 0 0 0 .75-.75Z" />
  </svg>
);

const HamburgerIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 6h15m-15 6h15m-15 6h15" />
  </svg>
);

const CloseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

export default SideNavbar;
