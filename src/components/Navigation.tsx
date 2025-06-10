// src/components/Navigation.tsx - Simple version with basic icons
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { 
  Home, Users, Trophy, Calendar, BarChart2, 
  User, LogOut, Menu, X
} from 'lucide-react';
import clsx from 'clsx';

type DashboardView = 'overview' | 'clubs' | 'championships' | 'teams' | 'players' | 'games' | 'game-recording' | 'statistics' | 'profile';

interface NavigationProps {
  currentView: DashboardView;
  onViewChange: (view: DashboardView) => void;
  userRole?: string;
}

interface NavItemProps {
  item: {
    id: DashboardView;
    label: string;
    icon: React.ReactNode;
  };
}

const navItems = [
  { id: 'overview', label: 'Dashboard', icon: <Home className="h-5 w-5" /> },
  { id: 'clubs', label: 'Clubs', icon: <Users className="h-5 w-5" /> },
  { id: 'championships', label: 'Championships', icon: <Trophy className="h-5 w-5" /> },
  { id: 'teams', label: 'Teams', icon: <Users className="h-5 w-5" /> },
  { id: 'players', label: 'Players', icon: <Users className="h-5 w-5" /> },
  { id: 'games', label: 'Games', icon: <Calendar className="h-5 w-5" /> },
  { id: 'statistics', label: 'Statistics', icon: <BarChart2 className="h-5 w-5" /> },
  { id: 'profile', label: 'Profile', icon: <User className="h-5 w-5" /> },
];

function NavItem({ item }: NavItemProps) {
  const { currentView, onViewChange } = useNavigation();
  
  return (
    <button
      onClick={() => onViewChange(item.id)}
      className={clsx(
        'flex items-center space-x-3 w-full px-3 py-2 rounded-md transition-colors',
        currentView === item.id
          ? 'bg-blue-50 text-blue-700'
          : 'text-gray-700 hover:bg-gray-100'
      )}
    >
      {item.icon}
      <span className="font-medium">{item.label}</span>
    </button>
  );
}

// Create a context to pass down the current view and change handler
const NavigationContext = React.createContext<{
  currentView: DashboardView;
  onViewChange: (view: DashboardView) => void;
}>({
  currentView: 'overview',
  onViewChange: () => {},
});

function useNavigation() {
  return React.useContext(NavigationContext);
}

export function Navigation({ currentView, onViewChange, userRole }: NavigationProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { signOut } = useAuth();
  
  // Filter items based on user role if needed
  const filteredItems = navItems;
  
  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <NavigationContext.Provider value={{ currentView, onViewChange }}>
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
        'lg:translate-x-0',
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
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {filteredItems.map((item) => (
              <NavItem key={item.id} item={item} />
            ))}
          </nav>

          {/* User section */}
          <div className="p-4 border-t border-gray-200">
            <div className="mb-3">
              <p className="text-sm font-medium text-gray-900">{userRole}</p>
              <p className="text-xs text-gray-600 capitalize">{userRole}</p>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              className="w-full justify-start"
              onClick={handleSignOut}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign out
            </Button>
          </div>
        </div>
      </div>
    </NavigationContext.Provider>
  );
}
