import { useContext, useState, useEffect } from 'react';
import { OrderContext } from '../context/OrderContext';
import { FileText, Clock, CheckCircle, Download, LogOut, Phone, Upload } from 'lucide-react';
import { useTranslation } from 'react-i18next';

function ClientDashboard() {
  const { orders, loading, updateOrderStatus } = useContext(OrderContext);
  const { t } = useTranslation();
  
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [inputNumber, setInputNumber] = useState('');
  const [loginError, setLoginError] = useState('');
  const [uploadingOrder, setUploadingOrder] = useState(null);

  const handleUploadBalanceSlip = async (e, orderId) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setUploadingOrder(orderId);
      const uploadData = new FormData();
      uploadData.append('file', file);
      uploadData.append('upload_preset', 'trans_preset');

      const response = await fetch(`https://api.cloudinary.com/v1_1/dmhahancy/auto/upload`, {
        method: 'POST',
        body: uploadData
      });

      const data = await response.json();
      if (data.error) throw new Error(data.error.message);

      await updateOrderStatus(orderId, 'balance_review', { balanceSlipUrl: data.secure_url });
      setUploadingOrder(null);
      alert('Bank slip uploaded successfully!');
    } catch (err) {
      console.error(err);
      setUploadingOrder(null);
      alert('Error uploading bank slip.');
    }
  };

  useEffect(() => {
    const savedNumber = localStorage.getItem('trans_client_phone');
    if (savedNumber) {
      setWhatsappNumber(savedNumber);
    }
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    if (/^\d{10}$/.test(inputNumber)) {
      setWhatsappNumber(inputNumber);
      localStorage.setItem('trans_client_phone', inputNumber);
      setLoginError('');
    } else {
      setLoginError(t('dashboard.invalid_number'));
    }
  };

  const handleLogout = () => {
    setWhatsappNumber('');
    setInputNumber('');
    localStorage.removeItem('trans_client_phone');
  };

  if (loading) {
    return (
      <div className="container text-center mt-lg animate-fade-in">
        <h2>{t('dashboard.loading')}</h2>
      </div>
    );
  }

  if (!whatsappNumber) {
    return (
      <div className="container animate-fade-in" style={{ maxWidth: '400px' }}>
        <div className="card text-center" style={{ padding: '3rem 2rem' }}>
          <Phone size={48} color="var(--color-primary)" style={{ margin: '0 auto 1rem auto' }} />
          <h2 className="mb-md">{t('dashboard.login_title')}</h2>
          <p className="text-muted mb-md">{t('dashboard.login_desc')}</p>
          
          <form onSubmit={handleLogin}>
            <div className="form-group text-left">
              <label className="form-label">{t('dashboard.enter_whatsapp')}</label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="07xxxxxxxx" 
                value={inputNumber} 
                onChange={(e) => setInputNumber(e.target.value)}
              />
              {loginError && <span className="form-error mt-sm" style={{ display: 'block' }}>{loginError}</span>}
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>
              {t('dashboard.login_btn')}
            </button>
          </form>
        </div>
      </div>
    );
  }

  const clientOrders = orders.filter(o => o.whatsapp === whatsappNumber);

  if (clientOrders.length === 0) {
    return (
      <div className="container text-center mt-lg animate-fade-in">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h2>{t('dashboard.title')}</h2>
          <button className="btn btn-secondary" onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <LogOut size={16} /> {t('dashboard.logout_btn')}
          </button>
        </div>
        <div className="card mt-md" style={{ padding: '4rem 2rem' }}>
          <FileText size={48} color="var(--color-text-muted)" style={{ margin: '0 auto 1rem auto' }} />
          <p className="text-muted">{t('dashboard.no_orders')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <h2>{t('dashboard.your_orders')}</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span className="text-muted" style={{ fontWeight: 500 }}>{whatsappNumber}</span>
          <button className="btn btn-secondary" onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <LogOut size={16} /> {t('dashboard.logout_btn')}
          </button>
        </div>
      </div>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
        {clientOrders.map(order => (
          <div key={order.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '0.25rem' }}>{t(`docs.${order.docType}`, { defaultValue: order.docType })}</h3>
              <p className="text-muted" style={{ fontSize: '0.9rem' }}>{t('dashboard.ref_id')}: {order.id} | {t('dashboard.date')}: {new Date(order.createdAt).toLocaleDateString()}</p>
              <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>
                {t('dashboard.total')}: Rs. {order.totalPrice === 'quote' ? t('dashboard.pending_quote') : `${order.totalPrice}/-`} | 
                {t('dashboard.advance')}: Rs. {order.advancePaid}/-
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ 
                padding: '0.5rem 1rem', 
                borderRadius: 'var(--radius-full)', 
                fontSize: '0.85rem', 
                fontWeight: 600,
                display: 'flex', alignItems: 'center', gap: '0.5rem',
                backgroundColor: 
                  order.status === 'completed' ? 'rgba(16, 185, 129, 0.1)' : 
                  order.status === 'sample_ready' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(59, 130, 246, 0.1)',
                color: 
                  order.status === 'completed' ? 'var(--color-success)' : 
                  order.status === 'sample_ready' ? 'var(--color-warning)' : 'var(--color-primary)'
              }}>
                {order.status === 'completed' ? <CheckCircle size={16} /> : <Clock size={16} />}
                {t(`dashboard.status.${order.status}`)}
              </div>

              {order.status === 'sample_ready' && (
                <button className="btn btn-primary" onClick={() => alert('Viewing sample...')}>
                  {t('dashboard.view_sample')}
                </button>
              )}

              {order.status === 'balance_pending' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'flex-end' }}>
                  <span style={{ fontWeight: 'bold', color: 'var(--color-primary)' }}>
                    {t('dashboard.balance_due')}: Rs. {order.totalPrice - order.advancePaid}/-
                  </span>
                  <label className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                    <Upload size={18} /> {uploadingOrder === order.id ? t('dashboard.uploading') : t('dashboard.upload_slip')}
                    <input type="file" style={{ display: 'none' }} accept=".jpg,.jpeg,.png,.pdf" onChange={(e) => handleUploadBalanceSlip(e, order.id)} disabled={uploadingOrder === order.id} />
                  </label>
                </div>
              )}

              {order.status === 'completed' && order.completedFileUrl && (
                <a href={order.completedFileUrl} target="_blank" rel="noopener noreferrer" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}>
                  <Download size={18} /> {t('dashboard.download')}
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ClientDashboard;
