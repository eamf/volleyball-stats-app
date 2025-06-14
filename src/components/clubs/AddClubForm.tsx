// src/components/clubs/AddClubForm.tsx
'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

interface AddClubFormProps {
  onComplete: () => void;
  onCancel: () => void;
  supabase: any;
}

export function AddClubForm({ onComplete, onCancel, supabase }: AddClubFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    city: '',
    country: '',
    founded_year: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validate form
      if (!formData.name || !formData.country) {
        throw new Error('Club name and country are required');
      }

      // Prepare data
      const clubData = {
        name: formData.name,
        city: formData.city || null,
        country: formData.country,
        founded_year: formData.founded_year ? parseInt(formData.founded_year) : null
      };

      // Insert into database
      const { error: insertError } = await supabase
        .from('clubs')
        .insert(clubData);

      if (insertError) {
        throw new Error(insertError.message);
      }

      // Success
      onComplete();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6 mb-6">
      <h2 className="text-xl font-bold mb-4">Add New Club</h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md">
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
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            required
          />
        </div>
        
        <div>
          <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
            City
          </label>
          <Input
            id="city"
            name="city"
            value={formData.city}
            onChange={handleInputChange}
          />
        </div>
        
        <div>
          <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">
            Country *
          </label>
          <Input
            id="country"
            name="country"
            value={formData.country}
            onChange={handleInputChange}
            required
          />
        </div>
        
        <div>
          <label htmlFor="founded_year" className="block text-sm font-medium text-gray-700 mb-1">
            Founded Year
          </label>
          <Input
            id="founded_year"
            name="founded_year"
            type="number"
            value={formData.founded_year}
            onChange={handleInputChange}
            min="1800"
            max={new Date().getFullYear()}
          />
        </div>
        
        <div className="flex justify-end space-x-2 pt-2">
          <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? <LoadingSpinner size="sm" className="mr-2" /> : null}
            Save Club
          </Button>
        </div>
      </form>
    </Card>
  );
}
