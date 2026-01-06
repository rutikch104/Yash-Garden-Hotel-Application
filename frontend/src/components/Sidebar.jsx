import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

function Sidebar() {
  const [openTables, setOpenTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  const fetchOpenTables = useCallback(async () => {
    try {
      const response = await fetch('/api/tables?date=today');
      const data = await response.json();
      // Filter only open tables
      const open = data.filter(table => table.status === 'open');
      // Sort by table number
      open.sort((a, b) => {
        const numA = parseInt(a.table_number.replace(/\D/g, '')) || 0;
        const numB = parseInt(b.table_number.replace(/\D/g, '')) || 0;
        return numA - numB;
      });
      setOpenTables(open);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching open tables:', error);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOpenTables();
    // Refresh every 5 seconds to keep sidebar updated
    const interval = setInterval(fetchOpenTables, 5000);
    return () => clearInterval(interval);
  }, [fetchOpenTables]);

  // Refresh when route changes
  useEffect(() => {
    fetchOpenTables();
  }, [location.pathname, fetchOpenTables]);

  const handleTableClick = (tableId) => {
    navigate(`/table/${tableId}`);
  };

  // Check if current route is for a specific table
  const currentTableId = location.pathname.startsWith('/table/') 
    ? parseInt(location.pathname.split('/')[2]) 
    : null;

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h3>🟢 Open Tables</h3>
        <div className="sidebar-count">{openTables.length}</div>
      </div>
      
      <div className="sidebar-content">
        {loading ? (
          <div className="sidebar-loading">
            <div className="loading">⏳ Loading...</div>
          </div>
        ) : openTables.length === 0 ? (
          <div className="sidebar-empty">
            <div style={{ fontSize: '24px', marginBottom: '8px' }}>🍽️</div>
            <p style={{ fontSize: '13px' }}>No open tables</p>
          </div>
        ) : (
          <div className="sidebar-tables">
            {openTables.map((table) => {
              const isActive = currentTableId === table.id;
              return (
                <div
                  key={table.id}
                  className={`sidebar-table-card ${isActive ? 'active' : ''}`}
                  onClick={() => handleTableClick(table.id)}
                >
                  <div className="sidebar-table-icon">🟢</div>
                  <div className="sidebar-table-info">
                    <div className="sidebar-table-name">{table.table_number}</div>
                    <div className="sidebar-table-status">Open</div>
                  </div>
                  <div className="sidebar-table-arrow">→</div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      
      <div className="sidebar-footer">
        <button 
          className="sidebar-refresh-btn"
          onClick={fetchOpenTables}
          title="Refresh tables"
        >
          🔄 Refresh
        </button>
      </div>
    </div>
  );
}

export default Sidebar;

