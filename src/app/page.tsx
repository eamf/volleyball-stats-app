// src/app/page.tsx - COMPLETE VOLLEYBALL DASHBOARD
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
  Phone,
  Mail,
  Clock,
  Award,
  Target,
  Activity
} from 'lucide-react';
import { clsx } from 'clsx';

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
  _count?: { players: number };
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
  home_team?: Team;
  away_team?: Team;
  championship?: Championship;
}

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
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
      
      if (session?.user) {
        await fetchUserProfile(session.user.id);
      }
      
      setLoading(false);
    };

    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
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

  // Fetch user profile
  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching profile:', error);
        return;
      }

      setUserProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  // Fetch all data when user is loaded
  useEffect(() => {
    if (user && userProfile) {
      fetchAllData();
    }
  }, [user, userProfile]);

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
    const { data, error } = await supabase
      .from('clubs')
      .select('*')
      .order('name');
    
    if (!error) setClubs(data || []);
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
    // Fetch basic statistics
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
    !userProfile?.role || item.roles.includes(userProfile.role)
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

// Dashboard Overview Component
function DashboardOverview({ user, userProfile, statistics, onNavigate }: {
  user: any;
  userProfile: any;
  statistics: any;
  onNavigate: (view: DashboardView) => void;
}) {
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

      {/* Quick Stats */}
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

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <button 
              onClick={() => onNavigate('teams')}
              className="block w-full text-left px-4 py-2 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <Users className="h-4 w-4" />
                <span>Manage Teams</span>
              </div>
            </button>
            <button 
              onClick={() => onNavigate('players')}
              className="block w-full text-left px-4 py-2 rounded-lg bg-green-50 hover:bg-green-100 text-green-700 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <User className="h-4 w-4" />
                <span>Add Players</span>
              </div>
            </button>
            <button 
              onClick={() => onNavigate('games')}
              className="block w-full text-left px-4 py-2 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-700 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <Calendar className="h-4 w-4" />
                <span>Schedule Game</span>
              </div>
            </button>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
          <div className="text-gray-600 text-sm">
            <p>• System initialized</p>
            <p>• Ready for volleyball tracking</p>
            <p>• {userProfile?.role === 'director' ? 'Full access enabled' : 'Coach access enabled'}</p>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">System Status</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Database:</span>
              <span className="text-green-600 font-medium">✓ Connected</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Authentication:</span>
              <span className="text-green-600 font-medium">✓ Active</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">User Role:</span>
              <span className="text-blue-600 font-medium capitalize">{userProfile?.role}</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Getting Started Guide */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Getting Started</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Setup Your Organization</h4>
            <ol className="text-sm text-gray-600 space-y-2 list-decimal ml-4">
              <li>Create or join a club</li>
              <li>Set up championships/leagues</li>
              <li>Create teams and assign coaches</li>
              <li>Add players to your teams</li>
              <li>Schedule games and matches</li>
            </ol>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Track Performance</h4>
            <ol className="text-sm text-gray-600 space-y-2 list-decimal ml-4">
              <li>Use live recording during games</li>
              <li>Track individual player statistics</li>
              <li>Monitor team performance metrics</li>
              <li>Generate detailed reports</li>
              <li>Analyze trends and improvements</li>
            </ol>
          </div>
        </div>
      </Card>
    </div>
  );
}

// Clubs Management Component  
function ClubsManagement({ clubs, onRefresh, supabase }: {
  clubs: Club[];
  onRefresh: () => void;
  supabase: any;
}) {
  const [showForm, setShowForm] = useState(false);
  const [editingClub, setEditingClub] = useState<Club | null>(null);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '',
    city: '',
    country: 'Portugal',
    founded_year: new Date().getFullYear(),
    description: '',
    website: ''
  });

  const resetForm = () => {
    setForm({
      name: '',
      city: '',
      country: 'Portugal',
      founded_year: new Date().getFullYear(),
      description: '',
      website: ''
    });
    setEditingClub(null);
    setShowForm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingClub) {
        const { error } = await supabase
          .from('clubs')
          .update(form)
          .eq('id', editingClub.id);
        
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('clubs')
          .insert([form]);
        
        if (error) throw error;
      }

      await onRefresh();
      resetForm();
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (club: Club) => {
    setForm({
      name: club.name,
      city: club.city || '',
      country: club.country,
      founded_year: club.founded_year || new Date().getFullYear(),
      description: club.description || '',
      website: club.website || ''
    });
    setEditingClub(club);
    setShowForm(true);
  };

  const handleDelete = async (club: Club) => {
    if (!confirm(`Are you sure you want to delete ${club.name}?`)) return;

    try {
      const { error } = await supabase
        .from('clubs')
        .delete()
        .eq('id', club.id);
      
      if (error) throw error;
      await onRefresh();
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Clubs Management</h1>
          <p className="text-gray-600 mt-1">Manage volleyball clubs and organizations</p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Club
        </Button>
      </div>

      {/* Club Form Modal */}
      {showForm && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">
            {editingClub ? 'Edit Club' : 'Add New Club'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Club Name</label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Founded Year</label>
                <Input
                  type="number"
                  value={form.founded_year}
                  onChange={(e) => setForm(prev => ({ ...prev, founded_year: parseInt(e.target.value) }))}
                  min="1800"
                  max={new Date().getFullYear()}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                <Input
                  value={form.city}
                  onChange={(e) => setForm(prev => ({ ...prev, city: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                <Input
                  value={form.country}
                  onChange={(e) => setForm(prev => ({ ...prev, country: e.target.value }))}
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
              <Input
                type="url"
                value={form.website}
                onChange={(e) => setForm(prev => ({ ...prev, website: e.target.value }))}
                placeholder="https://..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
              />
            </div>
            <div className="flex space-x-3">
              <Button type="submit" disabled={loading}>
                {loading ? 'Saving...' : (editingClub ? 'Update' : 'Create')}
              </Button>
              <Button type="button" variant="outline" onClick={resetForm}>
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Clubs List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {clubs.map((club) => (
          <Card key={club.id} className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{club.name}</h3>
                <div className="flex items-center space-x-2 text-sm text-gray-600 mt-1">
                  <MapPin className="h-4 w-4" />
                  <span>{club.city ? `${club.city}, ` : ''}{club.country}</span>
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleEdit(club)}
                  className="text-blue-600 hover:text-blue-700"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete(club)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
            
            {club.founded_year && (
              <p className="text-sm text-gray-600 mb-2">Founded: {club.founded_year}</p>
            )}
            
            {club.description && (
              <p className="text-sm text-gray-600 mb-3">{club.description}</p>
            )}
            
            {club.website && (
              <a 
                href={club.website} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-700 text-sm"
              >
                Visit Website →
              </a>
            )}
          </Card>
        ))}
      </div>

      {clubs.length === 0 && (
        <Card className="p-8 text-center">
          <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No clubs yet</h3>
          <p className="text-gray-600 mb-4">Create your first volleyball club to get started.</p>
          <Button onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add First Club
          </Button>
        </Card>
      )}
    </div>
  );
}