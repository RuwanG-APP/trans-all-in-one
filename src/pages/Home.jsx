import { Link } from 'react-router-dom';
import { ShieldCheck, Clock, Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next';

function Home() {
  const { t } = useTranslation();

  return (
    <div className="container animate-fade-in">
      {/* Hero Section */}
      <section style={{ 
        padding: 'var(--spacing-xl) 0', 
        textAlign: 'center',
        background: 'linear-gradient(135deg, var(--color-primary-dark) 0%, var(--color-primary) 100%)',
        color: 'white',
        borderRadius: 'var(--radius-xl)',
        marginBottom: 'var(--spacing-xl)',
        boxShadow: 'var(--shadow-lg)'
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: 'var(--spacing-xl)' }}>
          <h1 style={{ fontSize: '3rem', marginBottom: 'var(--spacing-md)' }}>{t('home.title')}</h1>
          <p style={{ fontSize: '1.2rem', marginBottom: 'var(--spacing-xl)', opacity: 0.9 }}>
            {t('home.subtitle')}
          </p>
          <div className="flex justify-center gap-md">
            <Link to="/order" className="btn" style={{ backgroundColor: 'var(--color-accent)', color: 'white', fontSize: '1.1rem', padding: '1rem 2rem' }}>
              {t('home.start_btn')}
            </Link>
            <Link to="/dashboard" className="btn" style={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white', backdropFilter: 'blur(10px)' }}>
              {t('home.status_btn')}
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mb-lg">
        <h2 className="text-center mb-lg" style={{ fontSize: '2rem' }}>{t('home.why_choose_us')}</h2>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
          gap: 'var(--spacing-lg)' 
        }}>
          <div className="card text-center stagger-1">
            <div style={{ color: 'var(--color-primary)', marginBottom: 'var(--spacing-md)', display: 'flex', justifyContent: 'center' }}>
              <ShieldCheck size={48} />
            </div>
            <h3>{t('home.feature1_title')}</h3>
            <p className="text-muted">{t('home.feature1_desc')}</p>
          </div>
          <div className="card text-center stagger-2">
            <div style={{ color: 'var(--color-primary)', marginBottom: 'var(--spacing-md)', display: 'flex', justifyContent: 'center' }}>
              <Clock size={48} />
            </div>
            <h3>{t('home.feature2_title')}</h3>
            <p className="text-muted">{t('home.feature2_desc')}</p>
          </div>
          <div className="card text-center stagger-3">
            <div style={{ color: 'var(--color-primary)', marginBottom: 'var(--spacing-md)', display: 'flex', justifyContent: 'center' }}>
              <Globe size={48} />
            </div>
            <h3>{t('home.feature3_title')}</h3>
            <p className="text-muted">{t('home.feature3_desc')}</p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;
