'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Plus, Edit, Trash2, User } from 'lucide-react';

// Define types
type Player = {
  id: string;
  team_id: string;
  jersey_number: number;
  full_name: string;
  primary_position: string;
  secondary_position: string | null;
  height_cm: number | null;
  date_of_birth: string | null;
  is_active: boolean;
  notes: string | null;
};

type Team = {
  id: string;
  name: string;
};

export default function PlayersPage() {
  // State
  const [players, setPlayers] = useState<Player[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddingPlayer, setIsAddingPlayer] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    full_name: '',
    jersey_number: '',
    primary_position: '',
    secondary_position: '',
    height_cm: '',
    date_of_birth: '',
    team_id: '',
    notes: '',
    is_active: true
  });

  // Create Supabase client
  const supabase = createClient();
  
  // Fetch data on component mount
  useEffect(() => {
    fetchPlayers();
    fetchTeams();
  }, []);
  
  // Fetch players from Supabase
  const fetchPlayers = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('Fetching players...');
      const { data, error } = await supabase
        .from('players')
        .select('*')
        .order('full_name');
      
      if (error) {
        throw error;
      }
      
      console.log('Players fetched:', data?.length);
      setPlayers(data || []);
    } catch (err: any) {
      console.error('Error fetching players:', err);
      setError(`Failed to fetch players: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch teams from Supabase
  const fetchTeams = async () => {
    try {
      const { data, error } = await supabase
        .from('teams')
        .select('id, name')
        .order('name');
      
      if (error) {
        throw error;
      }
      
      setTeams(data || []);
    } catch (err: any) {
      console.error('Error fetching teams:', err);
    }
  };
  
  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
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
      full_name: '',
      jersey_number: '',
      primary_position: '',
      secondary_position: '',
      height_cm: '',
      date_of_birth: '',
      team_id: '',
      notes: '',
      is_active: true
    });
  };

  // Set form data for editing
  const prepareEditForm = (player: Player) => {
    setFormData({
      full_name: player.full_name,
      jersey_number: player.jersey_number.toString(),
      primary_position: player.primary_position,
      secondary_position: player.secondary_position || '',
      height_cm: player.height_cm?.toString() || '',
      date_of_birth: player.date_of_birth || '',
      team_id: player.team_id,
      notes: player.notes || '',
      is_active: player.is_active
    });
    setEditingPlayer(player);
  };
  
  // Add a new player
  const addPlayer = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validate form
      if (!formData.full_name || !formData.team_id || !formData.jersey_number || !formData.primary_position) {
        throw new Error('Full name, team, jersey number, and primary position are required');
      }

      // Prepare data
      const playerData = {
        team_id: formData.team_id,
        jersey_number: parseInt(formData.jersey_number),
        full_name: formData.full_name,
        primary_position: formData.primary_position,
        secondary_position: formData.secondary_position || null,
        height_cm: formData.height_cm ? parseInt(formData.height_cm) : null,
        date_of_birth: formData.date_of_birth || null,
        notes: formData.notes || null,
        is_active: formData.is_active
      };
      
      // Insert into database
      const { error: insertError } = await supabase
        .from('players')
        .insert(playerData);
      
      if (insertError) {
        throw insertError;
      }
      
      // Reset form and refresh players
      resetForm();
      setIsAddingPlayer(false);
      fetchPlayers();
    } catch (err: any) {
      console.error('Error adding player:', err);
      setError(`Failed to add player: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  // Update an existing player
  const updatePlayer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPlayer) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Validate form
      if (!formData.full_name || !formData.team_id || !formData.jersey_number || !formData.primary_position) {
        throw new Error('Full name, team, jersey number, and primary position are required');
      }

      // Prepare data
      const playerData = {
        team_id: formData.team_id,
        jersey_number: parseInt(formData.jersey_number),
        full_name: formData.full_name,
        primary_position: formData.primary_position,
        secondary_position: formData.secondary_position || null,
        height_cm: formData.height_cm ? parseInt(formData.height_cm) : null,
        date_of_birth: formData.date_of_birth || null,
        notes: formData.notes || null,
        is_active: formData.is_active
      };
      
      // Update in database
      const { error: updateError } = await supabase
        .from('players')
        .update(playerData)
        .eq('id', editingPlayer.id);
      
      if (updateError) {
        throw updateError;
      }
      
      // Reset form and refresh players
      resetForm();
      setEditingPlayer(null);
      fetchPlayers();
    } catch (err: any) {
      console.error('Error updating player:', err);
      setError(`Failed to update player: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  // Delete a player
  const deletePlayer = async (id: string) => {
    if (!confirm('Are you sure you want to delete this player?')) {
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const { error: deleteError } = await supabase
        .from('players')
        .delete()
        .eq('id', id);
      
      if (deleteError) {
        throw deleteError;
      }
      
      fetchPlayers();
    } catch (err: any) {
      console.error('Error deleting player:', err);
      setError(`Failed to delete player: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  // Helper function to get team name
  const getTeamName = (teamId: string) => {
    const team = teams.find(t => t.id === teamId);
    return team ? team.name : 'Unknown Team';
  };
  

  
  // Calculate age from date of birth
  const calculateAge = (dateOfBirth: string | null) => {
    if (!dateOfBirth) return null;
    try {
      const birthDate = new Date(dateOfBirth);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      
      return age;
    } catch (err) {
      return null;
    }
  };
  
  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Players</h1>
          <p className="text-gray-600 mt-1">Manage your volleyball players</p>
        </div>
        {!isAddingPlayer && !editingPlayer && (
          <Button onClick={() => setIsAddingPlayer(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Player
          </Button>
        )}
      </div>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md mb-6">
          {error}
        </div>
      )}
      
      {/* Add/Edit Form */}
      {(isAddingPlayer || editingPlayer) && (
        <Card className="p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">
            {editingPlayer ? 'Edit Player' : 'Add New Player'}
          </h2>
          
          <form onSubmit={editingPlayer ? updatePlayer : addPlayer} className="space-y-4">
            <div>
              <label htmlFor="full_name" className="block text-sm font-medium text-gray-700 mb-1">
                Full Name *
              </label>
              <Input
                id="full_name"
                name="full_name"
                value={formData.full_name}
                onChange={handleInputChange}
                placeholder="e.g. João Silva"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="jersey_number" className="block text-sm font-medium text-gray-700 mb-1">
                  Jersey Number *
                </label>
                <Input
                  id="jersey_number"
                  name="jersey_number"
                  type="number"
                  value={formData.jersey_number}
                  onChange={handleInputChange}
                  min="1"
                  max="99"
                  required
                />
              </div>

              <div>
                <label htmlFor="primary_position" className="block text-sm font-medium text-gray-700 mb-1">
                  Primary Position *
                </label>
                <select
                  id="primary_position"
                  name="primary_position"
                  value={formData.primary_position}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select position</option>
                  <option value="setter">Setter</option>
                  <option value="outside_hitter">Outside Hitter</option>
                  <option value="middle_blocker">Middle Blocker</option>
                  <option value="opposite">Opposite</option>
                  <option value="libero">Libero</option>
                  <option value="defensive_specialist">Defensive Specialist</option>
                </select>
              </div>

              <div>
                <label htmlFor="secondary_position" className="block text-sm font-medium text-gray-700 mb-1">
                  Secondary Position
                </label>
                <select
                  id="secondary_position"
                  name="secondary_position"
                  value={formData.secondary_position}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select position</option>
                  <option value="setter">Setter</option>
                  <option value="outside_hitter">Outside Hitter</option>
                  <option value="middle_blocker">Middle Blocker</option>
                  <option value="opposite">Opposite</option>
                  <option value="libero">Libero</option>
                  <option value="defensive_specialist">Defensive Specialist</option>
                </select>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="height_cm" className="block text-sm font-medium text-gray-700 mb-1">
                  Height (cm)
                </label>
                <Input
                  id="height_cm"
                  name="height_cm"
                  type="number"
                  value={formData.height_cm}
                  onChange={handleInputChange}
                  min="120"
                  max="250"
                />
              </div>

              <div>
                <label htmlFor="date_of_birth" className="block text-sm font-medium text-gray-700 mb-1">
                  Date of Birth
                </label>
                <Input
                  id="date_of_birth"
                  name="date_of_birth"
                  type="date"
                  value={formData.date_of_birth}
                  onChange={handleInputChange}
                />
              </div>

              <div>
                <label htmlFor="team_id" className="block text-sm font-medium text-gray-700 mb-1">
                  Team *
                </label>
                <select
                  id="team_id"
                  name="team_id"
                  value={formData.team_id}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select team</option>
                  {teams.map(team => (
                    <option key={team.id} value={team.id}>{team.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                Notes
              </label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Additional notes about the player..."
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
                Active Player
              </label>
            </div>
            
            <div className="flex justify-end space-x-3 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  resetForm();
                  setIsAddingPlayer(false);
                  setEditingPlayer(null);
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
                ) : editingPlayer ? (
                  'Update Player'
                ) : (
                  'Add Player'
                )}
              </Button>
            </div>
          </form>
        </Card>
      )}
      
      {/* Players List */}
      {loading && !isAddingPlayer && !editingPlayer ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {players.length === 0 ? (
            <Card className="col-span-full p-8 text-center">
              <p className="text-gray-500">No players found. Add your first player to get started.</p>
            </Card>
          ) : (
            players.map((player) => (
              <Card key={player.id} className="p-6">
                <div className="flex justify-between">
                  <div>
                    <div className="flex items-center">
                      <div className="bg-gray-100 p-2 rounded-full mr-3">
                        <User className="h-6 w-6 text-gray-500" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">
                          {player.full_name} #{player.jersey_number}
                        </h3>
                        <p className="text-gray-600 text-sm">
                          Team: {getTeamName(player.team_id)}
                        </p>
                      </div>
                    </div>

                    <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                      <p className="text-gray-500">
                        Position: {player.primary_position.replace('_', ' ')}
                      </p>
                      {player.secondary_position && (
                        <p className="text-gray-500">
                          Secondary: {player.secondary_position.replace('_', ' ')}
                        </p>
                      )}
                      {player.height_cm && (
                        <p className="text-gray-500">
                          Height: {player.height_cm} cm
                        </p>
                      )}
                      {player.date_of_birth && (
                        <p className="text-gray-500">
                          Age: {calculateAge(player.date_of_birth)}
                        </p>
                      )}
                    </div>
                    
                    <div className="mt-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        player.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {player.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex space-x-1">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => prepareEditForm(player)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => deletePlayer(player.id)}
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


