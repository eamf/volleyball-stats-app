'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { BarChart3, TrendingUp, Users, Target } from 'lucide-react';

export function Statistics() {
  const [selectedPeriod, setSelectedPeriod] = useState<'game' | 'set' | 'season'>('game');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Statistics & Analytics</h1>
        <div className="flex space-x-2">
          <Button
            variant={selectedPeriod === 'game' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setSelectedPeriod('game')}
          >
            Game
          </Button>
          <Button
            variant={selectedPeriod === 'set' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setSelectedPeriod('set')}
          >
            Set
          </Button>
          <Button
            variant={selectedPeriod === 'season' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setSelectedPeriod('season')}
          >
            Season
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center">
            <BarChart3 className="w-8 h-8 text-blue-600 mr-3" />
            <div>
              <div className="text-2xl font-bold text-gray-900">0</div>
              <div className="text-sm text-gray-600">Total Games</div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <TrendingUp className="w-8 h-8 text-green-600 mr-3" />
            <div>
              <div className="text-2xl font-bold text-gray-900">0%</div>
              <div className="text-sm text-gray-600">Win Rate</div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <Users className="w-8 h-8 text-purple-600 mr-3" />
            <div>
              <div className="text-2xl font-bold text-gray-900">0</div>
              <div className="text-sm text-gray-600">Active Players</div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <Target className="w-8 h-8 text-orange-600 mr-3" />
            <div>
              <div className="text-2xl font-bold text-gray-900">0</div>
              <div className="text-sm text-gray-600">Avg Points/Game</div>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Overview</h3>
          <div className="text-center py-12 text-gray-500">
            No data available yet. Start recording games to see statistics.
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Player Performance</h3>
          <div className="text-center py-12 text-gray-500">
            No player data available yet. Add players and record games to see performance metrics.
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Heat Map Analysis</h3>
        <div className="text-center py-12 text-gray-500">
          No play data available yet. Record plays during games to see heat maps.
        </div>
      </Card>
    </div>
  );
}
