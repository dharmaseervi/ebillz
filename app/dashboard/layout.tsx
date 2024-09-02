'use client';
import Navbar from '@/components/dashboard/navbar';
import SideNavbar from '@/components/sidenavbar/sideNavbar';
import { ReactNode, useState } from 'react';

type LayoutProps = {
    children: ReactNode;
};

export default function Layout({ children }: LayoutProps) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const toggleSidebar = () => {
        setIsSidebarOpen(prev => !prev);
    };

    return (
        <div className="flex flex-col h-screen overflow-hidden">
            <Navbar toggleSidebar={toggleSidebar}  isSidebarOpen={isSidebarOpen}  />
            <div className="flex flex-1 overflow-hidden">
                <div className={`transition-width duration-300 ${isSidebarOpen ? 'w-full' : 'w-0'} flex-none bg-black-100 lg:w-80`}>
                    <SideNavbar isSidebarOpen={isSidebarOpen}  onToggleSidebar={toggleSidebar} />
                </div>
                <div className={`flex-1 overflow-auto bg-white`}>
                    {children}
                </div>
            </div>
        </div>
    );
}
