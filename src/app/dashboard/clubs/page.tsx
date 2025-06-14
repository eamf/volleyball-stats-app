'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Plus, Edit, Trash2, Building } from 'lucide-react';

// Define types
type Club = {
  id: string;
  name: string;
  logo_url: string | null;
  city: string | null;
  country: string;
  founded_year: number | null;
  website: string | null;
  is_active: boolean;
};

export default function ClubsPage() {
  // State
  const [clubs, setClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddingClub, setIsAddingClub] = useState(false);
  const [editingClub, setEditingClub] = useState<Club | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    logo_url: '',
    city: '',
    country: '',
    founded_year: '',
    website: '',
    is_active: true
  });

  // Create Supabase client
  const supabase = createClient();
  
  // Fetch data on component mount
  useEffect(() => {
    fetchClubs();
  }, []);
  
  // Fetch clubs from Supabase
  const fetchClubs = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('Fetching clubs...');
      const { data, error } = await supabase
        .from('clubs')
        .select('*')
        .order('name');
      
      if (error) {
        throw error;
      }
      
      console.log('Clubs fetched:', data?.length);
      setClubs(data || []);
    } catch (err: any) {
      console.error('Error fetching clubs:', err);
      setError(`Failed to fetch clubs: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.type === 'checkbox' 
      ? e.target.checked 
      : e.target.value;
    
    setFormData({
      ...formData,
      [e.target.name]: value,
    });
  };
  
  // Reset form data
  const resetForm = () => {
    setFormData({
      name: '',
      logo_url: '',
      city: '',
      country: '',
      founded_year: '',
      website: '',
      is_active: true
    });
  };

  // Set form data for editing
  const prepareEditForm = (club: Club) => {
    setFormData({
      name: club.name,
      logo_url: club.logo_url || '',
      city: club.city || '',
      country: club.country,
      founded_year: club.founded_year?.toString() || '',
      website: club.website || '',
      is_active: club.is_active
    });
    setEditingClub(club);
  };
  
  // Add a new club
  const addClub = async (e: React.FormEvent) => {
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
        logo_url: formData.logo_url || null,
        city: formData.city || null,
        country: formData.country,
        founded_year: formData.founded_year ? parseInt(formData.founded_year) : null,
        website: formData.website || null,
        is_active: formData.is_active
      };
      
      // Insert into database
      const { error: insertError } = await supabase
        .from('clubs')
        .insert(clubData);
      
      if (insertError) {
        throw insertError;
      }
      
      // Reset form and refresh clubs
      resetForm();
      setIsAddingClub(false);
      fetchClubs();
    } catch (err: any) {
      console.error('Error adding club:', err);
      setError(`Failed to add club: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  // Update an existing club
  const updateClub = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingClub) return;
    
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
        logo_url: formData.logo_url || null,
        city: formData.city || null,
        country: formData.country,
        founded_year: formData.founded_year ? parseInt(formData.founded_year) : null,
        website: formData.website || null,
        is_active: formData.is_active
      };
      
      // Update in database
      const { error: updateError } = await supabase
        .from('clubs')
        .update(clubData)
        .eq('id', editingClub.id);
      
      if (updateError) {
        throw updateError;
      }
      
      // Reset form and refresh clubs
      resetForm();
      setEditingClub(null);
      fetchClubs();
    } catch (err: any) {
      console.error('Error updating club:', err);
      setError(`Failed to update club: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  // Delete a club
  const deleteClub = async (id: string) => {
    if (!confirm('Are you sure you want to delete this club?')) {
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const { error: deleteError } = await supabase
        .from('clubs')
        .delete()
        .eq('id', id);
      
      if (deleteError) {
        throw deleteError;
      }
      
      fetchClubs();
    } catch (err: any) {
      console.error('Error deleting club:', err);
      setError(`Failed to delete club: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };
  

  
  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Clubs</h1>
          <p className="text-gray-600 mt-1">Manage your volleyball clubs</p>
        </div>
        {!isAddingClub && !editingClub && (
          <Button onClick={() => setIsAddingClub(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Club
          </Button>
        )}
      </div>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md mb-6">
          {error}
        </div>
      )}
      
      {/* Add/Edit Form */}
      {(isAddingClub || editingClub) && (
        <Card className="p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">
            {editingClub ? 'Edit Club' : 'Add New Club'}
          </h2>
          
          <form onSubmit={editingClub ? updateClub : addClub} className="space-y-4">
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
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                  City
                </label>
                <Input
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  placeholder="e.g. São Paulo"
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
                  placeholder="e.g. Brazil"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  placeholder="e.g. 1985"
                  min="1800"
                  max={new Date().getFullYear()}
                />
              </div>

              <div>
                <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-1">
                  Website
                </label>
                <Input
                  id="website"
                  name="website"
                  value={formData.website}
                  onChange={handleInputChange}
                  placeholder="https://example.com"
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="logo_url" className="block text-sm font-medium text-gray-700 mb-1">
                Logo URL
              </label>
              <Input
                id="logo_url"
                name="logo_url"
                value={formData.logo_url}
                onChange={handleInputChange}
                placeholder="https://example.com/logo.png"
              />
            </div>
            
            <div className="flex items-center">
              <input
                id="is_active"
                name="is_active"
                type="checkbox"
                checked={formData.is_active}
                onChange={handleInputChange}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="is_active" className="ml-2 block text-sm text-gray-700">
                Active Club
              </label>
            </div>
            
            <div className="flex justify-end space-x-3 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  resetForm();
                  setIsAddingClub(false);
                  setEditingClub(null);
                }}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={loading}
              >
                {loading ? (
                  <LoadingSpinner size="sm" />
                ) : editingClub ? (
                  'Update Club'
                ) : (
                  'Add Club'
                )}
              </Button>
            </div>
          </form>
        </Card>
      )}
      
      {/* Clubs List */}
      {loading && !isAddingClub && !editingClub ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {clubs.length === 0 ? (
            <Card className="col-span-full p-8 text-center">
              <p className="text-gray-500">No clubs found. Add your first club to get started.</p>
            </Card>
          ) : (
            clubs.map((club) => (
              <Card key={club.id} className="p-6">
                <div className="flex justify-between">
                  <div>
                    <div className="flex items-center">
                      {club.logo_url ? (
                        <img 
                          src={club.logo_url} 
                          alt={club.name} 
                          className="w-10 h-10 rounded-full mr-3 object-cover"
                        />
                      ) : (
                        <div className="bg-gray-100 p-2 rounded-full mr-3">
                          <Building className="h-5 w-5 text-gray-500" />
                        </div>
                      )}
                      <div>
                        <h3 className="font-semibold text-lg">{club.name}</h3>
                        <p className="text-gray-600 text-sm">
                          {club.city ? `${club.city}, ` : ''}{club.country}
                        </p>
                      </div>
                    </div>
                    
                    <div className="mt-3 space-y-1 text-sm">
                      {club.founded_year && (
                        <p className="text-gray-500">
                          Founded: {club.founded_year}
                        </p>
                      )}
                      {club.website && (
                        <p className="text-gray-500">
                          <a 
                            href={club.website} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            Website
                          </a>
                        </p>
                      )}
                    </div>
                    
                    <div className="mt-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        club.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {club.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex space-x-1">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => prepareEditForm(club)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => deleteClub(club.id)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
}



