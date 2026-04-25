import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { OrderContext } from '../context/OrderContext';
import { UploadCloud, CheckCircle, Loader } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const CLOUDINARY_CLOUD_NAME = "dmhahancy";
const CLOUDINARY_UPLOAD_PRESET = "trans_preset";

function OrderForm() {
  const { addOrder } = useContext(OrderContext);
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [uploadText, setUploadText] = useState('');
  const [placedOrderId, setPlacedOrderId] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '', address: '', email: '', whatsapp: '',
    docType: '', file: null, deliveryMethod: 'soft_copy', priority: 'normal'
  });
  const [errors, setErrors] = useState({});

  const DOC_TYPES = [
    { id: 'birth_cert', name: t('docs.birth_cert'), price: 1250 },
    { id: 'nic', name: t('docs.nic'), price: 1000 },
    { id: 'marriage_cert', name: t('docs.marriage_cert'), price: 1250 },
    { id: 'death_cert', name: t('docs.death_cert'), price: 1250 },
    { id: 'affidavit', name: t('docs.affidavit'), price: 1500 },
    { id: 'deed', name: t('docs.deed'), price: 'quote', note: t('docs.quote_note') },
    { id: 'foreign_emp', name: t('docs.foreign_emp'), price: 'quote', note: t('docs.quote_note') },
    { id: 'school_leaving', name: t('docs.school_leaving'), price: 1250 },
    { id: 'other', name: t('docs.other'), price: 'quote', note: t('docs.quote_note') }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setFormData({ ...formData, file: e.target.files[0] });
    }
  };

  const validateStep1 = () => {
    const newErrors = {};
    if (!formData.name) newErrors.name = t('order.error_req');
    if (!formData.address) newErrors.address = t('order.error_req');
    if (!formData.email) newErrors.email = t('order.error_req');
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = t('order.error_email');
    if (!formData.whatsapp) newErrors.whatsapp = t('order.error_req');
    else if (!/^\d{10}$/.test(formData.whatsapp)) newErrors.whatsapp = t('order.error_wa');
    if (!formData.docType) newErrors.docType = t('order.error_doc');
    if (!formData.file) newErrors.file = t('order.error_file');

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const selectedDoc = DOC_TYPES.find(d => d.id === formData.docType);
  
  let finalPrice = selectedDoc?.price;
  if (finalPrice !== 'quote' && formData.priority === 'emergency') {
    finalPrice = finalPrice * 1.25;
  }
  const advanceAmount = finalPrice === 'quote' ? 0 : (finalPrice * 0.3);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (step === 1) {
      if (validateStep1()) setStep(2);
    } else {
      setLoading(true);
      try {
        setUploadText(t('order.uploading'));
        const file = formData.file;
        const uploadData = new FormData();
        uploadData.append('file', file);
        uploadData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

        const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/auto/upload`, {
          method: 'POST',
          body: uploadData
        });

        const data = await response.json();

        if (data.error) {
          throw new Error(data.error.message);
        }

        const downloadURL = data.secure_url;
        setUploadText('Saving...');

        const orderId = await addOrder({
          customerName: formData.name,
          address: formData.address,
          email: formData.email,
          whatsapp: formData.whatsapp,
          docType: selectedDoc.id, // Save ID for dynamic translation
          fileName: file.name,
          fileUrl: downloadURL,
          deliveryMethod: formData.deliveryMethod,
          priority: formData.priority,
          totalPrice: finalPrice,
          advancePaid: advanceAmount,
        });
        
        setLoading(false);
        setPlacedOrderId(orderId);
        setStep(3);
      } catch (err) {
        console.error("Upload Error:", err);
        setLoading(false);
        alert(t('order.alert_error'));
      }
    }
  };

  return (
    <div className="container animate-fade-in" style={{ maxWidth: '800px' }}>
      <h2 className="mb-lg text-center">{t('order.title')}</h2>
      
      <div className="card">
        <div style={{ display: 'flex', marginBottom: 'var(--spacing-lg)', borderBottom: '1px solid var(--color-border)', paddingBottom: '1rem' }}>
          <div style={{ flex: 1, textAlign: 'center', color: step === 1 ? 'var(--color-primary)' : 'var(--color-text-muted)', fontWeight: step === 1 ? 'bold' : 'normal' }}>
            {t('order.step1')}
          </div>
          <div style={{ flex: 1, textAlign: 'center', color: step === 2 ? 'var(--color-primary)' : 'var(--color-text-muted)', fontWeight: step === 2 ? 'bold' : 'normal' }}>
            {t('order.step2')}
          </div>
          <div style={{ flex: 1, textAlign: 'center', color: step === 3 ? 'var(--color-success)' : 'var(--color-text-muted)', fontWeight: step === 3 ? 'bold' : 'normal' }}>
            Complete
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {step === 1 && (
            <div className="animate-fade-in">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)' }}>
                <div className="form-group">
                  <label className="form-label">{t('order.full_name')}</label>
                  <input type="text" name="name" className="form-input" value={formData.name} onChange={handleInputChange} />
                  {errors.name && <span className="form-error">{errors.name}</span>}
                </div>
                <div className="form-group">
                  <label className="form-label">{t('order.whatsapp')}</label>
                  <input type="text" name="whatsapp" className="form-input" placeholder="07xxxxxxxx" value={formData.whatsapp} onChange={handleInputChange} />
                  {errors.whatsapp && <span className="form-error">{errors.whatsapp}</span>}
                </div>
              </div>
              
              <div className="form-group">
                <label className="form-label">{t('order.email')}</label>
                <input type="email" name="email" className="form-input" value={formData.email} onChange={handleInputChange} />
                {errors.email && <span className="form-error">{errors.email}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">{t('order.address')}</label>
                <textarea name="address" className="form-textarea" rows="2" value={formData.address} onChange={handleInputChange}></textarea>
                {errors.address && <span className="form-error">{errors.address}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">{t('order.doc_type')}</label>
                <select name="docType" className="form-select" value={formData.docType} onChange={handleInputChange}>
                  <option value="">{t('order.select_doc')}</option>
                  {DOC_TYPES.map(type => (
                    <option key={type.id} value={type.id}>
                      {type.name} {type.price !== 'quote' ? `(Rs. ${type.price}/-)` : `- ${t('docs.quote_admin')}`}
                    </option>
                  ))}
                </select>
                {errors.docType && <span className="form-error">{errors.docType}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">{t('order.upload_label')}</label>
                <div style={{ border: '2px dashed var(--color-border)', padding: '2rem', textAlign: 'center', borderRadius: 'var(--radius-md)' }}>
                  <input type="file" id="file-upload" style={{ display: 'none' }} accept=".pdf,.jpg,.jpeg,.png" onChange={handleFileChange} />
                  <label htmlFor="file-upload" style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                    <UploadCloud size={48} color="var(--color-primary-light)" />
                    <span className="text-primary" style={{ fontWeight: 500 }}>{t('order.click_upload')}</span>
                    <span className="text-muted">{formData.file ? formData.file.name : t('order.no_file')}</span>
                  </label>
                </div>
                {errors.file && <span className="form-error">{errors.file}</span>}
              </div>

              <div className="flex justify-between mt-lg">
                <div></div>
                <button type="submit" className="btn btn-primary">{t('order.next_btn')}</button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="animate-fade-in">
              <div className="form-group mb-lg">
                <label className="form-label">{t('order.delivery_q')}</label>
                <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', padding: '1rem', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', flex: 1, backgroundColor: formData.deliveryMethod === 'soft_copy' ? 'var(--color-primary-light)' : 'transparent', color: formData.deliveryMethod === 'soft_copy' ? 'white' : 'var(--color-text)' }}>
                    <input type="radio" name="deliveryMethod" value="soft_copy" checked={formData.deliveryMethod === 'soft_copy'} onChange={handleInputChange} style={{ display: 'none' }} />
                    <CheckCircle size={20} style={{ opacity: formData.deliveryMethod === 'soft_copy' ? 1 : 0.2 }} />
                    {t('order.soft_copy')}
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', padding: '1rem', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', flex: 1, backgroundColor: formData.deliveryMethod === 'hard_copy' ? 'var(--color-primary-light)' : 'transparent', color: formData.deliveryMethod === 'hard_copy' ? 'white' : 'var(--color-text)' }}>
                    <input type="radio" name="deliveryMethod" value="hard_copy" checked={formData.deliveryMethod === 'hard_copy'} onChange={handleInputChange} style={{ display: 'none' }} />
                    <CheckCircle size={20} style={{ opacity: formData.deliveryMethod === 'hard_copy' ? 1 : 0.2 }} />
                    {t('order.hard_copy')}
                  </label>
                </div>
              </div>

              <div className="form-group mb-lg">
                <label className="form-label">{t('order.service_priority')}</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', padding: '1rem', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', backgroundColor: formData.priority === 'normal' ? 'var(--color-primary-light)' : 'transparent', color: formData.priority === 'normal' ? 'white' : 'var(--color-text)' }}>
                    <input type="radio" name="priority" value="normal" checked={formData.priority === 'normal'} onChange={handleInputChange} style={{ display: 'none' }} />
                    <CheckCircle size={20} style={{ opacity: formData.priority === 'normal' ? 1 : 0.2 }} />
                    {t('order.normal_service')}
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', padding: '1rem', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', backgroundColor: formData.priority === 'emergency' ? 'var(--color-primary)' : 'transparent', color: formData.priority === 'emergency' ? 'white' : 'var(--color-text)' }}>
                    <input type="radio" name="priority" value="emergency" checked={formData.priority === 'emergency'} onChange={handleInputChange} style={{ display: 'none' }} />
                    <CheckCircle size={20} style={{ opacity: formData.priority === 'emergency' ? 1 : 0.2 }} />
                    {t('order.emergency_service')}
                  </label>
                </div>
                {formData.priority === 'emergency' && (
                  <p style={{ color: 'var(--color-primary)', fontSize: '0.9rem', marginTop: '0.5rem', fontWeight: 500 }}>
                    {t('order.emergency_warn')}
                  </p>
                )}
              </div>

              <div style={{ backgroundColor: 'var(--color-background)', padding: '1.5rem', borderRadius: 'var(--radius-md)', marginBottom: 'var(--spacing-lg)' }}>
                <h3 style={{ marginBottom: '1rem' }}>{t('order.payment_summary')}</h3>
                <p><strong>{t('order.doc_selected')}:</strong> {selectedDoc?.name}</p>
                {selectedDoc?.price === 'quote' ? (
                  <div style={{ color: 'var(--color-warning)', marginTop: '0.5rem' }}>
                    <p>{t('order.price')}: <strong>{selectedDoc.note}</strong></p>
                    <p>{t('dashboard.advance')}: <strong>{t('order.advance_tbd')}</strong></p>
                    <p style={{ marginTop: '0.5rem', fontSize: '0.9rem' }}>{t('order.quote_note')}</p>
                  </div>
                ) : (
                  <>
                    <p>{t('order.total_price')}: <strong>Rs. {finalPrice}/-</strong></p>
                    <p style={{ fontSize: '1.2rem', marginTop: '1rem', color: 'var(--color-primary)' }}>{t('order.req_advance')}: <strong>Rs. {advanceAmount}/-</strong></p>
                    
                    <div className="mt-md form-group">
                      <label className="form-label">{t('order.upload_slip')}</label>
                      <input type="file" className="form-input" />
                      <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>{t('order.acc_no')}</span>
                    </div>
                  </>
                )}
              </div>

              <div className="flex justify-between items-center">
                <button type="button" className="btn btn-secondary" onClick={() => setStep(1)} disabled={loading}>{t('order.back_btn')}</button>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader className="animate-spin" size={18} /> 
                      {uploadText}
                    </>
                  ) : (
                    t('order.submit_btn')
                  )}
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="animate-fade-in text-center" style={{ padding: '2rem 0' }}>
              <CheckCircle size={64} color="var(--color-success)" style={{ margin: '0 auto 1rem auto' }} />
              <h2 style={{ marginBottom: '1rem', color: 'var(--color-success)' }}>Order Successfully Placed!</h2>
              <p style={{ fontSize: '1.2rem', marginBottom: '2rem' }}>Reference ID: <strong>{placedOrderId}</strong></p>
              
              <div style={{ backgroundColor: formData.priority === 'emergency' ? '#ef4444' : 'var(--color-primary)', padding: '2rem', borderRadius: 'var(--radius-lg)', marginBottom: '2rem', color: 'white' }}>
                <h3 style={{ marginBottom: '0.5rem', color: 'white' }}>Notify Admin via WhatsApp</h3>
                <p style={{ marginBottom: '1.5rem', opacity: 0.9 }}>
                  Click the button below to send us a quick message. This helps us process your order immediately.
                </p>
                <button type="button" className="btn" style={{ backgroundColor: 'white', color: formData.priority === 'emergency' ? '#ef4444' : 'var(--color-primary)', fontWeight: 'bold', fontSize: '1.1rem', padding: '0.75rem 2rem', width: '100%', maxWidth: '300px' }} onClick={() => {
                  const adminNumber = '94760829235';
                  let message = '';
                  if (formData.priority === 'emergency') {
                    message = encodeURIComponent(`🚨 *URGENT: New Emergency Translation Request!* 🚨\nRef ID: ${placedOrderId}\nName: ${formData.name}\nDoc: ${selectedDoc.id}`);
                  } else {
                    message = encodeURIComponent(`✅ *New Translation Request!*\nRef ID: ${placedOrderId}\nName: ${formData.name}\nDoc: ${selectedDoc.id}`);
                  }
                  window.open(`https://wa.me/${adminNumber}?text=${message}`, '_blank');
                }}>
                  Send WhatsApp Message
                </button>
              </div>

              <button type="button" className="btn btn-secondary" onClick={() => navigate('/dashboard')} style={{ width: '100%', maxWidth: '300px' }}>
                Go to My Dashboard
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

export default OrderForm;
