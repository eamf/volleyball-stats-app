'use client';

import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

// Create a direct client with no middleware
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export function SupabaseTest() {
  const [status, setStatus] = useState('Not tested');
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Test if we can access the environment variables
  const testEnvVars = () => {
    // Reset previous results
    setResult(null);
    setError(null);
    setLoading(true);
    setStatus('Testing environment variables...');
    
    try {
      if (!supabaseUrl || !supabaseKey) {
        setError('Environment variables are missing');
        setStatus('Failed');
        return false;
      }
      
      setStatus(`Environment variables found:
        URL: ${supabaseUrl.substring(0, 15)}...
        Key: ${supabaseKey.substring(0, 5)}...`);
      return true;
    } finally {
      setLoading(false);
    }
  };

  // Test if we can create a client
  const testClient = () => {
    // Reset previous results
    setResult(null);
    setError(null);
    setLoading(true);
    setStatus('Testing client creation...');
    
    try {
      const client = createClient(supabaseUrl!, supabaseKey!);
      setStatus('Client created successfully');
      return client;
    } catch (err: any) {
      setError(`Failed to create client: ${err.message}`);
      setStatus('Failed');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Test if we can connect to Supabase
  const testConnection = async () => {
    // Reset previous results
    setResult(null);
    setError(null);
    setLoading(true);
    setStatus('Testing connection...');
    
    try {
      const client = createClient(supabaseUrl!, supabaseKey!);
      
      const { data, error } = await client.from('clubs').select('count');
      
      if (error) {
        setError(`Connection error: ${error.message}`);
        setStatus('Failed');
        return;
      }
      
      setResult(data);
      setStatus('Connected successfully');
    } catch (err: any) {
      setError(`Connection exception: ${err.message}`);
      setStatus('Failed');
    } finally {
      setLoading(false);
    }
  };

  // Test if we can fetch clubs
  const testFetch = async () => {
    // Reset previous results
    setResult(null);
    setError(null);
    setLoading(true);
    setStatus('Testing fetch...');
    
    try {
      const client = createClient(supabaseUrl!, supabaseKey!);
      
      const { data, error } = await client
        .from('clubs')
        .select('*')
        .limit(5);
      
      if (error) {
        setError(`Fetch error: ${error.message}`);
        setStatus('Failed');
        return;
      }
      
      setResult(data);
      setStatus(`Fetched ${data?.length || 0} clubs`);
    } catch (err: any) {
      setError(`Fetch exception: ${err.message}`);
      setStatus('Failed');
    } finally {
      setLoading(false);
    }
  };

  // Test if we can insert a club
  const testInsert = async () => {
    // Reset previous results
    setResult(null);
    setError(null);
    setLoading(true);
    setStatus('Testing insert...');
    
    try {
      const client = createClient(supabaseUrl!, supabaseKey!);
      
      // First sign in (if you have a test user)
      // Uncomment this if you want to test with authentication
      /*
      const { error: authError } = await client.auth.signInWithPassword({
        email: 'your-test-user@example.com',
        password: 'your-test-password'
      });
      
      if (authError) {
        setError(`Auth error: ${authError.message}`);
        setStatus('Failed');
        return;
      }
      */
      
      const { data, error } = await client
        .from('clubs')
        .insert({
          name: `Test Club ${Date.now()}`,
          country: 'Test Country'
        })
        .select();
      
      if (error) {
        setError(`Insert error: ${error.message}`);
        setStatus('Failed');
        return;
      }
      
      setResult(data);
      setStatus('Inserted successfully');
    } catch (err: any) {
      setError(`Insert exception: ${err.message}`);
      setStatus('Failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 border rounded-lg bg-white shadow-sm">
      <h2 className="text-xl font-bold mb-4">Supabase Connection Test</h2>
      
      <div className="space-y-4">
        <div>
          <p className="font-medium">Status:</p>
          <pre className="bg-gray-100 p-2 rounded">
            {loading ? (
              <div className="flex items-center gap-2">
                <LoadingSpinner size="sm" /> {status}
              </div>
            ) : (
              status
            )}
          </pre>
        </div>
        
        {error && (
          <div>
            <p className="font-medium text-red-600">Error:</p>
            <pre className="bg-red-50 p-2 rounded text-red-700">{error}</pre>
          </div>
        )}
        
        {result && (
          <div>
            <p className="font-medium">Result:</p>
            <pre className="bg-gray-100 p-2 rounded overflow-auto max-h-40">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
        
        <div className="flex flex-wrap gap-2">
          <Button 
            type="button" 
            onClick={testEnvVars} 
            disabled={loading}
          >
            Test Env Vars
          </Button>
          <Button 
            type="button" 
            onClick={testClient} 
            disabled={loading}
          >
            Test Client
          </Button>
          <Button 
            type="button" 
            onClick={testConnection} 
            disabled={loading}
          >
            Test Connection
          </Button>
          <Button 
            type="button" 
            onClick={testFetch} 
            disabled={loading}
          >
            Test Fetch
          </Button>
          <Button 
            type="button" 
            onClick={testInsert} 
            disabled={loading}
          >
            Test Insert
          </Button>
        </div>
      </div>
    </div>
  );
}



