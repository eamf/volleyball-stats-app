'use client';

import { useEffect, useRef, useState } from 'react';
import { Play, Pause, RotateCcw, Volume2, VolumeX, Settings } from 'lucide-react';
import { Button } from '@/components/ui/Button';

// YouTube Player API types
declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

interface YouTubePlayerProps {
  videoUrl: string;
  onTimeUpdate?: (currentTime: number) => void;
  onReady?: () => void;
  className?: string;
  autoplay?: boolean;
  controls?: boolean;
}

export function YouTubePlayer({
  videoUrl,
  onTimeUpdate,
  onReady,
  className = '',
  autoplay = false,
  controls = true
}: YouTubePlayerProps) {
  const playerRef = useRef<HTMLDivElement>(null);
  const playerInstanceRef = useRef<any>(null);
  const [isReady, setIsReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(50);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);

  // Extract video ID from YouTube URL
  const getVideoId = (url: string): string | null => {
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  const videoId = getVideoId(videoUrl);

  // Load YouTube API
  useEffect(() => {
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

      window.onYouTubeIframeAPIReady = initializePlayer;
    } else {
      initializePlayer();
    }

    return () => {
      if (playerInstanceRef.current) {
        playerInstanceRef.current.destroy();
      }
    };
  }, [videoId]);

  const initializePlayer = () => {
    if (!videoId || !playerRef.current || !window.YT) {
      console.log('Cannot initialize player:', { videoId, playerRef: !!playerRef.current, YT: !!window.YT });
      return;
    }

    console.log('Initializing YouTube player for video:', videoId);

    playerInstanceRef.current = new window.YT.Player(playerRef.current, {
      videoId: videoId,
      playerVars: {
        autoplay: autoplay ? 1 : 0,
        controls: 0, // We'll use custom controls
        disablekb: 1,
        fs: 1,
        modestbranding: 1,
        rel: 0,
        showinfo: 0,
      },
      events: {
        onReady: handlePlayerReady,
        onStateChange: handleStateChange,
      },
    });
  };

  const handlePlayerReady = () => {
    setIsReady(true);
    setDuration(playerInstanceRef.current.getDuration());
    setVolume(playerInstanceRef.current.getVolume());
    onReady?.();
  };

  const handleStateChange = (event: any) => {
    const state = event.data;
    setIsPlaying(state === window.YT.PlayerState.PLAYING);
  };

  // Time update interval
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isReady && playerInstanceRef.current) {
      interval = setInterval(() => {
        if (playerInstanceRef.current) {
          const time = playerInstanceRef.current.getCurrentTime();
          const dur = playerInstanceRef.current.getDuration();
          setCurrentTime(time);
          setDuration(dur);
          onTimeUpdate?.(time);
        }
      }, 100); // Update every 100ms for smooth progress
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isReady, onTimeUpdate]);

  // Control functions
  const togglePlayPause = () => {
    if (!playerInstanceRef.current) return;
    
    if (isPlaying) {
      playerInstanceRef.current.pauseVideo();
    } else {
      playerInstanceRef.current.playVideo();
    }
  };

  const seekTo = (seconds: number) => {
    if (!playerInstanceRef.current) {
      console.log('Player not ready for seeking');
      return;
    }
    console.log('Seeking to:', seconds);
    playerInstanceRef.current.seekTo(seconds, true);
    setCurrentTime(seconds); // Update immediately for better UX
  };

  const getCurrentTime = (): number => {
    return playerInstanceRef.current ? playerInstanceRef.current.getCurrentTime() : 0;
  };

  const toggleMute = () => {
    if (!playerInstanceRef.current) return;
    
    if (isMuted) {
      playerInstanceRef.current.unMute();
      setIsMuted(false);
    } else {
      playerInstanceRef.current.mute();
      setIsMuted(true);
    }
  };

  const changeVolume = (newVolume: number) => {
    if (!playerInstanceRef.current) return;
    playerInstanceRef.current.setVolume(newVolume);
    setVolume(newVolume);
  };

  const changePlaybackRate = (rate: number) => {
    if (!playerInstanceRef.current) return;
    playerInstanceRef.current.setPlaybackRate(rate);
    setPlaybackRate(rate);
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Expose player controls for parent component
  useEffect(() => {
    if (isReady && playerInstanceRef.current) {
      (window as any).youtubePlayer = {
        getCurrentTime,
        seekTo,
        togglePlayPause,
        isPlaying,
      };
    }
  }, [isReady, isPlaying]);

  if (!videoId) {
    return (
      <div className={`bg-gray-100 rounded-lg p-8 text-center ${className}`}>
        <p className="text-gray-500">Invalid YouTube URL</p>
        <p className="text-sm text-gray-400 mt-2">Please provide a valid YouTube video URL</p>
      </div>
    );
  }

  return (
    <div className={`bg-black rounded-lg overflow-hidden ${className}`}>
      <style jsx>{`
        .range-slider {
          -webkit-appearance: none;
          appearance: none;
          height: 8px;
          border-radius: 4px;
          outline: none;
        }

        .range-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }

        .range-slider::-moz-range-thumb {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }

        .range-slider:hover::-webkit-slider-thumb {
          background: #2563eb;
        }

        .range-slider:hover::-moz-range-thumb {
          background: #2563eb;
        }

        .volume-slider {
          -webkit-appearance: none;
          appearance: none;
          height: 4px;
          border-radius: 2px;
          outline: none;
          background: #374151;
        }

        .volume-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          border: 1px solid white;
        }

        .volume-slider::-moz-range-thumb {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          border: 1px solid white;
        }
      `}</style>
      {/* Video Player */}
      <div className="relative aspect-video">
        <div ref={playerRef} className="w-full h-full" />
        
        {!isReady && (
          <div className="absolute inset-0 bg-gray-900 flex items-center justify-center">
            <div className="text-white text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
              <p>Loading video...</p>
            </div>
          </div>
        )}
      </div>

      {/* Custom Controls */}
      {controls && isReady && (
        <div className="bg-gray-900 text-white p-3">
          {/* Progress Bar */}
          <div className="mb-3">
            <div className="flex items-center space-x-2 text-xs mb-1">
              <span>{formatTime(currentTime)}</span>
              <span>/</span>
              <span>{formatTime(duration)}</span>
            </div>
            <div className="relative">
              <input
                type="range"
                min="0"
                max={duration || 100}
                value={currentTime}
                onChange={(e) => seekTo(Number(e.target.value))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer range-slider"
                style={{
                  background: duration > 0
                    ? `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${(currentTime / duration) * 100}%, #374151 ${(currentTime / duration) * 100}%, #374151 100%)`
                    : '#374151'
                }}
              />
            </div>
          </div>

          {/* Control Buttons */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Button
                onClick={togglePlayPause}
                variant="ghost"
                size="sm"
                className="text-white hover:bg-gray-700"
              >
                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </Button>
              
              <Button
                onClick={() => seekTo(currentTime - 10)}
                variant="ghost"
                size="sm"
                className="text-white hover:bg-gray-700"
                title="Rewind 10s"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>

              <div className="flex items-center space-x-1">
                <Button
                  onClick={toggleMute}
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-gray-700"
                >
                  {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                </Button>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={volume}
                  onChange={(e) => changeVolume(Number(e.target.value))}
                  className="w-16 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer volume-slider"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <select
                value={playbackRate}
                onChange={(e) => changePlaybackRate(Number(e.target.value))}
                className="bg-gray-700 text-white text-xs rounded px-2 py-1"
              >
                <option value={0.25}>0.25x</option>
                <option value={0.5}>0.5x</option>
                <option value={0.75}>0.75x</option>
                <option value={1}>1x</option>
                <option value={1.25}>1.25x</option>
                <option value={1.5}>1.5x</option>
                <option value={2}>2x</option>
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
