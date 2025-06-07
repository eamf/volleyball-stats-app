'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import { Championship } from '@/types/database';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Plus, Trophy, AlertCircle } from 'lucide-react';

export function ChampionshipsManagement() {
  const [championships, setChampionships] = useState<Championship[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    loadChampionships();
  }, []);

  const loadChampionships = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout')), 10000)
      );
      
      const queryPromise = supabase
        .from('championships')
        .select('*')
        .order('start_date', { ascending: false });

      const { data, error } = await Promise.race([queryPromise, timeoutPromise]) as any;

      if (error) {
        console.error('Error loading championships:', error);
        setError(error.message || 'Failed to load championships');
        setChampionships([]);
      } else {
        setChampionships(data || []);
      }
    } catch (error: any) {
      console.error('Error loading championships:', error);
      setError(error.message || 'An unexpected error occurred');
      setChampionships([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Championships</h1>
          <Button disabled>
            <Plus className="w-4 h-4 mr-2" />
            Add Championship
          </Button>
        </div>
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner size="lg" />
          <span className="ml-3 text-gray-600">Loading championships...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Championships</h1>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Add Championship
          </Button>
        </div>
        <div className="text-center py-12">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Championships</h3>
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={loadChampionships} variant="outline">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Championships</h1>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Add Championship
        </Button>
      </div>

      {championships.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {championships.map((championship) => (
            <Card key={championship.id} className="p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex items-center">
                  <Trophy className="w-8 h-8 text-yellow-600 mr-3" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{championship.name}</h3>
                    <p className="text-sm text-gray-600">{championship.season}</p>
                  </div>
                </div>
              </div>
              <div className="mt-4 text-sm text-gray-600">
                <div>Start: {new Date(championship.start_date).toLocaleDateString()}</div>
                {championship.end_date && (
                  <div>End: {new Date(championship.end_date).toLocaleDateString()}</div>
                )}
              </div>
              <div className="mt-2">
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  championship.is_active 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {championship.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Trophy className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No championships yet</h3>
          <p className="text-gray-600 mb-4">Create your first championship to organize teams and schedule games.</p>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Add Championship
          </Button>
        </div>
      )}
    </div>
  );
}
