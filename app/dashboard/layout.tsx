// components/Layout.tsx
import Navbar from '@/components/dashboard/navbar';
import SideNavbar from '@/components/sidenavbar/sideNavbar';
import { ReactNode } from 'react';

type LayoutProps = {
    children: ReactNode;
};

export default function Layout({ children }: LayoutProps) {
    return (
        <div className="flex flex-col h-screen">
            <Navbar />
            <div className="flex flex-1 overflow-hidden">
                <div className="w-80 flex-none bg-gray-800">
                    <SideNavbar />
                </div>
                <div className="flex-1 overflow-auto bg-gray-100 p-4">
                    {children}
                </div>
            </div>
        </div>
    );
}
