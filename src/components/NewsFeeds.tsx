import React, { useState, useEffect } from 'react';
import { NewsService } from '@/services/news';

const SYMBOLS = ['BTC', 'ETH', 'SOL'];

export function NewsFeeds() {
  const [headlines, setHeadlines] = useState<Record<string, { title: string; url: string }[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNews = async () => {
      setLoading(true);
      setError(null);
      try {
        const newsService = NewsService.getInstance();
        const fetchedHeadlines: Record<string, { title: string; url: string }[]> = {};
        
        for (const symbol of SYMBOLS) {
          fetchedHeadlines[symbol] = await newsService.getLatestNews(symbol);
        }
        
        setHeadlines(fetchedHeadlines);
      } catch (err) {
        setError('Failed to fetch news headlines.');
      } finally {
        setLoading(false);
      }
    };
    fetchNews();
  }, []);

  if (loading) {
    return <div className="text-center py-4">Loading news feeds...</div>;
  }

  if (error) {
    return <div className="text-red-500 text-center py-4">{error}</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
      {SYMBOLS.map(symbol => (
        <div key={symbol} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 hover:shadow-xl transition-shadow">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{symbol} News</h3>
          <ul className="space-y-2">
            {headlines[symbol]?.length > 0 ? (
              headlines[symbol].slice(0, 5).map((item, index) => (
                <li key={index} className="text-gray-700 dark:text-gray-300 hover:text-blue-600 transition-colors">
                  <a href={item.url} target="_blank" rel="noopener noreferrer" className="block">
                    {item.title}
                  </a>
                </li>
              ))
            ) : (
              <li className="text-gray-500 dark:text-gray-400">No headlines found for {symbol}.</li>
            )}
          </ul>
        </div>
      ))}
    </div>
  );
} 