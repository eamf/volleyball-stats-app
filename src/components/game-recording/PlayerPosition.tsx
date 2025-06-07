// src/components/game-recording/PlayerPosition.tsx
'use client';

import { useRef } from 'react';
import { useDrag } from 'react-dnd';
import { Player, PositionKey } from '@/types/database';

interface PlayerPositionProps {
  player: Player;
  position: PositionKey | 'bench';
  teamColor?: string;
  onClick?: () => void;
  isSelected?: boolean;
}

export function PlayerPosition({ 
  player, 
  position, 
  teamColor = '#3b82f6',
  onClick,
  isSelected = false
}: PlayerPositionProps) {
  const ref = useRef<HTMLDivElement>(null);
  
  const [{ isDragging }, drag] = useDrag({
    type: 'player',
    item: { playerId: player.id },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  // Connect the drag source to the ref
  drag(ref);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onClick) {
      onClick();
    }
  };

  return (
    <div
      ref={ref}
      onClick={handleClick}
      className={`player-position ${position === 'bench' ? 'bench' : ''} ${
        isDragging ? 'dragging' : ''
      } ${isSelected ? 'ring-2 ring-yellow-400' : ''}`}
      style={{ 
        backgroundColor: teamColor,
        cursor: isDragging ? 'grabbing' : 'grab'
      }}
      title={`${player.full_name} - ${player.primary_position}`}
    >
      <div className="text-center">
        <div className="font-bold text-sm">
          {player.jersey_number}
        </div>
        {position === 'bench' && (
          <div className="text-xs truncate w-12">
            {player.full_name.split(' ')[0]}
          </div>
        )}
      </div>
    </div>
  );
}