// src/app/page.tsx - CLEAN VERSION WITHOUT COMPILE ERRORS
'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { 
  Volleyball, 
  LogOut, 
  Menu, 
  X,
  Home as HomeIcon, 
  Building, 
  Trophy, 
  Users, 
  User, 
  Calendar,
  BarChart3, 
  Settings,
  Play,
  Plus,
  Edit,
  Trash2,
  MapPin,
  Clock,
  Award,
  Target,
  Activity
} from 'lucide-react';
import { clsx } from 'clsx';

// Types
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

interface Club {
  id: string;
  name: string;
  city?: string;
  country: string;
  founded_year?: number;
  logo_url?: string;
  description?: string;
  website?: string;
  is_active: boolean;
  created_at: string;
}

interface Championship {
  id: string;
  name: string;
  season: string;
  start_date: string;
  end_date?: string;
  description?: string;
  status: string;
  max_teams: number;
  is_active: boolean;
  created_at: string;
}

interface Team {
  id: string;
  name: string;
  club_id?: string;
  championship_id?: string;
  division?: string;
  team_color: string;
  home_venue?: string;
  is_active: boolean;
  club?: Club;
  championship?: Championship;
}

interface Player {
  id: string;
  team_id: string;
  jersey_number: number;
  full_name: string;
  primary_position: string;
  secondary_position?: string;
  height_cm?: number;
  date_of_birth?: string;
  nationality: string;
  is_active: boolean;
  notes?: string;
  team?: Team;
}

interface Game {
  id: string;
  championship_id?: string;
  home_team_id: string;
  away_team_id: string;
  scheduled_at: string;
  venue?: string;
  status: string;
  home_score: number;
  away_score: number;
  completed_at?: string;
  referee?: string;
  notes?: string;
  home_team?: Team;
  away_team?: Team;
  championship?: Championship;
}

// Main Component
export default function Home() {
  const [user, setUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState<DashboardView>('overview');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Data states
  const [clubs, setClubs] = useState<Club[]>([]);
  const [championships, setChampionships] = useState<Championship[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [games, setGames] = useState<Game[]>([]);
  const [statistics, setStatistics] = useState<any>({});

  const [authForm, setAuthForm] = useState({
    isLogin: true,
    email: '',
    password: '',
    fullName: '',
    role: 'coach' as 'director' | 'coach',
    loading: false,
    error: '',
    message: ''
  });

  const supabase = createClient();

  useEffect(() => {
    console.log('🔍 Auth state changed:', { 
      loading, 
      user: user?.email || 'none', 
      userProfile: userProfile?.full_name || 'none' 
    });
    
    const getSession = async () => {
      console.log('🔍 Getting session...');
      const { data: { session } } = await supabase.auth.getSession();
      console.log('🔍 Session result:', session ? 'User found' : 'No session');
      
      setUser(session?.user || null);
      
      if (session?.user) {
        console.log('🔍 Fetching profile for user...');
        await fetchUserProfile(session.user.id);
      }
      
      console.log('🔍 Setting loading to false');
      setLoading(false);
    };

    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔍 Auth state change event:', event, session?.user?.email);
      setUser(session?.user || null);
      
      if (session?.user) {
        await fetchUserProfile(session.user.id);
      } else {
        setUserProfile(null);
      }
      
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Fetch user profile (don't wait for it to show the app)
  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      // Don't throw errors or block the app if profile doesn't exist
      if (error) {
        console.log('No profile found or error fetching profile:', error);
        setUserProfile(null);
        return;
      }

      setUserProfile(data);
    } catch (error) {
      console.log('Profile fetch error:', error);
      setUserProfile(null);
    }
  };

  // Fetch all data when user is loaded (remove profile dependency)
  useEffect(() => {
    if (user) {
      fetchAllData();
    }
  }, [user]); // Remove userProfile dependency

  const fetchAllData = async () => {
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
    }
  };

  const fetchClubs = async () => {
    try {
      const { data, error } = await supabase
        .from('clubs')
        .select('*')
        .order('name');
      
      if (error) {
        console.error('Error fetching clubs:', error);
        return;
      }
      
      setClubs(data || []);
    } catch (error) {
      console.error('Error fetching clubs:', error);
    }
  };

  const fetchChampionships = async () => {
    const { data, error } = await supabase
      .from('championships')
      .select('*')
      .order('start_date', { ascending: false });
    
    if (!error) setChampionships(data || []);
  };

  const fetchTeams = async () => {
    const { data, error } = await supabase
      .from('teams')
      .select(`
        *,
        club:clubs(*),
        championship:championships(*)
      `)
      .order('name');
    
    if (!error) setTeams(data || []);
  };

  const fetchPlayers = async () => {
    const { data, error } = await supabase
      .from('players')
      .select(`
        *,
        team:teams(
          *,
          club:clubs(*)
        )
      `)
      .order('full_name');
    
    if (!error) setPlayers(data || []);
  };

  const fetchGames = async () => {
    const { data, error } = await supabase
      .from('games')
      .select(`
        *,
        home_team:teams!home_team_id(*),
        away_team:teams!away_team_id(*),
        championship:championships(*)
      `)
      .order('scheduled_at', { ascending: false });
    
    if (!error) setGames(data || []);
  };

  const fetchStatistics = async () => {
    const stats = {
      totalClubs: clubs.length,
      totalChampionships: championships.length,
      totalTeams: teams.length,
      totalPlayers: players.length,
      totalGames: games.length,
      activeChampionships: championships.filter(c => c.is_active).length,
      completedGames: games.filter(g => g.status === 'completed').length
    };
    
    setStatistics(stats);
  };

  const navigationItems = [
    {
      id: 'overview' as DashboardView,
      label: 'Overview',
      icon: HomeIcon,
      roles: ['director', 'coach']
    },
    {
      id: 'clubs' as DashboardView,
      label: 'Clubs',
      icon: Building,
      roles: ['director']
    },
    {
      id: 'championships' as DashboardView,
      label: 'Championships',
      icon: Trophy,
      roles: ['director']
    },
    {
      id: 'teams' as DashboardView,
      label: 'Teams',
      icon: Users,
      roles: ['director', 'coach']
    },
    {
      id: 'players' as DashboardView,
      label: 'Players',
      icon: User,
      roles: ['director', 'coach']
    },
    {
      id: 'games' as DashboardView,
      label: 'Games',
      icon: Calendar,
      roles: ['director', 'coach']
    },
    {
      id: 'game-recording' as DashboardView,
      label: 'Live Recording',
      icon: Play,
      roles: ['director', 'coach']
    },
    {
      id: 'statistics' as DashboardView,
      label: 'Statistics',
      icon: BarChart3,
      roles: ['director', 'coach']
    }
  ];

  const filteredItems = navigationItems.filter(item => 
    // Show all items for now, regardless of role
    true
  );

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthForm(prev => ({ ...prev, loading: true, error: '', message: '' }));

    try {
      if (authForm.isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email: authForm.email,
          password: authForm.password
        });
        if (error) throw error;
      } else {
        // Sign up and create profile
        const { data, error } = await supabase.auth.signUp({
          email: authForm.email,
          password: authForm.password
        });
        
        if (error) throw error;

        if (data.user) {
          // Create user profile
          const { error: profileError } = await supabase
            .from('user_profiles')
            .insert({
              id: data.user.id,
              email: authForm.email,
              full_name: authForm.fullName,
              role: authForm.role,
              is_active: true
            });

          if (profileError) {
            console.error('Profile creation error:', profileError);
          }
        }
        
        setAuthForm(prev => ({ ...prev, message: 'Account created! You can now sign in.' }));
      }
    } catch (error: any) {
      setAuthForm(prev => ({ ...prev, error: error.message }));
    } finally {
      setAuthForm(prev => ({ ...prev, loading: false }));
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUserProfile(null);
    setClubs([]);
    setChampionships([]);
    setTeams([]);
    setPlayers([]);
    setGames([]);
  };

  const renderContent = () => {
    switch (currentView) {
      case 'overview':
        return <DashboardOverview 
          user={user} 
          userProfile={userProfile}
          statistics={statistics}
          onNavigate={setCurrentView}
        />;
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
        return <StatisticsView 
          statistics={statistics}
          clubs={clubs}
          teams={teams}
          games={games}
          players={players}
        />;
      case 'profile':
        return <ProfileManagement 
          user={user}
          userProfile={userProfile}
          onRefresh={() => fetchUserProfile(user.id)}
          supabase={supabase}
        />;
      default:
        return <DashboardOverview 
          user={user} 
          userProfile={userProfile}
          statistics={statistics}
          onNavigate={setCurrentView}
        />;
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Login form
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <Card className="w-full max-w-md p-8">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <Volleyball className="h-12 w-12 text-blue-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Volleyball Statistics</h1>
            <p className="text-gray-600 mt-2">Professional volleyball tracking</p>
          </div>

          <form onSubmit={handleAuth} className="space-y-4">
            {!authForm.isLogin && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <Input
                  type="text"
                  value={authForm.fullName}
                  onChange={(e) => setAuthForm(prev => ({ ...prev, fullName: e.target.value }))}
                  placeholder="Enter your full name"
                  required={!authForm.isLogin}
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <Input
                type="email"
                value={authForm.email}
                onChange={(e) => setAuthForm(prev => ({ ...prev, email: e.target.value }))}
                placeholder="Enter your email"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <Input
                type="password"
                value={authForm.password}
                onChange={(e) => setAuthForm(prev => ({ ...prev, password: e.target.value }))}
                placeholder="Enter your password"
                required
                minLength={6}
              />
            </div>

            {!authForm.isLogin && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select
                  value={authForm.role}
                  onChange={(e) => setAuthForm(prev => ({ ...prev, role: e.target.value as 'director' | 'coach' }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="coach">Coach</option>
                  <option value="director">Director</option>
                </select>
              </div>
            )}

            {authForm.error && (
              <div className="text-red-600 text-sm p-3 bg-red-50 border border-red-200 rounded">
                {authForm.error}
              </div>
            )}

            {authForm.message && (
              <div className="text-green-600 text-sm p-3 bg-green-50 border border-green-200 rounded">
                {authForm.message}
              </div>
            )}

            <Button type="submit" disabled={authForm.loading} className="w-full">
              {authForm.loading ? 'Please wait...' : (authForm.isLogin ? 'Sign In' : 'Sign Up')}
            </Button>

            <div className="text-center">
              <button
                type="button"
                onClick={() => setAuthForm(prev => ({ 
                  ...prev, 
                  isLogin: !prev.isLogin, 
                  error: '', 
                  message: '' 
                }))}
                className="text-blue-600 hover:text-blue-500 text-sm"
              >
                {authForm.isLogin ? "Need an account? Sign up" : "Have an account? Sign in"}
              </button>
            </div>
          </form>
        </Card>
      </div>
    );
  }

  // Main Dashboard
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </Button>
      </div>

      {/* Mobile menu overlay */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-black bg-opacity-50" onClick={() => setIsMobileMenuOpen(false)} />
      )}

      {/* Sidebar */}
      <div className={clsx(
        'fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0',
        isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      )}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center space-x-3 p-6 border-b border-gray-200">
            <Volleyball className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-lg font-semibold text-gray-900">Volleyball Stats</h1>
              <p className="text-xs text-gray-600">Professional tracking</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {filteredItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setCurrentView(item.id);
                    setIsMobileMenuOpen(false);
                  }}
                  className={clsx(
                    'flex items-center space-x-3 w-full px-3 py-2 rounded-lg text-left transition-colors',
                    isActive 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'text-gray-700 hover:bg-gray-100'
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* User section */}
          <div className="p-4 border-t border-gray-200">
            <div className="mb-3">
              <p className="text-sm font-medium text-gray-900">
                {userProfile?.full_name || user.email.split('@')[0]}
              </p>
              <p className="text-xs text-gray-600 capitalize">{userProfile?.role || 'User'}</p>
            </div>
            
            <div className="space-y-1">
              <button
                onClick={() => {
                  setCurrentView('profile');
                  setIsMobileMenuOpen(false);
                }}
                className={clsx(
                  'flex items-center space-x-3 w-full px-3 py-2 rounded-lg text-left transition-colors text-sm',
                  currentView === 'profile'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-100'
                )}
              >
                <Settings className="h-4 w-4" />
                <span>Profile</span>
              </button>
              
              <button
                onClick={handleSignOut}
                className="flex items-center space-x-3 w-full px-3 py-2 rounded-lg text-left transition-colors text-sm text-gray-700 hover:bg-gray-100"
              >
                <LogOut className="h-4 w-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64 min-h-screen">
        <main className="p-4 lg:p-8">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}

// Component definitions will be in separate files - for now showing placeholders
function DashboardOverview({ user, userProfile, statistics, onNavigate }: any) {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {userProfile?.full_name || user.email.split('@')[0]}!
        </h1>
        <p className="text-gray-600 mt-2">
          Manage your volleyball statistics and track game performance.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center">
            <Building className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Clubs</p>
              <p className="text-2xl font-bold text-gray-900">{statistics.totalClubs || 0}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Teams</p>
              <p className="text-2xl font-bold text-gray-900">{statistics.totalTeams || 0}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <User className="h-8 w-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Players</p>
              <p className="text-2xl font-bold text-gray-900">{statistics.totalPlayers || 0}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <Calendar className="h-8 w-8 text-orange-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Games</p>
              <p className="text-2xl font-bold text-gray-900">{statistics.totalGames || 0}</p>
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button 
            onClick={() => onNavigate('clubs')}
            className="p-4 text-left rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            <Building className="h-6 w-6 text-blue-600 mb-2" />
            <h4 className="font-medium text-gray-900">Manage Clubs</h4>
            <p className="text-sm text-gray-600">Create and organize volleyball clubs</p>
          </button>
          
          <button 
            onClick={() => onNavigate('teams')}
            className="p-4 text-left rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            <Users className="h-6 w-6 text-green-600 mb-2" />
            <h4 className="font-medium text-gray-900">Manage Teams</h4>
            <p className="text-sm text-gray-600">Set up teams and assign players</p>
          </button>
          
          <button 
            onClick={() => onNavigate('games')}
            className="p-4 text-left rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            <Calendar className="h-6 w-6 text-purple-600 mb-2" />
            <h4 className="font-medium text-gray-900">Schedule Games</h4>
            <p className="text-sm text-gray-600">Plan and track volleyball matches</p>
          </button>
        </div>
      </Card>
    </div>
  );
}

// Placeholder components - implement these separately
function ClubsManagement(props: any) {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Clubs Management</h1>
      <Card className="p-8">
        <p className="text-gray-500">Clubs management will be implemented here.</p>
      </Card>
    </div>
  );
}

function ChampionshipsManagement(props: any) {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Championships Management</h1>
      <Card className="p-8">
        <p className="text-gray-500">Championships management will be implemented here.</p>
      </Card>
    </div>
  );
}

function TeamsManagement(props: any) {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Teams Management</h1>
      <Card className="p-8">
        <p className="text-gray-500">Teams management will be implemented here.</p>
      </Card>
    </div>
  );
}

function PlayersManagement(props: any) {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Players Management</h1>
      <Card className="p-8">
        <p className="text-gray-500">Players management will be implemented here.</p>
      </Card>
    </div>
  );
}

function GamesManagement(props: any) {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Games Management</h1>
      <Card className="p-8">
        <p className="text-gray-500">Games management will be implemented here.</p>
      </Card>
    </div>
  );
}

function GameRecording(props: any) {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Game Recording</h1>
      <Card className="p-8">
        <p className="text-gray-500">Live game recording will be implemented here.</p>
      </Card>
    </div>
  );
}

function StatisticsView(props: any) {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Statistics</h1>
      <Card className="p-8">
        <p className="text-gray-500">Statistics and analytics will be implemented here.</p>
      </Card>
    </div>
  );
}

function ProfileManagement(props: any) {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
      <Card className="p-8">
        <p className="text-gray-500">Profile management will be implemented here.</p>
      </Card>
    </div>
  );
}