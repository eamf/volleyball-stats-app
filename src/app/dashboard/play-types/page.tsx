'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Plus, Edit, Trash2, Save, X } from 'lucide-react';

type PlayType = {
  id: string;
  name: string;
  default_value: number;
  default_score_increment: number;
  category: string;
  is_positive: boolean;
  description: string | null;
};

type NewPlayType = Omit<PlayType, 'id'>;

export default function PlayTypesPage() {
  const [playTypes, setPlayTypes] = useState<PlayType[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingPlayType, setEditingPlayType] = useState<PlayType | null>(null);
  
  const [formData, setFormData] = useState<NewPlayType>({
    name: '',
    default_value: 0,
    default_score_increment: 0,
    category: '',
    is_positive: true,
    description: null
  });

  const supabase = createClient();

  useEffect(() => {
    fetchPlayTypes();
    fetchCategories();
  }, []);

  const fetchPlayTypes = async () => {
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('play_types')
        .select('*')
        .order('category, name');

      if (error) throw error;
      setPlayTypes(data || []);
    } catch (err: any) {
      console.error('Error fetching play types:', err);
      setError(`Failed to load play types: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('play_types')
        .select('category')
        .order('category');

      if (error) throw error;

      // Get unique categories
      const categorySet = new Set(data?.map((item: any) => item.category).filter(Boolean));
      const uniqueCategories = Array.from(categorySet) as string[];
      setCategories(uniqueCategories);
    } catch (err: any) {
      console.error('Error fetching categories:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      if (editingPlayType) {
        // Update existing play type
        const { error } = await supabase
          .from('play_types')
          .update(formData)
          .eq('id', editingPlayType.id);

        if (error) throw error;
      } else {
        // Create new play type
        const { error } = await supabase
          .from('play_types')
          .insert(formData);

        if (error) throw error;
      }

      // Reset form and refresh data
      resetForm();
      fetchPlayTypes();
      fetchCategories();
    } catch (err: any) {
      console.error('Error saving play type:', err);
      setError(`Failed to save play type: ${err.message}`);
    }
  };

  const handleEdit = (playType: PlayType) => {
    setEditingPlayType(playType);
    setFormData({
      name: playType.name,
      default_value: playType.default_value,
      default_score_increment: playType.default_score_increment,
      category: playType.category,
      is_positive: playType.is_positive,
      description: playType.description
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this play type?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('play_types')
        .delete()
        .eq('id', id);

      if (error) throw error;
      fetchPlayTypes();
    } catch (err: any) {
      console.error('Error deleting play type:', err);
      setError(`Failed to delete play type: ${err.message}`);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      default_value: 0,
      default_score_increment: 0,
      category: '',
      is_positive: true,
      description: null
    });
    setEditingPlayType(null);
    setShowForm(false);
  };



  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Play Types Management</h1>
          <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-green-500 mr-1"></div>
              <span>Positive plays</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-red-500 mr-1"></div>
              <span>Negative plays</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-gray-400 mr-1"></div>
              <span>Neutral plays</span>
            </div>
          </div>
        </div>
        <Button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Play Type
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {/* Add/Edit Form */}
      {showForm && (
        <Card className="p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">
              {editingPlayType ? 'Edit Play Type' : 'Add New Play Type'}
            </h2>
            <Button
              onClick={resetForm}
              variant="ghost"
              size="sm"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category *
                </label>
                <div className="space-y-2">
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter category name or select from existing"
                    required
                  />
                  {categories.length > 0 && (
                    <div className="text-xs text-gray-600">
                      <span className="font-medium">Existing categories:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {categories.map(cat => (
                          <button
                            key={cat}
                            type="button"
                            onClick={() => setFormData({ ...formData, category: cat })}
                            className="px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded text-xs border"
                          >
                            {cat}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Statistical Value
                </label>
                <input
                  type="number"
                  value={formData.default_value}
                  onChange={(e) => setFormData({ ...formData, default_value: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">For statistics tracking (can be positive or negative)</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Score Increment
                </label>
                <select
                  value={formData.default_score_increment}
                  onChange={(e) => setFormData({ ...formData, default_score_increment: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={1}>+1 (Point for team)</option>
                  <option value={-1}>-1 (Point for opponent)</option>
                  <option value={0}>0 (No score change)</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">How this play affects the score</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value || null })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="Optional description of the play type"
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="is_positive"
                checked={formData.is_positive}
                onChange={(e) => setFormData({ ...formData, is_positive: e.target.checked })}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="is_positive" className="ml-2 block text-sm text-gray-700">
                Positive play (for visual indicators)
              </label>
            </div>

            <div className="flex space-x-2">
              <Button
                type="submit"
                className="bg-green-600 hover:bg-green-700"
              >
                <Save className="h-4 w-4 mr-2" />
                {editingPlayType ? 'Update' : 'Create'} Play Type
              </Button>
              <Button
                type="button"
                onClick={resetForm}
                variant="outline"
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Play Types List */}
      <div className="space-y-4">
        {Object.entries(
          playTypes.reduce((acc, playType) => {
            if (!acc[playType.category]) {
              acc[playType.category] = [];
            }
            acc[playType.category].push(playType);
            return acc;
          }, {} as Record<string, PlayType[]>)
        ).map(([category, categoryPlayTypes]) => (
          <Card key={category} className="p-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-800 uppercase tracking-wide">
              {category}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categoryPlayTypes.map((playType) => (
                <div
                  key={playType.id}
                  className={`border rounded-lg p-4 hover:shadow-md transition-shadow ${
                    playType.default_value > 0
                      ? 'border-green-200 bg-green-50'
                      : playType.default_value < 0
                        ? 'border-red-200 bg-red-50'
                        : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center">
                      <div className={`w-3 h-3 rounded-full mr-2 ${
                        playType.default_value > 0
                          ? 'bg-green-500'
                          : playType.default_value < 0
                            ? 'bg-red-500'
                            : 'bg-gray-400'
                      }`}></div>
                      <h4 className="font-medium text-gray-900">{playType.name}</h4>
                    </div>
                    <div className="flex space-x-1">
                      <Button
                        onClick={() => handleEdit(playType)}
                        variant="ghost"
                        size="sm"
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        onClick={() => handleDelete(playType.id)}
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-1 text-sm text-gray-600">
                    <div className="flex justify-between">
                      <span>Statistical Value:</span>
                      <span className={`font-medium ${
                        playType.default_value > 0 ? 'text-green-600' :
                        playType.default_value < 0 ? 'text-red-600' : 'text-gray-600'
                      }`}>
                        {playType.default_value > 0 && '+'}{playType.default_value}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Score Impact:</span>
                      <span className={`font-medium ${
                        playType.default_score_increment > 0 ? 'text-green-600' :
                        playType.default_score_increment < 0 ? 'text-red-600' : 'text-gray-600'
                      }`}>
                        {playType.default_score_increment > 0 && '+'}{playType.default_score_increment}
                        {playType.default_score_increment === 1 ? ' (Team point)' :
                         playType.default_score_increment === -1 ? ' (Opponent point)' : ' (No score change)'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Type:</span>
                      <span className={`font-medium ${playType.is_positive ? 'text-green-600' : 'text-red-600'}`}>
                        {playType.is_positive ? 'Positive' : 'Negative'}
                      </span>
                    </div>
                  </div>
                  
                  {playType.description && (
                    <p className="text-xs text-gray-500 mt-2 italic">
                      {playType.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
