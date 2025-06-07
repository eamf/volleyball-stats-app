'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import { Team, PlayerPosition } from '@/types/database';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

interface AddPlayerFormProps {
  onComplete: () => void;
  onCancel: () => void;
}

const POSITIONS: { value: PlayerPosition; label: string }[] = [
  { value: 'setter', label: 'Setter' },
  { value: 'outside_hitter', label: 'Outside Hitter' },
  { value: 'middle_blocker', label: 'Middle Blocker' },
  { value: 'opposite', label: 'Opposite' },
  { value: 'libero', label: 'Libero' },
  { value: 'defensive_specialist', label: 'Defensive Specialist' },
];

export function AddPlayerForm({ onComplete, onCancel }: AddPlayerFormProps) {
  const [formData, setFormData] = useState({
    team_id: '',
    jersey_number: '',
    full_name: '',
    primary_position: 'outside_hitter' as PlayerPosition,
    height_cm: '',
    date_of_birth: '',
    notes: '',
  });
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    loadTeams();
  }, []);

  const loadTeams = async () => {
    try {
      const { data, error } = await supabase
        .from('teams')
        .select('*, club:clubs(*)')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setTeams(data || []);
    } catch (error) {
      console.error('Error loading teams:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase
        .from('players')
        .insert({
          team_id: formData.team_id,
          jersey_number: parseInt(formData.jersey_number),
          full_name: formData.full_name,
          primary_position: formData.primary_position,
          height_cm: formData.height_cm ? parseInt(formData.height_cm) : null,
          date_of_birth: formData.date_of_birth || null,
          notes: formData.notes || null,
        });

      if (error) throw error;
      onComplete();
    } catch (error: any) {
      setError(error.message || 'Failed to create player');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Player</h3>
      
      {error && (
        <div className="mb-4 text-red-600 text-sm p-3 bg-red-50 border border-red-200 rounded-md">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name *
            </label>
            <Input
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              required
              placeholder="Player's full name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Jersey Number *
            </label>
            <Input
              type="number"
              value={formData.jersey_number}
              onChange={(e) => setFormData({ ...formData, jersey_number: e.target.value })}
              required
              min="1"
              max="99"
              placeholder="Jersey number"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Team *
          </label>
          <select
            value={formData.team_id}
            onChange={(e) => setFormData({ ...formData, team_id: e.target.value })}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select a team</option>
            {teams.map((team) => (
              <option key={team.id} value={team.id}>
                {team.name} ({team.club?.name})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Primary Position *
          </label>
          <select
            value={formData.primary_position}
            onChange={(e) => setFormData({ ...formData, primary_position: e.target.value as PlayerPosition })}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {POSITIONS.map((position) => (
              <option key={position.value} value={position.value}>
                {position.label}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Height (cm)
            </label>
            <Input
              type="number"
              value={formData.height_cm}
              onChange={(e) => setFormData({ ...formData, height_cm: e.target.value })}
              min="150"
              max="250"
              placeholder="Height in cm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date of Birth
            </label>
            <Input
              type="date"
              value={formData.date_of_birth}
              onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Notes
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            placeholder="Additional notes about the player..."
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div className="flex space-x-3">
          <Button type="submit" disabled={loading}>
            {loading ? 'Creating...' : 'Create Player'}
          </Button>
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </form>
    </Card>
  );
}
