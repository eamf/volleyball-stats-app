'use client';

import { createContext, useContext, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, Users, Trophy, Calendar, BarChart2, 
  User, LogOut, Menu, X 
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import clsx from 'clsx';
import { useAuth } from '@/contexts/AuthContext';

// Navigation context for state management
const NavigationContext = createContext<{
  currentView: string;
  onViewChange: (view: string) => void;
}>({
  currentView: 'overview',
  onViewChange: () => {},
});

const useNavigation = () => useContext(NavigationContext);

// Navigation items
const navItems = [
  { id: 'overview', label: 'Dashboard', icon: <Home className="h-5 w-5" />, path: '/dashboard' },
  { id: 'clubs', label: 'Clubs', icon: <Users className="h-5 w-5" />, path: '/dashboard/clubs' },
  { id: 'championships', label: 'Championships', icon: <Trophy className="h-5 w-5" />, path: '/dashboard/championships' },
  { id: 'teams', label: 'Teams', icon: <Users className="h-5 w-5" />, path: '/dashboard/teams' },
  { id: 'players', label: 'Players', icon: <Users className="h-5 w-5" />, path: '/dashboard/players' },
  { id: 'games', label: 'Games', icon: <Calendar className="h-5 w-5" />, path: '/dashboard/games' },
  { id: 'statistics', label: 'Statistics', icon: <BarChart2 className="h-5 w-5" />, path: '/dashboard/statistics' },
  { id: 'profile', label: 'Profile', icon: <User className="h-5 w-5" />, path: '/dashboard/profile' },
];

interface NavigationProps {
  currentView: string;
  onViewChange: (view: string) => void;
  userRole?: string;
}

interface NavItemProps {
  item: {
    id: string;
    label: string;
    icon: React.ReactNode;
    path: string;
  };
}

export function Navigation({ currentView, onViewChange, userRole = 'user' }: NavigationProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { signOut } = useAuth();

  // All users can access all navigation items
  // Role-based permissions can be handled at the page level if needed
  const filteredNavItems = navItems;

  function NavItem({ item }: NavItemProps) {
    const pathname = usePathname();
    // Check if the current path starts with the item path
    // This ensures that sub-routes also highlight the parent nav item
    const isActive = pathname === item.path || 
                    (item.path !== '/dashboard' && pathname.startsWith(item.path));
    
    return (
      <Link 
        href={item.path}
        className={clsx(
          'flex items-center space-x-3 w-full px-3 py-2 rounded-md transition-colors',
          isActive
            ? 'bg-blue-50 text-blue-700'
            : 'text-gray-700 hover:bg-gray-100'
        )}
        onClick={() => setIsMobileMenuOpen(false)}
      >
        {item.icon}
        <span className="font-medium">{item.label}</span>
      </Link>
    );
  }

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

          {/* Navigation items */}
          <nav className="flex-1 overflow-y-auto p-4 space-y-1">
            {filteredNavItems.map((item) => (
              <NavItem key={item.id} item={item} />
            ))}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200">
            <button
              onClick={signOut}
              className="flex items-center space-x-3 w-full px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <LogOut className="h-5 w-5" />
              <span className="font-medium">Sign Out</span>
            </button>
          </div>
        </div>
      </div>
    </NavigationContext.Provider>
  );
}
