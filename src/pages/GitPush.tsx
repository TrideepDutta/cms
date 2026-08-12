import { useEffect, useState, useCallback } from 'react';
import { useToast } from '../components/Toast';

export function GitPush() {
  const [status, setStatus] = useState<{ status: string; branch: string; clean: boolean } | null>(null);
  const [diff, setDiff] = useState<{ diff: string; stagedDiff: string } | null>(null);
  const [commitMessage, setCommitMessage] = useState('');
  const [pushing, setPushing] = useState(false);
  const { showToast } = useToast();

  const loadStatus = useCallback(() => {
    fetch('/api/git/status')
      .then(r => r.json())
      .then(setStatus)
      .catch(console.error);

    fetch('/api/git/diff')
      .then(r => r.json())
      .then(setDiff)
      .catch(console.error);
  }, []);

  useEffect(() => {
    loadStatus();
  }, [loadStatus]);

  const handlePush = async () => {
    setPushing(true);
    try {
      const res = await fetch('/api/git/push', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: commitMessage || undefined }),
      });
      const resData = await res.json();
      if (res.ok) {
        showToast('🚀 Changes pushed to GitHub successfully!');
        setCommitMessage('');
        loadStatus();
      } else {
        showToast(`Failed to push: ${resData.error}`, 'error');
      }
    } catch {
      showToast('Error pushing to GitHub', 'error');
    }
    setPushing(false);
  };

  if (!status) return <div style={{ padding: '2rem', color: 'var(--cms-text-soft)' }}>Checking git repository status...</div>;

  return (
    <div>
      <div className="cms-page-header">
        <h1>Push Updates to GitHub</h1>
        <p>Review changes and deploy them to your live website with one click</p>
      </div>

      <div className="cms-card">
        <div className="cms-card-header">
          <span className="cms-card-title">One-Click Deploy</span>
          <span className={`cms-card-badge ${status.clean ? 'green' : 'gold'}`}>
            Branch: {status.branch}
          </span>
        </div>

        {status.clean ? (
          <div style={{ padding: '1.5rem 0', textAlign: 'center' }}>
            <p style={{ color: 'var(--cms-green)', fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.5rem' }}>
              ✓ All local updates are synced with GitHub!
            </p>
            <p style={{ color: 'var(--cms-text-soft)', fontSize: '0.85rem' }}>
              Your working tree is clean. Any edits you make in the CMS will appear here ready to push.
            </p>
          </div>
        ) : (
          <div>
            <div className="cms-form-group">
              <label className="cms-label">Commit Message (Optional)</label>
              <input
                className="cms-input"
                placeholder={`CMS update — ${new Date().toLocaleString()}`}
                value={commitMessage}
                onChange={e => setCommitMessage(e.target.value)}
              />
            </div>

            <button
              className="cms-btn cms-btn-success"
              style={{ width: '100%', justifyContent: 'center', padding: '0.85rem', fontSize: '0.88rem' }}
              onClick={handlePush}
              disabled={pushing}
            >
              {pushing ? <span className="cms-spinner" /> : null}
              {pushing ? 'Committing & Pushing to GitHub...' : '🚀 Push Updates to GitHub Now'}
            </button>
          </div>
        )}
      </div>

      {/* Changed Files List */}
      {status.status && (
        <div className="cms-card" style={{ marginTop: '1.5rem' }}>
          <div className="cms-card-header">
            <span className="cms-card-title">Changed Files</span>
          </div>
          <pre className="cms-git-status">{status.status}</pre>
        </div>
      )}

      {/* Diff View */}
      {diff && (diff.diff || diff.stagedDiff) && (
        <div className="cms-card" style={{ marginTop: '1.5rem' }}>
          <div className="cms-card-header">
            <span className="cms-card-title">Diff Preview</span>
          </div>
          <pre className="cms-git-status" style={{ maxHeight: '400px' }}>
            {(diff.diff + '\n' + diff.stagedDiff).split('\n').map((line, idx) => {
              let className = '';
              if (line.startsWith('+') && !line.startsWith('+++')) className = 'cms-diff-add';
              if (line.startsWith('-') && !line.startsWith('---')) className = 'cms-diff-remove';
              return (
                <div key={idx} className={className}>
                  {line}
                </div>
              );
            })}
          </pre>
        </div>
      )}
    </div>
  );
}
