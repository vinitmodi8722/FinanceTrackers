import React from 'react';
import Sidebar from './Sidebar';

export default function Layout({ children }) {
    return (
        <div className="flex h-screen bg-slate-50 font-sans text-slate-800">
            <Sidebar />
            <main className="flex-1 overflow-y-auto p-4 lg:p-8 pt-16 lg:pt-8">
                <div className="max-w-7xl mx-auto">
                    {children}
                </div>
            </main>
        </div>
    );
}
