'use client';

interface GamesManagementProps {
  onStartGame: (gameId: string) => void;
}

export function GamesManagement({ onStartGame }: GamesManagementProps) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Games Management</h1>
        <p className="text-gray-600 mt-1">Schedule and manage volleyball games</p>
      </div>
      
      <div className="bg-white p-8 rounded-lg border border-gray-200">
        <p className="text-gray-500">Games management functionality will be implemented here.</p>
        <p className="text-sm text-gray-400 mt-2">Start game function: {onStartGame.toString()}</p>
      </div>
    </div>
  );
}