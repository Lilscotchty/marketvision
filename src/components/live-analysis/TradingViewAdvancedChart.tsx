
"use client";

import React, { useEffect, useRef, memo } from 'react';
import { useTheme } from '@/contexts/theme-context';

function TradingViewWidget() {
  const container = useRef<HTMLDivElement>(null);
  const isScriptAppended = useRef(false);
  const { theme } = useTheme();

  useEffect(() => {
    const script = document.createElement("script");

    if (container.current && !isScriptAppended.current) {
      script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
      script.type = "text/javascript";
      script.async = true;
      script.innerHTML = JSON.stringify({
        "allow_symbol_change": true,
        "calendar": false,
        "details": true,
        "hide_side_toolbar": false,
        "hide_top_toolbar": false,
        "hide_legend": false,
        "hide_volume": false,
        "hotlist": true,
        "interval": "D",
        "locale": "en",
        "save_image": true,
        "style": "1",
        "symbol": "NASDAQ:AAPL",
        "theme": theme,
        "timezone": "Etc/UTC",
        "backgroundColor": "rgba(1, 3, 21, 0)",
        "gridColor": "rgba(242, 242, 242, 0.06)",
        "watchlist": [],
        "withdateranges": true,
        "compareSymbols": [],
        "show_popup_button": true,
        "popup_height": "650",
        "popup_width": "1000",
        "studies": [],
        "autosize": true
      });
      container.current.appendChild(script);
      isScriptAppended.current = true;
    }
    
    return () => {
      // Clean up the script when the component unmounts
      if (container.current && container.current.contains(script)) {
        container.current.removeChild(script);
        isScriptAppended.current = false;
      }
    };
  }, [theme]);

  return (
    <div className="tradingview-widget-container h-full w-full" ref={container}>
      <div className="tradingview-widget-container__widget h-full w-full"></div>
    </div>
  );
}

export default memo(TradingViewWidget);
