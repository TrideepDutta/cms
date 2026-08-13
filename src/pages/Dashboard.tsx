import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

interface ContentFile {
  name: string;
  filename: string;
  seoTitle: string;
}

interface DashboardItem {
  key: string;
  num: string;
  label: string;
  desc: string;
  path: string;
  badgeText: string;
  badgeClass: string;
}

const pageMetaMap: Record<string, { num: string; label: string; desc: string }> = {
  home: { num: '01', label: 'Home Page', desc: 'Hero section, How We Think, Process, Why Us, Credibility, Closing CTA' },
  about: { num: '02', label: 'About Us', desc: 'Hero, pillars, process steps, What We Don\'t Do, CTA' },
  pricing: { num: '03', label: 'Pricing', desc: 'Plans, features, FAQs, After Launch, CTA' },
  contact: { num: '04', label: 'Contact', desc: 'Hero, social profiles, contact form configuration' },
  terms: { num: '05', label: 'Terms & Conditions', desc: 'Legal terms and condition sections' },
  privacy: { num: '06', label: 'Privacy Policy', desc: 'Privacy policy sections with bullet lists' },
  refund: { num: '07', label: 'Refund Policy', desc: '100% refund guarantee, eligibility, and request workflow' },
  navigation: { num: '09', label: 'Navigation Editor', desc: 'Header navigation links, main CTA, and footer link sections' },
  site: { num: '10', label: 'Site Settings', desc: 'Global configuration, site name, live URL, contact email, social links' },
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

  // Build sorted items list (01 to 10)
  const items: DashboardItem[] = [];

  files.forEach(file => {
    const meta = pageMetaMap[file.name];
    if (meta) {
      const editPath = file.name === 'site' ? '/site-settings'
        : file.name === 'navigation' ? '/navigation'
        : `/edit/${file.name}`;
      items.push({
        key: file.name,
        num: meta.num,
        label: meta.label,
        desc: meta.desc,
        path: editPath,
        badgeText: 'EDIT',
        badgeClass: 'blue',
      });
    }
  });

  // Include Blog Articles item (08)
  items.push({
    key: 'blog',
    num: '08',
    label: 'Blog Articles',
    desc: 'Create, edit, and publish blog post articles, draft status, and metadata',
    path: '/blog',
    badgeText: 'MANAGE',
    badgeClass: 'green',
  });

  // Sort items sequentially by index number (01 to 10)
  items.sort((a, b) => parseInt(a.num, 10) - parseInt(b.num, 10));

  return (
    <div>
      {/* Header */}
      <div className="cms-page-header">
        <span className="cms-eyebrow">[ SYSTEM OVERVIEW ]</span>
        <h1>Dashboard</h1>
        <p>Manage all site content, blog posts, site settings, and live deployments</p>
      </div>

      {/* Signature Rank Shift Widget */}
      <div className="cms-rank-widget">
        <div className="cms-rank-display">
          <div className="cms-rank-card-visual">
            <div className="rank-number">#1</div>
            <div className="rank-label">47 → 1 RANK UP</div>
          </div>
          <div className="cms-rank-widget-text">
            <div className="eyebrow">AGENCY CMS CONTROL PANEL</div>
            <h2>GetUsRanked Live Repository</h2>
            <p>
              Branch: <strong style={{ color: 'var(--cms-canvas)', fontFamily: 'var(--font-mono)' }}>{gitStatus.branch}</strong> • Status:{' '}
              <span className={gitStatus.clean ? 'status-clean' : 'status-pending'} style={{ color: gitStatus.clean ? 'var(--cms-green)' : undefined }}>
                {gitStatus.clean ? '✓ Clean & Synced' : '● Uncommitted Changes Pending'}
              </span>
            </p>
          </div>
        </div>

        <div>
          {!gitStatus.clean ? (
            <Link to="/push" className="cms-btn cms-btn-success">
              🚀 Push Updates →
            </Link>
          ) : (
            <Link to="/push" className="cms-btn cms-btn-ghost cms-btn-rank-widget">
              Repo Status →
            </Link>
          )}
        </div>
      </div>

      {/* Content Files Grid */}
      <div style={{ marginBottom: '1.25rem' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--cms-ink)' }}>
          Editable Pages & Content
        </h2>
      </div>

      <div className="cms-grid">
        {items.map(item => (
          <Link key={item.key} to={item.path} className="cms-grid-link">
            <div className="cms-card cms-dashboard-card">
              <div className="cms-card-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <span style={{ fontFamily: 'var(--font-numeral)', fontSize: '0.85rem', fontWeight: 700, color: 'var(--cms-blue)' }}>
                    {item.num}
                  </span>
                  <span className="cms-card-title">{item.label}</span>
                </div>
                <span className={`cms-card-badge ${item.badgeClass}`}>{item.badgeText}</span>
              </div>
              <p className="cms-card-desc">
                {item.desc}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
