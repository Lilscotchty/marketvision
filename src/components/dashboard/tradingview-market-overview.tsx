
"use client";

import React, { useEffect, useRef, memo } from 'react';

const TradingViewScreenerWidget = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const scriptAppendedRef = useRef(false);

  useEffect(() => {
    if (containerRef.current && !scriptAppendedRef.current) {
      const script = document.createElement('script');
      script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-screener.js';
      script.type = 'text/javascript';
      script.async = true;
      script.innerHTML = JSON.stringify({
        "width": "100%",
        "height": 550,
        "defaultScreen": "general",
        "market": "forex",
        "showToolbar": true,
        "colorTheme": "dark",
        "transparency": true,
        "locale": "en"
      });
      containerRef.current.appendChild(script);
      scriptAppendedRef.current = true;
    }
  }, []);

  return (
    <div className="tradingview-widget-container" ref={containerRef}>
      <div className="tradingview-widget-container__widget"></div>
      <div className="tradingview-widget-copyright text-center text-xs p-1">
        <a href="https://www.tradingview.com/" rel="noopener nofollow" target="_blank" className="text-blue-500 hover:text-blue-400">
          Track all markets on TradingView
        </a>
      </div>
    </div>
  );
};

export const TradingViewMarketOverview = memo(TradingViewScreenerWidget);
