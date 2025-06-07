// src/components/game-recording/GameRecording.tsx
'use client';

import { useState, useEffect } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { createClient } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Game, 
  GameSet, 
  Player, 
  PlayType, 
  Play,
  PositionKey, 
  VOLLEYBALL_POSITIONS,
  ROTATION_ORDER 
} from '@/types/database';
import { VolleyballField } from './VolleyballField';
import { PlayControls } from './PlayControls';
import { ScoreBoard } from './ScoreBoard';
import { GameSetControls } from './GameSetControls';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

interface PlayerOnField {
  player: Player;
  position: PositionKey;
}

interface GameRecordingProps {
  gameId?: string;
  onFinish: () => void;
}

export function GameRecording({ gameId, onFinish }: GameRecordingProps) {
  const [game, setGame] = useState<Game | null>(null);
  const [currentSet, setCurrentSet] = useState<GameSet | null>(null);
  const [homePlayers, setHomePlayers] = useState<Player[]>([]);
  const [awayPlayers, setAwayPlayers] = useState<Player[]>([]);
  const [homeFieldPlayers, setHomeFieldPlayers] = useState<PlayerOnField[]>([]);
  const [awayFieldPlayers, setAwayFieldPlayers] = useState<PlayerOnField[]>([]);
  const [playTypes, setPlayTypes] = useState<PlayType[]>([]);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [selectedPlayType, setSelectedPlayType] = useState<PlayType | null>(null);
  const [isRecordingPlay, setIsRecordingPlay] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentTeam, setCurrentTeam] = useState<'home' | 'away'>('home');
  const [plays, setPlays] = useState<Play[]>([]);

  const { profile } = useAuth();
  const supabase = createClient();

  useEffect(() => {
    if (gameId) {
      loadGame();
    } else {
      // Create a new game or show game selection
      setLoading(false);
    }
  }, [gameId]);

  const loadGame = async () => {
    if (!gameId) return;

    try {
      // Load game details
      const { data: gameData, error: gameError } = await supabase
        .from('games')
        .select(`
          *,
          home_team:teams!home_team_id(*),
          away_team:teams!away_team_id(*),
          championship:championships(*)
        `)
        .eq('id', gameId)
        .single();

      if (gameError) throw gameError;
      setGame(gameData);

      // Load current set
      const { data: setsData, error: setsError } = await supabase
        .from('game_sets')
        .select('*')
        .eq('game_id', gameId)
        .eq('is_completed', false)
        .order('set_number', { ascending: false })
        .limit(1);

      if (setsError) throw setsError;

      if (setsData && setsData.length > 0) {
        setCurrentSet(setsData[0]);
      } else {
        // Create first set
        await createNewSet(gameId, 1);
      }

      // Load players
      const { data: homePlayersData, error: homeError } = await supabase
        .from('players')
        .select('*')
        .eq('team_id', gameData.home_team_id)
        .eq('is_active', true);

      const { data: awayPlayersData, error: awayError } = await supabase
        .from('players')
        .select('*')
        .eq('team_id', gameData.away_team_id)
        .eq('is_active', true);

      if (homeError) throw homeError;
      if (awayError) throw awayError;

      setHomePlayers(homePlayersData || []);
      setAwayPlayers(awayPlayersData || []);

      // Load play types
      const { data: playTypesData, error: playTypesError } = await supabase
        .from('play_types')
        .select('*')
        .order('category', { ascending: true });

      if (playTypesError) throw playTypesError;
      setPlayTypes(playTypesData || []);

      // Load existing plays for current set
      if (setsData && setsData.length > 0) {
        loadPlays(setsData[0].id);
      }

    } catch (error) {
      console.error('Error loading game:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadPlays = async (setId: string) => {
    try {
      const { data, error } = await supabase
        .from('plays')
        .select(`
          *,
          player:players(*),
          play_type:play_types(*),
          team:teams(*)
        `)
        .eq('set_id', setId)
        .order('timestamp_in_set', { ascending: true });

      if (error) throw error;
      setPlays(data || []);
    } catch (error) {
      console.error('Error loading plays:', error);
    }
  };

  const createNewSet = async (gameId: string, setNumber: number) => {
    try {
      const { data, error } = await supabase
        .from('game_sets')
        .insert({
          game_id: gameId,
          set_number: setNumber,
        })
        .select()
        .single();

      if (error) throw error;
      setCurrentSet(data);
      return data;
    } catch (error) {
      console.error('Error creating new set:', error);
    }
  };

  const handlePlayerMove = (playerId: string, newPosition: PositionKey | 'bench') => {
    const isHomeTeam = currentTeam === 'home';
    const players = isHomeTeam ? homePlayers : awayPlayers;
    const fieldPlayers = isHomeTeam ? homeFieldPlayers : awayFieldPlayers;
    const setFieldPlayers = isHomeTeam ? setHomeFieldPlayers : setAwayFieldPlayers;

    const player = players.find(p => p.id === playerId);
    if (!player) return;

    if (newPosition === 'bench') {
      // Move player to bench
      const newFieldPlayers = fieldPlayers.filter(fp => fp.player.id !== playerId);
      setFieldPlayers(newFieldPlayers);
    } else {
      // Move player to field position
      const existingPlayerAtPosition = fieldPlayers.find(fp => fp.position === newPosition);
      let newFieldPlayers = fieldPlayers.filter(fp => fp.player.id !== playerId);
      
      if (existingPlayerAtPosition) {
        // Swap positions
        newFieldPlayers = newFieldPlayers.map(fp => 
          fp.player.id === existingPlayerAtPosition.player.id 
            ? { ...fp, position: fieldPlayers.find(f => f.player.id === playerId)?.position || 'P1' }
            : fp
        );
      }
      
      const playerCurrentlyOnField = fieldPlayers.find(fp => fp.player.id === playerId);
      if (playerCurrentlyOnField) {
        newFieldPlayers = newFieldPlayers.filter(fp => fp.player.id !== playerId);
      }
      
      newFieldPlayers.push({ player, position: newPosition });
      setFieldPlayers(newFieldPlayers);
    }
  };

  const handleRotate = () => {
    const isHomeTeam = currentTeam === 'home';
    const fieldPlayers = isHomeTeam ? homeFieldPlayers : awayFieldPlayers;
    const setFieldPlayers = isHomeTeam ? setHomeFieldPlayers : setAwayFieldPlayers;

    const rotatedPlayers = fieldPlayers.map(fp => {
      const currentIndex = ROTATION_ORDER.indexOf(fp.position);
      const nextIndex = (currentIndex + 1) % ROTATION_ORDER.length;
      return { ...fp, position: ROTATION_ORDER[nextIndex] };
    });

    setFieldPlayers(rotatedPlayers);
  };

  const handleFieldClick = async (x: number, y: number) => {
    if (!selectedPlayer || !selectedPlayType || !currentSet || !game) return;

    try {
      const { error } = await supabase
        .from('plays')
        .insert({
          game_id: game.id,
          set_id: currentSet.id,
          player_id: selectedPlayer.id,
          play_type_id: selectedPlayType.id,
          team_id: currentTeam === 'home' ? game.home_team_id : game.away_team_id,
          field_x: x,
          field_y: y,
          value: selectedPlayType.default_value,
        });

      if (error) throw error;

      // Reload plays
      await loadPlays(currentSet.id);
      
      // Clear selection
      setSelectedPlayer(null);
      setSelectedPlayType(null);
      setIsRecordingPlay(false);

    } catch (error) {
      console.error('Error recording play:', error);
    }
  };

  const handlePlayTypeSelect = (playType: PlayType) => {
    setSelectedPlayType(playType);
    setIsRecordingPlay(!!selectedPlayer && !!playType);
  };

  const handlePlayerSelect = (player: Player) => {
    setSelectedPlayer(player);
    setIsRecordingPlay(!!player && !!selectedPlayType);
  };

  const getCurrentTeamPlayers = () => {
    return currentTeam === 'home' ? homePlayers : awayPlayers;
  };

  const getCurrentFieldPlayers = () => {
    return currentTeam === 'home' ? homeFieldPlayers : awayFieldPlayers;
  };

  const getCurrentBenchPlayers = () => {
    const allPlayers = getCurrentTeamPlayers();
    const fieldPlayers = getCurrentFieldPlayers();
    return allPlayers.filter(player => 
      !fieldPlayers.some(fp => fp.player.id === player.id)
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!game || !currentSet) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-900">No Game Selected</h2>
        <p className="text-gray-600 mt-2">Please select a game to start recording.</p>
        <Button onClick={onFinish} className="mt-4">
          Back to Games
        </Button>
      </div>
    );
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Live Game Recording
            </h1>
            <p className="text-gray-600">
              {game.home_team?.name} vs {game.away_team?.name} - Set {currentSet.set_number}
            </p>
          </div>
          
          <div className="flex gap-2">
            <Button 
              variant={currentTeam === 'home' ? 'primary' : 'outline'}
              onClick={() => setCurrentTeam('home')}
            >
              {game.home_team?.name}
            </Button>
            <Button 
              variant={currentTeam === 'away' ? 'primary' : 'outline'}
              onClick={() => setCurrentTeam('away')}
            >
              {game.away_team?.name}
            </Button>
          </div>
        </div>

        <ScoreBoard 
          game={game}
          currentSet={currentSet}
          plays={plays}
        />

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2">
            <Card className="p-6">
              <VolleyballField
                teamPlayers={getCurrentTeamPlayers()}
                fieldPlayers={getCurrentFieldPlayers()}
                benchPlayers={getCurrentBenchPlayers()}
                onPlayerMove={handlePlayerMove}
                onRotate={handleRotate}
                onFieldClick={handleFieldClick}
                isRecordingPlay={isRecordingPlay}
                teamColor={currentTeam === 'home' ? game.home_team?.team_color : game.away_team?.team_color}
                plays={plays.filter(p => p.team_id === (currentTeam === 'home' ? game.home_team_id : game.away_team_id))}
              />
            </Card>
          </div>

          <div className="space-y-6">
            <PlayControls
              players={getCurrentTeamPlayers()}
              playTypes={playTypes}
              selectedPlayer={selectedPlayer}
              selectedPlayType={selectedPlayType}
              onPlayerSelect={handlePlayerSelect}
              onPlayTypeSelect={handlePlayTypeSelect}
              onClearSelection={() => {
                setSelectedPlayer(null);
                setSelectedPlayType(null);
                setIsRecordingPlay(false);
              }}
            />

            <GameSetControls
              currentSet={currentSet}
              onNewSet={() => {
                if (game) {
                  createNewSet(game.id, currentSet.set_number + 1);
                }
              }}
              onFinishGame={onFinish}
            />
          </div>
        </div>
      </div>
    </DndProvider>
  );
}