import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function Dashboard() {
  const [tables, setTables] = useState([]);
  const [newTableNumber, setNewTableNumber] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [dateFilter, setDateFilter] = useState('today'); // 'today', 'yesterday', or specific date (YYYY-MM-DD)
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]); // For calendar picker
  const [showCalendar, setShowCalendar] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchTables();
  }, [dateFilter]);

  const fetchTables = async () => {
    try {
      const response = await fetch(`/api/tables?date=${dateFilter}`);
      const data = await response.json();
      setTables(data);
    } catch (error) {
      console.error('Error fetching tables:', error);
    }
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const getCurrentDateLabel = () => {
    if (dateFilter === 'today') {
      return formatDate(new Date().toISOString().split('T')[0]);
    } else if (dateFilter === 'yesterday') {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      return formatDate(yesterday.toISOString().split('T')[0]);
    } else {
      return formatDate(dateFilter);
    }
  };

  const handleDateChange = (e) => {
    const date = e.target.value;
    setSelectedDate(date);
    setDateFilter(date);
    setShowCalendar(false);
  };

  const handleTodayClick = () => {
    setDateFilter('today');
    setSelectedDate(new Date().toISOString().split('T')[0]);
    setShowCalendar(false);
  };

  const createTable = async (e) => {
    e.preventDefault();
    if (!newTableNumber.trim()) return;

    setIsCreating(true);
    try {
      const response = await fetch('/api/tables', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ table_number: newTableNumber.trim() }),
      });

      if (response.ok) {
        const tableData = await response.json();
        setNewTableNumber('');
        setShowForm(false);
        setSuccessMessage(`Table "${tableData.table_number}" created successfully!`);
        
        // Ensure we're viewing today's tables to see the new table
        if (dateFilter !== 'today') {
          setDateFilter('today');
          setSelectedDate(new Date().toISOString().split('T')[0]);
          // Wait a bit for state to update, then fetch
          setTimeout(() => {
            fetchTables();
          }, 100);
        } else {
          // If already on today, refresh immediately
          await fetchTables();
        }
        
        // Clear success message after 3 seconds
        setTimeout(() => {
          setSuccessMessage('');
        }, 3000);
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to create table');
      }
    } catch (error) {
      console.error('Error creating table:', error);
      alert('Failed to create table');
    } finally {
      setIsCreating(false);
    }
  };

  const handleTableClick = (tableId) => {
    navigate(`/table/${tableId}`);
  };

  return (
    <div>
      {successMessage && (
        <div style={{
          background: 'linear-gradient(135deg, #28a745 0%, #218838 100%)',
          color: 'white',
          padding: '15px 20px',
          borderRadius: '12px',
          marginBottom: '20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: '0 4px 15px rgba(40, 167, 69, 0.3)',
          animation: 'slideDown 0.3s ease'
        }}>
          <span>✅ {successMessage}</span>
          <button
            onClick={() => setSuccessMessage('')}
            style={{
              background: 'rgba(255, 255, 255, 0.2)',
              border: 'none',
              color: 'white',
              borderRadius: '50%',
              width: '24px',
              height: '24px',
              cursor: 'pointer',
              fontSize: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            ×
          </button>
        </div>
      )}

      <div className="card" style={{ 
        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(248, 249, 250, 0.98) 100%)',
        border: '2px solid rgba(102, 126, 234, 0.2)',
        boxShadow: '0 10px 40px rgba(102, 126, 234, 0.15)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <h2 style={{ 
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              fontSize: '28px',
              marginBottom: '5px'
            }}>
              ✨ Create New Table
            </h2>
            <p style={{ color: '#666', fontSize: '14px', marginTop: '5px' }}>
              Add a new table to start billing
            </p>
          </div>
          {!showForm && (
            <button 
              className="btn btn-primary" 
              onClick={() => setShowForm(true)}
              style={{ 
                whiteSpace: 'nowrap',
                padding: '14px 28px',
                fontSize: '16px',
                boxShadow: '0 6px 20px rgba(102, 126, 234, 0.4)'
              }}
            >
              ➕ New Table
            </button>
          )}
        </div>

        {showForm && (
          <form onSubmit={createTable} style={{ 
            padding: '25px',
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 249, 250, 0.95) 100%)',
            borderRadius: '16px',
            border: '2px solid rgba(102, 126, 234, 0.2)',
            boxShadow: '0 8px 25px rgba(0, 0, 0, 0.08)',
            animation: 'slideDown 0.3s ease'
          }}>
            <div className="form-group" style={{ marginBottom: '25px' }}>
              <label style={{ 
                fontSize: '14px',
                fontWeight: '600',
                color: '#555',
                marginBottom: '12px',
                display: 'block'
              }}>
                📋 Table Number
              </label>
              <input
                type="text"
                placeholder="Enter Table Number (e.g., Table 1, Table A, etc.)"
                value={newTableNumber}
                onChange={(e) => setNewTableNumber(e.target.value)}
                disabled={isCreating}
                style={{ 
                  width: '100%', 
                  padding: '16px 20px', 
                  border: '2px solid #e0e0e0', 
                  borderRadius: '12px',
                  fontSize: '16px',
                  transition: 'all 0.3s ease',
                  background: 'white',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#667eea';
                  e.target.style.boxShadow = '0 0 0 4px rgba(102, 126, 234, 0.15), 0 4px 12px rgba(102, 126, 234, 0.2)';
                  e.target.style.transform = 'translateY(-2px)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e0e0e0';
                  e.target.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.05)';
                  e.target.style.transform = 'translateY(0)';
                }}
                autoFocus
              />
            </div>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button 
                type="button" 
                className="btn btn-secondary" 
                onClick={() => {
                  setShowForm(false);
                  setNewTableNumber('');
                }}
                disabled={isCreating}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="btn btn-primary" 
                disabled={isCreating || !newTableNumber.trim()}
                style={{ 
                  whiteSpace: 'nowrap',
                  opacity: (isCreating || !newTableNumber.trim()) ? 0.6 : 1,
                  cursor: (isCreating || !newTableNumber.trim()) ? 'not-allowed' : 'pointer'
                }}
              >
                {isCreating ? '⏳ Creating...' : '✅ Create Table'}
              </button>
            </div>
          </form>
        )}
      </div>

      <div className="card" style={{
        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(248, 249, 250, 0.98) 100%)',
        border: '2px solid rgba(102, 126, 234, 0.2)',
        boxShadow: '0 10px 40px rgba(102, 126, 234, 0.15)',
        padding: '25px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '15px' }}>
          <div>
            <h2 style={{ 
              background: 'linear-gradient(135deg, #1e40af 0%, #2563eb 50%, #3b82f6 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              fontSize: '32px',
              fontWeight: '800',
              letterSpacing: '-0.5px',
              marginBottom: '8px'
            }}>
              🍽️ Restaurant Tables
            </h2>
            <p style={{ 
              color: '#666', 
              fontSize: '14px', 
              marginTop: '5px',
              fontStyle: 'italic',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <span style={{ fontSize: '18px' }}>📅</span> {getCurrentDateLabel()}
            </p>
          </div>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ 
              display: 'flex',
              gap: '10px',
              alignItems: 'center',
              background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
              borderRadius: '25px',
              padding: '4px',
              border: '2px solid #e0e0e0'
            }}>
              <button
                onClick={handleTodayClick}
                style={{
                  padding: '8px 20px',
                  borderRadius: '20px',
                  border: 'none',
                  background: dateFilter === 'today' 
                    ? 'linear-gradient(135deg, #1e40af 0%, #2563eb 50%, #3b82f6 100%)' 
                    : 'transparent',
                  color: dateFilter === 'today' ? 'white' : '#666',
                  fontWeight: dateFilter === 'today' ? '600' : '400',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  fontSize: '14px'
                }}
              >
                📅 Today
              </button>
              <div style={{ position: 'relative' }}>
                <button
                  onClick={() => setShowCalendar(!showCalendar)}
                  style={{
                    padding: '8px 20px',
                    borderRadius: '20px',
                    border: 'none',
                    background: dateFilter !== 'today' 
                      ? 'linear-gradient(135deg, #1e40af 0%, #2563eb 50%, #3b82f6 100%)' 
                      : 'transparent',
                    color: dateFilter !== 'today' ? 'white' : '#666',
                    fontWeight: dateFilter !== 'today' ? '600' : '400',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    fontSize: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px'
                  }}
                >
                  📆 {dateFilter === 'today' ? 'Select Date' : formatDate(dateFilter)}
                </button>
                {showCalendar && (
                  <div style={{
                    position: 'absolute',
                    top: '100%',
                    right: 0,
                    marginTop: '5px',
                    background: 'white',
                    borderRadius: '12px',
                    padding: '15px',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                    zIndex: 1000,
                    border: '2px solid #e0e0e0'
                  }}>
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={handleDateChange}
                      max={new Date().toISOString().split('T')[0]}
                      style={{
                        padding: '10px',
                        borderRadius: '8px',
                        border: '2px solid #2563eb',
                        fontSize: '14px',
                        cursor: 'pointer'
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={{ 
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: 'white',
                padding: '10px 20px',
                borderRadius: '16px',
                fontSize: '15px',
                fontWeight: '700',
                boxShadow: '0 6px 20px rgba(16, 185, 129, 0.35)',
                border: '1px solid rgba(255, 255, 255, 0.2)'
              }}>
                🟢 Open: {tables.filter(t => t.status === 'open').length}
              </div>
              <div style={{ 
                background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                color: 'white',
                padding: '10px 20px',
                borderRadius: '16px',
                fontSize: '15px',
                fontWeight: '700',
                boxShadow: '0 6px 20px rgba(239, 68, 68, 0.35)',
                border: '1px solid rgba(255, 255, 255, 0.2)'
              }}>
                🔴 Closed: {tables.filter(t => t.status === 'closed').length}
              </div>
              <div style={{ 
                background: 'linear-gradient(135deg, #1e40af 0%, #2563eb 50%, #3b82f6 100%)',
                color: 'white',
                padding: '10px 20px',
                borderRadius: '16px',
                fontSize: '15px',
                fontWeight: '700',
                boxShadow: '0 6px 20px rgba(37, 99, 235, 0.35)',
                border: '1px solid rgba(255, 255, 255, 0.2)'
              }}>
                📊 Total: {tables.length}
              </div>
            </div>
          </div>
        </div>
        {tables.length === 0 ? (
          <div className="empty-state">
            <div style={{ fontSize: '64px', marginBottom: '20px' }}>🍴</div>
            <p>
              {dateFilter === 'today' 
                ? "No tables created today. Create your first table above!" 
                : "No tables were created yesterday."}
            </p>
          </div>
        ) : (
          <div className="grid">
            {tables.map((table) => (
              <div
                key={table.id}
                className={`table-card ${table.status}`}
                onClick={() => handleTableClick(table.id)}
                style={{ position: 'relative' }}
              >
                <div style={{ fontSize: '32px', marginBottom: '8px' }}>
                  {table.status === 'open' ? '🟢' : '🔴'}
                </div>
                <h3>{table.table_number}</h3>
                <p className={`status-badge status-${table.status}`} style={{ marginTop: '6px', fontSize: '11px', padding: '4px 10px' }}>
                  {table.status === 'open' ? '✓ Open' : '✗ Closed'}
                </p>
                {/* Show creation time for all tables - compact version */}
                {table.created_at && (
                  <div style={{ 
                    marginTop: '8px',
                    color: '#666',
                    fontSize: '10px',
                    fontStyle: 'italic',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '3px',
                    justifyContent: 'center'
                  }}>
                    🕐 {new Date(table.created_at).toLocaleString('en-IN', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                )}
                {table.status === 'closed' && (
                  <div style={{ 
                    marginTop: '10px', 
                    padding: '8px',
                    background: 'linear-gradient(135deg, rgba(220, 53, 69, 0.1) 0%, rgba(200, 35, 51, 0.1) 100%)',
                    borderRadius: '8px',
                    border: '1px solid rgba(220, 53, 69, 0.2)',
                    fontSize: '10px',
                    textAlign: 'left',
                    width: '100%'
                  }}>
                    {table.payment_status && (
                      <div style={{ 
                        marginBottom: '6px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        flexWrap: 'wrap'
                      }}>
                        <span className={`status-badge status-${table.payment_status}`} style={{
                          padding: '3px 8px',
                          fontSize: '10px',
                          fontWeight: '700',
                          borderRadius: '12px',
                          display: 'inline-block'
                        }}>
                          {table.payment_status === 'pending' ? '⏳ PENDING' : '✅ PAID'}
                        </span>
                        {table.payment_method && (
                          <span style={{ 
                            color: '#666',
                            fontSize: '9px',
                            fontStyle: 'italic'
                          }}>
                            ({table.payment_method})
                          </span>
                        )}
                      </div>
                    )}
                    {table.bill_closed_at && (
                      <div style={{ 
                        color: '#333',
                        fontWeight: '600',
                        marginBottom: table.customer_name || table.customer_phone ? '4px' : '0',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '10px'
                      }}>
                        🕐 {new Date(table.bill_closed_at).toLocaleString('en-IN', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    )}
                    {table.customer_name && (
                      <div style={{ 
                        color: '#333', 
                        fontWeight: '600',
                        marginBottom: table.customer_phone ? '3px' : '0',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '10px'
                      }}>
                        👤 {table.customer_name}
                      </div>
                    )}
                    {table.customer_phone && (
                      <div style={{ 
                        color: '#333',
                        fontWeight: '600',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '10px'
                      }}>
                        📞 {table.customer_phone}
                      </div>
                    )}
                  </div>
                )}
                <div style={{ 
                  marginTop: '10px', 
                  fontSize: '10px', 
                  color: '#666',
                  fontStyle: 'italic'
                }}>
                  {table.status === 'open' ? 'Click to add items' : 'Click to view items'}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;

