'use client';

import { useState } from 'react';
import { AnalysisResult } from '@/types';
import { AnalysisService } from '@/services/analysis';
import { BinanceService } from '@/services/binance';
import { SentimentService } from '@/services/sentiment';
import { PriceChart } from '@/components/PriceChart';
import { TradingRecommendations } from '@/components/TradingRecommendations';
import { ApiStatusMenu } from '@/components/ApiStatusMenu';
import { NewsFeeds } from '@/components/NewsFeeds';
import { ThemeToggle } from '@/components/ThemeToggle';

export default function Home() {
  const [symbol, setSymbol] = useState('BTCUSDT');
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    setLoading(true);
    setError(null);
    try {
      // const binanceService = BinanceService.getInstance();
      // const analysisService = AnalysisService.getInstance();
      // const sentimentService = SentimentService.getInstance();

      // const technicalData = await binanceService.getTechnicalData(symbol);
      // const sentimentData = await sentimentService.getSentimentAnalysis(symbol);
      // const result = await analysisService.getAnalysis(symbol, technicalData, sentimentData);
      
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ symbol }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to fetch analysis');
      }

      const result: AnalysisResult = await response.json();

      setAnalysis(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 md:px-6 lg:px-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="max-w-6xl mx-auto space-y-10">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white text-center flex-grow">
            Crypto Analysis Bot
          </h1>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <ApiStatusMenu />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 md:p-8">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
            <input
              type="text"
              value={symbol}
              onChange={(e) => setSymbol(e.target.value.toUpperCase())}
              placeholder="Enter symbol (e.g., BTCUSDT)"
              className="flex-grow px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-gray-800 dark:text-gray-200 dark:bg-gray-700"
            />
            <button
              onClick={handleAnalyze}
              disabled={loading}
              className="w-full sm:w-auto px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Analyzing...' : 'Analyze'}
            </button>
          </div>
        </div>

        <NewsFeeds />

        {error && (
          <div className="bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-200 px-4 py-3 rounded-lg mb-8">
            {error}
          </div>
        )}

        {analysis && (
          <div className="space-y-10">
            {(() => {
              const dailyData = analysis.technicalData.find(data => data.timeframe === '1d');
              if (!dailyData) return null;
              
              return (
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 md:p-8">
                  <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
                    Technical Analysis
                  </h2>
                  <PriceChart data={dailyData} />
                </div>
              );
            })()}

            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 md:p-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
                Trading Recommendations
              </h2>
              <TradingRecommendations recommendations={analysis.recommendations} />
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 md:p-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
                Market Sentiment
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 md:p-6">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    Short Term
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300">
                    {analysis.sentimentData.shortTermSentiment.rationale}
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 md:p-6">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    Long Term
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300">
                    {analysis.sentimentData.longTermSentiment.rationale}
                  </p>
                </div>
              </div>
              {/* Display News Headlines */}
              {analysis.sentimentData.newsHeadlines && analysis.sentimentData.newsHeadlines.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Headlines Used for Analysis</h3>
                  <ul className="list-disc list-inside space-y-1 text-gray-700 dark:text-gray-300">
                    {analysis.sentimentData.newsHeadlines.map((headline, index) => (
                      <li key={index}>
                        <a href={headline.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">
                          {headline.title}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 