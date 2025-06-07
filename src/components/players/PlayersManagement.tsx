'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import { Player } from '@/types/database';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Plus, UserPlus } from 'lucide-react';

export function PlayersManagement() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    loadPlayers();
  }, []);

  const loadPlayers = async () => {
    try {
      const { data, error } = await supabase
        .from('players')
        .select(`
          *,
          team:teams(
            *,
            club:clubs(*)
          )
        `)
        .eq('is_active', true)
        .order('full_name');

      if (error) throw error;
      setPlayers(data || []);
    } catch (error) {
      console.error('Error loading players:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner size="lg" className="py-12" />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Players Management</h1>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Add Player
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {players.map((player) => (
          <Card key={player.id} className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                  <span className="text-blue-600 font-bold text-lg">
                    {player.jersey_number}
                  </span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{player.full_name}</h3>
                  <p className="text-sm text-gray-600">{player.team?.name}</p>
                </div>
              </div>
            </div>
            <div className="mt-4 space-y-1 text-sm text-gray-600">
              <div>Position: {player.primary_position.replace('_', ' ')}</div>
              {player.height_cm && <div>Height: {player.height_cm} cm</div>}
              {player.date_of_birth && (
                <div>Age: {new Date().getFullYear() - new Date(player.date_of_birth).getFullYear()}</div>
              )}
            </div>
          </Card>
        ))}
      </div>

      {players.length === 0 && (
        <div className="text-center py-12">
          <UserPlus className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No players yet</h3>
          <p className="text-gray-600 mb-4">Add players to your teams to get started.</p>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Add Player
          </Button>
        </div>
      )}
    </div>
  );
}
