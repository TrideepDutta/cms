import { NavLink } from 'react-router-dom';

const pageLinks = [
  { path: '/edit/home', label: 'Home Page', icon: '🏠' },
  { path: '/edit/about', label: 'About Us', icon: '👤' },
  { path: '/edit/pricing', label: 'Pricing', icon: '💰' },
  { path: '/edit/contact', label: 'Contact', icon: '✉️' },
  { path: '/edit/terms', label: 'Terms', icon: '📋' },
  { path: '/edit/privacy', label: 'Privacy', icon: '🔒' },
  { path: '/edit/refund', label: 'Refund', icon: '↩️' },
];

export function Sidebar() {
  return (
    <aside className="cms-sidebar">
      <NavLink to="/" className="cms-sidebar-logo">
        GetUs<span>Ranked</span> CMS
      </NavLink>

      <div className="cms-sidebar-section">
        <div className="cms-sidebar-section-label">Overview</div>
      </div>
      <NavLink to="/" end className={({ isActive }) => `cms-sidebar-link ${isActive ? 'active' : ''}`}>
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
        Dashboard
      </NavLink>

      <div className="cms-sidebar-section">
        <div className="cms-sidebar-section-label">Pages</div>
      </div>
      {pageLinks.map(link => (
        <NavLink key={link.path} to={link.path} className={({ isActive }) => `cms-sidebar-link ${isActive ? 'active' : ''}`}>
          <span style={{ fontSize: '1rem' }}>{link.icon}</span>
          {link.label}
        </NavLink>
      ))}

      <div className="cms-sidebar-section">
        <div className="cms-sidebar-section-label">Content</div>
      </div>
      <NavLink to="/blog" className={({ isActive }) => `cms-sidebar-link ${isActive ? 'active' : ''}`}>
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" /></svg>
        Blog Posts
      </NavLink>
      <NavLink to="/navigation" className={({ isActive }) => `cms-sidebar-link ${isActive ? 'active' : ''}`}>
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" /></svg>
        Navigation
      </NavLink>
      <NavLink to="/site-settings" className={({ isActive }) => `cms-sidebar-link ${isActive ? 'active' : ''}`}>
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
        Site Settings
      </NavLink>

      <div className="cms-sidebar-footer">
        <NavLink to="/push" className={({ isActive }) => `cms-sidebar-link ${isActive ? 'active' : ''}`} style={{ margin: 0 }}>
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
          Push to GitHub
        </NavLink>
      </div>
    </aside>
  );
}
