'use client';

import Script from 'next/script';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

// Google One Tap types
interface CredentialResponse {
  credential: string;
  select_by: string;
}

declare global {
  interface Window {
    google: {
      accounts: {
        id: {
          initialize: (config: any) => void;
          prompt: () => void;
        };
      };
    };
  }
}

const GoogleOneTap = () => {
  const supabase = createClient();
  const router = useRouter();
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [scriptError, setScriptError] = useState(false);

  // Generate nonce for security
  const generateNonce = async (): Promise<string[]> => {
    const randomValues = crypto.getRandomValues(new Uint8Array(32));
    const nonce = btoa(String.fromCharCode.apply(null, Array.from(randomValues)));
    const encoder = new TextEncoder();
    const encodedNonce = encoder.encode(nonce);
    const hashBuffer = await crypto.subtle.digest('SHA-256', encodedNonce);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashedNonce = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
    return [nonce, hashedNonce];
  };

  useEffect(() => {
    // Only initialize if script loaded successfully
    if (!scriptLoaded || scriptError) {
      return;
    }

    const initializeGoogleOneTap = async () => {
      try {
      // Wait a bit for Google script to load
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const [nonce, hashedNonce] = await generateNonce();
      
      // Check if there's already an existing session before initializing the one-tap UI
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        console.error('Error getting session', error);
      }
      if (data.session) {
        return;
      }

      const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
      
      if (!clientId) {
          console.warn('NEXT_PUBLIC_GOOGLE_CLIENT_ID is not set - Google One Tap disabled');
        return;
      }

      // Check if Google script is loaded
      if (!window.google?.accounts?.id) {
          console.warn('Google Identity Services not loaded - One Tap disabled');
        return;
      }

      /* global google */
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: async (response: CredentialResponse) => {
            try {
              // Send id token returned in response.credential to supabase
              const { data, error } = await supabase.auth.signInWithIdToken({
                provider: 'google',
                token: response.credential,
                nonce,
              });
              if (error) throw error;
              // Refresh the page to update auth state
              window.location.reload();
            } catch (error) {
              console.error('Error logging in with Google One Tap', error);
            }
          },
          nonce: hashedNonce,
          auto_select: false,
          cancel_on_tap_outside: false,
          use_fedcm_for_prompt: false,
        });
        
        window.google.accounts.id.prompt(); // Display the One Tap UI
      } catch (error) {
        console.warn('Google One Tap initialization failed (likely blocked by ad blocker):', error);
      }
    };
    
    initializeGoogleOneTap();
  }, [supabase, router, scriptLoaded, scriptError]);

  const handleScriptLoad = () => {
    setScriptLoaded(true);
    setScriptError(false);
  };

  const handleScriptError = () => {
    setScriptError(true);
    setScriptLoaded(false);
    console.warn('Google One Tap script failed to load (likely blocked by ad blocker or network restrictions)');
  };

  return (
    <>
      <Script 
        src="https://accounts.google.com/gsi/client" 
        onLoad={handleScriptLoad}
        onError={handleScriptError}
        strategy="afterInteractive"
      />
      <div id="oneTap" className="fixed top-0 right-0 z-[100]" />
    </>
  );
};

export default GoogleOneTap; 