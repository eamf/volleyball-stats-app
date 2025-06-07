'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import { Game } from '@/types/database';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Plus, Calendar, Play } from 'lucide-react';

interface GamesManagementProps {
  onStartGame: (gameId: string) => void;
}

export function GamesManagement({ onStartGame }: GamesManagementProps) {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    loadGames();
  }, []);

  const loadGames = async () => {
    try {
      const { data, error } = await supabase
        .from('games')
        .select(`
          *,
          home_team:teams!home_team_id(*),
          away_team:teams!away_team_id(*),
          championship:championships(*)
        `)
        .order('scheduled_at', { ascending: false });

      if (error) throw error;
      setGames(data || []);
    } catch (error) {
      console.error('Error loading games:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return <LoadingSpinner size="lg" className="py-12" />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Games Management</h1>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Schedule Game
        </Button>
      </div>

      <div className="space-y-4">
        {games.map((game) => (
          <Card key={game.id} className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-4">
                  <div className="text-lg font-semibold text-gray-900">
                    {game.home_team?.name} vs {game.away_team?.name}
                  </div>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(game.status)}`}>
                    {game.status.replace('_', ' ')}
                  </span>
                </div>
                <div className="mt-2 text-sm text-gray-600 space-y-1">
                  <div>Championship: {game.championship?.name}</div>
                  <div>Date: {new Date(game.scheduled_at).toLocaleString()}</div>
                  {game.venue && <div>Venue: {game.venue}</div>}
                  {game.status === 'completed' && (
                    <div>Final Score: {game.home_score} - {game.away_score}</div>
                  )}
                </div>
              </div>
              
              <div className="flex space-x-2">
                {game.status === 'scheduled' && (
                  <Button
                    onClick={() => onStartGame(game.id)}
                    size="sm"
                  >
                    <Play className="w-4 h-4 mr-1" />
                    Start Game
                  </Button>
                )}
                {game.status === 'in_progress' && (
                  <Button
                    onClick={() => onStartGame(game.id)}
                    size="sm"
                    variant="secondary"
                  >
                    Continue
                  </Button>
                )}
                <Button variant="outline" size="sm">
                  View Details
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {games.length === 0 && (
        <div className="text-center py-12">
          <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No games scheduled</h3>
          <p className="text-gray-600 mb-4">Schedule your first game to get started.</p>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Schedule Game
          </Button>
        </div>
      )}
    </div>
  );
}
