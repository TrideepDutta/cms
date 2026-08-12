import { useEffect, useState, useCallback } from 'react';
import { useToast } from '../components/Toast';

interface NavLink {
  href: string;
  label: string;
}

interface NavData {
  header: {
    navLinks: NavLink[];
    ctaText: string;
    ctaHref: string;
  };
  footer: {
    quickLinks: NavLink[];
    ctaText: string;
    ctaHref: string;
    bottomLinks: NavLink[];
  };
}

export function NavigationEditor() {
  const [data, setData] = useState<NavData | null>(null);
  const [saving, setSaving] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    fetch('/api/content/navigation')
      .then(r => r.json())
      .then(setData)
      .catch(() => showToast('Failed to load navigation data', 'error'));
  }, [showToast]);

  const save = useCallback(async () => {
    if (!data) return;
    setSaving(true);
    try {
      await fetch('/api/content/navigation', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      showToast('Navigation settings saved successfully');
    } catch {
      showToast('Failed to save navigation', 'error');
    }
    setSaving(false);
  }, [data, showToast]);

  const updateHeaderLink = (index: number, field: keyof NavLink, value: string) => {
    if (!data) return;
    const newLinks = [...data.header.navLinks];
    newLinks[index] = { ...newLinks[index], [field]: value };
    setData({ ...data, header: { ...data.header, navLinks: newLinks } });
  };

  const addHeaderLink = () => {
    if (!data) return;
    setData({
      ...data,
      header: {
        ...data.header,
        navLinks: [...data.header.navLinks, { href: '/new-page', label: 'New Link' }],
      },
    });
  };

  const removeHeaderLink = (index: number) => {
    if (!data) return;
    const newLinks = data.header.navLinks.filter((_, i) => i !== index);
    setData({ ...data, header: { ...data.header, navLinks: newLinks } });
  };

  const moveHeaderLink = (index: number, dir: 'up' | 'down') => {
    if (!data) return;
    const newLinks = [...data.header.navLinks];
    const targetIdx = dir === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= newLinks.length) return;
    [newLinks[index], newLinks[targetIdx]] = [newLinks[targetIdx], newLinks[index]];
    setData({ ...data, header: { ...data.header, navLinks: newLinks } });
  };

  const updateFooterLink = (index: number, field: keyof NavLink, value: string) => {
    if (!data) return;
    const newLinks = [...data.footer.quickLinks];
    newLinks[index] = { ...newLinks[index], [field]: value };
    setData({ ...data, footer: { ...data.footer, quickLinks: newLinks } });
  };

  const addFooterLink = () => {
    if (!data) return;
    setData({
      ...data,
      footer: {
        ...data.footer,
        quickLinks: [...data.footer.quickLinks, { href: '/new-page', label: 'New Link' }],
      },
    });
  };

  const removeFooterLink = (index: number) => {
    if (!data) return;
    const newLinks = data.footer.quickLinks.filter((_, i) => i !== index);
    setData({ ...data, footer: { ...data.footer, quickLinks: newLinks } });
  };

  const moveFooterLink = (index: number, dir: 'up' | 'down') => {
    if (!data) return;
    const newLinks = [...data.footer.quickLinks];
    const targetIdx = dir === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= newLinks.length) return;
    [newLinks[index], newLinks[targetIdx]] = [newLinks[targetIdx], newLinks[index]];
    setData({ ...data, footer: { ...data.footer, quickLinks: newLinks } });
  };

  if (!data) return <div style={{ padding: '2rem', color: 'var(--cms-ink-soft)', fontFamily: 'var(--font-mono)' }}>Loading navigation...</div>;

  return (
    <div>
      <div className="cms-page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <span className="cms-eyebrow">[ SITE STRUCTURE ]</span>
          <h1>Navigation Editor</h1>
          <p>Configure header menu links, call-to-action buttons, and footer quick links</p>
        </div>
        <button className="cms-btn cms-btn-primary" onClick={save} disabled={saving}>
          {saving ? <span className="cms-spinner" /> : null}
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {/* Header Nav Section */}
      <div className="cms-card">
        <div className="cms-card-header">
          <span className="cms-card-title">Header Navigation Menu</span>
          <button className="cms-btn cms-btn-ghost cms-btn-sm" onClick={addHeaderLink}>+ Add Link</button>
        </div>

        <div className="cms-form-row" style={{ marginBottom: '1.5rem' }}>
          <div>
            <label className="cms-label">Header CTA Button Text</label>
            <input className="cms-input" value={data.header.ctaText} onChange={e => setData({ ...data, header: { ...data.header, ctaText: e.target.value } })} />
          </div>
          <div>
            <label className="cms-label">Header CTA Target Link</label>
            <input className="cms-input" value={data.header.ctaHref} onChange={e => setData({ ...data, header: { ...data.header, ctaHref: e.target.value } })} />
          </div>
        </div>

        <label className="cms-label">Menu Navigation Links [{data.header.navLinks.length}]</label>
        {data.header.navLinks.map((link, idx) => (
          <div key={idx} className="cms-array-item" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ fontFamily: 'var(--font-numeral)', fontSize: '0.85rem', fontWeight: 700, color: 'var(--cms-blue)' }}>
              #{String(idx + 1).padStart(2, '0')}
            </span>
            <div style={{ flex: 1 }} className="cms-form-row">
              <input className="cms-input" placeholder="Display Label" value={link.label} onChange={e => updateHeaderLink(idx, 'label', e.target.value)} />
              <input className="cms-input" placeholder="Target URL (/path)" value={link.href} onChange={e => updateHeaderLink(idx, 'href', e.target.value)} />
            </div>
            <div className="cms-array-item-actions">
              <button className="cms-icon-btn" disabled={idx === 0} onClick={() => moveHeaderLink(idx, 'up')}>↑</button>
              <button className="cms-icon-btn" disabled={idx === data.header.navLinks.length - 1} onClick={() => moveHeaderLink(idx, 'down')}>↓</button>
              <button className="cms-icon-btn danger" onClick={() => removeHeaderLink(idx)}>✕</button>
            </div>
          </div>
        ))}
      </div>

      {/* Footer Nav Section */}
      <div className="cms-card" style={{ marginTop: '1.5rem' }}>
        <div className="cms-card-header">
          <span className="cms-card-title">Footer Navigation & Links</span>
          <button className="cms-btn cms-btn-ghost cms-btn-sm" onClick={addFooterLink}>+ Add Quick Link</button>
        </div>

        <div className="cms-form-row" style={{ marginBottom: '1.5rem' }}>
          <div>
            <label className="cms-label">Footer CTA Text</label>
            <input className="cms-input" value={data.footer.ctaText} onChange={e => setData({ ...data, footer: { ...data.footer, ctaText: e.target.value } })} />
          </div>
          <div>
            <label className="cms-label">Footer CTA Target Link</label>
            <input className="cms-input" value={data.footer.ctaHref} onChange={e => setData({ ...data, footer: { ...data.footer, ctaHref: e.target.value } })} />
          </div>
        </div>

        <label className="cms-label">Footer Quick Links [{data.footer.quickLinks.length}]</label>
        {data.footer.quickLinks.map((link, idx) => (
          <div key={idx} className="cms-array-item" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ fontFamily: 'var(--font-numeral)', fontSize: '0.85rem', fontWeight: 700, color: 'var(--cms-blue)' }}>
              #{String(idx + 1).padStart(2, '0')}
            </span>
            <div style={{ flex: 1 }} className="cms-form-row">
              <input className="cms-input" placeholder="Display Label" value={link.label} onChange={e => updateFooterLink(idx, 'label', e.target.value)} />
              <input className="cms-input" placeholder="Target URL (/path)" value={link.href} onChange={e => updateFooterLink(idx, 'href', e.target.value)} />
            </div>
            <div className="cms-array-item-actions">
              <button className="cms-icon-btn" disabled={idx === 0} onClick={() => moveFooterLink(idx, 'up')}>↑</button>
              <button className="cms-icon-btn" disabled={idx === data.footer.quickLinks.length - 1} onClick={() => moveFooterLink(idx, 'down')}>↓</button>
              <button className="cms-icon-btn danger" onClick={() => removeFooterLink(idx)}>✕</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
