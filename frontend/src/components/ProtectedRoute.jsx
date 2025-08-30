import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import Loading from './Loading';
import { Button } from './ui/button';
import { LogIn, Shield } from 'lucide-react';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  // Debug logging
  console.log('ProtectedRoute - loading:', loading, 'isAuthenticated:', isAuthenticated);

  // Show loading spinner while checking authentication
  if (loading) {
    console.log('ProtectedRoute - Showing loading spinner');
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loading size="lg" text="Checking authentication..." />
      </div>
    );
  }

  // If not authenticated, show friendly login message
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center px-6">
                     <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
             <Shield className="h-10 w-10 text-white" />
           </div>
           
           <h1 className="text-3xl font-bold text-gray-900 mb-4">
             Access Required
           </h1>
           
           <p className="text-lg text-gray-600 mb-8 leading-relaxed">
             Welcome to HealthSync AI! This is your personal health dashboard
             where you can manage medications, schedule appointments, and get
             AI-powered health insights.
           </p>
           
           <p className="text-base text-gray-500 mb-8">
             Please log in to access your personalized health dashboard and start
             your wellness journey.
           </p>
           
           <Button 
             size="lg" 
             className="w-full"
             onClick={() => (window.location.href = '/login')}
           >
            <LogIn className="h-5 w-5 mr-2" />
            Log In to Continue
          </Button>

          <p className="text-sm text-gray-500 mt-4">
            Don't have an account?{' '}
            <a
              href="/signup"
              className="text-blue-600 hover:text-blue-700 font-medium underline"
            >
              Sign up here
            </a>
          </p>
        </div>
      </div>
    );
  }

  // If authenticated, show the protected content
  return children;
};

export default ProtectedRoute;
