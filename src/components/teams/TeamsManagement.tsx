'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import { Team } from '@/types/database';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Plus, Users, AlertCircle } from 'lucide-react';
import { AddTeamForm } from './AddTeamForm';

export function TeamsManagement() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    loadTeams();
  }, []);

  const loadTeams = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout')), 10000)
      );
      
      const queryPromise = supabase
        .from('teams')
        .select(`
          *,
          club:clubs(*),
          coach:user_profiles!coach_id(*)
        `)
        .eq('is_active', true)
        .order('name');

      const { data, error } = await Promise.race([queryPromise, timeoutPromise]) as any;

      if (error) {
        console.error('Error loading teams:', error);
        setError(error.message || 'Failed to load teams');
        setTeams([]);
      } else {
        setTeams(data || []);
      }
    } catch (error: any) {
      console.error('Error loading teams:', error);
      setError(error.message || 'An unexpected error occurred');
      setTeams([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTeam = () => {
    setShowAddForm(true);
  };

  const handleAddComplete = () => {
    setShowAddForm(false);
    loadTeams();
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Teams Management</h1>
          <Button disabled>
            <Plus className="w-4 h-4 mr-2" />
            Add Team
          </Button>
        </div>
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner size="lg" />
          <span className="ml-3 text-gray-600">Loading teams...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Teams Management</h1>
          <Button onClick={handleAddTeam}>
            <Plus className="w-4 h-4 mr-2" />
            Add Team
          </Button>
        </div>
        <div className="text-center py-12">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Teams</h3>
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={loadTeams} variant="outline">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Teams Management</h1>
        <Button onClick={handleAddTeam}>
          <Plus className="w-4 h-4 mr-2" />
          Add Team
        </Button>
      </div>

      {showAddForm && (
        <AddTeamForm onComplete={handleAddComplete} onCancel={() => setShowAddForm(false)} />
      )}

      {teams.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teams.map((team) => (
            <Card key={team.id} className="p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex items-center">
                  <div 
                    className="w-8 h-8 rounded mr-3 flex items-center justify-center"
                    style={{ backgroundColor: team.team_color }}
                  >
                    <Users className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{team.name}</h3>
                    <p className="text-sm text-gray-600">{team.club?.name || 'No club assigned'}</p>
                  </div>
                </div>
              </div>
              <div className="mt-4 space-y-1 text-sm text-gray-600">
                {team.coach && (
                  <div>Coach: {team.coach.full_name}</div>
                )}
                {team.division && (
                  <div>Division: {team.division}</div>
                )}
                {!team.coach && !team.division && (
                  <div className="text-gray-400">No additional details</div>
                )}
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No teams yet</h3>
          <p className="text-gray-600 mb-4">Create your first team to start adding players and scheduling games.</p>
          <Button onClick={handleAddTeam}>
            <Plus className="w-4 h-4 mr-2" />
            Add Team
          </Button>
        </div>
      )}
    </div>
  );
}