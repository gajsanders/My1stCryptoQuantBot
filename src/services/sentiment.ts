import { OpenAI } from 'openai';
import { SentimentAnalysis } from '@/types';
import { NewsService } from './news';

// Define a type that matches the structure returned by the LM Studio model
interface LmStudioSentimentResponse {
  newsHeadlines: {
    headline: string;
    shortTermSentiment: SentimentAnalysis['shortTermSentiment'];
    longTermSentiment: SentimentAnalysis['longTermSentiment'];
  }[];
  // The model might also include overall sentiment directly, or other fields.
  // We will focus on extracting from newsHeadlines for now based on the last output.
}

export class SentimentService {
  private static instance: SentimentService;
  private openai: OpenAI;
  private newsService: NewsService;
  private cache: Map<string, { data: SentimentAnalysis; timestamp: number }> = new Map();
  private readonly CACHE_DURATION = 15 * 60 * 1000; // 15 minutes in milliseconds

  private constructor() {
    this.openai = new OpenAI({
      baseURL: 'http://localhost:1234/v1',
      apiKey: 'not-needed',
      dangerouslyAllowBrowser: true, // Allow client-side usage
    });
    this.newsService = NewsService.getInstance();
  }

  public static getInstance(): SentimentService {
    if (!SentimentService.instance) {
      SentimentService.instance = new SentimentService();
    }
    return SentimentService.instance;
  }

  public async getSentimentAnalysis(symbol: string): Promise<SentimentAnalysis> {
    const cacheKey = `${symbol}-sentiment`;
    const cached = this.cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data;
    }

    try {
      const headlines = await this.newsService.getLatestNews();
      const sentiment = await this.analyzeSentiment(headlines);
      
      this.cache.set(cacheKey, {
        data: sentiment,
        timestamp: Date.now()
      });
      
      return sentiment;
    } catch (error) {
      console.error('Error analyzing sentiment:', error);
      throw new Error('Failed to analyze sentiment');
    }
  }

  private async analyzeSentiment(headlines: string[]): Promise<SentimentAnalysis> {
    const prompt = `Analyze these cryptocurrency news headlines and provide sentiment analysis in JSON format:\n${headlines.join('\n')}\n\nReturn ONLY a JSON object in this format:\n{\n  \"shortTermSentiment\": {\n    \"category\": \"Positive|Negative|Neutral\",\n    \"score\": number,\n    \"rationale\": \"string\"\n  },\n  \"longTermSentiment\": {\n    \"category\": \"Positive|Negative|Neutral\",\n    \"score\": number,\n    \"rationale\": \"string\"\n  }
}`;

    try {
      const completion = await this.openai.chat.completions.create({
        model: "meta-llama-3.1-8b-instruct",
        messages: [
          {
            role: "system",
            content: "You are a cryptocurrency sentiment analyst. Provide ONLY the JSON response, no additional text or markdown."
          },
          {
            role: "user",
            content: prompt
          }
        ]
      });

      const rawContent = completion.choices[0].message.content || '{}';
      console.log('Raw sentiment response:', rawContent);

      // Try to find JSON content between curly braces
      const jsonMatch = rawContent.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON object found in response');
      }

      const jsonString = jsonMatch[0];
      try {
        return JSON.parse(jsonString) as SentimentAnalysis;
      } catch (parseError) {
        console.error('Error parsing sentiment JSON:', parseError);
        console.error('Attempted to parse:', jsonString);
        throw new Error('Failed to parse sentiment analysis response');
      }
    } catch (error) {
      console.error('Error analyzing sentiment:', error);
      throw new Error('Failed to analyze sentiment');
    }
  }
}