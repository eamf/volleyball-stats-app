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
    start_date: new Date().toISOString().split('T')[0],
    end_date: '',
    description: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const supabase = createClient();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted');
    setLoading(true);
    setError(null);

    // Validate required fields
    if (!formData.name || !formData.season || !formData.start_date) {
      setError('Championship name, season, and start date are required');
      setLoading(false);
      return;
    }

    try {
      console.log('Submitting championship data:', formData);
      console.log('User ID:', user?.id);
      
      // Create the data object explicitly
      const championshipData = {
        name: formData.name,
        season: formData.season,
        start_date: formData.start_date,
        end_date: formData.end_date || null,
        description: formData.description || null,
        is_active: true,
        created_by: user?.id || null,
      };
      
      console.log('Data being sent to Supabase:', championshipData);
      
      // First, try a simpler insert to see if it works
      const { data, error } = await supabase
        .from('championships')
        .insert(championshipData);
      
      console.log('Insert response:', { data, error });

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      console.log('Championship created successfully');
      onComplete();
    } catch (error: any) {
      console.error('Error creating championship:', error);
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
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Championship Name *
          </label>
          <Input
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            required
            placeholder="e.g., Summer League 2024"
          />
        </div>

        <div>
          <label htmlFor="season" className="block text-sm font-medium text-gray-700 mb-1">
            Season *
          </label>
          <Input
            id="season"
            name="season"
            value={formData.season}
            onChange={handleInputChange}
            required
            placeholder="e.g., 2024"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="start_date" className="block text-sm font-medium text-gray-700 mb-1">
              Start Date *
            </label>
            <Input
              id="start_date"
              name="start_date"
              type="date"
              value={formData.start_date}
              onChange={handleInputChange}
              required
            />
          </div>
          <div>
            <label htmlFor="end_date" className="block text-sm font-medium text-gray-700 mb-1">
              End Date
            </label>
            <Input
              id="end_date"
              name="end_date"
              type="date"
              value={formData.end_date}
              onChange={handleInputChange}
            />
          </div>
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter championship description"
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
