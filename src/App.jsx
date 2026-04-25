import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import OrderForm from './pages/OrderForm';
import ClientDashboard from './pages/ClientDashboard';
import AdminDashboard from './pages/AdminDashboard';

function App() {
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
