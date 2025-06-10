'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

export default function DashboardPage() {
  const { profile } = useAuth();

  const handleQuickAction = (action: string) => {
    // For now, just show an alert - you can expand this later
    alert(`${action} functionality will be implemented soon!`);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {profile?.full_name || 'User'}!
        </h1>
        <p className="text-gray-600 mt-2">
          Manage your volleyball statistics and track game performance.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Quick Actions
          </h3>
          <div className="space-y-2">
            {profile?.role === 'director' && (
              <>
                <Link 
                  href="/dashboard/clubs"
                  className="block w-full text-left px-3 py-2 rounded hover:bg-gray-100 text-blue-600 transition-colors"
                >
                  Manage Clubs
                </Link>
                <Link 
                  href="/dashboard/championships"
                  className="block w-full text-left px-3 py-2 rounded hover:bg-gray-100 text-blue-600 transition-colors"
                >
                  Manage Championships
                </Link>
              </>
            )}
            <Link 
              href="/dashboard/teams"
              className="block w-full text-left px-3 py-2 rounded hover:bg-gray-100 text-blue-600 transition-colors"
            >
              Manage Teams
            </Link>
            <Link 
              href="/dashboard/games"
              className="block w-full text-left px-3 py-2 rounded hover:bg-gray-100 text-blue-600 transition-colors"
            >
              Manage Games
            </Link>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Recent Activity
          </h3>
          <div className="text-gray-600 text-sm">
            No recent activity to display
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Getting Started
          </h3>
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900">New to the platform?</h4>
            <p className="text-sm text-gray-600">
              Start by creating your teams and adding players to begin tracking statistics.
            </p>
            <div className="pt-2">
              <Link href="/dashboard/teams">
                <Button size="sm">Create Your First Team</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Upcoming Games
          </h3>
          <div className="text-gray-600 text-sm">
            No upcoming games scheduled
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Recent Statistics
          </h3>
          <div className="text-gray-600 text-sm">
            No recent statistics available
          </div>
        </div>
      </div>
    </div>
  );
}
