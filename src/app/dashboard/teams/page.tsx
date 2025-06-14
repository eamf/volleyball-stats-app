'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Plus, Edit, Trash2, Users } from 'lucide-react';

// Define types
type Team = {
  id: string;
  name: string;
  club_id: string;
  championship_id: string | null;
  division: string | null;
  coach_id: string | null;
  assistant_coach_id: string | null;
  team_color: string;
  logo_url: string | null;
  is_active: boolean;
};

type Club = {
  id: string;
  name: string;
};

type Championship = {
  id: string;
  name: string;
};

export default function TeamsPage() {
  // State
  const [teams, setTeams] = useState<Team[]>([]);
  const [clubs, setClubs] = useState<Club[]>([]);
  const [championships, setChampionships] = useState<Championship[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddingTeam, setIsAddingTeam] = useState(false);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    club_id: '',
    championship_id: '',
    division: '',
    coach_id: '',
    assistant_coach_id: '',
    team_color: '#3B82F6',
    logo_url: '',
    is_active: true
  });
  
  // Create Supabase client
  const supabase = createClient();
  
  // Fetch data on component mount
  useEffect(() => {
    fetchTeams();
    fetchClubs();
    fetchChampionships();
  }, []);
  
  // Fetch teams from Supabase
  const fetchTeams = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('Fetching teams...');
      const { data, error } = await supabase
        .from('teams')
        .select('*')
        .order('name');
      
      if (error) {
        throw error;
      }
      
      console.log('Teams fetched:', data?.length);
      setTeams(data || []);
    } catch (err: any) {
      console.error('Error fetching teams:', err);
      setError(`Failed to fetch teams: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch clubs from Supabase
  const fetchClubs = async () => {
    try {
      const { data, error } = await supabase
        .from('clubs')
        .select('id, name')
        .order('name');
      
      if (error) {
        throw error;
      }
      
      setClubs(data || []);
    } catch (err: any) {
      console.error('Error fetching clubs:', err);
    }
  };
  
  // Fetch championships from Supabase
  const fetchChampionships = async () => {
    try {
      const { data, error } = await supabase
        .from('championships')
        .select('id, name')
        .order('name');
      
      if (error) {
        throw error;
      }
      
      setChampionships(data || []);
    } catch (err: any) {
      console.error('Error fetching championships:', err);
    }
  };
  
  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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
      club_id: '',
      championship_id: '',
      division: '',
      coach_id: '',
      assistant_coach_id: '',
      team_color: '#3B82F6',
      logo_url: '',
      is_active: true
    });
  };

  // Set form data for editing
  const prepareEditForm = (team: Team) => {
    setFormData({
      name: team.name,
      club_id: team.club_id,
      championship_id: team.championship_id || '',
      division: team.division || '',
      coach_id: team.coach_id || '',
      assistant_coach_id: team.assistant_coach_id || '',
      team_color: team.team_color,
      logo_url: team.logo_url || '',
      is_active: team.is_active
    });
    setEditingTeam(team);
  };
  
  // Add a new team
  const addTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      // Validate form
      if (!formData.name || !formData.club_id || !formData.team_color) {
        throw new Error('Team name, club, and team color are required');
      }

      // Prepare data
      const teamData = {
        name: formData.name,
        club_id: formData.club_id,
        championship_id: formData.championship_id || null,
        division: formData.division || null,
        coach_id: formData.coach_id || null,
        assistant_coach_id: formData.assistant_coach_id || null,
        team_color: formData.team_color,
        logo_url: formData.logo_url || null,
        is_active: formData.is_active
      };
      
      // Insert into database
      const { error: insertError } = await supabase
        .from('teams')
        .insert(teamData);
      
      if (insertError) {
        throw insertError;
      }
      
      // Reset form and refresh teams
      resetForm();
      setIsAddingTeam(false);
      fetchTeams();
    } catch (err: any) {
      console.error('Error adding team:', err);
      setError(`Failed to add team: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  // Update an existing team
  const updateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTeam) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Validate form
      if (!formData.name || !formData.club_id || !formData.team_color) {
        throw new Error('Team name, club, and team color are required');
      }

      // Prepare data
      const teamData = {
        name: formData.name,
        club_id: formData.club_id,
        championship_id: formData.championship_id || null,
        division: formData.division || null,
        coach_id: formData.coach_id || null,
        assistant_coach_id: formData.assistant_coach_id || null,
        team_color: formData.team_color,
        logo_url: formData.logo_url || null,
        is_active: formData.is_active
      };
      
      // Update in database
      const { error: updateError } = await supabase
        .from('teams')
        .update(teamData)
        .eq('id', editingTeam.id);
      
      if (updateError) {
        throw updateError;
      }
      
      // Reset form and refresh teams
      resetForm();
      setEditingTeam(null);
      fetchTeams();
    } catch (err: any) {
      console.error('Error updating team:', err);
      setError(`Failed to update team: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  // Delete a team
  const deleteTeam = async (id: string) => {
    if (!confirm('Are you sure you want to delete this team?')) {
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const { error: deleteError } = await supabase
        .from('teams')
        .delete()
        .eq('id', id);
      
      if (deleteError) {
        throw deleteError;
      }
      
      fetchTeams();
    } catch (err: any) {
      console.error('Error deleting team:', err);
      setError(`Failed to delete team: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  // Helper function to get club name
  const getClubName = (clubId: string) => {
    const club = clubs.find(c => c.id === clubId);
    return club ? club.name : 'Unknown Club';
  };
  
  // Helper function to get championship name
  const getChampionshipName = (championshipId: string | null) => {
    if (!championshipId) return null;
    const championship = championships.find(c => c.id === championshipId);
    return championship ? championship.name : 'Unknown Championship';
  };
  
  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Teams</h1>
          <p className="text-gray-600 mt-1">Manage your volleyball teams</p>
        </div>
        {!isAddingTeam && !editingTeam && (
          <Button onClick={() => setIsAddingTeam(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Team
          </Button>
        )}
      </div>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md mb-6">
          {error}
        </div>
      )}
      
      {/* Add/Edit Form */}
      {(isAddingTeam || editingTeam) && (
        <Card className="p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">
            {editingTeam ? 'Edit Team' : 'Add New Team'}
          </h2>
          
          <form onSubmit={editingTeam ? updateTeam : addTeam} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Team Name *
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
                <label htmlFor="club_id" className="block text-sm font-medium text-gray-700 mb-1">
                  Club *
                </label>
                <select
                  id="club_id"
                  name="club_id"
                  value={formData.club_id}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select a club</option>
                  {clubs.map(club => (
                    <option key={club.id} value={club.id}>{club.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="championship_id" className="block text-sm font-medium text-gray-700 mb-1">
                  Championship
                </label>
                <select
                  id="championship_id"
                  name="championship_id"
                  value={formData.championship_id}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select a championship</option>
                  {championships.map(championship => (
                    <option key={championship.id} value={championship.id}>{championship.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="division" className="block text-sm font-medium text-gray-700 mb-1">
                  Division
                </label>
                <Input
                  id="division"
                  name="division"
                  value={formData.division}
                  onChange={handleInputChange}
                  placeholder="e.g. A1, B2, etc."
                />
              </div>

              <div>
                <label htmlFor="team_color" className="block text-sm font-medium text-gray-700 mb-1">
                  Team Color *
                </label>
                <Input
                  id="team_color"
                  name="team_color"
                  type="color"
                  value={formData.team_color}
                  onChange={handleInputChange}
                  required
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
                Active Team
              </label>
            </div>
            
            <div className="flex justify-end space-x-3 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  resetForm();
                  setIsAddingTeam(false);
                  setEditingTeam(null);
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
                ) : editingTeam ? (
                  'Update Team'
                ) : (
                  'Add Team'
                )}
              </Button>
            </div>
          </form>
        </Card>
      )}
      
      {/* Teams List */}
      {loading && !isAddingTeam && !editingTeam ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {teams.length === 0 ? (
            <Card className="col-span-full p-8 text-center">
              <p className="text-gray-500">No teams found. Add your first team to get started.</p>
            </Card>
          ) : (
            teams.map((team) => (
              <Card key={team.id} className="p-6">
                <div className="flex justify-between">
                  <div>
                    <div className="flex items-center">
                      {team.logo_url ? (
                        <img 
                          src={team.logo_url} 
                          alt={team.name} 
                          className="w-10 h-10 rounded-full mr-3 object-cover"
                        />
                      ) : (
                        <div className="bg-gray-100 p-2 rounded-full mr-3">
                          <Users className="h-5 w-5 text-gray-500" />
                        </div>
                      )}
                      <div>
                        <h3 className="font-semibold text-lg">{team.name}</h3>
                        <p className="text-gray-600 text-sm">Club: {getClubName(team.club_id)}</p>
                      </div>
                    </div>
                    
                    {team.championship_id && (
                      <p className="text-gray-500 text-sm mt-2">
                        Championship: {getChampionshipName(team.championship_id)}
                      </p>
                    )}
                    
                    <div className="mt-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        team.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {team.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex space-x-1">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => prepareEditForm(team)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => deleteTeam(team.id)}
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

