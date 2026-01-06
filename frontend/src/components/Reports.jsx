import { useState, useEffect } from 'react';

function Reports() {
  const [todayBills, setTodayBills] = useState([]);
  const [selectedDateBills, setSelectedDateBills] = useState([]);
  const [pendingBills, setPendingBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('today');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedBill, setSelectedBill] = useState(null);
  const [showItemsModal, setShowItemsModal] = useState(false);

  useEffect(() => {
    fetchReports();
  }, [activeTab, selectedDate]);

  const fetchReports = async () => {
    setLoading(true);
    try {
      if (activeTab === 'today') {
        const todayRes = await fetch('/api/bills/today');
        const todayData = await todayRes.json();
        setTodayBills(todayData);
      } else if (activeTab === 'pending') {
        const pendingRes = await fetch('/api/bills/pending');
        const pendingData = await pendingRes.json();
        setPendingBills(pendingData);
      } else {
        // Fetch bills for selected date
        const dateRes = await fetch(`/api/bills?date=${selectedDate}`);
        const dateData = await dateRes.json();
        setSelectedDateBills(dateData);
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDateDisplay = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const calculateTotal = (bills) => {
    if (!bills || !Array.isArray(bills)) return 0;
    return bills.reduce((sum, bill) => {
      const amount = typeof bill.total_amount === 'string' ? parseFloat(bill.total_amount) : bill.total_amount;
      return sum + (amount || 0);
    }, 0);
  };

  const calculatePaidTotal = (bills) => {
    if (!bills || !Array.isArray(bills)) return 0;
    return bills
      .filter(bill => bill.payment_status === 'paid')
      .reduce((sum, bill) => {
        const amount = typeof bill.total_amount === 'string' ? parseFloat(bill.total_amount) : bill.total_amount;
        return sum + (amount || 0);
      }, 0);
  };

  const calculatePendingTotal = (bills) => {
    if (!bills || !Array.isArray(bills)) return 0;
    return bills
      .filter(bill => bill.payment_status === 'pending')
      .reduce((sum, bill) => {
        const amount = typeof bill.total_amount === 'string' ? parseFloat(bill.total_amount) : bill.total_amount;
        return sum + (amount || 0);
      }, 0);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const updateBillPaymentStatus = async (billId, paymentStatus, paymentMethod = 'cash') => {
    try {
      const response = await fetch(`/api/bills/${billId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          payment_status: paymentStatus,
          payment_method: paymentMethod
        }),
      });

      if (response.ok) {
        // Refresh the reports after update
        await fetchReports();
        return true;
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to update payment status');
        return false;
      }
    } catch (error) {
      console.error('Error updating payment status:', error);
      alert('Failed to update payment status: ' + (error.message || 'Unknown error'));
      return false;
    }
  };

  const handleMarkAsPaid = async (bill) => {
    if (!window.confirm(`Mark bill #${bill.id} (Table: ${bill.table_number}) as PAID?\n\nAmount: ₹${typeof bill.total_amount === 'string' ? parseFloat(bill.total_amount).toFixed(2) : (bill.total_amount || 0).toFixed(2)}`)) {
      return;
    }

    const paymentMethod = bill.payment_method || 'cash';
    const success = await updateBillPaymentStatus(bill.id, 'paid', paymentMethod);
    
    if (success) {
      alert('Bill marked as paid successfully!');
    }
  };

  const printSingleBill = (bill) => {
    const printWindow = window.open('', '_blank');
    
    const itemsList = bill.items && Array.isArray(bill.items) && bill.items.length > 0
      ? bill.items.map((item, idx) => `
        <tr>
          <td style="word-break: break-word;">${item.item_name || 'Unknown'}</td>
          <td style="text-align: center;">${item.portion ? item.portion.toUpperCase() : 'FULL'}</td>
          <td style="text-align: center;">${item.quantity || 1}</td>
          <td style="text-align: right;">₹${typeof item.price === 'string' ? parseFloat(item.price).toFixed(2) : (item.price || 0).toFixed(2)}</td>
        </tr>
      `).join('')
      : '<tr><td colspan="4" style="text-align: center; color: #999; font-style: italic;">No items</td></tr>';
    
    const billContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Bill #${bill.id} - ${bill.table_number}</title>
          <style>
            @media print {
              body { margin: 0; padding: 0; }
              .no-print { display: none; }
              @page { margin: 0; size: 80mm auto; }
            }
            body {
              font-family: 'Courier New', monospace;
              max-width: 72mm;
              width: 72mm;
              margin: 0 auto;
              padding: 4mm;
              font-size: 11px;
            }
            .header {
              text-align: center;
              border-bottom: 1px solid #000;
              padding-bottom: 4px;
              margin-bottom: 6px;
            }
            .header h1 {
              margin: 0;
              color: #000;
              font-size: 16px;
              font-weight: bold;
            }
            .bill-info {
              margin-bottom: 6px;
              font-size: 10px;
              line-height: 1.3;
            }
            .bill-info p {
              margin: 1px 0;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin: 4px 0;
              font-size: 10px;
            }
            th, td {
              padding: 2px 3px;
              text-align: left;
              border-bottom: 1px dotted #999;
            }
            th {
              background: #000;
              color: #fff;
              font-size: 9px;
              font-weight: bold;
              padding: 3px 3px;
            }
            td {
              font-size: 10px;
              word-wrap: break-word;
            }
            .total {
              text-align: right;
              font-size: 16px;
              font-weight: bold;
              margin-top: 6px;
              padding-top: 6px;
              border-top: 2px solid #000;
            }
            .footer {
              text-align: center;
              margin-top: 6px;
              padding-top: 6px;
              border-top: 1px dotted #999;
              color: #000;
              font-size: 9px;
            }
            button {
              background: linear-gradient(135deg, #1e40af 0%, #2563eb 50%, #3b82f6 100%);
              color: white;
              border: none;
              padding: 8px 16px;
              border-radius: 4px;
              cursor: pointer;
              margin: 10px 5px;
              font-size: 12px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>YASH GARDEN</h1>
            <p style="margin-top: 2px; font-size: 9px; line-height: 1.2;">
              Gurgawale Rd, Chopda, Jalgaon - 425107<br/>
              Ph: +91 7038603339 | +91 9422103339
            </p>
            <p style="margin-top: 2px; font-size: 10px; font-weight: bold;">BILL RECEIPT</p>
          </div>
          <div class="bill-info">
            <p><strong>Bill:</strong> #${bill.id} | <strong>Table:</strong> ${bill.table_number}</p>
            <p><strong>Date:</strong> ${formatDate(bill.created_at)}</p>
            ${bill.customer_name ? `<p><strong>Customer:</strong> ${bill.customer_name}</p>` : ''}
            ${bill.customer_phone ? `<p><strong>Phone:</strong> ${bill.customer_phone}</p>` : ''}
            <p><strong>Status:</strong> ${bill.payment_status.toUpperCase()} | <strong>Pay:</strong> ${bill.payment_method ? bill.payment_method.toUpperCase() : 'CASH'}</p>
          </div>
          <table>
            <thead>
              <tr>
                <th style="width: 45%;">Item</th>
                <th style="width: 12%; text-align: center;">P</th>
                <th style="width: 13%; text-align: center;">Qty</th>
                <th style="width: 30%; text-align: right;">Price</th>
              </tr>
            </thead>
            <tbody>
              ${itemsList}
            </tbody>
          </table>
          <div class="total">
            Total: ₹${typeof bill.total_amount === 'string' ? parseFloat(bill.total_amount).toFixed(2) : (bill.total_amount || 0).toFixed(2)}
          </div>
          <div class="footer">
            <p>Thank you for your visit!</p>
          </div>
        </body>
      </html>
    `;
    
    printWindow.document.write(billContent);
    printWindow.document.close();
    setTimeout(() => {
      printWindow.print();
    }, 250);
  };

  const printAllBills = (bills) => {
    const printWindow = window.open('', '_blank');
    const pendingCount = bills.filter(b => b.payment_status === 'pending').length;
    const totalAmount = calculateTotal(bills);
    
    const billsContent = bills.map((bill, index) => {
      const itemsList = bill.items && Array.isArray(bill.items) && bill.items.length > 0
        ? bill.items.map((item, idx) => `
          <tr>
            <td>${item.item_name || 'Unknown'} (${item.item_id || 'N/A'})</td>
            <td>${item.portion ? item.portion.toUpperCase() : 'FULL'}</td>
            <td>${item.quantity || 1}</td>
            <td>₹${typeof item.price === 'string' ? parseFloat(item.price).toFixed(2) : (item.price || 0).toFixed(2)}</td>
          </tr>
        `).join('')
        : '<tr><td colspan="4" style="text-align: center; color: #999; font-style: italic;">No items</td></tr>';
      
      return `
        <div style="page-break-after: always; margin-bottom: 40px; padding: 20px; border: 2px solid #ddd; border-radius: 8px;">
          <div style="text-align: center; margin-bottom: 20px; border-bottom: 2px solid #333; padding-bottom: 15px;">
            <h1 style="margin: 0; color: #333;">🌿 Yash Garden</h1>
            <p style="margin: 5px 0; color: #666;">Bill Receipt</p>
          </div>
          <div style="margin-bottom: 20px;">
            <p><strong>Bill #${bill.id}</strong></p>
            <p><strong>Table:</strong> ${bill.table_number}</p>
            <p><strong>Date:</strong> ${formatDate(bill.created_at)}</p>
            ${bill.customer_name ? `<p><strong>Customer:</strong> ${bill.customer_name}</p>` : ''}
            ${bill.customer_phone ? `<p><strong>Phone:</strong> ${bill.customer_phone}</p>` : ''}
            <p><strong>Payment Status:</strong> <span style="color: ${bill.payment_status === 'paid' ? '#28a745' : '#ff9800'}; font-weight: bold;">${bill.payment_status.toUpperCase()}</span></p>
            <p><strong>Payment Method:</strong> ${bill.payment_method.toUpperCase()}</p>
          </div>
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <thead>
              <tr style="background: linear-gradient(135deg, #1e40af 0%, #2563eb 50%, #3b82f6 100%); color: white;">
                <th style="padding: 10px; text-align: left;">Item</th>
                <th style="padding: 10px; text-align: center;">Portion</th>
                <th style="padding: 10px; text-align: center;">Qty</th>
                <th style="padding: 10px; text-align: right;">Price</th>
              </tr>
            </thead>
            <tbody>
              ${itemsList}
            </tbody>
          </table>
          <div style="text-align: right; margin-top: 20px; padding-top: 15px; border-top: 2px solid #333;">
            <h2 style="margin: 0; color: #2563eb; font-size: 28px;">Total: ₹${typeof bill.total_amount === 'string' ? parseFloat(bill.total_amount).toFixed(2) : (bill.total_amount || 0).toFixed(2)}</h2>
          </div>
        </div>
      `;
    }).join('');

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Today's Bills - Yash Garden</title>
          <style>
            @media print {
              body { margin: 0; padding: 10px; }
              .no-print { display: none; }
            }
            body {
              font-family: Arial, sans-serif;
              margin: 0;
              padding: 20px;
              background: #f5f5f5;
            }
            .summary {
              background: white;
              padding: 20px;
              border-radius: 8px;
              margin-bottom: 20px;
              border: 2px solid #2563eb;
            }
            table {
              width: 100%;
              border-collapse: collapse;
            }
            th, td {
              padding: 10px;
              border: 1px solid #ddd;
            }
            th {
              background: linear-gradient(135deg, #1e40af 0%, #2563eb 50%, #3b82f6 100%);
              color: white;
            }
          </style>
        </head>
        <body>
          <div class="summary no-print" style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #2563eb; margin-bottom: 10px;">🍽️ Restaurant Billing System</h1>
            <h2 style="color: #333; margin-bottom: 15px;">Today's Bills Summary</h2>
            <div style="display: flex; justify-content: center; gap: 30px; flex-wrap: wrap;">
              <div>
                <strong style="color: #666;">Total Bills:</strong>
                <span style="font-size: 24px; color: #2563eb; font-weight: bold; margin-left: 10px;">${bills.length}</span>
              </div>
              <div>
                <strong style="color: #666;">Pending:</strong>
                <span style="font-size: 24px; color: #ff9800; font-weight: bold; margin-left: 10px;">${pendingCount}</span>
              </div>
              <div>
                <strong style="color: #666;">Total Amount:</strong>
                <span style="font-size: 24px; color: #2563eb; font-weight: bold; margin-left: 10px;">₹${totalAmount.toFixed(2)}</span>
              </div>
            </div>
            <p style="color: #666; margin-top: 15px;">Date: ${new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
          ${billsContent}
        </body>
      </html>
    `);
    printWindow.document.close();
    setTimeout(() => {
      printWindow.print();
    }, 250);
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '400px',
        fontSize: '20px',
        color: '#2563eb',
        fontWeight: '600'
      }}>
        <div className="loading">⏳ Loading reports...</div>
      </div>
    );
  }

  return (
    <div>
      <h2 style={{ 
        background: 'linear-gradient(135deg, #1e40af 0%, #2563eb 50%, #3b82f6 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
        fontSize: '32px',
        fontWeight: '800',
        letterSpacing: '-0.5px',
        marginBottom: '25px'
      }}>
        📊 End-of-Day Reports
      </h2>

      <div style={{ display: 'flex', gap: '15px', marginBottom: '25px', flexWrap: 'wrap', alignItems: 'center' }}>
        <button
          className={`btn ${activeTab === 'today' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => {
            setActiveTab('today');
            setShowCalendar(false);
          }}
          style={{ flex: 1, minWidth: '180px' }}
        >
          📅 Today's Bills ({todayBills.length})
        </button>
        <button
          className={`btn ${activeTab === 'pending' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => {
            setActiveTab('pending');
            setShowCalendar(false);
          }}
          style={{ 
            flex: 1, 
            minWidth: '180px',
            background: activeTab === 'pending' 
              ? 'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)' 
              : 'linear-gradient(135deg, #6c757d 0%, #5a6268 100%)',
            border: 'none',
            color: 'white',
            boxShadow: activeTab === 'pending' 
              ? '0 6px 20px rgba(255, 152, 0, 0.4)' 
              : '0 4px 15px rgba(0, 0, 0, 0.1)'
          }}
          onMouseEnter={(e) => {
            if (activeTab !== 'pending') {
              e.target.style.background = 'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)';
              e.target.style.boxShadow = '0 6px 20px rgba(255, 152, 0, 0.3)';
            }
          }}
          onMouseLeave={(e) => {
            if (activeTab !== 'pending') {
              e.target.style.background = 'linear-gradient(135deg, #6c757d 0%, #5a6268 100%)';
              e.target.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.1)';
            }
          }}
        >
          ⏳ Pending Bills ({pendingBills.length})
        </button>
        <div style={{ position: 'relative', flex: 1, minWidth: '180px' }}>
          <button
            className={`btn ${activeTab === 'date' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => {
              setActiveTab('date');
              setShowCalendar(!showCalendar);
            }}
            style={{ width: '100%' }}
          >
            📆 {activeTab === 'date' ? formatDateDisplay(selectedDate) : 'Select Date'}
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
                onChange={(e) => {
                  setSelectedDate(e.target.value);
                  setActiveTab('date');
                  setShowCalendar(false);
                }}
                max={new Date().toISOString().split('T')[0]}
                style={{
                  padding: '10px',
                  borderRadius: '8px',
                  border: '2px solid #2563eb',
                  fontSize: '14px',
                  cursor: 'pointer',
                  width: '100%'
                }}
              />
            </div>
          )}
        </div>
      </div>

      {activeTab === 'today' && (
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '15px' }}>
            <div>
              <h3 style={{ 
                background: 'linear-gradient(135deg, #1e40af 0%, #2563eb 50%, #3b82f6 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                fontSize: '24px',
                marginBottom: '5px'
              }}>
                Today's Bills
              </h3>
              <p style={{ color: '#666', fontSize: '14px' }}>
                {todayBills.length} {todayBills.length === 1 ? 'bill' : 'bills'} • {todayBills.filter(b => b.payment_status === 'pending').length} pending
              </p>
            </div>
            <div style={{ display: 'flex', gap: '15px', alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={{ 
                background: 'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)',
                color: 'white',
                padding: '10px 20px',
                borderRadius: '20px',
                fontSize: '14px',
                fontWeight: '600',
                boxShadow: '0 4px 15px rgba(255, 152, 0, 0.3)'
              }}>
                ⏳ Pending: {todayBills.filter(b => b.payment_status === 'pending').length}
              </div>
              <div style={{ display: 'flex', gap: '15px', alignItems: 'center', flexWrap: 'wrap' }}>
                <div style={{ 
                  fontSize: '16px', 
                  fontWeight: '600', 
                  color: '#28a745',
                  background: 'linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%)',
                  padding: '8px 16px',
                  borderRadius: '12px',
                  border: '1px solid #28a745'
                }}>
                  ✅ Paid: ₹{calculatePaidTotal(todayBills).toFixed(2)}
                </div>
                <div style={{ 
                  fontSize: '16px', 
                  fontWeight: '600', 
                  color: '#ff9800',
                  background: 'linear-gradient(135deg, #fff3cd 0%, #ffeaa7 100%)',
                  padding: '8px 16px',
                  borderRadius: '12px',
                  border: '1px solid #ff9800'
                }}>
                  ⏳ Pending: ₹{calculatePendingTotal(todayBills).toFixed(2)}
                </div>
                <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#667eea' }}>
                  Total: ₹{calculateTotal(todayBills).toFixed(2)}
                </div>
              </div>
              {todayBills.length > 0 && (
                <button
                  className="btn btn-primary"
                  onClick={() => printAllBills(todayBills)}
                  style={{
                    padding: '12px 24px',
                    fontSize: '15px',
                    fontWeight: '600',
                    boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)'
                  }}
                >
                  🖨️ Print All Bills
                </button>
              )}
            </div>
          </div>

          {todayBills.length === 0 ? (
            <div className="empty-state">
              <div style={{ fontSize: '64px', marginBottom: '20px' }}>📄</div>
              <p>No bills generated today</p>
            </div>
          ) : (
            <div>
              {todayBills.map((bill) => (
                <div key={bill.id} className="card" style={{ marginBottom: '15px', background: '#f8f9fa' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '15px' }}>
                    <div>
                      <h4>{bill.table_number}</h4>
                      {bill.customer_name && (
                        <p style={{ color: '#333', fontSize: '14px', fontWeight: '500', marginTop: '5px' }}>
                          👤 {bill.customer_name}
                        </p>
                      )}
                      {bill.customer_phone && (
                        <p style={{ color: '#333', fontSize: '14px', fontWeight: '500' }}>
                          📞 {bill.customer_phone}
                        </p>
                      )}
                      <p style={{ color: '#666', fontSize: '14px', marginTop: '5px' }}>{formatDate(bill.created_at)}</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#667eea' }}>
                        ₹{typeof bill.total_amount === 'string' ? parseFloat(bill.total_amount).toFixed(2) : (bill.total_amount || 0).toFixed(2)}
                      </div>
                      <div style={{ marginTop: '5px' }}>
                        <span className={`status-badge status-${bill.payment_status}`}>
                          {bill.payment_status}
                        </span>
                        <span style={{ marginLeft: '10px', color: '#666' }}>
                          {bill.payment_method}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div style={{ borderTop: '1px solid #ddd', paddingTop: '15px', marginTop: '15px' }}>
                    <button
                      className="btn btn-secondary btn-small"
                      onClick={() => {
                        setSelectedBill(bill);
                        setShowItemsModal(true);
                      }}
                      style={{
                        width: '100%',
                        padding: '10px',
                        fontSize: '14px',
                        fontWeight: '600'
                      }}
                    >
                      📋 View Items ({bill.items && Array.isArray(bill.items) ? bill.items.length : 0})
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'pending' && (
        <div className="card" style={{
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(255, 243, 205, 0.3) 100%)',
          border: '2px solid rgba(255, 152, 0, 0.3)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <h3 style={{ 
                background: 'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                fontSize: '24px',
                marginBottom: '5px'
              }}>
                ⏳ Pending Bills
              </h3>
              <p style={{ color: '#666', fontSize: '14px' }}>
                All bills with pending payment status
              </p>
            </div>
            <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#ff9800' }}>
              Total: ₹{calculateTotal(pendingBills).toFixed(2)}
            </div>
          </div>

          {pendingBills.length === 0 ? (
            <div className="empty-state">
              <div style={{ fontSize: '64px', marginBottom: '20px' }}>✅</div>
              <p>No pending bills found</p>
              <p style={{ color: '#999', fontSize: '14px', marginTop: '5px' }}>All bills have been paid</p>
            </div>
          ) : (
            <div>
              {pendingBills.map((bill) => (
                <div key={bill.id} className="card" style={{ 
                  marginBottom: '15px', 
                  background: 'linear-gradient(135deg, #fff3cd 0%, #ffeaa7 100%)',
                  border: '2px solid rgba(255, 152, 0, 0.3)',
                  boxShadow: '0 4px 15px rgba(255, 152, 0, 0.2)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '15px' }}>
                    <div>
                      <h4 style={{ color: '#333', marginBottom: '10px' }}>{bill.table_number}</h4>
                      {bill.customer_name ? (
                        <p style={{ color: '#333', fontSize: '15px', fontWeight: '600', marginTop: '8px', marginBottom: '5px' }}>
                          👤 {bill.customer_name}
                        </p>
                      ) : (
                        <p style={{ color: '#999', fontSize: '13px', fontStyle: 'italic', marginTop: '8px' }}>
                          👤 No customer name
                        </p>
                      )}
                      {bill.customer_phone ? (
                        <p style={{ color: '#333', fontSize: '15px', fontWeight: '600', marginBottom: '5px' }}>
                          📞 {bill.customer_phone}
                        </p>
                      ) : (
                        <p style={{ color: '#999', fontSize: '13px', fontStyle: 'italic' }}>
                          📞 No phone number
                        </p>
                      )}
                      <p style={{ color: '#666', fontSize: '13px', marginTop: '8px' }}>{formatDate(bill.created_at)}</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '26px', fontWeight: 'bold', color: '#ff9800', marginBottom: '8px' }}>
                        ₹{typeof bill.total_amount === 'string' ? parseFloat(bill.total_amount).toFixed(2) : (bill.total_amount || 0).toFixed(2)}
                      </div>
                      <div style={{ marginTop: '5px' }}>
                        <span className={`status-badge status-${bill.payment_status}`} style={{
                          background: 'linear-gradient(135deg, #fff3cd 0%, #ffeaa7 100%)',
                          color: '#856404',
                          padding: '8px 16px',
                          fontSize: '13px',
                          fontWeight: '700'
                        }}>
                          ⏳ {bill.payment_status.toUpperCase()}
                        </span>
                        <span style={{ marginLeft: '10px', color: '#666', fontSize: '14px' }}>
                          {bill.payment_method}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div style={{ borderTop: '2px solid rgba(255, 152, 0, 0.3)', paddingTop: '15px', marginTop: '15px', display: 'flex', gap: '10px' }}>
                    <button
                      className="btn btn-success btn-small"
                      onClick={() => handleMarkAsPaid(bill)}
                      style={{
                        flex: 1,
                        padding: '12px',
                        fontSize: '14px',
                        fontWeight: '600',
                        background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
                        color: 'white',
                        border: 'none',
                        boxShadow: '0 4px 15px rgba(40, 167, 69, 0.3)'
                      }}
                    >
                      ✅ Mark as Paid
                    </button>
                    <button
                      className="btn btn-secondary btn-small"
                      onClick={() => {
                        setSelectedBill(bill);
                        setShowItemsModal(true);
                      }}
                      style={{
                        flex: 1,
                        padding: '12px',
                        fontSize: '14px',
                        fontWeight: '600',
                        background: 'linear-gradient(135deg, #6c757d 0%, #5a6268 100%)',
                        color: 'white',
                        border: 'none'
                      }}
                    >
                      📋 View Items ({bill.items && Array.isArray(bill.items) ? bill.items.length : 0})
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'date' && (
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '15px' }}>
            <h3>Bills for {formatDateDisplay(selectedDate)}</h3>
            <div style={{ display: 'flex', gap: '15px', alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={{ 
                fontSize: '16px', 
                fontWeight: '600', 
                color: '#28a745',
                background: 'linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%)',
                padding: '8px 16px',
                borderRadius: '12px',
                border: '1px solid #28a745'
              }}>
                ✅ Paid: ₹{calculatePaidTotal(selectedDateBills).toFixed(2)}
              </div>
              <div style={{ 
                fontSize: '16px', 
                fontWeight: '600', 
                color: '#ff9800',
                background: 'linear-gradient(135deg, #fff3cd 0%, #ffeaa7 100%)',
                padding: '8px 16px',
                borderRadius: '12px',
                border: '1px solid #ff9800'
              }}>
                ⏳ Pending: ₹{calculatePendingTotal(selectedDateBills).toFixed(2)}
              </div>
              <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#667eea' }}>
                Total: ₹{calculateTotal(selectedDateBills).toFixed(2)}
              </div>
            </div>
          </div>

          {selectedDateBills.length === 0 ? (
            <div className="empty-state">
              <div style={{ fontSize: '64px', marginBottom: '20px' }}>📄</div>
              <p>No bills generated on {formatDateDisplay(selectedDate)}</p>
            </div>
          ) : (
            <div>
              {selectedDateBills.map((bill) => (
                <div key={bill.id} className="card" style={{ marginBottom: '15px', background: '#f8f9fa' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '15px' }}>
                    <div>
                      <h4>{bill.table_number}</h4>
                      {bill.customer_name && (
                        <p style={{ color: '#333', fontSize: '14px', fontWeight: '500', marginTop: '5px' }}>
                          👤 {bill.customer_name}
                        </p>
                      )}
                      {bill.customer_phone && (
                        <p style={{ color: '#333', fontSize: '14px', fontWeight: '500' }}>
                          📞 {bill.customer_phone}
                        </p>
                      )}
                      <p style={{ color: '#666', fontSize: '14px', marginTop: '5px' }}>{formatDate(bill.created_at)}</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#667eea' }}>
                        ₹{typeof bill.total_amount === 'string' ? parseFloat(bill.total_amount).toFixed(2) : (bill.total_amount || 0).toFixed(2)}
                      </div>
                      <div style={{ marginTop: '5px' }}>
                        <span className={`status-badge status-${bill.payment_status}`}>
                          {bill.payment_status}
                        </span>
                        <span style={{ marginLeft: '10px', color: '#666' }}>
                          {bill.payment_method}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div style={{ borderTop: '1px solid #ddd', paddingTop: '15px', marginTop: '15px', display: 'flex', gap: '10px' }}>
                    {bill.payment_status === 'pending' && (
                      <button
                        className="btn btn-success btn-small"
                        onClick={() => handleMarkAsPaid(bill)}
                        style={{
                          flex: 1,
                          padding: '12px',
                          fontSize: '14px',
                          fontWeight: '600',
                          background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
                          color: 'white',
                          border: 'none',
                          boxShadow: '0 4px 15px rgba(40, 167, 69, 0.3)'
                        }}
                      >
                        ✅ Mark as Paid
                      </button>
                    )}
                    <button
                      className="btn btn-secondary btn-small"
                      onClick={() => {
                        setSelectedBill(bill);
                        setShowItemsModal(true);
                      }}
                      style={{
                        flex: bill.payment_status === 'pending' ? 1 : '100%',
                        padding: '12px',
                        fontSize: '14px',
                        fontWeight: '600'
                      }}
                    >
                      📋 View Items ({bill.items && Array.isArray(bill.items) ? bill.items.length : 0})
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Bill Items Modal */}
      {showItemsModal && selectedBill && (
        <div className="modal">
          <div className="modal-content" style={{ maxWidth: '600px' }}>
            <div className="modal-header">
              <h2>📋 Bill Items - {selectedBill.table_number}</h2>
              <button className="close-btn" onClick={() => {
                setShowItemsModal(false);
                setSelectedBill(null);
              }}>
                ×
              </button>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <div style={{ 
                background: 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)',
                padding: '15px',
                borderRadius: '12px',
                marginBottom: '15px',
                border: '1px solid #e0e0e0'
              }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '14px' }}>
                  <div>
                    <strong style={{ color: '#666', fontSize: '12px' }}>BILL ID</strong>
                    <p style={{ margin: '5px 0', fontSize: '16px', fontWeight: '600' }}>#{selectedBill.id}</p>
                  </div>
                  <div>
                    <strong style={{ color: '#666', fontSize: '12px' }}>TOTAL AMOUNT</strong>
                    <p style={{ margin: '5px 0', fontSize: '16px', fontWeight: '600', color: '#2563eb' }}>
                      ₹{typeof selectedBill.total_amount === 'string' ? parseFloat(selectedBill.total_amount).toFixed(2) : (selectedBill.total_amount || 0).toFixed(2)}
                    </p>
                  </div>
                  {selectedBill.customer_name && (
                    <div>
                      <strong style={{ color: '#666', fontSize: '12px' }}>CUSTOMER</strong>
                      <p style={{ margin: '5px 0', fontSize: '14px' }}>{selectedBill.customer_name}</p>
                    </div>
                  )}
                  {selectedBill.customer_phone && (
                    <div>
                      <strong style={{ color: '#666', fontSize: '12px' }}>PHONE</strong>
                      <p style={{ margin: '5px 0', fontSize: '14px' }}>{selectedBill.customer_phone}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="bill-summary">
              <h3 style={{ marginBottom: '15px' }}>Items Ordered:</h3>
              {selectedBill.items && Array.isArray(selectedBill.items) && selectedBill.items.length > 0 ? (
                <table className="table">
                  <thead>
                    <tr>
                      <th>Item</th>
                      <th>Portion</th>
                      <th>Qty</th>
                      <th style={{ textAlign: 'right' }}>Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedBill.items.map((item, idx) => (
                      <tr key={idx}>
                        <td><strong>{item.item_name || 'Unknown'}</strong></td>
                        <td>{item.portion ? item.portion.toUpperCase() : 'FULL'}</td>
                        <td>{item.quantity || 1}</td>
                        <td style={{ textAlign: 'right', fontWeight: '600' }}>
                          ₹{typeof item.price === 'string' ? parseFloat(item.price).toFixed(2) : (item.price || 0).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr style={{ background: '#f8f9fa', fontWeight: '700' }}>
                      <td colSpan="3" style={{ textAlign: 'right', padding: '15px' }}>Total:</td>
                      <td style={{ textAlign: 'right', padding: '15px', fontSize: '18px', color: '#2563eb' }}>
                        ₹{typeof selectedBill.total_amount === 'string' ? parseFloat(selectedBill.total_amount).toFixed(2) : (selectedBill.total_amount || 0).toFixed(2)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              ) : (
                <div className="empty-state">
                  <p style={{ color: '#999', fontStyle: 'italic' }}>No items found in this bill</p>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '25px', justifyContent: 'flex-end' }}>
              <button 
                className="btn btn-primary" 
                onClick={() => printSingleBill(selectedBill)}
                style={{ padding: '12px 24px' }}
              >
                🖨️ Print Bill
              </button>
              <button 
                className="btn btn-secondary" 
                onClick={() => {
                  setShowItemsModal(false);
                  setSelectedBill(null);
                }}
                style={{ padding: '12px 24px' }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Reports;

