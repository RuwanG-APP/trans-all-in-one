import { useState, useContext, useEffect } from 'react';
import { OrderContext } from '../context/OrderContext';
import { TranslatorContext } from '../context/TranslatorContext';
import { Lock, FileText, Upload, ExternalLink, LogOut, CheckCircle } from 'lucide-react';

function TranslatorDashboard() {
  const { orders, updateOrderStatus, loading: ordersLoading } = useContext(OrderContext);
  const { translators, loading: transLoading } = useContext(TranslatorContext);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [selectedTranslator, setSelectedTranslator] = useState(null);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (transLoading) return;
    const authId = sessionStorage.getItem('translator_id');
    if (authId) {
      const translator = translators.find(t => t.id === authId);
      if (translator) {
        setSelectedTranslator(translator);
        setIsAuthenticated(true);
      }
    }
  }, [translators, transLoading]);

  const handleLogin = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const translatorId = formData.get('translator');
    const translator = translators.find(t => t.id === translatorId);
    
    if (translator && password.trim() === translator.password) {
      setSelectedTranslator(translator);
      setIsAuthenticated(true);
      sessionStorage.setItem('translator_id', translator.id);
      setError('');
    } else {
      console.log("Login Failed:", { attemptedId: translatorId, found: !!translator });
      setError('Invalid translator or password!');
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('translator_id');
    setIsAuthenticated(false);
    setSelectedTranslator(null);
  };

  const handleUploadTranslation = async (orderId) => {
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

        alert('Uploading translation... Please wait.');

        const response = await fetch(`https://api.cloudinary.com/v1_1/dmhahancy/auto/upload`, {
          method: 'POST',
          body: uploadData
        });

        const data = await response.json();
        if (data.error) throw new Error(data.error.message);

        await updateOrderStatus(orderId, 'translated', { 
          translatedFileUrl: data.secure_url,
          translatedAt: new Date().toISOString()
        });
        alert('Translation uploaded successfully! Admin will review it now.');
      } catch (err) {
        console.error(err);
        alert('Error uploading translation.');
      }
    };
    input.click();
  };

  if (ordersLoading || transLoading) return <div className="container text-center mt-lg">Loading...</div>;

  if (!isAuthenticated) {
    return (
      <div className="container animate-fade-in" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div className="card" style={{ maxWidth: '400px', width: '100%', padding: '3rem 2rem', textAlign: 'center' }}>
          <Lock size={48} color="var(--color-primary)" style={{ margin: '0 auto 1.5rem auto' }} />
          <h2 className="mb-md">Translator Login</h2>
          <form onSubmit={handleLogin}>
            <div className="form-group text-left">
              <label className="form-label">Select Your Name</label>
              <select name="translator" className="form-input" required>
                <option value="">Choose...</option>
                {translators.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>
            <div className="form-group text-left" style={{ marginBottom: '1.5rem' }}>
              <label className="form-label">Password</label>
              <input 
                type="password" 
                className="form-input" 
                placeholder="Enter password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
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

  const assignedOrders = orders.filter(o => o.translatorId === selectedTranslator.id);
  const totalEarned = assignedOrders
    .filter(o => o.status === 'completed' || o.status === 'balance_pending' || o.status === 'translated')
    .reduce((sum, o) => {
        const amount = o.totalPrice === 'quote' ? 0 : parseFloat(o.totalPrice || 0);
        const commission = selectedTranslator.commission || 0.65;
        return sum + (amount * commission);
    }, 0);

  return (
    <div className="container animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h2 className="text-primary">Welcome, {selectedTranslator.name}</h2>
          <p className="text-muted">{selectedTranslator.title}</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <div className="card" style={{ padding: '0.5rem 1rem', marginBottom: 0, backgroundColor: 'var(--color-background)' }}>
                <small className="text-muted">Total Earnings: </small>
                <strong className="text-success">Rs. {totalEarned.toLocaleString()}/-</strong>
            </div>
            <button onClick={handleLogout} className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <LogOut size={18} /> Logout
            </button>
        </div>
      </div>

      <h3 className="mb-md">Assigned Jobs</h3>
      {assignedOrders.length === 0 ? (
        <div className="card text-center">No jobs assigned to you yet.</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
          {assignedOrders.map(order => (
            <div key={order.id} className="card" style={{ borderLeft: `6px solid ${order.status === 'translated' ? 'var(--color-success)' : 'var(--color-primary)'}` }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                <div>
                  <h4>Job Details</h4>
                  <p><strong>Ref ID:</strong> {order.id}</p>
                  <p><strong>Document:</strong> {order.docType}</p>
                  <p><strong>Priority:</strong> <span style={{ color: order.priority === 'emergency' ? 'red' : 'inherit', fontWeight: 'bold' }}>{order.priority.toUpperCase()}</span></p>
                </div>
                <div>
                  <h4>Files</h4>
                  <p>
                    <strong>Original: </strong>
                    <a href={order.fileUrl} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                      View <ExternalLink size={14} />
                    </a>
                  </p>
                  {order.translatedFileUrl && (
                    <p>
                      <strong>Your Translation: </strong>
                      <a href={order.translatedFileUrl} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                        View <ExternalLink size={14} />
                      </a>
                    </p>
                  )}
                </div>
                <div>
                  <h4>Payment (Your 65%)</h4>
                  <p><strong>Total Price:</strong> {order.totalPrice === 'quote' ? 'Pending Quote' : `Rs. ${order.totalPrice}/-`}</p>
                  <p><strong>Your Share:</strong> {order.totalPrice === 'quote' ? 'Pending' : `Rs. ${(parseFloat(order.totalPrice) * 0.65).toFixed(2)}/-`}</p>
                  <p><strong>Status:</strong> <span style={{ fontWeight: 'bold', color: 'var(--color-primary)' }}>{order.status.toUpperCase()}</span></p>
                </div>
              </div>

              <div style={{ marginTop: '1.5rem' }}>
                {order.status === 'assigned' ? (
                  <button className="btn btn-primary" onClick={() => handleUploadTranslation(order.id)}>
                    <Upload size={18} /> Upload Completed Translation
                  </button>
                ) : (
                  <div className="text-success" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold' }}>
                    <CheckCircle size={20} /> Translation Submitted
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default TranslatorDashboard;
