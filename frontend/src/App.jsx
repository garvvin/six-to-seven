import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Loading from './components/Loading';

// Lazy load pages for better performance
const Home = React.lazy(() => import('./pages/Home'));
const Dashboard = React.lazy(() => import('./pages/App'));
const Team = React.lazy(() => import('./pages/Team'));

function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">
          <Suspense fallback={<Loading size="lg" text="Loading page..." />}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/app" element={<Dashboard />} />
              <Route path="/team" element={<Team />} />
            </Routes>
          </Suspense>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
