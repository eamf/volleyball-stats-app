'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Plus, Edit, Trash2, Save, X, Target, AlertTriangle } from 'lucide-react';

type Category = {
  name: string;
  play_count: number;
  play_type_count: number;
};

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editCategoryName, setEditCategoryName] = useState('');

  const supabase = createClient();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    setError(null);

    try {
      // Get all unique categories from play_types with counts
      const { data: playTypesData, error: playTypesError } = await supabase
        .from('play_types')
        .select('category');

      if (playTypesError) throw playTypesError;

      // Get play counts per category
      const { data: playsData, error: playsError } = await supabase
        .from('plays')
        .select(`
          play_type:play_types(category)
        `);

      if (playsError) throw playsError;

      // Process the data to get category statistics
      const categoryStats: { [key: string]: { play_count: number; play_type_count: number } } = {};

      // Count play types per category
      playTypesData?.forEach((pt: any) => {
        if (pt.category) {
          if (!categoryStats[pt.category]) {
            categoryStats[pt.category] = { play_count: 0, play_type_count: 0 };
          }
          categoryStats[pt.category].play_type_count++;
        }
      });

      // Count actual plays per category
      playsData?.forEach((play: any) => {
        const category = play.play_type?.category;
        if (category && categoryStats[category]) {
          categoryStats[category].play_count++;
        }
      });

      // Convert to array format
      const categoriesArray = Object.entries(categoryStats).map(([name, stats]) => ({
        name,
        play_count: stats.play_count,
        play_type_count: stats.play_type_count
      }));

      // Sort alphabetically
      categoriesArray.sort((a, b) => a.name.localeCompare(b.name));

      setCategories(categoriesArray);
    } catch (err: any) {
      console.error('Error fetching categories:', err);
      setError(`Failed to load categories: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) {
      setError('Category name is required');
      return;
    }

    // Check if category already exists
    if (categories.some(cat => cat.name.toLowerCase() === newCategoryName.trim().toLowerCase())) {
      setError('Category already exists');
      return;
    }

    try {
      // Create a placeholder play type to establish the category
      const { error } = await supabase
        .from('play_types')
        .insert({
          name: `${newCategoryName} - Default`,
          category: newCategoryName.trim(),
          default_value: 0,
          default_score_increment: 0,
          is_positive: true,
          description: `Default play type for ${newCategoryName} category`
        });

      if (error) throw error;

      setNewCategoryName('');
      setShowAddForm(false);
      fetchCategories();
    } catch (err: any) {
      console.error('Error adding category:', err);
      setError(`Failed to add category: ${err.message}`);
    }
  };

  const handleEditCategory = async (oldName: string) => {
    if (!editCategoryName.trim()) {
      setError('Category name is required');
      return;
    }

    if (oldName === editCategoryName.trim()) {
      setEditingCategory(null);
      return;
    }

    // Check if new name already exists
    if (categories.some(cat => cat.name.toLowerCase() === editCategoryName.trim().toLowerCase() && cat.name !== oldName)) {
      setError('Category name already exists');
      return;
    }

    try {
      // Update all play types with this category
      const { error } = await supabase
        .from('play_types')
        .update({ category: editCategoryName.trim() })
        .eq('category', oldName);

      if (error) throw error;

      setEditingCategory(null);
      setEditCategoryName('');
      fetchCategories();
    } catch (err: any) {
      console.error('Error updating category:', err);
      setError(`Failed to update category: ${err.message}`);
    }
  };

  const handleDeleteCategory = async (categoryName: string) => {
    const category = categories.find(cat => cat.name === categoryName);
    if (!category) return;

    if (category.play_count > 0) {
      setError(`Cannot delete category "${categoryName}" because it has ${category.play_count} recorded plays. Delete the plays first.`);
      return;
    }

    if (!confirm(`Are you sure you want to delete the category "${categoryName}"?\n\nThis will delete ${category.play_type_count} play type(s) in this category.\n\nThis action cannot be undone!`)) {
      return;
    }

    try {
      // Delete all play types in this category
      const { error } = await supabase
        .from('play_types')
        .delete()
        .eq('category', categoryName);

      if (error) throw error;

      fetchCategories();
    } catch (err: any) {
      console.error('Error deleting category:', err);
      setError(`Failed to delete category: ${err.message}`);
    }
  };

  const startEdit = (categoryName: string) => {
    setEditingCategory(categoryName);
    setEditCategoryName(categoryName);
    setError(null);
  };

  const cancelEdit = () => {
    setEditingCategory(null);
    setEditCategoryName('');
    setError(null);
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
          <h1 className="text-3xl font-bold">Play Categories Management</h1>
          <p className="text-gray-600 mt-1">Manage volleyball play categories and their organization</p>
        </div>
        <Button
          onClick={() => setShowAddForm(true)}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Category
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6 flex items-center">
          <AlertTriangle className="h-4 w-4 mr-2 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Add Category Form */}
      {showAddForm && (
        <Card className="p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Add New Category</h2>
            <Button
              onClick={() => {
                setShowAddForm(false);
                setNewCategoryName('');
                setError(null);
              }}
              variant="ghost"
              size="sm"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex items-center space-x-3">
            <input
              type="text"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              placeholder="Enter category name (e.g., Serve, Attack, Block)"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              onKeyPress={(e) => e.key === 'Enter' && handleAddCategory()}
            />
            <Button
              onClick={handleAddCategory}
              className="bg-green-600 hover:bg-green-700"
            >
              <Save className="h-4 w-4 mr-2" />
              Add Category
            </Button>
          </div>
        </Card>
      )}

      {/* Categories List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((category) => (
          <Card key={category.name} className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center">
                <Target className="h-5 w-5 text-blue-600 mr-2" />
                {editingCategory === category.name ? (
                  <input
                    type="text"
                    value={editCategoryName}
                    onChange={(e) => setEditCategoryName(e.target.value)}
                    className="text-lg font-semibold bg-transparent border-b border-blue-300 focus:outline-none focus:border-blue-500"
                    onKeyPress={(e) => e.key === 'Enter' && handleEditCategory(category.name)}
                    autoFocus
                  />
                ) : (
                  <h3 className="text-lg font-semibold text-gray-900">{category.name}</h3>
                )}
              </div>
              
              <div className="flex space-x-1">
                {editingCategory === category.name ? (
                  <>
                    <Button
                      onClick={() => handleEditCategory(category.name)}
                      variant="ghost"
                      size="sm"
                      className="text-green-600 hover:text-green-700"
                    >
                      <Save className="h-3 w-3" />
                    </Button>
                    <Button
                      onClick={cancelEdit}
                      variant="ghost"
                      size="sm"
                      className="text-gray-600 hover:text-gray-700"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      onClick={() => startEdit(category.name)}
                      variant="ghost"
                      size="sm"
                      className="text-blue-600 hover:text-blue-700"
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button
                      onClick={() => handleDeleteCategory(category.name)}
                      variant="ghost"
                      size="sm"
                      className={`${
                        category.play_count > 0 
                          ? 'text-gray-400 cursor-not-allowed' 
                          : 'text-red-600 hover:text-red-700'
                      }`}
                      disabled={category.play_count > 0}
                      title={category.play_count > 0 ? 'Cannot delete: category has recorded plays' : 'Delete category'}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Play Types:</span>
                <span className="font-medium text-blue-600">{category.play_type_count}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Recorded Plays:</span>
                <span className={`font-medium ${
                  category.play_count > 0 ? 'text-green-600' : 'text-gray-500'
                }`}>
                  {category.play_count}
                </span>
              </div>

              <div className="pt-2 border-t border-gray-200">
                <div className={`text-xs px-2 py-1 rounded-full text-center ${
                  category.play_count > 0 
                    ? 'bg-red-100 text-red-700' 
                    : 'bg-green-100 text-green-700'
                }`}>
                  {category.play_count > 0 ? 'Cannot Delete' : 'Can Delete'}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {categories.length === 0 && !loading && (
        <Card className="p-8 text-center">
          <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Categories Found</h3>
          <p className="text-gray-600 mb-4">
            Create your first play category to organize your volleyball play types.
          </p>
          <Button
            onClick={() => setShowAddForm(true)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add First Category
          </Button>
        </Card>
      )}
    </div>
  );
}
