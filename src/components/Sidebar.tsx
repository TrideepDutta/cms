import { NavLink } from 'react-router-dom';

const pageLinks = [
  { path: '/edit/home', label: 'Home Page', num: '01' },
  { path: '/edit/about', label: 'About Us', num: '02' },
  { path: '/edit/pricing', label: 'Pricing', num: '03' },
  { path: '/edit/contact', label: 'Contact', num: '04' },
  { path: '/edit/terms', label: 'Terms & Conditions', num: '05' },
  { path: '/edit/privacy', label: 'Privacy Policy', num: '06' },
  { path: '/edit/refund', label: 'Refund Policy', num: '07' },
];

export function Sidebar() {
  return (
    <aside className="cms-sidebar">
      <NavLink to="/" className="cms-sidebar-logo">
        <span>GetUs<span className="brand-highlight">Ranked</span></span>
        <span className="cms-pill">CMS</span>
      </NavLink>

      <div className="cms-sidebar-section">
        <div className="cms-sidebar-section-label">Overview</div>
      </div>
      <NavLink to="/" end className={({ isActive }) => `cms-sidebar-link ${isActive ? 'active' : ''}`}>
        <span className="nav-numeral">00</span>
        Dashboard
      </NavLink>

      <div className="cms-sidebar-section">
        <div className="cms-sidebar-section-label">Pages</div>
      </div>
      {pageLinks.map(link => (
        <NavLink key={link.path} to={link.path} className={({ isActive }) => `cms-sidebar-link ${isActive ? 'active' : ''}`}>
          <span className="nav-numeral">{link.num}</span>
          {link.label}
        </NavLink>
      ))}

      <div className="cms-sidebar-section">
        <div className="cms-sidebar-section-label">Content & Config</div>
      </div>
      <NavLink to="/blog" className={({ isActive }) => `cms-sidebar-link ${isActive ? 'active' : ''}`}>
        <span className="nav-numeral">08</span>
        Blog Posts
      </NavLink>
      <NavLink to="/navigation" className={({ isActive }) => `cms-sidebar-link ${isActive ? 'active' : ''}`}>
        <span className="nav-numeral">09</span>
        Navigation
      </NavLink>
      <NavLink to="/site-settings" className={({ isActive }) => `cms-sidebar-link ${isActive ? 'active' : ''}`}>
        <span className="nav-numeral">10</span>
        Site Settings
      </NavLink>

      <div className="cms-sidebar-footer">
        <NavLink to="/push" className="cms-btn cms-btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
          Push to GitHub →
        </NavLink>
      </div>
    </aside>
  );
}
