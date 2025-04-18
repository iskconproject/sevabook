import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase/client';

export function AuthCallbackPage() {
  const navigate = useNavigate();

  useEffect(() => {
    // Handle the OAuth callback
    const handleAuthCallback = async () => {
      try {
        // Get the hash fragment from the URL
        const hashFragment = window.location.hash;
        
        // Process the hash fragment to extract the session
        if (hashFragment) {
          // The hash contains the access token and other auth info
          // Let Supabase handle this automatically
          const { error } = await supabase.auth.getSession();
          
          if (error) {
            console.error('Error processing auth callback:', error);
            navigate('/login');
            return;
          }
        }
        
        // Redirect to the home page after successful authentication
        navigate('/');
      } catch (error) {
        console.error('Error in auth callback:', error);
        navigate('/login');
      }
    };

    handleAuthCallback();
  }, [navigate]);

  return (
    <div className="flex h-screen items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">Completing authentication...</h2>
        <p>Please wait while we complete the authentication process.</p>
      </div>
    </div>
  );
}
