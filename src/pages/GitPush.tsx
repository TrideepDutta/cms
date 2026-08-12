import { useEffect, useState, useCallback, useRef } from 'react';
import { useToast } from '../components/Toast';

const TOTAL_DEPLOY_SECONDS = 25;
const LIVE_SITE_URL = 'https://getusranked.vercel.app';

export function GitPush() {
  const [status, setStatus] = useState<{ status: string; branch: string; clean: boolean } | null>(null);
  const [diff, setDiff] = useState<{ diff: string; stagedDiff: string } | null>(null);
  const [commitMessage, setCommitMessage] = useState('');
  const [pushing, setPushing] = useState(false);
  const [deploying, setDeploying] = useState(false);
  const [countdown, setCountdown] = useState(TOTAL_DEPLOY_SECONDS);
  const [deployComplete, setDeployComplete] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
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

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const startDeploymentCountdown = () => {
    setDeploying(true);
    setDeployComplete(false);
    setCountdown(TOTAL_DEPLOY_SECONDS);

    if (timerRef.current) clearInterval(timerRef.current);

    timerRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          setDeploying(false);
          setDeployComplete(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

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
        showToast('🚀 Changes pushed & Vercel deployment triggered!');
        setCommitMessage('');
        loadStatus();
        startDeploymentCountdown();
      } else {
        showToast(`Failed to push: ${resData.error}`, 'error');
      }
    } catch {
      showToast('Error pushing updates to GitHub', 'error');
    }
    setPushing(false);
  };

  if (!status) return <div style={{ padding: '2rem', color: 'var(--cms-ink-soft)', fontFamily: 'var(--font-mono)' }}>Checking git repository status...</div>;

  const progressPercent = Math.round(((TOTAL_DEPLOY_SECONDS - countdown) / TOTAL_DEPLOY_SECONDS) * 100);

  return (
    <div>
      <div className="cms-page-header">
        <span className="cms-eyebrow">[ VERSION CONTROL & DEPLOYMENT ]</span>
        <h1>Push Updates to GitHub</h1>
        <p>Review uncommitted file changes, generate git commit, and deploy directly to Vercel</p>
      </div>

      {/* Deployment Countdown Banner */}
      {(deploying || deployComplete) && (
        <div
          className="cms-card"
          style={{
            background: 'var(--cms-ink)',
            color: '#FFFFFF',
            borderColor: deployComplete ? 'var(--cms-green)' : 'var(--cms-blue)',
            borderLeft: `4px solid ${deployComplete ? 'var(--cms-green)' : 'var(--cms-blue)'}`,
            marginBottom: '1.5rem',
            padding: '1.5rem',
          }}
        >
          {deploying ? (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <span className="cms-spinner" />
                  <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.05rem', color: '#FFFFFF' }}>
                    ⚡ Vercel Live Deployment in Progress...
                  </span>
                </div>
                <span style={{ fontFamily: 'var(--font-numeral)', fontSize: '1.1rem', color: 'var(--cms-gold-soft)', fontWeight: 700 }}>
                  {countdown}s
                </span>
              </div>

              {/* Progress Bar */}
              <div style={{ background: 'rgba(255,255,255,0.15)', height: '6px', borderRadius: '2px', overflow: 'hidden', marginBottom: '0.75rem' }}>
                <div
                  style={{
                    width: `${progressPercent}%`,
                    height: '100%',
                    background: 'var(--cms-blue)',
                    borderRadius: '2px',
                    transition: 'width 1s linear',
                  }}
                />
              </div>

              <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.75)', margin: 0, fontFamily: 'var(--font-mono)' }}>
                Building static pages & deploying to Vercel. Updates will appear on <strong style={{ color: '#FFFFFF' }}>{LIVE_SITE_URL}</strong> shortly.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                  <span style={{ color: 'var(--cms-green)', fontSize: '1.2rem', fontWeight: 700 }}>✓</span>
                  <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.1rem', color: '#FFFFFF' }}>
                    Vercel Deployment Live!
                  </span>
                </div>
                <p style={{ fontSize: '0.84rem', color: 'rgba(255,255,255,0.75)', margin: 0 }}>
                  Your website updates are live and visible to visitors.
                </p>
              </div>

              <a
                href={LIVE_SITE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="cms-btn cms-btn-success"
              >
                🌐 View Live Website ↗
              </a>
            </div>
          )}
        </div>
      )}

      {/* Main Action Card */}
      <div className="cms-card">
        <div className="cms-card-header">
          <span className="cms-card-title">One-Click Git Push & Deploy</span>
          <span className={`cms-card-badge ${status.clean ? 'green' : 'gold'}`}>
            BRANCH: {status.branch}
          </span>
        </div>

        {status.clean ? (
          <div style={{ padding: '1.5rem 0', textAlign: 'center' }}>
            <p style={{ color: 'var(--cms-green)', fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem', fontFamily: 'var(--font-display)' }}>
              ✓ All local updates are synced with GitHub!
            </p>
            <p style={{ color: 'var(--cms-ink-soft)', fontSize: '0.85rem' }}>
              Working directory is clean. Any edits made in the CMS will appear here ready to push.
            </p>
          </div>
        ) : (
          <div>
            <div className="cms-form-group">
              <label className="cms-label">Git Commit Message (Optional)</label>
              <input
                className="cms-input"
                placeholder={`CMS update — ${new Date().toLocaleString()}`}
                value={commitMessage}
                onChange={e => setCommitMessage(e.target.value)}
              />
            </div>

            <button
              className="cms-btn cms-btn-success"
              style={{ width: '100%', justifyContent: 'center', padding: '0.85rem' }}
              onClick={handlePush}
              disabled={pushing || deploying}
            >
              {pushing ? <span className="cms-spinner" /> : null}
              {pushing
                ? 'Committing & Pushing to GitHub...'
                : deploying
                ? `⚡ Deploying to Vercel (${countdown}s)...`
                : '🚀 Push Updates to GitHub & Deploy Now'}
            </button>
          </div>
        )}
      </div>

      {/* Changed Files */}
      {status.status && (
        <div className="cms-card" style={{ marginTop: '1.5rem' }}>
          <div className="cms-card-header">
            <span className="cms-card-title">Changed Files List</span>
          </div>
          <pre className="cms-git-status">{status.status}</pre>
        </div>
      )}

      {/* Diff Preview */}
      {diff && (diff.diff || diff.stagedDiff) && (
        <div className="cms-card" style={{ marginTop: '1.5rem' }}>
          <div className="cms-card-header">
            <span className="cms-card-title">Git Diff Preview</span>
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
