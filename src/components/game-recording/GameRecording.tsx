'use client';

interface GameRecordingProps {
  onFinish: () => void;
}

export function GameRecording({ onFinish }: GameRecordingProps) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Game Recording</h1>
        <p className="text-gray-600 mt-1">Record live game statistics</p>
      </div>
      
      <div className="bg-white p-8 rounded-lg border border-gray-200">
        <p className="text-gray-500">Live game recording functionality will be implemented here.</p>
        <button 
          onClick={onFinish}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Finish Recording
        </button>
      </div>
    </div>
  );
}