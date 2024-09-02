"use client";
import * as React from "react";
import NavDropdownMenu from "./NavbarDropDown";

type NavbarProps = {
    toggleSidebar: () => void;
    isSidebarOpen: boolean;
    

};

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


export default function Navbar({ toggleSidebar ,isSidebarOpen }: NavbarProps) {
    return (
        <div className="flex justify-between items-center bg-black-200 py-4 px-6 shadow-md">
            <div className="flex items-center">
                <button onClick={toggleSidebar} className="text-white sm:hidden">
                {isSidebarOpen ? <CloseIcon /> : <HamburgerIcon />}
                </button>
                <h1 className="text-3xl font-extrabold text-white tracking-tight ml-4">
                    Dashboard
                </h1>
            </div>
            <div>
                <NavDropdownMenu />
            </div>
        </div>
    );
}
