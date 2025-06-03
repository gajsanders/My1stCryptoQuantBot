import { NextRequest, NextResponse } from 'next/server';
import { BinanceService } from '@/services/binance';
import { SentimentService } from '@/services/sentiment';
import { AnalysisService } from '@/services/analysis';
import { z } from 'zod';
import { SentimentAnalysis } from '@/types';

const requestSchema = z.object({
  symbol: z.string().length(3).toUpperCase(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { symbol } = requestSchema.parse(body);

    console.log('API received symbol:', symbol);

    // Initialize services
    const binanceService = BinanceService.getInstance();
    const sentimentService = SentimentService.getInstance();
    const analysisService = AnalysisService.getInstance();

    // Fetch technical data (essential)
    const technicalData = await binanceService.getMarketData(symbol);

    // Attempt to fetch sentiment data with fallback
    let sentimentData: SentimentAnalysis;
    const defaultSentiment: SentimentAnalysis = {
      shortTermSentiment: {
        category: 'Neutral',
        score: 0.5,
        rationale: 'Sentiment analysis unavailable.',
      },
      longTermSentiment: {
        category: 'Neutral',
        score: 0.5,
        rationale: 'Sentiment analysis unavailable.',
      },
    };

    try {
      sentimentData = await sentimentService.getSentimentAnalysis(symbol);
      console.log('Successfully fetched sentiment data.');
      console.log('Sentiment data received:', sentimentData);
    } catch (sentimentError) {
      console.error(`Error fetching sentiment data for ${symbol}:`, sentimentError);
      sentimentData = defaultSentiment;
      console.warn('Using default neutral sentiment due to error.');
    }

    // Generate analysis using fetched or default sentiment data
    const analysis = await analysisService.getAnalysis(
      symbol,
      technicalData,
      sentimentData
    );

    return NextResponse.json(analysis);
  } catch (error) {
    console.error('Error processing analysis request:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request format' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 