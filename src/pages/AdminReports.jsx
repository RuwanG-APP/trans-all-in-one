import { useContext, useState, useEffect } from 'react';
import { OrderContext } from '../context/OrderContext';
import { AgentContext } from '../context/AgentContext';
import { FileText, Printer, Calendar, Download, Briefcase } from 'lucide-react';
import { useTranslation } from 'react-i18next';

function AdminReports() {
  const { orders, loading: ordersLoading } = useContext(OrderContext);
  const { agents, loading: agentsLoading } = useContext(AgentContext);
  const { t } = useTranslation();
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const authStatus = sessionStorage.getItem('is_admin_auth');
    if (authStatus === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === 'transadmin789') {
      setIsAuthenticated(true);
      sessionStorage.setItem('is_admin_auth', 'true');
      setError('');
    } else {
      setError('Invalid admin password!');
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('is_admin_auth');
    setIsAuthenticated(false);
    window.location.href = '/admin';
  };

  const filteredOrders = orders.filter(order => {
    if (!startDate && !endDate) return true;
    const orderDate = new Date(order.createdAt).toISOString().split('T')[0];
    const start = startDate || '1970-01-01';
    const end = endDate || '9999-12-31';
    return orderDate >= start && orderDate <= end;
  });

  const totals = filteredOrders.reduce((acc, order) => {
    const total = order.totalPrice === 'quote' ? 0 : parseFloat(order.totalPrice || 0);
    const advance = parseFloat(order.advancePaid || 0);
    const balance = order.status === 'completed' ? (total - advance) : 0;
    
    // Agent Commission calculation
    let agentComm = 0;
    if (order.agentId) {
      const agent = agents.find(a => a.id === order.agentId);
      const rate = agent ? agent.commission : 0.25;
      agentComm = total * rate;
    }
    
    return {
      revenue: acc.revenue + total,
      advance: acc.advance + advance,
      balanceReceived: acc.balanceReceived + balance,
      totalReceived: acc.totalReceived + advance + balance,
      agentCommission: acc.agentCommission + agentComm
    };
  }, { revenue: 0, advance: 0, balanceReceived: 0, totalReceived: 0, agentCommission: 0 });

  const handlePrint = () => {
    window.print();
  };

  if (ordersLoading || agentsLoading) return <div className="container text-center mt-lg">Loading reports...</div>;

  return (
    <div className="container animate-fade-in">
      {isAuthenticated ? (
        <>
          <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <div>
              <h2 className="text-primary">Financial Reports</h2>
              <p className="text-muted">Analyze your business performance and earnings.</p>
            </div>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button onClick={handlePrint} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Printer size={18} /> Print Report
              </button>
              <button onClick={handleLogout} className="btn btn-secondary">Logout</button>
            </div>
          </div>

          {/* Filters */}
          <div className="card no-print mb-lg" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Calendar size={16} /> Start Date
                </label>
                <input type="date" className="form-input" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Calendar size={16} /> End Date
                </label>
                <input type="date" className="form-input" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
              </div>
              <button className="btn btn-secondary" onClick={() => { setStartDate(''); setEndDate(''); }}>Reset</button>
            </div>
          </div>

          {/* Summary Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
            <div className="card text-center" style={{ borderTop: '4px solid var(--color-primary)' }}>
              <p className="text-muted">Total Revenue</p>
              <h2 style={{ margin: '0.5rem 0' }}>Rs. {totals.revenue.toLocaleString()}/-</h2>
            </div>
            <div className="card text-center" style={{ borderTop: '4px solid var(--color-accent)' }}>
              <p className="text-muted">Agent Commission</p>
              <h2 style={{ margin: '0.5rem 0', color: 'var(--color-accent)' }}>Rs. {totals.agentCommission.toLocaleString()}/-</h2>
            </div>
            <div className="card text-center" style={{ borderTop: '4px solid var(--color-success)' }}>
              <p className="text-muted">Net Revenue (After Agents)</p>
              <h2 style={{ margin: '0.5rem 0', color: 'var(--color-success)' }}>Rs. {(totals.revenue - totals.agentCommission).toLocaleString()}/-</h2>
            </div>
            <div className="card text-center" style={{ borderTop: '4px solid #10b981' }}>
              <p className="text-muted">Actual Cash Received</p>
              <h2 style={{ margin: '0.5rem 0', color: '#10b981' }}>Rs. {totals.totalReceived.toLocaleString()}/-</h2>
            </div>
          </div>

          {/* Report Table */}
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div className="print-header" style={{ display: 'none', padding: '2rem', textAlign: 'center', borderBottom: '2px solid #eee' }}>
              <h1>Trans-All In One - Financial Report</h1>
              <p>Period: {startDate || 'Beginning'} to {endDate || 'Today'}</p>
              <p>Generated on: {new Date().toLocaleString()}</p>
            </div>
            
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead style={{ backgroundColor: 'var(--color-background)', borderBottom: '2px solid var(--color-border)' }}>
                  <tr>
                    <th style={{ padding: '1rem' }}>Job ID</th>
                    <th style={{ padding: '1rem' }}>Date</th>
                    <th style={{ padding: '1rem' }}>Customer</th>
                    <th style={{ padding: '1rem' }}>Job</th>
                    <th style={{ padding: '1rem' }}>Agent</th>
                    <th style={{ padding: '1rem' }}>Total</th>
                    <th style={{ padding: '1rem' }}>Agent Comm</th>
                    <th style={{ padding: '1rem' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map(order => {
                    const total = order.totalPrice === 'quote' ? 0 : parseFloat(order.totalPrice || 0);
                    const advance = parseFloat(order.advancePaid || 0);
                    const balance = total - advance;
                    return (
                      <tr key={order.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                        <td style={{ padding: '1rem', fontWeight: 600 }}>{order.id}</td>
                        <td style={{ padding: '1rem' }}>{new Date(order.createdAt).toLocaleDateString()}</td>
                        <td style={{ padding: '1rem' }}>
                          {order.customerName}<br/>
                          <small className="text-muted">{order.whatsapp}</small>
                        </td>
                        <td style={{ padding: '1rem' }}>{t(`docs.${order.docType}`, { defaultValue: order.docType })}</td>
                        <td style={{ padding: '1rem' }}>
                          {order.agentId ? (
                            <div style={{ fontSize: '0.85rem' }}>
                              <strong>{agents.find(a => a.id === order.agentId)?.name || order.agentId}</strong><br/>
                              <small className="text-muted">{(agents.find(a => a.id === order.agentId)?.commission * 100 || 25)}%</small>
                            </div>
                          ) : 'Direct'}
                        </td>
                        <td style={{ padding: '1rem' }}>{total > 0 ? `Rs. ${total}` : 'Quote'}</td>
                        <td style={{ padding: '1rem' }}>
                          {order.agentId ? `Rs. ${(total * (agents.find(a => a.id === order.agentId)?.commission || 0.25)).toFixed(0)}` : '-'}
                        </td>
                        <td style={{ padding: '1rem' }}>
                          <span style={{ 
                            fontSize: '0.75rem', 
                            padding: '0.25rem 0.5rem', 
                            borderRadius: '4px',
                            backgroundColor: order.status === 'completed' ? '#d1fae5' : '#dbeafe',
                            color: order.status === 'completed' ? '#065f46' : '#1e40af'
                          }}>
                            {order.status.toUpperCase()}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
          <div className="card" style={{ maxWidth: '400px', width: '100%', padding: '3rem 2rem', textAlign: 'center' }}>
            <Calendar size={48} color="var(--color-primary)" style={{ margin: '0 auto 1.5rem auto' }} />
            <h2 className="mb-md">Admin Access</h2>
            <p className="text-muted mb-lg">Please enter the security password to view reports.</p>
            <form onSubmit={handleLogin}>
              <div className="form-group text-left" style={{ marginBottom: '1.5rem' }}>
                <input 
                  type="password" 
                  className="form-input" 
                  placeholder="Enter password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoFocus
                />
                {error && <span className="form-error mt-sm" style={{ display: 'block' }}>{error}</span>}
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                View Reports
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminReports;
