'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ArrowLeft, Play, Pause, RotateCcw, Plus, Minus, Video, VideoOff } from 'lucide-react';
import '@/styles/volleyball-court.css';
import { YouTubePlayer } from '@/components/video/YouTubePlayer';

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
  video_url: string | null; // YouTube video URL
};

type Team = {
  id: string;
  name: string;
  team_color: string;
};

type Player = {
  id: string;
  team_id: string;
  jersey_number: number;
  full_name: string;
  primary_position: string;
  secondary_position: string | null;
  is_active: boolean;
};

type PlayType = {
  id: string;
  name: string;
  default_value: number;
  default_score_increment: number; // Default score increment for this play type
  category: string;
  is_positive: boolean;
  description: string | null;
};

type Play = {
  id: string;
  game_id: string;
  set_id: string;
  player_id: string | null;
  play_type_id: string;
  team_id: string;
  field_x: number | null;
  field_y: number | null;
  value: number; // Statistical value
  score_increment: number; // Score increment: 1 = point for team, -1 = point for opponent, 0 = no score change
  timestamp_in_set: string;
  rotation_position: number | null;
  notes: string | null;
  comment: string | null; // Comment explaining the play
  video_timestamp: number | null; // Video timestamp in seconds
  created_at: string;
  player?: Player;
  play_type?: PlayType;
};

type GameSet = {
  id: string;
  game_id: string;
  set_number: number;
  home_score: number;
  away_score: number;
  is_completed: boolean;
  completed_at: string | null;
  created_at?: string;
  updated_at?: string;
};

export default function GameRecordingPage() {
  const params = useParams();
  const router = useRouter();
  const gameId = params.id as string;
  
  // State
  const [game, setGame] = useState<Game | null>(null);
  const [homeTeam, setHomeTeam] = useState<Team | null>(null);
  const [awayTeam, setAwayTeam] = useState<Team | null>(null);
  const [sets, setSets] = useState<GameSet[]>([]);
  const [currentSet, setCurrentSet] = useState<GameSet | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);

  // Plays tracking state
  const [homePlayers, setHomePlayers] = useState<Player[]>([]);
  const [awayPlayers, setAwayPlayers] = useState<Player[]>([]);
  const [playTypes, setPlayTypes] = useState<PlayType[]>([]);
  const [plays, setPlays] = useState<Play[]>([]);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [selectedPlayType, setSelectedPlayType] = useState<PlayType | null>(null);
  const [selectedTeam, setSelectedTeam] = useState<'home' | 'away' | null>(null);
  const [isRecordingPlay, setIsRecordingPlay] = useState(false);

  // Lineup state
  const [homeLineup, setHomeLineup] = useState<{ [position: string]: Player | null }>({
    P1: null, P2: null, P3: null, P4: null, P5: null, P6: null
  });
  const [awayLineup, setAwayLineup] = useState<{ [position: string]: Player | null }>({
    P1: null, P2: null, P3: null, P4: null, P5: null, P6: null
  });
  const [draggedPlayer, setDraggedPlayer] = useState<Player | null>(null);
  const [draggedFromTeam, setDraggedFromTeam] = useState<'home' | 'away' | null>(null);

  // Play editing state
  const [editingPlay, setEditingPlay] = useState<Play | null>(null);
  const [showPlayHistory, setShowPlayHistory] = useState(false);

  // Video player state
  const [showVideoPlayer, setShowVideoPlayer] = useState(false);
  const [videoUrl, setVideoUrl] = useState('');
  const [currentVideoTime, setCurrentVideoTime] = useState(0);
  const [isVideoReady, setIsVideoReady] = useState(false);

  // Team selection for stats tracking
  const [selectedTeamsForStats, setSelectedTeamsForStats] = useState<('home' | 'away')[]>(['home']);
  const [showTeamSelection, setShowTeamSelection] = useState(true); // Show by default for initial setup

  // Debug function to test database permissions
  const testDatabasePermissions = async () => {
    try {
      console.log('Testing database permissions...');

      // Test user authentication
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      console.log('Current user:', user);
      if (userError) {
        console.error('User auth error:', userError);
        return;
      }

      // Test reading plays
      const { data: playsData, error: playsError } = await supabase
        .from('plays')
        .select('*')
        .limit(1);
      console.log('Plays read test:', playsData, playsError);

      // Test reading user profile
      const { data: profileData, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user?.id)
        .single();
      console.log('Profile read test:', profileData, profileError);

      // Test creating a dummy play (we'll delete it immediately)
      if (currentSet && selectedPlayType) {
        const testPlay = {
          game_id: gameId,
          set_id: currentSet.id,
          player_id: null,
          play_type_id: selectedPlayType.id,
          team_id: game?.home_team_id,
          field_x: null,
          field_y: null,
          value: 0,
          timestamp_in_set: new Date().toISOString(),
          rotation_position: null,
          notes: 'TEST_PLAY_DELETE_ME'
        };

        const { data: insertData, error: insertError } = await supabase
          .from('plays')
          .insert(testPlay)
          .select()
          .single();

        console.log('Insert test:', insertData, insertError);

        if (insertData && !insertError) {
          // Try to delete the test play
          const { error: deleteError, count } = await supabase
            .from('plays')
            .delete({ count: 'exact' })
            .eq('id', insertData.id);

          console.log('Delete test:', { deleteError, count });

          if (!deleteError && count > 0) {
            console.log('✅ Database permissions are working correctly!');
            alert('Database permissions test passed! Delete should work now.');
          } else {
            console.error('❌ Delete permission test failed:', deleteError);
            alert(`Delete permission test failed: ${deleteError?.message || 'Unknown error'}`);
          }
        }
      }

    } catch (err: any) {
      console.error('Permission test error:', err);
      alert(`Permission test error: ${err.message}`);
    }
  };
  
  // Create Supabase client
  const supabase = createClient();
  
  useEffect(() => {
    if (gameId) {
      fetchGameData();
      fetchPlayTypes();
    }
  }, [gameId]);

  useEffect(() => {
    if (currentSet) {
      fetchPlays();
      // Also reload lineups when set changes
      if (game) {
        loadLineups(game);
      }
    }
  }, [currentSet]);
  
  // Fetch game data
  const fetchGameData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Fetch game
      const { data: gameData, error: gameError } = await supabase
        .from('games')
        .select('*')
        .eq('id', gameId)
        .single();
      
      if (gameError) throw gameError;
      setGame(gameData);

      // Initialize video URL if available
      if (gameData.video_url) {
        setVideoUrl(gameData.video_url);
        setShowVideoPlayer(true);
      }
      
      // Fetch teams
      const { data: teamsData, error: teamsError } = await supabase
        .from('teams')
        .select('id, name, team_color')
        .in('id', [gameData.home_team_id, gameData.away_team_id]);
      
      if (teamsError) throw teamsError;
      
      const homeTeamData = teamsData.find((t: any) => t.id === gameData.home_team_id);
      const awayTeamData = teamsData.find((t: any) => t.id === gameData.away_team_id);
      
      setHomeTeam(homeTeamData || null);
      setAwayTeam(awayTeamData || null);

      // Fetch players for both teams
      const { data: playersData, error: playersError } = await supabase
        .from('players')
        .select('*')
        .in('team_id', [gameData.home_team_id, gameData.away_team_id])
        .eq('is_active', true)
        .order('jersey_number');

      if (playersError) throw playersError;

      const homePlayersData = playersData?.filter((p: any) => p.team_id === gameData.home_team_id) || [];
      const awayPlayersData = playersData?.filter((p: any) => p.team_id === gameData.away_team_id) || [];

      setHomePlayers(homePlayersData);
      setAwayPlayers(awayPlayersData);

      // Load saved lineups for the current set
      await loadLineups(gameData);

      // Fetch sets
      const { data: setsData, error: setsError } = await supabase
        .from('game_sets')
        .select('*')
        .eq('game_id', gameId)
        .order('set_number');
      
      if (setsError) throw setsError;
      setSets(setsData || []);
      
      // Find current set (first incomplete set)
      const currentSetData = setsData?.find((s: any) => !s.is_completed);
      setCurrentSet(currentSetData || null);
      
    } catch (err: any) {
      console.error('Error fetching game data:', err);
      setError(`Failed to load game: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Fetch play types
  const fetchPlayTypes = async () => {
    try {
      const { data, error } = await supabase
        .from('play_types')
        .select('*')
        .order('category, name');

      if (error) throw error;
      setPlayTypes(data || []);
    } catch (err: any) {
      console.error('Error fetching play types:', err);
    }
  };

  // Fetch plays for current set
  const fetchPlays = async () => {
    if (!currentSet) return;

    try {
      const { data, error } = await supabase
        .from('plays')
        .select(`
          *,
          player:players(*),
          play_type:play_types(*)
        `)
        .eq('set_id', currentSet.id)
        .order('created_at');

      if (error) throw error;
      setPlays(data || []);
    } catch (err: any) {
      console.error('Error fetching plays:', err);
    }
  };
  
  // Start game recording
  const startGame = async () => {
    try {
      // Update game status to in_progress
      const { error: gameError } = await supabase
        .from('games')
        .update({ status: 'in_progress' })
        .eq('id', gameId);

      if (gameError) throw gameError;

      // Create first set if none exists
      if (sets.length === 0) {
        const { data: setData, error: setError } = await supabase
          .from('game_sets')
          .insert({
            game_id: gameId,
            set_number: 1,
            home_score: 0,
            away_score: 0,
            is_completed: false
          })
          .select()
          .single();

        if (setError) throw setError;

        setSets([setData]);
        setCurrentSet(setData);
      }

      setIsRecording(true);
      if (game) {
        setGame({ ...game, status: 'in_progress' });
      }

    } catch (err: any) {
      console.error('Error starting game:', err);
      setError(`Failed to start game: ${err.message}`);
    }
  };

  // Continue game recording (for games that are in_progress but have no current set)
  const continueGame = async () => {
    try {
      console.log('🔄 Continuing game recording...');
      console.log('Current sets:', sets.map(s => ({ set_number: s.set_number, is_completed: s.is_completed })));

      // Check if there's an incomplete set
      const incompleteSet = sets.find(s => !s.is_completed);

      if (incompleteSet) {
        console.log('✅ Found incomplete set:', incompleteSet.set_number);
        setCurrentSet(incompleteSet);
        setIsRecording(true);
        return;
      }

      // Check if game should be completed (3 sets won by either team)
      const completedSets = sets.filter(s => s.is_completed);
      const homeSetsWon = completedSets.filter(s => s.home_score > s.away_score).length;
      const awaySetsWon = completedSets.filter(s => s.away_score > s.home_score).length;

      console.log('Sets won - Home:', homeSetsWon, 'Away:', awaySetsWon);

      if (homeSetsWon >= 3 || awaySetsWon >= 3) {
        console.log('🏆 Game should be completed');
        await completeGame(homeSetsWon, awaySetsWon);
        return;
      }

      // Create next set
      const nextSetNumber = Math.max(...sets.map(s => s.set_number)) + 1;

      if (nextSetNumber > 5) {
        console.log('❌ Cannot create more than 5 sets');
        setError('Maximum 5 sets reached. Game should be completed.');
        return;
      }

      console.log('🆕 Creating set', nextSetNumber);

      const { data: setData, error: insertSetError } = await supabase
        .from('game_sets')
        .insert({
          game_id: gameId,
          set_number: nextSetNumber,
          home_score: 0,
          away_score: 0,
          is_completed: false
        })
        .select()
        .single();

      if (insertSetError) {
        console.error('❌ Error creating set:', insertSetError);
        throw insertSetError;
      }

      console.log('✅ Set created successfully:', setData);

      setSets(prevSets => [...prevSets, setData]);
      setCurrentSet(setData);
      setIsRecording(true);

    } catch (err: any) {
      console.error('❌ Error continuing game:', err);
      setError(`Failed to continue game: ${err.message}`);
    }
  };

  // Pause game recording
  const pauseGame = () => {
    console.log('⏸️ Pausing game recording...');
    setIsRecording(false);
    setCurrentSet(null);
    setSelectedPlayer(null);
    setSelectedPlayType(null);
    setSelectedTeam(null);
  };
  
  // Update set score
  const updateSetScore = async (team: 'home' | 'away', increment: number) => {
    if (!currentSet) return;

    const newHomeScore = team === 'home' ? currentSet.home_score + increment : currentSet.home_score;
    const newAwayScore = team === 'away' ? currentSet.away_score + increment : currentSet.away_score;

    // Prevent negative scores
    if (newHomeScore < 0 || newAwayScore < 0) return;

    try {
      const { error } = await supabase
        .from('game_sets')
        .update({
          home_score: newHomeScore,
          away_score: newAwayScore
        })
        .eq('id', currentSet.id);

      if (error) throw error;

      const updatedSet = {
        ...currentSet,
        home_score: newHomeScore,
        away_score: newAwayScore
      };

      setCurrentSet(updatedSet);
      setSets(sets.map(s => s.id === currentSet.id ? updatedSet : s));

      // Check if set should be completed (first to 25 with 2-point lead, or first to 15 in 5th set)
      const isSetComplete = checkSetComplete(newHomeScore, newAwayScore, currentSet.set_number);
      if (isSetComplete) {
        await completeSet(updatedSet);
      }

    } catch (err: any) {
      console.error('Error updating score:', err);
      setError(`Failed to update score: ${err.message}`);
    }
  };

  // Check if set is complete
  const checkSetComplete = (homeScore: number, awayScore: number, setNumber: number) => {
    const winningScore = setNumber === 5 ? 15 : 25; // 5th set goes to 15
    const minLead = 2;

    return (
      (homeScore >= winningScore && homeScore - awayScore >= minLead) ||
      (awayScore >= winningScore && awayScore - homeScore >= minLead)
    );
  };

  // Complete a set
  const completeSet = async (set: GameSet) => {
    try {
      console.log('🏐 Completing set:', set.set_number);
      console.log('Current sets before completion:', sets.map(s => ({ id: s.id, set_number: s.set_number, is_completed: s.is_completed })));

      // Mark set as completed
      const { error: setError } = await supabase
        .from('game_sets')
        .update({
          is_completed: true,
          completed_at: new Date().toISOString()
        })
        .eq('id', set.id);

      if (setError) throw setError;

      // Update local state
      const updatedSet = { ...set, is_completed: true, completed_at: new Date().toISOString() };
      const updatedSets = sets.map(s => s.id === set.id ? updatedSet : s);
      setSets(updatedSets);
      setCurrentSet(null);

      // Calculate completed sets and winners correctly
      const allCompletedSets = updatedSets.filter(s => s.is_completed);
      const completedSetsCount = allCompletedSets.length;

      console.log('Completed sets count:', completedSetsCount);
      console.log('All completed sets:', allCompletedSets.map(s => ({ set_number: s.set_number, home: s.home_score, away: s.away_score })));

      const homeSetsWon = allCompletedSets.filter(s => s.home_score > s.away_score).length;
      const awaySetsWon = allCompletedSets.filter(s => s.away_score > s.home_score).length;

      console.log('Sets won - Home:', homeSetsWon, 'Away:', awaySetsWon);

      if (homeSetsWon >= 3 || awaySetsWon >= 3) {
        // Game is complete
        console.log('🏆 Game is complete!');
        await completeGame(homeSetsWon, awaySetsWon);
      } else if (completedSetsCount < 5) {
        // Create next set - use the highest set number + 1
        const nextSetNumber = Math.max(...updatedSets.map(s => s.set_number)) + 1;
        console.log('Creating next set with number:', nextSetNumber);

        // Check if this set number already exists
        const existingSet = updatedSets.find(s => s.set_number === nextSetNumber);
        if (existingSet) {
          console.error('❌ Set number', nextSetNumber, 'already exists!');
          setError(`Set ${nextSetNumber} already exists. Please refresh the page.`);
          return;
        }

        await createNextSet(nextSetNumber);
      } else {
        console.log('🏁 All 5 sets completed');
      }

    } catch (err: any) {
      console.error('❌ Error completing set:', err);
      setError(`Failed to complete set: ${err.message}`);
    }
  };

  // Create next set
  const createNextSet = async (setNumber: number) => {
    try {
      console.log('🆕 Creating new set with number:', setNumber);

      // First check if this set number already exists
      const { data: existingSets, error: checkError } = await supabase
        .from('game_sets')
        .select('set_number')
        .eq('game_id', gameId)
        .eq('set_number', setNumber);

      if (checkError) {
        console.error('Error checking existing sets:', checkError);
        throw checkError;
      }

      if (existingSets && existingSets.length > 0) {
        console.error('❌ Set number', setNumber, 'already exists in database');
        setError(`Set ${setNumber} already exists. Refreshing game data...`);
        // Refresh the game data to get current state
        await fetchGameData();
        return;
      }

      console.log('✅ Set number', setNumber, 'is available, creating...');

      const { data: setData, error: insertError } = await supabase
        .from('game_sets')
        .insert({
          game_id: gameId,
          set_number: setNumber,
          home_score: 0,
          away_score: 0,
          is_completed: false
        })
        .select()
        .single();

      if (insertError) {
        console.error('❌ Error inserting new set:', insertError);
        if (insertError.code === '23505') { // Unique constraint violation
          setError(`Set ${setNumber} already exists. Refreshing game data...`);
          await fetchGameData();
          return;
        }
        throw insertError;
      }

      console.log('✅ New set created successfully:', setData);

      setSets(prevSets => [...prevSets, setData]);
      setCurrentSet(setData);

    } catch (err: any) {
      console.error('❌ Error creating next set:', err);
      setError(`Failed to create next set: ${err.message}`);
    }
  };

  // Complete game
  const completeGame = async (homeSetsWon: number, awaySetsWon: number) => {
    try {
      const { error: gameError } = await supabase
        .from('games')
        .update({
          status: 'completed',
          home_score: homeSetsWon,
          away_score: awaySetsWon,
          completed_at: new Date().toISOString()
        })
        .eq('id', gameId);

      if (gameError) throw gameError;

      if (game) {
        setGame({
          ...game,
          status: 'completed',
          home_score: homeSetsWon,
          away_score: awaySetsWon,
          completed_at: new Date().toISOString()
        });
      }

      setIsRecording(false);

    } catch (err: any) {
      console.error('Error completing game:', err);
      setError(`Failed to complete game: ${err.message}`);
    }
  };

  // Record a play
  const recordPlay = async (fieldX?: number, fieldY?: number) => {
    if (!currentSet || !selectedPlayType || !selectedTeam) {
      setError('Please select a play type and team');
      return;
    }

    try {
      console.log('Recording play:', {
        selectedPlayType: selectedPlayType.name,
        selectedTeam,
        selectedPlayer: selectedPlayer?.full_name,
        fieldX,
        fieldY
      });

      const playData = {
        game_id: gameId,
        set_id: currentSet.id,
        player_id: selectedPlayer?.id || null,
        play_type_id: selectedPlayType.id,
        team_id: selectedTeam === 'home' ? game?.home_team_id : game?.away_team_id,
        field_x: fieldX || null,
        field_y: fieldY || null,
        value: selectedPlayType.default_value,
        score_increment: selectedPlayType.default_score_increment || 0,
        timestamp_in_set: new Date().toISOString(),
        rotation_position: null,
        notes: null,
        comment: null,
        video_timestamp: isVideoReady ? currentVideoTime : null
      };

      const { error } = await supabase
        .from('plays')
        .insert(playData);

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      console.log('Play recorded successfully');

      // Update score based on play type score increment
      const scoreIncrement = selectedPlayType.default_score_increment || 0;
      if (scoreIncrement !== 0) {
        console.log('Updating score:', scoreIncrement);
        if (scoreIncrement > 0) {
          // Team scored a point (ace, kill, etc.)
          await updateSetScore(selectedTeam, scoreIncrement);
        } else {
          // Point goes to opponent (team error, etc.)
          const opponentTeam = selectedTeam === 'home' ? 'away' : 'home';
          await updateSetScore(opponentTeam, Math.abs(scoreIncrement));
        }
      }

      // Refresh plays
      await fetchPlays();

      // Clear selection and recording state
      setSelectedPlayer(null);
      setSelectedPlayType(null);
      setSelectedTeam(null);
      setIsRecordingPlay(false);

      console.log('Play recording completed');

    } catch (err: any) {
      console.error('Error recording play:', err);
      setError(`Failed to record play: ${err.message}`);
    }
  };

  // Handle field click for play recording/editing
  const handleFieldClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!isRecordingPlay || !selectedPlayType || !selectedTeam) return;

    // Prevent event bubbling
    event.stopPropagation();

    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;

    if (editingPlay) {
      updatePlay(x, y);
    } else {
      recordPlay(x, y);
    }
  };

  // Start play recording/editing mode
  const startPlayRecording = () => {
    if (selectedPlayType && selectedTeam) {
      setIsRecordingPlay(true);
    } else {
      setError('Please select a play type and team first');
    }
  };

  // Load saved lineups from database
  const loadLineups = async (gameData: any) => {
    if (!gameData) return;

    try {
      // Get the current set or the latest set
      const { data: setsData } = await supabase
        .from('game_sets')
        .select('*')
        .eq('game_id', gameData.id)
        .order('set_number', { ascending: false })
        .limit(1);

      const latestSet = setsData?.[0];
      if (!latestSet) return;

      // Load lineups for the latest set
      const { data: lineupsData, error } = await supabase
        .from('game_lineups')
        .select(`
          *,
          player:players(*)
        `)
        .eq('game_id', gameData.id)
        .eq('set_id', latestSet.id)
        .eq('is_active', true);

      if (error) {
        console.error('Error loading lineups:', error);
        return;
      }

      if (lineupsData && lineupsData.length > 0) {
        console.log('Loading saved lineups:', lineupsData);

        // Separate home and away lineups
        const homeLineupData: { [key: string]: Player | null } = {
          P1: null, P2: null, P3: null, P4: null, P5: null, P6: null
        };
        const awayLineupData: { [key: string]: Player | null } = {
          P1: null, P2: null, P3: null, P4: null, P5: null, P6: null
        };

        lineupsData.forEach((lineup: any) => {
          if (lineup.position_number >= 1 && lineup.position_number <= 6) {
            const position = `P${lineup.position_number}`;
            if (lineup.team_id === gameData.home_team_id) {
              homeLineupData[position] = lineup.player;
            } else if (lineup.team_id === gameData.away_team_id) {
              awayLineupData[position] = lineup.player;
            }
          }
        });

        setHomeLineup(homeLineupData);
        setAwayLineup(awayLineupData);
        console.log('Lineups loaded successfully');
      }
    } catch (err: any) {
      console.error('Error loading lineups:', err);
    }
  };

  // Save lineup to database
  const saveLineup = async (team: 'home' | 'away', position: string, player: Player | null) => {
    if (!currentSet || !game) return;

    const teamId = team === 'home' ? game.home_team_id : game.away_team_id;
    const positionNumber = parseInt(position.replace('P', ''));

    try {
      // First, deactivate any existing lineup entry for this position and set
      await supabase
        .from('game_lineups')
        .update({ is_active: false })
        .eq('game_id', game.id)
        .eq('set_id', currentSet.id)
        .eq('team_id', teamId)
        .eq('position_number', positionNumber);

      // If player is not null, create new active lineup entry
      if (player) {
        const { error } = await supabase
          .from('game_lineups')
          .insert({
            game_id: game.id,
            set_id: currentSet.id,
            team_id: teamId,
            player_id: player.id,
            position_number: positionNumber,
            is_active: true
          });

        if (error) {
          console.error('Error saving lineup:', error);
          throw error;
        }
      }

      console.log(`Lineup saved: ${team} ${position} = ${player?.full_name || 'empty'}`);
    } catch (err: any) {
      console.error('Error saving lineup:', err);
      setError(`Failed to save lineup: ${err.message}`);
    }
  };

  // Drag and drop functions
  const handleDragStart = (player: Player, team: 'home' | 'away') => {
    setDraggedPlayer(player);
    setDraggedFromTeam(team);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (position: string, team: 'home' | 'away') => {
    if (!draggedPlayer || !draggedFromTeam) return;

    if (draggedFromTeam !== team) return; // Can't drag between teams

    const lineup = team === 'home' ? homeLineup : awayLineup;
    const setLineup = team === 'home' ? setHomeLineup : setAwayLineup;

    // Remove player from current position if they're already on court
    const newLineup = { ...lineup };
    Object.keys(newLineup).forEach(pos => {
      if (newLineup[pos]?.id === draggedPlayer.id) {
        newLineup[pos] = null;
      }
    });

    // Add player to new position
    newLineup[position] = draggedPlayer;
    setLineup(newLineup);

    // Save to database
    await saveLineup(team, position, draggedPlayer);

    setDraggedPlayer(null);
    setDraggedFromTeam(null);
  };

  const removePlayerFromCourt = async (position: string, team: 'home' | 'away') => {
    const lineup = team === 'home' ? homeLineup : awayLineup;
    const setLineup = team === 'home' ? setHomeLineup : setAwayLineup;

    setLineup({
      ...lineup,
      [position]: null
    });

    // Save to database (null player removes the position)
    await saveLineup(team, position, null);
  };

  const getAvailablePlayers = (team: 'home' | 'away') => {
    const allPlayers = team === 'home' ? homePlayers : awayPlayers;
    const lineup = team === 'home' ? homeLineup : awayLineup;
    const playersOnCourt = Object.values(lineup).filter(p => p !== null).map(p => p!.id);

    return allPlayers.filter(player => !playersOnCourt.includes(player.id));
  };

  // Delete a play
  const deletePlay = async (play: Play) => {
    console.log('Delete play called for:', play);

    if (!confirm(`Are you sure you want to delete this play?\n\nPlay: ${play.play_type?.name}\nPlayer: ${play.player?.full_name || 'Team'}\nValue: ${play.value} points`)) {
      console.log('Delete cancelled by user');
      return;
    }

    try {
      console.log('Attempting to delete play with ID:', play.id);
      console.log('Current user:', await supabase.auth.getUser());

      // First, let's try to verify the play exists
      const { data: existingPlay, error: fetchError } = await supabase
        .from('plays')
        .select('*')
        .eq('id', play.id)
        .single();

      if (fetchError) {
        console.error('Error fetching play for verification:', fetchError);
        throw new Error(`Cannot verify play exists: ${fetchError.message}`);
      }

      if (!existingPlay) {
        throw new Error('Play not found in database');
      }

      console.log('Play exists, proceeding with deletion:', existingPlay);

      // Now attempt to delete the play
      const { error: deleteError, count } = await supabase
        .from('plays')
        .delete({ count: 'exact' })
        .eq('id', play.id);

      if (deleteError) {
        console.error('Supabase delete error:', deleteError);
        console.error('Delete error details:', {
          message: deleteError.message,
          details: deleteError.details,
          hint: deleteError.hint,
          code: deleteError.code
        });
        throw new Error(`Database delete failed: ${deleteError.message} (Code: ${deleteError.code})`);
      }

      console.log('Delete operation completed. Rows affected:', count);

      if (count === 0) {
        // This shouldn't happen since we verified the play exists
        throw new Error('Delete operation returned 0 rows affected, but play exists. This may be a permissions issue.');
      }

      // Only reverse score if deletion was successful
      if (play.score_increment !== 0) {
        console.log('Reversing score change for increment:', play.score_increment);
        if (play.score_increment > 0) {
          // Play gave points to the team, remove them
          const teamThatScored = play.team_id === game?.home_team_id ? 'home' : 'away';
          console.log('Removing points from team:', teamThatScored);
          await updateSetScore(teamThatScored, -play.score_increment);
        } else {
          // Play gave points to opponent, remove them from opponent
          const opponentTeam = play.team_id === game?.home_team_id ? 'away' : 'home';
          console.log('Removing points from opponent:', opponentTeam);
          await updateSetScore(opponentTeam, play.score_increment); // score_increment is negative, so this removes points
        }
      }

      console.log('Score updated, refreshing plays');

      // Refresh plays
      await fetchPlays();

      console.log('Delete play completed successfully');

      // Show success message
      setError(null); // Clear any previous errors
      alert('Play deleted successfully!');

    } catch (err: any) {
      console.error('Error deleting play:', err);
      const errorMessage = err.message || 'Unknown error occurred';
      setError(`Failed to delete play: ${errorMessage}`);
      alert(`Failed to delete play: ${errorMessage}`);
    }
  };

  // Delete entire game
  const deleteGame = async () => {
    if (!game) return;

    const confirmMessage = `Are you sure you want to delete this entire game?\n\nGame: ${homeTeam?.name || 'Home Team'} vs ${awayTeam?.name || 'Away Team'}\nScheduled: ${new Date(game.scheduled_at).toLocaleString()}\n\nThis will delete:\n- All sets\n- All plays\n- All game data\n\nThis action cannot be undone!`;

    if (!confirm(confirmMessage)) {
      return;
    }

    try {
      console.log('Deleting game:', game.id);

      // Delete in order: plays -> sets -> game
      // First delete all plays for this game
      const { error: playsError } = await supabase
        .from('plays')
        .delete()
        .eq('game_id', game.id);

      if (playsError) {
        console.error('Error deleting plays:', playsError);
        throw playsError;
      }

      // Then delete all sets for this game
      const { error: setsError } = await supabase
        .from('game_sets')
        .delete()
        .eq('game_id', game.id);

      if (setsError) {
        console.error('Error deleting sets:', setsError);
        throw setsError;
      }

      // Finally delete the game
      const { error: gameError } = await supabase
        .from('games')
        .delete()
        .eq('id', game.id);

      if (gameError) {
        console.error('Error deleting game:', gameError);
        throw gameError;
      }

      console.log('Game deleted successfully');
      alert('Game deleted successfully!');

      // Redirect to games list
      router.push('/dashboard/games');

    } catch (err: any) {
      console.error('Error deleting game:', err);
      setError(`Failed to delete game: ${err.message}`);
      alert(`Failed to delete game: ${err.message}`);
    }
  };

  // Start editing a play
  const startEditPlay = (play: Play) => {
    setEditingPlay(play);
    setSelectedTeam(play.team_id === game?.home_team_id ? 'home' : 'away');
    setSelectedPlayer(play.player || null);
    setSelectedPlayType(play.play_type || null);
  };

  // Update a play
  const updatePlay = async (fieldX?: number, fieldY?: number) => {
    if (!editingPlay || !selectedPlayType || !selectedTeam) {
      setError('Missing required information for play update');
      return;
    }

    try {
      // Calculate score difference
      const oldValue = editingPlay.value;
      const newValue = selectedPlayType.default_value;
      const scoreDifference = newValue - oldValue;

      // Update the play
      const { error } = await supabase
        .from('plays')
        .update({
          player_id: selectedPlayer?.id || null,
          play_type_id: selectedPlayType.id,
          team_id: selectedTeam === 'home' ? game?.home_team_id : game?.away_team_id,
          field_x: fieldX !== undefined ? fieldX : editingPlay.field_x,
          field_y: fieldY !== undefined ? fieldY : editingPlay.field_y,
          value: newValue,
          timestamp_in_set: new Date().toISOString()
        })
        .eq('id', editingPlay.id);

      if (error) throw error;

      // Update score if there's a difference
      if (scoreDifference !== 0) {
        if (newValue > 0) {
          // New play gives points to the team
          await updateSetScore(selectedTeam, Math.abs(scoreDifference));
        } else if (newValue < 0) {
          // New play is an error, gives points to opponent
          const opponentTeam = selectedTeam === 'home' ? 'away' : 'home';
          await updateSetScore(opponentTeam, Math.abs(scoreDifference));
        } else {
          // New play is neutral, reverse old score if needed
          if (oldValue > 0) {
            const oldTeam = selectedTeam;
            await updateSetScore(oldTeam, -Math.abs(oldValue));
          } else if (oldValue < 0) {
            const oldOpponentTeam = selectedTeam === 'home' ? 'away' : 'home';
            await updateSetScore(oldOpponentTeam, -Math.abs(oldValue));
          }
        }
      }

      // Clear editing state
      setEditingPlay(null);
      setSelectedPlayer(null);
      setSelectedPlayType(null);
      setSelectedTeam(null);
      setIsRecordingPlay(false);

      // Refresh plays
      fetchPlays();

    } catch (err: any) {
      console.error('Error updating play:', err);
      setError(`Failed to update play: ${err.message}`);
    }
  };

  // Cancel editing
  const cancelEdit = () => {
    setEditingPlay(null);
    setSelectedPlayer(null);
    setSelectedPlayType(null);
    setSelectedTeam(null);
    setIsRecordingPlay(false);
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }
  
  if (error || !game || !homeTeam || !awayTeam) {
    return (
      <div className="container mx-auto py-8">
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md">
          {error || 'Game not found'}
        </div>
        <Button 
          onClick={() => router.push('/dashboard/games')} 
          className="mt-4"
          variant="outline"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Games
        </Button>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Button 
            onClick={() => router.push('/dashboard/games')} 
            variant="ghost"
            size="sm"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div className="ml-4">
            <h1 className="text-2xl font-bold text-gray-900">
              {homeTeam.name} vs {awayTeam.name}
            </h1>
            <p className="text-gray-600">Game Recording</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            game.status === 'in_progress' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
          }`}>
            {game.status.replace('_', ' ').toUpperCase()}
          </span>
          
          {game.status === 'scheduled' && (
            <Button onClick={startGame}>
              <Play className="h-4 w-4 mr-2" />
              Start Game
            </Button>
          )}

          {game.status === 'in_progress' && !currentSet && (
            <Button onClick={continueGame} className="bg-green-600 hover:bg-green-700">
              <Play className="h-4 w-4 mr-2" />
              Continue Recording
            </Button>
          )}

          <Button
            onClick={deleteGame}
            variant="outline"
            className="text-red-600 border-red-300 hover:bg-red-50"
          >
            Delete Game
          </Button>

          <Button
            onClick={testDatabasePermissions}
            variant="outline"
            className="text-blue-600 border-blue-300 hover:bg-blue-50"
          >
            Test DB Permissions
          </Button>

          <Button
            onClick={() => {
              console.log('🔄 Manual refresh triggered');
              fetchGameData();
            }}
            variant="outline"
            className="text-green-600 border-green-300 hover:bg-green-50"
          >
            Refresh Data
          </Button>
        </div>
      </div>
      
      {/* Game Status */}
      {game.status === 'completed' && (
        <Card className="p-6 mb-6 bg-green-50 border-green-200">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-green-800 mb-2">Game Completed!</h2>
            <p className="text-green-700">
              Final Score: {game.home_score} - {game.away_score} sets
            </p>
            <p className="text-green-600 text-sm mt-1">
              Winner: {game.home_score > game.away_score ? homeTeam.name : awayTeam.name}
            </p>
          </div>
        </Card>
      )}

      {/* Game In Progress but Paused */}
      {game.status === 'in_progress' && !currentSet && !isRecording && (
        <Card className="p-6 mb-6 bg-yellow-50 border-yellow-200">
          <div className="text-center">
            <h2 className="text-xl font-bold text-yellow-800 mb-2">🏐 Game Paused</h2>
            <p className="text-yellow-700 mb-4">
              This game is in progress but recording is paused. Click "Continue Recording" to resume.
            </p>
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-800">{sets.filter(s => s.is_completed).length}</div>
                <div className="text-sm text-yellow-600">Sets Completed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-800">
                  {sets.filter(s => s.is_completed && s.home_score > s.away_score).length} - {sets.filter(s => s.is_completed && s.away_score > s.home_score).length}
                </div>
                <div className="text-sm text-yellow-600">Sets Won</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-800">{5 - sets.filter(s => s.is_completed).length}</div>
                <div className="text-sm text-yellow-600">Sets Remaining</div>
              </div>
            </div>
            <p className="text-xs text-yellow-600">
              Last activity: {sets.length > 0 && sets[sets.length - 1].updated_at ? new Date(sets[sets.length - 1].updated_at!).toLocaleString() : 'Unknown'}
            </p>
          </div>
        </Card>
      )}

      {/* Score Display */}
      {currentSet && game.status !== 'completed' && (
        <Card className="p-6 mb-6">
          <div className="text-center mb-4">
            <h2 className="text-lg font-semibold">Set {currentSet.set_number}</h2>
            <p className="text-sm text-gray-600">
              {currentSet.set_number === 5 ? 'First to 15 (2-point lead)' : 'First to 25 (2-point lead)'}
            </p>
          </div>
          
          <div className="grid grid-cols-3 gap-8 items-center">
            {/* Home Team */}
            <div className="text-center">
              <div 
                className="w-16 h-16 rounded-full mx-auto mb-2 flex items-center justify-center text-white font-bold text-xl"
                style={{ backgroundColor: homeTeam.team_color }}
              >
                {currentSet.home_score}
              </div>
              <h3 className="font-semibold">{homeTeam.name}</h3>
              {isRecording && (
                <div className="flex justify-center space-x-2 mt-2">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => updateSetScore('home', -1)}
                    disabled={currentSet.home_score === 0}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <Button 
                    size="sm"
                    onClick={() => updateSetScore('home', 1)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
            
            {/* VS */}
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-400">VS</div>
            </div>
            
            {/* Away Team */}
            <div className="text-center">
              <div 
                className="w-16 h-16 rounded-full mx-auto mb-2 flex items-center justify-center text-white font-bold text-xl"
                style={{ backgroundColor: awayTeam.team_color }}
              >
                {currentSet.away_score}
              </div>
              <h3 className="font-semibold">{awayTeam.name}</h3>
              {isRecording && (
                <div className="flex justify-center space-x-2 mt-2">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => updateSetScore('away', -1)}
                    disabled={currentSet.away_score === 0}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <Button 
                    size="sm"
                    onClick={() => updateSetScore('away', 1)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Set Controls */}
          {isRecording && currentSet && (
            <div className="text-center mt-6 pt-4 border-t border-gray-200">
              <Button
                onClick={() => completeSet(currentSet)}
                variant="outline"
                className="mr-3"
              >
                Complete Set Manually
              </Button>
              <Button
                onClick={pauseGame}
                variant="outline"
                className="mr-3 text-yellow-600 border-yellow-300 hover:bg-yellow-50"
              >
                <Pause className="h-4 w-4 mr-2" />
                Pause Recording
              </Button>
              <Button
                onClick={() => completeGame(
                  sets.filter(s => s.is_completed && s.home_score > s.away_score).length,
                  sets.filter(s => s.is_completed && s.away_score > s.home_score).length
                )}
                variant="outline"
                className="text-red-600 border-red-300 hover:bg-red-50"
              >
                End Game
              </Button>
            </div>
          )}
        </Card>
      )}



      {/* 0. Team Selection for Stats Tracking */}
      {isRecording && currentSet && (
        <Card className="p-4 mb-6 bg-blue-50 border-blue-200">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-blue-900">Stats Tracking Configuration</h3>
              <p className="text-sm text-blue-700">Choose which team(s) you want to track statistics for</p>
            </div>
            <Button
              onClick={() => setShowTeamSelection(!showTeamSelection)}
              variant="outline"
              size="sm"
              className="border-blue-300 text-blue-700 hover:bg-blue-100"
            >
              {showTeamSelection ? 'Hide Options' : 'Configure Teams'}
            </Button>
          </div>

          {showTeamSelection && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Home Team Option */}
                <div
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    selectedTeamsForStats.includes('home')
                      ? 'border-blue-500 bg-blue-100'
                      : 'border-gray-300 bg-white hover:border-blue-300'
                  }`}
                  onClick={() => {
                    if (selectedTeamsForStats.includes('home')) {
                      setSelectedTeamsForStats(selectedTeamsForStats.filter(t => t !== 'home'));
                    } else {
                      setSelectedTeamsForStats([...selectedTeamsForStats, 'home']);
                    }
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-gray-900">{homeTeam?.name || 'Home Team'}</h4>
                      <p className="text-sm text-gray-600">Track home team stats</p>
                    </div>
                    <div className={`w-5 h-5 rounded-full border-2 ${
                      selectedTeamsForStats.includes('home')
                        ? 'bg-blue-500 border-blue-500'
                        : 'border-gray-300'
                    }`}>
                      {selectedTeamsForStats.includes('home') && (
                        <div className="w-full h-full flex items-center justify-center">
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Away Team Option */}
                <div
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    selectedTeamsForStats.includes('away')
                      ? 'border-blue-500 bg-blue-100'
                      : 'border-gray-300 bg-white hover:border-blue-300'
                  }`}
                  onClick={() => {
                    if (selectedTeamsForStats.includes('away')) {
                      setSelectedTeamsForStats(selectedTeamsForStats.filter(t => t !== 'away'));
                    } else {
                      setSelectedTeamsForStats([...selectedTeamsForStats, 'away']);
                    }
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-gray-900">{awayTeam?.name || 'Away Team'}</h4>
                      <p className="text-sm text-gray-600">Track away team stats</p>
                    </div>
                    <div className={`w-5 h-5 rounded-full border-2 ${
                      selectedTeamsForStats.includes('away')
                        ? 'bg-blue-500 border-blue-500'
                        : 'border-gray-300'
                    }`}>
                      {selectedTeamsForStats.includes('away') && (
                        <div className="w-full h-full flex items-center justify-center">
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Both Teams Option */}
                <div
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    selectedTeamsForStats.length === 2
                      ? 'border-green-500 bg-green-100'
                      : 'border-gray-300 bg-white hover:border-green-300'
                  }`}
                  onClick={() => {
                    if (selectedTeamsForStats.length === 2) {
                      setSelectedTeamsForStats(['home']); // Default to home only
                    } else {
                      setSelectedTeamsForStats(['home', 'away']);
                    }
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-gray-900">Both Teams</h4>
                      <p className="text-sm text-gray-600">Track both teams' stats</p>
                    </div>
                    <div className={`w-5 h-5 rounded-full border-2 ${
                      selectedTeamsForStats.length === 2
                        ? 'bg-green-500 border-green-500'
                        : 'border-gray-300'
                    }`}>
                      {selectedTeamsForStats.length === 2 && (
                        <div className="w-full h-full flex items-center justify-center">
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white p-3 rounded border border-blue-200">
                <p className="text-sm text-blue-800">
                  <strong>Current Selection:</strong> {
                    selectedTeamsForStats.length === 0 ? 'No teams selected' :
                    selectedTeamsForStats.length === 1 ?
                      `${selectedTeamsForStats[0] === 'home' ? homeTeam?.name || 'Home Team' : awayTeam?.name || 'Away Team'} only` :
                      'Both teams'
                  }
                </p>
                {selectedTeamsForStats.length === 0 && (
                  <p className="text-xs text-red-600 mt-1">⚠️ Please select at least one team to track statistics</p>
                )}
              </div>
            </div>
          )}
        </Card>
      )}

      {/* 1. Bench - First Priority for Recording */}
      {isRecording && currentSet && selectedTeamsForStats.length > 0 && (
        <Card className="p-4 mb-6">
          <h3 className="text-lg font-semibold mb-4">Lineup & Bench</h3>

          <div className="space-y-6">
            {/* Home Team Section */}
            {selectedTeamsForStats.includes('home') && (
              <div className="max-w-2xl mx-auto">
                {/* Team Name at Top */}
                <div className="text-center mb-4">
                  <h4 className="text-lg font-semibold flex items-center justify-center">
                    <div
                      className="w-5 h-5 rounded-full mr-2"
                      style={{ backgroundColor: homeTeam?.team_color }}
                    />
                    {homeTeam?.name}
                  </h4>
                </div>

            {/* Position Boxes - Larger for better usability */}
            <div className="grid grid-cols-3 gap-3 mb-4">
              {[
                { pos: 'P4', label: 'P4' },
                { pos: 'P3', label: 'P3' },
                { pos: 'P2', label: 'P2' },
                { pos: 'P5', label: 'P5' },
                { pos: 'P6', label: 'P6' },
                { pos: 'P1', label: 'P1' }
              ].map(({ pos, label }) => (
                <div
                  key={pos}
                  className="border-2 border-dashed border-gray-300 rounded-lg p-3 text-center min-h-[80px] flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors"
                  onDragOver={handleDragOver}
                  onDrop={() => handleDrop(pos, 'home')}
                >
                  <div className="text-sm font-medium text-gray-600 mb-1">{label}</div>
                  {homeLineup[pos] ? (
                    <div
                      className="bg-blue-100 border border-blue-300 rounded px-2 py-1 cursor-pointer hover:bg-blue-200 text-sm"
                      onClick={() => removePlayerFromCourt(pos, 'home')}
                    >
                      <div className="font-bold">#{homeLineup[pos]!.jersey_number}</div>
                      <div className="text-xs truncate max-w-[60px]">
                        {homeLineup[pos]!.full_name.split(' ')[0]}
                      </div>
                    </div>
                  ) : (
                    <div className="text-gray-400 text-sm">Empty</div>
                  )}
                </div>
              ))}
            </div>

            {/* Bench - Larger grid for better visibility */}
            <div>
              <h5 className="text-base font-medium text-gray-700 mb-3">Bench</h5>
              <div className="grid grid-cols-4 gap-2">
                {getAvailablePlayers('home').map((player) => (
                  <div
                    key={player.id}
                    draggable
                    onDragStart={() => handleDragStart(player, 'home')}
                    onClick={() => setSelectedPlayer(player)}
                    className={`p-2 rounded-lg text-center text-sm border transition-colors cursor-move ${
                      selectedPlayer?.id === player.id
                        ? 'bg-blue-100 border-blue-300 ring-2 ring-blue-200'
                        : 'bg-white border-gray-200 hover:bg-gray-50'
                    }`}
                    title={player.full_name}
                  >
                    <div className="font-bold text-sm">#{player.jersey_number}</div>
                    <div className="text-xs truncate">
                      {player.full_name.split(' ')[0]}
                    </div>
                    <div className="text-xs text-gray-500 truncate">
                      {player.primary_position}
                    </div>
                  </div>
                ))}
              </div>
                </div>
              </div>
            )}

            {/* Away Team Section */}
            {selectedTeamsForStats.includes('away') && (
              <div className="max-w-2xl mx-auto">
                {/* Team Name at Top */}
                <div className="text-center mb-4">
                  <h4 className="text-lg font-semibold flex items-center justify-center">
                    <div
                      className="w-5 h-5 rounded-full mr-2"
                      style={{ backgroundColor: awayTeam?.team_color }}
                    />
                    {awayTeam?.name}
                  </h4>
                </div>

                {/* Position Boxes - Larger for better usability */}
                <div className="grid grid-cols-3 gap-3 mb-4">
                  {[
                    { pos: 'P4', label: 'P4' },
                    { pos: 'P3', label: 'P3' },
                    { pos: 'P2', label: 'P2' },
                    { pos: 'P5', label: 'P5' },
                    { pos: 'P6', label: 'P6' },
                    { pos: 'P1', label: 'P1' }
                  ].map(({ pos, label }) => (
                    <div
                      key={pos}
                      className="border-2 border-dashed border-gray-300 rounded-lg p-3 text-center min-h-[80px] flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors"
                      onDragOver={handleDragOver}
                      onDrop={() => handleDrop(pos, 'away')}
                    >
                      <div className="text-sm font-medium text-gray-600 mb-1">{label}</div>
                      {awayLineup[pos] ? (
                        <div
                          className="bg-red-100 border border-red-300 rounded px-2 py-1 cursor-pointer hover:bg-red-200 text-sm"
                          onClick={() => removePlayerFromCourt(pos, 'away')}
                        >
                          <div className="font-bold">#{awayLineup[pos]!.jersey_number}</div>
                          <div className="text-xs truncate max-w-[60px]">
                            {awayLineup[pos]!.full_name.split(' ')[0]}
                          </div>
                        </div>
                      ) : (
                        <div className="text-gray-400 text-sm">Empty</div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Bench - Larger grid for better visibility */}
                <div>
                  <h5 className="text-base font-medium text-gray-700 mb-3">Bench</h5>
                  <div className="grid grid-cols-4 gap-2">
                    {getAvailablePlayers('away').map((player) => (
                      <div
                        key={player.id}
                        draggable
                        onDragStart={() => handleDragStart(player, 'away')}
                        onClick={() => setSelectedPlayer(player)}
                        className={`p-2 rounded-lg text-center text-sm border transition-colors cursor-move ${
                          selectedPlayer?.id === player.id
                            ? 'bg-red-100 border-red-300 ring-2 ring-red-200'
                            : 'bg-white border-gray-200 hover:bg-gray-50'
                        }`}
                        title={player.full_name}
                      >
                        <div className="font-bold text-sm">#{player.jersey_number}</div>
                        <div className="text-xs truncate">
                          {player.full_name.split(' ')[0]}
                        </div>
                        <div className="text-xs text-gray-500 truncate">
                          {player.primary_position}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="mt-4 text-center text-sm text-gray-600">
            Drag players from bench to positions | Click positioned players to remove
          </div>
        </Card>
      )}

      {/* 2. Video Analysis Section */}
      {isRecording && currentSet && (
        <Card className="p-4 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Video Analysis</h3>
            <div className="flex items-center space-x-2">
              {!game?.video_url && (
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    placeholder="Enter YouTube URL..."
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    className="px-3 py-1 border border-gray-300 rounded text-sm"
                  />
                  <Button
                    onClick={() => {
                      if (videoUrl) {
                        // Update game with video URL
                        supabase
                          .from('games')
                          .update({ video_url: videoUrl })
                          .eq('id', gameId)
                          .then(() => {
                            if (game) {
                              setGame({ ...game, video_url: videoUrl });
                            }
                          });
                      }
                    }}
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Add Video
                  </Button>
                </div>
              )}
              {(game?.video_url || videoUrl) && (
                <Button
                  onClick={() => setShowVideoPlayer(!showVideoPlayer)}
                  variant="outline"
                  size="sm"
                >
                  {showVideoPlayer ? 'Hide Video' : 'Show Video'}
                </Button>
              )}
            </div>
          </div>

          {showVideoPlayer && (game?.video_url || videoUrl) && (
            <div className="grid grid-cols-12 gap-4">
              {/* Video Player */}
              <div className="col-span-8">
                <YouTubePlayer
                  videoUrl={game?.video_url || videoUrl}
                  onTimeUpdate={setCurrentVideoTime}
                  onReady={() => setIsVideoReady(true)}
                  className="w-full"
                />
              </div>

              {/* Video Controls & Info */}
              <div className="col-span-4">
                <div className="bg-gray-50 rounded-lg p-4 h-full">
                  <h4 className="text-sm font-semibold mb-3">Video Controls</h4>

                  <div className="space-y-3">
                    <div className="text-xs">
                      <div className="text-gray-600">Current Time:</div>
                      <div className="font-mono text-sm">
                        {Math.floor(currentVideoTime / 60)}:{(currentVideoTime % 60).toFixed(1).padStart(4, '0')}
                      </div>
                    </div>

                    <div className="text-xs">
                      <div className="text-gray-600 mb-1">Quick Actions:</div>
                      <div className="space-y-1">
                        <Button
                          onClick={() => {
                            const player = (window as any).youtubePlayer;
                            if (player) player.seekTo(currentVideoTime - 10);
                          }}
                          size="sm"
                          variant="outline"
                          className="w-full text-xs"
                        >
                          ⏪ -10s
                        </Button>
                        <Button
                          onClick={() => {
                            const player = (window as any).youtubePlayer;
                            if (player) player.seekTo(currentVideoTime + 10);
                          }}
                          size="sm"
                          variant="outline"
                          className="w-full text-xs"
                        >
                          ⏩ +10s
                        </Button>
                      </div>
                    </div>

                    <div className="text-xs text-gray-600 bg-blue-50 p-2 rounded">
                      💡 Tip: Video timestamp will be automatically recorded with each play
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </Card>
      )}

      {/* 3. Play Selection Widget & Court - Side by Side */}
      {isRecording && currentSet && (
        <div className="mb-6">
          {/* Side-by-side layout: Play Selection on left, Court on right */}
          <div className="grid grid-cols-12 gap-6">

            {/* Left Side: Play Selection Widget */}
            <div className="col-span-7">
              <Card className="p-4">
                <h3 className="text-lg font-semibold mb-4 text-center">Record Play</h3>

                {/* Compact two-column layout: Players on left, Play selection on right */}
                <div className="grid grid-cols-12 gap-4">

                  {/* Left Side: Player Selection */}
                  <div className="col-span-5">
                  <div className="bg-gray-50 rounded-lg p-3 h-full">
                    <h4 className="text-base font-semibold mb-3 text-center">Players</h4>

                    {/* Home Team Players - Only from Lineup */}
                    {selectedTeam === 'home' && (
                      <div>
                        {/* Team Play Option */}
                        <button
                          onClick={() => setSelectedPlayer(null)}
                          className={`w-full p-2 rounded-lg border text-center text-sm transition-colors mb-2 ${
                            selectedPlayer === null
                              ? 'bg-blue-100 border-blue-300 ring-2 ring-blue-200'
                              : 'bg-white border-gray-200 hover:bg-gray-100'
                          }`}
                        >
                          <div className="font-medium">Team Play</div>
                          <div className="text-xs text-gray-500">No specific player</div>
                        </button>

                        {/* Players from Lineup Only */}
                        <div>
                          <h5 className="text-xs font-medium text-gray-700 mb-2">Players on Court</h5>
                          <div className="space-y-1">
                            {Object.values(homeLineup).filter(player => player !== null).map((player) => (
                              <button
                                key={player!.id}
                                onClick={() => setSelectedPlayer(player)}
                                className={`w-full p-2 rounded border text-left text-xs transition-colors ${
                                  selectedPlayer?.id === player!.id
                                    ? 'bg-blue-100 border-blue-300 ring-1 ring-blue-200'
                                    : 'bg-green-50 border-green-200 hover:bg-green-100'
                                }`}
                              >
                                <div className="font-medium">#{player!.jersey_number} {player!.full_name}</div>
                                <div className="text-xs text-gray-500">{player!.primary_position}</div>
                              </button>
                            ))}
                          </div>
                          {Object.values(homeLineup).filter(player => player !== null).length === 0 && (
                            <div className="text-center text-gray-500 py-2 text-xs">
                              No players in lineup. Drag players from bench to positions.
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Away Team Players */}
                    {selectedTeam === 'away' && (
                      <div>
                        {selectedTeamsForStats.includes('away') ? (
                          // If tracking away team stats, show their lineup
                          <div>
                            {/* Team Play Option */}
                            <button
                              onClick={() => setSelectedPlayer(null)}
                              className={`w-full p-2 rounded-lg border text-center text-sm transition-colors mb-2 ${
                                selectedPlayer === null
                                  ? 'bg-red-100 border-red-300 ring-2 ring-red-200'
                                  : 'bg-white border-gray-200 hover:bg-gray-100'
                              }`}
                            >
                              <div className="font-medium">Team Play</div>
                              <div className="text-xs text-gray-500">No specific player</div>
                            </button>

                            {/* Players from Away Lineup */}
                            <div>
                              <h5 className="text-xs font-medium text-gray-700 mb-2">Players on Court</h5>
                              <div className="space-y-1">
                                {Object.values(awayLineup).filter(player => player !== null).map((player) => (
                                  <button
                                    key={player!.id}
                                    onClick={() => setSelectedPlayer(player)}
                                    className={`w-full p-2 rounded border text-left text-xs transition-colors ${
                                      selectedPlayer?.id === player!.id
                                        ? 'bg-red-100 border-red-300 ring-1 ring-red-200'
                                        : 'bg-red-50 border-red-200 hover:bg-red-100'
                                    }`}
                                  >
                                    <div className="font-medium">#{player!.jersey_number} {player!.full_name}</div>
                                    <div className="text-xs text-gray-500">{player!.primary_position}</div>
                                  </button>
                                ))}
                              </div>
                              {Object.values(awayLineup).filter(player => player !== null).length === 0 && (
                                <div className="text-center text-gray-500 py-2 text-xs">
                                  No players in lineup. Drag players from bench to positions.
                                </div>
                              )}
                            </div>
                          </div>
                        ) : (
                          // If not tracking away team stats, show generic option
                          <div>
                            <button
                              onClick={() => setSelectedPlayer(null)}
                              className="w-full p-3 rounded-lg border text-center text-sm transition-colors bg-red-50 border-red-200 hover:bg-red-100"
                            >
                              <div className="font-medium flex items-center justify-center">
                                <div
                                  className="w-3 h-3 rounded-full mr-2"
                                  style={{ backgroundColor: awayTeam?.team_color }}
                                />
                                {awayTeam?.name} Player
                              </div>
                              <div className="text-xs text-gray-500 mt-1">Generic opponent player</div>
                            </button>
                            <div className="mt-2 text-xs text-center text-gray-600 bg-gray-100 p-2 rounded">
                              All plays for {awayTeam?.name} will be recorded as team plays
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* No Team Selected */}
                    {!selectedTeam && (
                      <div className="text-center text-gray-500 py-8">
                        <div className="text-sm mb-2">Select a team first</div>
                        <div className="text-xs">Choose Home or Away team to see player options</div>
                      </div>
                    )}
                  </div>
                </div>

                  {/* Right Side: Play Selection */}
                  <div className="col-span-7">

                  {/* Team Selection */}
                  <div className="mb-3">
                    <div className="text-xs font-medium text-gray-700 mb-2">Team:</div>
                    <div className={`grid gap-2 ${selectedTeamsForStats.length === 2 ? 'grid-cols-2' : 'grid-cols-1'}`}>
                      {selectedTeamsForStats.includes('home') && (
                        <button
                          onClick={() => {
                            setSelectedTeam('home');
                            // Keep player selection from court/bench
                          }}
                          className={`p-2 rounded text-xs border transition-colors ${
                            selectedTeam === 'home'
                              ? 'bg-blue-100 border-blue-300 ring-1 ring-blue-200'
                              : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                          }`}
                        >
                          <div className="flex items-center justify-center">
                            <div
                              className="w-2 h-2 rounded-full mr-1"
                              style={{ backgroundColor: homeTeam?.team_color }}
                            />
                            <span className="font-medium">{homeTeam?.name}</span>
                          </div>
                        </button>
                      )}
                      {selectedTeamsForStats.includes('away') && (
                        <button
                          onClick={() => {
                            setSelectedTeam('away');
                            // For away team, set a generic "their player" option
                            setSelectedPlayer(null);
                          }}
                          className={`p-2 rounded text-xs border transition-colors ${
                            selectedTeam === 'away'
                              ? 'bg-blue-100 border-blue-300 ring-1 ring-blue-200'
                              : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                          }`}
                        >
                          <div className="flex items-center justify-center">
                            <div
                              className="w-2 h-2 rounded-full mr-1"
                              style={{ backgroundColor: awayTeam?.team_color }}
                            />
                            <span className="font-medium">{awayTeam?.name}</span>
                          </div>
                        </button>
                      )}
                    </div>
                    {selectedTeam === 'away' && !selectedTeamsForStats.includes('away') && (
                      <div className="mt-1 text-xs text-center text-gray-500 bg-gray-50 p-1 rounded">
                        Recording for opponent team (generic player)
                      </div>
                    )}
                  </div>

                  {/* Play Type Selection */}
                  <div className="mb-3 flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-xs font-medium text-gray-700">Play Type:</div>
                      <div className="flex items-center space-x-2 text-xs text-gray-500">
                        <div className="flex items-center">
                          <div className="w-2 h-2 rounded-full bg-green-500 mr-1"></div>
                          <span>+</span>
                        </div>
                        <div className="flex items-center">
                          <div className="w-2 h-2 rounded-full bg-red-500 mr-1"></div>
                          <span>-</span>
                        </div>
                        <div className="flex items-center">
                          <div className="w-2 h-2 rounded-full bg-gray-400 mr-1"></div>
                          <span>0</span>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                      {Object.entries(playTypes.reduce((acc, playType) => {
                        if (!acc[playType.category]) {
                          acc[playType.category] = [];
                        }
                        acc[playType.category].push(playType);
                        return acc;
                      }, {} as Record<string, PlayType[]>))
                      .map(([category, categoryPlayTypes]) => (
                        <div key={category}>
                          <div className="text-xs font-semibold text-gray-800 uppercase tracking-wide mb-1 border-b border-gray-200 pb-1">
                            {category}
                          </div>
                          <div className="grid grid-cols-1 gap-1 mb-1">
                            {categoryPlayTypes.map((playType) => (
                              <button
                                key={playType.id}
                                onClick={() => setSelectedPlayType(playType)}
                                className={`p-2 rounded border text-left text-xs transition-all ${
                                  selectedPlayType?.id === playType.id
                                    ? 'bg-blue-100 border-blue-300 ring-1 ring-blue-200 shadow-sm'
                                    : playType.default_value > 0
                                      ? 'bg-green-50 border-green-200 hover:bg-green-100 hover:border-green-300'
                                      : playType.default_value < 0
                                        ? 'bg-red-50 border-red-200 hover:bg-red-100 hover:border-red-300'
                                        : 'bg-gray-50 border-gray-200 hover:bg-gray-100 hover:border-gray-300'
                                }`}
                              >
                                <div className="flex items-center">
                                  <div className={`w-2 h-2 rounded-full mr-2 ${
                                    playType.default_value > 0
                                      ? 'bg-green-500'
                                      : playType.default_value < 0
                                        ? 'bg-red-500'
                                        : 'bg-gray-400'
                                  }`}></div>
                                  <div className="font-medium">{playType.name}</div>
                                </div>
                                <div className={`text-xs ${
                                  playType.default_value > 0 ? 'text-green-600' :
                                  playType.default_value < 0 ? 'text-red-600' : 'text-gray-500'
                                }`}>
                                  {playType.default_value > 0 && `+${playType.default_value}`}
                                  {playType.default_value < 0 && `${playType.default_value}`}
                                  {playType.default_value === 0 && '0'} pts
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Selection Status */}
                  <div className="mb-2 p-2 bg-gray-50 rounded border">
                    <div className="text-xs text-gray-600 mb-1">Current Selection:</div>
                    <div className="text-xs">
                      <div>Team: {selectedTeam ? (selectedTeam === 'home' ? homeTeam?.name : awayTeam?.name) : 'None'}</div>
                      <div>Player: {selectedPlayer ? `${selectedPlayer.full_name} (#${selectedPlayer.jersey_number})` : 'Team play'}</div>
                      <div>Play: {selectedPlayType ? selectedPlayType.name : 'None'}</div>
                    </div>
                  </div>

                  {/* Record Button Section */}
                  <div className="mt-auto pt-2 border-t border-gray-200">
                    {selectedTeam && selectedPlayType ? (
                      <div>
                        <div className="bg-blue-50 p-2 rounded mb-2">
                          <div className="text-xs font-medium text-blue-800 mb-1">Ready to Record:</div>
                          <div className="text-xs text-blue-700">
                            <div>{selectedPlayer ? `${selectedPlayer.full_name} (#${selectedPlayer.jersey_number})` : 'Team play'}</div>
                            <div className="font-medium">{selectedPlayType.name}</div>
                            {selectedPlayType.default_value !== 0 && (
                              <div className={`text-xs ${selectedPlayType.default_value > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {selectedPlayType.default_value > 0 ? '+' : ''}{selectedPlayType.default_value} point{Math.abs(selectedPlayType.default_value) !== 1 ? 's' : ''}
                              </div>
                            )}
                          </div>
                        </div>
                        <Button
                          onClick={() => {
                            if (isRecordingPlay) {
                              // If already recording, just record without position
                              recordPlay();
                            } else {
                              // Start recording mode
                              setIsRecordingPlay(true);
                              // Auto-record after 3 seconds if no court click
                              setTimeout(() => {
                                if (isRecordingPlay) {
                                  recordPlay();
                                  setIsRecordingPlay(false);
                                }
                              }, 3000);
                            }
                          }}
                          className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 text-sm"
                        >
                          {isRecordingPlay ? '🎯 RECORD NOW' : '▶️ RECORD PLAY'}
                        </Button>
                        {isRecordingPlay && (
                          <div className="text-xs text-center text-gray-600 mt-1 p-1 bg-yellow-50 rounded">
                            Click court for position or wait 3s for general play
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center p-3 bg-gray-50 rounded">
                        <div className="text-xs text-gray-600 mb-1">Select team and play type to record</div>
                        <div className="text-xs text-gray-500">
                          1. Choose team → 2. Choose play type → 3. Record
                        </div>
                      </div>
                    )}
                  </div>


                  </div>
                </div>
              </Card>
            </div>

            {/* Right Side: Court for Ball Hit Location */}
            <div className="col-span-5">
              <Card className="p-4">
                <h3 className="text-lg font-semibold mb-4 text-center">Court - Ball Hit Location</h3>

                {/* Recording Warning - Outside Court */}
                {isRecordingPlay && (
                  <div className="mb-4 p-3 bg-blue-100 border border-blue-300 rounded-lg">
                    <div className="text-center">
                      <p className="text-sm font-medium text-blue-800 mb-1">🎯 Recording Mode Active</p>
                      <div className="text-xs text-blue-700 mb-2">
                        Recording: <span className="font-semibold">{selectedPlayType?.name}</span>
                        {selectedPlayer && (
                          <span> for {selectedPlayer.full_name} (#{selectedPlayer.jersey_number})</span>
                        )}
                      </div>
                      <div className="text-xs text-blue-600 mb-2">
                        Click anywhere on the court below to record play location
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsRecordingPlay(false);
                        }}
                        className="text-xs text-blue-600 hover:text-blue-800 font-medium underline"
                      >
                        Cancel Recording
                      </button>
                    </div>
                  </div>
                )}

                <div className="flex justify-center">
                  <div
                    className={`relative bg-orange-100 border-4 border-gray-800 rounded-lg ${
                      isRecordingPlay ? 'cursor-crosshair' : ''
                    }`}
                    style={{
                      width: '300px',
                      height: '450px'
                    }}
                    onClick={handleFieldClick}
                  >
                    {/* Court outline */}
                    <div className="absolute inset-2 border-2 border-white"></div>

                    {/* Net (horizontal across middle) */}
                    <div
                      className="absolute bg-gray-800"
                      style={{
                        left: '0',
                        top: '50%',
                        width: '100%',
                        height: '4px',
                        transform: 'translateY(-50%)'
                      }}
                    />

                    {/* 3m attack lines */}
                    <div
                      className="absolute bg-white"
                      style={{
                        left: '2px',
                        top: '33.33%',
                        width: 'calc(100% - 4px)',
                        height: '2px'
                      }}
                    />
                    <div
                      className="absolute bg-white"
                      style={{
                        left: '2px',
                        top: '66.67%',
                        width: 'calc(100% - 4px)',
                        height: '2px'
                      }}
                    />

                    {/* Position labels for reference - Vertical Layout */}
                    {/* Home team positions (bottom half) */}
                    <div className="absolute text-xs font-bold text-gray-600 bg-white bg-opacity-75 rounded px-1" style={{ left: '80%', top: '85%', transform: 'translate(-50%, -50%)' }}>P1</div>
                    <div className="absolute text-xs font-bold text-gray-600 bg-white bg-opacity-75 rounded px-1" style={{ left: '50%', top: '85%', transform: 'translate(-50%, -50%)' }}>P6</div>
                    <div className="absolute text-xs font-bold text-gray-600 bg-white bg-opacity-75 rounded px-1" style={{ left: '20%', top: '85%', transform: 'translate(-50%, -50%)' }}>P5</div>
                    <div className="absolute text-xs font-bold text-gray-600 bg-white bg-opacity-75 rounded px-1" style={{ left: '80%', top: '60%', transform: 'translate(-50%, -50%)' }}>P2</div>
                    <div className="absolute text-xs font-bold text-gray-600 bg-white bg-opacity-75 rounded px-1" style={{ left: '50%', top: '60%', transform: 'translate(-50%, -50%)' }}>P3</div>
                    <div className="absolute text-xs font-bold text-gray-600 bg-white bg-opacity-75 rounded px-1" style={{ left: '20%', top: '60%', transform: 'translate(-50%, -50%)' }}>P4</div>

                    {/* Away team positions (top half) */}
                    <div className="absolute text-xs font-bold text-gray-600 bg-white bg-opacity-75 rounded px-1" style={{ left: '20%', top: '15%', transform: 'translate(-50%, -50%)' }}>P1</div>
                    <div className="absolute text-xs font-bold text-gray-600 bg-white bg-opacity-75 rounded px-1" style={{ left: '50%', top: '15%', transform: 'translate(-50%, -50%)' }}>P6</div>
                    <div className="absolute text-xs font-bold text-gray-600 bg-white bg-opacity-75 rounded px-1" style={{ left: '80%', top: '15%', transform: 'translate(-50%, -50%)' }}>P5</div>
                    <div className="absolute text-xs font-bold text-gray-600 bg-white bg-opacity-75 rounded px-1" style={{ left: '20%', top: '40%', transform: 'translate(-50%, -50%)' }}>P2</div>
                    <div className="absolute text-xs font-bold text-gray-600 bg-white bg-opacity-75 rounded px-1" style={{ left: '50%', top: '40%', transform: 'translate(-50%, -50%)' }}>P3</div>
                    <div className="absolute text-xs font-bold text-gray-600 bg-white bg-opacity-75 rounded px-1" style={{ left: '80%', top: '40%', transform: 'translate(-50%, -50%)' }}>P4</div>

                    {/* Team labels - Vertical Layout */}
                    <div className="absolute top-2 left-1/2 transform -translate-x-1/2 bg-white bg-opacity-90 px-2 py-1 rounded text-sm font-medium border">
                      {awayTeam?.name || 'Away'}
                    </div>
                    <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 bg-white bg-opacity-90 px-2 py-1 rounded text-sm font-medium border">
                      {homeTeam?.name || 'Home'}
                    </div>

                    {/* Play markers */}
                    {plays.map((play) => (
                      play.field_x && play.field_y && (
                        <div
                          key={play.id}
                          className="absolute w-4 h-4 rounded-full border-2 border-white shadow-lg z-10"
                          style={{
                            left: `${play.field_x}%`,
                            top: `${play.field_y}%`,
                            backgroundColor: (play.play_type?.default_value || 0) > 0
                              ? '#10b981'
                              : (play.play_type?.default_value || 0) < 0
                                ? '#ef4444'
                                : '#6b7280',
                            transform: 'translate(-50%, -50%)'
                          }}
                          title={`${play.player?.full_name || 'Team'} - ${play.play_type?.name}`}
                        />
                      )
                    ))}

                    {/* Visual indicator when recording - subtle overlay */}
                    {isRecordingPlay && (
                      <div className="absolute inset-0 bg-blue-500 bg-opacity-10 border-2 border-blue-400 rounded-lg z-20 pointer-events-none">
                        <div className="absolute top-2 right-2 bg-blue-600 text-white px-2 py-1 rounded text-xs font-medium">
                          Recording...
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      )}



      {/* Recent Plays with Edit/Delete */}
      {isRecording && currentSet && (
        <Card className="p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Recent Plays (Set {currentSet.set_number})</h3>
            <div className="flex items-center space-x-2">
              <Button
                onClick={() => setShowPlayHistory(!showPlayHistory)}
                variant="outline"
                className="text-sm"
              >
                {showPlayHistory ? 'Show Recent' : 'Show All'}
              </Button>
            </div>
          </div>

          {plays.length > 0 ? (
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {(showPlayHistory ? plays : plays.slice(-10)).reverse().map((play) => (
                <div
                  key={play.id}
                  className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${
                    editingPlay?.id === play.id ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                  }`}
                  onClick={() => {
                    // Jump to video timestamp if available
                    if (play.video_timestamp && isVideoReady) {
                      const player = (window as any).youtubePlayer;
                      if (player) {
                        player.seekTo(play.video_timestamp);
                      }
                    }
                  }}
                  title={play.video_timestamp ? `Click to jump to video time ${Math.floor(play.video_timestamp / 60)}:${(play.video_timestamp % 60).toFixed(0).padStart(2, '0')}` : undefined}
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{
                        backgroundColor: (play.play_type?.default_value || 0) > 0
                          ? '#10b981'
                          : (play.play_type?.default_value || 0) < 0
                            ? '#ef4444'
                            : '#6b7280'
                      }}
                    />
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-sm">
                          {play.team_id === game?.home_team_id ? homeTeam?.name : awayTeam?.name}
                        </span>
                        <span className="text-gray-400">•</span>
                        <span className="text-sm">
                          {play.player?.full_name || 'Team'}
                          {play.player && ` (#${play.player.jersey_number})`}
                        </span>
                      </div>
                      <div className="text-xs text-gray-600">
                        {play.play_type?.name}
                        {play.value > 0 && <span className="text-green-600 ml-1">(+{play.value} stat)</span>}
                        {play.value < 0 && <span className="text-red-600 ml-1">({play.value} stat)</span>}
                        {play.score_increment > 0 && <span className="text-blue-600 ml-1">(+{play.score_increment} score)</span>}
                        {play.score_increment < 0 && <span className="text-orange-600 ml-1">({play.score_increment} score)</span>}
                        {play.field_x && play.field_y && <span className="text-blue-600 ml-1">(positioned)</span>}
                        {play.video_timestamp && (
                          <span className="text-purple-600 ml-1">
                            (📹 {Math.floor(play.video_timestamp / 60)}:{(play.video_timestamp % 60).toFixed(0).padStart(2, '0')})
                          </span>
                        )}
                      </div>
                      {play.comment && (
                        <div className="text-xs text-gray-500 italic mt-1">
                          💬 {play.comment}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="text-xs text-gray-500">
                      {new Date(play.created_at).toLocaleTimeString()}
                    </div>
                    <Button
                      onClick={() => startEditPlay(play)}
                      variant="outline"
                      className="text-xs px-2 py-1 h-auto"
                      disabled={editingPlay !== null}
                    >
                      Edit
                    </Button>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        console.log('Delete button clicked for play:', play.id);
                        deletePlay(play);
                      }}
                      className="text-xs px-2 py-1 h-auto text-red-600 border border-red-300 hover:bg-red-50 rounded bg-white"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500 py-8">
              No plays recorded yet for this set
            </div>
          )}

          {editingPlay && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="text-sm text-blue-800">
                <div className="font-medium">Editing Play:</div>
                <div>{editingPlay.play_type?.name} by {editingPlay.player?.full_name || 'Team'}</div>
                <div className="text-xs mt-1">Select new play type and team above, then click "Update" to save changes.</div>
              </div>
            </div>
          )}
        </Card>
      )}

      {/* Sets History */}
      {sets.length > 0 && (
        <Card className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Sets</h3>
            <div className="text-sm text-gray-600">
              Sets Won: {homeTeam.name} {sets.filter(s => s.is_completed && s.home_score > s.away_score).length} - {sets.filter(s => s.is_completed && s.away_score > s.home_score).length} {awayTeam.name}
            </div>
          </div>
          <div className="space-y-3">
            {sets.map((set) => (
              <div key={set.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-4">
                  <span className="font-medium text-gray-900">Set {set.set_number}</span>
                  <div className="flex items-center space-x-2">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold"
                      style={{ backgroundColor: homeTeam.team_color }}
                    >
                      {set.home_score}
                    </div>
                    <span className="text-gray-400">-</span>
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold"
                      style={{ backgroundColor: awayTeam.team_color }}
                    >
                      {set.away_score}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  {set.is_completed ? (
                    <span className="text-sm font-medium text-gray-600">
                      Winner: {set.home_score > set.away_score ? homeTeam.name : awayTeam.name}
                    </span>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-blue-600">In Progress</span>
                      {game.status === 'in_progress' && !isRecording && (
                        <Button
                          onClick={() => {
                            setCurrentSet(set);
                            setIsRecording(true);
                          }}
                          size="sm"
                          className="bg-green-600 hover:bg-green-700 text-white"
                        >
                          <Play className="h-3 w-3 mr-1" />
                          Continue
                        </Button>
                      )}
                    </div>
                  )}
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    set.is_completed ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {set.is_completed ? 'Completed' : 'In Progress'}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Start Next Set Button */}
          {game.status === 'in_progress' && !currentSet && !isRecording && sets.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="text-center">
                {(() => {
                  const completedSets = sets.filter(s => s.is_completed);
                  const homeSetsWon = completedSets.filter(s => s.home_score > s.away_score).length;
                  const awaySetsWon = completedSets.filter(s => s.away_score > s.home_score).length;
                  const nextSetNumber = Math.max(...sets.map(s => s.set_number)) + 1;

                  if (homeSetsWon >= 3 || awaySetsWon >= 3) {
                    return (
                      <div className="text-center">
                        <p className="text-sm text-gray-600 mb-3">
                          Game should be completed ({homeSetsWon >= 3 ? homeTeam.name : awayTeam.name} won 3 sets)
                        </p>
                        <Button
                          onClick={() => completeGame(homeSetsWon, awaySetsWon)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          Complete Game
                        </Button>
                      </div>
                    );
                  } else if (nextSetNumber <= 5) {
                    return (
                      <div className="text-center">
                        <p className="text-sm text-gray-600 mb-3">
                          Ready to start Set {nextSetNumber}
                        </p>
                        <Button
                          onClick={continueGame}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          <Play className="h-4 w-4 mr-2" />
                          Start Set {nextSetNumber}
                        </Button>
                      </div>
                    );
                  }
                  return null;
                })()}
              </div>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}

