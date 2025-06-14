'use client';

import { Navigation } from '@/components/Navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useState, useEffect } from 'react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, profile, loading } = useAuth();
  const [currentView, setCurrentView] = useState('overview');
  const [forceLoad, setForceLoad] = useState(false);

  // Add timeout to prevent infinite loading
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (loading) {
        console.warn('⚠️ Dashboard loading timeout, forcing load');
        setForceLoad(true);
      }
    }, 8000); // 8 second timeout

    return () => clearTimeout(timeout);
  }, [loading]);

  if (loading && !forceLoad) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
          <button
            onClick={() => setForceLoad(true)}
            className="mt-4 text-blue-600 hover:text-blue-800 underline text-sm"
          >
            Click here if loading takes too long
          </button>
        </div>
      </div>
    );
  }

  if (!user && !forceLoad) {
    // Redirect to login page
    window.location.href = '/';
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation 
        currentView={currentView} 
        onViewChange={setCurrentView}
        userRole={profile?.role}
      />
      
      {/* Main content with proper spacing for desktop navigation */}
      <div className="lg:ml-64">
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
}