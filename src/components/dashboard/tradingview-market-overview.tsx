
"use client";

import React, { useEffect, useRef, memo } from 'react';
import { useTheme } from '@/contexts/theme-context';

const TradingViewMarketOverviewWidget = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const isWidgetCreated = useRef(false);
  const { theme } = useTheme();

  useEffect(() => {
    const script = document.createElement('script');
    
    if (!isWidgetCreated.current && containerRef.current) {
      script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-market-overview.js';
      script.type = 'text/javascript';
      script.async = true;
      script.innerHTML = JSON.stringify({
        "colorTheme": theme,
        "dateRange": "12M",
        "showChart": true,
        "locale": "en",
        "largeChartUrl": "",
        "isTransparent": true,
        "showSymbolLogo": true,
        "showFloatingTooltip": true,
        "width": "100%",
        "height": "660",
        "plotLineColorGrowing": "rgba(41, 98, 255, 1)",
        "plotLineColorFalling": "rgba(41, 98, 255, 1)",
        "gridLineColor": "rgba(240, 243, 250, 0)",
        "scaleFontColor": "rgba(120, 123, 134, 1)",
        "belowLineFillColorGrowing": "rgba(41, 98, 255, 0.12)",
        "belowLineFillColorFalling": "rgba(41, 98, 255, 0.12)",
        "belowLineFillColorGrowingBottom": "rgba(41, 98, 255, 0)",
        "belowLineFillColorFallingBottom": "rgba(41, 98, 255, 0)",
        "symbolActiveColor": "rgba(41, 98, 255, 0.12)",
        "tabs": [
          {
            "title": "Forex",
            "symbols": [
              { "s": "FX:EURUSD", "d": "EUR/USD" },
              { "s": "FX:GBPUSD", "d": "GBP/USD" },
              { "s": "FX:USDJPY", "d": "USD/JPY" },
              { "s": "FX:AUDUSD", "d": "AUD/USD" },
              { "s": "FX:USDCAD", "d": "USD/CAD" },
              { "s": "FX:USDCHF", "d": "USD/CHF" }
            ],
            "originalTitle": "Forex"
          },
          {
            "title": "Indices",
            "symbols": [
              { "s": "FOREXCOM:SPXUSD", "d": "S&P 500" },
              { "s": "FOREXCOM:NSXUSD", "d": "US 100" },
              { "s": "FOREXCOM:DJI", "d": "Dow 30" },
              { "s": "INDEX:UKX", "d": "UK 100" },
              { "s": "INDEX:DAX", "d": "DAX" },
              { "s": "FOREXCOM:JPN225", "d": "Nikkei 225" }
            ],
            "originalTitle": "Indices"
          },
          {
            "title": "Cryptocurrencies",
            "symbols": [
              { "s": "BITSTAMP:BTCUSD", "d": "Bitcoin" },
              { "s": "BITSTAMP:ETHUSD", "d": "Ethereum" },
              { "s": "BINANCE:SOLUSDT", "d": "Solana" },
              { "s": "BINANCE:XRPUSDT", "d": "Ripple" },
              { "s": "BINANCE:DOGEUSDT", "d": "Dogecoin" },
              { "s": "BINANCE:ADAUSDT", "d": "Cardano" }
            ],
            "originalTitle": "Cryptocurrencies"
          }
        ]
      });
      containerRef.current.appendChild(script);
      isWidgetCreated.current = true;
    }
    
    return () => {
      // Clean up the script when the component unmounts
      if (containerRef.current && containerRef.current.contains(script)) {
        containerRef.current.removeChild(script);
        isWidgetCreated.current = false;
      }
    };
  }, [theme]);

  return (
    <div className="tradingview-widget-container" ref={containerRef}>
      <div className="tradingview-widget-container__widget"></div>
    </div>
  );
};

export const TradingViewMarketOverview = memo(TradingViewMarketOverviewWidget);
