import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FileText, LayoutDashboard, Settings, Globe, Menu, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

function Navbar() {
  const location = useLocation();
  const { t, i18n } = useTranslation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  return (
    <header style={{ 
      backgroundColor: 'var(--color-surface)', 
      borderBottom: '1px solid var(--color-border)',
      position: 'sticky',
      top: 0,
      zIndex: 10,
      boxShadow: 'var(--shadow-sm)'
    }}>
      <div className="container navbar-container flex items-center justify-between" style={{ height: '70px' }}>
        <Link to="/" className="flex items-center gap-sm text-primary" style={{ fontWeight: 'bold', fontSize: '1.25rem' }}>
          <div style={{
            width: '40px', height: '40px', 
            backgroundColor: 'var(--color-primary)', 
            color: 'white',
            borderRadius: 'var(--radius-md)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <FileText size={24} />
          </div>
          Trans-All In One
        </Link>
        
        {/* Mobile Menu Toggle Button */}
        <button 
          className="mobile-menu-btn" 
          style={{ border: 'none', padding: '0.5rem', cursor: 'pointer' }}
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>

        <nav className={`nav-menu gap-md ${isMenuOpen ? 'open' : ''}`}>
          <Link to="/" onClick={() => setIsMenuOpen(false)} style={{ color: location.pathname === '/' ? 'var(--color-primary)' : 'var(--color-text)', fontWeight: 500 }}>
            {t('nav.home')}
          </Link>
          <Link to="/order" onClick={() => setIsMenuOpen(false)} className="btn btn-primary hide-mobile" style={{ padding: '0.5rem 1rem' }}>
            {t('nav.translate_now')}
          </Link>
          <div className="desktop-divider hide-mobile" style={{ width: '1px', height: '24px', backgroundColor: 'var(--color-border)', margin: '0 0.5rem' }}></div>
          <Link to="/dashboard" onClick={() => setIsMenuOpen(false)} title={t('nav.dashboard')} style={{ color: location.pathname === '/dashboard' ? 'var(--color-primary)' : 'var(--color-text)' }}>
            <LayoutDashboard size={20} style={{ display: 'inline', marginRight: '8px' }} />
            <span className="mobile-only-text" style={{ display: 'none' }}>Dashboard</span>
          </Link>
          <Link to="/admin" onClick={() => setIsMenuOpen(false)} title={t('nav.admin')} style={{ color: location.pathname === '/admin' ? 'var(--color-primary)' : 'var(--color-text)' }}>
            <Settings size={20} style={{ display: 'inline', marginRight: '8px' }} />
            <span className="mobile-only-text" style={{ display: 'none' }}>Admin</span>
          </Link>

          {/* Language Switcher */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', padding: '0.25rem', backgroundColor: 'var(--color-background)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
            <Globe size={16} className="text-muted" style={{ margin: '0 0.25rem' }} />
            <button 
              onClick={() => changeLanguage('en')}
              style={{ background: i18n.language === 'en' ? 'var(--color-primary)' : 'transparent', color: i18n.language === 'en' ? 'white' : 'var(--color-text)', border: 'none', padding: '0.25rem 0.5rem', borderRadius: 'var(--radius-sm)', fontSize: '0.8rem', fontWeight: 'bold' }}
            >EN</button>
            <button 
              onClick={() => changeLanguage('si')}
              style={{ background: i18n.language === 'si' ? 'var(--color-primary)' : 'transparent', color: i18n.language === 'si' ? 'white' : 'var(--color-text)', border: 'none', padding: '0.25rem 0.5rem', borderRadius: 'var(--radius-sm)', fontSize: '0.8rem', fontWeight: 'bold' }}
            >සිං</button>
            <button 
              onClick={() => changeLanguage('ta')}
              style={{ background: i18n.language === 'ta' ? 'var(--color-primary)' : 'transparent', color: i18n.language === 'ta' ? 'white' : 'var(--color-text)', border: 'none', padding: '0.25rem 0.5rem', borderRadius: 'var(--radius-sm)', fontSize: '0.8rem', fontWeight: 'bold' }}
            >தமி</button>
          </div>
        </nav>
      </div>
    </header>
  );
}

export default Navbar;
