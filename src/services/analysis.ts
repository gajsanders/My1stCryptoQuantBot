import OpenAI from 'openai';
import { AnalysisResult, TimeframeData, SentimentAnalysis, TradingRecommendation } from '@/types';
import { RSI, MACD, EMA } from 'technicalindicators';

export class AnalysisService {
  private static instance: AnalysisService;
  private openai: OpenAI;
  private cache: Map<string, { data: AnalysisResult; timestamp: number }> = new Map();
  private readonly CACHE_DURATION = 15 * 60 * 1000; // 15 minutes in milliseconds

  private constructor() {
    if (!process.env.OPENAI_API_KEY) {
      // For LM Studio, API key is not strictly necessary but the OpenAI client expects one.
      // We can use a dummy key or remove this check if we refactor the client initialization.
      // For now, we'll keep the check but the key itself won't be used by LM Studio's API.
      console.warn('OPENAI_API_KEY environment variable is not set. Using LM Studio local server for analysis.');
    }
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY || 'YOUR_DUMMY_KEY', // Use dummy key if not set
      baseURL: 'http://192.168.2.3:1234/v1', // Point to LM Studio local server
      dangerouslyAllowBrowser: true, // Allow client-side usage
    });
  }

  public static getInstance(): AnalysisService {
    if (!AnalysisService.instance) {
      AnalysisService.instance = new AnalysisService();
    }
    return AnalysisService.instance;
  }

  private getCacheKey(symbol: string): string {
    return `analysis-${symbol}`;
  }

  private isCacheValid(timestamp: number): boolean {
    return Date.now() - timestamp < this.CACHE_DURATION;
  }

  private async generateAnalysis(
    symbol: string,
    technicalData: TimeframeData[],
    sentimentData: SentimentAnalysis
  ): Promise<TradingRecommendation> {
    // Calculate technical indicators from candle data
    const limitedTechnicalData = technicalData.slice(-5).map(data => {
      const prices = data.candles.map(c => parseFloat(c.close));
      const volumes = data.candles.map(c => parseFloat(c.volume));
      
      // Calculate RSI (14-period)
      const rsi = RSI.calculate({
        values: prices,
        period: 14
      });
      
      // Calculate MACD
      const macd = MACD.calculate({
        values: prices,
        fastPeriod: 12,
        slowPeriod: 26,
        signalPeriod: 9,
        SimpleMAOscillator: false,
        SimpleMASignal: false
      });
      
      // Calculate EMA (20-period)
      const ema = EMA.calculate({
        values: prices,
        period: 20
      });
      
      // Get the last values
      const lastRSI = rsi[rsi.length - 1] || 50;
      const lastMACD = macd[macd.length - 1] || { MACD: 0, signal: 0, histogram: 0 };
      const lastEMA = ema[ema.length - 1] || prices[prices.length - 1];
      
      // Calculate price and volume changes
      const lastPrice = prices[prices.length - 1];
      const prevPrice = prices[prices.length - 2];
      const priceChange = lastPrice - prevPrice;
      const priceChangePercent = (priceChange / prevPrice) * 100;
      
      const lastVolume = volumes[volumes.length - 1];
      const prevVolume = volumes[volumes.length - 2];
      const volumeChange = lastVolume - prevVolume;
      const volumeChangePercent = (volumeChange / prevVolume) * 100;
      
      return {
        timeframe: data.timeframe,
        price: lastPrice,
        volume: lastVolume,
        indicators: {
          rsi: lastRSI,
          macd: lastMACD.histogram,
          ema: lastEMA,
          priceChange: priceChangePercent,
          volumeChange: volumeChangePercent
        }
      };
    });

    // Enhanced prompt with more technical details
    const prompt = `Analyze ${symbol} market data and provide trading recommendations in JSON format:
Technical Data: ${JSON.stringify(limitedTechnicalData)}
Sentiment: ${JSON.stringify(sentimentData)}

Consider the following technical aspects:
- RSI above 70 indicates overbought, below 30 indicates oversold
- MACD histogram crossing above 0 suggests bullish momentum, below 0 suggests bearish
- Price above EMA suggests uptrend, below suggests downtrend
- Volume changes can confirm trend strength
- Price changes show short-term momentum

Return ONLY a JSON object in this format:
{
  "spotTrading": {
    "action": "buy|sell|hold",
    "entryPrice": number,
    "stopLossLevel": number,
    "takeProfitLevel": number,
    "rationale": {
      "primarySignals": "string",
      "laggingIndicators": "string",
      "sentimentAnalysis": "string"
    }
  },
  "leveragedTrading": {
    "position": "long|short",
    "recommendedLeverage": number,
    "entryPrice": number,
    "stopLossLevel": number,
    "takeProfitLevel": number,
    "rationale": {
      "primarySignals": "string",
      "laggingIndicators": "string",
      "sentimentAnalysis": "string"
    }
  }
}`;

    try {
      const completion = await this.openai.chat.completions.create({
        model: "meta-llama-3.1-8b-instruct",
        messages: [
          {
            role: "system",
            content: "You are a professional cryptocurrency trading analyst. Provide ONLY the JSON response, no additional text."
          },
          {
            role: "user",
            content: prompt
          }
        ]
      });

      const rawContent = completion.choices[0].message.content || '{}';
      console.log('Raw analysis response content from LM Studio:', rawContent); // Log raw content

      // Refined logic to extract JSON string from markdown code block using correct markers
      const jsonBlockStart = '\n```json\n'; // Assuming it uses json marker here
      const jsonBlockEnd = '\n```\n';
      let jsonString = '';

      const startIndex = rawContent.indexOf(jsonBlockStart);
      if (startIndex !== -1) {
        const endIndex = rawContent.indexOf(jsonBlockEnd, startIndex + jsonBlockStart.length);
        if (endIndex !== -1) {
          jsonString = rawContent.substring(startIndex + jsonBlockStart.length, endIndex);
        } else {
           console.warn('Found start of JSON block but not expected end marker (\\n```\\n) in LM Studio analysis response. Attempting to parse content after start.');
           jsonString = rawContent.substring(startIndex + jsonBlockStart.length);
        }
      } else if (rawContent.trim().startsWith('```json') && rawContent.trim().endsWith('```')) {
         // Handle cases where there might not be newlines around the JSON block
         jsonString = rawContent.trim().substring('```json'.length, rawContent.trim().length - '```'.length);
      } else if (rawContent.trim().startsWith('```') && rawContent.trim().endsWith('```')) {
          // Handle cases with generic ``` markers as a fallback
          jsonString = rawContent.trim().substring('```'.length, rawContent.trim().length - '```'.length);
      } else {
         console.warn('Could not find expected JSON markdown block format in LM Studio analysis response. Attempting to parse full response.');
         jsonString = rawContent;
      }

      let recommendations: TradingRecommendation;
      try {
        recommendations = JSON.parse(jsonString.trim()) as TradingRecommendation;
      } catch (parseError) {
        console.error('Error parsing analysis response from LM Studio:', parseError);
        console.error('Attempted to parse JSON string for analysis:', jsonString); // Log the string we tried to parse
        throw new Error('Failed to parse trading analysis response from local model');
      }

      return recommendations;
    } catch (error) {
      console.error('Error generating analysis:', error);
      throw new Error('Failed to generate trading analysis');
    }
  }

  public async getAnalysis(
    symbol: string,
    technicalData: TimeframeData[],
    sentimentData: SentimentAnalysis
  ): Promise<AnalysisResult> {
    const cacheKey = this.getCacheKey(symbol);
    const cachedData = this.cache.get(cacheKey);

    if (cachedData && this.isCacheValid(cachedData.timestamp)) {
      return cachedData.data;
    }

    const recommendations = await this.generateAnalysis(symbol, technicalData, sentimentData);
    
    const result: AnalysisResult = {
      symbol,
      technicalData,
      sentimentData,
      recommendations,
      timestamp: Date.now(),
    };

    this.cache.set(cacheKey, { data: result, timestamp: Date.now() });
    return result;
  }
} 