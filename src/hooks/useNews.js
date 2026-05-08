import { useState, useCallback } from 'react';
import axios from 'axios';
import { getFromStorage, saveToStorage } from '../utils/storage';

const BASE_URL = '/api/gnews';
const CATEGORIES = ['technology', 'science'];

export function useNews() {
  const [articles, setArticles] = useState({ technology: [], science: [] });
  const [loading, setLoading] = useState({ technology: false, science: false });
  const [error, setError] = useState({ technology: null, science: null });
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [activeFilter, setActiveFilter] = useState(null);

  const fetchCategory = useCallback(async (category, refresh = false) => {
    const cacheKey = `news_${category}`;
    if (!refresh) {
      const cached = getFromStorage(cacheKey);
      if (cached) {
        setArticles((prev) => ({ ...prev, [category]: cached }));
        return;
      }
    }

    setLoading((prev) => ({ ...prev, [category]: true }));
    setError((prev) => ({ ...prev, [category]: null }));

    try {
      const response = await axios.get(BASE_URL, {
        params: {
          topic: category === 'technology' ? 'technology' : 'science',
          lang: 'en',
          max: 5,
        },
      });
      const fetched = response.data.articles || [];
      setArticles((prev) => ({ ...prev, [category]: fetched }));
      saveToStorage(cacheKey, fetched);
    } catch (err) {
      const message = err?.response?.data?.message || err.message || 'Unable to fetch headlines.';
      setError((prev) => ({ ...prev, [category]: message }));
    } finally {
      setLoading((prev) => ({ ...prev, [category]: false }));
    }
  }, []);

  const fetchAll = useCallback((force = false) => {
    CATEGORIES.forEach((category) => fetchCategory(category, force));
  }, [fetchCategory]);

  const getFilteredArticles = useCallback(
    (category) => {
      let list = articles[category] || [];
      if (searchQuery) {
        list = list.filter((article) =>
          `${article.title ?? ''} ${article.description ?? ''}`.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }
      if (sortBy === 'source') {
        return [...list].sort((a, b) => (a.source?.name || '').localeCompare(b.source?.name || ''));
      }
      return [...list].sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
    },
    [articles, searchQuery, sortBy]
  );

  return {
    articles,
    loading,
    error,
    searchQuery,
    setSearchQuery,
    sortBy,
    setSortBy,
    fetchCategory,
    fetchAll,
    getFilteredArticles,
    allArticles: [...articles.technology, ...articles.science],
    activeFilter,
    setActiveFilter,
    categories: CATEGORIES,
  };
}
