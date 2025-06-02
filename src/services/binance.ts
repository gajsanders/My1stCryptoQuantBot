import axios from 'axios';
import { CandleData, TimeframeData } from '@/types';

const BINANCE_API_BASE_URL = 'https://api.binance.com/api/v3';

export class BinanceService {
  private static instance: BinanceService;
  private cache: Map<string, { data: TimeframeData; timestamp: number }> = new Map();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

  private constructor() {}

  public static getInstance(): BinanceService {
    if (!BinanceService.instance) {
      BinanceService.instance = new BinanceService();
    }
    return BinanceService.instance;
  }

  private getCacheKey(symbol: string, interval: string): string {
    return `${symbol}-${interval}`;
  }

  private isCacheValid(timestamp: number): boolean {
    return Date.now() - timestamp < this.CACHE_DURATION;
  }

  private async fetchCandleData(symbol: string, interval: string): Promise<TimeframeData> {
    try {
      const response = await axios.get(`${BINANCE_API_BASE_URL}/klines`, {
        params: {
          symbol: `${symbol}USDT`,
          interval,
          limit: 200,
        },
      });

      const candles: CandleData[] = response.data.map((candle: any[]) => ({
        openTime: candle[0],
        open: candle[1],
        high: candle[2],
        low: candle[3],
        close: candle[4],
        volume: candle[5],
        closeTime: candle[6],
        quoteVolume: candle[7],
        trades: candle[8],
        takerBuyBaseVolume: candle[9],
        takerBuyQuoteVolume: candle[10],
        ignore: candle[11],
      }));

      return {
        timeframe: interval as '15m' | '1h' | '1d',
        candles,
      };
    } catch (error) {
      console.error(`Error fetching ${interval} candle data for ${symbol}:`, error);
      throw new Error(`Failed to fetch ${interval} candle data for ${symbol}`);
    }
  }

  public async getMarketData(symbol: string): Promise<TimeframeData[]> {
    const intervals: ('15m' | '1h' | '1d')[] = ['15m', '1h', '1d'];
    const results: TimeframeData[] = [];

    for (const interval of intervals) {
      const cacheKey = this.getCacheKey(symbol, interval);
      const cachedData = this.cache.get(cacheKey);

      if (cachedData && this.isCacheValid(cachedData.timestamp)) {
        results.push(cachedData.data);
      } else {
        const data = await this.fetchCandleData(symbol, interval);
        this.cache.set(cacheKey, { data, timestamp: Date.now() });
        results.push(data);
      }
    }

    return results;
  }

  public async getTechnicalData(symbol: string): Promise<TimeframeData[]> {
    const timeframes: ('15m' | '1h' | '1d')[] = ['15m', '1h', '1d'];
    const results: TimeframeData[] = [];

    for (const timeframe of timeframes) {
      const candles = await this.getCandles(symbol, timeframe);
      const lastCandle = candles[candles.length - 1];
      
      results.push({
        timeframe,
        candles,
        price: parseFloat(lastCandle.close),
        volume: parseFloat(lastCandle.volume),
        indicators: {
          rsi: 0, // Will be calculated by AnalysisService
          macd: 0, // Will be calculated by AnalysisService
          ema: 0, // Will be calculated by AnalysisService
          priceChange: 0, // Will be calculated by AnalysisService
          volumeChange: 0 // Will be calculated by AnalysisService
        }
      });
    }

    return results;
  }

  private async getCandles(symbol: string, interval: string): Promise<CandleData[]> {
    try {
      const response = await fetch(
        `${BINANCE_API_BASE_URL}/klines?symbol=${symbol}&interval=${interval}&limit=100`
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch candles: ${response.statusText}`);
      }

      const data = await response.json();
      return data.map((candle: any[]) => ({
        openTime: candle[0],
        open: candle[1],
        high: candle[2],
        low: candle[3],
        close: candle[4],
        volume: candle[5],
        closeTime: candle[6],
        quoteVolume: candle[7],
        trades: candle[8],
        takerBuyBaseVolume: candle[9],
        takerBuyQuoteVolume: candle[10],
        ignore: candle[11]
      }));
    } catch (error) {
      console.error('Error fetching candles:', error);
      throw new Error('Failed to fetch candle data from Binance');
    }
  }
} 