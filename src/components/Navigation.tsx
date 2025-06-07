// src/components/Navigation.tsx - Simple version with basic icons
'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { 
  Menu, 
  X, 
  Home, 
  Building, 
  Trophy, 
  Users, 
  User, 
  Calendar,
  BarChart3, 
  Settings,
  LogOut
} from 'lucide-react';
import { clsx } from 'clsx';
import type { DashboardView } from './Dashboard';
import type { UserRole } from '@/types/database';

interface NavigationProps {
  currentView: DashboardView;
  onViewChange: (view: DashboardView) => void;
  userRole?: UserRole;
}

export function Navigation({ currentView, onViewChange, userRole }: NavigationProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { signOut, profile } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const navigationItems = [
    {
      id: 'overview' as DashboardView,
      label: 'Overview',
      icon: Home,
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
      id: 'statistics' as DashboardView,
      label: 'Statistics',
      icon: BarChart3,
      roles: ['director', 'coach']
    }
  ];

  const filteredItems = navigationItems.filter(item => 
    !userRole || item.roles.includes(userRole)
  );

  const NavItem = ({ item, mobile = false }: { item: typeof navigationItems[0], mobile?: boolean }) => {
    const Icon = item.icon;
    const isActive = currentView === item.id;
    
    return (
      <button
        onClick={() => {
          onViewChange(item.id);
          if (mobile) setIsMobileMenuOpen(false);
        }}
        className={clsx(
          'flex items-center space-x-3 w-full px-3 py-2 rounded-lg text-left transition-colors',
          isActive 
            ? 'bg-blue-100 text-blue-700 border-r-2 border-blue-700' 
            : 'text-gray-700 hover:bg-gray-100',
          mobile && 'text-base'
        )}
      >
        <Icon className="h-5 w-5" />
        <span>{item.label}</span>
      </button>
    );
  };

  return (
    <>
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
        'fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out',
        'lg:translate-x-0 lg:static lg:inset-0',
        isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      )}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center space-x-3 p-6 border-b border-gray-200">
            <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">VS</span>
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">Volleyball Stats</h1>
              <p className="text-xs text-gray-600">Professional tracking</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {filteredItems.map((item) => (
              <NavItem key={item.id} item={item} />
            ))}
          </nav>

          {/* User section */}
          <div className="p-4 border-t border-gray-200">
            <div className="mb-3">
              <p className="text-sm font-medium text-gray-900">{profile?.full_name}</p>
              <p className="text-xs text-gray-600 capitalize">{profile?.role}</p>
            </div>
            
            <div className="space-y-1">
              <button
                onClick={() => {
                  onViewChange('profile');
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
    </>
  );
}