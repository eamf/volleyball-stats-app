'use client';

import { useState, useEffect } from 'react';
import { ClubsManagement } from '@/components/clubs/ClubsManagement';
import { PageHeader } from '@/components/ui/PageHeader';
import { createClient } from '@/lib/supabase';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

type Club = {
  id: string;
  name: string;
  city: string | null;
  country: string;
  founded_year: number | null;
};

export default function ClubsPage() {
  const [clubs, setClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();
  
  const fetchClubs = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('ClubsPage fetching clubs...');
      const { data, error } = await supabase
        .from('clubs')
        .select('*')
        .order('name');
      
      if (error) {
        console.error('Error fetching clubs:', error);
        setError(`Failed to fetch clubs: ${error.message}`);
        return;
      }
      
      console.log('ClubsPage clubs fetched:', data?.length, data);
      setClubs(data || []);
    } catch (err: any) {
      console.error('Error fetching clubs:', err);
      setError(`An unexpected error occurred: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClubs();
  }, []);
  
  return (
    <div className="container mx-auto py-8">
      <PageHeader title="Clubs" description="Manage your volleyball clubs" />
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md mb-6">
          {error}
          <button 
            className="ml-4 px-3 py-1 bg-white border border-red-300 rounded-md text-sm"
            onClick={fetchClubs}
          >
            Retry
          </button>
        </div>
      )}
      
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : (
        <ClubsManagement 
          clubs={clubs} 
          onRefresh={fetchClubs}
          supabase={supabase} 
        />
      )}
    </div>
  );
}



