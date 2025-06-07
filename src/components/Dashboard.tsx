// src/components/Dashboard.tsx
'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigation } from '@/components/Navigation';
import { ClubsManagement } from '@/components/clubs/ClubsManagement';
import { ChampionshipsManagement } from '@/components/championships/ChampionshipsManagement';
import { TeamsManagement } from '@/components/teams/TeamsManagement';
import { PlayersManagement } from '@/components/players/PlayersManagement';
import { GamesManagement } from '@/components/games/GamesManagement';
import { GameRecording } from '@/components/game-recording/GameRecording';
import { Statistics } from '@/components/statistics/Statistics';
import { Profile } from '@/components/profile/Profile';

export type DashboardView = 
  | 'overview'
  | 'clubs'
  | 'championships'
  | 'teams'
  | 'players'
  | 'games'
  | 'game-recording'
  | 'statistics'
  | 'profile';

export function Dashboard() {
  const [currentView, setCurrentView] = useState<DashboardView>('overview');
  const { profile } = useAuth();

  const renderView = () => {
    switch (currentView) {
      case 'clubs':
        return <ClubsManagement />;
      case 'championships':
        return <ChampionshipsManagement />;
      case 'teams':
        return <TeamsManagement />;
      case 'players':
        return <PlayersManagement />;
      case 'games':
        return <GamesManagement onStartGame={(gameId) => setCurrentView('game-recording')} />;
      case 'game-recording':
        return <GameRecording onFinish={() => setCurrentView('games')} />;
      case 'statistics':
        return <Statistics />;
      case 'profile':
        return <Profile />;
      default:
        return <DashboardOverview />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation 
        currentView={currentView} 
        onViewChange={setCurrentView}
        userRole={profile?.role}
      />
      
      {/* Main content with proper spacing for desktop navigation */}
      <div className="lg:pl-64">
        <main className="container mx-auto px-4 py-8">
          {renderView()}
        </main>
      </div>
    </div>
  );
}

function DashboardOverview() {
  const { profile } = useAuth();

  const handleQuickAction = (action: string) => {
    // For now, just show an alert - you can expand this later
    alert(`${action} functionality will be implemented soon!`);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {profile?.full_name}!
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
                <button 
                  onClick={() => handleQuickAction('Create New Club')}
                  className="block w-full text-left px-3 py-2 rounded hover:bg-gray-100 text-blue-600 transition-colors"
                >
                  Create New Club
                </button>
                <button 
                  onClick={() => handleQuickAction('Start Championship')}
                  className="block w-full text-left px-3 py-2 rounded hover:bg-gray-100 text-blue-600 transition-colors"
                >
                  Start Championship
                </button>
              </>
            )}
            <button 
              onClick={() => handleQuickAction('Add Team')}
              className="block w-full text-left px-3 py-2 rounded hover:bg-gray-100 text-blue-600 transition-colors"
            >
              Add Team
            </button>
            <button 
              onClick={() => handleQuickAction('Schedule Game')}
              className="block w-full text-left px-3 py-2 rounded hover:bg-gray-100 text-blue-600 transition-colors"
            >
              Schedule Game
            </button>
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
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Statistics Overview
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Teams:</span>
              <span className="font-medium">0</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Players:</span>
              <span className="font-medium">0</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Games:</span>
              <span className="font-medium">0</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Getting Started
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900">For Directors:</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Create and manage clubs</li>
              <li>• Set up championships</li>
              <li>• Oversee all teams and statistics</li>
              <li>• Generate comprehensive reports</li>
            </ul>
          </div>
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900">For Coaches:</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Manage your team's players</li>
              <li>• Record live game statistics</li>
              <li>• Analyze player performance</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
         