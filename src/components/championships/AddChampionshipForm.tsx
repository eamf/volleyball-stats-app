'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

interface AddChampionshipFormProps {
  onComplete: () => void;
  onCancel: () => void;
}

export function AddChampionshipForm({ onComplete, onCancel }: AddChampionshipFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    season: new Date().getFullYear().toString(),
    start_date: '',
    end_date: '',
    description: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase
        .from('championships')
        .insert({
          name: formData.name,
          season: formData.season,
          start_date: formData.start_date,
          end_date: formData.end_date || null,
          description: formData.description || null,
          created_by: user?.id,
        });

      if (error) throw error;
      onComplete();
    } catch (error: any) {
      setError(error.message || 'Failed to create championship');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Championship</h3>
      
      {error && (
        <div className="mb-4 text-red-600 text-sm p-3 bg-red-50 border border-red-200 rounded-md">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Championship Name *
          </label>
          <Input
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            placeholder="e.g., Spring League 2024"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Season *
            </label>
            <Input
              value={formData.season}
              onChange={(e) => setFormData({ ...formData, season: e.target.value })}
              required
              placeholder="e.g., 2024"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Date *
            </label>
            <Input
              type="date"
              value={formData.start_date}
              onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            End Date
          </label>
          <Input
            type="date"
            value={formData.end_date}
            onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Championship description..."
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div className="flex space-x-3">
          <Button type="submit" disabled={loading}>
            {loading ? 'Creating...' : 'Create Championship'}
          </Button>
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </form>
    </Card>
  );
}