import React, { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import ISSTracker from './components/ISSTracker';
import NewsSection from './components/NewsSection';
import NewsChart from './components/NewsChart';
import Chatbot from './components/Chatbot';
import ThemeToggle from './components/ThemeToggle';
import { useISS } from './hooks/useISS';
import { useNews } from './hooks/useNews';
import { saveTheme, loadTheme } from './utils/storage';

const TABS = [
  { id: 'iss', label: 'ISS Tracker', icon: '🛸' },
  { id: 'news', label: 'News', icon: '📰' },
  { id: 'charts', label: 'Analytics', icon: '📊' },
];

export default function App() {
  const [theme, setTheme] = useState(loadTheme);
  const [activeTab, setActiveTab] = useState('iss');
  const issData = useISS();
  const newsHook = useNews();

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    saveTheme(theme);
  }, [theme]);

  const toggleTheme = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'));
  const handleFilterChange = (category) => {
    newsHook.setActiveFilter(category);
    setActiveTab('news');
  };

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-space-950' : 'bg-slate-100'} transition-colors duration-300`}>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#0a1628',
            color: '#e2e8f0',
            border: '1px solid rgba(34,211,238,0.2)',
            fontFamily: 'DM Sans',
          },
        }}
      />

      <header className={`sticky top-0 z-40 ${theme === 'dark' ? 'bg-space-950/90' : 'bg-white/90'} backdrop-blur-md border-b ${theme === 'dark' ? 'border-white/10' : 'border-slate-200'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 flex items-center justify-center text-lg">🛰️</div>
            <div>
              <p className="font-display font-bold text-white text-lg">SpaceSync</p>
              <p className="hidden sm:block font-body text-sm text-slate-400">Space Dashboard</p>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-3 glass-card px-3 py-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-mono text-xs text-slate-400">LIVE ISS</span>
            {issData.position ? (
              <span className="font-mono text-xs text-cyan-400">
                {issData.position.lat.toFixed(2)}°, {issData.position.lon.toFixed(2)}°
              </span>
            ) : (
              <span className="font-mono text-xs text-slate-400">Waiting for data...</span>
            )}
          </div>

          <ThemeToggle theme={theme} onToggle={toggleTheme} />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-wrap gap-1">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-body border-b-2 transition-all duration-150 ${
                  activeTab === tab.id
                    ? 'border-cyan-400 text-cyan-400'
                    : 'border-transparent text-slate-500 hover:text-slate-300'
                }`}
              >
                <span>{tab.icon}</span>
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {activeTab === 'iss' && <ISSTracker issData={issData} />}
        {activeTab === 'news' && <NewsSection newsHook={newsHook} />}
        {activeTab === 'charts' && (
          <div className="space-y-6">
            <div>
              <h2 className="font-display font-bold text-2xl text-white">Analytics</h2>
              <p className="text-slate-400 text-sm">Visual insights from your dashboard data</p>
            </div>

            <div className="grid gap-6 xl:grid-cols-[0.55fr_0.45fr]">
              <NewsChart articles={newsHook.articles} onFilterChange={handleFilterChange} />

              <div className="space-y-6">
                <div className="glass-card p-5">
                  <div className="flex items-center justify-between gap-4 mb-4">
                    <div>
                      <p className="text-slate-400 text-xs uppercase tracking-[0.2em]">ISS Speed</p>
                      <p className="font-display font-semibold text-white text-3xl mt-1">
                        {issData.speed?.toLocaleString() ?? '—'}
                        <span className="text-sm text-slate-400 ml-2">km/h</span>
                      </p>
                    </div>
                    <div className="stat-chip">Live</div>
                  </div>
                  <div className="bg-white/5 rounded-full h-3 overflow-hidden">
                    <div
                      className="h-3 rounded-full bg-gradient-to-r from-cyan-500 to-amber-400"
                      style={{ width: `${Math.min(((issData.speed ?? 27600) / 30000) * 100, 100)}%` }}
                    />
                  </div>
                  <p className="text-slate-500 text-xs mt-3">Orbital velocity shown as progress against a high-end ISS speed.</p>
                </div>

                <div className="glass-card p-5">
                  <h3 className="font-display font-semibold text-white mb-4">Speed History</h3>
                  <div className="space-y-3">
                    {(issData.speedHistory || []).slice(-8).map((entry, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex items-center justify-between text-xs text-slate-400">
                          <span>{entry.time}</span>
                          <span>{entry.speed.toLocaleString()} km/h</span>
                        </div>
                        <div className="bg-white/5 rounded-full h-3 overflow-hidden">
                          <div
                            className="h-3 rounded-full bg-cyan-500"
                            style={{ width: `${Math.min((entry.speed / 30000) * 100, 100)}%` }}
                          />
                        </div>
                      </div>
                    ))}
                    {(issData.speedHistory || []).length === 0 && (
                      <p className="text-slate-500 text-sm">Waiting for ISS speed readings...</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <Chatbot issData={issData} newsData={newsHook.articles} />
    </div>
  );
}
