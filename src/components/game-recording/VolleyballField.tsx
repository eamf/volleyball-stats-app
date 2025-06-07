// src/components/game-recording/VolleyballField.tsx
'use client';

import { useState, useCallback, useRef } from 'react';
import { useDrop } from 'react-dnd';
import { Player, VOLLEYBALL_POSITIONS, PositionKey, ROTATION_ORDER } from '@/types/database';
import { PlayerPosition } from './PlayerPosition';

interface PlayerOnField {
  player: Player;
  position: PositionKey;
}

interface VolleyballFieldProps {
  teamPlayers: Player[];
  fieldPlayers: PlayerOnField[];
  benchPlayers: Player[];
  onPlayerMove: (playerId: string, newPosition: PositionKey | 'bench') => void;
  onRotate: () => void;
  onFieldClick?: (x: number, y: number) => void;
  isRecordingPlay?: boolean;
  teamColor?: string;
  plays?: Array<{ field_x?: number; field_y?: number; play_type?: { name: string; category: string } }>;
}

export function VolleyballField({
  teamPlayers,
  fieldPlayers,
  benchPlayers,
  onPlayerMove,
  onRotate,
  onFieldClick,
  isRecordingPlay = false,
  teamColor = '#3b82f6',
  plays = []
}: VolleyballFieldProps) {
  const fieldRef = useRef<HTMLDivElement>(null);
  
  const [{ isOver }, drop] = useDrop({
    accept: 'player',
    drop: (item: { playerId: string }, monitor) => {
      const dropPosition = monitor.getDropResult<{ position: PositionKey }>();
      if (dropPosition) {
        onPlayerMove(item.playerId, dropPosition.position);
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });

  // Connect the drop target to the field ref
  drop(fieldRef);

  const handleFieldClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!onFieldClick || !isRecordingPlay) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    onFieldClick(x, y);
  }, [onFieldClick, isRecordingPlay]);

  const getPlayerAtPosition = (position: PositionKey) => {
    return fieldPlayers.find(fp => fp.position === position);
  };

  return (
    <div className="space-y-6">
      {/* Field */}
      <div 
        ref={fieldRef}
        className={`volleyball-field relative ${isRecordingPlay ? 'cursor-crosshair' : ''}`}
        onClick={handleFieldClick}
      >
        {/* Position slots */}
        {Object.entries(VOLLEYBALL_POSITIONS).map(([position, coords]) => {
          const positionKey = position as PositionKey;
          const playerOnField = getPlayerAtPosition(positionKey);
          
          return (
            <PositionSlot
              key={position}
              position={positionKey}
              x={coords.x}
              y={coords.y}
              player={playerOnField?.player}
              teamColor={teamColor}
            />
          );
        })}

        {/* Play markers */}
        {plays.map((play, index) => (
          play.field_x && play.field_y && (
            <PlayMarker
              key={index}
              x={play.field_x}
              y={play.field_y}
              playType={play.play_type?.category || 'unknown'}
            />
          )
        ))}

        {/* Field labels */}
        <div className="absolute top-2 left-4 text-white font-bold text-sm">
          Our Side
        </div>
        <div className="absolute bottom-2 right-4 text-white font-bold text-sm">
          Opponent Side
        </div>
      </div>

      {/* Controls */}
      <div className="flex justify-between items-center">
        <button
          onClick={onRotate}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Rotate Team
        </button>
        
        <div className="text-sm text-gray-600">
          Drag players from bench to field positions
        </div>
      </div>

      {/* Bench */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold mb-3">Bench</h3>
        <div className="flex flex-wrap gap-2">
          {benchPlayers.map((player) => (
            <PlayerPosition
              key={player.id}
              player={player}
              position="bench"
              teamColor={teamColor}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

interface PositionSlotProps {
  position: PositionKey;
  x: number;
  y: number;
  player?: Player;
  teamColor: string;
}

function PositionSlot({ position, x, y, player, teamColor }: PositionSlotProps) {
  const slotRef = useRef<HTMLDivElement>(null);
  
  const [{ isOver }, drop] = useDrop({
    accept: 'player',
    drop: () => ({ position }),
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });

  // Connect the drop target to the slot ref
  drop(slotRef);

  return (
    <div
      ref={slotRef}
      className={`position-slot ${player ? 'occupied' : ''} ${isOver ? 'drop-target' : ''}`}
      style={{ left: `${x}%`, top: `${y}%` }}
    >
      {player && (
        <PlayerPosition
          player={player}
          position={position}
          teamColor={teamColor}
        />
      )}
      {!player && (
        <div className="absolute inset-0 flex items-center justify-center text-white text-xs font-bold">
          {position}
        </div>
      )}
    </div>
  );
}

interface PlayMarkerProps {
  x: number;
  y: number;
  playType: string;
}

function PlayMarker({ x, y, playType }: PlayMarkerProps) {
  const getPlayColor = (type: string) => {
    switch (type) {
      case 'attack': return '#ef4444'; // red
      case 'serve': return '#3b82f6'; // blue
      case 'block': return '#8b5cf6'; // purple
      case 'dig': return '#10b981'; // green
      case 'set': return '#f59e0b'; // yellow
      case 'reception': return '#6366f1'; // indigo
      case 'error': return '#6b7280'; // gray
      default: return '#6b7280';
    }
  };

  return (
    <div
      className="heatmap-point"
      style={{
        left: `${x}%`,
        top: `${y}%`,
        backgroundColor: getPlayColor(playType),
        width: '8px',
        height: '8px',
        opacity: 0.7,
      }}
    />
  );
}