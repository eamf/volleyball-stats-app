// src/components/game-recording/PlayControls.tsx
'use client';

import { Player, PlayType } from '@/types/database';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

interface PlayControlsProps {
  players: Player[];
  playTypes: PlayType[];
  selectedPlayer: Player | null;
  selectedPlayType: PlayType | null;
  onPlayerSelect: (player: Player) => void;
  onPlayTypeSelect: (playType: PlayType) => void;
  onClearSelection: () => void;
}

export function PlayControls({
  players,
  playTypes,
  selectedPlayer,
  selectedPlayType,
  onPlayerSelect,
  onPlayTypeSelect,
  onClearSelection,
}: PlayControlsProps) {
  const playTypesByCategory = playTypes.reduce((acc, playType) => {
    if (!acc[playType.category]) {
      acc[playType.category] = [];
    }
    acc[playType.category].push(playType);
    return acc;
  }, {} as Record<string, PlayType[]>);

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Record Play</h3>
      
      {/* Selected items display */}
      {(selectedPlayer || selectedPlayType) && (
        <div className="mb-4 p-3 bg-blue-50 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-blue-900">Selected:</span>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onClearSelection}
              className="text-blue-600"
            >
              Clear
            </Button>
          </div>
          {selectedPlayer && (
            <div className="text-sm text-blue-800">
              Player: #{selectedPlayer.jersey_number} {selectedPlayer.full_name}
            </div>
          )}
          {selectedPlayType && (
            <div className="text-sm text-blue-800">
              Play: {selectedPlayType.name}
            </div>
          )}
          {selectedPlayer && selectedPlayType && (
            <div className="text-xs text-blue-600 mt-1">
              Click on the field to record this play
            </div>
          )}
        </div>
      )}

      {/* Player selection */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-900 mb-3">Select Player</h4>
        <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto custom-scrollbar">
          {players.map((player) => (
            <button
              key={player.id}
              onClick={() => onPlayerSelect(player)}
              className={`p-2 text-left rounded border transition-colors ${
                selectedPlayer?.id === player.id
                  ? 'bg-blue-100 border-blue-300 text-blue-900'
                  : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
              }`}
            >
              <div className="font-medium text-sm">
                #{player.jersey_number}
              </div>
              <div className="text-xs text-gray-600 truncate">
                {player.full_name}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Play type selection */}
      <div>
        <h4 className="text-sm font-medium text-gray-900 mb-3">Select Play Type</h4>
        <div className="space-y-3 max-h-64 overflow-y-auto custom-scrollbar">
          {Object.entries(playTypesByCategory).map(([category, categoryPlayTypes]) => (
            <div key={category}>
              <h5 className="text-xs font-medium text-gray-700 uppercase tracking-wide mb-2">
                {category}
              </h5>
              <div className="grid grid-cols-1 gap-1">
                {categoryPlayTypes.map((playType) => (
                  <button
                    key={playType.id}
                    onClick={() => onPlayTypeSelect(playType)}
                    className={`play-button ${category} text-left ${
                      selectedPlayType?.id === playType.id
                        ? 'ring-2 ring-blue-400'
                        : ''
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-sm">{playType.name}</span>
                      <span className="text-xs">
                        {playType.default_value > 0 ? '+' : ''}{playType.default_value}
                      </span>
                    </div>
                    {playType.description && (
                      <div className="text-xs opacity-75 mt-1">
                        {playType.description}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}