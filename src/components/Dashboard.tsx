// src/components/Dashboard.tsx
'use client';

import { useState, useEffect } from 'react';
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
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { signOut } from '@/utils/auth';
import { createClient } from '@/lib/supabase';

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
  const { user, profile, loading } = useAuth();
  const supabase = createClient();
  
  // Add state for data
  const [clubs, setClubs] = useState<any[]>([]);
  const [championships, setChampionships] = useState<any[]>([]);
  const [teams, setTeams] = useState<any[]>([]);
  const [players, setPlayers] = useState<any[]>([]);
  const [games, setGames] = useState<any[]>([]);
  const [statistics, setStatistics] = useState<any>({});
  const [dataLoading, setDataLoading] = useState(false);

  // Fetch data when component mounts
  useEffect(() => {
    if (user && profile) {
      fetchData();
    }
  }, [user, profile]);

  const fetchData = async () => {
    setDataLoading(true);
    try {
      await Promise.all([
        fetchClubs(),
        fetchChampionships(),
        fetchTeams(),
        fetchPlayers(),
        fetchGames(),
        fetchStatistics()
      ]);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setDataLoading(false);
    }
  };

  const fetchClubs = async () => {
    console.log('Fetching clubs...');
    try {
      const { data, error } = await supabase
        .from('clubs')
        .select('*')
        .order('name');
      
      if (error) {
        console.error('Error fetching clubs:', error);
        return;
      }
      
      console.log('Clubs fetched:', data);
      setClubs(data || []);
    } catch (error) {
      console.error('Error fetching clubs:', error);
    }
  };

  const fetchChampionships = async () => {
    try {
      const { data, error } = await supabase
        .from('championships')
        .select('*')
        .order('start_date', { ascending: false });
      
      if (error) {
        console.error('Error fetching championships:', error);
        return;
      }
      
      setChampionships(data || []);
    } catch (error) {
      console.error('Error fetching championships:', error);
    }
  };

  const fetchTeams = async () => {
    try {
      const { data, error } = await supabase
        .from('teams')
        .select('*')
        .order('name');
      
      if (error) {
        console.error('Error fetching teams:', error);
        return;
      }
      
      setTeams(data || []);
    } catch (error) {
      console.error('Error fetching teams:', error);
    }
  };

  const fetchPlayers = async () => {
    try {
      const { data, error } = await supabase
        .from('players')
        .select('*')
        .order('last_name');
      
      if (error) {
        console.error('Error fetching players:', error);
        return;
      }
      
      setPlayers(data || []);
    } catch (error) {
      console.error('Error fetching players:', error);
    }
  };

  const fetchGames = async () => {
    try {
      const { data, error } = await supabase
        .from('games')
        .select('*')
        .order('date', { ascending: false });
      
      if (error) {
        console.error('Error fetching games:', error);
        return;
      }
      
      setGames(data || []);
    } catch (error) {
      console.error('Error fetching games:', error);
    }
  };

  const fetchStatistics = async () => {
    // This would be a more complex query in a real app
    setStatistics({
      totalTeams: teams.length,
      totalPlayers: players.length,
      totalGames: games.length
    });
  };

  // Update the renderView function to use the actual data
  const renderView = () => {
    switch (currentView) {
      case 'clubs':
        return <ClubsManagement 
          clubs={clubs}
          onRefresh={fetchClubs}
          supabase={supabase} 
        />;
      case 'championships':
        return <ChampionshipsManagement 
          championships={championships}
          onRefresh={fetchChampionships}
          supabase={supabase}
        />;
      case 'teams':
        return <TeamsManagement 
          teams={teams}
          clubs={clubs}
          championships={championships}
          onRefresh={fetchTeams}
          supabase={supabase}
        />;
      case 'players':
        return <PlayersManagement 
          players={players}
          teams={teams}
          onRefresh={fetchPlayers}
          supabase={supabase}
        />;
      case 'games':
        return <GamesManagement 
          games={games}
          teams={teams}
          championships={championships}
          onRefresh={fetchGames}
          onStartRecording={() => setCurrentView('game-recording')}
          supabase={supabase}
        />;
      case 'game-recording':
        return <GameRecording 
          games={games}
          onFinish={() => setCurrentView('games')}
          supabase={supabase}
        />;
      case 'statistics':
        return <Statistics 
          statistics={statistics}
          clubs={clubs}
          teams={teams}
          games={games}
          players={players}
        />;
      case 'profile':
        return <Profile 
          user={user}
          userProfile={profile}
          onRefresh={() => {}}
          supabase={supabase}
        />;
      default:
        return <DashboardOverview 
          user={user} 
          userProfile={profile}
          statistics={statistics}
          onNavigate={setCurrentView}
        />;
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
      <div className="lg:ml-64">
        <main className="p-6">
          {dataLoading ? (
            <div className="flex justify-center items-center h-64">
              <LoadingSpinner size="lg" />
            </div>
          ) : (
            renderView()
          )}
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
         
