'use client';

import { Card } from '@/components/ui/Card';
import { CourtHeatmap } from '@/components/CourtHeatmap';
import { Trophy, Target, TrendingUp, TrendingDown, Activity, Users } from 'lucide-react';

// Types (same as in statistics page)
type Player = {
  id: string;
  full_name: string;
  jersey_number: number;
  team_id: string;
  team?: any;
};

type Team = {
  id: string;
  name: string;
  team_color: string;
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
  game?: any;
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

// Overview Component
export function OverviewView({ 
  overallStats, 
  plays, 
  topPlayers, 
  topTeams 
}: { 
  overallStats: StatsSummary | null;
  plays: Play[];
  topPlayers: PlayerStats[];
  topTeams: TeamStats[];
}) {
  if (!overallStats) {
    return <div>No data available</div>;
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-center">
            <Activity className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Plays</p>
              <p className="text-2xl font-bold text-gray-900">{overallStats.totalPlays}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <Target className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Points</p>
              <p className="text-2xl font-bold text-gray-900">{overallStats.totalPoints}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <TrendingUp className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Positive Points</p>
              <p className="text-2xl font-bold text-green-600">+{overallStats.positivePoints}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <TrendingDown className="h-8 w-8 text-red-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Negative Points</p>
              <p className="text-2xl font-bold text-red-600">{overallStats.negativePoints}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Charts and Heatmap */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Play Categories Chart */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Plays by Category</h3>
          <div className="space-y-3">
            {Object.entries(overallStats.playsByCategory).map(([category, count]) => {
              const percentage = (count / overallStats.totalPlays) * 100;
              return (
                <div key={category}>
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{category}</span>
                    <span>{count} plays ({percentage.toFixed(1)}%)</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Court Heatmap */}
        <CourtHeatmap plays={plays} />
      </div>

      {/* Top Performers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Players */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Top Players</h3>
          <div className="space-y-3">
            {topPlayers.slice(0, 5).map((playerStat, index) => (
              <div key={playerStat.player.id} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-bold text-blue-600">
                    {index + 1}
                  </div>
                  <div className="ml-3">
                    <p className="font-medium">#{playerStat.player.jersey_number} {playerStat.player.full_name}</p>
                    <p className="text-sm text-gray-600">{playerStat.stats.totalPlays} plays</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-lg">{playerStat.stats.totalPoints}</p>
                  <p className="text-sm text-gray-600">{playerStat.stats.efficiency}% eff.</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Top Teams */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Team Performance</h3>
          <div className="space-y-3">
            {topTeams.map((teamStat, index) => (
              <div key={teamStat.team.id} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div 
                    className="w-4 h-4 rounded-full mr-3"
                    style={{ backgroundColor: teamStat.team.team_color || '#6b7280' }}
                  ></div>
                  <div>
                    <p className="font-medium">{teamStat.team.name}</p>
                    <p className="text-sm text-gray-600">{teamStat.stats.totalPlays} plays</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-lg">{teamStat.stats.totalPoints}</p>
                  <p className="text-sm text-gray-600">{teamStat.stats.efficiency}% eff.</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

// Players View Component
export function PlayersView({ playerStats, plays }: { playerStats: PlayerStats[]; plays: Play[] }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Players List */}
        <div className="lg:col-span-2">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Player Statistics</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Player</th>
                    <th className="text-center py-2">Plays</th>
                    <th className="text-center py-2">Points</th>
                    <th className="text-center py-2">+/-</th>
                    <th className="text-center py-2">Efficiency</th>
                  </tr>
                </thead>
                <tbody>
                  {playerStats.map((playerStat) => (
                    <tr key={playerStat.player.id} className="border-b hover:bg-gray-50">
                      <td className="py-3">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-bold text-blue-600">
                            {playerStat.player.jersey_number}
                          </div>
                          <div className="ml-3">
                            <p className="font-medium">{playerStat.player.full_name}</p>
                            <p className="text-sm text-gray-600">{playerStat.player.team?.name}</p>
                          </div>
                        </div>
                      </td>
                      <td className="text-center py-3">{playerStat.stats.totalPlays}</td>
                      <td className="text-center py-3 font-bold">{playerStat.stats.totalPoints}</td>
                      <td className="text-center py-3">
                        <span className="text-green-600">+{playerStat.stats.positivePoints}</span>
                        <span className="text-gray-400 mx-1">/</span>
                        <span className="text-red-600">{playerStat.stats.negativePoints}</span>
                      </td>
                      <td className="text-center py-3">{playerStat.stats.efficiency}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* Player Heatmap */}
        <div>
          <CourtHeatmap plays={plays} width={300} height={450} />
        </div>
      </div>
    </div>
  );
}

// Teams View Component
export function TeamsView({ teamStats, plays }: { teamStats: TeamStats[]; plays: Play[] }) {
  return (
    <div className="space-y-6">
      {teamStats.map((teamStat) => (
        <Card key={teamStat.team.id} className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <div 
                className="w-6 h-6 rounded-full mr-3"
                style={{ backgroundColor: teamStat.team.team_color || '#6b7280' }}
              ></div>
              <h3 className="text-xl font-bold">{teamStat.team.name}</h3>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold">{teamStat.stats.totalPoints} pts</p>
              <p className="text-sm text-gray-600">{teamStat.stats.efficiency}% efficiency</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Team Stats */}
            <div className="lg:col-span-2">
              <div className="grid grid-cols-4 gap-4 mb-6">
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">{teamStat.stats.totalPlays}</p>
                  <p className="text-sm text-gray-600">Total Plays</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">+{teamStat.stats.positivePoints}</p>
                  <p className="text-sm text-gray-600">Positive</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-red-600">{teamStat.stats.negativePoints}</p>
                  <p className="text-sm text-gray-600">Negative</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-600">{teamStat.stats.neutralPlays}</p>
                  <p className="text-sm text-gray-600">Neutral</p>
                </div>
              </div>

              {/* Team Players */}
              <h4 className="font-semibold mb-3">Team Players</h4>
              <div className="space-y-2">
                {teamStat.players.slice(0, 5).map((playerStat) => (
                  <div key={playerStat.player.id} className="flex items-center justify-between bg-gray-50 p-3 rounded">
                    <div className="flex items-center">
                      <span className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-xs font-bold text-blue-600">
                        {playerStat.player.jersey_number}
                      </span>
                      <span className="ml-2 font-medium">{playerStat.player.full_name}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold">{playerStat.stats.totalPoints} pts</span>
                      <span className="text-sm text-gray-600 ml-2">({playerStat.stats.totalPlays} plays)</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Team Heatmap */}
            <div>
              <CourtHeatmap 
                plays={teamStat.plays} 
                width={250} 
                height={375} 
                showLegend={false}
              />
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

// Games View Component
export function GamesView({ games, plays }: { games: any[]; plays: Play[] }) {
  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Games Overview</h3>
        <div className="space-y-4">
          {games.map((game) => {
            const gamePlays = plays.filter(p => p.game_id === game.id);
            const totalPoints = gamePlays.reduce((sum, play) => sum + play.value, 0);
            
            return (
              <div key={game.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="font-semibold">
                      {game.home_team?.name} vs {game.away_team?.name}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {new Date(game.scheduled_at).toLocaleDateString()} • {game.status}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{gamePlays.length} plays</p>
                    <p className="text-sm text-gray-600">{totalPoints} total points</p>
                  </div>
                </div>
                
                {gamePlays.length > 0 && (
                  <CourtHeatmap 
                    plays={gamePlays} 
                    width={400} 
                    height={300} 
                    showLegend={false}
                  />
                )}
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
