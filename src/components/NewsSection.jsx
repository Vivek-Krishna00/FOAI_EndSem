import React, { useEffect } from 'react';
import toast from 'react-hot-toast';

function ArticleCard({ article }) {
  const date = article.publishedAt
    ? new Date(article.publishedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    : 'Unknown date';

  return (
    <div className="glass-card p-4 flex flex-col gap-3 hover:bg-white/10 transition-all duration-200">
      {article.urlToImage && (
        <img
          src={article.urlToImage}
          alt={article.title}
          className="w-full h-36 object-cover rounded-xl opacity-90"
          onError={(e) => { e.target.style.display = 'none'; }}
        />
      )}
      <div className="flex items-center gap-2">
        <span className="stat-chip">{article.source?.name || 'Source'}</span>
        <span className="text-slate-400 text-xs font-mono ml-auto">{date}</span>
      </div>
      <h4 className="text-white font-display font-semibold text-sm leading-snug overflow-hidden max-h-[3rem]">{article.title}</h4>
      {article.author && <p className="text-slate-500 text-xs">By {article.author}</p>}
      {article.description && <p className="text-slate-400 text-xs leading-relaxed overflow-hidden max-h-[4rem]">{article.description}</p>}
      <a
        href={article.url}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-auto btn-ghost text-center text-xs py-2"
      >
        Read More →
      </a>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="glass-card p-4 space-y-3">
      <div className="skeleton h-36 w-full rounded-xl" />
      <div className="skeleton h-4 w-24 rounded" />
      <div className="skeleton h-4 w-full rounded" />
      <div className="skeleton h-4 w-3/4 rounded" />
      <div className="skeleton h-10 w-full rounded-xl" />
    </div>
  );
}

export default function NewsSection({ newsHook }) {
  const {
    loading,
    error,
    searchQuery,
    setSearchQuery,
    sortBy,
    setSortBy,
    fetchCategory,
    fetchAll,
    getFilteredArticles,
    categories,
    activeFilter,
    setActiveFilter,
  } = newsHook;

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const handleRefresh = (category) => {
    fetchCategory(category, true);
    toast.success(`${category} news refreshed!`);
  };

  const categoryIcons = { technology: '💻', science: '🔬' };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div>
          <h2 className="font-display font-bold text-2xl text-white">News Dashboard</h2>
          <p className="text-slate-400 text-sm">Latest Technology and Science headlines</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <input
            type="text"
            placeholder="Search articles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-2xl px-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 w-72"
          />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-2xl px-3 py-2 text-sm text-slate-300 focus:outline-none focus:border-cyan-500/50"
          >
            <option value="date">Sort: Date</option>
            <option value="source">Sort: Source</option>
          </select>
        </div>
      </div>

      {activeFilter && (
        <div className="flex items-center gap-3 text-slate-400 text-sm">
          <span>Filtering: <span className="text-cyan-400 capitalize">{activeFilter}</span></span>
          <button onClick={() => setActiveFilter(null)} className="text-xs text-slate-500 hover:text-white">Clear</button>
        </div>
      )}

      {categories
        .filter((category) => !activeFilter || category === activeFilter)
        .map((category) => {
          const articles = getFilteredArticles(category);
          return (
            <section key={category} className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{categoryIcons[category]}</span>
                  <h3 className="font-display font-semibold text-white capitalize">{category}</h3>
                  <span className="stat-chip">{articles.length} articles</span>
                </div>
                <button
                  onClick={() => handleRefresh(category)}
                  disabled={loading[category]}
                  className="btn-ghost text-xs py-2 disabled:opacity-50"
                >
                  {loading[category] ? 'Refreshing…' : '↻ Refresh'}
                </button>
              </div>

              {error[category] && (
                <div className="glass-card p-4 border-red-500/30 bg-red-500/5 flex items-center justify-between">
                  <span className="text-red-400 text-sm">{error[category]}</span>
                  <button onClick={() => handleRefresh(category)} className="text-cyan-400 text-sm hover:underline">Retry</button>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                {loading[category]
                  ? [...Array(5)].map((_, index) => <SkeletonCard key={index} />)
                  : articles.length > 0
                    ? articles.map((article, index) => <ArticleCard key={index} article={article} />)
                    : (
                      <div className="col-span-full glass-card p-8 text-center text-slate-500">
                        No articles found{searchQuery ? ` for "${searchQuery}"` : ''}.
                      </div>
                    )}
              </div>
            </section>
          );
        })}
    </div>
  );
}
