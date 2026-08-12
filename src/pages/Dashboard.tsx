import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

interface ContentFile {
  name: string;
  filename: string;
  seoTitle: string;
}

const pageLabels: Record<string, { icon: string; label: string; desc: string }> = {
  home: { icon: '🏠', label: 'Home Page', desc: 'Hero section, How We Think, Process, Why Us, Credibility, Closing CTA' },
  about: { icon: '👤', label: 'About Us', desc: 'Hero, pillars, process steps, What We Don\'t Do, CTA' },
  pricing: { icon: '💰', label: 'Pricing', desc: 'Plans, features, FAQs, After Launch, CTA' },
  contact: { icon: '✉️', label: 'Contact', desc: 'Hero, social profiles, contact form config' },
  terms: { icon: '📋', label: 'Terms & Conditions', desc: 'Legal terms sections' },
  privacy: { icon: '🔒', label: 'Privacy Policy', desc: 'Privacy policy sections with bullet lists' },
  refund: { icon: '↩️', label: 'Refund Policy', desc: 'Guarantee, eligibility, process' },
  site: { icon: '⚙️', label: 'Site Settings', desc: 'Global config, name, URL, email, social links' },
  navigation: { icon: '🔗', label: 'Navigation', desc: 'Header and footer navigation links' },
};

export function Dashboard() {
  const [files, setFiles] = useState<ContentFile[]>([]);
  const [gitStatus, setGitStatus] = useState<{ clean: boolean; branch: string }>({ clean: true, branch: 'main' });

  useEffect(() => {
    fetch('/api/content')
      .then(r => r.json())
      .then(setFiles)
      .catch(console.error);

    fetch('/api/git/status')
      .then(r => r.json())
      .then(setGitStatus)
      .catch(console.error);
  }, []);

  return (
    <div>
      <div className="cms-page-header">
        <h1>Dashboard</h1>
        <p>Manage all your website content from one place</p>
      </div>

      {/* Git Status Card */}
      <div className="cms-card" style={{ marginBottom: '2rem' }}>
        <div className="cms-card-header">
          <span className="cms-card-title">Repository Status</span>
          <span className={`cms-card-badge ${gitStatus.clean ? 'green' : 'gold'}`}>
            {gitStatus.clean ? '✓ Clean' : '● Uncommitted Changes'}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--cms-text-soft)' }}>
            Branch: <strong style={{ color: 'var(--cms-text)' }}>{gitStatus.branch}</strong>
          </span>
          {!gitStatus.clean && (
            <Link to="/push" className="cms-btn cms-btn-success cms-btn-sm">
              Push to GitHub →
            </Link>
          )}
        </div>
      </div>

      {/* Content Files Grid */}
      <div className="cms-grid">
        {files.map(file => {
          const meta = pageLabels[file.name];
          const editPath = file.name === 'site' ? '/site-settings'
            : file.name === 'navigation' ? '/navigation'
            : `/edit/${file.name}`;

          return (
            <Link key={file.name} to={editPath} className="cms-grid-link">
              <div className="cms-card">
                <div className="cms-card-header">
                  <span className="cms-card-title">
                    {meta?.icon || '📄'} {meta?.label || file.name}
                  </span>
                  <span className="cms-card-badge blue">Edit</span>
                </div>
                <p style={{ color: 'var(--cms-text-soft)', fontSize: '0.82rem', lineHeight: '1.5' }}>
                  {meta?.desc || file.seoTitle}
                </p>
              </div>
            </Link>
          );
        })}

        {/* Blog Manager Card */}
        <Link to="/blog" className="cms-grid-link">
          <div className="cms-card">
            <div className="cms-card-header">
              <span className="cms-card-title">📝 Blog Posts</span>
              <span className="cms-card-badge green">Manage</span>
            </div>
            <p style={{ color: 'var(--cms-text-soft)', fontSize: '0.82rem', lineHeight: '1.5' }}>
              Create, edit, and manage blog post content and metadata
            </p>
          </div>
        </Link>
      </div>
    </div>
  );
}
