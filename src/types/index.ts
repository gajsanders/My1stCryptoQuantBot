export interface CandleData {
  openTime: number;
  open: string;
  high: string;
  low: string;
  close: string;
  volume: string;
  closeTime: number;
  quoteVolume: string;
  trades: number;
  takerBuyBaseVolume: string;
  takerBuyQuoteVolume: string;
  ignore: string;
}

export interface TimeframeData {
  timeframe: '15m' | '1h' | '1d';
  candles: CandleData[];
  price: number;
  volume: number;
  indicators: {
    rsi: number;
    macd: number;
    ema: number;
    priceChange: number;
    volumeChange: number;
  };
}

export interface SentimentAnalysis {
  shortTermSentiment: {
    category: 'Positive' | 'Neutral' | 'Negative';
    score: number;
    rationale: string;
  };
  longTermSentiment: {
    category: 'Positive' | 'Neutral' | 'Negative';
    score: number;
    rationale: string;
  };
  newsHeadlines?: { title: string; url: string }[];
}

export interface TradingRecommendation {
  spotTrading: {
    action: 'buy' | 'sell' | 'hold';
    entryPrice?: number;
    stopLossLevel: number;
    takeProfitLevel: number;
    rationale: {
      primarySignals: string;
      laggingIndicators: string;
      sentimentAnalysis: string;
    };
  };
  leveragedTrading: {
    position: 'long' | 'short';
    recommendedLeverage: number;
    entryPrice?: number;
    stopLossLevel: number;
    takeProfitLevel: number;
    rationale: {
      primarySignals: string;
      laggingIndicators: string;
      sentimentAnalysis: string;
    };
  };
}

export interface AnalysisResult {
  symbol: string;
  technicalData: TimeframeData[];
  sentimentData: SentimentAnalysis;
  recommendations: TradingRecommendation;
  timestamp: number;
} 