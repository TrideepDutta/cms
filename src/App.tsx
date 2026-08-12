import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './pages/Dashboard';
import { PageEditor } from './pages/PageEditor';
import { SiteSettings } from './pages/SiteSettings';
import { NavigationEditor } from './pages/NavigationEditor';
import { BlogManager } from './pages/BlogManager';
import { GitPush } from './pages/GitPush';
import { ToastProvider } from './components/Toast';

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <div className="cms-layout">
          <Sidebar />
          <main className="cms-main">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/edit/:page" element={<PageEditor />} />
              <Route path="/site-settings" element={<SiteSettings />} />
              <Route path="/navigation" element={<NavigationEditor />} />
              <Route path="/blog" element={<BlogManager />} />
              <Route path="/push" element={<GitPush />} />
            </Routes>
          </main>
        </div>
      </ToastProvider>
    </BrowserRouter>
  );
}
