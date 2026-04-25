import { useContext, useState } from 'react';
import { OrderContext } from '../context/OrderContext';
import { Upload, MessageSquare, ExternalLink } from 'lucide-react';
import { useTranslation } from 'react-i18next';

function AdminDashboard() {
  const { orders, updateOrderStatus, loading } = useContext(OrderContext);
  const [quoteInputs, setQuoteInputs] = useState({});
  const { t } = useTranslation();

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

  const handleUploadSample = async (orderId) => {
    // In the future, this would upload a sample file to Firebase Storage
    await updateOrderStatus(orderId, 'sample_ready');
    alert('Low resolution sample marked as ready!');
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

  if (loading) return <div className="container text-center mt-lg">Loading orders...</div>;

  return (
    <div className="container animate-fade-in">
      <h2 className="mb-md text-primary">Admin Control Panel</h2>
      <p className="text-muted mb-lg">Manage all translation requests here.</p>

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
                  <p><strong>Status:</strong> <span style={{ textTransform: 'uppercase', fontWeight: 'bold' }}>{order.status}</span></p>
                </div>
                <div>
                  <h4>Pricing</h4>
                  {order.totalPrice === 'quote' ? (
                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                      <input 
                        type="number" 
                        placeholder="Enter Price" 
                        className="form-input" 
                        style={{ padding: '0.25rem 0.5rem', width: '120px' }}
                        value={quoteInputs[order.id] || ''}
                        onChange={(e) => setQuoteInputs({...quoteInputs, [order.id]: e.target.value})}
                      />
                      <button className="btn btn-secondary" style={{ padding: '0.25rem 0.5rem' }} onClick={() => handleSendQuote(order)}>
                        Send
                      </button>
                    </div>
                  ) : (
                    <>
                      <p><strong>Total:</strong> Rs. {order.totalPrice}/-</p>
                      <p><strong>Advance:</strong> Rs. {order.advancePaid}/-</p>
                    </>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', flexWrap: 'wrap' }}>
                {order.status === 'pending' && order.totalPrice !== 'quote' && (
                  <button className="btn btn-primary" onClick={() => handleAccept(order)}>
                    Accept & Notify Client
                  </button>
                )}
                
                {(order.status === 'accepted' || order.status === 'sample_ready') && (
                  <>
                    <button className="btn btn-secondary" onClick={() => handleUploadSample(order.id)}>
                      <Upload size={18} /> Mark Sample Ready
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
    </div>
  );
}

export default AdminDashboard;
