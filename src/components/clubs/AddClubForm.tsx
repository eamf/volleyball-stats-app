// src/components/clubs/AddClubForm.tsx
'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

interface AddClubFormProps {
  onComplete: () => void;
  onCancel: () => void;
}

export function AddClubForm({ onComplete, onCancel }: AddClubFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    city: '',
    country: 'USA',
    founded_year: new Date().getFullYear(),
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase
        .from('clubs')
        .insert({
          name: formData.name,
          city: formData.city || null,
          country: formData.country,
          founded_year: formData.founded_year || null,
        });

      if (error) {
        throw error;
      }

      onComplete();
    } catch (error: any) {
      console.error('Error creating club:', error);
      setError(error.message || 'Failed to create club');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Club</h3>
      
      {error && (
        <div className="mb-4 text-red-600 text-sm p-3 bg-red-50 border border-red-200 rounded-md">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Club Name *
          </label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            placeholder="Enter club name"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
              City
            </label>
            <Input
              id="city"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              placeholder="Enter city"
            />
          </div>

          <div>
            <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">
              Country *
            </label>
            <Input
              id="country"
              value={formData.country}
              onChange={(e) => setFormData({ ...formData, country: e.target.value })}
              required
              placeholder="Enter country"
            />
          </div>
        </div>

        <div>
          <label htmlFor="founded_year" className="block text-sm font-medium text-gray-700 mb-1">
            Founded Year
          </label>
          <Input
            id="founded_year"
            type="number"
            value={formData.founded_year}
            onChange={(e) => setFormData({ ...formData, founded_year: parseInt(e.target.value) || new Date().getFullYear() })}
            min="1800"
            max={new Date().getFullYear()}
            placeholder="Enter founded year"
          />
        </div>

        <div className="flex space-x-3">
          <Button type="submit" disabled={loading}>
            {loading ? 'Creating...' : 'Create Club'}
          </Button>
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </form>
    </Card>
  );
}