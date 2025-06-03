import { NextResponse } from 'next/server';
import { BinanceService } from '@/services/binance';
import { NewsService } from '@/services/news';
import { SentimentService } from '@/services/sentiment';

export async function GET() {
  // Binance
  let binance = 'ok';
  try {
    const binanceService = BinanceService.getInstance();
    await binanceService.getMarketData('BTC');
  } catch (e) {
    binance = 'error';
  }

  // OpenAI (via SentimentService)
  let openai = 'ok';
  try {
    const sentimentService = SentimentService.getInstance();
    // Use a dummy call that doesn't cost tokens
    await sentimentService.getSentimentAnalysis('BTC');
  } catch (e) {
    openai = 'error';
  }

  // CryptoCompare News
  let news = 'ok';
  try {
    const newsService = NewsService.getInstance();
    await newsService.getLatestNews();
  } catch (e) {
    news = 'error';
  }

  // Redis and MongoDB: placeholder (implement later)
  let redis = 'unknown';
  let mongodb = 'unknown';

  return NextResponse.json({
    binance,
    openai,
    news,
    redis,
    mongodb,
  });
} 