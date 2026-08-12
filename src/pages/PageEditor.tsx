import { useEffect, useState, useCallback, type ReactNode } from 'react';
import { useParams } from 'react-router-dom';
import { useToast } from '../components/Toast';

const PAGE_TITLES: Record<string, string> = {
  home: 'Home Page',
  about: 'About Us',
  pricing: 'Pricing',
  contact: 'Contact',
  terms: 'Terms & Conditions',
  privacy: 'Privacy Policy',
  refund: 'Refund Policy',
};

export function PageEditor() {
  const { page } = useParams<{ page: string }>();
  const [data, setData] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [openSections, setOpenSections] = useState<Set<string>>(new Set());
  const [newSectionName, setNewSectionName] = useState('');
  const [showAddSection, setShowAddSection] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    if (!page) return;
    fetch(`/api/content/${page}`)
      .then(r => r.json())
      .then(d => {
        setData(d);
        const keys = Object.keys(d).filter(k => typeof d[k] === 'object' && !Array.isArray(d[k]) && k !== 'seo');
        setOpenSections(new Set(keys));
      })
      .catch(() => showToast('Failed to load content', 'error'));
  }, [page]);

  const save = useCallback(async () => {
    if (!page || !data) return;
    setSaving(true);
    try {
      await fetch(`/api/content/${page}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      showToast(`${PAGE_TITLES[page] || page} saved successfully`);
    } catch {
      showToast('Failed to save', 'error');
    }
    setSaving(false);
  }, [page, data, showToast]);

  const updateField = useCallback((path: string[], value: any) => {
    setData((prev: any) => {
      const newData = JSON.parse(JSON.stringify(prev));
      let obj = newData;
      for (let i = 0; i < path.length - 1; i++) {
        obj = obj[path[i]];
      }
      obj[path[path.length - 1]] = value;
      return newData;
    });
  }, []);

  const toggleSection = (key: string) => {
    setOpenSections(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const addArrayItem = useCallback((path: string[], template: any) => {
    setData((prev: any) => {
      const newData = JSON.parse(JSON.stringify(prev));
      let obj = newData;
      for (const key of path) {
        obj = obj[key];
      }
      obj.push(typeof template === 'object' ? { ...template } : template);
      return newData;
    });
  }, []);

  const duplicateArrayItem = useCallback((path: string[], index: number) => {
    setData((prev: any) => {
      const newData = JSON.parse(JSON.stringify(prev));
      let obj = newData;
      for (const key of path) {
        obj = obj[key];
      }
      const itemToDuplicate = JSON.parse(JSON.stringify(obj[index]));
      obj.splice(index + 1, 0, itemToDuplicate);
      return newData;
    });
  }, []);

  const removeArrayItem = useCallback((path: string[], index: number) => {
    setData((prev: any) => {
      const newData = JSON.parse(JSON.stringify(prev));
      let obj = newData;
      for (const key of path) {
        obj = obj[key];
      }
      obj.splice(index, 1);
      return newData;
    });
  }, []);

  const moveArrayItem = useCallback((path: string[], index: number, direction: 'up' | 'down') => {
    setData((prev: any) => {
      const newData = JSON.parse(JSON.stringify(prev));
      let obj = newData;
      for (const key of path) {
        obj = obj[key];
      }
      const newIndex = direction === 'up' ? index - 1 : index + 1;
      if (newIndex < 0 || newIndex >= obj.length) return prev;
      [obj[index], obj[newIndex]] = [obj[newIndex], obj[index]];
      return newData;
    });
  }, []);

  const handleAddNewSection = () => {
    if (!newSectionName.trim() || !data) return;
    const cleanKey = newSectionName.trim().replace(/[^a-zA-Z0-9_]/g, '');
    if (data[cleanKey]) {
      showToast('Section name already exists', 'error');
      return;
    }
    const newSectionData = {
      visible: true,
      eyebrow: cleanKey,
      heading: `New ${cleanKey} Section`,
      body: 'Section body description goes here...',
      items: [],
    };

    setData((prev: any) => {
      const updated = { ...prev, [cleanKey]: newSectionData };
      if (Array.isArray(updated.sectionOrder)) {
        updated.sectionOrder = [...updated.sectionOrder, cleanKey];
      }
      return updated;
    });

    setOpenSections(prev => new Set([...prev, cleanKey]));
    setNewSectionName('');
    setShowAddSection(false);
    showToast(`Added new section: ${cleanKey}`);
  };

  const handleDeleteSection = (sectionKey: string) => {
    if (!confirm(`Are you sure you want to delete the section "${sectionKey}"?`)) return;
    setData((prev: any) => {
      const updated = { ...prev };
      delete updated[sectionKey];
      if (Array.isArray(updated.sectionOrder)) {
        updated.sectionOrder = updated.sectionOrder.filter((k: string) => k !== sectionKey);
      }
      return updated;
    });
    showToast(`Deleted section: ${sectionKey}`);
  };

  if (!data) return <div style={{ padding: '2rem', color: 'var(--cms-text-soft)' }}>Loading page content...</div>;

  const sectionKeys = Object.keys(data).filter(k => typeof data[k] === 'object' && !Array.isArray(data[k]) && k !== 'seo');

  return (
    <div>
      <div className="cms-page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1>{PAGE_TITLES[page || ''] || page}</h1>
          <p>Edit content, reorder, add, or morph sections for {PAGE_TITLES[page || ''] || page}</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className="cms-btn cms-btn-ghost" onClick={() => setShowAddSection(!showAddSection)}>
            + Add Section
          </button>
          <button className="cms-btn cms-btn-primary" onClick={save} disabled={saving}>
            {saving ? <span className="cms-spinner" /> : null}
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* Add New Section Modal / Bar */}
      {showAddSection && (
        <div className="cms-card" style={{ background: 'rgba(36, 81, 214, 0.1)', borderColor: 'var(--cms-blue)', marginBottom: '1.5rem' }}>
          <div className="cms-card-header">
            <span className="cms-card-title">Add Custom Page Section</span>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <input
              className="cms-input"
              placeholder="e.g. testimonials, services, features"
              value={newSectionName}
              onChange={e => setNewSectionName(e.target.value)}
            />
            <button className="cms-btn cms-btn-primary" onClick={handleAddNewSection}>Add Section</button>
            <button className="cms-btn cms-btn-ghost" onClick={() => setShowAddSection(false)}>Cancel</button>
          </div>
        </div>
      )}

      {/* Quick Jump Bar */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
        <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--cms-text-soft)', alignSelf: 'center' }}>Sections:</span>
        {data.seo && (
          <button className="cms-btn cms-btn-ghost cms-btn-sm" onClick={() => toggleSection('seo')}>🔍 SEO</button>
        )}
        {data.sectionOrder && (
          <button className="cms-btn cms-btn-ghost cms-btn-sm" onClick={() => toggleSection('sectionOrder')}>📐 Order</button>
        )}
        {sectionKeys.map(k => (
          <button
            key={k}
            className={`cms-btn cms-btn-sm ${openSections.has(k) ? 'cms-btn-primary' : 'cms-btn-ghost'}`}
            onClick={() => toggleSection(k)}
          >
            {k}
          </button>
        ))}
      </div>

      {/* SEO Section */}
      {data.seo && (
        <div className="cms-section">
          <div className="cms-section-header" onClick={() => toggleSection('seo')}>
            <span className="cms-section-title">🔍 SEO Settings</span>
            <span className={`cms-section-toggle ${openSections.has('seo') ? 'open' : ''}`}>▼</span>
          </div>
          {openSections.has('seo') && (
            <div className="cms-section-body">
              <div className="cms-form-group">
                <label className="cms-label">Page Title</label>
                <input className="cms-input" value={data.seo.title || ''} onChange={e => updateField(['seo', 'title'], e.target.value)} />
              </div>
              <div className="cms-form-group">
                <label className="cms-label">Meta Description</label>
                <textarea className="cms-textarea" rows={3} value={data.seo.description || ''} onChange={e => updateField(['seo', 'description'], e.target.value)} />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Section Order (if present) */}
      {data.sectionOrder && (
        <div className="cms-section">
          <div className="cms-section-header" onClick={() => toggleSection('sectionOrder')}>
            <span className="cms-section-title">📐 Page Section Order</span>
            <span className={`cms-section-toggle ${openSections.has('sectionOrder') ? 'open' : ''}`}>▼</span>
          </div>
          {openSections.has('sectionOrder') && (
            <div className="cms-section-body">
              {data.sectionOrder.map((sectionId: string, idx: number) => (
                <div key={idx} className="cms-array-item" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--cms-text-soft)' }}>#{idx + 1}</span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.88rem', fontWeight: 600 }}>{sectionId}</span>
                  </div>
                  <div className="cms-array-item-actions">
                    <button className="cms-icon-btn" disabled={idx === 0} onClick={() => moveArrayItem(['sectionOrder'], idx, 'up')}>↑</button>
                    <button className="cms-icon-btn" disabled={idx === data.sectionOrder.length - 1} onClick={() => moveArrayItem(['sectionOrder'], idx, 'down')}>↓</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Dynamic Sections */}
      {Object.entries(data).map(([key, value]) => {
        if (key === 'seo' || key === 'sectionOrder') return null;
        if (typeof value !== 'object' || value === null) {
          return (
            <div key={key} className="cms-form-group">
              <label className="cms-label">{key}</label>
              {typeof value === 'string' && value.length > 100 ? (
                <textarea className="cms-textarea" rows={4} value={String(value)} onChange={e => updateField([key], e.target.value)} />
              ) : (
                <input className="cms-input" value={String(value)} onChange={e => updateField([key], e.target.value)} />
              )}
            </div>
          );
        }

        return (
          <div key={key} className="cms-section">
            <div className="cms-section-header" onClick={() => toggleSection(key)}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span className="cms-section-title">{key}</span>
                {(value as any).visible !== undefined && (
                  <label className="cms-toggle" onClick={e => e.stopPropagation()}>
                    <input type="checkbox" checked={(value as any).visible} onChange={e => updateField([key, 'visible'], e.target.checked)} />
                    <span className="cms-toggle-slider" />
                  </label>
                )}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <button
                  type="button"
                  className="cms-icon-btn danger"
                  title="Delete Section"
                  onClick={e => {
                    e.stopPropagation();
                    handleDeleteSection(key);
                  }}
                >
                  🗑️
                </button>
                <span className={`cms-section-toggle ${openSections.has(key) ? 'open' : ''}`}>▼</span>
              </div>
            </div>
            {openSections.has(key) && (
              <div className="cms-section-body">
                {renderObjectFields(value as Record<string, any>, [key], updateField, addArrayItem, duplicateArrayItem, removeArrayItem, moveArrayItem)}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function renderObjectFields(
  obj: Record<string, any>,
  basePath: string[],
  updateField: (path: string[], value: any) => void,
  addArrayItem: (path: string[], template: any) => void,
  duplicateArrayItem: (path: string[], index: number) => void,
  removeArrayItem: (path: string[], index: number) => void,
  moveArrayItem: (path: string[], index: number, direction: 'up' | 'down') => void,
): ReactNode {
  return (
    <>
      {Object.entries(obj).map(([key, value]) => {
        if (key === 'visible') return null;
        const currentPath = [...basePath, key];

        if (typeof value === 'boolean') {
          return (
            <div key={key} className="cms-form-group" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <label className="cms-toggle">
                <input type="checkbox" checked={value} onChange={e => updateField(currentPath, e.target.checked)} />
                <span className="cms-toggle-slider" />
              </label>
              <label className="cms-label" style={{ marginBottom: 0 }}>{key}</label>
            </div>
          );
        }

        if (typeof value === 'number') {
          return (
            <div key={key} className="cms-form-group">
              <label className="cms-label">{key}</label>
              <input className="cms-input" type="number" value={value} onChange={e => updateField(currentPath, Number(e.target.value))} />
            </div>
          );
        }

        if (typeof value === 'string') {
          const isLong = value.length > 120 || value.includes('\n');
          return (
            <div key={key} className="cms-form-group">
              <label className="cms-label">{key}</label>
              {isLong ? (
                <textarea className="cms-textarea" rows={Math.min(8, Math.max(3, value.split('\n').length + 1))} value={value} onChange={e => updateField(currentPath, e.target.value)} />
              ) : (
                <input className="cms-input" value={value} onChange={e => updateField(currentPath, e.target.value)} />
              )}
            </div>
          );
        }

        if (Array.isArray(value)) {
          return (
            <div key={key} className="cms-form-group">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <label className="cms-label" style={{ marginBottom: 0 }}>{key} ({value.length} items)</label>
                <button className="cms-btn cms-btn-ghost cms-btn-sm" onClick={() => {
                  const template = value.length > 0 ?
                    (typeof value[0] === 'object' ?
                      Object.fromEntries(Object.entries(value[0]).map(([k, v]) => [k, typeof v === 'string' ? '' : typeof v === 'number' ? 0 : typeof v === 'boolean' ? false : Array.isArray(v) ? [] : '']))
                      : '')
                    : '';
                  addArrayItem(currentPath, template);
                }}>
                  + Add Item
                </button>
              </div>
              {value.map((item: any, idx: number) => (
                <div key={idx} className="cms-array-item">
                  <div className="cms-array-item-header">
                    <span className="cms-array-item-number">
                      Item {idx + 1}{typeof item === 'object' && item.title ? ` — ${item.title}` : typeof item === 'object' && item.label ? ` — ${item.label}` : typeof item === 'object' && item.name ? ` — ${item.name}` : ''}
                    </span>
                    <div className="cms-array-item-actions">
                      <button className="cms-icon-btn" title="Duplicate" onClick={() => duplicateArrayItem(currentPath, idx)}>📋</button>
                      <button className="cms-icon-btn" disabled={idx === 0} onClick={() => moveArrayItem(currentPath, idx, 'up')}>↑</button>
                      <button className="cms-icon-btn" disabled={idx === value.length - 1} onClick={() => moveArrayItem(currentPath, idx, 'down')}>↓</button>
                      <button className="cms-icon-btn danger" onClick={() => removeArrayItem(currentPath, idx)}>✕</button>
                    </div>
                  </div>
                  {typeof item === 'string' ? (
                    <input className="cms-input" value={item} onChange={e => updateField([...currentPath, String(idx)], e.target.value)} />
                  ) : typeof item === 'object' ? (
                    renderObjectFields(item, [...currentPath, String(idx)], updateField, addArrayItem, duplicateArrayItem, removeArrayItem, moveArrayItem)
                  ) : null}
                </div>
              ))}
            </div>
          );
        }

        if (typeof value === 'object' && value !== null) {
          return (
            <div key={key} className="cms-card" style={{ marginLeft: '0.5rem', borderColor: 'var(--cms-border)' }}>
              <div className="cms-card-header">
                <span className="cms-card-title" style={{ fontSize: '0.9rem' }}>{key}</span>
              </div>
              {renderObjectFields(value, currentPath, updateField, addArrayItem, duplicateArrayItem, removeArrayItem, moveArrayItem)}
            </div>
          );
        }

        return null;
      })}
    </>
  );
}
