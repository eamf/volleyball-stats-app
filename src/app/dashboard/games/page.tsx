'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';

import { Plus, Edit, Trash2, Play, Calendar, MapPin } from 'lucide-react';
import { format } from 'date-fns';

// Define types
type Game = {
  id: string;
  championship_id: string;
  home_team_id: string;
  away_team_id: string;
  scheduled_at: string;
  venue: string | null;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  home_score: number;
  away_score: number;
  completed_at: string | null;
  notes: string | null;
};

type Team = {
  id: string;
  name: string;
  club_id: string;
};

type Championship = {
  id: string;
  name: string;
  season: string;
};

export default function GamesPage() {
  const router = useRouter();

  // State
  const [games, setGames] = useState<Game[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [championships, setChampionships] = useState<Championship[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddingGame, setIsAddingGame] = useState(false);
  const [editingGame, setEditingGame] = useState<Game | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    championship_id: '',
    home_team_id: '',
    away_team_id: '',
    scheduled_at: '',
    venue: '',
    notes: ''
  });
  
  // Create Supabase client
  const supabase = createClient();
  
  // Fetch data on component mount
  useEffect(() => {
    fetchGames();
    fetchTeams();
    fetchChampionships();
  }, []);
  
  // Fetch games from Supabase
  const fetchGames = async () => {
    setLoading(true);
    setError(null);

    try {
      console.log('🔄 Fetching games...');

      // Add timeout to prevent hanging
      const gamesPromise = supabase
        .from('games')
        .select('*')
        .order('scheduled_at', { ascending: false });

      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Request timeout - please refresh the page')), 10000);
      });

      const { data, error } = await Promise.race([gamesPromise, timeoutPromise]) as any;

      if (error) {
        throw error;
      }

      console.log('✅ Games fetched:', data?.length || 0);
      setGames(data || []);
    } catch (err: any) {
      console.error('❌ Error fetching games:', err);
      setError(`Failed to fetch games: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch teams from Supabase
  const fetchTeams = async () => {
    try {
      const { data, error } = await supabase
        .from('teams')
        .select('id, name, club_id')
        .eq('is_active', true)
        .order('name');
      
      if (error) {
        throw error;
      }
      
      setTeams(data || []);
    } catch (err: any) {
      console.error('Error fetching teams:', err);
    }
  };
  
  // Fetch championships from Supabase
  const fetchChampionships = async () => {
    try {
      const { data, error } = await supabase
        .from('championships')
        .select('id, name, season')
        .eq('is_active', true)
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
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };
  
  // Reset form data
  const resetForm = () => {
    setFormData({
      championship_id: '',
      home_team_id: '',
      away_team_id: '',
      scheduled_at: '',
      venue: '',
      notes: ''
    });
  };
  
  // Set form data for editing
  const prepareEditForm = (game: Game) => {
    setFormData({
      championship_id: game.championship_id,
      home_team_id: game.home_team_id,
      away_team_id: game.away_team_id,
      scheduled_at: game.scheduled_at.slice(0, 16), // Format for datetime-local input
      venue: game.venue || '',
      notes: game.notes || ''
    });
    setEditingGame(game);
  };
  
  // Helper function to get team name
  const getTeamName = (teamId: string) => {
    const team = teams.find(t => t.id === teamId);
    return team ? team.name : 'Unknown Team';
  };
  
  // Helper function to get championship name
  const getChampionshipName = (championshipId: string) => {
    const championship = championships.find(c => c.id === championshipId);
    return championship ? championship.name : 'Unknown Championship';
  };
  
  // Format date for display
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM d, yyyy HH:mm');
    } catch (err) {
      return dateString;
    }
  };
  
  // Get game status styling
  const getGameStatusStyle = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'in_progress':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-purple-100 text-purple-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Add a new game
  const addGame = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validate form
      if (!formData.championship_id || !formData.home_team_id || !formData.away_team_id || !formData.scheduled_at) {
        throw new Error('Championship, teams, and scheduled time are required');
      }

      if (formData.home_team_id === formData.away_team_id) {
        throw new Error('Home team and away team cannot be the same');
      }

      // Prepare data
      const gameData = {
        championship_id: formData.championship_id,
        home_team_id: formData.home_team_id,
        away_team_id: formData.away_team_id,
        scheduled_at: formData.scheduled_at,
        venue: formData.venue || null,
        notes: formData.notes || null,
        status: 'scheduled' as const,
        home_score: 0,
        away_score: 0
      };

      // Insert into database
      const { error: insertError } = await supabase
        .from('games')
        .insert(gameData);

      if (insertError) {
        throw insertError;
      }

      // Reset form and refresh games
      resetForm();
      setIsAddingGame(false);
      fetchGames();
    } catch (err: any) {
      console.error('Error adding game:', err);
      setError(`Failed to schedule game: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Update an existing game
  const updateGame = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingGame) return;

    setLoading(true);
    setError(null);

    try {
      // Validate form
      if (!formData.championship_id || !formData.home_team_id || !formData.away_team_id || !formData.scheduled_at) {
        throw new Error('Championship, teams, and scheduled time are required');
      }

      if (formData.home_team_id === formData.away_team_id) {
        throw new Error('Home team and away team cannot be the same');
      }

      // Prepare data
      const gameData = {
        championship_id: formData.championship_id,
        home_team_id: formData.home_team_id,
        away_team_id: formData.away_team_id,
        scheduled_at: formData.scheduled_at,
        venue: formData.venue || null,
        notes: formData.notes || null
      };

      // Update in database
      const { error: updateError } = await supabase
        .from('games')
        .update(gameData)
        .eq('id', editingGame.id);

      if (updateError) {
        throw updateError;
      }

      // Reset form and refresh games
      resetForm();
      setEditingGame(null);
      fetchGames();
    } catch (err: any) {
      console.error('Error updating game:', err);
      setError(`Failed to update game: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Delete a game
  const deleteGame = async (id: string) => {
    if (!confirm('Are you sure you want to delete this game?')) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { error: deleteError } = await supabase
        .from('games')
        .delete()
        .eq('id', id);

      if (deleteError) {
        throw deleteError;
      }

      fetchGames();
    } catch (err: any) {
      console.error('Error deleting game:', err);
      setError(`Failed to delete game: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Games</h1>
          <p className="text-gray-600 mt-1">Schedule and manage volleyball games</p>
        </div>
        {!isAddingGame && !editingGame && (
          <Button onClick={() => setIsAddingGame(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Schedule Game
          </Button>
        )}
      </div>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md mb-6">
          {error}
        </div>
      )}

      {/* Add/Edit Form */}
      {(isAddingGame || editingGame) && (
        <Card className="p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">
            {editingGame ? 'Edit Game' : 'Schedule New Game'}
          </h2>

          <form onSubmit={editingGame ? updateGame : addGame} className="space-y-4">
            <div>
              <label htmlFor="championship_id" className="block text-sm font-medium text-gray-700 mb-1">
                Championship *
              </label>
              <select
                id="championship_id"
                name="championship_id"
                value={formData.championship_id}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select a championship</option>
                {championships.map(championship => (
                  <option key={championship.id} value={championship.id}>
                    {championship.name} ({championship.season})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="home_team_id" className="block text-sm font-medium text-gray-700 mb-1">
                  Home Team *
                </label>
                <select
                  id="home_team_id"
                  name="home_team_id"
                  value={formData.home_team_id}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select home team</option>
                  {teams.map(team => (
                    <option key={team.id} value={team.id}>{team.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="away_team_id" className="block text-sm font-medium text-gray-700 mb-1">
                  Away Team *
                </label>
                <select
                  id="away_team_id"
                  name="away_team_id"
                  value={formData.away_team_id}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select away team</option>
                  {teams.map(team => (
                    <option key={team.id} value={team.id}>{team.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="scheduled_at" className="block text-sm font-medium text-gray-700 mb-1">
                  Scheduled Date & Time *
                </label>
                <Input
                  id="scheduled_at"
                  name="scheduled_at"
                  type="datetime-local"
                  value={formData.scheduled_at}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div>
                <label htmlFor="venue" className="block text-sm font-medium text-gray-700 mb-1">
                  Venue
                </label>
                <Input
                  id="venue"
                  name="venue"
                  value={formData.venue}
                  onChange={handleInputChange}
                  placeholder="e.g. Sports Center Arena"
                />
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
                placeholder="Additional notes about the game..."
              />
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  resetForm();
                  setIsAddingGame(false);
                  setEditingGame(null);
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : editingGame ? (
                  'Update Game'
                ) : (
                  'Schedule Game'
                )}
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Games List */}
      {loading && !isAddingGame && !editingGame ? (
        <div className="flex justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 mb-4">Loading games...</p>
            <button
              onClick={() => {
                console.log('🔄 Force refresh games triggered');
                setLoading(false);
                setTimeout(() => fetchGames(), 100);
              }}
              className="text-blue-600 hover:text-blue-800 underline text-sm"
            >
              Click here if loading takes too long
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {games.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-gray-500">No games found. Schedule your first game to get started.</p>
            </Card>
          ) : (
            games.map((game) => (
              <Card key={game.id} className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-lg">
                        {getTeamName(game.home_team_id)} vs {getTeamName(game.away_team_id)}
                      </h3>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getGameStatusStyle(game.status)}`}>
                        {game.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2" />
                        {formatDate(game.scheduled_at)}
                      </div>
                      {game.venue && (
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-2" />
                          {game.venue}
                        </div>
                      )}
                      <div>
                        Championship: {getChampionshipName(game.championship_id)}
                      </div>
                    </div>
                    
                    {game.status === 'completed' && (
                      <div className="mt-3 text-lg font-semibold">
                        Score: {game.home_score} - {game.away_score}
                      </div>
                    )}
                    
                    {game.notes && (
                      <p className="text-gray-600 text-sm mt-2">{game.notes}</p>
                    )}
                  </div>
                  
                  <div className="flex space-x-2 ml-4">
                    {(game.status === 'scheduled' || game.status === 'in_progress') && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/dashboard/games/${game.id}/record`)}
                      >
                        <Play className="h-4 w-4 mr-1" />
                        {game.status === 'scheduled' ? 'Start' : 'Continue'}
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => prepareEditForm(game)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteGame(game.id)}
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
