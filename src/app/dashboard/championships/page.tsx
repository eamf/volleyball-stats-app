'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Plus, Edit, Trash2, Trophy } from 'lucide-react';
import { format } from 'date-fns';

// Define types
type Championship = {
  id: string;
  name: string;
  season: string;
  start_date: string;
  end_date: string | null;
  description: string | null;
  is_active: boolean;
};

export default function ChampionshipsPage() {
  // State
  const [championships, setChampionships] = useState<Championship[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddingChampionship, setIsAddingChampionship] = useState(false);
  const [editingChampionship, setEditingChampionship] = useState<Championship | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    season: '',
    start_date: '',
    end_date: '',
    description: '',
    is_active: true
  });
  
  // Create Supabase client
  const supabase = createClient();
  
  // Fetch data on component mount
  useEffect(() => {
    fetchChampionships();
  }, []);
  
  // Fetch championships from Supabase
  const fetchChampionships = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('Fetching championships...');
      const { data, error } = await supabase
        .from('championships')
        .select('*')
        .order('start_date', { ascending: false });
      
      if (error) {
        throw error;
      }
      
      console.log('Championships fetched:', data?.length);
      setChampionships(data || []);
    } catch (err: any) {
      console.error('Error fetching championships:', err);
      setError(`Failed to fetch championships: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const value = e.target.type === 'checkbox' 
      ? (e.target as HTMLInputElement).checked 
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
      season: '',
      start_date: '',
      end_date: '',
      description: '',
      is_active: true
    });
  };
  
  // Set form data for editing
  const prepareEditForm = (championship: Championship) => {
    setFormData({
      name: championship.name,
      season: championship.season,
      start_date: championship.start_date,
      end_date: championship.end_date || '',
      description: championship.description || '',
      is_active: championship.is_active
    });
    setEditingChampionship(championship);
  };
  
  // Add a new championship
  const addChampionship = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      // Validate form
      if (!formData.name || !formData.season || !formData.start_date) {
        throw new Error('Name, season, and start date are required');
      }
      
      // Prepare data
      const championshipData = {
        name: formData.name,
        season: formData.season,
        start_date: formData.start_date,
        end_date: formData.end_date || null,
        description: formData.description || null,
        is_active: formData.is_active
      };
      
      // Insert into database
      const { error: insertError } = await supabase
        .from('championships')
        .insert(championshipData);
      
      if (insertError) {
        throw insertError;
      }
      
      // Reset form and refresh championships
      resetForm();
      setIsAddingChampionship(false);
      fetchChampionships();
    } catch (err: any) {
      console.error('Error adding championship:', err);
      setError(`Failed to add championship: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  // Update an existing championship
  const updateChampionship = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingChampionship) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Validate form
      if (!formData.name || !formData.season || !formData.start_date) {
        throw new Error('Name, season, and start date are required');
      }
      
      // Prepare data
      const championshipData = {
        name: formData.name,
        season: formData.season,
        start_date: formData.start_date,
        end_date: formData.end_date || null,
        description: formData.description || null,
        is_active: formData.is_active
      };
      
      // Update in database
      const { error: updateError } = await supabase
        .from('championships')
        .update(championshipData)
        .eq('id', editingChampionship.id);
      
      if (updateError) {
        throw updateError;
      }
      
      // Reset form and refresh championships
      resetForm();
      setEditingChampionship(null);
      fetchChampionships();
    } catch (err: any) {
      console.error('Error updating championship:', err);
      setError(`Failed to update championship: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  // Delete a championship
  const deleteChampionship = async (id: string) => {
    if (!confirm('Are you sure you want to delete this championship?')) {
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const { error: deleteError } = await supabase
        .from('championships')
        .delete()
        .eq('id', id);
      
      if (deleteError) {
        throw deleteError;
      }
      
      fetchChampionships();
    } catch (err: any) {
      console.error('Error deleting championship:', err);
      setError(`Failed to delete championship: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  // Format date for display
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    try {
      return format(new Date(dateString), 'MMM d, yyyy');
    } catch (err) {
      return dateString;
    }
  };
  
  // Get championship status
  const getChampionshipStatus = (championship: Championship) => {
    const now = new Date();
    const startDate = new Date(championship.start_date);
    const endDate = championship.end_date ? new Date(championship.end_date) : null;
    
    if (!championship.is_active) {
      return { label: 'Inactive', color: 'bg-gray-100 text-gray-800' };
    }
    
    if (now < startDate) {
      return { label: 'Upcoming', color: 'bg-blue-100 text-blue-800' };
    }
    
    if (endDate && now > endDate) {
      return { label: 'Completed', color: 'bg-purple-100 text-purple-800' };
    }
    
    return { label: 'In Progress', color: 'bg-green-100 text-green-800' };
  };
  
  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Championships</h1>
          <p className="text-gray-600 mt-1">Manage your volleyball championships</p>
        </div>
        {!isAddingChampionship && !editingChampionship && (
          <Button onClick={() => setIsAddingChampionship(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Championship
          </Button>
        )}
      </div>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md mb-6">
          {error}
        </div>
      )}
      
      {/* Add/Edit Form */}
      {(isAddingChampionship || editingChampionship) && (
        <Card className="p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">
            {editingChampionship ? 'Edit Championship' : 'Add New Championship'}
          </h2>
          
          <form onSubmit={editingChampionship ? updateChampionship : addChampionship} className="space-y-4">
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
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="season" className="block text-sm font-medium text-gray-700 mb-1">
                  Season *
                </label>
                <Input
                  id="season"
                  name="season"
                  value={formData.season}
                  onChange={handleInputChange}
                  placeholder="e.g. 2023-2024"
                  required
                />
              </div>
              
              <div className="flex items-center mt-8">
                <input
                  id="is_active"
                  name="is_active"
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="is_active" className="ml-2 block text-sm text-gray-700">
                  Active Championship
                </label>
              </div>
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
              />
            </div>
            
            <div className="flex justify-end space-x-3 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  resetForm();
                  setIsAddingChampionship(false);
                  setEditingChampionship(null);
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
                ) : editingChampionship ? (
                  'Update Championship'
                ) : (
                  'Add Championship'
                )}
              </Button>
            </div>
          </form>
        </Card>
      )}
      
      {/* Championships List */}
      {loading && !isAddingChampionship && !editingChampionship ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {championships.length === 0 ? (
            <Card className="col-span-full p-8 text-center">
              <p className="text-gray-500">No championships found. Add your first championship to get started.</p>
            </Card>
          ) : (
            championships.map((championship) => {
              const status = getChampionshipStatus(championship);
              
              return (
                <Card key={championship.id} className="p-6">
                  <div className="flex justify-between">
                    <div>
                      <div className="flex items-center">
                        <div className="bg-gray-100 p-2 rounded-full mr-3">
                          <Trophy className="h-5 w-5 text-gray-500" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">{championship.name}</h3>
                          <p className="text-gray-600 text-sm">Season: {championship.season}</p>
                        </div>
                      </div>
                      
                      <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                        <div>
                          <span className="text-gray-500">Start:</span> {formatDate(championship.start_date)}
                        </div>
                        <div>
                          <span className="text-gray-500">End:</span> {formatDate(championship.end_date)}
                        </div>
                      </div>
                      
                      {championship.description && (
                        <p className="text-gray-600 text-sm mt-2 line-clamp-2">
                          {championship.description}
                        </p>
                      )}
                      
                      <div className="mt-3">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${status.color}`}>
                          {status.label}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex space-x-1">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => prepareEditForm(championship)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => deleteChampionship(championship.id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}



