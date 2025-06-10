'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Plus, Edit, Trash2, Trophy } from 'lucide-react';
import { AddChampionshipForm } from './AddChampionshipForm';
import { createClient } from '@/lib/supabase';

type Championship = {
  id: string;
  name: string;
  season: string;
  start_date: string;
  end_date: string | null;
  description: string | null;
  location: string | null;
  is_active: boolean;
};

interface ChampionshipsManagementProps {
  championships: Championship[];
  onRefresh: () => void;
}

export function ChampionshipsManagement({ championships, onRefresh }: ChampionshipsManagementProps) {
  const [isAddingChampionship, setIsAddingChampionship] = useState(false);
  const [editingChampionshipId, setEditingChampionshipId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    season: '',
    start_date: '',
    end_date: '',
    description: '',
    location: '',
    is_active: true,
  });
  const supabase = createClient();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const value = e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value;
    setFormData({
      ...formData,
      [e.target.name]: value,
    });
  };

  const handleEditChampionship = async () => {
    if (!editingChampionshipId) return;
    
    try {
      console.log('Updating championship:', formData);
      
      const { error } = await supabase
        .from('championships')
        .update({
          name: formData.name,
          season: formData.season,
          start_date: formData.start_date,
          end_date: formData.end_date || null,
          description: formData.description || null,
          location: formData.location || null,
          is_active: formData.is_active
        })
        .eq('id', editingChampionshipId);
      
      if (error) {
        console.error('Error updating championship:', error);
        throw error;
      }
      
      console.log('Championship updated successfully');
      resetForm();
      onRefresh();
    } catch (error) {
      console.error('Error updating championship:', error);
    }
  };

  const handleDeleteChampionship = async (id: string) => {
    if (!confirm('Are you sure you want to delete this championship?')) return;
    
    try {
      const { error } = await supabase
        .from('championships')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error('Error deleting championship:', error);
        throw error;
      }
      
      console.log('Championship deleted successfully');
      onRefresh();
    } catch (error) {
      console.error('Error deleting championship:', error);
    }
  };

  const startEdit = (championship: Championship) => {
    setFormData({
      name: championship.name,
      season: championship.season || '',
      start_date: championship.start_date,
      end_date: championship.end_date || '',
      description: championship.description || '',
      location: championship.location || '',
      is_active: championship.is_active,
    });
    setEditingChampionshipId(championship.id);
    setIsAddingChampionship(false);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      season: '',
      start_date: '',
      end_date: '',
      description: '',
      location: '',
      is_active: true,
    });
    setIsAddingChampionship(false);
    setEditingChampionshipId(null);
  };

  const handleAddComplete = () => {
    console.log('Championship added successfully, refreshing list');
    setIsAddingChampionship(false);
    onRefresh();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Championships Management</h1>
        <Button onClick={() => {
          console.log('Add Championship button clicked');
          setIsAddingChampionship(true);
          setEditingChampionshipId(null);
          resetForm();
        }}>
          <Plus className="h-4 w-4 mr-2" />
          Add Championship
        </Button>
      </div>

      {isAddingChampionship && (
        <AddChampionshipForm
          onComplete={handleAddComplete}
          onCancel={() => {
            console.log('Add Championship cancelled');
            setIsAddingChampionship(false);
          }}
        />
      )}

      {editingChampionshipId && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Edit Championship</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Championship Name</label>
              <Input
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter championship name"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Season</label>
              <Input
                name="season"
                value={formData.season}
                onChange={handleInputChange}
                placeholder="e.g., 2024"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                <Input
                  name="start_date"
                  type="date"
                  value={formData.start_date}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                <Input
                  name="end_date"
                  type="date"
                  value={formData.end_date}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter championship description"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
              <Input
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                placeholder="Enter location"
              />
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="is_active"
                name="is_active"
                checked={formData.is_active}
                onChange={handleInputChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="is_active" className="ml-2 block text-sm text-gray-900">
                Active Championship
              </label>
            </div>
            
            <div className="flex space-x-3">
              <Button onClick={handleEditChampionship}>
                Save Changes
              </Button>
              <Button variant="outline" onClick={resetForm}>
                Cancel
              </Button>
            </div>
          </div>
        </Card>
      )}

      {championships.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-gray-500">No championships found. Add your first championship to get started.</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {championships.map((championship) => (
            <Card key={championship.id} className="p-6">
              <div className="flex justify-between items-start">
                <div className="flex items-start space-x-3">
                  <Trophy className={`h-6 w-6 ${championship.is_active ? 'text-yellow-500' : 'text-gray-400'}`} />
                  <div>
                    <h3 className="font-semibold text-lg">{championship.name}</h3>
                    <p className="text-gray-600 text-sm">{championship.location || 'No location'}</p>
                    <p className="text-gray-500 text-xs">
                      Season: {championship.season || 'N/A'} | 
                      {new Date(championship.start_date).toLocaleDateString()} - 
                      {championship.end_date ? new Date(championship.end_date).toLocaleDateString() : 'Ongoing'}
                    </p>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      championship.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {championship.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button size="sm" variant="ghost" onClick={() => startEdit(championship)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => handleDeleteChampionship(championship.id)}>
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
