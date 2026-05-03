import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import OrderForm from './pages/OrderForm';
import ClientDashboard from './pages/ClientDashboard';
import AdminDashboard from './pages/AdminDashboard';
import AdminReports from './pages/AdminReports';
import TranslatorDashboard from './pages/TranslatorDashboard';
import SplashScreen from './components/SplashScreen';

function App() {
  const [isLoaded, setIsLoaded] = useState(false);

  if (!isLoaded) {
    return <SplashScreen onFinish={() => setIsLoaded(true)} />;
  }

  return (
    <Router>
      <div className="flex flex-col" style={{ minHeight: '100vh' }}>
        <Navbar />
        <main style={{ flex: 1, padding: 'var(--spacing-xl) 0' }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/order" element={<OrderForm />} />
            <Route path="/dashboard" element={<ClientDashboard />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/reports" element={<AdminReports />} />
            <Route path="/translator" element={<TranslatorDashboard />} />
          </Routes>
        </main>
        <footer style={{ backgroundColor: 'var(--color-surface)', borderTop: '1px solid var(--color-border)', padding: 'var(--spacing-lg) 0', textAlign: 'center' }}>
          <p className="text-muted">© {new Date().getFullYear()} Trans-All In One. All rights reserved.</p>
        </footer>
      </div>
    </Router>
  );
}

export default App;
