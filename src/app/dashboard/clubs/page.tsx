'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { ClubsManagement } from '@/components/clubs/ClubsManagement';
import { PageHeader } from '@/components/ui/PageHeader';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Button } from '@/components/ui/Button';

// Create a direct Supabase client with explicit credentials
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type Club = {
  id: string;
  name: string;
  city?: string | null;
  country: string;
  founded_year?: number | null;
};

export default function ClubsPage() {
  const [clubs, setClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchClubs = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('clubs')
        .select('*');
      
      if (error) throw error;
      console.log('Clubs fetched:', data);
      setClubs(data || []);
    } catch (error: any) {
      console.error('Error:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const addSampleClub = async () => {
    try {
      const { data, error } = await supabase
        .from('clubs')
        .insert({
          name: 'Test Club ' + Date.now(),
          country: 'USA'
        })
        .select();
      
      if (error) throw error;
      console.log('Club added:', data);
      fetchClubs();
    } catch (error: any) {
      console.error('Error adding club:', error);
      setError(error.message);
    }
  };

  useEffect(() => {
    fetchClubs();
  }, []);

  return (
    <div className="container mx-auto py-8">
      <PageHeader title="Clubs" description="Manage your volleyball clubs" />
      
      {error && <div className="p-4 bg-red-100 text-red-700 mb-4 rounded">{error}</div>}
      
      <div className="mb-4">
        <Button onClick={addSampleClub}>Add Test Club</Button>
        <Button onClick={fetchClubs} className="ml-2">Refresh</Button>
      </div>
      
      {loading ? (
        <LoadingSpinner size="lg" />
      ) : (
        <div>
          <p>Found {clubs.length} clubs</p>
          {clubs.length > 0 ? (
            <div className="grid grid-cols-3 gap-4">
              {clubs.map(club => (
                <div key={club.id} className="p-4 border rounded">
                  <h3>{club.name}</h3>
                  <p>{club.city || 'No city'}, {club.country}</p>
                </div>
              ))}
            </div>
          ) : (
            <p>No clubs found. Add one to get started.</p>
          )}
        </div>
      )}
    </div>
  );
}



