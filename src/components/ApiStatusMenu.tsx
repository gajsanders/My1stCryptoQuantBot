import React, { useState, useEffect } from 'react';

const STATUS_COLORS: Record<string, string> = {
  ok: 'bg-green-500',
  error: 'bg-red-500',
  unknown: 'bg-gray-400',
};

const STATUS_LABELS: Record<string, string> = {
  ok: 'Online',
  error: 'Error',
  unknown: 'Unknown',
};

const API_LABELS: Record<string, string> = {
  binance: 'Binance',
  openai: 'OpenAI',
  news: 'News',
  redis: 'Redis',
  mongodb: 'MongoDB',
};

export function ApiStatusMenu() {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && !status && !loading) {
      setLoading(true);
      fetch('/api/status')
        .then((res) => res.json())
        .then((data) => setStatus(data))
        .catch(() => setStatus(null))
        .finally(() => setLoading(false));
    }
  }, [open, status, loading]);

  return (
    <div className="relative inline-block text-left z-50">
      <button
        className="flex items-center justify-center w-10 h-10 rounded-full bg-white shadow hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
        aria-label="Open API status menu"
        onClick={() => setOpen((v) => !v)}
      >
        <span className="sr-only">Open API status menu</span>
        <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg ring-1 ring-black ring-opacity-5 p-4 animate-fade-in">
          <h3 className="text-lg font-semibold mb-2 text-gray-900">API Connectivity</h3>
          {loading && <div className="text-gray-500">Checking status...</div>}
          {!loading && status && (
            <ul className="space-y-2">
              {Object.keys(API_LABELS).map((key) => (
                <li key={key} className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <span className={`inline-block w-3 h-3 rounded-full ${STATUS_COLORS[status[key] || 'unknown']}`}></span>
                    <span className="text-gray-800">{API_LABELS[key]}</span>
                  </span>
                  <span className="text-sm text-gray-500">{STATUS_LABELS[status[key] || 'unknown']}</span>
                </li>
              ))}
            </ul>
          )}
          {!loading && !status && (
            <div className="text-red-500">Failed to load status.</div>
          )}
        </div>
      )}
    </div>
  );
} 