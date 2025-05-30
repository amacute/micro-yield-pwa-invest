import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export function SupabaseTest() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function testConnection() {
      try {
        // Try to fetch the current user session
        const { data, error } = await supabase.auth.getSession()
        
        if (error) {
          throw error
        }

        setStatus('success')
      } catch (err) {
        setStatus('error')
        setError(err instanceof Error ? err.message : 'Failed to connect to Supabase')
      }
    }

    testConnection()
  }, [])

  return (
    <div className="p-4 rounded-lg border">
      <h2 className="text-lg font-semibold mb-2">Supabase Connection Test</h2>
      <div className="space-y-2">
        <p>Status: 
          <span className={`ml-2 ${
            status === 'success' ? 'text-green-500' :
            status === 'error' ? 'text-red-500' :
            'text-yellow-500'
          }`}>
            {status}
          </span>
        </p>
        {error && (
          <p className="text-red-500 text-sm">{error}</p>
        )}
      </div>
    </div>
  )
} 