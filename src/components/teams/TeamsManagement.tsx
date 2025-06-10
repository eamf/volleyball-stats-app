'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Plus, Edit, Trash2, Users } from 'lucide-react';

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
  created_at: string;
  updated_at: string;
};

type Club = {
  id: string;
  name: string;
};

type Championship = {
  id: string;
  name: string;
};

interface TeamsManagementProps {
  teams: Team[];
  clubs: Club[];
  championships: Championship[];
  onRefresh: () => void;
  supabase: any;
}

export function TeamsManagement({ teams, clubs, championships, onRefresh, supabase }: TeamsManagementProps) {
  const [isAddingTeam, setIsAddingTeam] = useState(false);
  const [editingTeamId, setEditingTeamId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    club_id: '',
    championship_id: '',
    division: '',
    team_color: '#3b82f6', // Default blue
    is_active: true
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.checked,
    });
  };

  const handleAddTeam = async () => {
    try {
      const { data, error } = await supabase
        .from('teams')
        .insert([{
          name: formData.name,
          club_id: formData.club_id,
          championship_id: formData.championship_id || null,
          division: formData.division || null,
          team_color: formData.team_color,
          is_active: formData.is_active
        }]);
      
      if (error) throw error;
      
      resetForm();
      onRefresh();
    } catch (error) {
      console.error('Error adding team:', error);
    }
  };

  const handleEditTeam = async () => {
    if (!editingTeamId) return;
    
    try {
      const { error } = await supabase
        .from('teams')
        .update({
          name: formData.name,
          club_id: formData.club_id,
          championship_id: formData.championship_id || null,
          division: formData.division || null,
          team_color: formData.team_color,
          is_active: formData.is_active
        })
        .eq('id', editingTeamId);
      
      if (error) throw error;
      
      resetForm();
      onRefresh();
    } catch (error) {
      console.error('Error updating team:', error);
    }
  };

  const handleDeleteTeam = async (id: string) => {
    if (!confirm('Are you sure you want to delete this team?')) return;
    
    try {
      const { error } = await supabase
        .from('teams')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      onRefresh();
    } catch (error) {
      console.error('Error deleting team:', error);
    }
  };

  const startEdit = (team: Team) => {
    setFormData({
      name: team.name,
      club_id: team.club_id,
      championship_id: team.championship_id || '',
      division: team.division || '',
      team_color: team.team_color,
      is_active: team.is_active
    });
    setEditingTeamId(team.id);
    setIsAddingTeam(false);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      club_id: '',
      championship_id: '',
      division: '',
      team_color: '#3b82f6',
      is_active: true
    });
    setIsAddingTeam(false);
    setEditingTeamId(null);
  };

  const getClubName = (clubId: string) => {
    const club = clubs.find(c => c.id === clubId);
    return club ? club.name : 'Unknown Club';
  };

  const getChampionshipName = (championshipId: string | null) => {
    if (!championshipId) return 'None';
    const championship = championships.find(c => c.id === championshipId);
    return championship ? championship.name : 'None';
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Teams Management</h1>
        <p className="text-gray-600 mt-1">Manage teams and their information</p>
      </div>
      
      <div className="bg-white p-8 rounded-lg border border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Teams</h2>
          <Button onClick={() => setIsAddingTeam(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Team
          </Button>
        </div>
        {isAddingTeam || editingTeamId ? (
          <div className="mb-4">
            <h3 className="text-lg font-bold mb-2">{isAddingTeam ? 'Add New Team' : 'Edit Team'}</h3>
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Team Name</label>
                <Input
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Club</label>
                <select
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Championship</label>
                <select
                  name="championship_id"
                  value={formData.championship_id}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">None</option>
                  {championships.map(championship => (
                    <option key={championship.id} value={championship.id}>{championship.name}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Division</label>
                <Input
                  name="division"
                  value={formData.division}
                  onChange={handleInputChange}
                  placeholder="e.g., U16, Senior, etc."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Team Color</label>
                <Input
                  name="team_color"
                  type="color"
                  value={formData.team_color}
                  onChange={handleInputChange}
                  className="h-10 w-20"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Active Status</label>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="is_active"
                    checked={formData.is_active}
                    onChange={handleCheckboxChange}
                    className="mr-2"
                  />
                  <span>{formData.is_active ? 'Active' : 'Inactive'}</span>
                </div>
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button onClick={isAddingTeam ? handleAddTeam : handleEditTeam}>
                  {isAddingTeam ? 'Add Team' : 'Save Changes'}
                </Button>
                <Button onClick={resetForm} variant="outline">Cancel</Button>
              </div>
            </form>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {teams.length === 0 ? (
              <p className="col-span-3 text-center text-gray-500 py-8">
                No teams found. Add your first team to get started.
              </p>
            ) : (
              teams.map(team => (
                <Card key={team.id} className="p-4">
                  <div className="p-4">
                    <h3 className="text-lg font-bold mb-2">{team.name}</h3>
                    <div className="flex justify-between items-center">
                      <div className="flex flex-col">
                        <div className="flex items-center space-x-2">
                          <Users className="h-4 w-4 text-gray-500"/>
                          <span className="text-gray-600">{getClubName(team.club_id)}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Users className="h-4 w-4 text-gray-500"/>
                          <span className="text-gray-600">{team.championship_id ? getChampionshipName(team.championship_id) : 'None'}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Users className="h-4 w-4 text-gray-500"/>
                          <span className="text-gray-600">{team.division || 'N/A'}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Users className="h-4 w-4 text-gray-500"/>
                          <span className="text-gray-600">{team.is_active ? 'Active' : 'Inactive'}</span>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button onClick={() => startEdit(team)} variant="ghost" size="sm">
                          <Edit className="h-4 w-4"/>
                        </Button>
                        <Button onClick={() => handleDeleteTeam(team.id)} variant="ghost" size="sm">
                          <Trash2 className="h-4 w-4 text-red-500"/>
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
