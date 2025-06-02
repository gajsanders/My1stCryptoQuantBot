# Crypto Analysis Bot

A modern web application that provides real-time cryptocurrency analysis, combining technical indicators, market sentiment, and AI-powered trading recommendations.

## Features

- **Real-time Technical Analysis**: View detailed price charts and technical indicators for any cryptocurrency pair
- **Market Sentiment Analysis**: Get both short-term and long-term market sentiment analysis
- **Trading Recommendations**: Receive AI-powered trading suggestions based on technical and sentiment data
- **Interactive UI**: Modern, responsive interface built with Next.js and Tailwind CSS
- **Real-time Data**: Integration with Binance API for live market data

## Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS
- **Charts**: Chart.js, Lightweight Charts
- **Data Analysis**: Technical Indicators Library
- **AI Integration**: OpenAI API
- **Database**: MongoDB (Mongoose)
- **Caching**: Redis
- **Testing**: Jest, React Testing Library

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- MongoDB instance
- Redis server
- OpenAI API key
- Binance API credentials

### Installation

1. Clone the repository:
   ```bash
   git clone [your-repo-url]
   cd crypto-analysis-bot
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Create a `.env.local` file in the root directory with the following variables:
   ```
   MONGODB_URI=your_mongodb_uri
   REDIS_URL=your_redis_url
   OPENAI_API_KEY=your_openai_api_key
   BINANCE_API_KEY=your_binance_api_key
   BINANCE_API_SECRET=your_binance_api_secret
   ```

4. Start the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm test` - Run tests

## Project Structure

```
src/
├── app/              # Next.js app directory
├── components/       # React components
├── services/        # Business logic and API services
├── types/           # TypeScript type definitions
└── utils/           # Utility functions
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [Binance API](https://binance-docs.github.io/apidocs/)
- [OpenAI API](https://openai.com/api/)
- [Technical Indicators Library](https://github.com/anandanand84/technicalindicators)
