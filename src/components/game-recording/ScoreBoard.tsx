// src/components/game-recording/ScoreBoard.tsx
'use client';

import { Game, GameSet, Play } from '@/types/database';
import { Card } from '@/components/ui/Card';

interface ScoreBoardProps {
  game: Game;
  currentSet: GameSet;
  plays: Play[];
}

export function ScoreBoard({ game, currentSet, plays }: ScoreBoardProps) {
  // Calculate scores from plays
  const homeTeamPlays = plays.filter(p => p.team_id === game.home_team_id);
  const awayTeamPlays = plays.filter(p => p.team_id === game.away_team_id);
  
  const homeScore = homeTeamPlays
    .filter(p => p.play_type?.is_positive)
    .reduce((sum, p) => sum + p.value, 0);
  
  const awayScore = awayTeamPlays
    .filter(p => p.play_type?.is_positive)
    .reduce((sum, p) => sum + p.value, 0);

  return (
    <Card className="p-6">
      <div className="grid grid-cols-3 gap-6 items-center">
        {/* Home Team */}
        <div className="text-center">
          <div className="text-lg font-semibold text-gray-900 mb-1">
            {game.home_team?.name}
          </div>
          <div className="text-3xl font-bold text-blue-600">
            {Math.round(homeScore)}
          </div>
          <div className="text-sm text-gray-600">
            Set {currentSet.set_number} Score
          </div>
        </div>

        {/* VS and Set Info */}
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-400 mb-2">VS</div>
          <div className="text-sm text-gray-600">
            Set {currentSet.set_number}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            Game Score: {game.home_score} - {game.away_score}
          </div>
        </div>

        {/* Away Team */}
        <div className="text-center">
          <div className="text-lg font-semibold text-gray-900 mb-1">
            {game.away_team?.name}
          </div>
          <div className="text-3xl font-bold text-red-600">
            {Math.round(awayScore)}
          </div>
          <div className="text-sm text-gray-600">
            Set {currentSet.set_number} Score
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-4 mt-6 pt-4 border-t border-gray-200">
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-2">
            {game.home_team?.name} Stats
          </h4>
          <div className="text-sm text-gray-600 space-y-1">
            <div className="flex justify-between">
              <span>Total Plays:</span>
              <span>{homeTeamPlays.length}</span>
            </div>
            <div className="flex justify-between">
              <span>Positive Plays:</span>
              <span>{homeTeamPlays.filter(p => p.play_type?.is_positive).length}</span>
            </div>
          </div>
        </div>
        
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-2">
            {game.away_team?.name} Stats
          </h4>
          <div className="text-sm text-gray-600 space-y-1">
            <div className="flex justify-between">
              <span>Total Plays:</span>
              <span>{awayTeamPlays.length}</span>
            </div>
            <div className="flex justify-between">
              <span>Positive Plays:</span>
              <span>{awayTeamPlays.filter(p => p.play_type?.is_positive).length}</span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}