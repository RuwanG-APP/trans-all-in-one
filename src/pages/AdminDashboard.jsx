import { useContext, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { OrderContext } from '../context/OrderContext';
import { TranslatorContext } from '../context/TranslatorContext';
import { AgentContext } from '../context/AgentContext';
import { Upload, MessageSquare, ExternalLink, BarChart2, Lock, Users, Plus, Trash2, Edit, Briefcase } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { TRANSLATORS as INITIAL_TRANSLATORS } from '../constants/translators';

function AdminDashboard() {
  const { orders, updateOrderStatus, assignTranslator, assignAgent, loading: ordersLoading } = useContext(OrderContext);
  const { translators, addTranslator, updateTranslator, deleteTranslator, loading: transLoading } = useContext(TranslatorContext);
  const { agents, addAgent, updateAgent, deleteAgent, loading: agentsLoading } = useContext(AgentContext);
  const [quoteInputs, setQuoteInputs] = useState({});
  const { t } = useTranslation();
  
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('orders'); // 'orders', 'translators', 'agents'
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingTranslator, setEditingTranslator] = useState(null);
  const [editingAgent, setEditingAgent] = useState(null);
  
  // New translator form state
  const [newTrans, setNewTrans] = useState({ name: '', title: '', phone: '', languages: '', password: '', commission: 0.65 });
  // New agent form state
  const [newAgent, setNewAgent] = useState({ name: '', location: '', phone: '', commission: 0.25 });

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
  };

  const handleAccept = async (order) => {
    await updateOrderStatus(order.id, 'accepted');
    
    const balance = order.totalPrice === 'quote' ? 0 : (parseFloat(order.totalPrice) - parseFloat(order.advancePaid)).toFixed(2);
    const totalDisplay = order.totalPrice === 'quote' ? 'Quote Pending' : `Rs. ${order.totalPrice}/-`;
    const advanceDisplay = order.totalPrice === 'quote' ? 'Quote Pending' : `Rs. ${order.advancePaid}/-`;
    const balanceDisplay = order.totalPrice === 'quote' ? 'Quote Pending' : `Rs. ${balance}/-`;

    const docName = t(`docs.${order.docType}`, { defaultValue: order.docType });

    let message = '';
    if (order.priority === 'emergency') {
      message = encodeURIComponent(`🚨 *URGENT ORDER ACCEPTED* 🚨\nHello ${order.customerName},\nYour translation order for ${docName} has been ACCEPTED by Trans-All In One.\n\n*Order Details:*\nRef ID: ${order.id}\nPhone: ${order.whatsapp}\nTotal: ${totalDisplay}\nAdvance: ${advanceDisplay}\nBalance: ${balanceDisplay}\n\nWe are processing it immediately!`);
    } else {
      message = encodeURIComponent(`✅ *ORDER ACCEPTED* ✅\nHello ${order.customerName},\nYour translation order for ${docName} has been ACCEPTED by Trans-All In One.\n\n*Order Details:*\nRef ID: ${order.id}\nPhone: ${order.whatsapp}\nTotal: ${totalDisplay}\nAdvance: ${advanceDisplay}\nBalance: ${balanceDisplay}\n\nWe are processing it now.`);
    }
    
    const formattedNumber = order.whatsapp.startsWith('0') ? '94' + order.whatsapp.substring(1) : order.whatsapp;
    window.open(`https://wa.me/${formattedNumber}?text=${message}`, '_blank');
  };

  const handleSendQuote = async (order) => {
    const quote = quoteInputs[order.id];
    if (!quote) return;
    const advance = (parseFloat(quote) * 0.3).toFixed(2);
    
    alert(`[MOCK WHATSAPP MESSAGE to ${order.whatsapp}]\nHello ${order.customerName},\nYour quote for ${order.docType} is Rs. ${quote}/-. Please pay the advance of Rs. ${advance}/- to proceed.`);
    
    await updateOrderStatus(order.id, 'pending', { totalPrice: quote, advancePaid: advance });
  };

  const handleUploadSample = async (order) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.pdf,.jpg,.jpeg,.png';
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      try {
        const uploadData = new FormData();
        uploadData.append('file', file);
        uploadData.append('upload_preset', 'trans_preset');

        alert('Uploading sample... Please wait.');

        const response = await fetch(`https://api.cloudinary.com/v1_1/dmhahancy/auto/upload`, {
          method: 'POST',
          body: uploadData
        });

        const data = await response.json();
        if (data.error) throw new Error(data.error.message);

        await updateOrderStatus(order.id, 'sample_ready', { sampleUrl: data.secure_url });
        alert('Low resolution sample uploaded successfully!');
      } catch (err) {
        console.error(err);
        alert('Error uploading sample.');
      }
    };
    input.click();
  };

  const handleUploadFinal = async (order) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.pdf,.doc,.docx,.jpg,.jpeg,.png';
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      try {
        const uploadData = new FormData();
        uploadData.append('file', file);
        uploadData.append('upload_preset', 'trans_preset');

        alert('Uploading final document... Please wait.');

        const response = await fetch(`https://api.cloudinary.com/v1_1/dmhahancy/auto/upload`, {
          method: 'POST',
          body: uploadData
        });

        const data = await response.json();
        if (data.error) throw new Error(data.error.message);

        await updateOrderStatus(order.id, 'balance_pending', { completedFileUrl: data.secure_url });
        
        const formattedNumber = order.whatsapp.startsWith('0') ? '94' + order.whatsapp.substring(1) : order.whatsapp;
        const dashboardUrl = `${window.location.origin}/dashboard`;
        const message = encodeURIComponent(`📄 *TRANSLATION COMPLETED!* 📄\nHello ${order.customerName},\nYour document is fully translated!\n\nPlease log in to your dashboard to pay the remaining balance and download the final document:\n${dashboardUrl}`);
        window.open(`https://wa.me/${formattedNumber}?text=${message}`, '_blank');

      } catch (err) {
        console.error(err);
        alert('Error uploading document.');
      }
    };
    input.click();
  };

  const handleApprovePayment = async (order) => {
    await updateOrderStatus(order.id, 'completed');
    
    const formattedNumber = order.whatsapp.startsWith('0') ? '94' + order.whatsapp.substring(1) : order.whatsapp;
    const dashboardUrl = `${window.location.origin}/dashboard`;
    const message = encodeURIComponent(`🎉 *YOUR DOCUMENT IS READY!* 🎉\nHello ${order.customerName},\nYour payment is approved and your translated document (${order.docType}) is now ready to download!\n\nClick the link below and log in with your WhatsApp number (${order.whatsapp}) to download it:\n${dashboardUrl}`);
    
    window.open(`https://wa.me/${formattedNumber}?text=${message}`, '_blank');
  };

  const handleSaveTranslator = async (e) => {
    e.preventDefault();
    try {
      const transData = {
        ...newTrans,
        languages: typeof newTrans.languages === 'string' ? newTrans.languages.split(',').map(l => l.trim()) : newTrans.languages
      };
      
      if (editingTranslator) {
        await updateTranslator(editingTranslator.id, transData);
        setEditingTranslator(null);
      } else {
        await addTranslator(transData);
      }
      
      setNewTrans({ name: '', title: '', languages: '', password: '', commission: 0.65 });
      setShowAddForm(false);
      alert("Translator saved successfully!");
    } catch (err) {
      alert("Error saving translator");
    }
  };

  const handleSaveAgent = async (e) => {
    e.preventDefault();
    try {
      if (editingAgent) {
        await updateAgent(editingAgent.id, newAgent);
        setEditingAgent(null);
      } else {
        await addAgent(newAgent);
      }
      setNewAgent({ name: '', location: '', phone: '', commission: 0.25 });
      setShowAddForm(false);
      alert("Agent saved successfully!");
    } catch (err) {
      alert("Error saving agent");
    }
  };

  const handleSeedTranslators = async () => {
    if (window.confirm("Import initial translators from code to database?")) {
      for (const t of INITIAL_TRANSLATORS) {
        await addTranslator(t);
      }
      alert("Translators imported!");
    }
  };

  if (ordersLoading || transLoading || agentsLoading) return <div className="container text-center mt-lg">Loading dashboard...</div>;

  if (!isAuthenticated) {
    return (
      <div className="container animate-fade-in" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div className="card" style={{ maxWidth: '400px', width: '100%', padding: '3rem 2rem', textAlign: 'center' }}>
          <Lock size={48} color="var(--color-primary)" style={{ margin: '0 auto 1.5rem auto' }} />
          <h2 className="mb-md">Admin Access</h2>
          <p className="text-muted mb-lg">Please enter the security password to continue.</p>
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
              Login to Dashboard
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="container animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h2 className="text-primary">Admin Control Panel</h2>
          <p className="text-muted">Manage all translation requests here.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div style={{ backgroundColor: 'var(--color-surface)', padding: '0.25rem', borderRadius: 'var(--radius-md)', display: 'flex', gap: '0.25rem' }}>
            <button 
              className={`btn ${activeTab === 'orders' ? 'btn-primary' : 'btn-outline'}`} 
              style={{ padding: '0.5rem 1rem', border: 'none' }}
              onClick={() => setActiveTab('orders')}
            >
              Orders
            </button>
            <button 
              className={`btn ${activeTab === 'translators' ? 'btn-primary' : 'btn-outline'}`} 
              style={{ padding: '0.5rem 1rem', border: 'none' }}
              onClick={() => setActiveTab('translators')}
            >
              Translators
            </button>
            <button 
              className={`btn ${activeTab === 'agents' ? 'btn-primary' : 'btn-outline'}`} 
              style={{ padding: '0.5rem 1rem', border: 'none' }}
              onClick={() => setActiveTab('agents')}
            >
              Agents
            </button>
          </div>
          <Link to="/admin/reports" className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <BarChart2 size={18} /> Financials
          </Link>
          <button onClick={handleLogout} className="btn btn-outline" style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-muted)' }}>Logout</button>
        </div>
      </div>

      {activeTab === 'translators' ? (
        <div className="animate-fade-in">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3>Manage Translators</h3>
            <div style={{ display: 'flex', gap: '1rem' }}>
              {translators.length === 0 && (
                <button className="btn btn-secondary" onClick={handleSeedTranslators}>Seed Initial Data</button>
              )}
              <button className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }} onClick={() => setShowAddForm(!showAddForm)}>
                <Plus size={18} /> {showAddForm ? 'Cancel' : 'Add New Translator'}
              </button>
            </div>
          </div>

          {showAddForm && (
            <div className="card mb-lg" style={{ backgroundColor: 'var(--color-background)' }}>
              <h4>{editingTranslator ? 'Edit Translator' : 'Add New Translator'}</h4>
              <form onSubmit={handleSaveTranslator} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Name</label>
                  <input type="text" className="form-input" required value={newTrans.name} onChange={e => setNewTrans({...newTrans, name: e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label">Title/Qualification</label>
                  <input type="text" className="form-input" required value={newTrans.title} onChange={e => setNewTrans({...newTrans, title: e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone/WhatsApp</label>
                  <input type="text" className="form-input" required placeholder="07xxxxxxxx" value={newTrans.phone} onChange={e => setNewTrans({...newTrans, phone: e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label">Languages (comma separated)</label>
                  <input type="text" className="form-input" required placeholder="English, Sinhala, Tamil" value={newTrans.languages} onChange={e => setNewTrans({...newTrans, languages: e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label">Login Password</label>
                  <input type="text" className="form-input" required value={newTrans.password} onChange={e => setNewTrans({...newTrans, password: e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label">Commission (e.g. 0.65)</label>
                  <input type="number" step="0.01" className="form-input" required value={newTrans.commission} onChange={e => setNewTrans({...newTrans, commission: parseFloat(e.target.value)})} />
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                  <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Save Translator</button>
                </div>
              </form>
            </div>
          )}

          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead style={{ backgroundColor: 'var(--color-background)', borderBottom: '2px solid var(--color-border)' }}>
                <tr>
                  <th style={{ padding: '1rem' }}>Name</th>
                  <th style={{ padding: '1rem' }}>Contact</th>
                  <th style={{ padding: '1rem' }}>Languages</th>
                  <th style={{ padding: '1rem' }}>Password</th>
                  <th style={{ padding: '1rem' }}>Commission</th>
                  <th style={{ padding: '1rem' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {translators.map(t => (
                  <tr key={t.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                    <td style={{ padding: '1rem', fontWeight: 600 }}>{t.name}</td>
                    <td style={{ padding: '1rem' }}>{t.phone}</td>
                    <td style={{ padding: '1rem' }}>{t.languages.join(', ')}</td>
                    <td style={{ padding: '1rem' }}><code>{t.password}</code></td>
                    <td style={{ padding: '1rem' }}>{(t.commission * 100).toFixed(0)}%</td>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button className="btn btn-outline" style={{ padding: '0.25rem', color: 'var(--color-primary)' }} onClick={() => {
                          setEditingTranslator(t);
                          setNewTrans({ ...t, languages: t.languages.join(', ') });
                          setShowAddForm(true);
                        }}>
                          <Edit size={16} />
                        </button>
                        <button className="btn btn-outline" style={{ padding: '0.25rem', color: '#ef4444' }} onClick={() => {
                          if (window.confirm("Delete this translator?")) deleteTranslator(t.id);
                        }}>
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : activeTab === 'agents' ? (
        <div className="animate-fade-in">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3>Manage Business Agents</h3>
            <button className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }} onClick={() => {
              setShowAddForm(!showAddForm);
              setEditingAgent(null);
              setNewAgent({ name: '', location: '', phone: '', commission: 0.25 });
            }}>
              <Plus size={18} /> {showAddForm ? 'Cancel' : 'Add New Agent'}
            </button>
          </div>

          {showAddForm && (
            <div className="card mb-lg" style={{ backgroundColor: 'var(--color-background)' }}>
              <h4>{editingAgent ? 'Edit Agent' : 'Add New Agent'}</h4>
              <form onSubmit={handleSaveAgent} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Agent Name</label>
                  <input type="text" className="form-input" required value={newAgent.name} onChange={e => setNewAgent({...newAgent, name: e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label">Location/City</label>
                  <input type="text" className="form-input" required value={newAgent.location} onChange={e => setNewAgent({...newAgent, location: e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label">WhatsApp/Phone</label>
                  <input type="text" className="form-input" required value={newAgent.phone} onChange={e => setNewAgent({...newAgent, phone: e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label">Commission (Default 25% = 0.25)</label>
                  <input type="number" step="0.01" className="form-input" required value={newAgent.commission} onChange={e => setNewAgent({...newAgent, commission: parseFloat(e.target.value)})} />
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                  <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Save Agent</button>
                </div>
              </form>
            </div>
          )}

          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead style={{ backgroundColor: 'var(--color-background)', borderBottom: '2px solid var(--color-border)' }}>
                <tr>
                  <th style={{ padding: '1rem' }}>Agent Name</th>
                  <th style={{ padding: '1rem' }}>Location</th>
                  <th style={{ padding: '1rem' }}>Contact</th>
                  <th style={{ padding: '1rem' }}>Commission</th>
                  <th style={{ padding: '1rem' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {agents.map(a => (
                  <tr key={a.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                    <td style={{ padding: '1rem', fontWeight: 600 }}>{a.name}</td>
                    <td style={{ padding: '1rem' }}>{a.location}</td>
                    <td style={{ padding: '1rem' }}>{a.phone}</td>
                    <td style={{ padding: '1rem' }}>{(a.commission * 100).toFixed(0)}%</td>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button className="btn btn-outline" style={{ padding: '0.25rem', color: 'var(--color-primary)' }} onClick={() => {
                          setEditingAgent(a);
                          setNewAgent({ ...a });
                          setShowAddForm(true);
                        }}>
                          <Edit size={16} />
                        </button>
                        <button className="btn btn-outline" style={{ padding: '0.25rem', color: '#ef4444' }} onClick={() => {
                          if (window.confirm("Delete this agent?")) deleteAgent(a.id);
                        }}>
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <>
          {orders.length === 0 ? (
        <div className="card text-center">No orders yet.</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
          {orders.map(order => (
            <div key={order.id} className="card" style={{ borderLeft: `6px solid ${order.priority === 'emergency' ? '#ef4444' : `var(--color-${order.status === 'completed' ? 'success' : 'primary'})`}` }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                <div>
                  <h4>Customer Info</h4>
                  <p><strong>Name:</strong> {order.customerName}</p>
                  <p><strong>WhatsApp:</strong> {order.whatsapp}</p>
                  <p><strong>Delivery:</strong> {order.deliveryMethod === 'hard_copy' ? 'Courier (Hard Copy)' : 'WhatsApp (Soft Copy)'}</p>
                </div>
                <div>
                  <h4>Order Details</h4>
                  <p>
                    <strong>Type:</strong> {t(`docs.${order.docType}`, { defaultValue: order.docType })}
                    {order.priority === 'emergency' && (
                      <span style={{ marginLeft: '0.5rem', backgroundColor: '#ef4444', color: 'white', padding: '0.1rem 0.4rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold' }}>URGENT 2HR</span>
                    )}
                  </p>
                  <p>
                    <strong>Original File: </strong> 
                    {order.fileUrl ? (
                      <a href={order.fileUrl} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                        View Document <ExternalLink size={14} />
                      </a>
                    ) : (
                      order.fileName
                    )}
                  </p>
                  {order.translatedFileUrl && (
                    <p>
                      <strong>Translator Submission: </strong> 
                      <a href={order.translatedFileUrl} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', color: 'var(--color-success)', fontWeight: 'bold' }}>
                        View Translation <ExternalLink size={14} />
                      </a>
                    </p>
                  )}
                  <p><strong>Status:</strong> <span style={{ textTransform: 'uppercase', fontWeight: 'bold' }}>{order.status}</span></p>
                </div>
                <div>
                  <h4>Pricing</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <input 
                        type="number" 
                        placeholder="Price" 
                        className="form-input" 
                        style={{ padding: '0.25rem 0.5rem', width: '100px' }}
                        value={quoteInputs[order.id] || (order.totalPrice === 'quote' ? '' : order.totalPrice)}
                        onChange={(e) => setQuoteInputs({...quoteInputs, [order.id]: e.target.value})}
                      />
                      <button className="btn btn-secondary" style={{ padding: '0.25rem 0.75rem', fontSize: '0.8rem' }} onClick={() => {
                        const price = quoteInputs[order.id];
                        if (price) {
                          const advance = (parseFloat(price) * 0.3).toFixed(2);
                          updateOrderStatus(order.id, order.status, { totalPrice: price, advancePaid: advance });
                          alert("Price updated!");
                        }
                      }}>
                        Update
                      </button>
                    </div>
                    {order.totalPrice === 'quote' && (
                      <small style={{ color: '#ef4444', fontWeight: 'bold' }}>⚠️ Quote Pending</small>
                    )}
                    {order.totalPrice !== 'quote' && (
                      <p style={{ fontSize: '0.85rem' }}>Advance: Rs. {order.advancePaid}/-</p>
                    )}
                  </div>
                </div>
                <div>
                  <h4>Assignment</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {/* Translator Assignment */}
                    {order.translatorId ? (
                      <div>
                        <p className="text-success" style={{ fontWeight: 'bold', fontSize: '0.85rem' }}>
                          Translator: {translators.find(t => t.id === order.translatorId)?.name || order.translatorId}
                        </p>
                      </div>
                    ) : (
                      <select 
                        className="form-input" 
                        style={{ padding: '0.25rem 0.5rem', width: '100%', fontSize: '0.8rem' }}
                        onChange={(e) => {
                          if (e.target.value) {
                            const trans = translators.find(t => t.id === e.target.value);
                            if (window.confirm(`Assign this job to ${trans?.name}?`)) {
                              assignTranslator(order.id, e.target.value);
                              
                              // Send WhatsApp Notification to Translator
                              if (trans?.phone) {
                                const formattedNumber = trans.phone.startsWith('0') ? '94' + trans.phone.substring(1) : trans.phone;
                                const loginUrl = `${window.location.origin}/translator`;
                                const message = encodeURIComponent(`📝 *NEW TRANSLATION JOB* 📝\nHello ${trans.name},\nYou have been assigned a new job!\n\n*Details:*\nRef ID: ${order.id}\nDoc: ${order.docType}\nPriority: ${order.priority.toUpperCase()}\n\nPlease login to your dashboard to start:\n${loginUrl}`);
                                window.open(`https://wa.me/${formattedNumber}?text=${message}`, '_blank');
                              }
                            }
                          }
                        }}
                        defaultValue=""
                      >
                        <option value="" disabled>Assign Translator...</option>
                        {translators.map(t => (
                          <option key={t.id} value={t.id}>{t.name} ({t.languages.join('/')})</option>
                        ))}
                      </select>
                    )}

                    {/* Agent Attribution */}
                    {order.agentId ? (
                      <div>
                        <p style={{ fontWeight: 'bold', fontSize: '0.85rem', color: 'var(--color-accent)' }}>
                          Agent: {agents.find(a => a.id === order.agentId)?.name || order.agentId}
                        </p>
                      </div>
                    ) : (
                      <select 
                        className="form-input" 
                        style={{ padding: '0.25rem 0.5rem', width: '100%', fontSize: '0.8rem', border: '1px dashed var(--color-accent)' }}
                        onChange={(e) => {
                          if (e.target.value) {
                            if (window.confirm(`Link this order to Agent: ${agents.find(a => a.id === e.target.value)?.name}?`)) {
                              assignAgent(order.id, e.target.value);
                            }
                          }
                        }}
                        defaultValue=""
                      >
                        <option value="" disabled>Link to Agent...</option>
                        {agents.map(a => (
                          <option key={a.id} value={a.id}>{a.name} ({a.location})</option>
                        ))}
                      </select>
                    )}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', flexWrap: 'wrap' }}>
                {order.status === 'pending' && order.totalPrice !== 'quote' && (
                  <button className="btn btn-primary" onClick={() => handleAccept(order)}>
                    Accept & Notify Client
                  </button>
                )}
                
                {(order.status === 'accepted' || order.status === 'assigned' || order.status === 'translated' || order.status === 'sample_ready') && (
                  <>
                    <button className="btn btn-secondary" onClick={() => handleUploadSample(order)}>
                      <Upload size={18} /> Upload Sample
                    </button>
                    <button className="btn" style={{ backgroundColor: 'var(--color-success)', color: 'white' }} onClick={() => handleUploadFinal(order)}>
                      <Upload size={18} /> Upload Final Document
                    </button>
                  </>
                )}

                {order.status === 'balance_review' && (
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    {order.balanceSlipUrl && (
                      <a href={order.balanceSlipUrl} target="_blank" rel="noopener noreferrer" className="btn btn-secondary">
                        View Bank Slip <ExternalLink size={14} />
                      </a>
                    )}
                    <button className="btn btn-primary" onClick={() => handleApprovePayment(order)}>
                      Approve Payment
                    </button>
                  </div>
                )}

                <button className="btn btn-secondary" onClick={() => alert(`Opening WhatsApp to ${order.whatsapp}`)}>
                  <MessageSquare size={18} /> Message
                </button>
              </div>
            </div>
          ))}
        </div>
          )}
        </>
      )}
    </div>
  );
}

export default AdminDashboard;
