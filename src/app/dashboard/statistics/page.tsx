'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { OverviewView, PlayersView, TeamsView, GamesView } from '@/components/StatisticsViews';
import { BarChart3, Users, Trophy, Target, Filter, Download } from 'lucide-react';

// Types
type Player = {
  id: string;
  full_name: string;
  jersey_number: number;
  team_id: string;
  team?: Team;
};

type Team = {
  id: string;
  name: string;
  team_color: string;
};

type Game = {
  id: string;
  home_team_id: string;
  away_team_id: string;
  scheduled_at: string;
  status: string;
  home_team?: Team;
  away_team?: Team;
};

type PlayType = {
  id: string;
  name: string;
  category: string;
  value: number;
};

type Play = {
  id: string;
  game_id: string;
  player_id: string | null;
  play_type_id: string;
  team_id: string;
  field_x: number | null;
  field_y: number | null;
  value: number;
  timestamp_in_set: string;
  set_number: number;
  player?: Player;
  play_type?: PlayType;
  team?: Team;
  game?: Game;
};

type StatsSummary = {
  totalPlays: number;
  totalPoints: number;
  positivePoints: number;
  negativePoints: number;
  neutralPlays: number;
  playsByCategory: Record<string, number>;
  pointsByCategory: Record<string, number>;
  efficiency: number;
};

type PlayerStats = {
  player: Player;
  stats: StatsSummary;
  plays: Play[];
};

type TeamStats = {
  team: Team;
  stats: StatsSummary;
  plays: Play[];
  players: PlayerStats[];
};

type GameStats = {
  game: Game;
  stats: StatsSummary;
  plays: Play[];
  homeTeamStats: TeamStats;
  awayTeamStats: TeamStats;
};

export default function StatisticsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Data
  const [games, setGames] = useState<Game[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [playTypes, setPlayTypes] = useState<PlayType[]>([]);
  const [plays, setPlays] = useState<Play[]>([]);
  
  // Filters
  const [selectedView, setSelectedView] = useState<'overview' | 'players' | 'teams' | 'games'>('overview');
  const [selectedGame, setSelectedGame] = useState<string>('all');
  const [selectedTeam, setSelectedTeam] = useState<string>('all');
  const [selectedPlayer, setSelectedPlayer] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  
  // Statistics
  const [playerStats, setPlayerStats] = useState<PlayerStats[]>([]);
  const [teamStats, setTeamStats] = useState<TeamStats[]>([]);
  const [gameStats, setGameStats] = useState<GameStats[]>([]);
  const [overallStats, setOverallStats] = useState<StatsSummary | null>(null);

  const supabase = createClient();

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (plays.length > 0) {
      calculateStatistics();
    }
  }, [plays, selectedGame, selectedTeam, selectedPlayer, selectedCategory]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('🔄 Fetching statistics data...');

      // Fetch all data in parallel
      const [gamesRes, teamsRes, playersRes, playTypesRes, playsRes] = await Promise.all([
        supabase.from('games').select(`
          *,
          home_team:teams!games_home_team_id_fkey(*),
          away_team:teams!games_away_team_id_fkey(*)
        `).order('scheduled_at', { ascending: false }),
        
        supabase.from('teams').select('*').order('name'),
        
        supabase.from('players').select(`
          *,
          team:teams(*)
        `).order('full_name'),
        
        supabase.from('play_types').select('*').order('category', { ascending: true }),
        
        supabase.from('plays').select(`
          *,
          player:players(*),
          play_type:play_types(*),
          team:teams(*),
          game:games(
            *,
            home_team:teams!games_home_team_id_fkey(*),
            away_team:teams!games_away_team_id_fkey(*)
          )
        `).order('timestamp_in_set', { ascending: false })
      ]);

      // Check for errors
      if (gamesRes.error) throw gamesRes.error;
      if (teamsRes.error) throw teamsRes.error;
      if (playersRes.error) throw playersRes.error;
      if (playTypesRes.error) throw playTypesRes.error;
      if (playsRes.error) throw playsRes.error;

      console.log('✅ Data fetched successfully');
      console.log('Games:', gamesRes.data?.length);
      console.log('Teams:', teamsRes.data?.length);
      console.log('Players:', playersRes.data?.length);
      console.log('Play Types:', playTypesRes.data?.length);
      console.log('Plays:', playsRes.data?.length);

      setGames(gamesRes.data || []);
      setTeams(teamsRes.data || []);
      setPlayers(playersRes.data || []);
      setPlayTypes(playTypesRes.data || []);
      setPlays(playsRes.data || []);

    } catch (err: any) {
      console.error('❌ Error fetching statistics data:', err);
      setError(`Failed to load statistics: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const calculateStatistics = () => {
    console.log('📊 Calculating statistics...');
    
    // Filter plays based on current selections
    let filteredPlays = plays;
    
    if (selectedGame !== 'all') {
      filteredPlays = filteredPlays.filter(p => p.game_id === selectedGame);
    }
    
    if (selectedTeam !== 'all') {
      filteredPlays = filteredPlays.filter(p => p.team_id === selectedTeam);
    }
    
    if (selectedPlayer !== 'all') {
      filteredPlays = filteredPlays.filter(p => p.player_id === selectedPlayer);
    }
    
    if (selectedCategory !== 'all') {
      filteredPlays = filteredPlays.filter(p => p.play_type?.category === selectedCategory);
    }

    console.log('Filtered plays:', filteredPlays.length);

    // Calculate overall statistics
    const overall = calculateSummaryStats(filteredPlays);
    setOverallStats(overall);

    // Calculate player statistics
    const playerStatsMap = new Map<string, PlayerStats>();
    filteredPlays.forEach(play => {
      if (play.player_id && play.player) {
        if (!playerStatsMap.has(play.player_id)) {
          playerStatsMap.set(play.player_id, {
            player: play.player,
            stats: calculateSummaryStats([]),
            plays: []
          });
        }
        const playerStat = playerStatsMap.get(play.player_id)!;
        playerStat.plays.push(play);
      }
    });

    // Recalculate stats for each player
    playerStatsMap.forEach(playerStat => {
      playerStat.stats = calculateSummaryStats(playerStat.plays);
    });

    setPlayerStats(Array.from(playerStatsMap.values()).sort((a, b) => 
      b.stats.totalPoints - a.stats.totalPoints
    ));

    // Calculate team statistics
    const teamStatsMap = new Map<string, TeamStats>();
    filteredPlays.forEach(play => {
      if (play.team) {
        if (!teamStatsMap.has(play.team_id)) {
          teamStatsMap.set(play.team_id, {
            team: play.team,
            stats: calculateSummaryStats([]),
            plays: [],
            players: []
          });
        }
        const teamStat = teamStatsMap.get(play.team_id)!;
        teamStat.plays.push(play);
      }
    });

    // Recalculate stats for each team and add player stats
    teamStatsMap.forEach(teamStat => {
      teamStat.stats = calculateSummaryStats(teamStat.plays);
      teamStat.players = playerStats.filter(ps => ps.player.team_id === teamStat.team.id);
    });

    setTeamStats(Array.from(teamStatsMap.values()).sort((a, b) => 
      b.stats.totalPoints - a.stats.totalPoints
    ));

    console.log('✅ Statistics calculated');
  };

  const calculateSummaryStats = (plays: Play[]): StatsSummary => {
    const totalPlays = plays.length;
    const totalPoints = plays.reduce((sum, play) => sum + play.value, 0);
    const positivePoints = plays.filter(p => p.value > 0).reduce((sum, play) => sum + play.value, 0);
    const negativePoints = plays.filter(p => p.value < 0).reduce((sum, play) => sum + play.value, 0);
    const neutralPlays = plays.filter(p => p.value === 0).length;

    const playsByCategory: Record<string, number> = {};
    const pointsByCategory: Record<string, number> = {};

    plays.forEach(play => {
      const category = play.play_type?.category || 'Unknown';
      playsByCategory[category] = (playsByCategory[category] || 0) + 1;
      pointsByCategory[category] = (pointsByCategory[category] || 0) + play.value;
    });

    const efficiency = totalPlays > 0 ? (positivePoints / totalPlays) * 100 : 0;

    return {
      totalPlays,
      totalPoints,
      positivePoints,
      negativePoints,
      neutralPlays,
      playsByCategory,
      pointsByCategory,
      efficiency: Math.round(efficiency * 100) / 100
    };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-gray-600">Loading statistics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md">
        {error}
        <Button onClick={fetchData} className="ml-4">
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Statistics</h1>
          <p className="text-gray-600 mt-1">Comprehensive volleyball analytics and insights</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Data
          </Button>
          <Button onClick={fetchData}>
            <BarChart3 className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* View Selector */}
      <Card className="p-6 mb-6">
        <div className="flex items-center space-x-4 mb-4">
          <h3 className="text-lg font-semibold">View</h3>
          <div className="flex space-x-2">
            {[
              { key: 'overview', label: 'Overview', icon: BarChart3 },
              { key: 'players', label: 'Players', icon: Users },
              { key: 'teams', label: 'Teams', icon: Trophy },
              { key: 'games', label: 'Games', icon: Target }
            ].map(({ key, label, icon: Icon }) => (
              <Button
                key={key}
                onClick={() => setSelectedView(key as any)}
                variant={selectedView === key ? 'default' : 'outline'}
                className="flex items-center"
              >
                <Icon className="h-4 w-4 mr-2" />
                {label}
              </Button>
            ))}
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Game</label>
            <select
              value={selectedGame}
              onChange={(e) => setSelectedGame(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Games</option>
              {games.map(game => (
                <option key={game.id} value={game.id}>
                  {game.home_team?.name} vs {game.away_team?.name} - {new Date(game.scheduled_at).toLocaleDateString()}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Team</label>
            <select
              value={selectedTeam}
              onChange={(e) => setSelectedTeam(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Teams</option>
              {teams.map(team => (
                <option key={team.id} value={team.id}>{team.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Player</label>
            <select
              value={selectedPlayer}
              onChange={(e) => setSelectedPlayer(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Players</option>
              {players
                .filter(player => selectedTeam === 'all' || player.team_id === selectedTeam)
                .map(player => (
                <option key={player.id} value={player.id}>
                  #{player.jersey_number} {player.full_name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Categories</option>
              {Array.from(new Set(playTypes.map(pt => pt.category))).map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* Statistics Content */}
      {selectedView === 'overview' && (
        <OverviewView
          overallStats={overallStats}
          plays={plays.filter(p => {
            if (selectedGame !== 'all' && p.game_id !== selectedGame) return false;
            if (selectedTeam !== 'all' && p.team_id !== selectedTeam) return false;
            if (selectedPlayer !== 'all' && p.player_id !== selectedPlayer) return false;
            if (selectedCategory !== 'all' && p.play_type?.category !== selectedCategory) return false;
            return true;
          })}
          topPlayers={playerStats}
          topTeams={teamStats}
        />
      )}

      {selectedView === 'players' && (
        <PlayersView
          playerStats={playerStats}
          plays={plays.filter(p => {
            if (selectedGame !== 'all' && p.game_id !== selectedGame) return false;
            if (selectedTeam !== 'all' && p.team_id !== selectedTeam) return false;
            if (selectedPlayer !== 'all' && p.player_id !== selectedPlayer) return false;
            if (selectedCategory !== 'all' && p.play_type?.category !== selectedCategory) return false;
            return true;
          })}
        />
      )}

      {selectedView === 'teams' && (
        <TeamsView
          teamStats={teamStats}
          plays={plays.filter(p => {
            if (selectedGame !== 'all' && p.game_id !== selectedGame) return false;
            if (selectedTeam !== 'all' && p.team_id !== selectedTeam) return false;
            if (selectedPlayer !== 'all' && p.player_id !== selectedPlayer) return false;
            if (selectedCategory !== 'all' && p.play_type?.category !== selectedCategory) return false;
            return true;
          })}
        />
      )}

      {selectedView === 'games' && (
        <GamesView
          games={games}
          plays={plays.filter(p => {
            if (selectedGame !== 'all' && p.game_id !== selectedGame) return false;
            if (selectedTeam !== 'all' && p.team_id !== selectedTeam) return false;
            if (selectedPlayer !== 'all' && p.player_id !== selectedPlayer) return false;
            if (selectedCategory !== 'all' && p.play_type?.category !== selectedCategory) return false;
            return true;
          })}
        />
      )}
    </div>
  );
}
