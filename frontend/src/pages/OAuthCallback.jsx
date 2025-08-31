import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import googleCalendarOAuthService from '../services/googleCalendarOAuthService';

const OAuthCallback = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('processing');
  const [message, setMessage] = useState('Processing authentication...');

  useEffect(() => {
    const handleOAuthCallback = async () => {
      try {
        const code = searchParams.get('code');
        const error = searchParams.get('error');

        console.log('OAuth Callback - Code:', code);
        console.log('OAuth Callback - Error:', error);

        if (error) {
          setStatus('error');
          setMessage(`Authentication failed: ${error}`);
          
                  // Notify parent window of error
        if (window.opener) {
          window.opener.postMessage(
            { type: 'GOOGLE_OAUTH_ERROR', error: error },
            'http://localhost:5175'
          );
        }
          return;
        }

        if (!code) {
          setStatus('error');
          setMessage('No authorization code received');
          
          // Notify parent window of error
          if (window.opener) {
                    window.opener.postMessage(
          { type: 'GOOGLE_OAUTH_ERROR', error: 'No authorization code received' },
          'http://localhost:5175'
        );
          }
          return;
        }

        // Exchange code for token
        console.log('Exchanging code for token...');
        await googleCalendarOAuthService.exchangeCodeForToken(code);
        
        setStatus('success');
        setMessage('Authentication successful! You can close this window.');

        // Notify parent window
        if (window.opener) {
          console.log('Notifying parent window of success');
                    window.opener.postMessage(
      { type: 'GOOGLE_OAUTH_SUCCESS' },
      'http://localhost:5175'
    );
        }

        // Close window after a short delay
        setTimeout(() => {
          window.close();
        }, 2000);

      } catch (error) {
        console.error('OAuth callback error:', error);
        setStatus('error');
        setMessage(`Authentication failed: ${error.message}`);

        // Notify parent window of error
        if (window.opener) {
                      window.opener.postMessage(
      { type: 'GOOGLE_OAUTH_ERROR', error: error.message },
      'http://localhost:5175'
    );
        }
      }
    };

    handleOAuthCallback();
  }, [searchParams]);

  const getStatusIcon = () => {
    switch (status) {
      case 'processing':
        return <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />;
      case 'success':
        return <CheckCircle className="h-8 w-8 text-green-500" />;
      case 'error':
        return <XCircle className="h-8 w-8 text-red-500" />;
      default:
        return <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'processing':
        return 'text-blue-600';
      case 'success':
        return 'text-green-600';
      case 'error':
        return 'text-red-600';
      default:
        return 'text-blue-600';
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            {getStatusIcon()}
          </div>
          <CardTitle className={getStatusColor()}>
            Google Calendar Authentication
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-gray-600">{message}</p>
          {status === 'success' && (
            <p className="text-sm text-gray-500 mt-2">
              This window will close automatically...
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default OAuthCallback;
