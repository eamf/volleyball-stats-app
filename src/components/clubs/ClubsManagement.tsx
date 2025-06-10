'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Plus } from 'lucide-react';
import { AddClubForm } from './AddClubForm';
import { Database } from '@/lib/database.types';
import { createClient } from '@/lib/supabase';

type Club = Database['public']['Tables']['clubs']['Row'];

interface ClubsManagementProps {
  clubs?: Club[];
  onRefresh?: () => void;
  supabase?: any;
}

export function ClubsManagement({ clubs: propClubs, onRefresh, supabase: propSupabase }: ClubsManagementProps) {
  const [isAddingClub, setIsAddingClub] = useState(false);
  const [clubs, setClubs] = useState<Club[]>(propClubs || []);
  const [loading, setLoading] = useState(!propClubs);
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
    if (!propClubs) {
      setLoading(true);
      try {
        console.log('ClubsManagement fetching clubs...');
        const { data, error } = await supabase
          .from('clubs')
          .select('*')
          .order('name');
        
        if (error) {
          console.error('Error fetching clubs:', error);
          throw error;
        }
        
        console.log('ClubsManagement clubs fetched:', data?.length, data);
        setClubs(data || []);
      } catch (error) {
        console.error('Error fetching clubs:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleRefresh = () => {
    if (onRefresh) {
      onRefresh();
    } else {
      fetchClubs();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Clubs Management</h1>
          <p className="text-gray-600 mt-1">Manage volleyball clubs in the system</p>
        </div>
        <Button onClick={() => setIsAddingClub(true)}>
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
        />
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {clubs.length === 0 ? (
          <Card className="col-span-full p-8 text-center">
            <p className="text-gray-500">No clubs found. Add your first club to get started.</p>
          </Card>
        ) : (
          clubs.map((club) => (
            <Card key={club.id} className="p-6">
              <h3 className="font-semibold text-lg">{club.name}</h3>
              <p className="text-gray-600 text-sm">{club.city || 'No city'}, {club.country}</p>
              <p className="text-gray-500 text-xs">Founded: {club.founded_year || 'N/A'}</p>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
