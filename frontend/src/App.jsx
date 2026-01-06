import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import TableBilling from './components/TableBilling';
import Admin from './components/Admin';
import Reports from './components/Reports';
import Sidebar from './components/Sidebar';
import './App.css';

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

function AppContent() {
  const location = useLocation();

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <div className="container">
          <div className="header">
            <h1>🍽️ Yash Garden (यश गार्डन)</h1>
            <p style={{ color: '#64748b', fontSize: '15px', marginTop: '8px', fontWeight: '500' }}>
              Professional Point of Sale Solution for Restaurants & Hotels
            </p>
            <nav className="nav">
              <Link to="/" className={location.pathname === '/' ? 'active' : ''}>
                🏠 Dashboard
              </Link>
              <Link to="/admin" className={location.pathname === '/admin' ? 'active' : ''}>
                ⚙️ Admin
              </Link>
              <Link to="/reports" className={location.pathname === '/reports' ? 'active' : ''}>
                📊 Reports
              </Link>
            </nav>
          </div>

          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/table/:id" element={<TableBilling />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/reports" element={<Reports />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}

export default App;

