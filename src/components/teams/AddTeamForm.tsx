'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import { Club, Championship } from '@/types/database';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

interface AddTeamFormProps {
  onComplete: () => void;
  onCancel: () => void;
}

export function AddTeamForm({ onComplete, onCancel }: AddTeamFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    club_id: '',
    championship_id: '',
    division: '',
    team_color: '#3B82F6',
  });
  const [clubs, setClubs] = useState<Club[]>([]);
  const [championships, setChampionships] = useState<Championship[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [clubsResult, championshipsResult] = await Promise.all([
        supabase.from('clubs').select('*').order('name'),
        supabase.from('championships').select('*').eq('is_active', true).order('name')
      ]);

      if (clubsResult.data) setClubs(clubsResult.data);
      if (championshipsResult.data) setChampionships(championshipsResult.data);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase
        .from('teams')
        .insert({
          name: formData.name,
          club_id: formData.club_id,
          championship_id: formData.championship_id || null,
          division: formData.division || null,
          team_color: formData.team_color,
        });

      if (error) throw error;
      onComplete();
    } catch (error: any) {
      setError(error.message || 'Failed to create team');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Team</h3>
      
      {error && (
        <div className="mb-4 text-red-600 text-sm p-3 bg-red-50 border border-red-200 rounded-md">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Team Name *
          </label>
          <Input
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            placeholder="e.g., Thunder Bolts"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Club *
          </label>
          <select
            value={formData.club_id}
            onChange={(e) => setFormData({ ...formData, club_id: e.target.value })}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select a club</option>
            {clubs.map((club) => (
              <option key={club.id} value={club.id}>
                {club.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Championship
          </label>
          <select
            value={formData.championship_id}
            onChange={(e) => setFormData({ ...formData, championship_id: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select a championship (optional)</option>
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
              Division
            </label>
            <Input
              value={formData.division}
              onChange={(e) => setFormData({ ...formData, division: e.target.value })}
              placeholder="e.g., Division A"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Team Color
            </label>
            <input
              type="color"
              value={formData.team_color}
              onChange={(e) => setFormData({ ...formData, team_color: e.target.value })}
              className="w-full h-10 border border-gray-300 rounded-md"
            />
          </div>
        </div>

        <div className="flex space-x-3">
          <Button type="submit" disabled={loading}>
            {loading ? 'Creating...' : 'Create Team'}
          </Button>
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </form>
    </Card>
  );
}