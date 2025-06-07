// src/components/game-recording/GameSetControls.tsx
'use client';

import { GameSet } from '@/types/database';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

interface GameSetControlsProps {
  currentSet: GameSet;
  onNewSet: () => void;
  onFinishGame: () => void;
}

export function GameSetControls({ currentSet, onNewSet, onFinishGame }: GameSetControlsProps) {
  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Game Controls</h3>
      
      <div className="space-y-4">
        <div className="p-3 bg-gray-50 rounded-lg">
          <div className="text-sm text-gray-600 mb-1">Current Set</div>
          <div className="text-lg font-semibold text-gray-900">
            Set {currentSet.set_number}
          </div>
          <div className="text-sm text-gray-600">
            Status: {currentSet.is_completed ? 'Completed' : 'In Progress'}
          </div>
        </div>

        <div className="space-y-2">
          <Button
            onClick={onNewSet}
            className="w-full"
            variant="primary"
          >
            Start New Set
          </Button>
          
          <Button
            onClick={onFinishGame}
            className="w-full"
            variant="outline"
          >
            Finish Game
          </Button>
        </div>

        <div className="pt-4 border-t border-gray-200">
          <h4 className="text-sm font-medium text-gray-900 mb-2">
            Quick Tips
          </h4>
          <ul className="text-xs text-gray-600 space-y-1">
            <li>• Drag players to position them on the field</li>
            <li>• Select player and play type, then click field</li>
            <li>• Use rotation button to rotate team positions</li>
            <li>• Switch teams using the buttons above</li>
          </ul>
        </div>
      </div>
    </Card>
  );
}