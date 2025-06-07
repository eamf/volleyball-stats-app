'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Club } from '@/types/database';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Plus, Building2, AlertCircle } from 'lucide-react';
import { AddClubForm } from './AddClubForm';

export function ClubsManagement() {
  const [clubs, setClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const { profile } = useAuth();
  const supabase = createClient();

  useEffect(() => {
    loadClubs();
  }, []);

  const loadClubs = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Add timeout to prevent infinite loading
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout')), 10000)
      );
      
      const queryPromise = supabase
        .from('clubs')
        .select('*')
        .order('name');

      const { data, error } = await Promise.race([queryPromise, timeoutPromise]) as any;

      if (error) {
        console.error('Error loading clubs:', error);
        setError(error.message || 'Failed to load clubs');
        setClubs([]);
      } else {
        setClubs(data || []);
      }
    } catch (error: any) {
      console.error('Error loading clubs:', error);
      setError(error.message || 'An unexpected error occurred');
      setClubs([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddClub = () => {
    setShowAddForm(true);
  };

  const handleAddComplete = () => {
    setShowAddForm(false);
    loadClubs(); // Refresh the list
  };

  // Check authorization first
  if (profile?.role !== 'director') {
    return (
      <div className="text-center py-12">
        <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
        <p className="text-gray-600">Only directors can manage clubs.</p>
      </div>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Clubs Management</h1>
          <Button disabled>
            <Plus className="w-4 h-4 mr-2" />
            Add Club
          </Button>
        </div>
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner size="lg" />
          <span className="ml-3 text-gray-600">Loading clubs...</span>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Clubs Management</h1>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Add Club
          </Button>
        </div>
        <div className="text-center py-12">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Clubs</h3>
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={loadClubs} variant="outline">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  // Success state
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Clubs Management</h1>
        <Button onClick={handleAddClub}>
          <Plus className="w-4 h-4 mr-2" />
          Add Club
        </Button>
      </div>

      {showAddForm && (
        <AddClubForm onComplete={handleAddComplete} onCancel={() => setShowAddForm(false)} />
      )}

      {clubs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {clubs.map((club) => (
            <Card key={club.id} className="p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex items-center">
                  <Building2 className="w-8 h-8 text-blue-600 mr-3" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{club.name}</h3>
                    <p className="text-sm text-gray-600">
                      {club.city ? `${club.city}, ${club.country}` : club.country}
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-4 text-sm text-gray-600">
                Founded: {club.founded_year || 'Unknown'}
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No clubs yet</h3>
          <p className="text-gray-600 mb-4">Create your first club to get started with managing teams and players.</p>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Add Club
          </Button>
        </div>
      )}
    </div>
  );
}
