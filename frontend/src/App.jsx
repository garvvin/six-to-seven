import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Loading from './components/Loading';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Lazy load pages for better performance
const Home = React.lazy(() => import('./pages/Home'));
const Dashboard = React.lazy(() => import('./pages/App'));
const Team = React.lazy(() => import('./pages/Team'));
const Calendar = React.lazy(() => import('./pages/Calendar'));
const OAuthCallback = React.lazy(() => import('./pages/OAuthCallback'));
const Login = React.lazy(() => import('./pages/Login'));
const Signup = React.lazy(() => import('./pages/Signup'));

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen flex flex-col">
          <Header />
          <main className="flex-1">
            <Suspense fallback={<Loading size="lg" text="Loading page..." />}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route
                    path="/app"
                    element={
                      <ProtectedRoute>
                        <Dashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/team"
                    element={
                      <ProtectedRoute>
                        <Team />
                      </ProtectedRoute>
                    }
                  />

                  <Route
                    path="/calendar"
                    element={
                      <ProtectedRoute>
                        <Calendar />
                      </ProtectedRoute>
                    }
                  />

                  <Route
                    path="/oauth-callback"
                    element={
                      <ProtectedRoute>
                        <OAuthCallback />
                      </ProtectedRoute>
                    }
                  />
                
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
              </Routes>
            </Suspense>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
