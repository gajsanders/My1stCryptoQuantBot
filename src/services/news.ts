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
  private cacheBySymbol: Map<string, { data: NewsItem[]; timestamp: number }> = new Map();

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

  public async getLatestNews(categories?: string): Promise<{ title: string; url: string }[]> {
    const cacheKey = categories ? `news-${categories}` : 'news-general';
    
    // Determine which cache to use and the specific cached data
    let cachedData: { data: NewsItem[]; timestamp: number } | undefined | null;
    if (categories) {
      cachedData = this.cacheBySymbol.get(cacheKey);
    } else {
      cachedData = this.cache;
    }

    // Check cache first
    if (cachedData && Date.now() - cachedData.timestamp < this.CACHE_DURATION) {
      // Ensure items are of type NewsItem before mapping
      return cachedData.data.map((item: NewsItem) => ({ title: item.title, url: item.url }));
    }

    try {
      const response = await axios.get('https://min-api.cryptocompare.com/data/v2/news/', {
        params: {
          lang: 'EN',
          categories: categories || undefined,
        },
        headers: {
          'authorization': `Apikey ${this.CRYPTOCOMPARE_API_KEY}`
        }
      });

      console.log('Raw CryptoCompare API response:', response.data);

      // Check for success based on the 'Message' field and presence of data
      if (response.data.Message === 'News list successfully returned' && response.data.Data && response.data.Data.length > 0) {
        console.log('CryptoCompare API response successful, processing data...');
        const news: NewsItem[] = response.data.Data; // Explicitly type news
        const dataToCache = { data: news, timestamp: Date.now() };
        if (categories) {
          this.cacheBySymbol.set(cacheKey, dataToCache);
        } else {
          this.cache = dataToCache;
        }
        return news.map((item: NewsItem) => ({ title: item.title, url: item.url }));
      } else if (response.data.Message === 'News list successfully returned' && (!response.data.Data || response.data.Data.length === 0)) {
        // API call was successful but no news found for the category
        console.log(`No news found for category: ${categories}`);
        return []; // Return empty array if no news data
      } else {
        // Log the error response if the Message is not the success message
        console.error('CryptoCompare API error response:', response.data);
        console.error('CryptoCompare API Message field:', response.data.Message);
        throw new Error(response.data.Message || 'Failed to fetch news - API response indicates error');
      }
    } catch (error) {
      console.error('Error fetching or processing news:', error);
      // Fallback to mock data if API fails or processing fails
      return [
        { title: 'Bitcoin Surges Past $50,000 as Institutional Adoption Grows', url: 'https://example.com/bitcoin-surge' },
        { title: 'Ethereum 2.0 Upgrade Shows Promising Results', url: 'https://example.com/ethereum-upgrade' },
        { title: 'Major Bank Announces Crypto Custody Services', url: 'https://example.com/crypto-custody' },
        { title: 'New DeFi Protocol Launches with $100M TVL', url: 'https://example.com/defi-launch' },
        { title: 'Regulatory Clarity Expected for Crypto Markets', url: 'https://example.com/regulatory-clarity' }
      ];
    }
  }
} 