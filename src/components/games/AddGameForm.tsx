'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import { Team, Championship } from '@/types/database';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

interface AddGameFormProps {
  onComplete: () => void;
  onCancel: () => void;
}

export function AddGameForm({ onComplete, onCancel }: AddGameFormProps) {
  const [formData, setFormData] = useState({
    championship_id: '',
    home_team_id: '',
    away_team_id: '',
    scheduled_at: '',
    venue: '',
  });
  const [teams, setTeams] = useState<Team[]>([]);
  const [championships, setChampionships] = useState<Championship[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [teamsResult, championshipsResult] = await Promise.all([
        supabase.from('teams').select('*, club:clubs(*)').eq('is_active', true).order('name'),
        supabase.from('championships').select('*').eq('is_active', true).order('name')
      ]);

      if (teamsResult.data) setTeams(teamsResult.data);
      if (championshipsResult.data) setChampionships(championshipsResult.data);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (formData.home_team_id === formData.away_team_id) {
      setError('Home team and away team cannot be the same');
      setLoading(false);
      return;
    }

    try {
      const { error } = await supabase
        .from('games')
        .insert({
          championship_id: formData.championship_id,
          home_team_id: formData.home_team_id,
          away_team_id: formData.away_team_id,
          scheduled_at: formData.scheduled_at,
          venue: formData.venue || null,
        });

      if (error) throw error;
      onComplete();
    } catch (error: any) {
      setError(error.message || 'Failed to schedule game');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Schedule New Game</h3>
      
      {error && (
        <div className="mb-4 text-red-600 text-sm p-3 bg-red-50 border border-red-200 rounded-md">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Championship *
          </label>
          <select
            value={formData.championship_id}
            onChange={(e) => setFormData({ ...formData, championship_id: e.target.value })}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select a championship</option>
            {championships.map((championship) => (
              <option key={championship.id} value={championship.id}>
                {championship.name}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Home Team *
            </label>
            <select
              value={formData.home_team_id}
              onChange={(e) => setFormData({ ...formData, home_team_id: e.target.value })}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select home team</option>
              {teams.map((team) => (
                <option key={team.id} value={team.id}>
                  {team.name} ({team.club?.name})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Away Team *
            </label>
            <select
              value={formData.away_team_id}
              onChange={(e) => setFormData({ ...formData, away_team_id: e.target.value })}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select away team</option>
              {teams.filter(team => team.id !== formData.home_team_id).map((team) => (
                <option key={team.id} value={team.id}>
                  {team.name} ({team.club?.name})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date & Time *
            </label>
            <Input
              type="datetime-local"
              value={formData.scheduled_at}
              onChange={(e) => setFormData({ ...formData, scheduled_at: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Venue
            </label>
            <Input
              value={formData.venue}
              onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
              placeholder="Game venue"
            />
          </div>
        </div>

        <div className="flex space-x-3">
          <Button type="submit" disabled={loading}>
            {loading ? 'Scheduling...' : 'Schedule Game'}
          </Button>
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </form>
    </Card>
  );
}