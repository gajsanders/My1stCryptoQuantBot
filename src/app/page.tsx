'use client';

import { useState } from 'react';
import { AnalysisResult } from '@/types';
import { AnalysisService } from '@/services/analysis';
import { BinanceService } from '@/services/binance';
import { SentimentService } from '@/services/sentiment';
import { PriceChart } from '@/components/PriceChart';
import { TradingRecommendations } from '@/components/TradingRecommendations';

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
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-8 text-center">
          Crypto Analysis Bot
        </h1>
        
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
            <input
              type="text"
              value={symbol}
              onChange={(e) => setSymbol(e.target.value.toUpperCase())}
              placeholder="Enter symbol (e.g., BTCUSDT)"
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            />
            <button
              onClick={handleAnalyze}
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Analyzing...' : 'Analyze'}
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-8">
            {error}
          </div>
        )}

        {analysis && (
          <div className="space-y-8">
            {(() => {
              const dailyData = analysis.technicalData.find(data => data.timeframe === '1d');
              if (!dailyData) return null;
              
              return (
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                    Technical Analysis
                  </h2>
                  <PriceChart data={dailyData} />
                </div>
              );
            })()}

            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Trading Recommendations
              </h2>
              <TradingRecommendations recommendations={analysis.recommendations} />
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Market Sentiment
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Short Term
                  </h3>
                  <p className="text-gray-600">
                    {analysis.sentimentData.shortTermSentiment.rationale}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Long Term
                  </h3>
                  <p className="text-gray-600">
                    {analysis.sentimentData.longTermSentiment.rationale}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 