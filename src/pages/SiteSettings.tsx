import { useEffect, useState, useCallback } from 'react';
import { useToast } from '../components/Toast';

interface SocialLink {
  platform: string;
  label: string;
  url: string;
}

interface SiteData {
  name: string;
  url: string;
  description: string;
  email: string;
  seoKeywords: string;
  brandTagline: string;
  socialLinks: SocialLink[];
  knowledgeTopics: string[];
}

export function SiteSettings() {
  const [data, setData] = useState<SiteData | null>(null);
  const [saving, setSaving] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    fetch('/api/content/site')
      .then(r => r.json())
      .then(setData)
      .catch(() => showToast('Failed to load site settings', 'error'));
  }, [showToast]);

  const save = useCallback(async () => {
    if (!data) return;
    setSaving(true);
    try {
      await fetch('/api/content/site', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      showToast('Site settings saved successfully');
    } catch {
      showToast('Failed to save site settings', 'error');
    }
    setSaving(false);
  }, [data, showToast]);

  const updateSocialLink = (index: number, field: keyof SocialLink, value: string) => {
    if (!data) return;
    const links = [...data.socialLinks];
    links[index] = { ...links[index], [field]: value };
    setData({ ...data, socialLinks: links });
  };

  const addSocialLink = () => {
    if (!data) return;
    setData({
      ...data,
      socialLinks: [...data.socialLinks, { platform: 'LinkedIn', label: 'LinkedIn', url: 'https://linkedin.com/' }],
    });
  };

  const removeSocialLink = (index: number) => {
    if (!data) return;
    setData({ ...data, socialLinks: data.socialLinks.filter((_, i) => i !== index) });
  };

  if (!data) return <div style={{ padding: '2rem', color: 'var(--cms-ink-soft)', fontFamily: 'var(--font-mono)' }}>Loading site settings...</div>;

  return (
    <div>
      <div className="cms-page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <span className="cms-eyebrow">[ GLOBAL CONFIGURATION ]</span>
          <h1>Site Settings</h1>
          <p>Global site configuration, agency metadata, default SEO descriptions, and social profiles</p>
        </div>
        <button className="cms-btn cms-btn-primary" onClick={save} disabled={saving}>
          {saving ? <span className="cms-spinner" /> : null}
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      <div className="cms-card">
        <div className="cms-card-header">
          <span className="cms-card-title">General Brand Information</span>
        </div>
        <div className="cms-form-row">
          <div className="cms-form-group">
            <label className="cms-label">Agency / Site Name</label>
            <input className="cms-input" value={data.name} onChange={e => setData({ ...data, name: e.target.value })} />
          </div>
          <div className="cms-form-group">
            <label className="cms-label">Canonical Live URL</label>
            <input className="cms-input" value={data.url} onChange={e => setData({ ...data, url: e.target.value })} />
          </div>
        </div>
        <div className="cms-form-row">
          <div className="cms-form-group">
            <label className="cms-label">Primary Contact Email</label>
            <input className="cms-input" value={data.email} onChange={e => setData({ ...data, email: e.target.value })} />
          </div>
          <div className="cms-form-group">
            <label className="cms-label">Footer Tagline Statement</label>
            <input className="cms-input" value={data.brandTagline} onChange={e => setData({ ...data, brandTagline: e.target.value })} />
          </div>
        </div>
        <div className="cms-form-group">
          <label className="cms-label">Global Fallback SEO Description</label>
          <textarea className="cms-textarea" rows={3} value={data.description} onChange={e => setData({ ...data, description: e.target.value })} />
        </div>
        <div className="cms-form-group">
          <label className="cms-label">Global Target Keywords (Comma Separated)</label>
          <textarea className="cms-textarea" rows={3} value={data.seoKeywords} onChange={e => setData({ ...data, seoKeywords: e.target.value })} />
        </div>
      </div>

      <div className="cms-card" style={{ marginTop: '1.5rem' }}>
        <div className="cms-card-header">
          <span className="cms-card-title">Social Media Profiles</span>
          <button className="cms-btn cms-btn-ghost cms-btn-sm" onClick={addSocialLink}>+ Add Social Link</button>
        </div>
        {data.socialLinks.map((social, idx) => (
          <div key={idx} className="cms-array-item" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ fontFamily: 'var(--font-numeral)', fontSize: '0.85rem', fontWeight: 700, color: 'var(--cms-blue)' }}>
              #{String(idx + 1).padStart(2, '0')}
            </span>
            <div style={{ flex: 1 }} className="cms-form-row">
              <input className="cms-input" placeholder="Platform" value={social.platform} onChange={e => updateSocialLink(idx, 'platform', e.target.value)} />
              <input className="cms-input" placeholder="Display Label" value={social.label} onChange={e => updateSocialLink(idx, 'label', e.target.value)} />
              <input className="cms-input" placeholder="Profile URL" value={social.url} onChange={e => updateSocialLink(idx, 'url', e.target.value)} />
            </div>
            <button className="cms-icon-btn danger" onClick={() => removeSocialLink(idx)}>✕</button>
          </div>
        ))}
      </div>
    </div>
  );
}
