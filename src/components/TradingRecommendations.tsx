import React from 'react';
import { TradingRecommendation } from '@/types';

interface TradingRecommendationsProps {
  recommendations: TradingRecommendation;
}

export const TradingRecommendations: React.FC<TradingRecommendationsProps> = ({ recommendations }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Spot Trading */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Spot Trading</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Action</span>
            <span className={`font-medium ${
              recommendations.spotTrading.action === 'buy' ? 'text-green-600' :
              recommendations.spotTrading.action === 'sell' ? 'text-red-600' :
              'text-yellow-600'
            }`}>
              {recommendations.spotTrading.action.toUpperCase()}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Entry Price</span>
            <span className="font-medium">
              {recommendations.spotTrading.entryPrice != null
                ? `$${recommendations.spotTrading.entryPrice.toFixed(2)}`
                : 'N/A'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Stop Loss</span>
            <span className="font-medium text-red-600">
              {recommendations.spotTrading.stopLossLevel != null
                ? `$${recommendations.spotTrading.stopLossLevel.toFixed(2)}`
                : 'N/A'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Take Profit</span>
            <span className="font-medium text-green-600">
              {recommendations.spotTrading.takeProfitLevel != null
                ? `$${recommendations.spotTrading.takeProfitLevel.toFixed(2)}`
                : 'N/A'}
            </span>
          </div>
          <div className="mt-4">
            <h4 className="text-sm font-medium text-gray-900 mb-2">Rationale</h4>
            <div className="space-y-2 text-sm text-gray-600">
              <p><span className="font-medium">Primary Signals:</span> {recommendations.spotTrading.rationale.primarySignals}</p>
              <p><span className="font-medium">Lagging Indicators:</span> {recommendations.spotTrading.rationale.laggingIndicators}</p>
              <p><span className="font-medium">Sentiment:</span> {recommendations.spotTrading.rationale.sentimentAnalysis}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Leveraged Trading */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Leveraged Trading</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Position</span>
            <span className={`font-medium ${
              recommendations.leveragedTrading.position === 'long' ? 'text-green-600' : 'text-red-600'
            }`}>
              {recommendations.leveragedTrading.position != null ? recommendations.leveragedTrading.position.toUpperCase() : 'N/A'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Leverage</span>
            <span className="font-medium">{recommendations.leveragedTrading.recommendedLeverage}x</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Entry Price</span>
            <span className="font-medium">
              {recommendations.leveragedTrading.entryPrice != null
                ? `$${recommendations.leveragedTrading.entryPrice.toFixed(2)}`
                : 'N/A'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Stop Loss</span>
            <span className="font-medium text-red-600">
              {recommendations.leveragedTrading.stopLossLevel != null
                ? `$${recommendations.leveragedTrading.stopLossLevel.toFixed(2)}`
                : 'N/A'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Take Profit</span>
            <span className="font-medium text-green-600">
              {recommendations.leveragedTrading.takeProfitLevel != null
                ? `$${recommendations.leveragedTrading.takeProfitLevel.toFixed(2)}`
                : 'N/A'}
            </span>
          </div>
          <div className="mt-4">
            <h4 className="text-sm font-medium text-gray-900 mb-2">Rationale</h4>
            <div className="space-y-2 text-sm text-gray-600">
              <p><span className="font-medium">Primary Signals:</span> {recommendations.leveragedTrading.rationale.primarySignals}</p>
              <p><span className="font-medium">Lagging Indicators:</span> {recommendations.leveragedTrading.rationale.laggingIndicators}</p>
              <p><span className="font-medium">Sentiment:</span> {recommendations.leveragedTrading.rationale.sentimentAnalysis}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 