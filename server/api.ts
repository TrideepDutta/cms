import express from 'express';
import cors from 'cors';
import { readFileSync, writeFileSync, readdirSync, existsSync, unlinkSync, mkdirSync } from 'fs';
import { join, resolve } from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const ASTRO_ROOT = resolve(__dirname, '../../getusranked');
const DATA_DIR = join(ASTRO_ROOT, 'src/data');
const BLOG_DIR = join(ASTRO_ROOT, 'src/content/blog');

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Ensure required directories exist
if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
if (!existsSync(BLOG_DIR)) mkdirSync(BLOG_DIR, { recursive: true });

// ─── Content File CRUD ───

// List all content files
app.get('/api/content', (_req, res) => {
  try {
    const files = readdirSync(DATA_DIR)
      .filter(f => f.endsWith('.json'))
      .map(f => {
        const fullPath = join(DATA_DIR, f);
        const content = JSON.parse(readFileSync(fullPath, 'utf-8'));
        return {
          name: f.replace('.json', ''),
          filename: f,
          seoTitle: content.seo?.title || content.heading || f,
          lastModified: new Date().toISOString(),
        };
      });
    res.json(files);
  } catch (err) {
    res.status(500).json({ error: 'Failed to list content files' });
  }
});

// Read a content file
app.get('/api/content/:file', (req, res) => {
  try {
    const filePath = join(DATA_DIR, `${req.params.file}.json`);
    if (!existsSync(filePath)) {
      return res.status(404).json({ error: 'File not found' });
    }
    const content = JSON.parse(readFileSync(filePath, 'utf-8'));
    res.json(content);
  } catch (err) {
    res.status(500).json({ error: 'Failed to read content file' });
  }
});

// Write a content file
app.put('/api/content/:file', (req, res) => {
  try {
    const filePath = join(DATA_DIR, `${req.params.file}.json`);
    writeFileSync(filePath, JSON.stringify(req.body, null, 2) + '\n', 'utf-8');
    res.json({ success: true, file: req.params.file });
  } catch (err) {
    res.status(500).json({ error: 'Failed to write content file' });
  }
});

// ─── Blog Post CRUD ───

app.get('/api/blog', (_req, res) => {
  try {
    const files = readdirSync(BLOG_DIR)
      .filter(f => f.endsWith('.md') || f.endsWith('.mdx'))
      .map(f => {
        const content = readFileSync(join(BLOG_DIR, f), 'utf-8');
        const frontmatter = parseFrontmatter(content);
        return {
          slug: f.replace(/\.(md|mdx)$/, ''),
          filename: f,
          ...frontmatter,
        };
      });
    res.json(files);
  } catch (err) {
    res.status(500).json({ error: 'Failed to list blog posts' });
  }
});

app.get('/api/blog/:slug', (req, res) => {
  try {
    const filePath = join(BLOG_DIR, `${req.params.slug}.md`);
    if (!existsSync(filePath)) {
      return res.status(404).json({ error: 'Blog post not found' });
    }
    const content = readFileSync(filePath, 'utf-8');
    const frontmatter = parseFrontmatter(content);
    const body = content.replace(/^---[\s\S]*?---\r?\n*/, '');
    res.json({ ...frontmatter, body, raw: content });
  } catch (err) {
    res.status(500).json({ error: 'Failed to read blog post' });
  }
});

app.put('/api/blog/:slug', (req, res) => {
  try {
    const filePath = join(BLOG_DIR, `${req.params.slug}.md`);
    const { frontmatter, body } = req.body;
    const yaml = Object.entries(frontmatter || {})
      .map(([key, value]) => {
        if (Array.isArray(value)) {
          return `${key}:\n${value.map(v => `  - "${v}"`).join('\n')}`;
        }
        if (typeof value === 'boolean') return `${key}: ${value}`;
        return `${key}: "${String(value).replace(/"/g, '\\"')}"`;
      })
      .join('\n');
    const content = `---\n${yaml}\n---\n\n${body || ''}\n`;
    writeFileSync(filePath, content, 'utf-8');
    res.json({ success: true, slug: req.params.slug });
  } catch (err) {
    res.status(500).json({ error: 'Failed to write blog post' });
  }
});

app.delete('/api/blog/:slug', (req, res) => {
  try {
    const filePath = join(BLOG_DIR, `${req.params.slug}.md`);
    if (existsSync(filePath)) {
      unlinkSync(filePath);
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete blog post' });
  }
});

// ─── Git Operations ───

app.get('/api/git/status', (_req, res) => {
  try {
    const status = execSync('git status --short', { cwd: ASTRO_ROOT, encoding: 'utf-8' });
    const branch = execSync('git branch --show-current', { cwd: ASTRO_ROOT, encoding: 'utf-8' }).trim() || 'main';
    res.json({ status: status.trim(), branch, clean: status.trim() === '' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/git/diff', (_req, res) => {
  try {
    const diff = execSync('git diff', { cwd: ASTRO_ROOT, encoding: 'utf-8' });
    const stagedDiff = execSync('git diff --cached', { cwd: ASTRO_ROOT, encoding: 'utf-8' });
    res.json({ diff, stagedDiff });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

const VERCEL_DEPLOY_HOOK = 'https://api.vercel.com/v1/integrations/deploy/prj_3rmdL3Xejui1qT6tuxBeZ0chqXG2/eb5rxGK9EQ';

app.post('/api/git/push', async (req, res) => {
  try {
    const message = req.body.message || `CMS update — ${new Date().toLocaleString()}`;
    const branch = execSync('git branch --show-current', { cwd: ASTRO_ROOT, encoding: 'utf-8' }).trim() || 'main';
    
    execSync('git add .', { cwd: ASTRO_ROOT, encoding: 'utf-8' });
    
    try {
      execSync(`git commit -m "${message.replace(/"/g, '\\"')}"`, { cwd: ASTRO_ROOT, encoding: 'utf-8' });
    } catch (commitErr: any) {
      if (commitErr.message?.includes('nothing to commit') || commitErr.stdout?.includes('nothing to commit')) {
        return res.json({ success: true, message: 'No changes to push', output: 'Working tree clean' });
      }
      throw commitErr;
    }

    const output = execSync(`git push origin ${branch}`, { cwd: ASTRO_ROOT, encoding: 'utf-8', stdio: 'pipe' });

    // Trigger Vercel Deploy Hook automatically
    let hookStatus = '';
    try {
      const hookRes = await fetch(VERCEL_DEPLOY_HOOK, { method: 'POST' });
      if (hookRes.ok) hookStatus = ' (Vercel deployment triggered)';
    } catch (e) {}

    res.json({ success: true, message: message + hookStatus, output: output || 'Pushed successfully' });
  } catch (err: any) {
    res.status(500).json({ error: err.stderr || err.stdout || err.message });
  }
});

// ─── Helpers ───

function parseFrontmatter(content: string): Record<string, any> {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return {};
  const yaml = match[1];
  const result: Record<string, any> = {};
  let currentKey = '';
  let collectingArray = false;
  const arrayValues: string[] = [];

  for (const rawLine of yaml.split(/\r?\n/)) {
    const line = rawLine.trimEnd();
    if (collectingArray) {
      if (line.match(/^\s+-\s/)) {
        arrayValues.push(line.replace(/^\s+-\s*"?|"?\s*$/g, ''));
        continue;
      } else {
        result[currentKey] = [...arrayValues];
        arrayValues.length = 0;
        collectingArray = false;
      }
    }

    const kvMatch = line.match(/^(\w+):\s*(.*)$/);
    if (kvMatch) {
      const [, key, rawValue] = kvMatch;
      currentKey = key;
      const value = rawValue.replace(/^"|"$/g, '');

      if (rawValue === '' || rawValue === undefined) {
        collectingArray = true;
        continue;
      }
      if (value === 'true') result[key] = true;
      else if (value === 'false') result[key] = false;
      else result[key] = value;
    }
  }

  if (collectingArray) {
    result[currentKey] = [...arrayValues];
  }

  return result;
}

// ─── Start ───

const PORT = 4322;
app.listen(PORT, () => {
  console.log(`\n  🚀 CMS API server running at http://localhost:${PORT}`);
  console.log(`  📂 Astro project: ${ASTRO_ROOT}`);
  console.log(`  📄 Data directory: ${DATA_DIR}\n`);
});
