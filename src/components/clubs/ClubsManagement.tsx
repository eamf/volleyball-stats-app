'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { AddClubForm } from './AddClubForm';
import { EditClubForm } from './EditClubForm';
import { createClient } from '@/lib/supabase';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

type Club = {
  id: string;
  name: string;
  city: string | null;
  country: string;
  founded_year: number | null;
};

interface ClubsManagementProps {
  clubs?: Club[];
  onRefresh?: () => void;
  supabase?: any;
}

export function ClubsManagement({ clubs: propClubs, onRefresh, supabase: propSupabase }: ClubsManagementProps) {
  const [isAddingClub, setIsAddingClub] = useState(false);
  const [editingClub, setEditingClub] = useState<Club | null>(null);
  const [clubs, setClubs] = useState<Club[]>(propClubs || []);
  const [loading, setLoading] = useState(!propClubs);
  const [error, setError] = useState<string | null>(null);
  const supabase = propSupabase || createClient();

  // If clubs aren't provided as props, fetch them
  useEffect(() => {
    if (!propClubs) {
      fetchClubs();
    }
  }, [propClubs]);

  // Update local state when prop clubs change
  useEffect(() => {
    if (propClubs) {
      setClubs(propClubs);
    }
  }, [propClubs]);

  const fetchClubs = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('ClubsManagement fetching clubs...');
      const { data, error } = await supabase
        .from('clubs')
        .select('*')
        .order('name');
      
      if (error) {
        console.error('Error fetching clubs:', error);
        setError(`Failed to fetch clubs: ${error.message}`);
        return;
      }
      
      console.log('ClubsManagement clubs fetched:', data?.length, data);
      setClubs(data || []);
    } catch (err: any) {
      console.error('Error fetching clubs:', err);
      setError(`An unexpected error occurred: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    if (onRefresh) {
      onRefresh();
    } else {
      fetchClubs();
    }
  };

  const handleDeleteClub = async (id: string) => {
    if (!confirm('Are you sure you want to delete this club?')) {
      return;
    }
    
    try {
      const { error } = await supabase
        .from('clubs')
        .delete()
        .eq('id', id);
        
      if (error) {
        throw new Error(error.message);
      }
      
      handleRefresh();
    } catch (err: any) {
      console.error('Error deleting club:', err);
      alert(`Failed to delete club: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Clubs Management</h1>
          <p className="text-gray-600 mt-1">Manage volleyball clubs in the system</p>
        </div>
        <Button onClick={() => {
          setIsAddingClub(true);
          setEditingClub(null);
        }}>
          <Plus className="h-4 w-4 mr-2" />
          Add Club
        </Button>
      </div>

      {isAddingClub && (
        <AddClubForm 
          onComplete={() => {
            setIsAddingClub(false);
            handleRefresh();
          }}
          onCancel={() => setIsAddingClub(false)}
          supabase={supabase}
        />
      )}

      {editingClub && (
        <EditClubForm 
          club={editingClub}
          onComplete={() => {
            setEditingClub(null);
            handleRefresh();
          }}
          onCancel={() => setEditingClub(null)}
          supabase={supabase}
        />
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md">
          {error}
          <Button 
            variant="outline" 
            size="sm" 
            className="ml-4" 
            onClick={fetchClubs}
          >
            Retry
          </Button>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {clubs.length === 0 ? (
            <Card className="col-span-full p-8 text-center">
              <p className="text-gray-500">No clubs found. Add your first club to get started.</p>
            </Card>
          ) : (
            clubs.map((club) => (
              <Card key={club.id} className="p-6">
                <div className="flex justify-between">
                  <div>
                    <h3 className="font-semibold text-lg">{club.name}</h3>
                    <p className="text-gray-600 text-sm">{club.city || 'No city'}, {club.country}</p>
                    <p className="text-gray-500 text-xs">Founded: {club.founded_year || 'N/A'}</p>
                  </div>
                  <div className="flex space-x-1">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => {
                        setEditingClub(club);
                        setIsAddingClub(false);
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleDeleteClub(club.id)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
}
