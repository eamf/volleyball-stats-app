'use client';

import { useMemo, useState } from 'react';

type Play = {
  id: string;
  field_x: number | null;
  field_y: number | null;
  value: number;
  play_type?: {
    name: string;
    category: string;
  };
};

type HeatmapProps = {
  plays: Play[];
  width?: number;
  height?: number;
  showLegend?: boolean;
  initialColorScheme?: 'performance' | 'frequency' | 'points';
};

type HeatPoint = {
  x: number;
  y: number;
  count: number;
  totalValue: number;
  avgValue: number;
  plays: Play[];
};

export function CourtHeatmap({
  plays,
  width = 400,
  height = 600,
  showLegend = true,
  initialColorScheme = 'performance'
}: HeatmapProps) {

  // State for interactive color scheme selection
  const [colorScheme, setColorScheme] = useState<'performance' | 'frequency' | 'points'>(initialColorScheme);
  
  // Calculate heatmap data
  const heatmapData = useMemo(() => {
    // Filter plays that have position data
    const positionedPlays = plays.filter(p => p.field_x !== null && p.field_y !== null);
    
    if (positionedPlays.length === 0) {
      return [];
    }

    // Create grid for heatmap (20x30 grid for volleyball court)
    const gridSize = 20;
    const heatPoints: HeatPoint[] = [];
    
    // Group plays by grid position
    const grid = new Map<string, HeatPoint>();
    
    positionedPlays.forEach(play => {
      const gridX = Math.floor((play.field_x! / 100) * gridSize);
      const gridY = Math.floor((play.field_y! / 100) * gridSize);
      const key = `${gridX}-${gridY}`;
      
      if (!grid.has(key)) {
        grid.set(key, {
          x: gridX,
          y: gridY,
          count: 0,
          totalValue: 0,
          avgValue: 0,
          plays: []
        });
      }
      
      const point = grid.get(key)!;
      point.count++;
      point.totalValue += play.value;
      point.plays.push(play);
    });
    
    // Calculate average values
    grid.forEach(point => {
      point.avgValue = point.count > 0 ? point.totalValue / point.count : 0;
    });
    
    return Array.from(grid.values());
  }, [plays]);

  // Get color based on scheme and value
  const getColor = (point: HeatPoint) => {
    let intensity = 0;
    let isPositive = true;
    
    switch (colorScheme) {
      case 'frequency':
        const maxCount = Math.max(...heatmapData.map(p => p.count));
        intensity = maxCount > 0 ? point.count / maxCount : 0;
        break;
      case 'points':
        const maxPoints = Math.max(...heatmapData.map(p => Math.abs(p.totalValue)));
        intensity = maxPoints > 0 ? Math.abs(point.totalValue) / maxPoints : 0;
        isPositive = point.totalValue >= 0;
        break;
      case 'performance':
      default:
        const maxAvg = Math.max(...heatmapData.map(p => Math.abs(p.avgValue)));
        intensity = maxAvg > 0 ? Math.abs(point.avgValue) / maxAvg : 0;
        isPositive = point.avgValue >= 0;
        break;
    }
    
    // Clamp intensity between 0.1 and 1 for visibility
    intensity = Math.max(0.1, Math.min(1, intensity));
    
    if (colorScheme === 'frequency') {
      return `rgba(59, 130, 246, ${intensity})`; // Blue for frequency
    }
    
    if (isPositive) {
      return `rgba(34, 197, 94, ${intensity})`; // Green for positive
    } else {
      return `rgba(239, 68, 68, ${intensity})`; // Red for negative
    }
  };

  // Court dimensions (volleyball court is 18m x 9m)
  const courtWidth = width * 0.8;
  const courtHeight = height * 0.7;
  const courtX = (width - courtWidth) / 2;
  const courtY = (height - courtHeight) / 2;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Court Heatmap</h3>
        <div className="text-sm text-gray-600">
          {plays.filter(p => p.field_x !== null && p.field_y !== null).length} positioned plays
        </div>
      </div>
      
      <div className="flex flex-col items-center">
        <svg width={width} height={height} className="border border-gray-300 rounded">
          {/* Court background */}
          <rect
            x={courtX}
            y={courtY}
            width={courtWidth}
            height={courtHeight}
            fill="#f8fafc"
            stroke="#e2e8f0"
            strokeWidth="2"
          />
          
          {/* Court lines */}
          {/* Center line */}
          <line
            x1={courtX}
            y1={courtY + courtHeight / 2}
            x2={courtX + courtWidth}
            y2={courtY + courtHeight / 2}
            stroke="#64748b"
            strokeWidth="2"
          />
          
          {/* Attack lines (3m lines) */}
          <line
            x1={courtX}
            y1={courtY + courtHeight * 0.2}
            x2={courtX + courtWidth}
            y2={courtY + courtHeight * 0.2}
            stroke="#94a3b8"
            strokeWidth="1"
            strokeDasharray="5,5"
          />
          <line
            x1={courtX}
            y1={courtY + courtHeight * 0.8}
            x2={courtX + courtWidth}
            y2={courtY + courtHeight * 0.8}
            stroke="#94a3b8"
            strokeWidth="1"
            strokeDasharray="5,5"
          />
          
          {/* Net */}
          <line
            x1={courtX}
            y1={courtY + courtHeight / 2}
            x2={courtX + courtWidth}
            y2={courtY + courtHeight / 2}
            stroke="#374151"
            strokeWidth="4"
          />
          
          {/* Heatmap points */}
          {heatmapData.map((point, index) => {
            const x = courtX + (point.x / 20) * courtWidth;
            const y = courtY + (point.y / 20) * courtHeight;
            const size = Math.max(8, Math.min(24, point.count * 2));
            
            return (
              <g key={index}>
                <circle
                  cx={x}
                  cy={y}
                  r={size}
                  fill={getColor(point)}
                  opacity={0.7}
                />
                <title>
                  {`Plays: ${point.count}\nTotal Points: ${point.totalValue}\nAvg Points: ${point.avgValue.toFixed(2)}`}
                </title>
              </g>
            );
          })}
          
          {/* Court labels */}
          <text x={courtX + courtWidth / 2} y={courtY - 10} textAnchor="middle" className="text-sm font-medium fill-gray-700">
            Volleyball Court
          </text>
          <text x={courtX + courtWidth / 2} y={courtY + 20} textAnchor="middle" className="text-xs fill-gray-500">
            Team A
          </text>
          <text x={courtX + courtWidth / 2} y={courtY + courtHeight - 10} textAnchor="middle" className="text-xs fill-gray-500">
            Team B
          </text>
        </svg>
        
        {/* Legend */}
        {showLegend && (
          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-center space-x-6 text-sm">
              {colorScheme === 'frequency' ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-blue-500 rounded opacity-70"></div>
                  <span>Play Frequency (darker = more plays)</span>
                </div>
              ) : (
                <>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-green-500 rounded opacity-70"></div>
                    <span>Positive {colorScheme === 'points' ? 'Points' : 'Performance'}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-red-500 rounded opacity-70"></div>
                    <span>Negative {colorScheme === 'points' ? 'Points' : 'Performance'}</span>
                  </div>
                </>
              )}
              <div className="text-gray-600">
                Circle size = Play frequency
              </div>
            </div>
            <div className="text-center text-xs text-gray-500">
              {colorScheme === 'performance' && 'Performance = Average points per play at each position'}
              {colorScheme === 'frequency' && 'Frequency = Number of plays recorded at each position'}
              {colorScheme === 'points' && 'Points = Total points scored/lost at each position'}
            </div>
          </div>
        )}
        
        {/* Color scheme selector */}
        <div className="mt-4 flex items-center space-x-4">
          <span className="text-sm font-medium text-gray-700">Color by:</span>
          <div className="flex space-x-2">
            {[
              { key: 'performance', label: 'Performance', description: 'Average points per play' },
              { key: 'frequency', label: 'Frequency', description: 'Number of plays' },
              { key: 'points', label: 'Total Points', description: 'Sum of all points' }
            ].map(({ key, label, description }) => (
              <button
                key={key}
                onClick={() => setColorScheme(key as 'performance' | 'frequency' | 'points')}
                className={`px-3 py-2 text-xs rounded-lg border transition-all ${
                  colorScheme === key
                    ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400'
                }`}
                title={description}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
        
        {/* Statistics summary */}
        <div className="mt-4 grid grid-cols-3 gap-4 text-center text-sm">
          <div>
            <div className="font-semibold text-gray-900">{heatmapData.length}</div>
            <div className="text-gray-600">Hot Spots</div>
          </div>
          <div>
            <div className="font-semibold text-gray-900">
              {heatmapData.reduce((sum, p) => sum + p.count, 0)}
            </div>
            <div className="text-gray-600">Total Plays</div>
          </div>
          <div>
            <div className="font-semibold text-gray-900">
              {heatmapData.reduce((sum, p) => sum + p.totalValue, 0)}
            </div>
            <div className="text-gray-600">Total Points</div>
          </div>
        </div>
      </div>
    </div>
  );
}
