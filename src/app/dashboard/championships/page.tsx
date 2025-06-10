'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import { ChampionshipsManagement } from '@/components/championships/ChampionshipsManagement';
import { PageHeader } from '@/components/ui/PageHeader';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

// Define the Championship type
type Championship = {
  id: string;
  name: string;
  season: string;
  start_date: string;
  end_date: string | null;
  description: string | null;
  location: string | null;
  is_active: boolean;
};

export default function ChampionshipsPage() {
  const [championships, setChampionships] = useState<Championship[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const fetchChampionships = async () => {
    setLoading(true);
    try {
      console.log('Fetching championships...');
      const { data, error } = await supabase
        .from('championships')
        .select('*')
        .order('name');
      
      if (error) {
        console.error('Error fetching championships:', error);
        throw error;
      }
      
      console.log('Championships fetched:', data);
      setChampionships(data || []);
    } catch (error) {
      console.error('Error fetching championships:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChampionships();
  }, []);

  return (
    <div className="container mx-auto py-8">
      <PageHeader
        title="Championships"
        description="Manage your volleyball championships"
      />
      
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : (
        <ChampionshipsManagement
          championships={championships}
          onRefresh={fetchChampionships}
        />
      )}
    </div>
  );
}




