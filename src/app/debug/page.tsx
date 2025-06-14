'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';

export default function DebugPage() {
  const [diagnostics, setDiagnostics] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    runDiagnostics();
  }, []);

  const runDiagnostics = async () => {
    const results: any = {};
    
    try {
      // Check environment variables
      results.envVars = {
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || 'NOT SET',
        supabaseKeyExists: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        supabaseKeyPrefix: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 20) + '...' || 'NOT SET'
      };

      // Test Supabase connection
      const supabase = createClient();
      
      // Test basic connection
      try {
        const { data: connectionTest, error: connectionError } = await supabase
          .from('clubs')
          .select('count')
          .limit(1);
        
        results.connection = {
          status: connectionError ? 'FAILED' : 'SUCCESS',
          error: connectionError?.message || null,
          data: connectionTest || null
        };
      } catch (err: any) {
        results.connection = {
          status: 'FAILED',
          error: err.message,
          data: null
        };
      }

      // Test authentication
      try {
        const { data: authData, error: authError } = await supabase.auth.getUser();
        results.auth = {
          status: authError ? 'FAILED' : 'SUCCESS',
          user: authData.user ? 'USER_LOGGED_IN' : 'NO_USER',
          error: authError?.message || null
        };
      } catch (err: any) {
        results.auth = {
          status: 'FAILED',
          error: err.message,
          user: null
        };
      }

      // Test table access
      const tables = ['clubs', 'teams', 'players', 'championships', 'games', 'play_types'];
      results.tables = {};
      
      for (const table of tables) {
        try {
          const { data, error } = await supabase
            .from(table)
            .select('*')
            .limit(1);
          
          results.tables[table] = {
            status: error ? 'FAILED' : 'SUCCESS',
            error: error?.message || null,
            hasData: data && data.length > 0
          };
        } catch (err: any) {
          results.tables[table] = {
            status: 'FAILED',
            error: err.message,
            hasData: false
          };
        }
      }

      // Check schema
      try {
        const { data: schemaData, error: schemaError } = await supabase
          .rpc('get_table_columns', { table_name: 'clubs' })
          .single();
        
        results.schema = {
          status: schemaError ? 'FAILED' : 'SUCCESS',
          error: schemaError?.message || null,
          columns: schemaData || null
        };
      } catch (err: any) {
        // Fallback: try to select from clubs to check if is_active column exists
        try {
          const { data, error } = await supabase
            .from('clubs')
            .select('is_active')
            .limit(1);
          
          results.schema = {
            status: error ? 'FAILED' : 'SUCCESS',
            error: error?.message || null,
            hasIsActiveColumn: !error
          };
        } catch (fallbackErr: any) {
          results.schema = {
            status: 'FAILED',
            error: fallbackErr.message,
            hasIsActiveColumn: false
          };
        }
      }

    } catch (err: any) {
      results.generalError = err.message;
    }

    setDiagnostics(results);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <h1 className="text-2xl font-bold mb-6">🔍 Running Diagnostics...</h1>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">🔍 Supabase Connection Diagnostics</h1>
      
      <div className="space-y-6">
        {/* Environment Variables */}
        <div className="bg-white rounded-lg border p-6">
          <h2 className="text-lg font-semibold mb-4">🔧 Environment Variables</h2>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Supabase URL:</span>
              <span className={diagnostics.envVars?.supabaseUrl === 'NOT SET' ? 'text-red-600' : 'text-green-600'}>
                {diagnostics.envVars?.supabaseUrl}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Supabase Key:</span>
              <span className={!diagnostics.envVars?.supabaseKeyExists ? 'text-red-600' : 'text-green-600'}>
                {diagnostics.envVars?.supabaseKeyPrefix}
              </span>
            </div>
          </div>
        </div>

        {/* Connection Test */}
        <div className="bg-white rounded-lg border p-6">
          <h2 className="text-lg font-semibold mb-4">🔗 Connection Test</h2>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Status:</span>
              <span className={diagnostics.connection?.status === 'SUCCESS' ? 'text-green-600' : 'text-red-600'}>
                {diagnostics.connection?.status}
              </span>
            </div>
            {diagnostics.connection?.error && (
              <div className="text-red-600 text-sm">
                Error: {diagnostics.connection.error}
              </div>
            )}
          </div>
        </div>

        {/* Authentication */}
        <div className="bg-white rounded-lg border p-6">
          <h2 className="text-lg font-semibold mb-4">🔐 Authentication</h2>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Status:</span>
              <span className={diagnostics.auth?.status === 'SUCCESS' ? 'text-green-600' : 'text-red-600'}>
                {diagnostics.auth?.status}
              </span>
            </div>
            <div className="flex justify-between">
              <span>User:</span>
              <span>{diagnostics.auth?.user || 'Unknown'}</span>
            </div>
            {diagnostics.auth?.error && (
              <div className="text-red-600 text-sm">
                Error: {diagnostics.auth.error}
              </div>
            )}
          </div>
        </div>

        {/* Schema Check */}
        <div className="bg-white rounded-lg border p-6">
          <h2 className="text-lg font-semibold mb-4">📋 Schema Check</h2>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Status:</span>
              <span className={diagnostics.schema?.status === 'SUCCESS' ? 'text-green-600' : 'text-red-600'}>
                {diagnostics.schema?.status}
              </span>
            </div>
            {diagnostics.schema?.hasIsActiveColumn !== undefined && (
              <div className="flex justify-between">
                <span>Has is_active column:</span>
                <span className={diagnostics.schema.hasIsActiveColumn ? 'text-green-600' : 'text-red-600'}>
                  {diagnostics.schema.hasIsActiveColumn ? 'YES' : 'NO'}
                </span>
              </div>
            )}
            {diagnostics.schema?.error && (
              <div className="text-red-600 text-sm">
                Error: {diagnostics.schema.error}
              </div>
            )}
          </div>
        </div>

        {/* Tables Access */}
        <div className="bg-white rounded-lg border p-6">
          <h2 className="text-lg font-semibold mb-4">📊 Tables Access</h2>
          <div className="grid grid-cols-2 gap-4">
            {Object.entries(diagnostics.tables || {}).map(([table, info]: [string, any]) => (
              <div key={table} className="border rounded p-3">
                <div className="flex justify-between items-center">
                  <span className="font-medium">{table}</span>
                  <span className={info.status === 'SUCCESS' ? 'text-green-600' : 'text-red-600'}>
                    {info.status}
                  </span>
                </div>
                {info.error && (
                  <div className="text-red-600 text-xs mt-1">
                    {info.error}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="bg-blue-50 rounded-lg border p-6">
          <h2 className="text-lg font-semibold mb-4">🚀 Recommended Actions</h2>
          <div className="space-y-2 text-sm">
            {diagnostics.envVars?.supabaseUrl === 'NOT SET' && (
              <div className="text-red-600">❌ Add NEXT_PUBLIC_SUPABASE_URL to Vercel environment variables</div>
            )}
            {!diagnostics.envVars?.supabaseKeyExists && (
              <div className="text-red-600">❌ Add NEXT_PUBLIC_SUPABASE_ANON_KEY to Vercel environment variables</div>
            )}
            {diagnostics.connection?.status === 'FAILED' && (
              <div className="text-red-600">❌ Fix Supabase connection - check URL and API key</div>
            )}
            {diagnostics.schema?.status === 'FAILED' && (
              <div className="text-red-600">❌ Run database schema fix script</div>
            )}
            {Object.values(diagnostics.tables || {}).some((table: any) => table.status === 'FAILED') && (
              <div className="text-red-600">❌ Fix table access permissions (RLS policies)</div>
            )}
          </div>
        </div>

        <button 
          onClick={runDiagnostics}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          🔄 Run Diagnostics Again
        </button>
      </div>
    </div>
  );
}
