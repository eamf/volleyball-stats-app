// src/components/Navigation.tsx
'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { DashboardView } from '@/components/Dashboard';
import { 
  Home, 
  Building2, 
  Trophy, 
  Users, 
  UserPlus, 
  Calendar, 
  Play, 
  BarChart3, 
  User, 
  LogOut,
  Menu,
  X,
  Volleyball
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface NavigationProps {
  currentView: DashboardView;
  onViewChange: (view: DashboardView) => void;
  userRole?: 'director' | 'coach';
}

interface NavItem {
  id: DashboardView;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  roles: ('director' | 'coach')[];
}

const navigationItems: NavItem[] = [
  { id: 'overview', label: 'Overview', icon: Home, roles: ['director', 'coach'] },
  { id: 'clubs', label: 'Clubs', icon: Building2, roles: ['director'] },
  { id: 'championships', label: 'Championships', icon: Trophy, roles: ['director', 'coach'] },
  { id: 'teams', label: 'Teams', icon: Users, roles: ['director', 'coach'] },
  { id: 'players', label: 'Players', icon: UserPlus, roles: ['director', 'coach'] },
  { id: 'games', label: 'Games', icon: Calendar, roles: ['director', 'coach'] },
  { id: 'game-recording', label: 'Live Game', icon: Play, roles: ['director', 'coach'] },
  { id: 'statistics', label: 'Statistics', icon: BarChart3, roles: ['director', 'coach'] },
];

export function Navigation({ currentView, onViewChange, userRole }: NavigationProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { profile, signOut } = useAuth();

  const filteredItems = navigationItems.filter(item => 
    userRole && item.roles.includes(userRole)
  );

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const NavItems = () => (
    <>
      {filteredItems.map((item) => {
        const Icon = item.icon;
        const isActive = currentView === item.id;
        
        return (
          <button
            key={item.id}
            onClick={() => {
              onViewChange(item.id);
              setIsOpen(false);
            }}
            className={`flex items-center w-full px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              isActive
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <Icon className="mr-3 h-5 w-5" />
            {item.label}
          </button>
        );
      })}
    </>
  );

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 lg:border-r lg:border-gray-200 lg:bg-white lg:pt-5 lg:pb-4 lg:overflow-y-auto">
        <div className="flex items-center flex-shrink-0 px-6">
          <Volleyball className="h-8 w-8 text-blue-600" />
          <span className="ml-2 text-xl font-bold text-gray-900">
            VolleyStats
          </span>
        </div>
        
        <div className="mt-6 flex-1 flex flex-col justify-between">
          <div className="px-3 space-y-1">
            <NavItems />
          </div>
          
          <div className="px-3 mt-6 space-y-1">
            <button
              onClick={() => {
                onViewChange('profile');
                setIsOpen(false);
              }}
              className={`flex items-center w-full px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                currentView === 'profile'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <User className="mr-3 h-5 w-5" />
              Profile
            </button>
            
            <button
              onClick={handleSignOut}
              className="flex items-center w-full px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
            >
              <LogOut className="mr-3 h-5 w-5" />
              Sign Out
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation */}
      <div className="lg:hidden">
        {/* Mobile header */}
        <div className="flex items-center justify-between bg-white border-b border-gray-200 px-4 py-3">
          <div className="flex items-center">
            <Volleyball className="h-8 w-8 text-blue-600" />
            <span className="ml-2 text-xl font-bold text-gray-900">
              VolleyStats
            </span>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsOpen(!isOpen)}
            className="p-2"
          >
            {isOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </Button>
        </div>

        {/* Mobile menu */}
        {isOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div 
              className="fixed inset-0 bg-black bg-opacity-25"
              onClick={() => setIsOpen(false)}
            />
            <div className="relative flex flex-col w-full max-w-xs bg-white h-full shadow-xl">
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
                <div className="flex items-center">
                  <Volleyball className="h-8 w-8 text-blue-600" />
                  <span className="ml-2 text-xl font-bold text-gray-900">
                    VolleyStats
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                  className="p-2"
                >
                  <X className="h-6 w-6" />
                </Button>
              </div>
              
              <div className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
                <NavItems />
              </div>
              
              <div className="px-3 py-4 border-t border-gray-200 space-y-1">
                <button
                  onClick={() => {
                    onViewChange('profile');
                    setIsOpen(false);
                  }}
                  className={`flex items-center w-full px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    currentView === 'profile'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <User className="mr-3 h-5 w-5" />
                  Profile
                </button>
                
                <button
                  onClick={handleSignOut}
                  className="flex items-center w-full px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                >
                  <LogOut className="mr-3 h-5 w-5" />
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}