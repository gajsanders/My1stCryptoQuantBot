import axios from 'axios';

interface NewsItem {
  id: string;
  title: string;
  body: string;
  url: string;
  source: string;
  published_on: number;
  categories: string;
  tags: string;
}

export class NewsService {
  private static instance: NewsService;
  private readonly CRYPTOCOMPARE_API_KEY: string;
  private readonly CACHE_DURATION = 15 * 60 * 1000; // 15 minutes
  private cache: { data: NewsItem[]; timestamp: number } | null = null;

  private constructor() {
    if (!process.env.NEXT_PUBLIC_CRYPTOCOMPARE_API_KEY) {
      throw new Error('CRYPTOCOMPARE_API_KEY environment variable is not set');
    }
    this.CRYPTOCOMPARE_API_KEY = process.env.NEXT_PUBLIC_CRYPTOCOMPARE_API_KEY;
  }

  public static getInstance(): NewsService {
    if (!NewsService.instance) {
      NewsService.instance = new NewsService();
    }
    return NewsService.instance;
  }

  public async getLatestNews(): Promise<string[]> {
    // Check cache first
    if (this.cache && Date.now() - this.cache.timestamp < this.CACHE_DURATION) {
      return this.cache.data.map(item => item.title);
    }

    try {
      const response = await axios.get('https://min-api.cryptocompare.com/data/v2/news/?lang=EN', {
        headers: {
          'authorization': `Apikey ${this.CRYPTOCOMPARE_API_KEY}`
        }
      });

      if (response.data.Response === 'Success') {
        const news = response.data.Data;
        this.cache = {
          data: news,
          timestamp: Date.now()
        };
        return news.map((item: NewsItem) => item.title);
      } else {
        throw new Error('Failed to fetch news');
      }
    } catch (error) {
      console.error('Error fetching news:', error);
      // Fallback to mock data if API fails
      return [
        'Bitcoin Surges Past $50,000 as Institutional Adoption Grows',
        'Ethereum 2.0 Upgrade Shows Promising Results',
        'Major Bank Announces Crypto Custody Services',
        'New DeFi Protocol Launches with $100M TVL',
        'Regulatory Clarity Expected for Crypto Markets'
      ];
    }
  }
} 