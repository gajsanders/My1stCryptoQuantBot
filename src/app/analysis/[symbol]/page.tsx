'use client';

import { useEffect, useState } from 'react';
import { AnalysisResult } from '@/types';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default function AnalysisPage({
  params,
}: {
  params: { symbol: string };
}) {
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAnalysis = async () => {
      try {
        const response = await fetch('/api/analyze', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ symbol: params.symbol }),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Failed to fetch analysis');
        }

        const data = await response.json();
        setAnalysis(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalysis();
  }, [params.symbol]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-500 text-center">
          <h2 className="text-2xl font-bold mb-2">Error</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!analysis) {
    return null;
  }

  const dailyData = analysis.technicalData.find(
    (data) => data.timeframe === '1d'
  );

  const chartData = {
    labels: dailyData?.candles.map((candle) =>
      new Date(candle.openTime).toLocaleDateString()
    ) || [],
    datasets: [
      {
        label: `${params.symbol} Price`,
        data: dailyData?.candles.map((candle) => parseFloat(candle.close)) || [],
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1,
      },
    ],
  };

  return (
    <main className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            {params.symbol} Analysis
          </h1>
          <p className="text-gray-600">
            Last updated:{' '}
            {new Date(analysis.timestamp).toLocaleString()}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-semibold mb-4">Price Chart</h2>
          <div className="h-96">
            <Line
              data={chartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'top' as const,
                  },
                },
              }}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-4">Spot Trading</h2>
            <div className="space-y-4">
              <div>
                <span className="font-medium">Action:</span>{' '}
                <span
                  className={`font-bold ${
                    analysis.recommendations.spotTrading.action === 'buy'
                      ? 'text-green-600'
                      : analysis.recommendations.spotTrading.action === 'sell'
                      ? 'text-red-600'
                      : 'text-yellow-600'
                  }`}
                >
                  {analysis.recommendations.spotTrading.action.toUpperCase()}
                </span>
              </div>
              <div>
                <span className="font-medium">Entry Price:</span>{' '}
                {analysis.recommendations.spotTrading.entryPrice}
              </div>
              <div>
                <span className="font-medium">Stop Loss:</span>{' '}
                {analysis.recommendations.spotTrading.stopLossLevel}
              </div>
              <div>
                <span className="font-medium">Take Profit:</span>{' '}
                {analysis.recommendations.spotTrading.takeProfitLevel}
              </div>
              <div className="mt-4">
                <h3 className="font-medium mb-2">Rationale:</h3>
                <ul className="list-disc list-inside space-y-2">
                  <li>
                    <span className="font-medium">Primary Signals:</span>{' '}
                    {analysis.recommendations.spotTrading.rationale.primarySignals}
                  </li>
                  <li>
                    <span className="font-medium">Lagging Indicators:</span>{' '}
                    {analysis.recommendations.spotTrading.rationale.laggingIndicators}
                  </li>
                  <li>
                    <span className="font-medium">Sentiment Analysis:</span>{' '}
                    {analysis.recommendations.spotTrading.rationale.sentimentAnalysis}
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-4">Leveraged Trading</h2>
            <div className="space-y-4">
              <div>
                <span className="font-medium">Position:</span>{' '}
                <span
                  className={`font-bold ${
                    analysis.recommendations.leveragedTrading.position === 'long'
                      ? 'text-green-600'
                      : 'text-red-600'
                  }`}
                >
                  {analysis.recommendations.leveragedTrading.position.toUpperCase()}
                </span>
              </div>
              <div>
                <span className="font-medium">Recommended Leverage:</span>{' '}
                {analysis.recommendations.leveragedTrading.recommendedLeverage}x
              </div>
              <div>
                <span className="font-medium">Entry Price:</span>{' '}
                {analysis.recommendations.leveragedTrading.entryPrice}
              </div>
              <div>
                <span className="font-medium">Stop Loss:</span>{' '}
                {analysis.recommendations.leveragedTrading.stopLossLevel}
              </div>
              <div>
                <span className="font-medium">Take Profit:</span>{' '}
                {analysis.recommendations.leveragedTrading.takeProfitLevel}
              </div>
              <div className="mt-4">
                <h3 className="font-medium mb-2">Rationale:</h3>
                <ul className="list-disc list-inside space-y-2">
                  <li>
                    <span className="font-medium">Primary Signals:</span>{' '}
                    {analysis.recommendations.leveragedTrading.rationale.primarySignals}
                  </li>
                  <li>
                    <span className="font-medium">Lagging Indicators:</span>{' '}
                    {analysis.recommendations.leveragedTrading.rationale.laggingIndicators}
                  </li>
                  <li>
                    <span className="font-medium">Sentiment Analysis:</span>{' '}
                    {analysis.recommendations.leveragedTrading.rationale.sentimentAnalysis}
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-semibold mb-4">Market Sentiment</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium mb-2">Short-term Sentiment</h3>
              <div className="space-y-2">
                <div>
                  <span className="font-medium">Category:</span>{' '}
                  {analysis.sentimentData.shortTermSentiment.category}
                </div>
                <div>
                  <span className="font-medium">Score:</span>{' '}
                  {analysis.sentimentData.shortTermSentiment.score}
                </div>
                <div>
                  <span className="font-medium">Rationale:</span>{' '}
                  {analysis.sentimentData.shortTermSentiment.rationale}
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-medium mb-2">Long-term Sentiment</h3>
              <div className="space-y-2">
                <div>
                  <span className="font-medium">Category:</span>{' '}
                  {analysis.sentimentData.longTermSentiment.category}
                </div>
                <div>
                  <span className="font-medium">Score:</span>{' '}
                  {analysis.sentimentData.longTermSentiment.score}
                </div>
                <div>
                  <span className="font-medium">Rationale:</span>{' '}
                  {analysis.sentimentData.longTermSentiment.rationale}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
} 