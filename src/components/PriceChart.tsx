import React, { useState } from 'react';
import { createChart, ColorType, IChartApi, Time, CandlestickSeries, LineSeries } from 'lightweight-charts';
import { TimeframeData, CandleData } from '@/types';
import { RSI, MACD } from 'technicalindicators';

interface PriceChartProps {
  data: TimeframeData;
}

export const PriceChart: React.FC<PriceChartProps> = ({ data }) => {
  const chartContainerRef = React.useRef<HTMLDivElement>(null);
  const chartRef = React.useRef<IChartApi | null>(null);
  const [chartReady, setChartReady] = useState(false);

  React.useEffect(() => {
    console.log('useEffect running, data:', data);
    if (!chartContainerRef.current) {
      console.log('Chart container ref not available.');
      return;
    }

    console.log('Chart container ref available.', chartContainerRef.current);
    
    // Create chart
    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: '#1E1E1E' },
        textColor: '#D9D9D9',
      },
      grid: {
        vertLines: { color: '#2B2B2B' },
        horzLines: { color: '#2B2B2B' },
      },
      width: chartContainerRef.current.clientWidth,
      height: 500,
      watermark: {
        color: 'rgba(113, 115, 122, 0.4)',
        visible: true,
        text: 'Daily Price Chart',
      },
    } as any);

    if (!chart) {
      console.error('Failed to create valid chart instance.', chart);
      setChartReady(true);
      return;
    }

    console.log('Chart instance created.', chart);

    // Create candlestick series
    const candlestickSeries = chart.addSeries(CandlestickSeries, {
      upColor: '#26a69a',
      downColor: '#ef5350',
      borderVisible: false,
      wickUpColor: '#26a69a',
      wickDownColor: '#ef5350',
    });

    console.log('Candlestick series added.');

    // Create RSI series (using Line series)
    const rsiSeries = chart.addSeries(LineSeries, {
      color: '#2962FF',
      lineWidth: 2,
      // title: 'RSI', // Title is not a direct option for addSeries
      // priceScaleId: 'left', // Price scale ID might be set differently or not needed for overlay
    });

    console.log('RSI series added.');

    // Create MACD series (using Line series)
    const macdSeries = chart.addSeries(LineSeries, {
      color: '#FF6B6B',
      lineWidth: 2,
      // title: 'MACD', // Title is not a direct option for addSeries
      priceScaleId: 'right', // MACD should have its own price scale
    });

    console.log('MACD series added.');

    // Prepare data with time as Time type
    const candleData = data.candles.map((candle: CandleData) => ({
      time: (candle.openTime / 1000) as Time,
      open: parseFloat(candle.open),
      high: parseFloat(candle.high),
      low: parseFloat(candle.low),
      close: parseFloat(candle.close),
    }));

    console.log('Prepared candle data:', candleData);

    let rsiData: { time: Time; value: number }[] = [];
    let macdData: { time: Time; value: number }[] = [];

    if (data && data.candles && data.candles.length > 34) {
      console.log('Enough candle data for indicators.');
      const prices = data.candles.map((c: CandleData) => parseFloat(c.close));
      const times = data.candles.map((c: CandleData) => (c.openTime / 1000) as Time);

      if (prices.length >= 14) {
        const rsiValues = RSI.calculate({
          values: prices,
          period: 14,
        });
        rsiData = rsiValues.map((value, index) => ({
          time: times[prices.length - rsiValues.length + index],
          value: value || 0,
        })).filter(item => item.value !== undefined);
        console.log('Calculated RSI data:', rsiData);
      } else {
        console.warn('Not enough candle data to calculate RSI for chart.');
      }

      if (prices.length >= 34) {
        const macdValues = MACD.calculate({
          values: prices,
          fastPeriod: 12,
          slowPeriod: 26,
          signalPeriod: 9,
          SimpleMAOscillator: false,
          SimpleMASignal: false,
        });
        macdData = macdValues.map((value, index) => ({
          time: times[prices.length - macdValues.length + index],
          value: value.histogram || 0,
        })).filter(item => item.value !== undefined);
        console.log('Calculated MACD data:', macdData);
      } else {
        console.warn('Not enough candle data to calculate MACD for chart.');
      }
    } else {
      console.warn('Daily data not found or not enough candle data to calculate indicators for chart.');
    }

    console.log('Setting data to series...');
    candlestickSeries.setData(candleData);
    rsiSeries.setData(rsiData);
    macdSeries.setData(macdData);
    console.log('Data set to series.');

    const handleResize = () => {
      if (chartContainerRef.current && chart) {
        chart.applyOptions({
          width: chartContainerRef.current.clientWidth,
        });
      }
    };

    window.addEventListener('resize', handleResize);

    // Update chartRef.current *after* successful creation
    chartRef.current = chart;
    setChartReady(true);
    console.log('Chart ready set to true.');

    return () => {
      console.log('useEffect cleanup running.');
      window.removeEventListener('resize', handleResize);
      if (chart) {
        chart.remove();
        console.log('Chart instance removed.');
      }
      chartRef.current = null;
    };
  }, [data]);

  return (
    <div className="w-full bg-[#1E1E1E] rounded-lg p-4 shadow-lg">
      <div ref={chartContainerRef} className="w-full h-96" />
      {!chartReady && (
        <div className="absolute inset-0 flex items-center justify-center text-gray-500">Loading Chart...</div>
      )}
    </div>
  );
};
